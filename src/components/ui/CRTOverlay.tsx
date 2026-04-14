import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/useGameStore';

export function CRTOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGameStore((state) => state.gameState);
  const currentAtmosphere = useGameStore((state) => state.currentAtmosphere);
  
  const flickerRef = useRef(0);
  const shakeXRef = useRef(0);
  const rgbShiftRef = useRef(0);
  const noiseRef = useRef(0);

  // Trigger slam reaction
  useEffect(() => {
    if (gameState === 'SLAMMED') {
        flickerRef.current = 1.0;
        shakeXRef.current = 8.0;
        rgbShiftRef.current = 5.0;
        noiseRef.current = 0.8;
    }
  }, [gameState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let animationId: number;

    const render = () => {
      const W = canvas.width = window.innerWidth;
      const H = canvas.height = window.innerHeight;
      
      ctx.clearRect(0, 0, W, H);

      // 1. SCANLINES
      const alphaBase = currentAtmosphere === 'CYBER_ALLEY' ? 0.25 : 0.15;
      const stride = 5;
      ctx.fillStyle = `rgba(0, 0, 0, ${alphaBase})`;
      for (let y = 0; y < H; y += stride) {
        const jitter = shakeXRef.current > 0 ? (Math.random() - 0.5) * shakeXRef.current : 0;
        ctx.fillRect(jitter, y, W, 2);
      }

      // 2. VIGNETTE
      const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H * 0.9);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, `rgba(0,0,0,${0.6 + flickerRef.current * 0.2})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);

      // 3. NOISE (On Slam)
      if (noiseRef.current > 0.05) {
        ctx.fillStyle = `rgba(255,255,255,${noiseRef.current * 0.1})`;
        for (let i = 0; i < 500; i++) {
          ctx.fillRect(Math.random() * W, Math.random() * H, 2, 1);
        }
      }

      // 4. RGB SHIFT (Fringe)
      if (rgbShiftRef.current > 0.2) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 0, 0, ${rgbShiftRef.current * 0.02})`;
        ctx.fillRect(-rgbShiftRef.current, 0, W, H);
        ctx.fillStyle = `rgba(0, 0, 255, ${rgbShiftRef.current * 0.02})`;
        ctx.fillRect(rgbShiftRef.current, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      }

      // 5. DECAY
      flickerRef.current *= 0.92;
      shakeXRef.current *= 0.85;
      rgbShiftRef.current *= 0.92;
      noiseRef.current *= 0.9;

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [currentAtmosphere]);

  return (
    <canvas 
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 100,
        mixBlendMode: 'multiply'
      }}
    />
  );
}
