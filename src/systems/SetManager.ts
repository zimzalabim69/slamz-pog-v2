// ============================================================
// SET MANAGER — Ported 1:1 from original
// Achievement tracking, set completion, stats persistence
// ============================================================

import { ALL_SETS, ACHIEVEMENTS, ACHIEVEMENT_LIST, getSetForTheme, type Achievement, type SetDef } from '../constants/setDefinitions';

const SAVE_KEY_ACHIEVEMENTS = 'slamz_achievements';
const SAVE_KEY_STATS = 'slamz_stats';

interface Stats {
  totalSlams: number;
  ultraSlams: number;
  perfectSlams: number;
  scenesVisited: string[];
}

export class SetManager {
  unlockedAchievements: Set<string>;
  stats: Stats;
  onAchievementUnlocked: ((achievement: Achievement) => void) | null = null;
  onSetCompleted: ((setDef: SetDef) => void) | null = null;

  constructor() {
    this.unlockedAchievements = new Set(
      JSON.parse(localStorage.getItem(SAVE_KEY_ACHIEVEMENTS) || '[]')
    );
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY_STATS) || JSON.stringify({
      totalSlams: 0,
      ultraSlams: 0,
      perfectSlams: 0,
      scenesVisited: [],
    }));
    this.stats = {
      ...raw,
      scenesVisited: Array.isArray(raw.scenesVisited) ? raw.scenesVisited : [],
    };
  }

  _save() {
    localStorage.setItem(SAVE_KEY_ACHIEVEMENTS, JSON.stringify([...this.unlockedAchievements]));
    localStorage.setItem(SAVE_KEY_STATS, JSON.stringify(this.stats));
  }

  unlock(achievementId: string): boolean {
    if (this.unlockedAchievements.has(achievementId)) return false;
    const def = ACHIEVEMENTS[achievementId];
    if (!def) return false;
    this.unlockedAchievements.add(achievementId);
    this._save();
    if (this.onAchievementUnlocked) this.onAchievementUnlocked(def);
    return true;
  }

  isUnlocked(id: string): boolean {
    return this.unlockedAchievements.has(id);
  }

  getUnlocked(): Achievement[] {
    return ACHIEVEMENT_LIST.filter(a => this.unlockedAchievements.has(a.id));
  }

  onSlam(power: number) {
    this.stats.totalSlams++;
    this.unlock('first_slam');
    if (power >= 100) {
      this.stats.perfectSlams++;
      this.unlock('perfect_slam');
    }
    if (power > 80) {
      this.stats.ultraSlams++;
      if (this.stats.ultraSlams >= 5) this.unlock('ultra_slam');
    }
    this._save();
  }

  onCapture(collection: Array<{ theme: string; rarity: string; date: string }>) {
    if (collection.length === 1) this.unlock('first_capture');
    const holos = collection.filter(p => p.rarity === 'holographic');
    if (holos.length > 0) this.unlock('first_holo');
    if (collection.length >= 50) this.unlock('hoarder');
    if (collection.length >= 40) this.unlock('binder_buff');

    const themedOwned = new Set(collection.map(p => p.theme));
    let completedSets = 0;
    ALL_SETS.forEach(setDef => {
      const complete = setDef.members.every(m => themedOwned.has(m));
      if (complete) {
        completedSets++;
        if (this.unlock(setDef.achievementId)) {
          if (this.onSetCompleted) this.onSetCompleted(setDef);
        }
      }
    });
    if (completedSets >= ALL_SETS.length) this.unlock('all_sets');
  }

  onSceneVisited(sceneId: string) {
    if (!this.stats.scenesVisited.includes(sceneId)) {
      this.stats.scenesVisited.push(sceneId);
      if (this.stats.scenesVisited.length >= 2) this.unlock('scene_explorer');
      this._save();
    }
  }

  getSetStatus(collection: Array<{ theme: string; rarity: string; date: string }>) {
    const owned = new Set(collection.map(p => p.theme));
    return ALL_SETS.map(setDef => ({
      ...setDef,
      ownedCount: setDef.members.filter(m => owned.has(m)).length,
      complete: setDef.members.every(m => owned.has(m)),
    }));
  }

  getSetForTheme(themeId: string) {
    return getSetForTheme(themeId);
  }

  resetAll() {
    this.unlockedAchievements.clear();
    this.stats = { totalSlams: 0, ultraSlams: 0, perfectSlams: 0, scenesVisited: [] };
    localStorage.removeItem(SAVE_KEY_ACHIEVEMENTS);
    localStorage.removeItem(SAVE_KEY_STATS);
  }
}
