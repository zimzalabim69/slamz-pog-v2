import { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CylinderCollider, useRapier } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';

import { getMaterialFromRegistry } from '../../utils/TextureGenerator';
import { SLAMMER_TYPES } from '../../constants/slammerTypes';
import * as THREE from 'three';

import { cinematicEngine } from '../../systems/CinematicEngine';

// Removed debug logs for cleaner console

export function Slammer() {
  const rb = useRef<RapierRigidBody>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const { mouse, raycaster, camera } = useThree();
  const { world } = useRapier();
  
  // Runtime verification (minimal)
  useEffect(() => {
    if (rb.current) {
      // Basic check - remove excessive logging
    }
  }, []);
  
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
  
  // Camera shake state — no allocations in useFrame
  const shakeIntensity = useRef(0);
  const shakeDecay = useRef(0.9);
  const shakeRotation = useRef({ x: 0, y: 0 });

  // Track whether impact has been processed this slam
  const impactProcessed = useRef(false);
  const slamPowerRef = useRef(0);
  
  // Store original slammer position for direction calculation
  const originalSlammerPos = useRef(new THREE.Vector3(0, 5, 0));
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
  // Pre-allocate plane and hit vector outside useFrame (perf rule: no new() in useFrame)
  const aimPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.7), []);
  const aimHit = useMemo(() => new THREE.Vector3(), []);

  useFrame((_state, delta) => {
    if (!rb.current) return;

    if (gameState === 'AIMING' || gameState === 'POWERING') {
      raycaster.setFromCamera(mouse, camera);
      
      // Use pre-allocated plane and hit vector (perf rule: no new() in useFrame)
      if (!raycaster.ray.intersectPlane(aimPlane, aimHit)) {
        console.error("RAYCAST FAILED")
        return
      }
      
      intersectPoint.copy(aimHit)
      
      
      
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
      e.preventDefault();
      if (useGameStore.getState().gameState === "SESSION_SUMMARY" || useGameStore.getState().gameState === "START_SCREEN") return;
      if (gameState !== 'AIMING' && gameState !== 'POWERING') return;
      
      // Start charging power
      setGameState('POWERING');
      setPower(0);
      setPowerDirection(1);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return; // LMB only
      if (debugPanelOpen) return;
      if (useGameStore.getState().gameState === "SESSION_SUMMARY" || useGameStore.getState().gameState === "START_SCREEN") return;
      const state = useGameStore.getState();
      if (state.gameState === 'POWERING' && rb.current) {
        setGameState('SLAMMED');
        impactProcessed.current = false;
        slamPowerRef.current = state.power;
        
        // EXECUTE SLAM - V1 STYLE: DROP STRAIGHT DOWN
        
        if (!intersectPoint) {
          console.error("NO INTERSECT POINT")
          return
        }

        // Calculate slam force using tuned params
        const finalPower = state.power;
        const slamForce = debugParams.slamBaseForce + (finalPower * debugParams.slamPowerMultiplier);
        
        console.log("V1 SLAM FORCE", slamForce);
        console.log("SLAMMER POS", rb.current.translation());
        
        // V1 EXACT: Switch to dynamic BEFORE applying velocity
        // (V1 did: this.slammer.body.type = CANNON.Body.DYNAMIC + updateMassProperties + wakeUp)
        rb.current.setBodyType(0, true); // 0 = Dynamic
        rb.current.wakeUp();
        
        // V1 EXACT: Apply velocity
        rb.current.setLinvel({ x: 0, y: slamForce, z: 0 }, true);
        
        // 3. ADD ANGULAR VELOCITY (SPIN)
        rb.current.setAngvel({
          x: (Math.random() - 0.5) * 5,
          y: (Math.random() - 0.5) * 5,
          z: (Math.random() - 0.5) * 5
        }, true);

        // TRIGGER FOG BURST ON TOSS
        triggerFogPulse();

        // FOV punch
        if ('fov' in camera) {
          camera.fov = debugParams.punchFOV;
          camera.updateProjectionMatrix();
        }
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

  // Visual Power Juice + FOV recovery + Ghosted Effect + IMPACT DETECTION
  useFrame(() => {
    // FOV lerp back to base using debug params
    if ('fov' in camera && camera.fov > debugParams.baseFOV + 0.1) {
      camera.fov = THREE.MathUtils.lerp(camera.fov, debugParams.baseFOV, debugParams.fovLerpSpeed);
      camera.updateProjectionMatrix();
    }

    // Enhanced camera shake decay with rotation
    if (shakeIntensity.current > 0.001) {
      camera.position.x += (Math.random() - 0.5) * shakeIntensity.current;
      camera.position.y += (Math.random() - 0.5) * shakeIntensity.current;
      
      // Add rotation shake
      camera.rotation.x += shakeRotation.current.x;
      camera.rotation.y += shakeRotation.current.y;
      
      shakeIntensity.current *= shakeDecay.current;
      shakeRotation.current.x *= 0.9;
      shakeRotation.current.y *= 0.9;
    } else {
      shakeIntensity.current = 0;
      shakeRotation.current = { x: 0, y: 0 };
    }

    // V1 EXACT: Impact detection based on Y position (no collision reliance)
    if (gameState === 'SLAMMED' && !impactProcessed.current && rb.current) {
      const pos = rb.current.translation();
      if (pos.y < 1.1) {
        impactProcessed.current = true;
        
        console.log("[SLAM] 💥 IMPACT DETECTED - TRIGGERING ERUPTION");
        
        const currentPower = slamPowerRef.current;
        const impactPos = rb.current.translation();
        
        // APPLY DRAMATIC ERUPTION FORCES (Max Payne Style)
        world.forEachRigidBody((body) => {
          const ud = body.userData as any;
          if (!ud?.name?.startsWith('pog-')) return;
          
          const pogPos = body.translation();
          
          // Calculate radial direction (XZ plane for horizontal spread)
          const dx = pogPos.x - impactPos.x;
          const dz = pogPos.z - impactPos.z;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          if (dist < 3.0) { // Impact radius
            const dirX = dx / (dist || 0.1);
            const dirZ = dz / (dist || 0.1);
            
            // Base force on power and distance
            // CALIBRATED FOR 0.1 MASS: Force ~3.5 to 8.0 is the "Goldilocks" zone for stability
            const forceBase = 3.5 + (currentPower / 100) * 4.5;
            const distanceDecline = Math.max(0, 1 - dist / 3.0);
            const finalForce = forceBase * distanceDecline;
            
            // Apply Impulse
            body.applyImpulse({
              x: dirX * finalForce,
              y: finalForce * 1.8, // Stronger upward kick
              z: dirZ * finalForce
            }, true);
            
            // Apply dramatic torque (flips) - lower for better visual stability
            const torqueForce = finalForce * 0.15;
            body.applyTorqueImpulse({
              x: (Math.random() - 0.5) * torqueForce,
              y: (Math.random() - 0.5) * torqueForce,
              z: (Math.random() - 0.5) * torqueForce
            }, true);
            
            body.wakeUp();
          }
        });
        
        // ATOMIC FREEZE: Lock the pogs the instant they are hit
        cinematicEngine.triggerCinematic(world);
        
        // Camera shake
        shakeIntensity.current = currentPower * 0.02 * debugParams.cinematicCometShakeIntensity;
        shakeRotation.current = {
          x: (Math.random() - 0.5) * currentPower * 0.002,
          y: (Math.random() - 0.5) * currentPower * 0.002
        };
      }
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
      linearDamping={0}
      position={[0, 8, 0]}
    >
      <CylinderCollider args={[0.72, 0.2]} />
      <mesh ref={mesh}>
        <cylinderGeometry args={[0.72, 0.72, 0.18, 24]} />
        <meshStandardMaterial ref={materialRef} />
      </mesh>
    </RigidBody>
  );
}





