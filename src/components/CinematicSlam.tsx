import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';
import { cinematicEngine } from '../systems/CinematicEngine';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * CINEMATIC SLAM - ATOMIC TRIGGER EDITION
 * We respond to the Engine's Atomic Freeze to start our timeline.
 */
export function CinematicSlam() {
  const { camera } = useThree();
  const { world } = useRapier();
  const gameState = useGameStore((s) => s.gameState);
  const setIsCinematicActive = useGameStore((s) => s.setIsCinematicActive);
  const debugParams = useGameStore((s) => s.debugParams);
  
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const originalPosRef = useRef(new THREE.Vector3());
  const orbitData = useRef({ angle: 0 });
  
  useEffect(() => {
    // We start the timeline when the engine's isCinematicActive flag is true
    // This happens ATOMICALLY in the Slammer's impact loop.
    if (cinematicEngine.isCinematicActive && !timelineRef.current) {
      console.log('[CINEMATIC] 🎬 ATOMIC SEQUENCE START');
      
      originalPosRef.current.copy(camera.position);
      const impactPoint = new THREE.Vector3(0, 0.1, 0);
      
      // We also update the store to ensure Physics component stays paused
      setIsCinematicActive(true);

      const tl = gsap.timeline({
        onComplete: () => {
          console.log('[CINEMATIC] ✅ COMPLETE - ENGINE HAND-OFF');
          
          // ENGINE: RESTORE VELOCITIES
          cinematicEngine.handOff(world);

          timelineRef.current = null;
          setIsCinematicActive(false);
          cinematicEngine.isCinematicActive = false;
        }
      });
      
      // PHASE 1: WINDUP - Liquid ramp down
      tl.to(camera.position, {
        duration: debugParams.cinematicWindupDuration,
        x: 5,
        y: 2.5,
        z: 5,
        ease: "expo.out",
        onUpdate: () => camera.lookAt(impactPoint)
      }, 0);
      
      tl.to(cinematicEngine, {
        manualDriftScale: 0.05,
        duration: debugParams.cinematicWindupDuration,
        ease: "expo.out"
      }, 0);
      
      // PHASE 2: LITERAL FREEZE
      tl.to(cinematicEngine, {
        manualDriftScale: 0.0001,
        duration: debugParams.cinematicFreezeDuration,
        ease: "none"
      }, debugParams.cinematicWindupDuration);
      
      // PHASE 3: BULLET TIME ORBIT
      orbitData.current.angle = 0;
      tl.to(orbitData.current, {
        angle: Math.PI * 2,
        duration: debugParams.cinematicOrbitDuration,
        ease: "power2.inOut",
        onUpdate: () => {
          const radius = debugParams.cinematicOrbitRadius;
          const height = debugParams.cinematicOrbitHeight;
          camera.position.x = Math.cos(orbitData.current.angle) * radius;
          camera.position.z = Math.sin(orbitData.current.angle) * radius;
          camera.position.y = height;
          camera.lookAt(impactPoint);
        }
      }, debugParams.cinematicWindupDuration + debugParams.cinematicFreezeDuration);
      
      tl.to(cinematicEngine, {
        manualDriftScale: 0.12, 
        duration: debugParams.cinematicOrbitDuration,
        ease: "none"
      }, debugParams.cinematicWindupDuration + debugParams.cinematicFreezeDuration);
      
      // PHASE 4: REVEAL - Liquid ramp back to full
      const revealStart = debugParams.cinematicWindupDuration + debugParams.cinematicFreezeDuration + debugParams.cinematicOrbitDuration;
      
      tl.to(cinematicEngine, {
        manualDriftScale: 1.0,
        duration: debugParams.cinematicRevealDuration,
        ease: "expo.in"
      }, revealStart);
      
      tl.to(camera.position, {
        duration: debugParams.cinematicRevealDuration,
        x: originalPosRef.current.x,
        y: originalPosRef.current.y,
        z: originalPosRef.current.z,
        ease: "expo.out",
        onUpdate: () => camera.lookAt(0, 0, 0)
      }, revealStart);
      
      timelineRef.current = tl;
    }
    
    // Cleanup if game resets
    if (gameState === 'AIMING' && timelineRef.current) {
      timelineRef.current.kill();
      timelineRef.current = null;
      cinematicEngine.reset();
      setIsCinematicActive(false);
      camera.position.copy(originalPosRef.current);
      camera.lookAt(0, 0, 0);
    }
  }, [cinematicEngine.isCinematicActive, gameState, camera, world, debugParams, setIsCinematicActive]);
  
  return null;
}
