import { useGameStore } from '../../store/useGameStore';
import { SCENE_PRESETS } from '../../constants/game';
import { Binder } from './Binder';
import { Achievements, AchievementToast } from './Achievements';
import { SlammerSelector } from './SlammerSelector';
import { useEffect } from 'react';
import { useTerminalStore } from '../../store/useTerminalStore';

export function HUD() {
  const gameState    = useGameStore((s) => s.gameState);
  const power        = useGameStore((s) => s.power);
  const stats        = useGameStore((s) => s.stats);
  const currentAtmosphere = useGameStore((s) => s.currentAtmosphere);
  const cycleAtmosphere   = useGameStore((s) => s.cycleAtmosphere);
  const currentShowcase   = useGameStore((s) => s.currentShowcase) || null;
  const advanceShowcase   = useGameStore((s) => s.advanceShowcase);
  const lastSlamText      = useGameStore((s) => s.lastSlamText);
  const resetStack        = useGameStore((s) => s.resetStack);
  const toggleBinder      = useGameStore((s) => s.toggleBinder);
  const toggleAchievements = useGameStore((s) => s.toggleAchievements);
  const showcaseRatioMode = useGameStore((s) => s.showcaseRatioMode);
  const toggleShowcaseRatio = useGameStore((s) => s.toggleShowcaseRatio);

  const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;

  // Keyboard shortcuts for [B] and [A]
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b') toggleBinder();
      if (e.key.toLowerCase() === 'a') toggleAchievements();
      if (e.key === '`') useTerminalStore.getState().toggleTerminal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleBinder, toggleAchievements]);

  // Hide HUD during showcase
  if (currentShowcase) return null;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      fontFamily: '"Orbitron", sans-serif',
      color: '#fff',
      zIndex: 500,
    }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#ff00cc', letterSpacing: '2px' }}>VIBEJAM 2026: PRO-TOUR</div>
          <div style={{ fontSize: '24px', fontWeight: 900, margin: '4px 0' }}>{gameState}</div>
          <div style={{ fontSize: '10px', color: '#00ffcc', marginTop: '8px' }}>
            POGS WON: <span style={{ color: '#fff', fontSize: '14px' }}>{stats.pogsWon}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', pointerEvents: 'auto' }}>
          <button
            onClick={() => cycleAtmosphere()}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${preset.spotColor}`,
              color: preset.spotColor,
              padding: '6px 14px', fontSize: '9px',
              fontFamily: 'inherit', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '2px',
              boxShadow: `0 0 12px ${preset.spotColor}44`,
              borderRadius: '2px', fontWeight: 'bold'
            }}
          >
            ATMOSPHERE: {preset.name}
          </button>
          <button
            onClick={() => toggleShowcaseRatio()}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #00ffcc',
              color: '#00ffcc',
              padding: '6px 14px', fontSize: '9px',
              fontFamily: 'inherit', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '2px',
              boxShadow: '0 0 12px rgba(0,255,204,0.2)',
              borderRadius: '2px', fontWeight: 'bold'
            }}
          >
            VIEW: {showcaseRatioMode === 'safe' ? '16:9' : 'FULL'}
          </button>
          <button
            onClick={() => resetStack()}
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.6)',
              padding: '6px 14px', fontSize: '9px',
              fontFamily: 'inherit', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '2px',
              borderRadius: '2px'
            }}
          >
            RESET STACK [R]
          </button>
          <button
            onClick={() => useTerminalStore.getState().toggleTerminal()}
            style={{
              background: 'rgba(0,0,20,0.5)',
              border: '1px solid #00ffcc',
              color: '#00ffcc',
              padding: '6px 14px', fontSize: '9px',
              fontFamily: 'inherit', cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '2px',
              borderRadius: '2px', fontWeight: 'bold',
              textShadow: '0 0 5px #00ffcc'
            }}
          >
            SYSTEM OS [~]
          </button>
        </div>
      </div>

      {/* ── POWER BAR ──────────────────────────────────────── */}
      {gameState === 'POWERING' && (
        <div style={{
          position: 'absolute', bottom: '85px',
          left: '50%', transform: 'translateX(-50%)',
          width: '400px', height: '12px',
          background: 'rgba(0,0,0,0.8)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)', overflow: 'hidden'
        }}>
          <div style={{
            width: `${power}%`, height: '100%',
            background: power > 95 ? '#ff00ff' : '#00ffcc',
            boxShadow: `0 0 10px ${power > 95 ? '#ff00ff' : '#00ffcc'}`,
            transition: 'width 0.05s linear'
          }} />
          {power > 95 && (
            <div style={{
              position: 'absolute', top: '-32px', left: '50%',
              transform: 'translateX(-50%)',
              color: '#ff00ff', fontSize: '14px', fontWeight: 900,
              letterSpacing: '2px', animation: 'pulse 0.4s infinite'
            }}>
              PERFECT!!
            </div>
          )}
        </div>
      )}

      {/* ── SLAM TEXT (float-up popup) ──────────────────────── */}
      {lastSlamText && (
        <div style={{
          position: 'absolute', left: '50%', top: '35%',
          transform: 'translateX(-50%)',
          color: '#ffff00', fontSize: '48px', fontWeight: 900,
          textShadow: '4px 4px 0 #ff0055',
          animation: 'floatUp 1.2s forwards',
          pointerEvents: 'none', whiteSpace: 'nowrap'
        }}>
          {lastSlamText}
        </div>
      )}

      {/* ── SHOWCASE OVERLAY ──────────────────────────────── */}
      {gameState === 'SHOWCASE' && currentShowcase && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.75)',
          pointerEvents: 'auto'
        }}
          onClick={() => advanceShowcase()}
        >
          {/* SET NAME top */}
          <div style={{ position: 'absolute', top: '12%', width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', letterSpacing: '5px', color: (currentShowcase as any)?.setColor || '#00ff00', textShadow: `0 0 10px ${(currentShowcase as any)?.setColor || '#00ff00'}` }}>
              {(currentShowcase as any)?.setName || 'MYSTERY POG'}
            </div>
            <div style={{ fontSize: '52px', fontWeight: 900, color: '#fff', textShadow: '4px 4px 0 #ff0055', marginTop: '10px', letterSpacing: '2px' }}>
              {(currentShowcase as any)?.theme?.replace(/_/g, ' ').toUpperCase() || 'MYSTERY'}
            </div>
          </div>

          {/* LEFT stats box */}
          <div style={{
            position: 'absolute', left: '8%', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.8)',
            border: `2px solid ${(currentShowcase as any)?.setColor || '#00ff00'}`,
            padding: '20px', borderRadius: '4px',
            boxShadow: `0 0 30px ${(currentShowcase as any)?.setColor || '#00ff00'}55`
          }}>
            <div style={{ fontSize: '9px', color: (currentShowcase as any)?.setColor || '#00ff00', marginBottom: '5px' }}>COLLECTOR DATA</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{(currentShowcase as any)?.rarity?.toUpperCase() || 'COMMON'}</div>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>{(currentShowcase as any)?.marketValue?.toLocaleString() || '0'}</div>
            <div style={{ fontSize: '9px', opacity: 0.7 }}>MARKET VALUE</div>
            <div style={{ fontSize: '24px', color: '#ffff00', fontWeight: 900 }}>
              {(currentShowcase as any)?.marketValue?.toLocaleString() || '0'} 🄿
            </div>
          </div>

          {/* Bottom hint */}
          <div style={{
            position: 'absolute', bottom: '10%', width: '100%', textAlign: 'center',
            color: '#ffff00', fontSize: '13px', letterSpacing: '2px',
            animation: 'pulse 1.5s infinite'
          }}>
            CLICK OR [SPACE] TO CONTINUE
          </div>
        </div>
      )}


      <div style={{
        position: 'absolute', bottom: '20px', width: '100%',
        textAlign: 'center', fontSize: '9px', opacity: 0.5, letterSpacing: '2px'
      }}>
        [LEFT CLICK] HOLD TO CHARGE | [E] ATMOSPHERE | [R] RESET | [ESC] PAUSE
      </div>

      <Binder />
      <Achievements />
      <AchievementToast />
      <SlammerSelector />

      <style>{`
        @keyframes pulse {
          0%   { opacity: 1; transform: translateX(-50%) scale(1); }
          50%  { opacity: 0.6; transform: translateX(-50%) scale(1.05); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        @keyframes floatUp {
          0%   { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-80px); }
        }
      `}</style>
    </div>
  );
}
