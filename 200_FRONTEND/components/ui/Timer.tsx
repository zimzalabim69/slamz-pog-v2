import { useEffect, useRef } from 'react';
import { useGameStore } from '@100/store/useGameStore';

export function Timer() {
  const gameTimer = useGameStore((state) => state.gameTimer);
  const sessionActive = useGameStore((state) => state.sessionActive);
  
  const timerRef = useRef<HTMLDivElement>(null);
  const lastTimerRef = useRef<number>(120);

  // Add flicker animation when time is low
  useEffect(() => {
    if (timerRef.current) {
      const isLowTime = gameTimer <= 10;
      const isVeryLowTime = gameTimer <= 5;
      
      timerRef.current.style.color = isVeryLowTime ? '#ff0000' : isLowTime ? '#ff6600' : '#00ffff';
      timerRef.current.style.textShadow = isLowTime ? 
        `0 0 20px ${isVeryLowTime ? '#ff0000' : '#ff6600'}, 0 0 40px ${isVeryLowTime ? '#ff0000' : '#ff6600'}` :
        '0 0 20px #00ffff, 0 0 40px #00ffff';
      
      // Add flicker animation for very low time
      if (isVeryLowTime) {
        timerRef.current.style.animation = 'flicker 0.5s infinite';
      } else {
        timerRef.current.style.animation = 'pulse 2s infinite';
      }
      
      // Add scale animation when timer changes
      if (Math.abs(gameTimer - lastTimerRef.current) > 0.5) {
        timerRef.current.style.transform = 'scale(1.2)';
        setTimeout(() => {
          if (timerRef.current) {
            timerRef.current.style.transform = 'scale(1)';
          }
        }, 200);
      }
      
      lastTimerRef.current = gameTimer;
    }
  }, [gameTimer]);

  if (!sessionActive) return null;

  const minutes = Math.floor(gameTimer / 60);
  const seconds = Math.floor(gameTimer % 60);
  const displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      ref={timerRef}
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '48px',
        fontWeight: '900',
        fontFamily: 'monospace',
        letterSpacing: '4px',
        color: '#00ffff',
        textShadow: '0 0 20px #00ffff, 0 0 40px #00ffff',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {displayTime}
    </div>
  );
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes flicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;
if (!document.head.querySelector('style[data-timer-animations]')) {
  style.setAttribute('data-timer-animations', 'true');
  document.head.appendChild(style);
}
