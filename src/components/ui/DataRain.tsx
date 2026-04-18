import React, { useEffect, useRef } from 'react';

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  text: string;
  color: string;
  flicker: boolean;
}

export const DataRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drops = useRef<RainDrop[]>([]);
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 13;
    const spacing = 18;

    const fragments = [
      "SLAMZ_PRO_TOUR",
      "VIBEJAM_2026",
      "FRAGMENT_RECOVERED",
      "0x" + Math.random().toString(16).substring(2, 8).toUpperCase(),
      "BREACH_DETECTED",
      "WRAITH_SYSTEMS",
      "CORE_UNLOCKED",
      "BYPASS_INIT",
      "DATA_HEIST",
      "SINKING_CORE..."
    ];

    const palette = ['#00ffff', '#ff00ff', '#8800ff', '#00aaff', '#cc44ff', '#00ffcc'];

    const createDrop = (colIndex: number, startY: number = -Math.random() * 800): RainDrop => {
      const color = palette[Math.floor(Math.random() * palette.length)];
      return {
        x: colIndex * spacing,
        y: startY,
        speed: 0.15 + Math.random() * 0.45,
        text: fragments[Math.floor(Math.random() * fragments.length)],
        color: color,
        flicker: Math.random() > 0.95
      };
    };




    const initRain = (w: number, h: number) => {
      dimensions.current = { width: w, height: h };
      canvas.width = w;
      canvas.height = h;
      const columns = Math.ceil(w / spacing);
      drops.current = Array.from({ length: columns }, (_, i) => createDrop(i));
    };

    const draw = () => {
      if (dimensions.current.width === 0) return;

      // Check if Digital Glitch is loaded, fallback to Share Tech Mono
      const isFontReady = document.fonts.check("16px 'Digital Glitch'");
      const activeFont = isFontReady ? "'Digital Glitch'" : "'Share Tech Mono'";

      // Semi-transparent clear for trails
      ctx.fillStyle = 'rgba(0, 4, 8, 0.2)'; 
      ctx.fillRect(0, 0, dimensions.current.width, dimensions.current.height);

      ctx.font = `900 16px ${activeFont}, monospace`;



      drops.current.forEach((d, i) => {
        ctx.fillStyle = d.color;
        
        if (d.flicker && Math.random() > 0.98) {
            ctx.globalAlpha = 0.2;
        } else {
            ctx.globalAlpha = 1.0;
        }

        ctx.shadowBlur = 10;
        ctx.shadowColor = d.color;
        ctx.fillText(d.text, d.x, d.y);
        ctx.shadowBlur = 0;

        d.y += d.speed;

        if (d.y > dimensions.current.height + 100) {
          drops.current[i] = createDrop(i, -fontSize);
        }
      });
    };

    let animationId: number;
    const animate = () => {
      draw();
      animationId = requestAnimationFrame(animate);
    };

    // Use ResizeObserver for robust layout detection
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          initRain(width, height);
        }
      }
    });

    resizeObserver.observe(document.body);
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      {/* Hidden element to force browser to load custom font for Canvas use */}
      <span style={{ fontFamily: "'Digital Glitch'", opacity: 0, position: 'absolute', pointerEvents: 'none' }}>.</span>
      <canvas
        ref={canvasRef}
        className="data-rain-canvas"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none',
          opacity: 0.5,
          mixBlendMode: 'screen',
          filter: 'contrast(1.2) brightness(1.2)',
          background: 'transparent'
        }}
      />
    </>
  );
};



