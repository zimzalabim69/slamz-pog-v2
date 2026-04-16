import { useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { playImpactSound, playCaptureSound } from '../systems/audio';
import { getSetForTheme } from '../constants/setDefinitions';

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export function GameController() {
  const { world } = useRapier();

  const slamStartTime = useRef<number>(0);
  const hasProcessedSlam = useRef(false);
  const hitStopFrames = useRef<number>(0);
  const settleStartTime = useRef<number>(0);

  const gameState  = useGameStore((s) => s.gameState);
  const hitStopActive = useGameStore((s) => s.hitStopActive);
  const setHitStopActive = useGameStore((s) => s.triggerHitStop);
  const setImpactFlashActive = useGameStore((s) => s.triggerImpactFlash);
  const setGameState  = useGameStore((s) => s.setGameState);
  const updateTimer = useGameStore((s) => s.updateTimer);
  const stats         = useGameStore((s) => s.stats);
  const updateStats   = useGameStore((s) => s.updateStats);
  const removePog     = useGameStore((s) => s.removePog);
  const addToCollection = useGameStore((s) => s.addToCollection);
  const enqueueShowcase = useGameStore((s) => s.enqueueShowcase);
  const advanceShowcase = useGameStore((s) => s.advanceShowcase);
  const resetStack    = useGameStore((s) => s.resetStack);
  const cycleAtmosphere = useGameStore((s) => s.cycleAtmosphere);
  const setSlamText   = useGameStore((s) => s.setSlamText);
  const currentShowcase = useGameStore((s) => s.currentShowcase);
  const addFaceUpPog  = useGameStore((s) => s.addFaceUpPog);
  const endPracticeSession = useGameStore((s) => s.endPracticeSession);
  const resetCombo    = useGameStore((s) => s.resetCombo);

  // ── Keyboard shortcuts [R], [E], [Space] ─────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'r') resetStack();
      if (key === 'e') cycleAtmosphere();
      if (e.code === 'Space' && gameState === 'SHOWCASE') {
        advanceShowcase();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resetStack, cycleAtmosphere, advanceShowcase]);

  // ── Mark slam start ───────────────────────────────────────
  useEffect(() => {
    if (gameState === 'SLAMMED') {
      slamStartTime.current = Date.now();
      settleStartTime.current = Date.now();
      hasProcessedSlam.current = false;

      // Track total slams
      updateStats({ totalSlams: stats.totalSlams + 1 });

      // Slam text based on power
      const power = useGameStore.getState().power;
      
      // Notify SetManager of slam
      const setManager = useGameStore.getState().setManager;
      setManager.onSlam(power);
      
      if (power >= 95) {
        setSlamText('PERFECT SLAM!!');
      } else if (power >= 80) {
        setSlamText('ULTRA SLAM!');
      } else if (power >= 60) {
        setSlamText('RADICAL!');
      } else if (power >= 40) {
        setSlamText('NICE!');
      } else {
        setSlamText('WEAK...');
      }
      setSlamText(null);
    }
  }, [gameState]);

  // ── Impact SFX (wired via collision) ─────────────────────
  useEffect(() => {
    if (gameState === 'SLAMMED') {
      playImpactSound();
    }
  }, [gameState]);

  // Fixed timestep accumulator for stable 60Hz physics
  const accumulatorRef = useRef(0);
  const FIXED_TIMESTEP = 1/60; // 60Hz

  // Per-frame settle check (identical logic to original) with fixed timestep
  useFrame((_, delta) => {
    // Handle hit-stop: freeze physics for 4 frames when triggered
    if (hitStopActive) {
      hitStopFrames.current++;
      if (hitStopFrames.current >= 4) {
        hitStopFrames.current = 0;
        useGameStore.setState({ hitStopActive: false });
      }
      return; // Skip physics processing during hit-stop
    }

    if (gameState !== 'SLAMMED' || hasProcessedSlam.current) return;

    // Accumulate time for fixed timestep
    accumulatorRef.current += delta;
    if (accumulatorRef.current < FIXED_TIMESTEP) return;
    
    // Process fixed timestep logic
    accumulatorRef.current -= FIXED_TIMESTEP;

    const elapsed = Date.now() - slamStartTime.current;
    const forceReset = elapsed > 5000;

    let allSettled = true;
    if (!forceReset) {
      world.forEachRigidBody((body) => {
        if (body.bodyType() === 0) { // Dynamic
          const lv = body.linvel();
          const av = body.angvel();
          const speedSq = lv.x ** 2 + lv.y ** 2 + lv.z ** 2;
          const angSq   = av.x ** 2 + av.y ** 2 + av.z ** 2;
          if (speedSq > 0.0025 || angSq > 0.0025) allSettled = false; // ~0.05 threshold like v1
        }
      });
    }

    if (!allSettled && !forceReset) return;
    hasProcessedSlam.current = true;
    const settleTime = Date.now() - settleStartTime.current;
    console.log(`[PHYSICS] 🏁 All bodies settled in ${settleTime}ms (Threshold: 0.0025)`);
    
    // Trigger hit-stop on impact
    setHitStopActive();
    setImpactFlashActive();
    
    // Check for perfect hit (95+ power) and trigger perfect hit event
    const power = useGameStore.getState().power;
    
    // Notify SetManager of slam
    const setManager = useGameStore.getState().setManager;
    setManager.onSlam(power);
    
    if (power >= 95) {
      useGameStore.getState().triggerPerfectHit();
    }
    
    // Play impact sound immediately on actual impact
    playImpactSound();

    const state = useGameStore.getState();
    
    // Timer loop
    if (state.gameState === "AIMING" || state.gameState === "POWERING" || state.gameState === "SLAMMED") {
      state.updateTimer(delta);

      if (state.timeLeft <= 0) {
        state.endGame();
      }
    }

    // ── FACE-UP DETECTION ─────────────────────────────────
    const faceUpPogs: string[] = [];

    world.forEachRigidBody((body) => {
      const userData = body.userData as any;
      if (typeof userData?.name !== 'string' || !userData.name.startsWith('pog-')) return;

      const rot = body.rotation();
      const quat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);
      const localUp = WORLD_UP.clone().applyQuaternion(quat);

      if (localUp.y > 0.7) {
        faceUpPogs.push(userData['pog-id']);
        const pogData = state.pogs.find((p: any) => p.id === userData['pog-id']);
        if (pogData) {
          addToCollection({ theme: pogData.theme, rarity: pogData.rarity, date: new Date().toISOString() });
          removePog(userData['pog-id']);
          const setDef = getSetForTheme(pogData.theme);
          const values: Record<string, number> = { standard: 50, shiny: 250, holographic: 1500 };
          enqueueShowcase([{
            theme: pogData.theme,
            rarity: pogData.rarity,
            setName: setDef ? setDef.name : 'VINTAGE COLLECTIBLE',
            setColor: setDef ? setDef.color : '#00ffcc',
            marketValue: values[pogData.rarity] ?? 50,
          }]);
          updateStats({ totalSlams: state.stats.totalSlams + 1, pogsWon: state.stats.pogsWon + 1 });
          playCaptureSound();
        }
      }
    });

    // Update face-up POGs tracking
    useGameStore.getState().setFaceUpPogs(faceUpPogs);
    
    // Combo system: increment combo if POGs were flipped, reset if none
    if (faceUpPogs.length > 0) {
      useGameStore.getState().incrementCombo();
    } else {
      resetCombo();
    }

    // Handle practice mode vs classic mode differently
    if (state.gameMode === 'PRACTICE_FOR_KEEPS' || state.gameMode === 'NO_RESTACK_CHAOS') {
      // In practice mode, check if all POGs are face-up or if slam was empty
      const remainingPogs = state.pogs.filter(pog => !faceUpPogs.includes(pog.id));
      
      if (remainingPogs.length === 0 || faceUpPogs.length === 0) {
        // Session complete - show summary
        endPracticeSession();
      } else {
        // Continue practice - restack remaining POGs
        setGameState('RESETTING');
        setTimeout(() => {
          useGameStore.getState().setGameState('AIMING');
          // Reset combo for next slam
          resetCombo();
        }, 1500);
      }
    } else {
      // Classic mode - original behavior
      const showcaseItems = faceUpPogs.map(pogId => {
        const pogData = state.pogs.find(p => p.id === pogId);
        if (!pogData) return null;
        
        const setDef = getSetForTheme(pogData.theme);
        const values: Record<string, number> = { standard: 50, shiny: 250, holographic: 1500 };
        return {
          pogId: pogId,
          theme: pogData.theme,
          rarity: pogData.rarity,
          setName: setDef ? setDef.name : 'VINTAGE COLLECTIBLE',
          setColor: setDef ? setDef.color : '#00ffcc',
          marketValue: values[pogData.rarity] ?? 50,
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null);

      if (showcaseItems.length > 0) {
        updateStats({ pogsWon: stats.pogsWon + showcaseItems.length });
        playCaptureSound();
        setGameState('SHOWCASE');
        enqueueShowcase(showcaseItems);
      } else {
        // Nothing won — just reset
        setGameState('RESETTING');
        setTimeout(() => {
          useGameStore.getState().setGameState('AIMING');
        }, 1500);
      }
    }
  });

  // ── Advance showcase timer (5s auto-advance like original) 
  const showcaseStart = useRef(0);
  useEffect(() => {
    if (gameState === 'SHOWCASE') {
      showcaseStart.current = Date.now();
    }
  }, [currentShowcase, gameState]);

  useFrame(() => {
    if (gameState !== 'SHOWCASE') return;
    if (Date.now() - showcaseStart.current > 5000) {
      advanceShowcase();
    }
  });

  return null;
}
