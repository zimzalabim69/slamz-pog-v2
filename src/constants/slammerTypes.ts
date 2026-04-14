// ============================================================
// SLAMMER TYPES — Different slammer variants with unique masses
// ============================================================

export const SLAMMER_TYPES = {
  slamzer_mortal: {
    id: 'slamzer_mortal',
    name: 'MORTAL SLAMZER',
    mass: 6.0,
    color: '#ff0000',
  },
  slamzer_street: {
    id: 'slamzer_street',
    name: 'STREET SLAMZER',
    mass: 4.5,
    color: '#ff6600',
  },
  slamzer_turdle: {
    id: 'slamzer_turdle',
    name: 'TURDLE SLAMZER',
    mass: 3.5,
    color: '#00dd44',
  },
  slamzer_power: {
    id: 'slamzer_power',
    name: 'POWER SLAMZER',
    mass: 5.0,
    color: '#ff2244',
  },
  slamzer_sonic: {
    id: 'slamzer_sonic',
    name: 'SONIC SLAMZER',
    mass: 2.5,
    color: '#0044ff',
  },
  slamzer_matrix: {
    id: 'slamzer_matrix',
    name: 'MATRIX SLAMZER',
    mass: 7.0,
    color: '#00ff44',
  },
} as const;

export type SlammerTypeId = keyof typeof SLAMMER_TYPES;

export const SLAMMER_TYPE_LIST = Object.values(SLAMMER_TYPES);
