import { useGameStore } from '@100/store/useGameStore';
import { FaceUpEffect } from '@100/components/game/FaceUpEffect';
import { useEffect, useState } from 'react';

export function PracticeHUD() {
  const sessionScore = useGameStore((state) => state.sessionScore);
  const gameMode = useGameStore((state) => state.gameMode);
  const practiceSession = useGameStore((state) => state.practiceSession);
  const faceUpSlamz = useGameStore((state) => state.faceUpSlamz);
  const [glitchOffset, setGlitchOffset] = useState({ x: 0, y: 0 });

  // 90s glitch effect
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchOffset({
        x: Math.random() * 4 - 2,
        y: Math.random() * 4 - 2
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Always show the 90s UI, but enhance practice mode
  const isPracticeMode = gameMode?.includes('PRACTICE') && practiceSession;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const sessionTime = isPracticeMode ? Date.now() - practiceSession!.startTime : 0;

  return (
    <>
      {/* 90s NINJA TURDLES HEADER */}
      <div style={{
        position: 'fixed',
        top: '40px',
        left: '40px',
        transform: `rotate(-3deg) translate(${glitchOffset.x}px, ${glitchOffset.y}px)`,
        zIndex: 1000,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 0 10px #ff00ff)',
      }}>
        <div style={{
          backgroundColor: '#ffff00',
          color: '#000',
          padding: '20px 40px',
          border: '6px solid #000',
          boxShadow: '10px 10px 0 #ff00ff',
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '900',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 1,
          }}>
            NINJA <span style={{color: '#fff', textShadow: '6px 6px 0 #000'}}>TURDLES</span>
          </h1>
        </div>
        <div style={{
          marginTop: '-15px',
          marginLeft: '64px',
          backgroundColor: '#000',
          color: '#00ffff',
          padding: '8px 24px',
          fontSize: '18px',
          fontWeight: '900',
          fontStyle: 'italic',
          border: '4px solid #fff',
          boxShadow: '6px 6px 0 #ff00ff',
        }}>
          ULTIMATE_EDITION.exe
        </div>
      </div>

      {/* 90s DATA BOX */}
      <div style={{
        position: 'fixed',
        right: '48px',
        top: '25%',
        width: '320px',
        transform: `rotate(2deg) translate(${-glitchOffset.x}px, ${-glitchOffset.y}px)`,
        zIndex: 1000,
        pointerEvents: 'auto',
      }}>
        <div style={{
          backgroundColor: '#111',
          border: '5px solid #ff00ff',
          padding: '32px',
          boxShadow: '-15px 15px 0 rgba(0,255,255,1)',
          filter: 'drop-shadow(0 0 20px #00ffff)',
        }}>
          <div style={{color: '#fff', fontFamily: 'monospace', fontSize: '12px', marginBottom: '20px', borderBottom: '4px solid #ffff00', paddingBottom: '8px'}}>
            {'>> ASSET_INTEL'}
          </div>
          <div style={{color: '#00ffff', fontSize: '14px', marginBottom: '10px', transform: 'skewX(-12deg)'}}>RATING:</div>
          <div style={{color: '#fff', fontSize: '3rem', fontWeight: '900', fontStyle: 'italic', transform: 'skewX(-12deg)', textShadow: '4px 4px 0 #ff00ff'}}>STANDARD</div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20px'}}>
            <div style={{transform: 'skewX(-12deg)'}}>
              <div style={{color: '#00ffff', fontSize: '14px', marginBottom: '10px'}}>VALUE:</div>
              <div style={{color: '#ffff00', fontSize: '4rem', fontWeight: '900', fontStyle: 'italic', textShadow: '4px 4px 0 #000'}}>50</div>
            </div>
            <div style={{
              backgroundColor: '#fff',
              color: '#000',
              padding: '12px',
              fontWeight: '900',
              fontSize: '2rem',
              height: '64px',
              width: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: 'rotate(-12deg)',
              border: '4px solid #000',
              boxShadow: '4px 4px 0 #ff00ff',
            }}>
              S
            </div>
          </div>
        </div>
      </div>

      {/* VHS TRACKING OVERLAY */}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '40px',
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'monospace',
        fontSize: '18px',
        fontStyle: 'italic',
        zIndex: 1000,
        pointerEvents: 'none',
      }}>
        PLAY ▶ <span style={{animation: 'pulse 1s infinite'}}>00:24:96:SP</span>
      </div>

      {/* SHOWCASE STICKER */}
      <div style={{
        position: 'fixed',
        bottom: '48px',
        left: '48px',
        transform: `rotate(-6deg) translate(${glitchOffset.x * 0.5}px, ${glitchOffset.y * 0.5}px)`,
        zIndex: 1000,
        pointerEvents: 'none',
      }}>
        <div style={{
          backgroundColor: '#00ffff',
          color: '#000',
          padding: '16px 32px',
          fontWeight: '900',
          fontStyle: 'italic',
          fontSize: '2.5rem',
          border: '6px solid #000',
          boxShadow: '10px 10px 0 #ff00ff',
        }}>
          SHOWCASE!!
        </div>
      </div>

      {/* Original Practice HUD (only in practice mode) */}
      {isPracticeMode && (
        <div className="practice-hud" style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          color: '#00ff00',
          fontFamily: 'monospace',
          fontSize: '14px',
          textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
          zIndex: 1001,
          pointerEvents: 'none',
        }}>
          {/* Session Info */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>
              PRACTICE MODE • {gameMode === 'NO_RESTACK_CHAOS' ? 'CHAOS' : 'FOR KEEPS'}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.6 }}>
              TIME: {formatTime(sessionTime)}
            </div>
          </div>

      {/* Core Stats */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {sessionScore.totalSlamzFlipped}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                SLAMZ FLIPPED
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {sessionScore.currentCombo}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                COMBO x{sessionScore.currentCombo > 1 ? sessionScore.currentCombo : ''}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                {sessionScore.bestCombo}
              </div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>
                BEST COMBO
              </div>
            </div>
          </div>

          {/* Score */}
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            SCORE: {sessionScore.totalScore.toLocaleString()}
          </div>

          {/* Remaining SLAMZ */}
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            REMAINING: {practiceSession!.selectedSlamz.length - sessionScore.totalSlamzFlipped} SLAMZ
          </div>

          {/* Face-up Effects */}
          {faceUpSlamz.map((slamzId, index) => {
            const slamzData = practiceSession!.selectedSlamz.find(s => s.id === slamzId);
            if (!slamzData) return null;
            
            return (
              <FaceUpEffect 
                key={slamzId} 
                slamzId={slamzId} 
                position={[
                  -15 + (index % 3) * 10, // Spread them out
                  10 + Math.floor(index / 3) * 5,
                  0
                ]} 
              />
            );
          })}
        </div>
      )}
    </>
  );
}
