// ============================================================
// SLAMMER SELECTOR — UI for switching slammer types
// ============================================================

import { useGameStore } from '../../store/useGameStore';
import { SLAMMER_TYPE_LIST } from '../../constants/slammerTypes';
import './SlammerSelector.css';

export function SlammerSelector() {
  const currentType = useGameStore((s) => s.currentSlammerType);
  const setSlammerType = useGameStore((s) => s.setSlammerType);

  return (
    <div className="slammer-selector">
      <div className="slammer-label">SLAMMER</div>
      <div className="slammer-buttons">
        {SLAMMER_TYPE_LIST.map((def) => (
          <button
            key={def.id}
            className={currentType === def.id ? 'active' : ''}
            style={{
              borderColor: currentType === def.id ? def.color : '#444',
              color: currentType === def.id ? def.color : '#666',
            }}
            onClick={() => setSlammerType(def.id)}
          >
            {def.name.replace('SLAMZER', '').trim()}
          </button>
        ))}
      </div>
    </div>
  );
}
