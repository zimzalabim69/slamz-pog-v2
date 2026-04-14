import * as React from 'react';
import { Suspense } from 'react';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { useGameStore } from '../store/useGameStore';

import { SCENE_PRESETS } from '../constants/game';
import * as THREE from 'three';
import { PogStack } from './game/PogStack';
import { Slammer } from './game/Slammer';
import { Reticle } from './game/Reticle';
import { PhysicsFloor } from './game/PhysicsFloor';
import { Arena } from './game/Arena';
import { CyberAlley } from './environment/CyberAlley';
import { ArenaDecor } from './environment/ArenaDecor';
import { Effects } from './Effects';
import { GameController } from './GameController';
import { PerformanceMonitor } from './PerformanceMonitor';
import { AdaptiveQuality } from './AdaptiveQuality';
import { SessionSummary } from './ui/SessionSummary';
import { ShowcaseHUD } from './game/ShowcaseHUD';

export function Experience() {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const debugParams = useGameStore((state) => state.debugParams);
  const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;
  const orbitRef = React.useRef<any>(null);
  const cameraRef = React.useRef<any>(null);

  // Recovery of FOV pulse from Slammer (handled in cameraRef update)
  React.useEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, -1.5, 0);
    }
  }, []);

  return (
    <>
      <PerspectiveCamera 
        ref={cameraRef}
        makeDefault 
        position={[0, 8, 6]} 
        fov={50}
        onUpdate={(cam) => {
           // Basic recovery if FOV is still punched from slam
           if (cam.fov > 50.1) {
             cam.fov = THREE.MathUtils.lerp(cam.fov, 50, 0.1);
             cam.updateProjectionMatrix();
           }
        }}
      />
      
      {/* OPTIMIZED LIGHTING RIG — 4 lights (ambient + spot + 2 point) */}
      <ambientLight color={preset.ambientColor} intensity={preset.ambientIntensity * debugParams.arenaAmbientIntensity * 1.8} />

      <spotLight
        position={preset.spotPosition}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={preset.spotIntensity * debugParams.arenaLightIntensity}
        color={preset.spotColor}
      />
      <pointLight position={preset.pointPosition} intensity={preset.pointIntensity} color={preset.pointColor} />

      {/* SINGLE RIM LIGHT — merged from two */}
      <pointLight position={[0, 6, -8]} intensity={preset.spotIntensity * 1.2} color={preset.spotColor} />
      

      <color attach="background" args={[preset.bgColor]} />

      {/* NON-PHYSICS ENVIRONMENT */}
      <Suspense fallback={null}><Arena /></Suspense>
      <Suspense fallback={null}><ArenaDecor /></Suspense>
      <CyberAlley />

      {/* PHYSICS WORLD - wraps everything with rigid bodies */}
      <Physics gravity={[0, -16, 0]}>
        <PhysicsFloor />
        <PogStack />
        <Slammer />
        <GameController />

      </Physics>

      {/* 3D HUD SHOWCASE (Display Case) */}
      <ShowcaseHUD />

      {/* AIMING INDICATORS */}
      <Reticle />

      {/* Session Summary Screen */}
      <SessionSummary />
      
      <Effects />
      
      <OrbitControls
        ref={orbitRef}
        enablePan={false}
        mouseButtons={{ LEFT: undefined, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={5}
        maxDistance={25}
        target={[0, 0, 0]}
      />
      <PerformanceMonitor />
      <AdaptiveQuality />
    </>
  );
}


