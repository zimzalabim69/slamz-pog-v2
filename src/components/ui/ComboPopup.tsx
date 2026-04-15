import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';

export function ComboPopup() {
  const currentCombo = useGameStore((state) => state.currentCombo);
  const comboMultiplier = useGameStore((state) => state.comboMultiplier);
  
  const popupRef = useRef<HTMLDivElement>(null);
  const lastComboRef = useRef<number>(0);

  useEffect(() => {
    if (currentCombo > 1 && currentCombo !== lastComboRef.current) {
      // Combo increased - show popup with animation
      if (popupRef.current) {
        popupRef.current.style.transform = 'scale(0)';
        popupRef.current.style.opacity = '0';
        
        // Trigger animation
        setTimeout(() => {
          if (popupRef.current) {
            popupRef.current.style.transform = 'scale(1.2)';
            popupRef.current.style.opacity = '1';
            
            // Add screen shake
            const originalTransform = document.body.style.transform;
            document.body.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
            
            setTimeout(() => {
              document.body.style.transform = originalTransform;
              if (popupRef.current) {
                popupRef.current.style.transform = 'scale(1)';
              }
            }, 150);
            
            // Hide after 1.5 seconds
            setTimeout(() => {
              if (popupRef.current) {
                popupRef.current.style.opacity = '0';
              }
            }, 1500);
          }
        }, 50);
      }
      
      lastComboRef.current = currentCombo;
    }
  }, [currentCombo]);

  if (currentCombo <= 1) return null;

  return (
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '72px',
        fontWeight: '900',
        fontFamily: 'monospace',
        letterSpacing: '8px',
        color: '#ff00ff',
        textShadow: `
          0 0 30px #ff00ff,
          0 0 60px #ff00ff,
          0 0 90px #ff00ff,
          0 0 120px #ff00ff
        `,
        zIndex: 2000,
        transition: 'all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        userSelect: 'none',
        pointerEvents: 'none',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      x{comboMultiplier.toFixed(0)} COMBO
    </div>
  );
}
