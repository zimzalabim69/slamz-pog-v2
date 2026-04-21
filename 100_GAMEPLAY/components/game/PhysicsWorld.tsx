import * as React from 'react';
import { Physics } from '@react-three/rapier';
import { PhysicsFloor } from './PhysicsFloor';
import { PogStack } from './PogStack';
import { Slammer } from './Slammer';
import { GameController } from '../GameController';

import { CinematicSlam } from '@400/components/CinematicSlam';
import { CollisionTuningSuite } from './CollisionTuningSuite';
import { Boundary } from './Boundary';

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
      <CollisionTuningSuite />
      <Boundary />
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
  return <PhysicsInnerScene />;
}
