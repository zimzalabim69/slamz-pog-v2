# SLAMZ PRO-TOUR V2 - Developer Guide

## Table of Contents
1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Component Documentation](#component-documentation)
4. [Game Systems](#game-systems)
5. [Development Workflow](#development-workflow)
6. [Troubleshooting](#troubleshooting)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Modern browser with WebGL support

### Setup
```bash
npm install
npm run dev
```

### Network Access
- Desktop: `http://localhost:5173/`
- Mobile: `http://<your-local-ip>:5173/` (Run `ipconfig` or `hostname -I` to find your IP)

## Architecture Overview

### Core Technologies
- **React 19.2.5** with TypeScript
- **Three.js 0.183.2** with React Three Fiber
- **@react-three/rapier** for physics
- **Zustand** for state management
- **Vite** for build system

### Project Structure
```
src/
  components/
    game/          # Game objects (Pog, Slammer, Arena)
    ui/            # User interface components
    environment/   # 3D environment elements
  constants/      # Game constants and presets
  hooks/          # Custom React hooks
  store/          # Zustand state management
  systems/        # Game systems (audio, physics)
  types/          # TypeScript definitions
  utils/          # Utility functions
```

#### Hook Hygiene & Patterns
For a detailed breakdown of the React Hooks resolution during the V2 port, see [PORT_DOCUMENTATION.md](./PORT_DOCUMENTATION.md#react-hooks-crisis-archive).

- **Rule #1: No Conditionals.** Hooks must always be at the top level.
- **Rule #2: Component Separation.** Use different components for mobile/desktop to keep hook counts stable.

## Component Documentation

### Game Components

#### Arena (`components/game/Arena.tsx`)
- **Purpose**: Renders the playing surface with slamz mat texture
- **Props**: None (uses global state)
- **Dependencies**: useGameStore, SCENE_PRESETS

#### Pog (`components/game/Pog.tsx`)
- **Purpose**: Individual POG disc with physics and rendering
- **Props**: id, theme, rarity, position, rotation
- **Physics**: RigidBody with RoundCuboidCollider

#### Slammer (`components/game/Slammer.tsx`)
- **Purpose**: Player-controlled slammer weapon
- **Controls**: Mouse (desktop), Touch (mobile)
- **Physics**: Dynamic RigidBody with collision detection

### UI Components

#### MobileControls (`components/ui/MobileControls.tsx`)
- **Purpose**: Virtual joystick and SLAM button for mobile
- **Hooks**: 8 hooks (stable count - no conditionals)
- **Features**: Touch gestures, haptic feedback

#### DesktopControls (`components/ui/DesktopControls.tsx`)
- **Purpose**: Keyboard controls for desktop
- **Hooks**: 1 useEffect (stable count)
- **Controls**: R (reset), Space (continue)

## Game Systems

### Physics System
- **Engine**: @react-three/rapier (WASM-based)
- **Gravity**: [0, -16, 0] (adjusted for gameplay)
- **Collision**: RoundCuboidCollider for POGs

### Audio System
- **Location**: `systems/audio.ts`
- **Sounds**: Impact, capture, UI interactions
- **Integration**: Web Audio API with spatial audio

### State Management (Zustand)
```typescript
interface GameStore {
  gameState: GameState;
  power: number;
  powerDirection: number;
  pogs: PogData[];
  collection: CollectionItem[];
  // ... other state
}
```

### Texture Registry
- **Purpose**: Pre-loads all materials before React mount
- **Location**: `utils/TextureGenerator.ts`
- **Process**: Synchronous initialization for stability

#### Adding New POG Sets (Asset Pipeline)
1. **Prepare Assets**: Place 512x512 PNGs in `public/assets/pogs/`.
2. **Register Themes**: Add the file basename to `PROCEDURAL_THEMES` or `ASSET_THEMES` in `src/constants/pogData.ts`.
3. **Define Sets**: Create a set entry in `src/constants/setDefinitions.ts` to map themes to names and colors.

## Development Workflow

### Build Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Network Development
- **Host Binding**: `--host 0.0.0.0` for mobile access
- **Base Path**: `'./'` for mobile asset loading
- **HMR**: Configured for mobile hot reloading

### Debug Tools
- **Mobile Debug Panel**: Real-time device info and logs
- **Debug Logs Viewer**: `/debug-logs.html`
- **Clear Storage**: `/clear-storage.html`

### Performance Optimization
- **Mobile**: Reduced antialiasing, lower pixel ratio
- **Physics**: Optimized collision shapes
- **Rendering**: Shadow maps disabled on mobile

## Game Mechanics & Tuning

### Physics Registry (Magic Numbers)
> [!IMPORTANT]
> These values define the "soul" of SLAMZ. Adjust with extreme caution.
- **Gravity**: `[0, -16, 0]` (Experience.tsx) - Heavily weighted for arcade feel.
- **Slam Impulse**: `-49 + (power * 0.85)` (Slammer.tsx) - Calibrated for high-velocity impact.
- **Shatter Radius**: `0.1` - Tightly clustered for stacking realism.
- **POG Properties**: Mass: `6.95`, Restitution: `0.05` (Heavy-weight tournament specs).

### Visual Juice Standards
- **Slam Punch**: Camera FOV jumps to `65` on slam, lerps back to `50`.
- **Haptic Feedback**: Triggered on `MobileControls` for every POG flip.
- **Perfect Slam**: A "Perfect!" flash appears at `>98%` power.

### Core Gameplay Loop
1. **Aiming Phase**: Player positions slammer
2. **Charging Phase**: Hold to build power
3. **Slam Phase**: Release to slam POGs
4. **Showcase Phase**: Display captured POGs

### Scoring System
- **Combo System**: Consecutive flips increase score
- **Rarity Multipliers**: Holographic (5x) > Shiny (2x) > Standard (1x)
- **Set Completion**: MASSIVE bonus for complete sets (see `SetManager.ts`)

## Troubleshooting

### Common Issues

#### "Rendered more hooks" Error
1. Check stack trace for file/line
2. Look for early returns above hooks
3. Move logic inside useEffect, not hooks inside logic

#### Mobile Black Screen
1. Check WebGL support in debug panel
2. Verify network configuration
3. Clear browser cache/storage

#### Build Failures
1. Check dependency versions
2. Verify import paths
3. Clean node_modules and reinstall

### Emergency Procedures
1. **Fatal Hook Crash**: See [Crisis Archive](./PORT_DOCUMENTATION.md#react-hooks-crisis-archive).
2. **Mobile Black Screen**: Verify `gl` settings in `App.tsx` and check `/debug-logs.html`.

## Submission Checklist (Vibejam 2026)
- [ ] **WebGL Support**: Verify rendering on both iOS (Safari) and Android (Chrome).
- [ ] **Build Check**: Run `npm run build` and ensure `dist/` is clean.
- [ ] **Reset Test**: Clear local storage and ensure "First Session" logic triggers.
- [ ] **Sound Check**: Verify spatial audio works on mobile speakers.
- [ ] **Performance**: Ensure stable 60fps on mid-range mobile devices.

---

**This guide should be updated with each significant change to maintain comprehensive developer documentation.**
