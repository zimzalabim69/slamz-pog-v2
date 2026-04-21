// ============================================================
// GHOST HAND — Visual preview above slammer during aiming
// ============================================================

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@100/store/useGameStore';

// Reusable objects — never allocate in useFrame
const _raycaster = new THREE.Raycaster();
const _floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const _target = new THREE.Vector3();
const _upAxis = new THREE.Vector3(0, 1, 0);

export function GhostHand() {
  const groupRef = useRef<THREE.Group>(null);
  const gameState = useGameStore((s) => s.gameState);

  useFrame(({ mouse, camera }) => {
    if (!groupRef.current) return;
    
    groupRef.current.visible = gameState === 'AIMING' || gameState === 'POWERING';
    if (!groupRef.current.visible) return;

    _raycaster.setFromCamera(mouse, camera);
    _raycaster.ray.intersectPlane(_floorPlane, _target);
    
    if (_target) {
      groupRef.current.position.set(_target.x, 5, _target.z);
      groupRef.current.quaternion.setFromAxisAngle(_upAxis, Math.PI);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.15]} />
        <meshStandardMaterial color="#00ffcc" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
