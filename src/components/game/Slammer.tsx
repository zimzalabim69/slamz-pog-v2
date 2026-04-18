import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CylinderCollider, useRapier } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';
import { getMaterialFromRegistry } from '../../utils/TextureGenerator';
import * as THREE from 'three';
import { SLAMMER_TYPES } from '../../constants/slammerTypes';
import { cinematicEngine } from '../../systems/CinematicEngine';

/**
 * THE PRO-TOUR SLAMMER (V2.1 - Decoupled)
 * handles input, physics-mode switching, and camera tension zoom.
 */
export function Slammer() {
  const rb = useRef<RapierRigidBody>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const { mouse, raycaster, camera } = useThree();
  const { world } = useRapier();
  
  // Store state and actions
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const setPower = useGameStore((state) => state.setPower);
  const currentSlammerType = useGameStore((state) => state.currentSlammerType);
  const triggerFogPulse = useGameStore((state) => state.triggerFogPulse);
  const debugParams = useGameStore((state) => state.debugParams);
  const setCameraTension = (v: number) => useGameStore.setState({ cameraTension: v });

  // Internal Refs for performance (no re-renders)
  const impactProcessed = useRef(false);
  const slamPowerRef = useRef(0);
  const powerRef = useRef(0);
  const directionRef = useRef(1); // 1 = up, -1 = down
  const isCharging = useRef(false);
  const shakeIntensity = useRef(0);
  const shakeDecay = useRef(0.9);

  // Pre-allocated math objects (Perf Rule: No 'new' in useFrame)
  const aimHit = useMemo(() => new THREE.Vector3(), []);
  const aimPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.7), []);
  const intersectPoint = useMemo(() => new THREE.Vector3(), []);

  // EXPLICIT PHYSICS RESET
  const forceReset = useCallback(() => {
    if (rb.current) {
      console.log("[SLAMMER] 🔄 EXPLICIT RESET TRIGGERED");
      rb.current.setBodyType(2, true); // 2 = Kinematic
      rb.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      impactProcessed.current = false;
      isCharging.current = false;
      setCameraTension(0);
    }
  }, [setCameraTension]);

  // MATERIAL UPDATES
  useEffect(() => {
    if (materialRef.current) {
      const mat = getMaterialFromRegistry('slammer', 'metal');
      const sourceMat = (Array.isArray(mat) ? mat[0] : mat) as THREE.MeshStandardMaterial;
      if (sourceMat) {
        materialRef.current.color = sourceMat.color;
        materialRef.current.roughness = sourceMat.roughness;
        materialRef.current.metalness = sourceMat.metalness;
      }
    }
  }, [currentSlammerType]);

  // INPUT LISTENERS (Merged & Stable)
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Only LMB (0) should trigger slams; RMB (2) is reserved for free-cam
      if (e.button !== 0) return;
      
      // Prevent click-through if hitting the debug panel
      if ((e.target as HTMLElement)?.closest('.debug-panel')) return;

      if (gameState === 'AIMING') {
        isCharging.current = true;
        powerRef.current = 0;
        directionRef.current = 1;
        setGameState('POWERING');
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button !== 0) return;

      if (gameState === 'POWERING' && isCharging.current) {
        isCharging.current = false;
        const finalPower = powerRef.current;
        setPower(finalPower);
        setGameState('SLAMMED');
        impactProcessed.current = false;
        slamPowerRef.current = finalPower;
        
        const slammerData = (SLAMMER_TYPES as any)[currentSlammerType] || SLAMMER_TYPES.standard;
        const slamSpeed = (finalPower / 100) * debugParams.powerChargeSpeed;
        
        // Final Formula: mass * speed * multiplier (downward)
        const slamForce = -(slammerData.mass * slamSpeed * debugParams.slamForceMultiplier);

        if (rb.current) {
          rb.current.setBodyType(0, true); // 0 = Dynamic
          rb.current.wakeUp();
          rb.current.setLinvel({ x: 0, y: slamForce, z: 0 }, true);
          rb.current.setAngvel({
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5,
            z: (Math.random() - 0.5) * 5
          }, true);
          triggerFogPulse();
        }
      }
    };

    const handleAutoSlam = (e: Event) => {
      const customEvent = e as CustomEvent<{ power: number }>;
      if (rb.current && useGameStore.getState().gameState === 'AIMING') {
        forceReset(); // Ensure fresh state
        const power = customEvent.detail.power;
        powerRef.current = power;
        handleMouseUp({ button: 0 } as any); // Execute slam
      }
    };

    const handleResetEvent = () => forceReset();

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('AUTO_SLAM_TRIGGER', handleAutoSlam);
    window.addEventListener('RESET_SLAMMER_TRIGGER', handleResetEvent);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('AUTO_SLAM_TRIGGER', handleAutoSlam);
      window.removeEventListener('RESET_SLAMMER_TRIGGER', handleResetEvent);
    };
  }, [gameState, setGameState, setPower, debugParams, triggerFogPulse, forceReset, currentSlammerType]);

  // RESET ON STATE CHANGE (Fallthrough check)
  useEffect(() => {
    if (gameState === 'AIMING') {
      forceReset();
    }
  }, [gameState, forceReset]);

  // DERIVED DATA
  const slammerData = (SLAMMER_TYPES as any)[currentSlammerType] || SLAMMER_TYPES.standard;

  // MAIN GAME LOOP (Physics Aiming + Tension Zoom + Impact)
  useFrame((_, delta) => {
    if (!rb.current) return;

    // 1. AIMING & POWERING (Kinematic)
    if (gameState === 'AIMING' || gameState === 'POWERING') {
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(aimPlane, aimHit)) {
        intersectPoint.copy(aimHit);
        rb.current.setNextKinematicTranslation({
          x: intersectPoint.x,
          y: 5,
          z: intersectPoint.z
        });
      }

      if (gameState === 'POWERING' && isCharging.current) {
        powerRef.current += delta * debugParams.powerChargeSpeed * directionRef.current;
        if (powerRef.current >= 100) { directionRef.current = -1; powerRef.current = 100; }
        else if (powerRef.current <= 0) { directionRef.current = 1; powerRef.current = 0; }
        setPower(powerRef.current);
        setCameraTension(powerRef.current / 100);
      }
    }

    // 1.5 HARVEST (Kinematic Hover)
    if (gameState === 'HARVEST') {
      const winners = useGameStore.getState().winners;
      const pogs = useGameStore.getState().pogs;
      
      let centerX = 0, centerZ = 0, count = 0;
      
      // Calculate centroid of winners from physics world
      world.forEachRigidBody((body) => {
        const ud = body.userData as any;
        if (ud?.name?.startsWith('pog-') && winners.includes(ud['pog-id'])) {
          const trans = body.translation();
          centerX += trans.x;
          centerZ += trans.z;
          count++;
        }
      });

      if (count > 0) {
        centerX /= count;
        centerZ /= count;
        
        // Ensure Kinematic mode
        rb.current.setBodyType(2, true); 
        
        const currentTrans = rb.current.translation();
        // Smoothly move to hover position
        rb.current.setNextKinematicTranslation({
          x: THREE.MathUtils.lerp(currentTrans.x, centerX, 0.1),
          y: THREE.MathUtils.lerp(currentTrans.y, 4, 0.1),
          z: THREE.MathUtils.lerp(currentTrans.z, centerZ, 0.1)
        });
        
        // Add subtle hover bob
        const bob = Math.sin(Date.now() * 0.005) * 0.1;
        rb.current.setNextKinematicTranslation({
          x: rb.current.translation().x,
          y: 4 + bob,
          z: rb.current.translation().z
        });
      }
    }


    // 2. SLAMMED (Dynamic & Impact Detection)
    if (gameState === 'SLAMMED' && !impactProcessed.current) {
        const currentTension = useGameStore.getState().cameraTension;
        if (currentTension > 0) setCameraTension(Math.max(0, currentTension - delta * 2));

        const pos = rb.current.translation();
        if (pos.y < debugParams.floorPositionY + 1.1) {
            impactProcessed.current = true;
            const currentPower = slamPowerRef.current;
            const impactPos = rb.current.translation();
            const slammerData = (SLAMMER_TYPES as any)[currentSlammerType] || SLAMMER_TYPES.standard;
            
            // ENGINE: ATOMIC TRIGGER
            // Now performs the eruption sweep and freeze in a single atomic cycle
            cinematicEngine.triggerCinematic(
              world, 
              impactPos, 
              currentPower, 
              slammerData.mass, 
              debugParams
            );
            
            shakeIntensity.current = currentPower * 0.02 * debugParams.cinematicCometShakeIntensity;
        }
    }

    // 3. VISUAL POLISH (Scale & Opacity)
    if (mesh.current && materialRef.current) {
        const s = 1 + (useGameStore.getState().power / 100) * debugParams.slammerScaleBoost;
        mesh.current.scale.set(s, s, s);
        materialRef.current.transparent = true;
        materialRef.current.opacity = gameState === 'SLAMMED' ? 1.0 : debugParams.slammerOpacity;
        materialRef.current.depthWrite = gameState === 'SLAMMED';
    }

    // 4. CAMERA SHAKE DECAY
    if (shakeIntensity.current > 0.001) {
        camera.position.x += (Math.random() - 0.5) * shakeIntensity.current;
        camera.position.y += (Math.random() - 0.5) * shakeIntensity.current;
        shakeIntensity.current *= shakeDecay.current;
    }
  });

  return (
    <RigidBody 
      ref={rb}
      type="kinematicPosition"
      colliders={false}
      mass={slammerData.mass}
      restitution={debugParams.slammerRestitution}
      position={[0, 8, 0]}
    >
      <CylinderCollider args={[0.125, 0.8125]} />
      <mesh ref={mesh}>
        <cylinderGeometry args={[0.8125, 0.8125, 0.25, 32]} />
        <meshStandardMaterial ref={materialRef} />
      </mesh>
    </RigidBody>
  );
}







