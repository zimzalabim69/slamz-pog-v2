// ============================================================
// PHYSICS FLOOR — Invisible collision plane
// ============================================================

import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';

export function PhysicsFloor() {
  const debugParams = useGameStore((state) => state.debugParams);
  return (
    <RigidBody type="fixed" colliders={false} position={[0, -0.01 + debugParams.floorPositionY, 0]}>
      {/* Solid collision floor — top surface at x.floorY */}
      <CuboidCollider args={[25, 1, 25]} position={[0, -1, 0]} />
    </RigidBody>
  );
}
