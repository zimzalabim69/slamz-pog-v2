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
  KOMBAT_Z: {
    id: 'KOMBAT_Z',
    name: '🐉 KOMBAT Z',
    color: '#ff0000',
    members: ['kz_wraith', 'kz_cyber', 'kz_spike', 'kz_neon', 'kz_glitch'],
    slammer: 'heavy_metal',
    achievementId: 'kz_complete',
  },
  ALLEY_BRAWLER: {
    id: 'ALLEY_BRAWLER',
    name: '🕹️ ALLEY BRAWLER',
    color: '#ff6600',
    members: ['ab_ko', 'ab_perfect', 'ab_fight', 'ab_combo', 'ab_hit'],
    slammer: 'slamzer_street',
    achievementId: 'ab_complete',
  },
  SEWER_SQUAD: {
    id: 'SEWER_SQUAD',
    name: '🐢 SEWER SQUAD',
    color: '#00dd44',
    members: ['ss_ooze', 'ss_shell', 'ss_pizza', 'ss_underground', 'ss_sewer'],
    slammer: 'slamzer_turdle',
    achievementId: 'ss_complete',
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
  MATRIX_SLAMZ: {
    id: 'MATRIX_SLAMZ',
    name: '💊 MATRIX SLAMZ',
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
    desc: 'Capture your first SLAMZ',
  },
  first_holo: {
    id: 'first_holo',
    icon: '✨',
    name: 'HOLO HUNTER',
    desc: 'Capture a Holographic SLAMZ',
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
    desc: 'Collect 50 or more SLAMZ',
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
  kz_complete: {
    id: 'kz_complete',
    icon: '🐉',
    name: 'FINISH IT!',
    desc: 'Complete the KOMBAT Z set',
    isSetComplete: true,
    setId: 'KOMBAT_Z',
  },
  ab_complete: {
    id: 'ab_complete',
    icon: '🕹️',
    name: 'ALLEY LEGEND',
    desc: 'Complete the ALLEY BRAWLER set',
    isSetComplete: true,
    setId: 'ALLEY_BRAWLER',
  },
  ss_complete: {
    id: 'ss_complete',
    icon: '🐢',
    name: 'PARTY DUDE!',
    desc: 'Complete the SEWER SQUAD set',
    isSetComplete: true,
    setId: 'SEWER_SQUAD',
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
    name: 'THERE IS NO SLAMZ',
    desc: 'Complete the MATRIX SLAMZ set',
    isSetComplete: true,
    setId: 'MATRIX_SLAMZ',
  },
  all_sets: {
    id: 'all_sets',
    icon: '👑',
    name: 'GRANDMASTER',
    desc: 'Complete ALL six sets',
  },
};

export const ACHIEVEMENT_LIST = Object.values(ACHIEVEMENTS);
