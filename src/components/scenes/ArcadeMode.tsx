import { Suspense } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { SCENE_PRESETS } from '../../constants/game';
import { Arena } from '../game/Arena';
import { CyberAlley } from '../environment/CyberAlley';
import { ArenaDecor } from '../environment/ArenaDecor';
import { ShowcaseHUD } from '../game/ShowcaseHUD';
import { SessionSummary } from '../ui/SessionSummary';

/**
 * ARCADE MODE SCENE
 * The full, high-fidelity experience with all environmental assets.
 */
export function ArcadeMode() {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const debugParams = useGameStore((state) => state.debugParams);
  const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;

  return (
    <>
      <ambientLight 
        color={preset.ambientColor} 
        intensity={preset.ambientIntensity * debugParams.arenaAmbientIntensity * 1.8} 
      />

      <spotLight
        position={preset.spotPosition}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={preset.spotIntensity * debugParams.arenaLightIntensity}
        color={preset.spotColor}
      />
      <pointLight position={preset.pointPosition} intensity={preset.pointIntensity} color={preset.pointColor} />
      <pointLight position={[0, 6, -8]} intensity={preset.spotIntensity * 1.2} color={preset.spotColor} />
      
      {/* Visual Environment */}
      <Suspense fallback={null}><Arena /></Suspense>
      <Suspense fallback={null}><ArenaDecor /></Suspense>
      <CyberAlley />

      {/* 3D HUD & Overlays */}
      <ShowcaseHUD />
      <SessionSummary />
    </>
  );
}

