/**
 * Touch Controls Hook
 * Handles touch gestures and mobile input mapping
 */

import { useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/useGameStore';

export interface TouchPoint {
  id: number;
  x: number;
  y: number;
  startTime: number;
}

export const useTouchControls = () => {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const setPower = useGameStore((state) => state.setPower);
  const setPowerDirection = useGameStore((state) => state.setPowerDirection);
  
  const touchPoints = useRef<Map<number, TouchPoint>>(new Map());
  const lastTouchTime = useRef(0);
  
  // Handle touch start
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    
    // Track all touch points
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      touchPoints.current.set(touch.identifier, {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        startTime: now,
      });
    }
    
    // Single touch = start aiming/power
    if (e.touches.length === 1 && gameState === 'AIMING') {
      const touch = e.touches[0];
      
      // Map touch to mouse event for aiming
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      window.dispatchEvent(mouseEvent);
      
      // Start power charging
      setGameState('POWERING');
      setPower(0);
      setPowerDirection(1);
      
      // Trigger mousedown
      const mouseDownEvent = new MouseEvent('mousedown');
      window.dispatchEvent(mouseDownEvent);
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
    
    // Double tap detection for special actions
    if (now - lastTouchTime.current < 300) {
      // Double tap detected - could be used for special moves
      handleDoubleTap();
    }
    lastTouchTime.current = now;
  }, [gameState, setGameState, setPower, setPowerDirection]);
  
  // Handle touch move
  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 1 && (gameState === 'POWERING' || gameState === 'AIMING')) {
      const touch = e.touches[0];
      
      // Update aiming position
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      window.dispatchEvent(mouseEvent);
    }
  }, [gameState]);
  
  // Handle touch end
  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault();
    
    // Remove ended touch points
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      touchPoints.current.delete(touch.identifier);
    }
    
    // If all touches ended and we were powering, execute slam
    if (e.touches.length === 0 && gameState === 'POWERING') {
      setGameState('SLAMMED');
      
      // Trigger mouseup
      const mouseUpEvent = new MouseEvent('mouseup');
      window.dispatchEvent(mouseUpEvent);
      
      // Haptic feedback for slam
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [gameState, setGameState]);
  
  // Handle double tap
  const handleDoubleTap = useCallback(() => {
    // Could be used for special abilities or menu navigation
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }, []);
  
    
  // Set up touch listeners
  useEffect(() => {
    const options = { passive: false };
    
    window.addEventListener('touchstart', handleTouchStart, options);
    window.addEventListener('touchmove', handleTouchMove, options);
    window.addEventListener('touchend', handleTouchEnd, options);
    window.addEventListener('touchcancel', handleTouchEnd, options);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
  
  // Prevent default touch behaviors on mobile
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    
    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchmove', preventDefault, { passive: false });
    
    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchmove', preventDefault);
    };
  }, []);
  
  return {
    touchPoints: Array.from(touchPoints.current.values()),
    isTouching: touchPoints.current.size > 0,
  };
};
