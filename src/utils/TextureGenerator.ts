import * as THREE from 'three';
import { getSetForTheme } from '../constants/setDefinitions';
import { PROCEDURAL_THEMES, SLAMMER_SKINS } from '../constants/pogData';
import { useGameStore } from '../store/useGameStore';

// ============================================================
// GLOBAL TEXTURE REGISTRY (The Source of Truth)
// ============================================================

const PRELOADED_TEXTURES: Record<string, HTMLImageElement> = {};
const MATERIAL_REGISTRY: Record<string, THREE.MeshStandardMaterial[]> = {};
const FOIL_TEXTURE: { current: THREE.CanvasTexture | null } = { current: null };

let isRegistryReady = false;
let hasInitializedPogs = false;

/**
 * Preloads all PNG assets and builds the entire material registry.
 * Phase 3 addition: Also initializes the physics world state.
 * MUST be called and awaited before mounting the 3D scene.
 */
export async function initializeTextureRegistry() {
    if (isRegistryReady) return;

    console.log("Initializing Texture Registry...");
    
    // 1. Preload PNGs
    const loader = new THREE.TextureLoader();
    const assets = [
        ...PROCEDURAL_THEMES,
        ...Object.values(SLAMMER_SKINS)
    ];

    const promises = assets.map(id => {
        return new Promise<void>((resolve) => {
            loader.load(`/assets/pogs/${id}.png`, 
                (tex) => {
                    PRELOADED_TEXTURES[id] = tex.image as HTMLImageElement;
                    resolve();
                },
                undefined,
                () => {
                    console.warn(`Failed to load texture: ${id}`);
                    resolve();
                }
            );
        });
    });

    await Promise.all(promises);

    // 2. Prepare Shared Foil
    FOIL_TEXTURE.current = generateFoilTexture();

    // 3. Generate ALL Procedural Materials (POGs)
    for (const theme of PROCEDURAL_THEMES) {
        for (const rarity of ['standard', 'shiny', 'holographic']) {
            const key = `pog_metal_${theme}_${rarity}`;
            MATERIAL_REGISTRY[key] = buildSlamzMaterial('pog', 'metal', theme, rarity);
        }
    }

    // 4. Generate ALL Procedural Materials (Slammers)
    for (const variant of Object.keys(SLAMMER_SKINS)) {
        const key = `slammer_${variant}_null_standard`;
        MATERIAL_REGISTRY[key] = buildSlamzMaterial('slammer', variant, null, 'standard');
    }

    // Phase 3: Synchronous Physics Pre-population
    if (!hasInitializedPogs) {
        console.log('[TEXTURE REGISTRY] Calling initPogs() for the first time');
        useGameStore.getState().initPogs();
        hasInitializedPogs = true;
    } else {
        console.log('[TEXTURE REGISTRY] POGs already initialized, skipping initPogs()');
    }

    isRegistryReady = true;
    console.log(`Texture registry ready with ${Object.keys(MATERIAL_REGISTRY).length} materials.`);
}

export function getRegistryStatus() {
    return isRegistryReady;
}

export function getMaterialFromRegistry(type: 'pog' | 'slammer', variant = 'metal', theme: string | null = null, rarity = 'standard') {
    const key = type === 'slammer' 
        ? `slammer_${variant}_null_standard` 
        : `pog_metal_${theme}_${rarity}`;
    
    const mat = MATERIAL_REGISTRY[key];
    if (!mat) {
        console.warn(`Material not found in registry: ${key}. Falling back to default.`);
        return MATERIAL_REGISTRY[`pog_metal_${PROCEDURAL_THEMES[0]}_standard`];
    }
    return mat;
}

// ============================================================
// INTERNAL MATERIAL BUILDER (Run once during init)
// ============================================================

function buildSlamzMaterial(type: 'pog' | 'slammer', variant: string, theme: string | null, rarity: string): THREE.MeshStandardMaterial[] {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    
    const activeTheme = theme || PROCEDURAL_THEMES[0];
    const isShiny = rarity === 'shiny' || rarity === 'holographic';
    const setDef = getSetForTheme(activeTheme);
    const coreColor = setDef ? new THREE.Color(setDef.color) : new THREE.Color(0xffffff);

    drawPogToCanvas(canvas, type, variant, activeTheme, rarity);
    
    const faceTex = new THREE.CanvasTexture(canvas);
    faceTex.anisotropy = 16;
    const faceBump = createHeightMapFromCanvas(canvas);
    const envMap = isShiny ? FOIL_TEXTURE.current : null;

    if (type === 'slammer') {
        const sideMat = new THREE.MeshStandardMaterial({ 
            color: coreColor,
            roughness: isShiny ? 0.1 : 0.4,
            metalness: isShiny ? 1.0 : 0.9,
            emissive: coreColor,
            emissiveIntensity: 0.5
        });
        const faceMat = new THREE.MeshStandardMaterial({ 
            map: faceTex,
            metalness: isShiny ? 1.0 : 0.8,
            roughness: isShiny ? 0.05 : 0.2,
            envMap: envMap,
            envMapIntensity: isShiny ? 2.5 : 1.0,
            bumpMap: faceBump,
            bumpScale: 0.18
        });
        return [sideMat, faceMat, sideMat];
    } else {
        const backCanvas = document.createElement('canvas');
        backCanvas.width = 512;
        backCanvas.height = 512;
        drawBackToCanvas(backCanvas, rarity);
        const backTex = new THREE.CanvasTexture(backCanvas);
        const backBump = createHeightMapFromCanvas(backCanvas);

        const sideMat = new THREE.MeshStandardMaterial({ 
            color: coreColor, 
            roughness: isShiny ? 0.2 : 0.6,
            metalness: isShiny ? 0.8 : 0.1,
            emissive: coreColor,
            emissiveIntensity: 0.3
        });

        const faceMat = new THREE.MeshStandardMaterial({ 
            map: faceTex, 
            roughness: isShiny ? 0.4 : 1.0, 
            metalness: isShiny ? 0.6 : 0.0,
            envMap: envMap,
            envMapIntensity: isShiny ? 0.8 : 0.0,
            bumpMap: faceBump,
            bumpScale: 0.05
        });

        const backMat = new THREE.MeshStandardMaterial({ 
            map: backTex, 
            roughness: 0.8,
            metalness: 0,
            bumpMap: backBump,
            bumpScale: 0.03
        });

        return [sideMat, faceMat, backMat];
    }
}

