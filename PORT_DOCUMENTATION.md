# SLAMZ PRO-TOUR V2 - Port Documentation

## Overview
This document compiles all information about the port/migration process from the original SLAMZ PRO-TOUR to the V2 rewrite. The project represents a complete modernization of the original Vibejam 2026 entry.

## Project Information
- **Name**: SLAMZ PRO-TOUR V2
- **Version**: 0.0.0 (Development/Porting Phase)
- **Event**: Vibejam 2026
- **Status**: Stable (Phase 3 Completed)
- **Primary Goal**: 1:1 Parity with Original JS Prototype

## Port Architecture & Phases

### Phase 3: Single Mount & Visual Restoration
The current port is in "Phase 3" which focuses on:
- **Single Mount Architecture**: React app only renders after Texture Registry and Physics State are fully populated
- **Visual Restoration**: 1:1 visual parity with original prototype
- **Stability Improvements**: React StrictMode disabled for Rapier physics stability

### Key Architectural Changes

#### Initialization Guard System
We do not render the React app until the Texture Registry and Physics State are fully populated. React StrictMode is DISABLED to prevent Rapier unmount crashes.

### React Hooks Crisis Archive
> [!CAUTION]
> This archive documents the "Fatal Hook Mismatch" of April 2026.
- **Root Cause**: Conditional rendering of components containing hooks (Desktop vs Mobile) inside the main `App` tree.
- **Symptoms**: `Error: Rendered more hooks than during the previous render`.
- **Resolution**: Implemented the **Component Separation Pattern**. All device-specific logic is encapsulated in separate leaf components (`MobileControls`, `DesktopControls`), ensuring the main tree's hook count remains static regardless of environment.
- **Rule of Thumb**: Logic goes *inside* hooks, but hooks *never* go inside logic.

#### Texture Registry Integration
- **Phase 3 Addition**: Texture registry now initializes physics world state
- **Synchronous Pre-population**: Physics world populated during texture loading
- **Single Initialization**: Prevents duplicate SLAMZ creation

## Component Port Status

### 1:1 Ported Components
These components have been ported directly from the original with minimal changes:

#### UI Components
- **Achievements Overlay**: "Ported 1:1 from original"
- **Binder UI**: "Ported 1:1 from original UIController"
- **Showcase**: "Ported from v1 UIController.showCaptureShowcase()"

#### Systems
- **Audio System**: Ported 1:1 from `AudioSystem.js`. Managed via `systems/audio.ts`.
- **Set Manager**: Ported 1:1. Handles collection logic and achievement triggers.
- **Set Definitions**: Ported 1:1. The "Source of Truth" for SLAMZ visual properties.

#### Game Logic
- **Drawing Core**: "1:1 PROTOTYPE LOGIC" maintained in texture generation
- **Scene Presets**: "Restored from Original Prototype" with 1:1 visual parity
- **Lighting Rig**: "1:1 PROTOTYPE LIGHTING RIG" preserved

### Prototype Overlays
UI overlays maintained as 1:1 prototypes:
- CRT Overlay
- HUD System
- Showcase System

## Technology Stack Migration

### From Original to V2
- **Build System**: Modern Vite with TypeScript
- **Physics**: @react-three/rapier (WASM-based)
- **3D Rendering**: Three.js 0.183.2 with React Three Fiber
- **State Management**: Zustand with persistence
- **UI Framework**: React 19.2.5 with TypeScript

### Special Configurations
- **WASM Support**: vite-plugin-wasm and vite-plugin-top-level-await
- **Physics Stability**: StrictMode disabled, single mount pattern
- **Development Server**: Port 5173 with host binding

## Current Issues & Build Problems

### Build Failure (Critical)
```
[vite]: Rollup failed to resolve import "react-dom/client" from "src/main.tsx"
```

**Impact**: Production builds fail, development works
**Likely Cause**: Dependency resolution issue during port
**Status**: Needs resolution for deployment

### Known Port Challenges
1. **React StrictMode**: Disabled to prevent Rapier physics unmount crashes
2. **Initialization Race**: Texture registry must complete before React mount
3. **Physics State**: Synchronous pre-population required for stability

## Visual Parity Goals

### Scene Presets
All visual settings restored from original prototype:
- **Lighting**: 1:1 recreation of original lighting rig
- **Atmospheres**: DEFAULT and CYBER_ALLEY presets maintained
- **Camera**: Original positioning and field of view preserved
- **Physics**: Original collision boundaries and spawn positions

### Asset Migration
- **Procedural Themes**: Maintained from original asset system
- **Slammer Types**: Original slammer definitions preserved
- **Set Collections**: 1:1 port of achievement and collection systems

## Development Notes

### Code Patterns
- **Phase Comments**: Extensive "Phase 3" comments throughout codebase
- **1:1 References**: Many components marked as "1:1" ports
- **Original References**: Comments reference original file names and systems

### Initialization Flow
1. Texture Registry loads all materials
2. Physics world pre-populated synchronously  
3. React app mounts (single mount)
4. Game state initialized
5. Systems become active

## Next Steps for Port Completion

### Immediate (Critical)
1. **Fix Build Error**: Resolve react-dom/client import issue
2. **Production Build**: Ensure deployment-ready build
3. **Testing**: Verify 1:1 visual parity

### Future Enhancements
1. **React StrictMode**: Investigate re-enabling with proper cleanup
2. **Performance**: Optimize texture loading and physics initialization
3. **Documentation**: Expand technical documentation

## File Structure Changes

### New Architecture
```
src/
  components/     # React components (ported)
  constants/      # Game constants (restored)
  store/          # Zustand state (new)
  systems/        # Game systems (ported)
  types/          # TypeScript definitions (new)
  utils/          # Utilities (enhanced)
```

### Preserved Elements
- Original game logic and physics
- Visual styling and atmosphere
- Achievement and collection systems
- Audio feedback and UI patterns

## Conclusion

The SLAMZ PRO-TOUR V2 port represents a comprehensive modernization while maintaining 1:1 visual and gameplay parity with the original Vibejam 2026 entry. The port is in active development with most core systems successfully migrated, but requires resolution of build issues for production deployment.

The "Phase 3" architecture demonstrates a mature approach to React + Three.js integration, with careful attention to physics stability and initialization timing - lessons learned from the original development process.
