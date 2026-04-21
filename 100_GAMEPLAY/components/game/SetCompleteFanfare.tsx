import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@100/store/useGameStore';
import { SET_DEFS } from '@100/constants/setDefinitions';
import gsap from 'gsap';

export const SetCompleteFanfare = () => {
  const completedSets = useGameStore((s) => s.completedSets);
  const [activeSet, setActiveSet] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastProcessedCount = useRef(completedSets.length);

  useEffect(() => {
    if (completedSets.length > lastProcessedCount.current) {
      const newSetId = completedSets[completedSets.length - 1];
      setActiveSet(newSetId);
      lastProcessedCount.current = completedSets.length;
    }
  }, [completedSets]);

  useEffect(() => {
    if (activeSet && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.timeline({
          onComplete: () => setActiveSet(null)
        })
        .fromTo('.fanfare-overlay', { opacity: 0 }, { opacity: 1, duration: 0.5 })
        .fromTo('.fanfare-text', { scale: 0, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(1.7)' })
        .to('.fanfare-text', { y: -20, repeat: 3, yoyo: true, duration: 0.2 })
        .to('.fanfare-overlay', { opacity: 0, duration: 1, delay: 2 });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [activeSet]);

  if (!activeSet) return null;

  const setDef = SET_DEFS[activeSet];
  if (!setDef) return null;

  return (
    <div ref={containerRef} className="set-fanfare-wrapper" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      fontFamily: "'Orbitron', sans-serif"
    }}>
      <div className="fanfare-overlay" style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)'
      }} />
      
      <div className="fanfare-content" style={{ position: 'relative', textAlign: 'center' }}>
        <h2 className="fanfare-text" style={{ 
          color: setDef.color, 
          fontSize: '4rem', 
          textShadow: `0 0 20px ${setDef.color}`,
          margin: 0
        }}>
          SET COMPLETE!!
        </h2>
        <h3 className="fanfare-subtext" style={{ 
          color: '#fff', 
          fontSize: '2rem', 
          marginTop: '10px',
          letterSpacing: '5px'
        }}>
          {setDef.name.toUpperCase()}
        </h3>
        <div style={{ marginTop: '30px', color: '#555' }}>
          NEW SLAMMER UNLOCKED: {setDef.slammer.replace('_', ' ').toUpperCase()}
        </div>
      </div>
    </div>
  );
};
