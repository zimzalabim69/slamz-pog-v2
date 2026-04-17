/**
 * Desktop Controls Component
 * Handles keyboard and mouse input for desktop gameplay
 */

import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

export const DesktopControls = () => {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const resetStack = useGameStore((state) => state.resetStack);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Game controls
      if (key === 'r') {
        resetStack();
      }
      if (key === ' ' && gameState === 'SHOWCASE') {
        setGameState('AIMING');
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState, setGameState, resetStack]);

  // Desktop controls are mostly keyboard-based, no UI needed
  return null;
};
