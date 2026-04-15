import * as React from 'react';
import { Physics } from '@react-three/rapier';
import { useGameStore } from '../../store/useGameStore';
import { PhysicsFloor } from './PhysicsFloor';
import { PogStack } from './PogStack';
import { Slammer } from './Slammer';
import { GameController } from '../GameController';

import { CinematicSlam } from '../CinematicSlam';

/**
 * PHYSICS INNER SCENE
 * Memoized to keep those GPU buffers stable.
 */
const PhysicsInnerScene = React.memo(() => {
  return (
    <>
      <PhysicsFloor />
      <PogStack />
      <Slammer />
      <GameController />
      <CinematicSlam />
    </>
  );
});

/**
 * PHYSICS WORLD (PUPPETEER READY)
 * Pauses the simulation entirely during cinematic sequences
 * so the "Manual Puppeteer" system can move objects without 
 * interference from the physics solver.
 */
export function PhysicsWorld() {
  const isCinematicActive = useGameStore((state) => state.isCinematicActive);

  return (
    <Physics 
      gravity={[0, -16, 0]} 
      timeStep={1 / 60} // Keep this constant to avoid GPU resets
      paused={isCinematicActive} // PAUSE during Matrix orbit
    >
      <PhysicsInnerScene />
    </Physics>
  );
}
