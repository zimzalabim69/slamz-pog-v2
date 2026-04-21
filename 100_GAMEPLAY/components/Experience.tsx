import * as React from 'react';

import { useGameStore } from '@100/store/useGameStore';
import { GAME_CONFIG } from '@100/constants/gameConfig';
import * as THREE from 'three';
import { Reticle } from './game/Reticle';
import { ImpactParticles } from './game/ImpactParticles';
import { PhysicsWorld } from './game/PhysicsWorld';
import { TimerUpdate } from './game/TimerUpdate';
// Effects (postprocessing) permanently bypassed — library crashes WebGL via circular JSON
import { ArcadeMode } from './scenes/ArcadeMode';
import { ImpactLab } from './scenes/ImpactLab';
import { AdaptiveQuality } from '@500/components/AdaptiveQuality';
import { Physics } from '@react-three/rapier';

import { PerspectiveCamera } from '@react-three/drei';
import { CameraController } from '@400/components/CameraController';
import { HarvestManager } from './game/HarvestManager';
import { ElectricalBolts } from '@400/components/ElectricalBolts';
import { GlitchEruption } from './game/GlitchEruption';
import { PhysicsFogController } from './game/PhysicsFogController';

export function Experience() {
  const sceneMode = useGameStore((state) => state.sceneMode);
  const bulletTimeActive = useGameStore((state) => state.bulletTimeActive);
  const debugParams = useGameStore((state) => state.debugParams);
  const physicsDebug = useGameStore((state) => state.physicsDebug);
  const togglePhysicsDebug = useGameStore((state) => state.togglePhysicsDebug);
  
  // KEYBOARD SHORTCUTS
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (false) {
        togglePhysicsDebug();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePhysicsDebug]);

  return (
    <>
      <PerspectiveCamera makeDefault />
      <CameraController />

      {/* Background is handled by CSS ArenaBackground — canvas is alpha:true */}
      
      <fog 
        attach="fog" 
        args={[
          new THREE.Color().setRGB(
            GAME_CONFIG.FOG_COLOR_R,
            GAME_CONFIG.FOG_COLOR_G,
            GAME_CONFIG.FOG_COLOR_B
          ), 
          GAME_CONFIG.FOG_NEAR,
          GAME_CONFIG.FOG_FAR
        ]} 
      />

      <TimerUpdate />

      <Physics 
        gravity={[0, bulletTimeActive ? -2.5 : -16, 0]} 
        timeStep={1 / 60}
        paused={false}
        debug={physicsDebug}
        interpolate={true}
      >
        {sceneMode === 'ARCADE' ? <ArcadeMode /> : <ImpactLab />}
        <PhysicsWorld />
        <HarvestManager />
        <PhysicsFogController />
      </Physics>

      <Reticle />
      <ImpactParticles />
      <GlitchEruption />
      <ElectricalBolts />

      <AdaptiveQuality />
      
      {import.meta.env.DEV && (
        <>
          
          
        </>
      )}
    </>
  );
}

