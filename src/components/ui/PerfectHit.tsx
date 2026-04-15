import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';

export function PerfectHit() {
  const perfectHitActive = useGameStore((state) => state.perfectHitActive);
  
  const overlayRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (perfectHitActive && overlayRef.current && textRef.current) {
      // Full screen flash
      overlayRef.current.style.opacity = '1';
      
      // Show PERFECT text with animation
      textRef.current.style.transform = 'scale(0)';
      textRef.current.style.opacity = '0';
      
      setTimeout(() => {
        if (textRef.current) {
          textRef.current.style.transform = 'scale(1.5)';
          textRef.current.style.opacity = '1';
        }
      }, 100);
      
      // Apply slow motion effect
      document.body.style.transition = 'all 0.3s ease';
      document.body.style.filter = 'brightness(1.5) contrast(1.2)';
      
      // Hide after 2 seconds
      setTimeout(() => {
        if (overlayRef.current && textRef.current) {
          overlayRef.current.style.opacity = '0';
          textRef.current.style.opacity = '0';
          document.body.style.filter = 'none';
          
          // Reset perfect hit flag
          useGameStore.setState({ perfectHitActive: false });
        }
      }, 2000);
    }
  }, [perfectHitActive]);

  if (!perfectHitActive) return null;

  return (
    <>
      {/* Full screen white flash */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 3000,
          transition: 'opacity 0.1s ease',
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      
      {/* PERFECT text */}
      <div
        ref={textRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '120px',
          fontWeight: '900',
          fontFamily: 'monospace',
          letterSpacing: '12px',
          color: '#ff00ff',
          textShadow: `
            0 0 40px #ff00ff,
            0 0 80px #ff00ff,
            0 0 120px #ff00ff,
            0 0 160px #ff00ff,
            0 0 200px #ff00ff
          `,
          zIndex: 3001,
          transition: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          userSelect: 'none',
          pointerEvents: 'none',
          textAlign: 'center',
          whiteSpace: 'nowrap',
          opacity: 0,
        }}
      >
        PERFECT
      </div>
    </>
  );
}
