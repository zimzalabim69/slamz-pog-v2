import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GameState, CollectionItem, SessionStats, PogData, GameMode, SessionScore, PracticeSession } from '../types/game';
import { PROCEDURAL_THEMES, ASSET_THEMES } from '../constants/pogData';
import { SCENE_ORDER, SCENE_PRESETS } from '../constants/game';
import { SetManager } from '../systems/SetManager';

export interface DebugParams {
  // Physics - Pog
  pogMass: number;
  pogRestitution: number;
  pogFriction: number;
  pogLinearDamping: number;
  pogAngularDamping: number;
  
  // Physics - Slammer
  slammerMass: number;
  slammerRestitution: number;
  slammerFriction: number;
  slamBaseForce: number;
  slamPowerMultiplier: number;
  shatterRadius: number;
  shatterForceMin: number;
  shatterForceMax: number;
  
  // Visual - Slammer
  slammerOpacity: number;
  slammerScaleBoost: number;
  slammerEmissiveIntensity: number;
  
  // Visual - Pog
  pogScale: number;
  pogRotationSpeed: number;
  pogMetalness: number;
  pogRoughness: number;
  
  // Camera
  baseFOV: number;
  punchFOV: number;
  fovLerpSpeed: number;
  
  // Fog
  fogDensity: number;
  fogNear: number;
  fogFar: number;
  
  // Gameplay
  powerChargeSpeed: number;
  slamDelay: number;
  
  // Start Screen - Logo 3D
  logoScale: number;
  logoPositionX: number;
  logoPositionY: number;
  logoPositionZ: number;
  logoRotationX: number;
  logoRotationY: number;
  logoRotationZ: number;
  
  // Start Screen - Background 3D
  bgScale: number;
  bgPositionX: number;
  bgPositionY: number;
  bgPositionZ: number;
  bgRotationX: number;
  bgRotationY: number;
  bgRotationZ: number;
  
  // Start Screen - Fog
  startFogDensity: number;
  startFogColorR: number;
  startFogColorG: number;
  startFogColorB: number;
  
  // Start Screen - Smoke Ground Layer
  smokeGroundColorR: number;
  smokeGroundColorG: number;
  smokeGroundColorB: number;
  smokeGroundOpacity: number;
  smokeGroundSpeed: number;
  smokeGroundCount: number;
  smokeGroundSize: number;
  smokeGroundSpread: number;
  smokeGroundHeight: number;
  
  // Start Screen - Smoke Mid Wisps Layer
  smokeMidColorR: number;
  smokeMidColorG: number;
  smokeMidColorB: number;
  smokeMidOpacity: number;
  smokeMidSpeed: number;
  smokeMidCount: number;
  smokeMidSize: number;
  smokeMidSpread: number;
  smokeMidHeight: number;
  
  // Start Screen - Button
  buttonScale: number;
  buttonPositionX: number;
  buttonPositionY: number;
  buttonFontSize: number;
  
  // Arena
  arenaLightIntensity: number;
  arenaAmbientIntensity: number;
  floorPositionY: number;
}

export const DEFAULT_DEBUG_PARAMS: DebugParams = {
  // Physics - Pog
  pogMass: 0.1,
  pogRestitution: 0.05,
  pogFriction: 0.8,
  pogLinearDamping: 0.15,
  pogAngularDamping: 0.25,
  
  // Physics - Slammer
  slammerMass: 1.5,
  slammerRestitution: 0.7,
  slammerFriction: 0.2,
  slamBaseForce: -22,
  slamPowerMultiplier: -0.4,
  shatterRadius: 0.75,
  shatterForceMin: 0.3,
  shatterForceMax: 1.1,
  
  // Visual - Slammer
  slammerOpacity: 0.75,
  slammerScaleBoost: 0.15,
  slammerEmissiveIntensity: 1.5,
  
  // Visual - Pog
  pogScale: 1.0,
  pogRotationSpeed: 0.002,
  pogMetalness: 0.3,
  pogRoughness: 0.7,
  
  // Camera
  baseFOV: 49,
  punchFOV: 65,
  fovLerpSpeed: 0.15,
  
  // Fog
  fogDensity: 0.035,
  fogNear: 1,
  fogFar: 50,
  
  // Gameplay
  powerChargeSpeed: 240,
  slamDelay: 200,
  
  // Start Screen - Logo 3D
  logoScale: 14.7,
  logoPositionX: -0.2,
  logoPositionY: 1.9,
  logoPositionZ: -29.2,
  logoRotationX: 0,
  logoRotationY: 0.14,
  logoRotationZ: 0,
  
  // Start Screen - Background 3D
  bgScale: 49.91,
  bgPositionX: 0,
  bgPositionY: 9,
  bgPositionZ: -121,
  bgRotationX: 0,
  bgRotationY: 0,
  bgRotationZ: 0,
  
  // Start Screen - Fog
  startFogDensity: 0.004,
  startFogColorR: 0,
  startFogColorG: 0.45,
  startFogColorB: 0.98,
  
  // Start Screen - Smoke Ground Layer
  smokeGroundColorR: 0.25,
  smokeGroundColorG: 0.03,
  smokeGroundColorB: 0.71,
  smokeGroundOpacity: 0.83,
  smokeGroundSpeed: 2,
  smokeGroundCount: 30,
  smokeGroundSize: 50,
  smokeGroundSpread: 32,
  smokeGroundHeight: -6.5,
  
  // Start Screen - Smoke Mid Wisps Layer
  smokeMidColorR: 0.0,
  smokeMidColorG: 0.0,
  smokeMidColorB: 0.8,
  smokeMidOpacity: 0.34,
  smokeMidSpeed: 0.28,
  smokeMidCount: 30,
  smokeMidSize: 41,
  smokeMidSpread: 33,
  smokeMidHeight: 3,
  
  // Start Screen - Button
  buttonScale: 1.4,
  buttonPositionX: 0,
  buttonPositionY: 94,
  buttonFontSize: 20,
  
  // Arena
  arenaLightIntensity: 1.0,
  arenaAmbientIntensity: 0.5,
  floorPositionY: 0,
};

