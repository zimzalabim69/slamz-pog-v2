import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { useRapier } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';
import { cinematicEngine } from '../systems/CinematicEngine';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * CINEMATIC SLAM - SMART CAMERA TRACKING EDITION
 * Dynamically frames the pog explosion cloud by tracking all pogs!
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
  const lookAtTarget = useRef(new THREE.Vector3());
  
  useEffect(() => {
    // We start the timeline when the engine's isCinematicActive flag is true
    // This happens ATOMICALLY in the Slammer's impact loop.
    if (cinematicEngine.isCinematicActive && !timelineRef.current) {
      console.log('[CINEMATIC] 🎬 ATOMIC SEQUENCE START - SMART TRACKING');
      
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
      
      // Helper: Calculate the "Soft Weighted Density Center"
      // Uses a Gaussian kernel to find the most meaningful focus point in a scattering cloud.
      const getPogDensityCenter = () => {
        const positions: THREE.Vector3[] = [];
        world.forEachRigidBody((body: any) => {
          const ud = body.userData as any;
          if (ud?.name?.startsWith('pog-')) {
            const pos = body.translation();
            positions.push(new THREE.Vector3(pos.x, pos.y, pos.z));
          }
        });
        
        if (positions.length === 0) return { center: impactPoint, maxDist: 4 };

        const sigmaSq = 16.0; // 4.0 units standard deviation
        let totalWeight = 0;
        const weightedCenter = new THREE.Vector3();
        
        // 1. Calculate weights based on local density
        const weights = positions.map(p => {
          let w = 0;
          positions.forEach(other => {
            const d2 = p.distanceToSquared(other);
            w += Math.exp(-d2 / (2 * sigmaSq));
          });
          return w;
        });

        // 2. Compute weighted average
        positions.forEach((p, i) => {
          const w = weights[i];
          weightedCenter.addScaledVector(p, w);
          totalWeight += w;
        });
        weightedCenter.divideScalar(totalWeight);

        // 3. Frame the clump (weighted average distance)
        let weightedSpread = 0;
        positions.forEach((p, i) => {
          const w = weights[i];
          const d = p.distanceTo(weightedCenter);
          weightedSpread += d * (w / totalWeight);
        });

        return { center: weightedCenter, maxDist: Math.max(weightedSpread * 2.5, 3.5) };
      };

      // PHASE 1: WINDUP - SMART PULL BACK
      const radius = debugParams.cinematicOrbitRadius;
      const height = debugParams.cinematicOrbitHeight;
      
      tl.to(camera.position, {
        duration: debugParams.cinematicWindupDuration,
        x: 0,
        y: height + 2,
        z: radius + 6,
        ease: 'expo.out',
        onUpdate: () => {
          const bounds = getPogDensityCenter();
          lookAtTarget.current.lerp(bounds.center, 0.08); // Ultra-smooth lerp
          camera.lookAt(lookAtTarget.current);
        }
      }, 0);
      
      // PHASE 2: LITERAL FREEZE
      tl.to({}, { 
        duration: debugParams.cinematicFreezeDuration,
        onUpdate: () => {
          const bounds = getPogDensityCenter();
          lookAtTarget.current.lerp(bounds.center, 0.08);
          camera.lookAt(lookAtTarget.current);
        }
      }, tl.duration());
      
      // PHASE 3: BULLET TIME ORBIT
      orbitData.current.angle = 0;
      tl.to(orbitData.current, {
        angle: Math.PI * 2,
        duration: debugParams.cinematicOrbitDuration,
        ease: 'power2.inOut',
        onUpdate: () => {
          const bounds = getPogDensityCenter();
          
          // Smoothed focus point
          lookAtTarget.current.lerp(bounds.center, 0.08);
          
          // Dynamically adjust orbit radius based on clump density spread.
          const zoomMult = debugParams.cinematicDynamicZoomMultiplier;
          const zoomMaxScale = debugParams.cinematicDynamicZoomMaxScale;
          const dynamicRadius = Math.min(
            Math.max(radius, bounds.maxDist * zoomMult),
            radius * zoomMaxScale
          );
          
          camera.position.x = Math.cos(orbitData.current.angle) * dynamicRadius;
          camera.position.z = Math.sin(orbitData.current.angle) * dynamicRadius;
          camera.position.y = height + lookAtTarget.current.y; 
          camera.lookAt(lookAtTarget.current);
        }
      }, tl.duration());
      
      // PHASE 4: REVEAL - Return to standard view
      tl.to(camera.position, {
        duration: debugParams.cinematicRevealDuration,
        x: originalPosRef.current.x,
        y: originalPosRef.current.y,
        z: originalPosRef.current.z,
        ease: 'expo.out',
        onUpdate: () => camera.lookAt(0, 0, 0)
      }, tl.duration());
      
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
