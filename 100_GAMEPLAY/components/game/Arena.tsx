import { useMemo } from 'react';
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
  const battleAreaRaw = useGLTF('/assets/glbs/Slamz_Neon_Battle_Area.glb');
  const arenaRoomRaw = useGLTF('/assets/glbs/slamz_logo_bg.glb');

  // THE EXACT GHOST WIREFRAME MATERIAL
  const ghostWireframeMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00ffff',
    wireframe: true,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  }), []);

  // Process Clones
  const battleArea = useMemo(() => {
    const clone = battleAreaRaw.scene.clone();
    clone.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = ghostWireframeMat; });
    return clone;
  }, [battleAreaRaw, ghostWireframeMat]);

  const arenaRoom = useMemo(() => {
    const clone = arenaRoomRaw.scene.clone();
    clone.traverse(c => { if ((c as THREE.Mesh).isMesh) (c as THREE.Mesh).material = ghostWireframeMat; });
    return clone;
  }, [arenaRoomRaw, ghostWireframeMat]);

  return (
    <group>
      {/* ARENA ROOM (Total Environment) */}
      {debugParams.arenaRoomVisible && (
        <primitive 
          object={arenaRoom} 
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

      {/* MAIN PLAYING SURFACE (The Mat) */}
      {debugParams.battleAreaVisible && (
        <primitive 
          object={battleArea} 
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

      {/* THE GIANT FLOATING SLAMZ (The Floor) */}
      <mesh position={[0, -0.2, 0]} material={ghostWireframeMat}>
        <cylinderGeometry args={[8, 8, 0.4, 64]} />
      </mesh>

      {/* PHYSICAL GROUND COLLIDER — The immovable truth */}
      <RigidBody type="fixed" colliders={false} position={[0, debugParams.groundPhysicalOffset || 0.05, 0]}>
        {/* The single, stable ground collider. Calibrated for 0.0 mass regulation slamzs. */}
        <CylinderCollider args={[0.2, 8]} position={[0, -0.2, 0]} />

        {/* Visual Debug Helper */}
        {debugParams.showGroundCollider && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
            <circleGeometry args={[6.1, 64]} />
            <meshStandardMaterial color="#00ff00" wireframe transparent opacity={0.8} />
          </mesh>
        )}
      </RigidBody>

      {/* BACKPLANE (Dark Void) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial color="#06000f" />
      </mesh>
    </group>
  );
}
