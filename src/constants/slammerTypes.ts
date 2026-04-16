// ============================================================
// SLAMMER TYPES — Different slammer variants with unique masses
// ============================================================

export const SLAMMER_TYPES = {
  standard: {
    id: 'standard',
    name: 'STANDARD SLAMMER',
    mass: 2.5,
    color: '#0044ff',
  },
  heavy: {
    id: 'heavy',
    name: 'HEAVY SLAMMER',
    mass: 4.0,
    color: '#ff6600',
  },
  metal: {
    id: 'metal',
    name: 'METAL SLAMMER',
    mass: 5.5,
    color: '#aaaaaa',
  },
  titanium: {
    id: 'titanium',
    name: 'TITANIUM SLAMMER',
    mass: 7.0,
    color: '#00ff44',
  },
} as const;

export type SlammerTypeId = keyof typeof SLAMMER_TYPES;

export const SLAMMER_TYPE_LIST = Object.values(SLAMMER_TYPES);
