# ASSET PIPELINE MANIFEST [SYS-AST-000]

## 1. 3D Geometry (GLBs)
| Asset | [SYSTEM ID] | Size | Status | Budget / Target |
|---|---|---|---|---|
| `Game_Over_Arcade.glb` | `[SYS-AST-300]` | 38.4 MB | **CRITICAL: TOO LARGE** | Target < 5MB (Requires Draco) |
| `Game_Over_Storefront.glb` | `[SYS-AST-301]` | 15.8 MB | **WARNING** | Target < 3MB |
| `slamz_logo_bg.glb` | `[SYS-AST-302]` | 53.6 MB | **CRITICAL: TOO LARGE** | Target < 10MB |
| `Slamz_Wraith.glb` | `[SYS-AST-303]` | 35.6 MB | **High Fidelity** | Optimization Required |
| `Slamz_Pro_Tour_Arcade.glb` | `[SYS-AST-304]` | 10.2 MB | Stable | Standard LOD |
| `Slamz_Neon_Battle_Area.glb` | `[SYS-AST-305]` | 8.0 MB | Stable | Standard LOD |
| `Slamz_Rug.glb` | `[SYS-AST-306]` | 16.4 MB | **WARNING** | Target < 2MB |

## 2. slamz & Slammer Textures
| Category | Avg Size | Count | Status |
|---|---|---|---|
| slamz Faces | ~1.0 MB | 14 | Optimal (PNG) |
| Slammer Textures | ~0.8 MB | 1 | Optimal |
| Dynamic Mat (PNG) | ~1.1 MB | 2 | Stable |

## 3. Tech Strategy
- **Draco Compression**: Pending (Next Task).
- **KTX2 Textures**: Not implemented.
- **LOD Levels**: None defined in code.
- **Naming Convention**: Mostly following `Slamz_` prefix.

> [!IMPORTANT]
> The current asset footprint is ~180MB. This does not meet "Cinematic Pure" loading standards for instant-play fidelity. Draco and Texture compression are non-negotiable.