export interface ShowcaseItem {
  pogId: string;
  theme: string;
  rarity: string;
  setName: string;
  setColor: string;
  marketValue: number;
}

interface GameStore {
  gameState: GameState;
  power: number;
  powerDirection: number;
  collection: CollectionItem[];
  stats: SessionStats;
  currentAtmosphere: string;
  pogs: PogData[];
  showcaseQueue: ShowcaseItem[];
  currentShowcase: ShowcaseItem | null;
  lastSlamText: string | null;
  setManager: SetManager;
  binderOpen: boolean;
  achievementsOpen: boolean;
  achievementToast: string | null;
  currentSlammerType: string;
  qualityLevel: 'low' | 'medium' | 'high';
  showcaseRatioMode: 'safe' | 'full';
  previousState: GameState | null;
  fogPulseTrigger: number;
  fogColor: string;
  
  // Debug params
  debugParams: DebugParams;
  
  // Practice mode additions
  gameMode: GameMode;
  practiceSession: PracticeSession | null;
  sessionScore: SessionScore;
  selectedForPractice: PogData[];
  faceUpPogs: string[];

  // Actions
  initPogs: () => void;
  setGameState: (state: GameState) => void;
  setPower: (power: number) => void;
  setPowerDirection: (dir: number) => void;
  addToCollection: (item: CollectionItem) => void;
  updateStats: (updates: Partial<SessionStats>) => void;
  setAtmosphere: (env: string) => void;
  cycleAtmosphere: () => void;
  setPogs: (pogs: PogData[]) => void;
  removePog: (id: string) => void;
  resetStack: () => void;
  resetGame: () => void;
  enqueueShowcase: (items: ShowcaseItem[]) => void;
  advanceShowcase: () => void;
  setSlamText: (text: string | null) => void;
  toggleBinder: () => void;
  toggleAchievements: () => void;
  showAchievementToast: (text: string) => void;
  setSlammerType: (type: string) => void;
  addFaceUpPog: (pogId: string) => void;
  setFaceUpPogs: (pogIds: string[]) => void;
  endPracticeSession: () => void;
  resetCombo: () => void;
  toggleShowcaseRatio: () => void;
  togglePause: () => void;
  setFogColor: (color: string) => void;
  triggerFogPulse: () => void;
  setDebugParams: (params: Partial<DebugParams>) => void;
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => {
    // Initialize SetManager ONCE
    const setManager = new SetManager();

    // Wire up callbacks
    setManager.onAchievementUnlocked = (achievement) => {
      get().showAchievementToast(`${achievement.icon} ${achievement.name}`);
    };

    setManager.onSetCompleted = (setDef) => {
      get().setSlamText(`${setDef.name} COMPLETE!`);
    };

    // Load debug params from localStorage
    const loadDebugParams = (): DebugParams => {
      const stored = localStorage.getItem('debugParams');
      if (stored) {
        try {
          return { ...DEFAULT_DEBUG_PARAMS, ...JSON.parse(stored) };
        } catch {
          return DEFAULT_DEBUG_PARAMS;
        }
      }
      return DEFAULT_DEBUG_PARAMS;
    };

    return {
      // Initial State
      gameState: 'START_SCREEN',
      power: 0,
      powerDirection: 1,
      collection: JSON.parse(localStorage.getItem('pogCollection') || '[]'),
      stats: {
        totalSlams: 0,
        pogsWon: 0,
        bestCombo: 0,
      },
      currentAtmosphere: SCENE_ORDER[0],
      pogs: [],
      showcaseQueue: [],
      currentShowcase: null,
      lastSlamText: null,
      setManager,
      binderOpen: false,
      achievementsOpen: false,
      achievementToast: null,
      currentSlammerType: 'slamzer_mortal',
      qualityLevel: 'high',
      showcaseRatioMode: 'safe',
      previousState: null,
      fogPulseTrigger: 0,
      fogColor: '#00ffcc',
      
      // Debug params
      debugParams: loadDebugParams(),
      
      // Practice mode initial state
      gameMode: 'CLASSIC',
      practiceSession: null,
      sessionScore: {
        totalPogsFlipped: 0,
        currentCombo: 0,
        bestCombo: 0,
        accuracy: 100,
        streak: 0,
        totalScore: 0,
        faceUpPogs: [],
      },
      selectedForPractice: [],
      faceUpPogs: [],

      // Actions
      initPogs: () => {
        const state = get();
        console.log(`[INIT POGS] Called. Current pogs.length = ${state.pogs.length}`);
        if (state.pogs.length > 0) {
          console.log('[INIT POGS] Stack already exists, skipping');
          return;
        }
        get().resetStack();
      },

      setGameState: (gameState) => set({ gameState }),
      setPower: (power) => set({ power }),
      setPowerDirection: (powerDirection) => set({ powerDirection }),

      addToCollection: (item) => set((state) => {
        const newCollection = [...state.collection, item];
        localStorage.setItem('pogCollection', JSON.stringify(newCollection));
        state.setManager.onCapture(newCollection);
        return { collection: newCollection };
      }),

      updateStats: (updates) => set((state) => ({
        stats: { ...state.stats, ...updates }
      })),

      setAtmosphere: (currentAtmosphere) => {
        const { setManager } = get();
        setManager.onSceneVisited(currentAtmosphere);
        const preset = (SCENE_PRESETS as any)[currentAtmosphere] || SCENE_PRESETS.DEFAULT;
        set({ currentAtmosphere, fogColor: preset.pointColor });
      },

      cycleAtmosphere: () => set((state) => {
        const currentIndex = SCENE_ORDER.indexOf(state.currentAtmosphere as any);
        const nextIndex = (currentIndex + 1) % SCENE_ORDER.length;
        const nextEnv = SCENE_ORDER[nextIndex];
        state.setManager.onSceneVisited(nextEnv);
        const preset = (SCENE_PRESETS as any)[nextEnv] || SCENE_PRESETS.DEFAULT;
        return { currentAtmosphere: nextEnv, fogColor: preset.pointColor };
      }),

      setPogs: (pogs) => set({ pogs }),

      removePog: (id) => set((state) => ({
        pogs: state.pogs.filter(p => p.id !== id)
      })),

      resetStack: () => {
        console.log('[RESET STACK] Reusing 15 POGs (object pool)');
        const currentPogs = get().pogs;

        if (currentPogs.length === 0) {
          const initialPogs: PogData[] = [];
          for (let i = 0; i < 15; i++) {
            const jitterX = (Math.random() - 0.5) * 0.01;
            const jitterZ = (Math.random() - 0.5) * 0.01;
            const rarityRoll = Math.random();

            let rarity: 'standard' | 'shiny' | 'holographic';
            let theme: string;

            if (rarityRoll > 0.97) {
              rarity = 'holographic';
              theme = ASSET_THEMES[Math.floor(Math.random() * ASSET_THEMES.length)];
            } else if (rarityRoll > 0.90) {
              rarity = 'shiny';
              theme = PROCEDURAL_THEMES[Math.floor(Math.random() * PROCEDURAL_THEMES.length)];
            } else {
              rarity = 'standard';
              theme = PROCEDURAL_THEMES[Math.floor(Math.random() * PROCEDURAL_THEMES.length)];
            }

            initialPogs.push({
              id: `pog_pool_${i}`,
              theme,
              rarity,
              position: [jitterX, -0.01 + 0.045 + i * 0.09, jitterZ] as [number, number, number],
              rotation: [0, 0, 0] as [number, number, number],
            });
          }
          set({ pogs: initialPogs });
        } else {
          const updatedPogs = currentPogs.map((pog, i) => {
            const jitterX = (Math.random() - 0.5) * 0.01;
            const jitterZ = (Math.random() - 0.5) * 0.01;
            const rarityRoll = Math.random();

            let rarity: 'standard' | 'shiny' | 'holographic';
            let theme: string;

            if (rarityRoll > 0.97) {
              rarity = 'holographic';
              theme = ASSET_THEMES[Math.floor(Math.random() * ASSET_THEMES.length)];
            } else if (rarityRoll > 0.90) {
              rarity = 'shiny';
              theme = PROCEDURAL_THEMES[Math.floor(Math.random() * PROCEDURAL_THEMES.length)];
            } else {
              rarity = 'standard';
              theme = PROCEDURAL_THEMES[Math.floor(Math.random() * PROCEDURAL_THEMES.length)];
            }

            return {
              ...pog,
              theme,
              rarity,
              position: [jitterX, -0.01 + 0.045 + i * 0.09, jitterZ] as [number, number, number],
              rotation: [0, 0, 0] as [number, number, number],
            };
          });
          set({ pogs: updatedPogs, gameState: 'AIMING', power: 0, showcaseQueue: [], currentShowcase: null });
        }
      },

      resetGame: () => {
        localStorage.removeItem('pogCollection');
        get().setManager.resetAll();
        set({
          gameState: 'AIMING',
          power: 0,
          collection: [],
          stats: { totalSlams: 0, pogsWon: 0, bestCombo: 0 },
          pogs: [],
          showcaseQueue: [],
          currentShowcase: null,
        });
      },

      enqueueShowcase: (items) => set((state) => {
        const queue = [...state.showcaseQueue, ...items];
        if (!state.currentShowcase) {
          return { showcaseQueue: queue.slice(1), currentShowcase: queue[0] ?? null };
        }
        return { showcaseQueue: queue };
      }),

      advanceShowcase: () => set((state) => {
        const [next, ...rest] = state.showcaseQueue;
        if (!next) {
          setTimeout(() => {
            get().setGameState('AIMING');
          }, 1500);
          return { currentShowcase: null, showcaseQueue: [], gameState: 'RESETTING' };
        }
        return {
          currentShowcase: next,
          showcaseQueue: rest,
          gameState: 'SHOWCASE',
        };
      }),

      setSlamText: (lastSlamText) => set({ lastSlamText }),

      toggleBinder: () => set((state) => ({ binderOpen: !state.binderOpen })),

      toggleAchievements: () => set((state) => ({ achievementsOpen: !state.achievementsOpen })),

      showAchievementToast: (text) => {
        set({ achievementToast: text });
        setTimeout(() => set({ achievementToast: null }), 4000);
      },

      setSlammerType: (currentSlammerType) => set({ currentSlammerType }),

      setQualityLevel: (qualityLevel: 'low' | 'medium' | 'high') => set({ qualityLevel }),

      addFaceUpPog: (pogId: string) => set((state) => ({
        faceUpPogs: [...state.faceUpPogs, pogId],
        sessionScore: { ...state.sessionScore, faceUpPogs: [...state.sessionScore.faceUpPogs, pogId] }
      })),

      setFaceUpPogs: (pogIds: string[]) => set((state) => ({
        faceUpPogs: pogIds,
        sessionScore: { ...state.sessionScore, faceUpPogs: pogIds }
      })),

      setGameMode: (gameMode: GameMode) => set({ gameMode }),
      
      startPracticeSession: (selectedPogs: PogData[], mode: GameMode = 'PRACTICE_FOR_KEEPS') => {
        const session: PracticeSession = {
          selectedPogs,
          mode,
          score: {
            totalPogsFlipped: 0,
            currentCombo: 0,
            bestCombo: 0,
            accuracy: 100,
            streak: 0,
            totalScore: 0,
            faceUpPogs: [],
          },
          startTime: Date.now(),
        };
        
        set({ 
          pogs: selectedPogs.map((pog) => ({
            ...pog,
            position: [0, 0, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
          })),
          practiceSession: session,
        });
      },

      resetCombo: () => set((state) => ({
        sessionScore: { ...state.sessionScore, currentCombo: 0 }
      })),

      endPracticeSession: () => set((state) => ({
        gameState: 'SESSION_SUMMARY',
        selectedForPractice: state.practiceSession?.selectedPogs || [],
      })),

      toggleShowcaseRatio: () => set((state) => ({
        showcaseRatioMode: state.showcaseRatioMode === 'safe' ? 'full' : 'safe'
      })),

      togglePause: () => set((state) => {
        if (state.gameState === 'PAUSED') {
          return { gameState: state.previousState || 'AIMING', previousState: null };
        } else {
          return { gameState: 'PAUSED', previousState: state.gameState };
        }
      }),

      setFogColor: (fogColor: string) => set({ fogColor }),
      triggerFogPulse: () => set((state) => ({ fogPulseTrigger: state.fogPulseTrigger + 1 })),
      setDebugParams: (params: Partial<DebugParams>) => set((state) => {
        const newParams = { ...state.debugParams, ...params };
        localStorage.setItem('debugParams', JSON.stringify(newParams));
        return { debugParams: newParams };
      }),
    };
  })
);




