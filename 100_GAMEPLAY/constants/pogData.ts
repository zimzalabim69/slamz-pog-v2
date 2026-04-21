// ============================================================
// POG THEME DEFINITIONS (Static Data - Available Assets Only)
// ============================================================

export const SET_THEMES = {
  KOMBAT_Z:      ['kz_wraith', 'kz_cyber'],
  SEWER_SQUAD:   ['slamzer_turdle'],
  ALLEY_BRAWLER: ['sp_combo', 'sp_hadouken', 'sp_perfect'],
  BREACH_CORE:   ['theme_arcade_panther', 'theme_cyber_strike', 'theme_glitch_skul_vhs'],
  LEGACY_PRO:    ['ms_fatality', 'ms_flawless', 'ms_scorpion', 'nt_shredmeister', 'slamzer_mortal'],
} as const;

export const PROCEDURAL_THEMES = Object.values(SET_THEMES).flat();

// High-quality asset themes (holographic drops)
export const ASSET_THEMES = PROCEDURAL_THEMES;

export const SLAMMER_SKINS = {
  metal: 'slamzer_mortal',
  poison: 'theme_glitch_skul_vhs',
  plastic: 'slamzer_turdle',
} as const;
