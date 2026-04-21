/**
 * Effects — PERMANENTLY BYPASSED
 *
 * The @react-three/postprocessing library calls JSON.stringify internally
 * on the Three.js scene graph during React reconciliation, which always
 * hits the circular children→parent reference and crashes the WebGL context.
 *
 * Visual compensation:
 *  - Chromatic aberration / CRT grit → CRTOverlay.tsx (CSS-based, zero GPU cost)
 *  - Wraith glitch → GlitchEruption.tsx (Three.js instanced, no postprocessing)
 *  - Vignette → CRTOverlay.tsx CSS
 *  - Scene glow → emissiveIntensity boosted on arena/pog materials
 */
export function Effects() {
  return null;
}
