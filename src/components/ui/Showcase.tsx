// ============================================================
// SHOWCASE — Display captured pogs one by one after a slam
// Ported from v1 UIController.showCaptureShowcase()
// ============================================================

import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { drawPogToCanvas } from '../../utils/TextureGenerator';
import { playJackpotFanfare } from '../../systems/audio';
import './Showcase.css';

export function Showcase() {
  const gameState = useGameStore((s) => s.gameState);
  const currentShowcase = useGameStore((s) => s.currentShowcase);
  const advanceShowcase = useGameStore((s) => s.advanceShowcase);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);

  // Trigger celebratory fanfare exactly once per item
  useEffect(() => {
    if (gameState === 'ROUND_JACKPOT' && currentShowcase) {
      playJackpotFanfare();
    }
  }, [currentShowcase, gameState]);

  useEffect(() => {
    if (!currentShowcase || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let animationId: number;

    const animate = () => {
      rotationRef.current += 0.01; // Slow rotation
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save context state
      ctx.save();
      
      // Move to center and rotate
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotationRef.current);
      
      // Draw pog at origin (will be rotated)
      const { theme, rarity } = currentShowcase;
      drawPogToCanvas(canvas, 'pog', 'metal', theme, rarity);
      
      // Restore context state
      ctx.restore();
      
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [currentShowcase]);

  useEffect(() => {
    if (!currentShowcase || gameState !== 'ROUND_JACKPOT') return;

    const handleSpace = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        advanceShowcase();
      }
    };

    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [currentShowcase, advanceShowcase, gameState]);

  if (gameState !== 'ROUND_JACKPOT' || !currentShowcase) return null;

  const { theme, rarity, setName, setColor, marketValue } = currentShowcase;

  return (
    <div className="capture-showcase-overlay">
      {/* TOP DATA BAR */}
      <div className="showcase-top">
        <div className="showcase-set-name" style={{ color: setColor }}>
          {setName}
        </div>
        <div className="showcase-theme-name">
          {theme.replace(/_/g, ' ').toUpperCase()}
        </div>
      </div>

      {/* CENTER CANVAS */}
      <div className="showcase-center">
        <canvas ref={canvasRef} width={600} height={600} />
      </div>

      {/* LEFT STATS BOX */}
      <div className="showcase-stats">
        <div className="stats-header">COLLECTOR DATA</div>
        <div className="stat-row">
          <div className="stat-label">RARITY LEVEL</div>
          <div className="stat-value rarity">{rarity.toUpperCase()}</div>
        </div>
        <div className="stat-row">
          <div className="stat-label">MARKET VALUE</div>
          <div className="stat-value value">{marketValue.toLocaleString()} 🄿</div>
        </div>
      </div>

      {/* BOTTOM HINT */}
      <div className="showcase-hint">PRESS [SPACE] TO CONTINUE</div>
    </div>
  );
}
