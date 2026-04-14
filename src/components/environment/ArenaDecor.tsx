import { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { SCENE_PRESETS } from '../../constants/game';
import { useTexture } from '@react-three/drei';

export function ArenaDecor() {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;
  
  const matTexture = useTexture('/assets/pog_mat.png');
  matTexture.wrapS = matTexture.wrapT = THREE.RepeatWrapping;
  matTexture.repeat.set(2, 2);

  const ghostPogs = useMemo(() => {
    const props = [];
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 7 + Math.random() * 8;
      props.push({
        position: [Math.cos(angle) * dist, 0.05, Math.sin(angle) * dist] as [number, number, number],
        rotation: [Math.random() * 0.1, Math.random() * Math.PI, Math.random() * 0.1] as [number, number, number],
        scale: 0.8 + Math.random() * 0.4
      });
    }
    return props;
  }, []);

  return (
    <group>
      {/* DECORATIVE OUTER MATS */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 16;
        return (
          <mesh 
            key={i} 
            rotation={[-Math.PI / 2, 0, 0]} 
            position={[Math.cos(angle) * radius, 0.01, Math.sin(angle) * radius] as [number, number, number]}
          >
            <planeGeometry args={[8, 8]} />
            <meshStandardMaterial 
              map={matTexture} 
              transparent 
              opacity={0.4} 
              color={preset.floorEmissive}
            />
          </mesh>
        );
      })}

      {/* GHOST POGS (SCATTERED) */}
      {ghostPogs.map((p, i) => (
        <mesh key={i} position={p.position} rotation={p.rotation} scale={p.scale}>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 16]} />
          <meshStandardMaterial color={preset.floorEmissive} roughness={0.5} metalness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
