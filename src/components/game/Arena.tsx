import { useGameStore } from '../../store/useGameStore';
import { SCENE_PRESETS } from '../../constants/game';
import { useTexture } from '@react-three/drei';
import { RigidBody, CylinderCollider } from '@react-three/rapier';
import * as THREE from 'three';

export function Arena() {
  const preset = SCENE_PRESETS.CYBER_ALLEY;
  const debugParams = useGameStore((state) => state.debugParams);
  const floorY = debugParams.floorPositionY || -0.01;
  
  // Load original prototype texture
  const texture = useTexture('/assets/slamz_mat.png');
  texture.anisotropy = 4;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <group>
      {/* MAIN PLAYING SURFACE — OPTION A (Reliable Primitive) */}
      <RigidBody type="fixed" colliders={false} position={[0, debugParams.groundPhysicalOffset || 0.05, 0]}>
        {debugParams.floorVisible && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={10}>
            <circleGeometry args={[6, 64]} />
            <meshStandardMaterial 
              map={texture}
              emissiveMap={texture}
              emissive={new THREE.Color(preset.floorEmissive)}
              emissiveIntensity={preset.floorEmissiveIntensity || 1.0}
              color={new THREE.Color(preset.floorColor)}
              transparent={false}
              polygonOffset={true}
              polygonOffsetFactor={-2}
              polygonOffsetUnits={-2}
              depthWrite={true}
              depthTest={true}
            />
          </mesh>
        )}
        {/* The single, stable ground collider. Top surface is at 0.10 */}
        <CylinderCollider args={[0.5, 6]} position={[0, -0.5, 0]} />

        {/* Visual Debug Helper — Wired to [SHOW GROUND FIX] toggle */}
        {debugParams.showGroundCollider && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
            <circleGeometry args={[6.1, 64]} />
            <meshStandardMaterial 
              color="#00ff00" 
              wireframe 
              transparent 
              opacity={0.8}
              emissive="#00ff00"
              emissiveIntensity={2}
            />
          </mesh>
        )}
      </RigidBody>

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
