// ============================================================
// PHYSICS FLOOR — Invisible collision plane
// ============================================================

import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';

export function PhysicsFloor() {
  const debugParams = useGameStore((state) => state.debugParams);
  return (
    <RigidBody type="fixed" colliders={false} position={[0, -0.05, 0]}>
      {/* Universal safety floor — catches anything that glitches through the primary mat */}
      <CuboidCollider args={[100, 1, 100]} position={[0, -1, 0]} />
    </RigidBody>
  );
}
