// ============================================================
// POG THEME DEFINITIONS (Static Data - Available Assets Only)
// ============================================================

export const SET_THEMES = {
  MORTAL_SLAMZ:  ['ms_scorpion', 'ms_subzero', 'ms_raiden', 'ms_fatality', 'ms_flawless'],
  STREET_POG:    ['sp_hadouken', 'sp_fight', 'sp_perfect', 'sp_combo', 'sp_ko'],
  NINJA_TURDLES: ['nt_leo', 'nt_raph', 'nt_mikey', 'nt_don', 'nt_shredmeister'],
} as const;

export const PROCEDURAL_THEMES = Object.values(SET_THEMES).flat();

// High-quality asset themes (holographic drops)
export const ASSET_THEMES = PROCEDURAL_THEMES;

export const SLAMMER_SKINS = {
  metal: 'slamzer_mortal',
  poison: 'slamzer_street',
  plastic: 'slamzer_turdle',
} as const;
