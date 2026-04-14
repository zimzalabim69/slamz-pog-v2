import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { useGameStore } from '../store/useGameStore';
import { SCENE_PRESETS } from '../constants/game';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/**
 * 1:1 POST-PROCESSING PIPELINE
 * Skips entirely during non-gameplay states to save GPU.
 */
export function Effects() {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const gameState = useGameStore((state) => state.gameState);
  const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

  // Skip post-processing during states that don't benefit from it
  if (gameState === 'RESETTING' || gameState === 'SESSION_SUMMARY') {
    return null;
  }

  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom 
        intensity={preset.bloomStrength} 
        luminanceThreshold={preset.bloomThreshold} 
        luminanceSmoothing={0.9} 
        mipmapBlur 
      />
      {!isMobile && (
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(preset.chromaticAberration, preset.chromaticAberration)}
        />
      )}
    </EffectComposer>
  );
}
