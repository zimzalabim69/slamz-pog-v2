import { useGameStore } from '@100/store/useGameStore';
import { Pog } from './Pog';
import { Ring } from './Ring';

/**
 * POG STACK COMPONENT (Phase 3: Pre-populated)
 * This component now renders exactly what is in the store.
 * Spawning logic is handled during the initial registry phase
 * to ensure maximum physics stability.
 */
export function PogStack() {
  const pogs = useGameStore((state) => state.pogs);

  // Get top POG position for glowing indicator
  const topPogPos = pogs.length > 0 ? pogs[pogs.length - 1]?.position : null;

  return (
    <>
      {pogs.map((pog) => (
        <Pog key={pog.id} {...pog} />
      ))}
      {/* Glowing impact indicator on top POG */}
      {topPogPos && (
        <Ring 
          position={[topPogPos[0], topPogPos[1] + 0.05, topPogPos[2]]} 
          args={[0.1, 0.12, 32]} 
          color="#00ffcc" 
          opacity={0.8} 
        />
      )}
    </>
  );
}
