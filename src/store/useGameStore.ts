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
  slamForceMultiplier: number;
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
  
  // Arcade Cabinet
  arcadeCabinetScale: number;
  arcadeCabinetPositionX: number;
  arcadeCabinetPositionY: number;
  arcadeCabinetPositionZ: number;
  arcadeCabinetRotationY: number;
  arcadeCabinetVisible: boolean;
  arcadeBackScale: number;
  arcadeBackPositionX: number;
  arcadeBackPositionY: number;
  arcadeBackPositionZ: number;
  arcadeBackRotationY: number;
  arcadeBackVisible: boolean;
  
  // Bullet Time Cinematic Scene
  cinematicWindupDuration: number;
  cinematicFreezeDuration: number;
  cinematicOrbitDuration: number;
  cinematicRevealDuration: number;
  cinematicOrbitRadius: number;
  cinematicOrbitHeight: number;
  cinematicDynamicZoomMultiplier: number;
  cinematicDynamicZoomMaxScale: number;
  cinematicTimeScaleSlow: number;
  cinematicTimeScaleFreeze: number;
  
  // Comet Zoom Effects
  cinematicCometApproachSpeed: number;
  cinematicCometStartDistance: number;
  cinematicCometEndDistance: number;
  cinematicCometFOVPunch: number;
  cinematicCometShakeIntensity: number;
  
  // Pog Explosion & Scatter (Eruption Suite)
  cinematicExplosionForce: number;
  cinematicScatterRadius: number;
  cinematicScatterHeight: number;
  cinematicPogRotationSpeed: number;
  cinematicPogFloatDuration: number;
  
  // NEW: Collision Eruption Tuning
  eruptionUpwardMultiplier: number; // The "Kick"
  eruptionRadius: number;           // Impact zone
  eruptionTorqueMultiplier: number; // Spin intensity
  autoSlamPower: number;            // Fixed power for loop tests
  
  // Dramatic Transitions
  cinematicTransitionSpeed: number;
  cinematicImpactFlashIntensity: number;
  cinematicMotionBlurStrength: number;
  
  // Pog Lock-on Tracking
  cinematicLockOnEnabled: boolean;
  cinematicLockOnDuration: number;
  cinematicLockOnOrbitRadius: number;
  cinematicLockOnOrbitSpeed: number;
  cinematicLockOnHeightOffset: number;
  cinematicLockOnSmoothFactor: number;
  
  // Synchronized Falling & Rest
  cinematicSyncFallDuration: number;
  cinematicSyncFallSpeed: number;
  cinematicSyncRestDelay: number;
  cinematicFinalFaceUpChance: number;
  cinematicBounceCount: number;
  cinematicBounceDamping: number;

  // Wraith (Player)
  wraithPositionX: number;
  wraithPositionY: number;
  wraithPositionZ: number;
  wraithScale: number;
  wraithRotationY: number;

  // New Physics Governance
  pogMaxVelocity: number;
}

