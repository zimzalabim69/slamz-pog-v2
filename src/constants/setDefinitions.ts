// ============================================================
// SET DEFINITIONS — Ported 1:1 from original
// ============================================================

export interface SetDef {
  id: string;
  name: string;
  color: string;
  members: string[];
  slammer: string;
  achievementId: string;
}

export const SET_DEFS: Record<string, SetDef> = {
  MORTAL_SLAMZ: {
    id: 'MORTAL_SLAMZ',
    name: '🐉 MORTAL SLAMZ',
    color: '#ff0000',
    members: ['ms_scorpion', 'ms_subzero', 'ms_raiden', 'ms_fatality', 'ms_flawless'],
    slammer: 'slamzer_mortal',
    achievementId: 'ms_complete',
  },
  STREET_POG: {
    id: 'STREET_POG',
    name: '🕹️ STREET POG',
    color: '#ff6600',
    members: ['sp_hadouken', 'sp_fight', 'sp_perfect', 'sp_combo', 'sp_ko'],
    slammer: 'slamzer_street',
    achievementId: 'sp_complete',
  },
  NINJA_TURDLES: {
    id: 'NINJA_TURDLES',
    name: '🐢 NINJA TURDLES',
    color: '#00dd44',
    members: ['nt_leo', 'nt_raph', 'nt_mikey', 'nt_don', 'nt_shredmeister'],
    slammer: 'slamzer_turdle',
    achievementId: 'nt_complete',
  },
  POWER_SLAMZ: {
    id: 'POWER_SLAMZ',
    name: '⚡ POWER SLAMZ',
    color: '#ff2244',
    members: ['ps_red', 'ps_blue', 'ps_pink', 'ps_zord', 'ps_morph'],
    slammer: 'slamzer_power',
    achievementId: 'ps_complete',
  },
  SONIC_RINGZ: {
    id: 'SONIC_RINGZ',
    name: '💨 SONIC RINGZ',
    color: '#0044ff',
    members: ['sr_speed', 'sr_rings', 'sr_badnik', 'sr_emerald', 'sr_super'],
    slammer: 'slamzer_sonic',
    achievementId: 'sr_complete',
  },
  MATRIX_POGZ: {
    id: 'MATRIX_POGZ',
    name: '💊 MATRIX POGZ',
    color: '#00ff44',
    members: ['mx_redpill', 'mx_code', 'mx_bullet', 'mx_neo', 'mx_oracle'],
    slammer: 'slamzer_matrix',
    achievementId: 'mx_complete',
  },
};

export const ALL_SETS = Object.values(SET_DEFS);

export function getSetForTheme(themeId: string): SetDef | null {
  return ALL_SETS.find(s => s.members.includes(themeId)) || null;
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

export interface Achievement {
  id: string;
  icon: string;
  name: string;
  desc: string;
  isSetComplete?: boolean;
  setId?: string;
}

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_slam: {
    id: 'first_slam',
    icon: '💥',
    name: 'FIRST BLOOD',
    desc: 'Land your first slam',
  },
  first_capture: {
    id: 'first_capture',
    icon: '🪙',
    name: 'COLLECTOR',
    desc: 'Capture your first POG',
  },
  first_holo: {
    id: 'first_holo',
    icon: '✨',
    name: 'HOLO HUNTER',
    desc: 'Capture a Holographic POG',
  },
  perfect_slam: {
    id: 'perfect_slam',
    icon: '🏆',
    name: 'FLAWLESS',
    desc: 'Land a 100% Perfect Slam',
  },
  ultra_slam: {
    id: 'ultra_slam',
    icon: '💢',
    name: 'ULTRA VIOLENCE',
    desc: 'Land 5 Ultra Slams',
  },
  hoarder: {
    id: 'hoarder',
    icon: '📚',
    name: 'HOARDER MODE',
    desc: 'Collect 50 or more POGs',
  },
  scene_explorer: {
    id: 'scene_explorer',
    icon: '🌃',
    name: 'SCENE EXPLORER',
    desc: 'Play in both environments',
  },
  binder_buff: {
    id: 'binder_buff',
    icon: '📔',
    name: 'BINDER BUFF',
    desc: 'Fill 2+ pages of the binder',
  },
  ms_complete: {
    id: 'ms_complete',
    icon: '🐉',
    name: 'FINISH IT!',
    desc: 'Complete the MORTAL SLAMZ set',
    isSetComplete: true,
    setId: 'MORTAL_SLAMZ',
  },
  sp_complete: {
    id: 'sp_complete',
    icon: '🕹️',
    name: 'STREET LEGEND',
    desc: 'Complete the STREET POG set',
    isSetComplete: true,
    setId: 'STREET_POG',
  },
  nt_complete: {
    id: 'nt_complete',
    icon: '🐢',
    name: 'PARTY DUDE!',
    desc: 'Complete the NINJA TURDLES set',
    isSetComplete: true,
    setId: 'NINJA_TURDLES',
  },
  ps_complete: {
    id: 'ps_complete',
    icon: '⚡',
    name: "IT'S MORPHIN TIME!",
    desc: 'Complete the POWER SLAMZ set',
    isSetComplete: true,
    setId: 'POWER_SLAMZ',
  },
  sr_complete: {
    id: 'sr_complete',
    icon: '💨',
    name: 'GOTTA SLAM FAST',
    desc: 'Complete the SONIC RINGZ set',
    isSetComplete: true,
    setId: 'SONIC_RINGZ',
  },
  mx_complete: {
    id: 'mx_complete',
    icon: '💊',
    name: 'THERE IS NO POG',
    desc: 'Complete the MATRIX POGZ set',
    isSetComplete: true,
    setId: 'MATRIX_POGZ',
  },
  all_sets: {
    id: 'all_sets',
    icon: '👑',
    name: 'GRANDMASTER',
    desc: 'Complete ALL six sets',
  },
};

export const ACHIEVEMENT_LIST = Object.values(ACHIEVEMENTS);
