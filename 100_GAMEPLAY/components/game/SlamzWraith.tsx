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

  // Wireframe material ONLY for the arena ghost slammer
  const ghostMat = useRef<THREE.MeshStandardMaterial | null>(null);

  useEffect(() => {
    // If we're on the start screen, keep original materials
    if (context === 'start') {
      clonedScene.traverse((child: any) => {
        if (child.isMesh) {
          // You can tweak original material brightness here if needed, 
          // but usually leave as is for "Normal"
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      return;
    }

    // Apply Ghost Material for Arena Cinematic
    if (!ghostMat.current) {
      ghostMat.current = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        wireframe: true,
        transparent: true,
        opacity: 0.75,
        emissive: 0x00ffff,
        emissiveIntensity: 2.8,
        metalness: 0.8,
        roughness: 0.2,
      });
    }

    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.material = ghostMat.current;
      }
    });
  }, [clonedScene, context]);

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