export type GameState = 'START_SCREEN' | 'AIMING' | 'POWERING' | 'SLAMMED' | 'SHOWCASE' | 'RESETTING' | 'PRACTICE_SELECT' | 'PRACTICE_PLAYING' | 'SESSION_SUMMARY' | 'PAUSED';

export type GameMode = 'CLASSIC' | 'PRACTICE_FOR_KEEPS' | 'NO_RESTACK_CHAOS';

export interface PogData {
  id: string;
  theme: string;
  rarity: 'standard' | 'shiny' | 'holographic';
  position: [number, number, number];
  rotation: [number, number, number];
}

export interface CollectionItem {
  theme: string;
  rarity: string;
  date: string;
}

export interface SessionStats {
  totalSlams: number;
  pogsWon: number;
  bestCombo: number;
}

export interface SessionScore {
  totalPogsFlipped: number;
  currentCombo: number;
  bestCombo: number;
  accuracy: number;
  streak: number;
  totalScore: number;
  faceUpPogs: string[]; // POG IDs that landed face-up
}

export interface PracticeSession {
  selectedPogs: PogData[];
  mode: GameMode;
  score: SessionScore;
  startTime: number;
}
