import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

type WraithContext = 'start' | 'arena';

interface SlamzWraithProps {
  /** Which set of debug params to read from.
   *  - 'start'  → wraith* params (StartScreen instance, default)
   *  - 'arena'  → wraithArena* params (Cyber Alley instance)
   */
  context?: WraithContext;
}

export function SlamzWraith({ context = 'start' }: SlamzWraithProps = {}) {
  const groupRef = useRef<THREE.Group>(null);
  const debugParams = useGameStore((state) => state.debugParams);

  // Load the Wraith GLB model
  const { scene } = useGLTF('/assets/Slamz_Wraith.glb');

  useFrame((state) => {
    if (!groupRef.current) return;

    // 1. Core Transform from Debug Sliders (context-aware)
    if (context === 'arena') {
      groupRef.current.position.set(
        debugParams.wraithArenaPositionX,
        debugParams.wraithArenaPositionY,
        debugParams.wraithArenaPositionZ
      );
      groupRef.current.scale.setScalar(debugParams.wraithArenaScale);
      groupRef.current.rotation.y = debugParams.wraithArenaRotationY;
    } else {
      groupRef.current.position.set(
        debugParams.wraithPositionX,
        debugParams.wraithPositionY,
        debugParams.wraithPositionZ
      );
      groupRef.current.scale.setScalar(debugParams.wraithScale);
      groupRef.current.rotation.y = debugParams.wraithRotationY;
    }

    // 2. Procedural Hover Animation (Zero-G Life) — applied in both contexts
    const time = state.clock.getElapsedTime();
    const hoverY = Math.sin(time * 0.8) * 0.15;
    const hoverRotZ = Math.cos(time * 0.5) * 0.05;

    groupRef.current.position.y += hoverY;
    groupRef.current.rotation.z = hoverRotZ;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene.clone()} />
    </group>
  );
}

// Preload the model
useGLTF.preload('/assets/Slamz_Wraith.glb');