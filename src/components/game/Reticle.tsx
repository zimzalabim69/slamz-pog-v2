// ============================================================
// RETICLE — Aiming indicator (RingGeometry)
// ============================================================

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

// Reusable objects — never allocate in useFrame
const _raycaster = new THREE.Raycaster();
const _floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.01);
const _target = new THREE.Vector3();

export function Reticle() {
  const meshRef = useRef<THREE.Mesh>(null);
  const gameState = useGameStore((s) => s.gameState);

  useFrame(({ mouse, camera }) => {
    if (!meshRef.current) return;
    
    meshRef.current.visible = gameState === 'AIMING' || gameState === 'POWERING';
    if (!meshRef.current.visible) return;

    _raycaster.setFromCamera(mouse, camera);
    _raycaster.ray.intersectPlane(_floorPlane, _target);
    
    if (_target) {
      meshRef.current.position.set(_target.x, -0.005, _target.z);
    }
  });

  return (
    <mesh ref={meshRef} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.1, 0.15, 32]} />
      <meshBasicMaterial color="#00ffcc" transparent opacity={0.8} side={THREE.DoubleSide} />
    </mesh>
  );
}


