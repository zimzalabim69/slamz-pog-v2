// ============================================================
// RETICLE — Aiming indicator (RingGeometry)
// ============================================================

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function Reticle() {
  const meshRef = useRef<THREE.Mesh>(null);
  const gameState = useGameStore((s) => s.gameState);

  useFrame(({ mouse, camera }) => {
    if (!meshRef.current) return;
    
    // Only show during AIMING and POWERING
    meshRef.current.visible = gameState === 'AIMING' || gameState === 'POWERING';
    
    if (!meshRef.current.visible) return;

    // Raycast from camera to floor
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.01); // Floor is at y=-0.01
    const target = new THREE.Vector3();
    raycaster.ray.intersectPlane(floorPlane, target);
    
    if (target) {
      meshRef.current.position.set(target.x, -0.005, target.z); // Just above floor surface
    }
  });

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.1, 0.15, 32]} />
      <meshBasicMaterial color="#00ffcc" transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}

