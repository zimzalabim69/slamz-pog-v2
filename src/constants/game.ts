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
  DEFAULT: {
    id: 'DEFAULT',
    name: 'BACKLIGHT TABLE',
    bgColor: '#080010',
    fogColor: '#050010',
    fogNear: 8,
    fogFar: 45,
    ambientColor: '#110033',
    ambientIntensity: 0.1,
    spotColor: '#8800ff',
    spotIntensity: 18,
    spotPosition: [12, 18, 5] as [number, number, number],
    pointColor: '#ff00ff',
    pointIntensity: 80,
    pointPosition: [-10, 8, 5] as [number, number, number],
    floorColor: '#050010',
    floorEmissive: '#4400aa',
    floorEmissiveIntensity: 10.0,
    bloomStrength: 0.8,
    bloomRadius: 0.4,
    bloomThreshold: 0.85,
    pogEmissiveScale: 1.0,
    scanlines: 0.5,
    chromaticAberration: 0.002
  },
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

export type ScenePreset = typeof SCENE_PRESETS.DEFAULT;

export const SCENE_ORDER = ['DEFAULT', 'CYBER_ALLEY'] as const;
