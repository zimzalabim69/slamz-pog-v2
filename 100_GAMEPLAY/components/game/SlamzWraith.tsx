import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '@100/store/useGameStore';

interface Props {
  context?: 'start' | 'arena';
}

export function SlamzWraith({ context = 'arena' }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const debugParams = useGameStore((state) => state.debugParams);
  const isCinematicActive = useGameStore((state) => state.isCinematicActive);
  const bulletTimeActive = useGameStore((state) => state.bulletTimeActive);

  // Load the original model once
  const gltf = useGLTF('/assets/glbs/Slamz_Wraith.glb');

  // Create a fresh clone for THIS specific instance
  const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

  // THE EXACT GHOST WIREFRAME MATERIAL
  const ghostWireframeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00ffff',
    wireframe: true,
    transparent: true,
    opacity: context === 'start' ? 0.95 : 0.75, // Higher visibility on start screen
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), [context]);

  useEffect(() => {
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        if (context === 'arena') {
          child.material = ghostWireframeMat;
        }
        child.visible = true;
      }
    });
  }, [clonedScene, ghostWireframeMat, context]);

  useFrame((state) => {
    if (!groupRef.current) return;

    const isGhostMode = context === 'arena' && isCinematicActive && bulletTimeActive;

    // Visibility logic
    if (context === 'arena') {
      groupRef.current.visible = isGhostMode;
    } else {
      groupRef.current.visible = true; // Always visible on start screen
    }

    if (context === 'arena' && isGhostMode) {
      // Arena: Wireframe ghost slammer during bullet-time
      groupRef.current.position.set(
        debugParams.wraithArenaPositionX ?? 2,
        debugParams.wraithArenaPositionY ?? 8.5,
        debugParams.wraithArenaPositionZ ?? -7
      );
      groupRef.current.scale.setScalar(debugParams.wraithArenaScale ?? 15);

      const t = state.clock.elapsedTime;
      groupRef.current.position.y += Math.sin(t * 11) * 0.2;
      groupRef.current.rotation.y = t * 2.5;

    } else if (context === 'start') {
      // Start screen: Normal Wraith (Solid)
      groupRef.current.position.set(
        debugParams.wraithPositionX ?? 0,
        debugParams.wraithPositionY ?? 0,
        debugParams.wraithPositionZ ?? 0
      );
      groupRef.current.scale.setScalar(debugParams.wraithScale ?? 1);
      groupRef.current.rotation.y = debugParams.wraithRotationY ?? 0;
      
      // Ambient floating for start screen
      const t = state.clock.elapsedTime;
      groupRef.current.position.y += Math.sin(t * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload('/assets/glbs/Slamz_Wraith.glb');
