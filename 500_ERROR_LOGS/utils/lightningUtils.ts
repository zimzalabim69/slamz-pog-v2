/**
 * Fractal Lightning Utility
 * Generates organic, jagged paths using midpoint displacement.
 */

export interface LightningPoint {
  x: number;
  y: number;
}

export const generateLightningPath = (
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number, 
  displacement: number, 
  minDisplacement: number = 2
): LightningPoint[] => {
  if (displacement < minDisplacement) {
    return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
  }

  // Calculate midpoint with random displacement
  const midX = (x1 + x2) / 2 + (Math.random() - 0.5) * displacement;
  const midY = (y1 + y2) / 2 + (Math.random() - 0.5) * displacement;

  // Recurse into both halves
  return [
    ...generateLightningPath(x1, y1, midX, midY, displacement / 2, minDisplacement),
    ...generateLightningPath(midX, midY, x2, y2, displacement / 2, minDisplacement).slice(1) // Slice to avoid duplicate midpoints
  ];
};

export const pointsToSVGPath = (points: LightningPoint[]): string => {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
};

/**
 * Generates a branched lightning structure
 * Sometimes bolts bifurcate for extra realism
 */
export const generateBranchedBolt = (
  x1: number, 
  y1: number, 
  x2: number, 
  y2: number, 
  displacement: number
): string[] => {
  const mainBolt = generateLightningPath(x1, y1, x2, y2, displacement);
  const paths = [pointsToSVGPath(mainBolt)];

  // 30% chance of a branch
  if (Math.random() > 0.7 && mainBolt.length > 5) {
    const branchStartIndex = Math.floor(Math.random() * (mainBolt.length - 2)) + 1;
    const start = mainBolt[branchStartIndex];
    
    // Branch off in a similar direction but offset
    const branchEnd = {
      x: start.x + (x2 - x1) * 0.4 + (Math.random() - 0.5) * 50,
      y: start.y + (y2 - y1) * 0.4 + (Math.random() - 0.5) * 50
    };
    
    const branch = generateLightningPath(start.x, start.y, branchEnd.x, branchEnd.y, displacement / 2);
    paths.push(pointsToSVGPath(branch));
  }

  return paths;
};
