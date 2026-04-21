/**
 * Mobile Virtual Controls (V2 - High Performance)
 * Optimized for zero-jitter and low-latency touch response.
 */

import { useRef, useState, useCallback } from 'react';
import { useGameStore } from '@100/store/useGameStore';
import './MobileControls.css';

interface JoystickData {
  x: number;
  y: number;
  active: boolean;
}

export const MobileControls = () => {
  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const setPower = useGameStore((state) => state.setPower);
  const setPowerDirection = useGameStore((state) => state.setPowerDirection);
  
  // Reactive power for the UI bar
  const powerValue = useGameStore((state) => state.power);
  
  const joystickRef = useRef<HTMLDivElement>(null);
  const actionButtonRef = useRef<HTMLDivElement>(null);
  
  // Caching rects to avoid layout thrashing during touchmove
  const joystickRect = useRef<DOMRect | null>(null);
  const actionRect = useRef<DOMRect | null>(null);
  
  const [joystick, setJoystick] = useState<JoystickData>({ x: 0, y: 0, active: false });
  const [actionPressed, setActionPressed] = useState(false);

  // Decoupled mouse event dispatch
  const dispatchSimulatedMouseMove = useCallback((x: number, y: number) => {
    requestAnimationFrame(() => {
      const event = new MouseEvent('mousemove', {
        clientX: x,
        clientY: y,
        bubbles: true
      });
      window.dispatchEvent(event);
    });
  }, []);

  const handleJoystickMove = useCallback((clientX: number, clientY: number) => {
    const rect = joystickRect.current;
    if (!rect) return;
    
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2 - 10;
    
    if (distance > maxDistance) {
      deltaX = (deltaX / distance) * maxDistance;
      deltaY = (deltaY / distance) * maxDistance;
    }
    
    const normalizedX = deltaX / maxDistance;
    const normalizedY = deltaY / maxDistance;
    
    setJoystick({ x: normalizedX, y: normalizedY, active: true });
    dispatchSimulatedMouseMove(centerX + deltaX, centerY + deltaY);
  }, [dispatchSimulatedMouseMove]);

  const handleJoystickEnd = useCallback(() => {
    setJoystick({ x: 0, y: 0, active: false });
    // Center mouse fallback
    dispatchSimulatedMouseMove(window.innerWidth / 2, window.innerHeight / 2);
  }, [dispatchSimulatedMouseMove]);

  const handleActionStart = useCallback(() => {
    if (gameState === 'AIMING') {
      setActionPressed(true);
      setGameState('POWERING');
      setPower(0);
      setPowerDirection(1);
      
      const event = new MouseEvent('mousedown', { bubbles: true });
      window.dispatchEvent(event);
      
      if ('vibrate' in navigator) navigator.vibrate(40);
    }
  }, [gameState, setGameState, setPower, setPowerDirection]);

  const handleActionEnd = useCallback(() => {
    if (gameState === 'POWERING') {
      setActionPressed(false);
      const event = new MouseEvent('mouseup', { bubbles: true });
      window.dispatchEvent(event);
    }
  }, [gameState]);

  // Main Touch Handlers (Scoped to component)
  const onTouchStart = (e: React.TouchEvent) => {
    // Refresh rects on start to handle orientation changes or layout shifts
    if (joystickRef.current) joystickRect.current = joystickRef.current.getBoundingClientRect();
    if (actionButtonRef.current) actionRect.current = actionButtonRef.current.getBoundingClientRect();

    Array.from(e.changedTouches).forEach(touch => {
      const { clientX, clientY } = touch;
      
      // Check Joystick
      if (joystickRect.current) {
        const r = joystickRect.current;
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
          handleJoystickMove(clientX, clientY);
        }
      }
      
      // Check Action
      if (actionRect.current) {
        const r = actionRect.current;
        if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
          handleActionStart();
        }
      }
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    Array.from(e.changedTouches).forEach(touch => {
      const { clientX, clientY } = touch;
      if (joystick.active && joystickRect.current) {
        handleJoystickMove(clientX, clientY);
      }
    });
  };

  const onTouchEnd = () => {
    handleJoystickEnd();
    handleActionEnd();
  };

  return (
    <div 
      className="mobile-controls"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      {/* Thumb Aiming Area */}
      <div 
        ref={joystickRef}
        className={`joystick-container joystick-left ${joystick.active ? 'active' : ''}`}
      >
        <div className="joystick-base">
          <div 
            className="joystick-knob joystick-knob-position"
            style={{
              transform: `translate(calc(-50% + ${joystick.x * 40}px), calc(-50% + ${joystick.y * 40}px))`
            } as React.CSSProperties}
          />
        </div>
        <div className="joystick-label">AIM</div>
      </div>

      {/* Slam Button Area */}
      <div 
        ref={actionButtonRef}
        className={`action-button action-right ${actionPressed ? 'pressed' : ''}`}
      >
        <div className="action-button-content">
          <div className="action-icon">SLAM</div>
          {gameState === 'POWERING' && (
            <div className="power-indicator">
              <div 
                className="power-fill"
                style={{
                  width: `${powerValue}%`
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Responsive Viewport Guard */}
      {window.innerWidth < window.innerHeight && (
        <div className="portrait-notice">
          ROTATE FOR PRO-TOUR MODE
        </div>
      )}
    </div>
  );
};

