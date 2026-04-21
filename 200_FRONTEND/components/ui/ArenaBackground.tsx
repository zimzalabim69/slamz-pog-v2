import { useGameStore } from '@100/store/useGameStore';
import './ArenaBackground.css';

export function ArenaBackground() {
  const gameState = useGameStore((s) => s.gameState);
  const isPowering = gameState === 'POWERING';

  return (
    <div className={`arena-bg${isPowering ? ' arena-bg--powering' : ''}`}>
      <div className="arena-bg__void" />
      <div className="arena-bg__rain" />
      <div className="arena-bg__scanlines" />
      <div className="arena-bg__floor-glow" />
      <div className="arena-bg__glitch" />
      <div className="arena-bg__glitch arena-bg__glitch--2" />
      <div className="arena-bg__side arena-bg__side--left" />
      <div className="arena-bg__side arena-bg__side--right" />
      <div className="arena-bg__vignette" />
    </div>
  );
}
