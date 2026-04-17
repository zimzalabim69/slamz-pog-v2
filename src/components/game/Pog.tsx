import { RigidBody, CylinderCollider, RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';
import { useRef, useEffect, memo, useMemo } from 'react';
import { getMaterialFromRegistry } from '../../utils/TextureGenerator';
import { cinematicEngine } from '../../systems/CinematicEngine';
import * as THREE from 'three';

// Removed debug logs for cleaner console


interface PogProps {
  id: string;
  theme: string;
  rarity: 'standard' | 'shiny' | 'holographic';
  position: [number, number, number];
  rotation: [number, number, number];
}

export const Pog = memo(({ id, theme, rarity, position, rotation }: PogProps) => {
  const rb = useRef<RapierRigidBody>(null);
  const debugParams = useGameStore((state) => state.debugParams);
  

  const materials = useMemo(() => {
    const mat = getMaterialFromRegistry('pog', 'metal', theme, rarity);
        const materialList = (Array.isArray(mat) ? mat : [mat]).filter(
      (material): material is THREE.MeshStandardMaterial =>
        typeof material === 'object' && material !== null && 'metalness' in material && 'roughness' in material
    );

    materialList.forEach((material) => {
      material.metalness = debugParams.pogMetalness;
      material.roughness = debugParams.pogRoughness;
      material.depthWrite = true;
      material.depthTest = true;
    });

    return mat;
  }, [theme, rarity, debugParams.pogMetalness, debugParams.pogRoughness]);
  
  const userData = useMemo(() => ({ name: `pog-${id}`, theme, rarity, 'pog-id': id }), [id, theme, rarity]);

  useEffect(() => {
    if (rb.current) {
      rb.current.setLinearDamping(debugParams.pogLinearDamping);
      rb.current.setAngularDamping(debugParams.pogAngularDamping);
    }
  }, [debugParams.pogLinearDamping, debugParams.pogAngularDamping]);

  useEffect(() => {
    if (rb.current) {
      rb.current.userData = userData;
    }
  }, [userData]);

  const faceDownQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    return { x: q.x, y: q.y, z: q.z, w: q.w };
  }, []);

  useEffect(() => {
    if (rb.current) {
      rb.current.setTranslation({ x: position[0], y: position[1], z: position[2] }, true);
      rb.current.setRotation(faceDownQuat, true);
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [position, rotation, faceDownQuat]);

  const gameState = useGameStore((state) => state.gameState);
  const globalDampingScale = useGameStore((state) => state.globalDampingScale);
  
  // Track cinematic state changes with a manual update loop
  useFrame(() => {
    if (!rb.current) return;
    
    // In Volcanic mode, POGs stay Dynamic during the Bullet Time orbit
    if (cinematicEngine.isCinematicActive) {
      if (rb.current.bodyType() !== 0) {
        rb.current.setBodyType(0, true); // 0 = Dynamic
      }
      return;
    }

    // After cinematic ends, follow gameState
    if (gameState === 'SLAMMED') {
      if (rb.current.bodyType() !== 0) {
        rb.current.setBodyType(0, true); // 0 = Dynamic
      }
    } else if (gameState === 'AIMING') {
      if (rb.current.bodyType() !== 2) {
        rb.current.setBodyType(2, true); // 2 = KinematicPositionBased
      }
    }
  });

  // VOLCANIC DAMPING & VELOCITY GOVERNOR LOOP
  const setPeakVelocity = useGameStore((state) => state.setPeakVelocity);
  
        useFrame(() => {
    if (!rb.current) return;

    // VOLCANIC DAMPING (Slow-Mo Simulation during cinematic)
    if (cinematicEngine.isCinematicActive && globalDampingScale > 0) {
      rb.current.setLinearDamping(globalDampingScale);
      rb.current.setAngularDamping(globalDampingScale);
    } else {
      rb.current.setLinearDamping(debugParams.pogLinearDamping);
      rb.current.setAngularDamping(debugParams.pogAngularDamping);
    }

    // Peak velocity tracking
    const linvel = rb.current.linvel();
    const velocityMagnitude = Math.sqrt(linvel.x ** 2 + linvel.y ** 2 + linvel.z ** 2);
    
    if (velocityMagnitude > 0.01) {
      setPeakVelocity(velocityMagnitude);
    }

    // Velocity cap ONLY during cinematic (prevents nuclear launch during bullet time)
    // Once cinematic ends, let physics run naturally
    if (cinematicEngine.isCinematicActive && velocityMagnitude > debugParams.pogMaxVelocity * 1.5) {
      const scale = (debugParams.pogMaxVelocity * 1.5) / velocityMagnitude;
      rb.current.setLinvel({
        x: linvel.x * scale,
        y: linvel.y * scale,
        z: linvel.z * scale
      }, true);
    }
  });

  return (
    <RigidBody 
      ref={rb}
      type="kinematicPosition"
      position={position} 
      rotation={[Math.PI, 0, 0]}
      colliders={false}
      mass={debugParams.pogMass}
      restitution={debugParams.pogRestitution}
      friction={debugParams.pogFriction}
      linearDamping={debugParams.pogLinearDamping}
      angularDamping={debugParams.pogAngularDamping}
      canSleep
    >
      <CylinderCollider args={[0.0245, 0.814]} />
      <mesh material={materials} scale={debugParams.pogScale}>
        <cylinderGeometry args={[0.814, 0.814, 0.049, 32]} />
      </mesh>
    </RigidBody>
  );
});

Pog.displayName = 'Pog';











