export type GameState = 'START_SCREEN' | 'AIMING' | 'POWERING' | 'SLAMMED' | 'HARVEST' | 'SHOWCASE' | 'ROUND_JACKPOT' | 'RESETTING' | 'PRACTICE_SELECT' | 'PRACTICE_PLAYING' | 'SESSION_SUMMARY' | 'PAUSED';


export type GameMode = 'CLASSIC' | 'PRACTICE_FOR_KEEPS' | 'NO_RESTACK_CHAOS';

export interface SlamzData {
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
  slamzWon: number;
  bestCombo: number;
}

export interface SessionScore {
  totalSlamzFlipped: number;
  currentCombo: number;
  bestCombo: number;
  accuracy: number;
  streak: number;
  totalScore: number;
  faceUpSlamz: string[]; // Slamz IDs that landed face-up
}

export interface PracticeSession {
  selectedSlamz: SlamzData[];
  mode: GameMode;
  score: SessionScore;
  startTime: number;
}

