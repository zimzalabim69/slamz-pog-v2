import { useFrame } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { useGameStore } from '@100/store/useGameStore';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { playImpactSound } from '@100/systems/audio';
import { cinematicEngine } from '@400/systems/CinematicEngine';

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const _quat = new THREE.Quaternion();
const _vec3 = new THREE.Vector3();

export function GameController() {
  const { world } = useRapier();

  const slamStartTime = useRef<number>(0);
  const hasProcessedSlam = useRef(false);
  const hitStopFrames = useRef<number>(0);
  const settleStartTime = useRef<number>(0);
  const sustainedSettleTicks = useRef<number>(0);
  const SUSTAINED_SETTLE_THRESHOLD = 12; // Snappier round endings at 60Hz (approx 0.2s)

  const gameState  = useGameStore((s) => s.gameState);
  const hitStopActive = useGameStore((s) => s.hitStopActive);
  const setHitStopActive = useGameStore((s) => s.triggerHitStop);
  const setImpactFlashActive = useGameStore((s) => s.triggerImpactFlash);
  const setGameState  = useGameStore((s) => s.setGameState);
  const resetStack    = useGameStore((s) => s.resetStack);
  const setSlamText   = useGameStore((s) => s.setSlamText);
  const triggerWraithSwarm = useGameStore((s) => s.triggerWraithSwarm);
  const resetCombo    = useGameStore((s) => s.resetCombo);
  const debugParams   = useGameStore((s) => s.debugParams);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'r') resetStack();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resetStack]);

  useEffect(() => {
    if (gameState === 'SLAMMED') {
      slamStartTime.current = Date.now();
      settleStartTime.current = Date.now();
      hasProcessedSlam.current = false;
      sustainedSettleTicks.current = 0; 

      const power = useGameStore.getState().power;
      
      if (power < 30) {
        setSlamText('WEAKBREACH_...');
        triggerWraithSwarm(8);
      } else if (power >= 95) {
        setSlamText('PERFECT_EXTRACT!!');
      } else if (power >= 80) {
        setSlamText('ULTRA_BREACH!');
      } else if (power >= 60) {
        setSlamText('PROTOCOL_STRIKE!');
      } else if (power >= 40) {
        setSlamText('STABLE_CONNECTION...');
      }
    }
  }, [gameState, setSlamText, triggerWraithSwarm]);

  useEffect(() => {
    if (gameState === 'SLAMMED') {
      playImpactSound();
    }
  }, [gameState]);

  const accumulatorRef = useRef(0);
  const FIXED_TIMESTEP = 1/60;

  useFrame((_, delta) => {
    if (hitStopActive) {
      hitStopFrames.current++;
      if (hitStopFrames.current >= 4) {
        hitStopFrames.current = 0;
        useGameStore.setState({ hitStopActive: false });
      }
      return; 
    }

    if (gameState !== 'SLAMMED' || hasProcessedSlam.current) return;

    accumulatorRef.current += delta;
    if (accumulatorRef.current < FIXED_TIMESTEP) return;
    accumulatorRef.current -= FIXED_TIMESTEP;

    const elapsed = Date.now() - slamStartTime.current;
    const forceReset = elapsed > 5000;

    if (!forceReset && (cinematicEngine.isCinematicActive || cinematicEngine.isInGracePeriod())) {
      sustainedSettleTicks.current = 0;
      return;
    }

    let allSettled = true;
    if (!forceReset) {
      world.forEachRigidBody((body) => {
        if (body.bodyType() === 0) {
          const lv = body.linvel();
          const av = body.angvel();
          const speedSq = lv.x ** 2 + lv.y ** 2 + lv.z ** 2;
          const angSq   = av.x ** 2 + av.y ** 2 + av.z ** 2;
          if (speedSq > 0.01 || angSq > 0.01) allSettled = false;
        }
      });
    }

    if (!forceReset) {
      if (allSettled) {
        sustainedSettleTicks.current++;
        if (sustainedSettleTicks.current < SUSTAINED_SETTLE_THRESHOLD) return;
      } else {
        sustainedSettleTicks.current = 0;
        return;
      }
    }

    hasProcessedSlam.current = true;
    setHitStopActive();
    setImpactFlashActive();
    playImpactSound();

    const state = useGameStore.getState();
    
    if (state.gameState === "AIMING" || state.gameState === "POWERING" || state.gameState === "SLAMMED") {
      state.updateTimer(delta);
      if (state.timeLeft <= 0) {
        state.endGame();
      }
    }

    const faceUpPogs: string[] = [];
    let pogsOnMatCount = 0;
    const MAT_RADIUS = debugParams.battleAreaScale;

    world.forEachRigidBody((body) => {
      const userData = body.userData as any;
      if (typeof userData?.name !== 'string' || !userData.name.startsWith('pog-')) return;

      const pos = body.translation();
      const distFromCenter = Math.sqrt(pos.x ** 2 + pos.z ** 2);
      if (distFromCenter <= MAT_RADIUS) {
        pogsOnMatCount++;
      }

      const rot = body.rotation();
      _quat.set(rot.x, rot.y, rot.z, rot.w);
      _vec3.copy(WORLD_UP).applyQuaternion(_quat);

      if (_vec3.y > 0.7) {
        faceUpPogs.push(userData['pog-id']);
      }
    });

    state.setPogsOnMat(pogsOnMatCount);
    state.setWinners(faceUpPogs);
    
    if (faceUpPogs.length > 0) {
      state.incrementCombo();
      setGameState('HARVEST');
    } else {
      resetCombo();
      setGameState('RESETTING');
      triggerWraithSwarm(12);
      setTimeout(() => {
        useGameStore.getState().setGameState('AIMING');
      }, 1500);
    }
  });

  return null;
}
