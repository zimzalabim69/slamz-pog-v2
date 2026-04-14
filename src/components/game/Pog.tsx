import { RigidBody, RoundCuboidCollider, RapierRigidBody } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';
import { useRef, useEffect, memo, useMemo } from 'react';
import { getMaterialFromRegistry } from '../../utils/TextureGenerator';
import * as THREE from 'three';


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
  
  // Memoize materials to prevent recreation on every render
  const materials = useMemo(() => {
    const mat = getMaterialFromRegistry('pog', 'metal', theme, rarity);
    // Apply debug material properties
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
  
  // Memoize userData to prevent unnecessary updates
  const userData = useMemo(() => ({ name: `pog-${id}`, theme, rarity }), [id, theme, rarity]);

  
  // Update physics properties when debug params change
  useEffect(() => {
    if (rb.current) {
      rb.current.setLinearDamping(debugParams.pogLinearDamping);
      rb.current.setAngularDamping(debugParams.pogAngularDamping);
      // Mass, restitution, friction require recreating the collider
      // These will apply on next pog spawn/reset
    }
  }, [debugParams.pogLinearDamping, debugParams.pogAngularDamping]);
  // Set userData on the rigid body so GameController can identify this pog
  useEffect(() => {
    if (rb.current) {
      rb.current.userData = userData;
    }
  }, [userData]);

  // Update position/rotation for object pooling
  // Face-down: rotate PI around X so design (top cap) faces floor
  const faceDownQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI);
    return { x: q.x, y: q.y, z: q.z, w: q.w };
  }, []);

  useEffect(() => {
    if (rb.current) {
      rb.current.setTranslation({ x: position[0], y: position[1], z: position[2] }, true);
      rb.current.setRotation(faceDownQuat, true);
      // Reset velocities when position changes (for resetStack)
      rb.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      rb.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [position, rotation, faceDownQuat]);

  return (
    <RigidBody 
      ref={rb}
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
      {/* Stable RoundCuboid for discs: [halfX, halfY, halfZ, borderRadius] */}
      <RoundCuboidCollider args={[0.5, 0.02, 0.5, 0.025]} />
      <mesh material={materials} scale={debugParams.pogScale}>
        <cylinderGeometry args={[0.55, 0.55, 0.09, 20]} />
      </mesh>
    </RigidBody>
  );
});

Pog.displayName = 'Pog';





