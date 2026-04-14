import { useGameStore } from '../../store/useGameStore';
import { SCENE_PRESETS } from '../../constants/game';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export function Arena() {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;
  
  // Load original prototype texture
  const texture = useTexture('/assets/slamz_mat.png');
  texture.anisotropy = 4;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <group>
      {/* MAIN PLAYING SURFACE */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[9, 64]} />
        <meshStandardMaterial 
          map={texture}
          emissiveMap={texture}
          emissive={new THREE.Color(preset.floorEmissive)}
          emissiveIntensity={preset.floorEmissiveIntensity || 1.0}
          color={new THREE.Color(preset.floorColor)}
          transparent={false}
        />
      </mesh>

      {/* OUTER GROUND PLANE — visible dark surface under the arena */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#0c0614"
          roughness={0.95}
          metalness={0.1}
          emissive={new THREE.Color(preset.floorEmissive)}
          emissiveIntensity={0.05}
        />
      </mesh>
    </group>
  );
}
