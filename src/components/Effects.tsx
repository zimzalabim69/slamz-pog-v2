import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { useGameStore } from '../store/useGameStore';
import { SCENE_PRESETS } from '../constants/game';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

/**
 * 1:1 POST-PROCESSING PIPELINE
 * This handles things that are best done in WebGL (Bloom, Aberration).
 * The reactive scanlines and flicker are handled by the CRTOverlay canvas to save GPU compute
 * and ensure that "Analog" feel of the original prototype.
 */
export function Effects() {
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;
  const isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

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
