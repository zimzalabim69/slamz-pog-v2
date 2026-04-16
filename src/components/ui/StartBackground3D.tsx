import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

export function StartBackground3D() {
  const groupRef = useRef<THREE.Group>(null);
  const debugParams = useGameStore((state) => state.debugParams);

  // Load the background GLB
  const { scene } = useGLTF('/assets/slamz_logo_bg.glb');

  // Apply position, scale, and rotation from debugParams
  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(
      debugParams.bgPositionX,
      debugParams.bgPositionY,
      debugParams.bgPositionZ
    );
    groupRef.current.scale.setScalar(debugParams.bgScale);
    groupRef.current.rotation.x = debugParams.bgRotationX;
    groupRef.current.rotation.y = debugParams.bgRotationY;
    groupRef.current.rotation.z = debugParams.bgRotationZ;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene.clone()} />
    </group>
  );
}

// Preload
useGLTF.preload('/assets/slamz_logo_bg.glb');
