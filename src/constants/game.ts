// ============================================================
// GAME SETTINGS & CONSTANTS (Phase 3: Visual Restoration)
// ============================================================

export const SLAMZ_THICKNESS = 0.09;
export const SLAMZ_RADIUS = 0.45;
export const SLAMMER_RADIUS = 0.55;
export const SLAMMER_THICKNESS = 0.25;

export const SPAWN_FLOOR = 0.045;

/** 
 * SCENE PRESETS (Restored from Original Prototype)
 * These values ensure 1:1 visual parity with the Vibejam 2026 project.
 */
export const SCENE_PRESETS = {
  CYBER_ALLEY: {
    id: 'CYBER_ALLEY',
    name: 'CYBER-ALLEYWAY',
    bgColor: '#010308',
    fogColor: '#010308',
    fogNear: 5,
    fogFar: 30,
    ambientColor: '#001122',
    ambientIntensity: 0.15,
    spotColor: '#00e5ff',
    spotIntensity: 15,
    spotPosition: [-8, 14, 2] as [number, number, number],
    pointColor: '#ff007c',
    pointIntensity: 100,
    pointPosition: [8, 5, -3] as [number, number, number],
    floorColor: '#020205',
    floorEmissive: '#00e5ff',
    floorEmissiveIntensity: 2.5,
    bloomStrength: 1.2,
    bloomRadius: 0.5,
    bloomThreshold: 1.05,
    pogEmissiveScale: 0.2,
    scanlines: 0.8,
    chromaticAberration: 0.005
  }
};

export type ScenePreset = typeof SCENE_PRESETS.CYBER_ALLEY;
