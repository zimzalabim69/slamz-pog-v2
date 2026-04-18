import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useGameStore } from '../../store/useGameStore';

export function AspectController({ children }: { children: ReactNode }) {
  const aspectRatioMode = useGameStore((s) => s.aspectRatioMode);
  const [containerStyle, setContainerStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const currentAspect = windowWidth / windowHeight;

      if (aspectRatioMode === 'NATIVE') {
        setContainerStyle({
          width: '100vw',
          height: '100vh',
          left: 0,
          top: 0,
          position: 'absolute'
        });
        return;
      }

      const targetAspect = aspectRatioMode === '16:9' ? 16 / 9 : 21 / 9;

      if (currentAspect > targetAspect) {
        // Window is wider than target (Pillarbox on left/right)
        const newWidth = windowHeight * targetAspect;
        setContainerStyle({
          width: `${newWidth}px`,
          height: '100vh',
          left: `${(windowWidth - newWidth) / 2}px`,
          top: 0,
          position: 'absolute'
        });
      } else {
        // Window is taller than target (Letterbox on top/bottom)
        const newHeight = windowWidth / targetAspect;
        setContainerStyle({
          width: '100vw',
          height: `${newHeight}px`,
          left: 0,
          top: `${(windowHeight - newHeight) / 2}px`,
          position: 'absolute'
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [aspectRatioMode]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000', // Black bars
      overflow: 'hidden',
      position: 'relative',
      zIndex: 0
    }}>
      <div style={{
        ...containerStyle,
        position: 'absolute',    // Overwrite containerStyle absolute output if needed, but wait, containerStyle already returns position absolute. Let's just keep position absolute and add bounds
        overflow: 'hidden',
        backgroundColor: '#000', // Inner game background
      }}>
        {children}
      </div>
    </div>
  );
}