export const DEFAULT_DEBUG_PARAMS: DebugParams = {
  // Physics - Pog
  pogMass: 0.25,
  pogRestitution: 0.05,
  pogFriction: 2,
  pogLinearDamping: 0.8,
  pogAngularDamping: 1.0,
  
  // Physics - Slammer
  slammerMass: 1.2,
  slammerRestitution: 0.45,
  slammerFriction: 0.2,
  slamBaseForce: -49,
  slamPowerMultiplier: -0.85,
  slamForceMultiplier: 0.25,
  shatterRadius: 0.1,
  shatterForceMin: 0,
  shatterForceMax: 0,
  
  // Visual - Slammer
  slammerOpacity: 0.75,
  slammerScaleBoost: 0.15,
  slammerEmissiveIntensity: 1.5,
  
  // Visual - Pog
  pogScale: 1,
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
  logoScale: 11.6,
  logoPositionX: -0.2,
  logoPositionY: 0,
  logoPositionZ: -31.5,
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
  smokeMidColorR: 0,
  smokeMidColorG: 0,
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
  arenaLightIntensity: 1,
  arenaAmbientIntensity: 0.5,
  floorPositionY: 0,
  
  // Arcade Cabinet
  arcadeCabinetScale: 0.1,
  arcadeCabinetPositionX: -10,
  arcadeCabinetPositionY: -5,
  arcadeCabinetPositionZ: 5,
  arcadeCabinetRotationY: 0,
  arcadeCabinetVisible: true,
  arcadeBackScale: 0.1,
  arcadeBackPositionX: 10,
  arcadeBackPositionY: -5,
  arcadeBackPositionZ: 5,
  arcadeBackRotationY: 0,
  arcadeBackVisible: true,
  
  // Bullet Time Cinematic Scene
  cinematicWindupDuration: 2,
  cinematicFreezeDuration: 0.2,
  cinematicOrbitDuration: 4,
  cinematicRevealDuration: 2,
  cinematicOrbitRadius: 8,
  cinematicOrbitHeight: 2.5,
  cinematicDynamicZoomMultiplier: 2.5,
  cinematicDynamicZoomMaxScale: 1.5,
  cinematicTimeScaleSlow: 0.08,
  cinematicTimeScaleFreeze: 0.01,
  
  // Comet Zoom Effects
  cinematicCometApproachSpeed: 50,
  cinematicCometStartDistance: 30,
  cinematicCometEndDistance: 2,
  cinematicCometFOVPunch: 120,
  cinematicCometShakeIntensity: 0.8,
  
  // Pog Explosion & Scatter (Eruption Suite)
  cinematicExplosionForce: 15,
  cinematicScatterRadius: 8,
  cinematicScatterHeight: 6,
  cinematicPogRotationSpeed: 8,
  cinematicPogFloatDuration: 1.5,
  
  // NEW: Collision Eruption Tuning
  eruptionUpwardMultiplier: 0.3,
  eruptionRadius: 3,
  eruptionTorqueMultiplier: 0.15,
  autoSlamPower: 100,
  
  // Dramatic Transitions
  cinematicTransitionSpeed: 2,
  cinematicImpactFlashIntensity: 3,
  cinematicMotionBlurStrength: 0.7,
  
  // Pog Lock-on Tracking
  cinematicLockOnEnabled: true,
  cinematicLockOnDuration: 3,
  cinematicLockOnOrbitRadius: 4,
  cinematicLockOnOrbitSpeed: 1.5,
  cinematicLockOnHeightOffset: 1,
  cinematicLockOnSmoothFactor: 0.8,
  
  // Synchronized Falling & Rest
  cinematicSyncFallDuration: 2.5,
  cinematicSyncFallSpeed: 0.3,
  cinematicSyncRestDelay: 1,
  cinematicFinalFaceUpChance: 0.5,
  cinematicBounceCount: 2,
  cinematicBounceDamping: 0.6,
  
  // Wraith (Player)
  wraithPositionX: 0,
  wraithPositionY: 5.1,
  wraithPositionZ: -53.6,
  wraithScale: 15,
  wraithRotationY: 0,

  // New Physics Governance
  pogMaxVelocity: 15.0
};

export interface ShowcaseItem {
  theme: string;
  rarity: string;
  setName: string;
  setColor: string;
  marketValue: number;
}

export interface GameStore {
  gameState: GameState;
  power: number;
  powerDirection: number;
  collection: any;
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
  debugLogoMode: boolean;
  
  // Debug params
  // NEW: Collision Tuning Suite
  autoSlamActive: boolean;
  
  // NEW: Scene Based Architecture
  sceneMode: 'ARCADE' | 'LAB';
  cameraTension: number; // 0 = relaxed, 1 = max tension
  
  debugParams: DebugParams;
  
  // Practice mode additions
  gameMode: GameMode;
  practiceSession: PracticeSession | null;
  sessionScore: SessionScore;
  selectedForPractice: PogData[];
  faceUpPogs: string[];
  
  // Combo system
  currentCombo: number;
  comboMultiplier: number;
  lastSuccessfulSlam: number;
  hitStopActive: boolean;
  impactFlashActive: boolean;
  
  // Timer and session state
  gameTimer: number;
  sessionActive: boolean;
  finalScore: number;
  bestCombo: number;
  perfectHitActive: boolean;
  
  // Game flow state
  timeLeft: number;
  score: number;
  combo: number;
  bulletTimeScale: number;
  isCinematicActive: boolean;
  bulletTimeActive: boolean;
  globalDampingScale: number;

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
  toggleShowcaseRatio: () => void;
  togglePause: () => void;
  setSceneMode: (sceneMode: 'ARCADE' | 'LAB') => void;
  setFogColor: (color: string) => void;
  setDebugLogoMode: (enabled: boolean) => void;
  triggerFogPulse: () => void;
  setDebugParams: (params: Partial<DebugParams>) => void;
  
  // Combo system actions
  incrementCombo: () => void;
  resetCombo: () => void;
  triggerHitStop: () => void;
  triggerImpactFlash: () => void;
  
  // Timer and session actions
  startSession: () => void;
  startGame: () => void;
  updateTimer: (delta: number) => void;
  endSession: () => void;
  endGame: () => void;
  triggerPerfectHit: () => void;
  setBulletTimeScale: (scale: number) => void;
  setIsCinematicActive: (active: boolean) => void;
  