// ============================================================
// DRAWING CORE (1:1 PROTOTYPE LOGIC)
// ============================================================

function drawBackToCanvas(canvas: HTMLCanvasElement, rarity: string) {
    const ctx = canvas.getContext('2d')!;
    const Cx = 256, Cy = 256, R = 230;
    const accentMap: Record<string, string> = { holographic: '#ff00ff', shiny: '#00e5ff', standard: '#00ffcc' };
    const accent = accentMap[rarity] || '#00ffcc';

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(Cx, Cy, R, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = accent + '55';
    ctx.lineWidth = 1;
    for (let i = -R; i < R; i += 28) {
        ctx.beginPath(); ctx.moveTo(Cx - R, Cy + i); ctx.lineTo(Cx + R, Cy + i); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(Cx + i, Cy - R); ctx.lineTo(Cx + i, Cy + R); ctx.stroke();
    }

    ctx.strokeStyle = accent;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 18;
    ctx.shadowColor = accent;
    ctx.beginPath(); ctx.arc(Cx, Cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = '900 96px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('SLAMZ', Cx, Cy - 18);
    ctx.font = '900 28px Orbitron';
    ctx.fillStyle = accent;
    ctx.fillText('PRO-TOUR', Cx, Cy + 52);
}

function drawPogToCanvas(canvas: HTMLCanvasElement, type: string, variant: string, theme: string, rarity: string) {
    const ctx = canvas.getContext('2d')!;
    // Center pog based on canvas size (600x600 for showcase)
    const cx = canvas.width / 2, cy = canvas.height / 2, r = 240;

    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.arc(cx, cy, r + 10, 0, Math.PI * 2); ctx.fill();

    drawFoilRim(ctx, cx, cy, r, rarity);

    let selectedTheme = theme;
    if (type === 'slammer') {
        selectedTheme = SLAMMER_SKINS[variant as keyof typeof SLAMMER_SKINS] || 'slamzer_mortal';
    }

    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();

    const highEndTexture = PRELOADED_TEXTURES[selectedTheme];
    if (highEndTexture) {
        // Draw texture centered on the pog
        const textureSize = 512;
        const startX = cx - textureSize / 2;
        const startY = cy - textureSize / 2;
        ctx.drawImage(highEndTexture, startX, startY, textureSize, textureSize);
    } else {
        // Draw fallback background centered
        const bgSize = 512;
        const startX = cx - bgSize / 2;
        const startY = cy - bgSize / 2;
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(startX, startY, bgSize, bgSize);
        ctx.fillStyle = '#00ffcc';
        ctx.font = '900 80px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(theme.split('_')[1]?.toUpperCase() || '?', cx, cy);
    }

    ctx.restore();
}

function drawFoilRim(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, rarity: string) {
    const rimGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    if (rarity === 'holographic') {
        rimGrad.addColorStop(0, '#ffd700'); rimGrad.addColorStop(0.5, '#fff7ae'); rimGrad.addColorStop(1, '#8a6e00');
    } else {
        rimGrad.addColorStop(0, '#777'); rimGrad.addColorStop(0.5, '#eee'); rimGrad.addColorStop(1, '#444');
    }
    ctx.beginPath(); ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
    ctx.strokeStyle = rimGrad; ctx.lineWidth = 12; ctx.stroke();
}

function generateFoilTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    grad.addColorStop(0, '#ff00ff'); grad.addColorStop(0.5, '#00ffff'); grad.addColorStop(1, '#ffff00');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    return tex;
}

function createHeightMapFromCanvas(sourceCanvas: HTMLCanvasElement) {
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.filter = 'grayscale(100%) contrast(180%) blur(0.5px)';
    ctx.drawImage(sourceCanvas, 0, 0);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    return tex;
}

// Export for Binder UI
export { drawPogToCanvas };
