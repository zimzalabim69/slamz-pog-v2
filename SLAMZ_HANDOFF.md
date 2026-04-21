# 🦾 SLAMZ PRO-TOUR V2: THE ULTIMATE HAND-OFF

**Generated:** April 16, 2026  
**Project Status:** Tournament Ready (Vibe Jam 2026 Submission)  
**Vision:** "Cinematic Pure" — High-fidelity arcade action with professional-grade physics orchestration.

---

## 🏛️ Project DNA: The "Cinematic Pure" Vision

The goal of SLAMZ PRO-TOUR V2 was to evolve from a simple mobile simulator into a high-octane desktop experience. The "Cinematic Pure" architecture ensures that the player's focus is always on the visceral impact.

- **Zero-UI Capture**: All prize fanfare is gated to the end-of-round state. The cinematic camera sequence is "pure" — no buttons, no stats, just bullet-time physics.
- **Physics-Camera Synergy**: The `CinematicEngine` and `CinematicSlam` work in lockstep to track the explosion cloud and ensure every hit feels huge.
- **Arcade Fidelity**: Gravity is boosted (-16) and damping is managed to maintain a fast, aggressive pace.

---

## 📁 The "Big Fuck All" Overview (Project Structure)

```
slamz-slamz-v2/
├── 📄 index.html                       — Main HTML entry point with React root mount
├── 📄 package.json                     — NPM dependencies and scripts (vite, react, three, rapier)
├── 📄 package-lock.json                — Locked dependency versions for reproducible builds
├── 📄 tsconfig.json                    — TypeScript compiler configuration
├── 📄 vite.config.ts                   — Vite bundler config with dev server port 5174
├── 🚀 LAUNCH_SYSTEM/
│   ├── 📄 LAUNCH_GAME.bat              — Desktop launcher (Starts dev server, opens browser)
│   ├── 📄 LAUNCH_GAME_SILENT.vbs       — Silent wrapper (no console window)
├── 📚 DOCUMENTATION/
│   ├── 📄 SLAMZ_HANDOFF.md             — [YOU ARE HERE] The ultimate source of truth.
│   ├── 📄 CHANGELOG.md                 — Version history
│   ├── 📄 DEVELOPER_GUIDE.md           — Architecture & contribution guide
├── 💻 SRC/
│   ├── 📄 main.tsx                     — App entry
│   ├── 📄 App.tsx                      — Game state orchestration
│   ├── 📂 store/                       — Zustand state (useGameStore.ts)
│   ├── 📂 systems/                     — CinematicEngine.ts, SetManager.ts
│   ├── 📂 components/                  
│   │   ├── 📄 CinematicSlam.tsx        — GSAP Camera logic
│   │   ├── 📂 ui/                      — Showcase.tsx, HUD.tsx, StartScreen.tsx
│   │   ├── 📂 game/                    — Slamz.tsx, Slammer.tsx, PhysicsWorld.tsx
```

---

## ⚙️ Physics Registry: The "Magic Numbers"

These values are calibrated for a **"Heavy-Weight Arcade"** feel. Modify with caution.

| Parameter | Value | Location | Description |
|---|---|---|---|
| **Gravity** | `-16` | `PhysicsWorld.tsx` | Boosted for faster falling and "thump" feel. |
| **Slammer Mass** | `2.5 - 7.0` | `slammerTypes.ts` | Heavy hitters move the stack better. |
| **SLAMZ Mass** | `0.25` | `gameStore.ts` | Light enough to fly, heavy enough to tumble. |
| **Linear Damping** | `0.80` | `gameStore.ts` | Prevents infinite sliding (The "Viscosity Brake"). |
| **Angular Damping** | `1.00` | `gameStore.ts` | Rapidly stabilizes spinning SLAMZ for settle detection. |
| **Max Velocity** | `15.0` | `gameStore.ts` | Physics governance to prevent "glitch-warping" on impact. |
| **Impact Radius** | `3.0` | `gameStore.ts` | Range of the volcanic eruption effect. |

---

## 🧠 Architectural Map

### 1. `useGameStore.ts` (The Brain)
Zustand powers everything. 
- **Gating**: `gameState` controls which UI elements are visible. 
- **States**: `START_SCREEN` -> `AIMING` -> `SLAM` -> `ROUND_JACKPOT` -> `RESETTING`.
- **Collection**: `setManager` tracks sets (TMNT, Mortal Kombat, etc.) and triggers completion fanfares.

### 2. `CinematicEngine.ts` (The Puppet Master)
Handles the "Bullet Time" transition.
- **`triggerCinematic`**: Hits the brakes on time, applies "Volcanic" impulses.
- **`handOff`**: Restores normal damping and releases the objects back to the simulation.

### 3. `CinematicSlam.tsx` (The Director)
A GSAP timeline that manages the camera during impact:
1. **Windup**: Camera pulls back.
2. **Freeze**: Short hold for impact framing.
3. **Orbit**: 360-degree rotation around the "Slamz Cloud" center.
4. **Reveal**: Return to standard play view.

---

## ⚔️ War Room: Snags and "Struggle Session" Fixes

We hit some major walls during development. Here is how we climbed them.

### 1. The PowerShell vs Node Conflict 
**The Snag:** Using `&&` or `||` in PowerShell scripts (e.g., `npm run dev && echo "Done"`) causes a syntax error because PowerShell uses `;` or `-and`.
**The Fix:** 
- Always use `cmd /c` if you need complex chaining in `.bat` files.
- In IDE terminals, manually verify scripts rather than relying on `&&`.

### 2. The React Hooks Crisis 
**The Snag:** Dynamically switching between `MobileControls` and `DesktopControls` was causing "Rendered more hooks than during previous render" errors.
**The Fix:** 
- **Strict Isolation**: We separated controls into independent components and use a single top-level conditional in `App.tsx`.
- Never put hooks inside `if` statements!

### 3. Cinematic Pure Gating 
**The Snag:** SLAMZ were being "discovered" multiple times, or the prize UI would pop up during the bullet-time orbit.
**The Fix:** 
- **State Sequestration**: `Showcase.tsx` is now strictly locked to `gameState === 'ROUND_JACKPOT'`.
- All inventory logic is deferred until the `CinematicEngine` finishes its hand-off.

---

## 🗺️ Roadmap: The Future of Slamz

If you are picking this up, here is what is next on the list:
- **Set Completion Bonuses**: Add unique VFX when a full set (e.g., all TMNT) is captured.
- **The "Impact Lab" Expansion**: More tweakable parameters for "Gravity Glitch" modes.
- **Multiplayer P2P**: Basic "Battle Mode" where two players trade slams.
- **Slammer Customization**: Texture overrides for custom slammers.

---

## 🏁 Final Message from the Assistant

Brody, it's been a ride. We've wrestled with physics engines, fought React hook crashes, and rebuilt the Showcase from the ashes more than once. The game is in a "Pure" state now — stable, calibrated, and ready for the jam.

Keep the damping high, keep the gravity heavy, and don't let PowerShell break your chain operators.

**Slam on.** 🛸💥
