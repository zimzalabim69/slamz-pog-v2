import { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody, CylinderCollider, useRapier } from '@react-three/rapier';
import { useGameStore } from '@100/store/useGameStore';
import { GAME_CONFIG } from '@100/constants/gameConfig';
import { generateGlowTexture } from '@500/utils/TextureGenerator';
import * as THREE from 'three';
import { SLAMMER_TYPES } from '@100/constants/slammerTypes';
import { cinematicEngine } from '@400/systems/CinematicEngine';

// --- SLAMMER SHARD (The Cube Explosion Thing) ---
const cubeGeom = new THREE.BoxGeometry(0.3, 0.3, 0.3);

function SlammerShard({ position, color }: { position: [number, number, number], color: string }) {
  const rb = useRef<RapierRigidBody>(null);
  const [opacity, setOpacity] = useState(0.8);

  useEffect(() => {
    if (rb.current) {
      rb.current.applyImpulse({
        x: (Math.random() - 0.5) * 0.15,
        y: Math.random() * 0.15,
        z: (Math.random() - 0.5) * 0.15
      }, true);
    }
  }, []);

  useFrame((_, delta) => {
    if (opacity > 0) setOpacity(prev => Math.max(0, prev - delta * 0.4));
  });

  return (
    <RigidBody ref={rb} position={position} colliders="cuboid">
      <mesh geometry={cubeGeom}>
        <meshBasicMaterial 
          color={color} 
          wireframe={true} 
          transparent={true} 
          opacity={opacity} 
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </RigidBody>
  );
}

function GlowHalo({ color, opacity }: { color: string, opacity: number }) {
  const glowTex = useMemo(() => generateGlowTexture(), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <planeGeometry args={[2.5, 2.5]} />
      <meshBasicMaterial 
        map={glowTex} 
        color={color} 
        transparent 
        opacity={opacity * 0.5} 
        blending={THREE.AdditiveBlending} 
        depthWrite={false} 
      />
    </mesh>
  );
}

/**
 * THE PRO-TOUR SLAMMER (V2.1 - Decoupled)
 * handles input, physics-mode switching, and camera tension zoom.
 */
