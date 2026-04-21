import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@100/store/useGameStore';

/**
 * ADAPTIVE QUALITY SYSTEM
 * 
 * Monitors FPS every 2 seconds and auto-adjusts quality tier.
 * Three tiers: high (default), medium (below 45fps), low (below 25fps).
 * 
 * Each tier controls:
 * - qualityLevel in the store (read by other components)
 * - DPR is handled by the Canvas via store
 * 
 * Components read qualityLevel from the store and self-adjust:
 * - Effects.tsx: skip chromatic aberration on medium, skip all on low
 * - AtmosphericFog.tsx: reduce sparkles on medium, skip fog on low
 * - CRTOverlay.tsx: throttle on medium, skip on low
 * - CyberAlley.tsx: reduce rain on medium, skip rain on low
 */

const FPS_SAMPLE_INTERVAL = 2; // seconds between quality checks
const HIGH_THRESHOLD = 45;     // drop to medium below this
const LOW_THRESHOLD = 25;      // drop to low below this
const RECOVERY_THRESHOLD = 55; // recover to higher tier above this
const MIN_SAMPLES = 30;        // minimum frames before evaluating

export function AdaptiveQuality() {
  const frameCount = useRef(0);
  const elapsed = useRef(0);
  const currentTier = useRef<'high' | 'medium' | 'low'>('high');
  const stableFrames = useRef(0); // frames at good FPS before upgrading

  const setQuality = useCallback((tier: 'high' | 'medium' | 'low') => {
    if (currentTier.current === tier) return;
    currentTier.current = tier;
    useGameStore.setState({ qualityLevel: tier });
    console.log(`[PERF] Quality tier: ${tier.toUpperCase()}`);
  }, []);

  useFrame((_, delta) => {
    frameCount.current++;
    elapsed.current += delta;

    if (elapsed.current < FPS_SAMPLE_INTERVAL) return;
    if (frameCount.current < MIN_SAMPLES) {
      // Not enough samples yet, reset and wait
      elapsed.current = 0;
      frameCount.current = 0;
      return;
    }

    const fps = frameCount.current / elapsed.current;

    // Downgrade quickly, upgrade slowly
    if (fps < LOW_THRESHOLD) {
      setQuality('low');
      stableFrames.current = 0;
    } else if (fps < HIGH_THRESHOLD) {
      if (currentTier.current === 'high') {
        setQuality('medium');
      }
      stableFrames.current = 0;
    } else if (fps > RECOVERY_THRESHOLD) {
      stableFrames.current++;
      // Only upgrade after 3 consecutive good intervals (6 seconds stable)
      if (stableFrames.current >= 3) {
        if (currentTier.current === 'low') {
          setQuality('medium');
        } else if (currentTier.current === 'medium') {
          setQuality('high');
        }
        stableFrames.current = 0;
      }
    }

    // Reset counters
    elapsed.current = 0;
    frameCount.current = 0;
  });

  return null;
}
