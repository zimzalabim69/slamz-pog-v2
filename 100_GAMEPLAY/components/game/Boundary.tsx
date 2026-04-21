import { RigidBody, MeshCollider } from '@react-three/rapier';
import { useGameStore } from '@100/store/useGameStore';

/**
 * BOUNDARY — Invisible containment cylinder
 * This keeps pogs from flying off the arena mat.
 */
export function Boundary() {
  const debugParams = useGameStore((state) => state.debugParams);
  const floorY = debugParams.floorPositionY || -0.01;

  return (
    <RigidBody type="fixed" colliders={false} position={[0, 1 + floorY, 0]}>
      <MeshCollider type="trimesh">
        <mesh visible={false}>
          <cylinderGeometry args={[6, 6, 4, 32, 1, true]} />
        </mesh>
      </MeshCollider>
    </RigidBody>
  );
}
