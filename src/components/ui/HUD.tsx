import { useGameStore } from '../../store/useGameStore';
import { SCENE_PRESETS } from '../../constants/game';
import { Binder } from './Binder';
import { Achievements, AchievementToast } from './Achievements';
import { SlammerSelector } from './SlammerSelector';
import { useEffect } from 'react';

export function HUD() {
  const gameState    = useGameStore((s) => s.gameState);
  const power        = useGameStore((s) => s.power);
  const stats        = useGameStore((s) => s.stats);
  const currentAtmosphere = useGameStore((s) => s.currentAtmosphere);
  const cycleAtmosphere   = useGameStore((s) => s.cycleAtmosphere);
  const currentShowcase   = useGameStore((s) => s.currentShowcase);
  const lastSlamText      = useGameStore((s) => s.lastSlamText);
  const resetStack        = useGameStore((s) => s.resetStack);
  const toggleBinder      = useGameStore((s) => s.toggleBinder);
  const toggleAchievements = useGameStore((s) => s.toggleAchievements);
  const peakVelocity       = useGameStore((s) => s.peakVelocity);
  const pogMaxVelocity     = useGameStore((s) => s.debugParams.pogMaxVelocity);

  const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;

  // Keyboard shortcuts for [B] and [A]
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'b') toggleBinder();
      if (e.key.toLowerCase() === 'a') toggleAchievements();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [toggleBinder, toggleAchievements]);

  // Hide HUD during showcase (after all hooks)
  if (currentShowcase) return null;

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: '100%', height: '100%',
      pointerEvents: 'none',
      fontFamily: '"Orbitron", sans-serif',
      color: '#fff',
      zIndex: 10000,
    }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '10px', color: '#ff00cc', letterSpacing: '2px' }}>VIBEJAM 2026: PRO-TOUR</div>
          
          {/* DIAGNOSTIC VELOCITY METER */}
          <div style={{ 
            marginTop: '8px', 
            padding: '4px 8px', 
            background: 'rgba(0,0,0,0.4)', 
            borderLeft: '2px solid #00ffcc',
            display: 'inline-block'
          }}>
            <div style={{ fontSize: '8px', color: '#00ffcc', opacity: 0.8, letterSpacing: '1px' }}>PEAK VELOCITY</div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 900, 
              color: peakVelocity > pogMaxVelocity * 0.95 ? '#ff0044' : '#fff',
              fontFamily: '"Share Tech Mono", monospace' 
            }}>
              {peakVelocity.toFixed(2)} <span style={{ fontSize: '10px', opacity: 0.5 }}>m/s</span>
            </div>
          </div>

          {gameState !== 'START_SCREEN' && (
            <>
              <div style={{ fontSize: '24px', fontWeight: 900, margin: '4px 0' }}>{gameState}</div>
              <div style={{ fontSize: '10px', color: '#00ffcc', marginTop: '8px' }}>
                POGS WON: <span style={{ color: '#fff', fontSize: '14px' }}>{stats.pogsWon}</span>
              </div>
            </>
          )}
        </div>

        {gameState !== 'START_SCREEN' && (
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
          </div>
        )}
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

      {/* ── FOOTER HINTS ──────────────────────────────────── */}
      {gameState !== 'START_SCREEN' && (
        <>
          <div style={{
            position: 'absolute', bottom: '20px', left: '20px',
            display: 'flex', flexDirection: 'column', gap: '8px',
            pointerEvents: 'auto'
          }}>
            <button
              onClick={() => toggleBinder()}
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid #00ffcc',
                color: '#00ffcc',
                padding: '8px 16px', fontSize: '10px',
                fontFamily: 'inherit', cursor: 'pointer',
                letterSpacing: '1px', fontWeight: 'bold'
              }}
            >
              BINDER [B]
            </button>
            <button
              onClick={() => toggleAchievements()}
              style={{
                background: 'rgba(0,0,0,0.6)',
                border: '1px solid #ffaa00',
                color: '#ffaa00',
                padding: '8px 16px', fontSize: '10px',
                fontFamily: 'inherit', cursor: 'pointer',
                letterSpacing: '1px', fontWeight: 'bold'
              }}
            >
              ACHIEVEMENTS [A]
            </button>
          </div>

          <div style={{
            position: 'absolute', bottom: '20px', width: '100%',
            textAlign: 'center', fontSize: '9px', opacity: 0.5, letterSpacing: '2px'
          }}>
            [LEFT CLICK] HOLD TO CHARGE | [E] ATMOSPHERE | [R] RESET
          </div>
        </>
      )}

      {gameState !== 'START_SCREEN' && (
        <>
          <Binder />
          <Achievements />
          <SlammerSelector />
        </>
      )}
      <AchievementToast />

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


