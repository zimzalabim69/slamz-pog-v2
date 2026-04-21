import { useGameStore } from '@100/store/useGameStore';
import { Slamz } from './Slamz';
import { Ring } from './Ring';

/**
 * SLAMZ STACK COMPONENT (Phase 3: Pre-populated)
 * This component now renders exactly what is in the store.
 * Spawning logic is handled during the initial registry phase
 * to ensure maximum physics stability.
 */
export function SlamzStack() {
  const slamz = useGameStore((state) => state.slamz);

  // Get top Slamz position for glowing indicator
  const topSlamzPos = slamz.length > 0 ? slamz[slamz.length - 1]?.position : null;

  return (
    <>
      {slamz.map((item) => (
        <Slamz key={item.id} {...item} />
      ))}
      {/* Glowing impact indicator on top Slamz */}
      {topSlamzPos && (
        <Ring 
          position={[topSlamzPos[0], topSlamzPos[1] + 0.05, topSlamzPos[2]]} 
          args={[0.1, 0.12, 32]} 
          color="#00ffcc" 
          opacity={0.8} 
        />
      )}
    </>
  );
}

