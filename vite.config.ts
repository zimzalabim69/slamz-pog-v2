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
      enable: false,   // you can change to false later if it causes issues
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
    host: true, // Listen on all addresses
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
        manualChunks: {
          three: ['three'],
          'react-three-core': ['@react-three/fiber', '@react-three/drei'],
          'rapier-core': ['@dimforge/rapier3d-compat'],
          'rapier-react': ['@react-three/rapier'],
          postprocessing: ['postprocessing', '@react-three/postprocessing'],
          'react-vendor': ['react', 'react-dom', 'zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 2500,
  },
})
