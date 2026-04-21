import { useGameStore } from '@100/store/useGameStore';
import { useEffect } from 'react';
import './HUD.css';

export function HUD() {
  const gameState    = useGameStore((s) => s.gameState);
  const power        = useGameStore((s) => s.power);
  const resetStack        = useGameStore((s) => s.resetStack);
  const peakVelocity       = useGameStore((s) => s.peakVelocity);
  const slamzMaxVelocity     = useGameStore((s) => s.debugParams.slamzMaxVelocity);
  const slamzOnMat          = useGameStore((s) => s.slamzOnMat);
  const lastSlamText       = useGameStore((s) => s.lastSlamText);
  const throwsRemaining    = useGameStore((s) => s.throwsRemaining);
  const dataPackets = useGameStore((s) => s.dataPackets);
  const impactFlashActive = useGameStore((s) => s.impactFlashActive);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'r') resetStack();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resetStack]);


  return (
    <div className={`hud-container ${gameState === 'HARVEST' ? 'hud-glitch-active' : ''}`}>
      {/* ── SLAM IMPACT FLASH ── */}
      {impactFlashActive && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 9000,
          background: 'radial-gradient(ellipse at 50% 60%, rgba(180,0,255,0.55) 0%, rgba(0,200,255,0.25) 50%, transparent 100%)',
          pointerEvents: 'none',
          animation: 'impactFlashAnim 0.2s ease-out forwards',
        }} />
      )}
      {/* ── CINEMATIC OVERLAYS ── */}
      <div className="hud-scanline" />
      <div className="hud-vignette" />
      
      {/* ── NARRATIVE INTERFERENCE ── */}
      {gameState === 'HARVEST' && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          fontSize: '48px', fontWeight: 900, color: '#ff0055', textTransform: 'uppercase',
          letterSpacing: '15px', textShadow: '0 0 30px #ff0055', textAlign: 'center',
          pointerEvents: 'none', zIndex: 1000
        }}>
          WRAITH_INTERFERENCE_DETECTED
          <div style={{ fontSize: '14px', letterSpacing: '2px', marginTop: '10px', opacity: 0.7 }}>
            ANALYZING_BREach_FRAGMENT... [ STOP_THEM_ ]
          </div>
        </div>
      )}

      <div className="hud-bracket br-tl" />
      <div className="hud-bracket br-tr" />
      <div className="hud-bracket br-bl" />
      <div className="hud-bracket br-br" />

      {/* ── HEADER DATA ── */}
      <div style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* VELOCITY METER */}
          {gameState !== 'START_SCREEN' && (
            <div className="hud-meter">
              <div className="hud-meter-header">INERTIAL FORCE</div>
              <div style={{ 
                fontSize: '20px', fontWeight: 900, 
                color: peakVelocity > slamzMaxVelocity * 0.9 ? '#ff0055' : '#00ffcc'
              }}>
                {peakVelocity.toFixed(2)} <span style={{ fontSize: '10px', opacity: 0.5 }}>MAG</span>
              </div>
            </div>
          )}

          {/* STATUS METER */}
          {gameState !== 'START_SCREEN' && (
            <div className="hud-meter" style={{ borderColor: 'rgba(255, 0, 85, 0.3)' }}>
              <div className="hud-meter-header" style={{ color: '#ff0055' }}>SYSTEM STATUS</div>
              <div style={{ fontSize: '16px', fontWeight: 900 }}>
                {gameState === 'AIMING' ? 'READY_PROBE' : 
                 gameState === 'POWERING' ? 'EXTRACT_ARMED' : 
                 gameState === 'SLAMMED' ? 'BYPASS_ACTIVE' : 
                 gameState === 'HARVEST' ? 'DECRYPTING_DATA_STREAM' : gameState}
              </div>
            </div>
          )}

          {/* ATTEMPTS METER (3-Shot Protocol) */}
          {gameState !== 'START_SCREEN' && (
            <div className="hud-meter">
              <div className="hud-meter-header">EXTRACT ATTEMPTS</div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i}
                    style={{
                      width: '12px',
                      height: '12px',
                      background: i < throwsRemaining ? '#00ffcc' : 'rgba(255, 0, 85, 0.2)',
                      boxShadow: i < throwsRemaining ? '0 0 10px #00ffcc' : 'none',
                      border: '1px solid rgba(255,255,255,0.1)',
                      transition: 'all 0.3s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* TOP RIGHT STATS */}
        {gameState !== 'START_SCREEN' && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="hud-meter">
              <div className="hud-meter-header">CYCLE SHARDS BROKEN</div>
              <div style={{ fontSize: '18px', fontWeight: 900, textAlign: 'right' }}>{slamzOnMat}</div>
            </div>
            <div className="hud-meter" style={{ pointerEvents: 'auto' }}>
              <button
                onClick={() => resetStack()}
                style={{
                  background: 'none', border: 'none', color: '#fff',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px',
                  letterSpacing: '1px', opacity: 0.7
                }}
              >
                [ RESET_SYSTEM ]
              </button>
            </div>
          </div>
        )}
      </div>


      {/* ── DATA STREAM (SIDE) ── */}
      {gameState !== 'START_SCREEN' && (
        <div className="data-stream">
          <div className="data-stream-header">LIVE_FEED_STREAM</div>
          {gameState === 'HARVEST' && (
            <div style={{ color: '#ff0055', fontWeight: 900, marginBottom: '20px', fontSize: '10px' }}>
              {['I_SEE_EVERYTHING', 'YOUR_DATA_IS_MINE', 'REST_IN_SILICON', 'GHOST_IN_STREAM'].map((t, i) => (
                <div key={i} style={{ animation: `textFlicker 0.1s infinite ${i * 0.2}s` }}>{t}</div>
              ))}
            </div>
          )}
          <div className="data-stream-content">
            {dataPackets.map((p, i) => (
              <div key={`${p}-${i}`} style={{ opacity: 1 - i * 0.05 }}>
                0x{p}_FRAGMENT_RECOVERED
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── EXTRACTOR POWER BAR ── */}
      {gameState === 'POWERING' && (
        <div className="extractor-bar-container">
          <div className="extractor-bar-fill" style={{ width: `${power}%` }} />
          <div className="extractor-bar-pulse">
            {power > 95 ? 'CRITICAL_BREACH_THRESHOLD' : 'HARVEST_EXTRACTION_CHARGING'}
          </div>
        </div>
      )}

      {/* ── POPUP TEXT ── */}
      {lastSlamText && <div className="last-slam-popup">{lastSlamText}</div>}

      {/* ── FOOTER ── */}
      {gameState !== 'START_SCREEN' && (
        <div style={{
          position: 'absolute', bottom: '30px', width: '100%',
          display: 'flex', justifyContent: 'flex-end', padding: '0 30px',
          pointerEvents: 'none'
        }}>
          <div style={{ 
            fontSize: '10px', opacity: 0.4, textTransform: 'uppercase', 
            letterSpacing: '3px', alignSelf: 'center' 
          }}>
            LOCAL_HOST::4173 // S.L.A.M.Z. CORE V2.3 // SYNCHRONIZED LEGACY ARCADE MEMORY ZONE
          </div>
        </div>
      )}

      {/* Slammer Selector removed for production aesthetic */}

      <style>{`
        .last-slam-popup {
          position: absolute; left: 50%; top: 35%;
          transform: translateX(-50%);
          color: #ffaa00; fontSize: 64px; fontWeight: 900;
          text-shadow: 0 0 20px #ffaa00;
          animation: cinematicFloat 1.2s forwards;
          pointer-events: none;
        }
        @keyframes cinematicFloat {
          0% { opacity: 0; transform: translate(-50%, 20px) scale(0.8); letter-spacing: 20px; }
          20% { opacity: 1; transform: translate(-50%, 0) scale(1); letter-spacing: 2px; }
          100% { opacity: 0; transform: translate(-50%, -100px) scale(1.1); letter-spacing: 10px; }
        }
      `}</style>
    </div>
  );
}
