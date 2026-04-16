import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';

/**
 * COLLISION TUNING SUITE
 * An auto-pilot engine for physics testing.
 * Automatically resets and slams the stack when autoSlamActive is true.
 */
export function CollisionTuningSuite() {
  const gameState = useGameStore((s) => s.gameState);
  const autoSlamActive = useGameStore((s) => s.autoSlamActive);
  const resetStack = useGameStore((s) => s.resetStack);
  const setGameState = useGameStore((s) => s.setGameState);
  const setPower = useGameStore((s) => s.setPower);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!autoSlamActive) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // SCENARIO 1: We are at the end of a round (Session Summary)
    if (gameState === 'SESSION_SUMMARY') {
      timerRef.current = setTimeout(() => {
        console.log('[TUNER] 🔄 AUTO-RESETTING STACK...');
        resetStack();
        setGameState('AIMING');
      }, 1500); // Wait for the showcase to be seen
    }

    // SCENARIO 2: We are ready to slam (Aiming)
    if (gameState === 'AIMING') {
      timerRef.current = setTimeout(() => {
        // 1. Force a clean physics reset first
        window.dispatchEvent(new CustomEvent('RESET_SLAMMER_TRIGGER'));
        
        // 2. Set fixed power for consistency
        const powerValue = useGameStore.getState().debugParams.autoSlamPower;
        setPower(powerValue);
        
        // 3. Notify the Slammer to execute after a tiny physics-sync delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('AUTO_SLAM_TRIGGER', { 
              detail: { power: powerValue } 
          }));
        }, 50);
      }, 1000); // Wait for the slammer to mount
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, autoSlamActive, resetStack, setGameState, setPower]);

  return null;
}


