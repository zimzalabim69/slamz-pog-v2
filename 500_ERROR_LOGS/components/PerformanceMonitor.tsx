import { useState, useEffect } from 'react';
import { Stats } from '@react-three/drei';

export function PerformanceMonitor() {
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setShowStats(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!showStats) return null;

  return (
    <>
      <Stats />
      <div style={{
        position: 'fixed',
        top: '10px',
        left: '10px',
        color: '#00ff00',
        fontFamily: 'monospace',
        fontSize: '12px',
        background: 'rgba(0,0,0,0.7)',
        padding: '5px',
        borderRadius: '3px',
        zIndex: 10000,
        pointerEvents: 'none'
      }}>
        Press F1 to hide performance stats
      </div>
    </>
  );
}
