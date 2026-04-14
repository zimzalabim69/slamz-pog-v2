// ============================================================
// GHOST HAND — Visual preview above slammer during aiming
// ============================================================

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function GhostHand() {
  const groupRef = useRef<THREE.Group>(null);
  const gameState = useGameStore((s) => s.gameState);

  useFrame(({ mouse, camera }) => {
    if (!groupRef.current) return;
    
    groupRef.current.visible = gameState === 'AIMING' || gameState === 'POWERING';
    
    if (!groupRef.current.visible) return;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(floorPlane, target);
    
    if (target) {
      groupRef.current.position.set(target.x, 5, target.z);
      groupRef.current.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Simple hand indicator - box for now */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.15]} />
        <meshStandardMaterial color="#00ffcc" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
