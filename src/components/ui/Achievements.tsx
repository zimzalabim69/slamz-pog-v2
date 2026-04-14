// ============================================================
// ACHIEVEMENTS OVERLAY — Ported 1:1 from original
// ============================================================

import { useGameStore } from '../../store/useGameStore';
import { ACHIEVEMENT_LIST } from '../../constants/setDefinitions';
import './Achievements.css';

export function Achievements() {
  const achievementsOpen = useGameStore((s) => s.achievementsOpen);
  const toggleAchievements = useGameStore((s) => s.toggleAchievements);
  const setManager = useGameStore((s) => s.setManager);

  if (!achievementsOpen) return null;

  const unlocked = setManager.getUnlocked();
  const unlockedIds = new Set(unlocked.map((a) => a.id));

  return (
    <div className="achievement-overlay" onClick={() => toggleAchievements()}>
      <div className="achievement-content" onClick={(e) => e.stopPropagation()}>
        <div className="achievement-header">ACHIEVEMENTS</div>
        <div className="achievement-ratio">
          {unlocked.length} / {ACHIEVEMENT_LIST.length}
        </div>

        <div className="achievement-grid">
          {ACHIEVEMENT_LIST.map((ach) => {
            const isUnlocked = unlockedIds.has(ach.id);
            return (
              <div
                key={ach.id}
                className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon" style={{ filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
                  {ach.icon}
                </div>
                <div className="achievement-info">
                  <div className="achievement-name">{isUnlocked ? ach.name : '???'}</div>
                  <div className="achievement-desc">{ach.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        <button className="achievement-close-btn" onClick={() => toggleAchievements()}>
          CLOSE [A]
        </button>
      </div>
    </div>
  );
}

// Toast notification for when achievements unlock
export function AchievementToast() {
  const toast = useGameStore((s) => s.achievementToast);

  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className="achievement-toast">
        <div className="toast-label">ACHIEVEMENT UNLOCKED</div>
        <div className="toast-text">{toast}</div>
      </div>
    </div>
  );
}
