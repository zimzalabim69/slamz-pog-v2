import { useEffect, useRef } from 'react';
import { useGameStore } from '@100/store/useGameStore';
import { GAME_CONFIG } from '@100/constants/gameConfig';

/**
 * SLAMZ ARCADE TUBE OVERLAY - AGGRESSIVE VERSION
 * A high-fidelity CRT simulation with curvature, scanlines, and phosphor hum.
 */
export function CRTOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGameStore((state) => state.gameState);
  const qualityLevel = useGameStore((state) => state.qualityLevel);
  const impactFlashActive = useGameStore((state) => state.impactFlashActive);
  const perfectHitActive = useGameStore((state) => state.perfectHitActive);
  const debugParams = useGameStore((state) => state.debugParams);

  const { 
    crtScanlineIntensity, 
    crtScanlineHeight, 
    crtVignetteIntensity, 
    crtFlickerIntensity, 
    crtPhosphorBurn, 
    crtJitterIntensity,
    crtWarmth
  } = debugParams;
  
  const flickerRef = useRef(0);
  const shakeXRef = useRef(0);
  const rgbShiftRef = useRef(0);
  const noiseRef = useRef(0);
  const impactFlashRef = useRef(0);
  const timeRef = useRef(0);

  // Sync canvas size
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Trigger slam reaction
  useEffect(() => {
    if (gameState === 'SLAMMED') {
        flickerRef.current = 1.0;
        shakeXRef.current = 25 * crtJitterIntensity; 
        rgbShiftRef.current = 15; 
        noiseRef.current = 1.0;
    }
  }, [gameState, crtJitterIntensity]);

  // Trigger impact flash & chromatic burst
  useEffect(() => {
    if (impactFlashActive || perfectHitActive) {
        impactFlashRef.current = perfectHitActive ? 1.0 : 0.7;
        rgbShiftRef.current = perfectHitActive ? 60 : 25;
        flickerRef.current = 1.0;
    }
  }, [impactFlashActive, perfectHitActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true })!;
    let animationId: number;

    const render = (time: number) => {
      if (qualityLevel === 'low' || gameState === 'START_SCREEN') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationId = requestAnimationFrame(render);
        return;
      }

      const W = canvas.width;
      const H = canvas.height;
      timeRef.current = time * 0.001;
      
      ctx.clearRect(0, 0, W, H);

      // 1. DYNAMIC SCANLINES (User Controlled)
      // 1. DYNAMIC SUBPIXEL SCANLINES
      const scanlineStride = Math.max(2, crtScanlineHeight * 1.5);
      const humPos = (timeRef.current * 40) % H; 

      ctx.beginPath();
      for (let y = 0; y < H; y += scanlineStride) {
        const jitter = (Math.random() - 0.5) * (shakeXRef.current * 0.5 + crtJitterIntensity);
        const distToHum = Math.abs(y - humPos);
        const humFactor = Math.max(0, 1.0 - distToHum / 400) * 0.05 * crtFlickerIntensity;
        
        ctx.fillStyle = `rgba(0, 0, 0, ${crtScanlineIntensity * 0.8 + humFactor})`;
        ctx.fillRect(jitter, y, W, crtScanlineHeight * 0.5);
      }

      // 2. RGB MASK (Phosphor Triads)
      const pixelSize = 3;
      ctx.globalAlpha = 0.02 * crtPhosphorBurn * 5;
      for(let x = 0; x < W; x += pixelSize * 3) {
          ctx.fillStyle = '#ff0000'; ctx.fillRect(x, 0, pixelSize, H);
          ctx.fillStyle = '#00ff00'; ctx.fillRect(x + pixelSize, 0, pixelSize, H);
          ctx.fillStyle = '#0000ff'; ctx.fillRect(x + pixelSize * 2, 0, pixelSize, H);
      }
      ctx.globalAlpha = 1.0;

      // 3. RGB SHIFT / FRINGING
      if (rgbShiftRef.current > 0.2) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 0, 80, ${rgbShiftRef.current * 0.05})`;
        ctx.fillRect(-rgbShiftRef.current * 0.5, 0, W, H);
        ctx.fillStyle = `rgba(0, 240, 255, ${rgbShiftRef.current * 0.05})`;
        ctx.fillRect(rgbShiftRef.current * 0.5, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      }

      // 4. DYING TUBE VIGNETTE (The "Old Monitor" feel)
      const tubeGradient = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 1.2);
      tubeGradient.addColorStop(0, `rgba(40, 20, 0, ${crtWarmth * 0.1})`);
      tubeGradient.addColorStop(0.5, 'rgba(0,0,0,0)');
      tubeGradient.addColorStop(0.8, `rgba(0,0,0,${crtVignetteIntensity * 0.5})`);
      tubeGradient.addColorStop(1, `rgba(0,0,0,${crtVignetteIntensity * 0.9 + flickerRef.current * 0.1})`);
      ctx.fillStyle = tubeGradient;
      ctx.fillRect(0, 0, W, H);

      // 5. SCREEN BRIGHTNESS HUM
      const microFlicker = (Math.sin(timeRef.current * 60) * 0.5 + 0.5) * 0.02 * crtFlickerIntensity;
      ctx.fillStyle = `rgba(255, 255, 255, ${microFlicker})`;
      ctx.fillRect(0, 0, W, H);

      // 6. IMPACT FLASH
      if (impactFlashRef.current > 0.01) {
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255, 255, 255, ${impactFlashRef.current * 0.4})`;
        ctx.fillRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'source-over';
      }

      // 7. DECAY internal values
      flickerRef.current *= 0.94;
      shakeXRef.current *= 0.88;
      rgbShiftRef.current *= 0.94;
      noiseRef.current *= 0.92;
      impactFlashRef.current *= 0.85;

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [
    qualityLevel, 
    gameState, 
    crtScanlineIntensity, 
    crtScanlineHeight, 
    crtVignetteIntensity, 
    crtFlickerIntensity, 
    crtPhosphorBurn, 
    crtJitterIntensity,
    crtWarmth
  ]);

  const isHidden = qualityLevel === 'low' || gameState === 'START_SCREEN';

  if (isHidden) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* TUBE SHADOWS & EDGE WARP OVERLAY */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${crtVignetteIntensity * 0.8}) 110%)`,
        boxShadow: `inset 0 0 ${150 + crtVignetteIntensity * 100}px rgba(0,0,0,${0.6 + crtVignetteIntensity * 0.4})`,
        zIndex: 5,
        pointerEvents: 'none'
      }} />

      <canvas 
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          mixBlendMode: 'multiply',
          zIndex: 10,
          opacity: 0.95 // Slight transparency to keep it gritty but not completely black
        }}
      />
      
      {/* PHOSPHOR GRID (Subtle honeycomb/checkerboard) */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `
          linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%), 
          linear-gradient(90deg, rgba(255, 0, 0, 0.08), rgba(0, 255, 0, 0.04), rgba(0, 0, 255, 0.08))
        `,
        backgroundSize: '100% 4px, 6px 100%',
        pointerEvents: 'none',
        opacity: 0.4 * crtPhosphorBurn * 5,
        zIndex: 15
      }} />

      {/* GLASS DEPTH GLOW & WARMTH */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle at 50% 50%, rgba(255,200,100,${0.01 * crtWarmth * 5}) 0%, transparent 70%)`,
        zIndex: 20
      }} />
    </div>
  );
}
