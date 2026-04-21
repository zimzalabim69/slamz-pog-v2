# SLAMZ VAULT INDEX [SYS-OPS-000]

This is the Absolute Master index for the **SLAMZ PRO-TOUR V2** architecture. Every file is registered here with a [SYSTEM ID] for AAAA Dev Rig orchestration.

## [000] START: Initialization & Entry
| File | [SYSTEM ID] | Description |
|---|---|---|
| `000_START/index.html` | `[SYS-INIT-001]` | Entry HTML Document |
| `000_START/main.tsx` | `[SYS-INIT-002]` | React Root Mount & System Guard |
| `000_START/App.tsx` | `[SYS-INIT-003]` | State Orchestrator & View Registry |
| `000_START/App.css` | `[SYS-INIT-004]` | Global App Layout Styles |
| `000_START/style.css` | `[SYS-INIT-005]` | Atomic Base CSS |

## [100] GAMEPLAY: Physics & Logic
| File | [SYSTEM ID] | Description |
|---|---|---|
| `100_GAMEPLAY/store/useGameStore.ts` | `[SYS-GPL-101]` | Central Zustand Brain |
| `100_GAMEPLAY/systems/SetManager.ts` | `[SYS-GPL-102]` | Collection & Achievement Logic |
| `100_GAMEPLAY/components/game/PhysicsWorld.tsx` | `[SYS-GPL-103]` | Rapier Simulation Root |
| `100_GAMEPLAY/components/game/PogStack.tsx` | `[SYS-GPL-104]` | Procedural Stack Generation |
| `100_GAMEPLAY/constants/setDefinitions.ts` | `[SYS-GPL-105]` | POG Archetype Registry |

## [200] FRONTEND: UI/UX Layer
| File | [SYSTEM ID] | Description |
|---|---|---|
| `200_FRONTEND/components/ui/HUD.tsx` | `[SYS-FRE-201]` | Real-time Gameplay Overlay |
| `200_FRONTEND/components/ui/Showcase.tsx` | `[SYS-FRE-202]` | POG Capture Cinematic UI |
| `200_FRONTEND/components/ui/StartScreen.tsx` | `[SYS-FRE-203]` | 3D Interactive Main Menu |

## [300] ASSET_PIPELINE: Virtual Link
| Key | [SYSTEM ID] | Status |
|---|---|---|
| `public/assets/glbs/` | `[SYS-AST-300]` | High-Fidelity Geometry (Awaiting Draco) |
| `public/assets/pogs/` | `[SYS-AST-301]` | Procedural Textures |

## [400] TECH_ROOT: Engine & Cinematics
| File | [SYSTEM ID] | Description |
|---|---|---|
| `400_TECH_ROOT/systems/CinematicEngine.ts` | `[SYS-TCH-401]` | Global Time Dilation Orchestrator |
| `400_TECH_ROOT/components/CinematicSlam.tsx` | `[SYS-TCH-402]` | GSAP Camera Directing |
| `400_TECH_ROOT/shaders/NoirShader.ts` | `[SYS-TCH-403]` | Cinematic Visual Filters |

## [500] ERROR_LOGS: Diagnostics
| File | [SYSTEM ID] | Description |
|---|---|---|
| `500_ERROR_LOGS/utils/SystemLogger.ts` | `[SYS-ERR-501]` | Persistent Logging Core |
| `500_ERROR_LOGS/components/PerformanceMonitor.tsx` | `[SYS-ERR-502]` | FPS/VRAM Real-time Track |

## [900] OPS: Infrastructure
| File | [SYSTEM ID] | Description |
|---|---|---|
| `package.json` | `[SYS-OPS-901]` | Dependency Manifest |
| `vite.config.ts` | `[SYS-OPS-902]` | Build & Alias Engine |
| `tsconfig.json` | `[SYS-OPS-903]` | Type Resolution Config |
