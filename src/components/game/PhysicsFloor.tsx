// ============================================================
// PHYSICS FLOOR — Invisible collision plane
// ============================================================

import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';

export function PhysicsFloor() {
  const debugParams = useGameStore((state) => state.debugParams);
  return (
    <RigidBody type="fixed" colliders={false} position={[0, -0.01 + debugParams.floorPositionY, 0]}>
      {/* Thin collision plane — top surface at y=-0.01 to match Arena mat */}
      <CuboidCollider args={[25, 0.005, 25]} position={[0, -0.005, 0]} />
    </RigidBody>
  );
}