  // Diagnostic Actions
  setPeakVelocity: (velocity: number) => void;
  peakVelocity: number;
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
      currentSlammerType: 'standard',
      qualityLevel: 'high',
      showcaseRatioMode: 'safe',
      previousState: null,
      fogPulseTrigger: 0,
      fogColor: '#00ffcc',
      debugLogoMode: false,
      
      // NEW: Tuning Suite
      autoSlamActive: false,

      // NEW: Scene Based Architecture
      sceneMode: 'ARCADE',
      cameraTension: 0,
      setSceneMode: (sceneMode: 'ARCADE' | 'LAB') => set({ sceneMode }),
      
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
      
      // Combo system initial state
      currentCombo: 0,
      comboMultiplier: 1,
      lastSuccessfulSlam: 0,
      hitStopActive: false,
      impactFlashActive: false,
      
      // Timer and session state initial values
      gameTimer: 120, // 2 minutes in seconds
      sessionActive: false,
      finalScore: 0,
      bestCombo: 0,
      perfectHitActive: false,

      // Game flow state
      timeLeft: 120,
      score: 0,
      combo: 0,
      bulletTimeScale: 1.0,
      isCinematicActive: false,
      bulletTimeActive: false,
      globalDampingScale: 0,
      peakVelocity: 0,

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
            const jitterX = (Math.random() - 0.5) * 0.05;
            const jitterZ = (Math.random() - 0.5) * 0.05;
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
              rotation: [0, Math.random() * Math.PI * 2, 0] as [number, number, number],
            });
          }
          set({ pogs: initialPogs });
        } else {
          const updatedPogs = currentPogs.map((pog, i) => {
            const jitterX = (Math.random() - 0.5) * 0.05;
            const jitterZ = (Math.random() - 0.5) * 0.05;
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
              rotation: [0, Math.random() * Math.PI * 2, 0] as [number, number, number],
            };
          });
          set({ pogs: updatedPogs, gameState: 'AIMING', power: 0, showcaseQueue: [], currentShowcase: null, peakVelocity: 0 });
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
          gameState: 'ROUND_JACKPOT',
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
      setDebugLogoMode: (debugLogoMode: boolean) => set({ debugLogoMode }),
      triggerFogPulse: () => set((state) => ({ fogPulseTrigger: state.fogPulseTrigger + 1 })),
      setDebugParams: (params: Partial<DebugParams>) => set((state) => {
        const newParams = { ...state.debugParams, ...params };
        localStorage.setItem('debugParams', JSON.stringify(newParams));
        return { debugParams: newParams };
      }),
      
      setPeakVelocity: (peakVelocity) => {
        if (peakVelocity > get().peakVelocity) {
          set({ peakVelocity });
        }
      },
      
      incrementCombo: () => set((state) => {
        const newCombo = state.currentCombo + 1;
        const newMultiplier = Math.min(1 + (newCombo - 1) * 0.5, 5); // Max 5x multiplier
        return {
          currentCombo: newCombo,
          comboMultiplier: newMultiplier,
          lastSuccessfulSlam: Date.now()
        };
      }),
      
      resetCombo: () => set((state) => ({
        currentCombo: 0,
        comboMultiplier: 1,
        sessionScore: { ...state.sessionScore, currentCombo: 0 }
      })),
      
      triggerHitStop: () => set({ hitStopActive: true }),
      
      triggerImpactFlash: () => set({ impactFlashActive: true }),
      
      startSession: () => set({ sessionActive: true, gameTimer: 120, finalScore: 0, bestCombo: 0 }),
      
      updateTimer: (delta: number) => set((state) => {
        const newTimer = Math.max(0, state.gameTimer - delta);
        return { gameTimer: newTimer };
      }),
      
      endSession: () => set((state) => ({
        sessionActive: false,
        finalScore: state.stats.pogsWon * 50 * state.comboMultiplier,
        bestCombo: Math.max(state.bestCombo, state.currentCombo)
      })),
      
      triggerPerfectHit: () => set({ perfectHitActive: true }),
      
      startGame: () => {
        get().resetStack();
        set({ 
          timeLeft: 120, 
          score: 0, 
          combo: 0,
          sessionActive: true 
        });
      },
      
      endGame: () => set({ 
        gameState: 'SESSION_SUMMARY',
        sessionActive: false 
      }),

      setBulletTimeScale: (bulletTimeScale: number) => set({ bulletTimeScale }),
      setIsCinematicActive: (isCinematicActive: boolean) => set({ isCinematicActive }),
    };
  })
);







