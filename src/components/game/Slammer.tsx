import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, RoundCuboidCollider, useRapier } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';

import { getMaterialFromRegistry } from '../../utils/TextureGenerator';
import { SLAMMER_TYPES } from '../../constants/slammerTypes';
import * as THREE from 'three';

export function Slammer() {
  const rb = useRef<RapierRigidBody>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const { mouse, raycaster, camera } = useThree();
  const { world } = useRapier();
  
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const setPower = useGameStore((state) => state.setPower);
  const setPowerDirection = useGameStore((state) => state.setPowerDirection);
  const currentSlammerType = useGameStore((state) => state.currentSlammerType);
  const triggerFogPulse = useGameStore((state) => state.triggerFogPulse);
  
  // Ghost slammer state
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  const debugParams = useGameStore((state) => state.debugParams);

  
  // Update slammer physics properties in real-time
  useEffect(() => {
    if (rb.current) {
      // Damping and other mutable properties can be updated live
      // Mass, restitution, friction are baked into collider creation
    }
  }, [debugParams.slammerMass, debugParams.slammerRestitution, debugParams.slammerFriction]);
  // Update camera FOV immediately when debug params change
  useEffect(() => {
    if ('fov' in camera && gameState !== 'SLAMMED') {
      camera.fov = debugParams.baseFOV;
      camera.updateProjectionMatrix();
    }
  }, [debugParams.baseFOV, camera]);

  // Listen for debug panel state changes
  useEffect(() => {
    const handleDebugPanelState = (event: Event) => {
      const customEvent = event as CustomEvent<{ isOpen: boolean }>;
      setDebugPanelOpen(customEvent.detail.isOpen);
    };
    window.addEventListener('debugPanelStateChanged', handleDebugPanelState);
    return () => window.removeEventListener('debugPanelStateChanged', handleDebugPanelState);
  }, []);

  useEffect(() => {
    if (materialRef.current) {
      const mat = getMaterialFromRegistry('slammer', 'metal');
      if (Array.isArray(mat)) {
        const sourceMat = mat[0] as THREE.MeshStandardMaterial;
        materialRef.current.color = sourceMat.color;
        materialRef.current.roughness = sourceMat.roughness;
        materialRef.current.metalness = sourceMat.metalness;
      } else {
        const sourceMat = mat as THREE.MeshStandardMaterial;
        materialRef.current.color = sourceMat.color;
        materialRef.current.roughness = sourceMat.roughness;
        materialRef.current.metalness = sourceMat.metalness;
      }
    }
  }, [currentSlammerType]);
  const slammerDef = SLAMMER_TYPES[currentSlammerType as keyof typeof SLAMMER_TYPES];
  const slammerMass = slammerDef ? slammerDef.mass : 1.5;

  // Raycaster for aiming — reuse, never allocate in useFrame
  const intersectPoint = useMemo(() => new THREE.Vector3(), []);
  const aimingPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -5), []);

  useFrame((_state, delta) => {
    if (!rb.current) return;

    if (gameState === 'AIMING' || gameState === 'POWERING') {
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(aimingPlane, intersectPoint);
      
      rb.current.setNextKinematicTranslation({
        x: intersectPoint.x,
        y: 5,
        z: intersectPoint.z
      });

      if (gameState === 'POWERING') {
        const power = useGameStore.getState().power;
        const dir = useGameStore.getState().powerDirection;
        let nextPower = power + debugParams.powerChargeSpeed * delta * dir;
        if (nextPower >= 100) {
          nextPower = 100;
          setPowerDirection(-1);
        } else if (nextPower <= 0) {
          nextPower = 0;
          setPowerDirection(1);
        }
        setPower(nextPower);
      }
    }
  });

  // Handle Slam Input
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // LMB only
      if (debugPanelOpen) return;
      if (useGameStore.getState().gameState === 'AIMING') {
        setGameState('POWERING');
        setPower(0);
        setPowerDirection(1);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return; // LMB only
      if (debugPanelOpen) return;
      const state = useGameStore.getState();
      if (state.gameState === 'POWERING' && rb.current) {
        setGameState('SLAMMED');
        
        // EXECUTE SLAM — using debug params
        const currentPower = state.power;
        const slamForce = debugParams.slamBaseForce + (currentPower * debugParams.slamPowerMultiplier); 
        rb.current.setBodyType(0, true);
        rb.current.setLinvel({ x: 0, y: slamForce, z: 0 }, true);

        // TRIGGER FOG BURST ON TOSS
        triggerFogPulse();

        // FOV punch using debug params
        if ('fov' in camera) {
          camera.fov = debugParams.punchFOV;
          camera.updateProjectionMatrix();
        }

        // Impact scatter — using debug params
        const shatterRadius = debugParams.shatterRadius;
        const shatterForce = debugParams.shatterForceMin + (currentPower / 100) * (debugParams.shatterForceMax - debugParams.shatterForceMin); // Much lower force for cardboard

        setTimeout(() => {
          // Wait for slammer to reach the stack (using debug delay)
          if (!rb.current) return;
          const impactPos = rb.current.translation();
          world.forEachRigidBody((body) => {
            const ud = body.userData as any;
            if (!ud?.name?.startsWith('pog-')) return;
            const pos = body.translation();
            const dx = pos.x - impactPos.x;
            const dz = pos.z - impactPos.z;
            const dist = Math.sqrt(dx * dx + dz * dz);
            if (dist < shatterRadius && dist > 0.01) {
              const forceMag = shatterForce * (1 - dist / shatterRadius);
              const dirX = dx / dist;
              const dirZ = dz / dist;
              body.applyImpulse(
                { x: dirX * forceMag, y: 0.15 * forceMag, z: dirZ * forceMag },
                true
              );
              body.wakeUp();
            }
          });
        }, debugParams.slamDelay);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [setGameState, setPower, setPowerDirection]);

  // Reset slammer back to kinematic when returning to AIMING
  useEffect(() => {
    if (gameState === 'AIMING' && rb.current) {
      rb.current.setBodyType(2, true); // 2 = KinematicPositionBased
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      rb.current.setNextKinematicTranslation({ x: 0, y: 5, z: 0 });
    }
  }, [gameState]);

  // Get power value outside useFrame to prevent infinite state updates
  const power = useGameStore((state) => state.power);

  // Visual Power Juice + FOV recovery + Ghosted Effect + Portal Detection
  useFrame(() => {
    // FOV lerp back to base using debug params
    if ('fov' in camera && camera.fov > debugParams.baseFOV + 0.1) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, debugParams.baseFOV, debugParams.fovLerpSpeed);
      camera.updateProjectionMatrix();
    }

    // Ghost mode detection
    if (rb.current) {
      const pos = rb.current.translation();
      
      // Check if slammer is over the stack (within 1.5 units of center on XZ plane)
      const distanceFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
      const isOverStack = distanceFromCenter < 1.5 && pos.y < 3; // Close to stack and low enough
      setIsGhostMode(isOverStack);
    }

    if (mesh.current && materialRef.current) {
        const s = 1 + (power / 100) * debugParams.slammerScaleBoost;
        mesh.current.scale.set(s, s, s);
        
        // Always transparent until thrown
        const isThrown = gameState === 'SLAMMED';
        materialRef.current.transparent = true;
        materialRef.current.opacity = isThrown ? 1.0 : debugParams.slammerOpacity; // 75% until thrown
        materialRef.current.depthWrite = isThrown; // Only write depth when thrown
        
        // Remove glow for ghost mode - just white and transparent
        if (isGhostMode) {
          materialRef.current.emissive = new THREE.Color(0x000000);
          materialRef.current.emissiveIntensity = 0;
        } else {
          materialRef.current.emissive = new THREE.Color(0x000000);
          materialRef.current.emissiveIntensity = 0;
        }
        
        // Power-based emissive intensity
        const powerEmissive = (power / 100) * debugParams.slammerEmissiveIntensity;
        if (materialRef.current.emissiveIntensity > 0) {
          materialRef.current.emissiveIntensity += powerEmissive;
        }
    }
  });

  
  return (
    <RigidBody 
      ref={rb}
      type="kinematicPosition"
      colliders={false}
      mass={debugParams.slammerMass}
      restitution={debugParams.slammerRestitution}
      friction={debugParams.slammerFriction}
      position={[0, 5, 0]}
    >
      <RoundCuboidCollider args={[0.6, 0.05, 0.6, 0.1]} />
      <mesh ref={mesh}>
        <cylinderGeometry args={[0.72, 0.72, 0.18, 24]} />
        <meshStandardMaterial ref={materialRef} />
      </mesh>
    </RigidBody>
  );
}





