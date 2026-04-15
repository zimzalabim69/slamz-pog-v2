import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/useGameStore';

export function TimerUpdate() {
  const sessionActive = useGameStore((state) => state.sessionActive);
  const updateTimer = useGameStore((state) => state.updateTimer);

  useFrame((_, delta) => {
    if (sessionActive) {
      updateTimer(delta);
    }
  });

  return null;
}
