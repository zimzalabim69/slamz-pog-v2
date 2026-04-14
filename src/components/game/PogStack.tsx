import { useGameStore } from '../../store/useGameStore';
import { Pog } from './Pog';

/**
 * POG STACK COMPONENT (Phase 3: Pre-populated)
 * This component now renders exactly what is in the store.
 * Spawning logic is handled during the initial registry phase
 * to ensure maximum physics stability.
 */
export function PogStack() {
  const pogs = useGameStore((state) => state.pogs);

  return (
    <>
      {pogs.map((pog) => (
        <Pog key={pog.id} {...pog} />
      ))}
    </>
  );
}