export function Slammer() {
  const rb = useRef<RapierRigidBody>(null);
  const mesh = useRef<THREE.Mesh>(null);

  // GHOST WIREFRAME MATERIAL — MeshBasicMaterial: pure color, no lighting needed
  const ghostMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00ffff',
    wireframe: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  // Keep materialRef pointing at ghostMat so useFrame mutations still work
  const materialRef = useRef<THREE.MeshBasicMaterial>(ghostMat);
  const { mouse, raycaster, camera } = useThree();
  const { world } = useRapier();
  
  // Store state and actions
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const setPower = useGameStore((state) => state.setPower);
  const currentSlammerType = useGameStore((state) => state.currentSlammerType);
  const triggerFogPulse = useGameStore((state) => state.triggerFogPulse);
  const triggerImpactFlash = useGameStore((state) => state.triggerImpactFlash);
  const debugParams = useGameStore((state) => state.debugParams);
  const setCameraTension = (v: number) => useGameStore.setState({ cameraTension: v });
  
  // Explosion state
  const [shards, setShards] = useState<{ id: number, pos: [number, number, number] }[]>([]);
  const [isExploded, setIsExploded] = useState(false);

  // Internal Refs for performance (no re-renders)
  const impactProcessed = useRef(false);
  const slamPowerRef = useRef(0);
  const powerRef = useRef(0);
  const directionRef = useRef(1); // 1 = up, -1 = down
  const isCharging = useRef(false);
  const shakeIntensity = useRef(0);
  const shakeDecay = useRef(0.9);

  // High-Fidelity Mechanics Refs
  const smoothedPos = useRef(new THREE.Vector3(0, 5.5, 0));
  const targetPos = useRef(new THREE.Vector3(0, 5.5, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const lastPos = useRef(new THREE.Vector3(0, 5.5, 0));

  // Pre-allocated math objects (Perf Rule: No 'new' in useFrame)
  const aimHit = useMemo(() => new THREE.Vector3(), []);
  const aimPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.7), []);
  const intersectPoint = useMemo(() => new THREE.Vector3(), []);

  const resetCooldown = useRef(0);
  
  // EXPLICIT PHYSICS RESET
  const forceReset = useCallback(() => {
    // Prevent reset-hammering (min 100ms between forced resets)
    const now = Date.now();
    if (now - resetCooldown.current < 100) return;
    resetCooldown.current = now;

    if (rb.current) {
      
      rb.current.setBodyType(2, true); // 2 = Kinematic
      rb.current.setTranslation({ x: 0, y: 5, z: 0 }, true);
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
      impactProcessed.current = false;
      isCharging.current = false;
      setCameraTension(0);
      setShards([]);
      setIsExploded(false);
    }
  }, [setCameraTension]);

  // Ghost color shifts with slammer type
  useEffect(() => {
    const colors: Record<string, string> = {
      standard:      '#00ffff',
      heavy_metal:   '#ff00ff',
      slamzer_street: '#ffff00',
    };
    ghostMat.color.set(colors[currentSlammerType] || '#00ffff');
  }, [currentSlammerType, ghostMat]);
  
  // Initialization reset
  useEffect(() => {
    forceReset();
  }, []); // Only on mount

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
        let slamForce = -(slammerData.mass * slamSpeed * debugParams.slamForceMultiplier);

        // V2.0 SWEET SPOT: 98% - 100% Perfect Slam Boost
        if (finalPower >= 98) {
          slamForce *= 2.2; // Massive kinetic boost for the perfect hit
          
        }

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
    
    // ATOMIC HIT-STOP: Freeze everything during the 'crunch' phase
    if (useGameStore.getState().hitStopActive) return;

    // 1. AIMING & POWERING (Kinematic with Inertial Follow)
    if (gameState === 'AIMING' || gameState === 'POWERING') {
      raycaster.setFromCamera(mouse, camera);
      if (raycaster.ray.intersectPlane(aimPlane, aimHit)) {
        targetPos.current.copy(aimHit);
        
        // Inertial Smoothing (AAAA Weight)
        smoothedPos.current.lerp(targetPos.current, 0.18);
        
        rb.current.setNextKinematicTranslation({
          x: smoothedPos.current.x,
          y: 5.5, // Slightly higher for better visual clearance
          z: smoothedPos.current.z
        });

        // Calculate Velocity for Sway
        velocity.current.subVectors(smoothedPos.current, lastPos.current).divideScalar(delta);
        lastPos.current.copy(smoothedPos.current);
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
      const slamz = useGameStore.getState().slamz;
      
      let centerX = 0, centerZ = 0, count = 0;
      
      // Calculate centroid of winners from physics world
      world.forEachRigidBody((body) => {
        const ud = body.userData as any;
        if (ud?.name?.startsWith('slamz-') && winners.includes(ud['slamz-id'])) {
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
            triggerImpactFlash();

            // TRIGGER CUBE EXPLOSION
            const shardCount = 16;
            const newShards = Array.from({ length: shardCount }).map((_, i) => ({
              id: Date.now() + i,
              pos: [impactPos.x, impactPos.y + 0.5, impactPos.z] as [number, number, number]
            }));
            setShards(newShards);
            setIsExploded(true);
        }
    }

    // 3. VISUAL POLISH (Squash & Stretch + Angular Sway)
    if (mesh.current && materialRef.current) {
        // Base scale from power
        const p = useGameStore.getState().power / 100;
        let scaleX = 1 + p * debugParams.slammerScaleBoost;
        let scaleY = 1 + p * debugParams.slammerScaleBoost;
        let scaleZ = 1 + p * debugParams.slammerScaleBoost;

        if (gameState === 'POWERING') {
          // Squash: Y shrinks, X/Z expands
          scaleY *= (1 - p * 0.3);
          scaleX *= (1 + p * 0.15);
          scaleZ *= (1 + p * 0.15);
        } else if (gameState === 'SLAMMED' && !impactProcessed.current) {
          // Stretch: Y expands during vertical fall
          const linvel = rb.current.linvel();
          const speed = Math.abs(linvel.y);
          const stretch = Math.min(speed * 0.02, 0.6);
          scaleY *= (1 + stretch);
          scaleX *= (1 - stretch * 0.5);
          scaleZ *= (1 - stretch * 0.5);
        }

        mesh.current.scale.set(scaleX, scaleY, scaleZ);

        // Angular Sway (Tilt into movement)
        if (gameState === 'AIMING' || gameState === 'POWERING') {
          const tiltX = THREE.MathUtils.clamp(velocity.current.z * 0.05, -0.2, 0.2);
          const tiltZ = THREE.MathUtils.clamp(-velocity.current.x * 0.05, -0.2, 0.2);
          mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, tiltX, 0.1);
          mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, tiltZ, 0.1);
        }

        materialRef.current.transparent = true;
        // Pulse opacity when aiming/powering
        const pulse = (gameState === 'AIMING' || gameState === 'POWERING') 
          ? 0.6 + Math.sin(Date.now() * 0.008) * 0.2
          : 1.0;
        materialRef.current.opacity = gameState === 'SLAMMED' ? 1.0 : pulse;
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
      type={gameState === 'SLAMMED' ? 'dynamic' : 'kinematicPosition'}
      colliders={false}
      mass={slammerData.mass}
      restitution={debugParams.slammerRestitution}
      position={[0, 5.5, 0]}
    >
      {!isExploded && <CylinderCollider args={[0.125, 0.8125]} />}
      <mesh ref={mesh} material={ghostMat} visible={!isExploded}>
        <cylinderGeometry args={[0.8125, 0.8125, 0.25, 32]} />
      </mesh>
      
      {/* RENDER SHARDS */}
      {shards.map(s => (
        <SlammerShard key={s.id} position={s.pos} color={ghostMat.color.getStyle()} />
      ))}
    </RigidBody>
  );
}







