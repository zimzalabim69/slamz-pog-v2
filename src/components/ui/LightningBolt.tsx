import React, { useMemo } from 'react';
import { generateBranchedBolt } from '../../utils/lightningUtils';

interface LightningBoltProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  displacement?: number;
  color?: string;
  isActive: boolean;
  intensity?: number;
}

export const LightningBolt: React.FC<LightningBoltProps> = ({
  startX,
  startY,
  endX,
  endY,
  displacement = 80,
  color = '#00ffff',
  isActive,
  intensity = 1
}) => {
  // Regenerate fractal path only when isActive toggles or props change
  // Note: For high-quality flicker, we generate a few variants
  const paths = useMemo(() => {
    if (!isActive) return [];
    // Generate 1-2 branches
    return generateBranchedBolt(startX, startY, endX, endY, displacement);
  }, [isActive, startX, startY, endX, endY, displacement]);

  if (!isActive || paths.length === 0) return null;

  return (
    <g className="lightning-bolt" style={{ filter: 'url(#lightning-glow)' }}>
      {paths.map((d, i) => (
        <React.Fragment key={i}>
          {/* Outer Glow Bloom */}
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={4 * intensity}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
            className="bolt-bloom"
          />
          {/* Sharp Vibrant Core */}
          <path
            d={d}
            fill="none"
            stroke="#ffffff"
            strokeWidth={1.5 * intensity}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="bolt-core"
          />
        </React.Fragment>
      ))}
    </g>
  );
};
