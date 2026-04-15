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
  
  // Runtime tracking for manual drift
  const currentPos = useRef(new THREE.Vector3());
  const currentRot = useRef(new THREE.Quaternion());

  // Add slight restitution variation per pog
  const restitution = useMemo(() => 
    debugParams.pogRestitution + (Math.random() - 0.5) * 0.1, 
    [debugParams.pogRestitution]
  );
  
  const materials = useMemo(() => {
    const mat = getMaterialFromRegistry('pog', 'metal', theme, rarity);
    if (Array.isArray(mat)) {
      mat.forEach(m => {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.metalness = debugParams.pogMetalness;
          m.roughness = debugParams.pogRoughness;
        }
      });
    } else if (mat instanceof THREE.MeshStandardMaterial) {
      mat.metalness = debugParams.pogMetalness;
      mat.roughness = debugParams.pogRoughness;
    }
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
  
  useEffect(() => {
    if (!rb.current) return;
    
    // During manual cinematic, we force kinematic to prevent physics interference
    if (cinematicEngine.isCinematicActive) {
      rb.current.setBodyType(2, true); // 2 = KinematicPositionBased
      return;
    }

    if (gameState === 'SLAMMED') {
      rb.current.setBodyType(0, true); // 0 = Dynamic
    } else if (gameState === 'AIMING' || gameState === 'RESETTING') {
      rb.current.setBodyType(2, true); // 2 = KinematicPositionBased
    }
  }, [gameState]);

  // MANUAL MATRIX DRIFT LOOP
  useFrame((_state, delta) => {
    if (!rb.current) return;

    if (cinematicEngine.isCinematicActive && cinematicEngine.manualDriftScale > 0) {
      const p = rb.current.translation();
      currentPos.current.set(p.x, p.y, p.z);
      
      const constraint = cinematicEngine.calculateConstrainedDrift(id, currentPos.current, delta);
      if (constraint) {
        // 1. Position Drift
        currentPos.current.add(constraint.drift);
        rb.current.setNextKinematicTranslation(currentPos.current);

        // 2. Rotation Drift
        const r = rb.current.rotation();
        currentRot.current.set(r.x, r.y, r.z, r.w);
        
        const euler = new THREE.Euler(constraint.angDrift.x, constraint.angDrift.y, constraint.angDrift.z);
        const qDelta = new THREE.Quaternion().setFromEuler(euler);
        
        currentRot.current.multiply(qDelta);
        rb.current.setNextKinematicRotation(currentRot.current);
      }
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
      <CylinderCollider args={[0.045, 0.55]} />
      <mesh material={materials} scale={debugParams.pogScale}>
        <cylinderGeometry args={[0.55, 0.55, 0.09, 20]} />
      </mesh>
    </RigidBody>
  );
});

Pog.displayName = 'Pog';

Pog.displayName = 'Pog';





