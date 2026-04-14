import { useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { playDiscoveryJingle, playZipSound } from '../../systems/audio';

/**
 * SHOWCASE: 3D-ONLY MODE
 * This component now only handles state and keyboard listeners.
 * Visuals are handled entirely by ShowcaseHUD in 3D.
 */
export function Showcase() {
  const currentShowcase = useGameStore((s) => s.currentShowcase);
  const advanceShowcase = useGameStore((s) => s.advanceShowcase);

  // Discovery Jingle & Event Logic
  useEffect(() => {
    if (!currentShowcase) return;
    
    // Play the "Zip" sound on entry
    playZipSound();

    if (currentShowcase.rarity === 'shiny' || currentShowcase.rarity === 'holographic') {
      playDiscoveryJingle();
    }
  }, [currentShowcase]);

  // Handle Space key for continuation
  useEffect(() => {
    if (!currentShowcase) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Escape' || e.code === 'Enter') {
        e.preventDefault();
        console.log("[Showcase] Key Pressed: Advancing...");
        advanceShowcase();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentShowcase, advanceShowcase]);

  return null; // All visuals are in ShowcaseHUD (3D)
}
