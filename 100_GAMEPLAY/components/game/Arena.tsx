import { useGameStore } from '@100/store/useGameStore';
import { SCENE_PRESETS } from '@100/constants/game';
import { useTexture, useGLTF } from '@react-three/drei';
import { RigidBody, CylinderCollider } from '@react-three/rapier';
import * as THREE from 'three';

export function Arena() {
  const preset = SCENE_PRESETS.CYBER_ALLEY;
  const debugParams = useGameStore((state) => state.debugParams);
  const floorY = debugParams.floorPositionY || -0.01;
  
  // 1. Load original prototype texture
  const texture = useTexture('/assets/slamz_mat.png');
  texture.anisotropy = 4;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  // 2. Load High-Fidelity GLB Assets
  const battleArea = useGLTF('/assets/glbs/Slamz_Neon_Battle_Area.glb');
  const floorSkin = useGLTF('/assets/glbs/Slamz_Rug.glb');
  const arenaRoom = useGLTF('/assets/glbs/slamz_logo_bg.glb');

  return (
    <group>
      {/* ARENA ROOM (Total Environment) */}
      {debugParams.arenaRoomVisible && (
        <primitive 
          object={arenaRoom.scene} 
          scale={debugParams.arenaRoomScale}
          position={[
            debugParams.arenaRoomPositionX,
            debugParams.arenaRoomPositionY,
            debugParams.arenaRoomPositionZ
          ]}
          rotation={[
            debugParams.arenaRoomRotationX,
            debugParams.arenaRoomRotationY,
            debugParams.arenaRoomRotationZ
          ]}
        />
      )}

      {/* CLOUD FLOOR SKIN (The Rug) */}
      {debugParams.arenaFloorSkinVisible && (
        <primitive 
          object={floorSkin.scene} 
          scale={debugParams.arenaFloorSkinScale}
          position={[
            debugParams.arenaFloorSkinPositionX,
            debugParams.arenaFloorSkinPositionY,
            debugParams.arenaFloorSkinPositionZ
          ]}
          rotation={[
            debugParams.arenaFloorSkinRotationX,
            debugParams.arenaFloorSkinRotationY,
            debugParams.arenaFloorSkinRotationZ
          ]}
        />
      )}

      {/* MAIN PLAYING SURFACE (Option B: Cinema Mesh) */}
      {debugParams.battleAreaVisible && (
        <primitive 
          object={battleArea.scene} 
          scale={debugParams.battleAreaScale}
          position={[
            debugParams.battleAreaPositionX,
            debugParams.battleAreaPositionY,
            debugParams.battleAreaPositionZ
          ]}
          rotation={[
            debugParams.battleAreaRotationX,
            debugParams.battleAreaRotationY,
            debugParams.battleAreaRotationZ
          ]}
        />
      )}

      {/* PHYSICAL GROUND COLLIDER — The immovable truth */}
      <RigidBody type="fixed" colliders={false} position={[0, debugParams.groundPhysicalOffset || 0.05, 0]}>
        {/* OPTION A fallback (Primitive) — wired to 'floorVisible' toggle */}
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
        
        {/* The single, stable ground collider. Calibrated for 0.0 mass regulation pogs. */}
        <CylinderCollider args={[0.5, 6]} position={[0, -0.5, 0]} />

        {/* Visual Debug Helper */}
        {debugParams.showGroundCollider && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
            <circleGeometry args={[6.1, 64]} />
            <meshStandardMaterial color="#00ff00" wireframe transparent opacity={0.8} />
          </mesh>
        )}
      </RigidBody>

      {/* BACKPLANE (Dark Void) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#0c0614" />
      </mesh>
    </group>
  );
}
