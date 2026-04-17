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
  const debugParams = useGameStore((state) => state.debugParams);
  const preset = SCENE_PRESETS.CYBER_ALLEY;

  return (
    <>
      <ambientLight 
        color={preset.ambientColor} 
        intensity={preset.ambientIntensity * (debugParams.arenaAmbientIntensity ?? 1) * 2.5} 
      />

      <hemisphereLight
        skyColor={preset.spotColor}
        groundColor={preset.ambientColor}
        intensity={(debugParams.arenaAmbientIntensity ?? 1) * 0.4}
      />

      {/* Main Directional/Key Light */}
      <directionalLight
        position={[
          debugParams.arenaDirLightPositionX,
          debugParams.arenaDirLightPositionY,
          debugParams.arenaDirLightPositionZ
        ]}
        intensity={debugParams.arenaDirLightIntensity}
        color={preset.spotColor}
      />

      {/* Atmospheric Spot */}
      <spotLight
        position={[
          debugParams.arenaSpotLightPositionX,
          debugParams.arenaSpotLightPositionY,
          debugParams.arenaSpotLightPositionZ
        ]}
        angle={Math.PI / 3}
        penumbra={0.5}
        intensity={debugParams.arenaSpotLightIntensity}
        color={preset.spotColor}
      />

      {/* Primary Point */}
      <pointLight 
        position={[
          debugParams.arenaPointLightPositionX,
          debugParams.arenaPointLightPositionY,
          debugParams.arenaPointLightPositionZ
        ]} 
        intensity={debugParams.arenaPointLightIntensity} 
        color={preset.pointColor} 
      />

      {/* Fill Point */}
      <pointLight 
        position={[
          debugParams.arenaPoint2LightPositionX,
          debugParams.arenaPoint2LightPositionY,
          debugParams.arenaPoint2LightPositionZ
        ]} 
        intensity={debugParams.arenaPoint2LightIntensity} 
        color={preset.spotColor} 
      />

      {/* LIGHT HELPERS — "Editor Style" Visuals */}
      {debugParams.arenaShowLightHelpers && (
        <group>
          {/* Dir Light Helper */}
          <mesh position={[debugParams.arenaDirLightPositionX, debugParams.arenaDirLightPositionY, debugParams.arenaDirLightPositionZ]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#ffff00" wireframe />
          </mesh>
          {/* Spot Light Helper */}
          <mesh position={[debugParams.arenaSpotLightPositionX, debugParams.arenaSpotLightPositionY, debugParams.arenaSpotLightPositionZ]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial color="#00e5ff" wireframe />
          </mesh>
          {/* Point 1 Helper */}
          <mesh position={[debugParams.arenaPointLightPositionX, debugParams.arenaPointLightPositionY, debugParams.arenaPointLightPositionZ]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#ff007c" wireframe />
          </mesh>
          {/* Point 2 Helper */}
          <mesh position={[debugParams.arenaPoint2LightPositionX, debugParams.arenaPoint2LightPositionY, debugParams.arenaPoint2LightPositionZ]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshBasicMaterial color="#00ffcc" wireframe />
          </mesh>
        </group>
      )}
      
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

