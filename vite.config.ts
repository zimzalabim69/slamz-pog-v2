import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'
import { fileURLToPath } from 'url'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// DevTools for your game
import reactScan from '@react-scan/vite-plugin-react-scan'

const devHost = '127.0.0.1'
const devPort = 4173

export default defineConfig({
  root: './000_START',
  publicDir: '../public',
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),

    // React Scan → shows you which components are re-rendering too much (super useful for games!)
    reactScan({
      enable: false,
    }),
    ViteImageOptimizer({
      png: {
        quality: 100,
      },
      jpg: {
        quality: 85,
      },
      webp: {
        lossless: true,
      },
      avif: {
        lossless: true,
      },
      cache: true,
      cacheLocation: '.slamz/cache',
    }),
  ],

  resolve: {
    alias: {
      '@000': path.resolve(__dirname, './000_START'),
      '@100': path.resolve(__dirname, './100_GAMEPLAY'),
      '@200': path.resolve(__dirname, './200_FRONTEND'),
      '@300': path.resolve(__dirname, './300_ASSET_PIPELINE'),
      '@400': path.resolve(__dirname, './400_TECH_ROOT'),
      '@500': path.resolve(__dirname, './500_ERROR_LOGS'),
      '@900': path.resolve(__dirname, './900_OPS'),
      '@src': path.resolve(__dirname, './src'),
    },
  },

  base: './',

  server: {
    host: true,
    port: devPort,
    hmr: {
      overlay: true,
    },
    fs: {
      allow: ['..'],
    },
  },

  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, '000_START/index.html'),
      },
      output: {
        // FIX: rapier-react <-> react-three-core circular chunk.
        // Solution: merge them into a single 'r3f-physics' chunk so Rollup
        // never has to split a dependency that points back at itself.
        manualChunks(id) {
          // Rapier core WASM — keep isolated (large, infrequently updated)
          if (id.includes('@dimforge/rapier3d-compat')) {
            return 'rapier-core';
          }
          // Merge rapier-react + all R3F packages into one chunk to break the cycle
          if (
            id.includes('@react-three/rapier') ||
            id.includes('@react-three/fiber') ||
            id.includes('@react-three/drei') ||
            id.includes('@react-three/postprocessing')
          ) {
            return 'r3f-bundle';
          }
          // postprocessing standalone
          if (id.includes('postprocessing')) {
            return 'r3f-bundle';
          }
          // Three.js core
          if (id.includes('/three/')) {
            return 'three';
          }
          // React + Zustand vendor
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('zustand')
          ) {
            return 'react-vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 2500,
  },
})
