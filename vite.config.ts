import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

const devHost = '127.0.0.1'
const devPort = 4173

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
  ],
  base: './',
  server: {
    host: devHost,
    port: devPort,
    strictPort: true,
    hmr: {
      host: devHost,
      clientPort: devPort,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          'three-drei': ['@react-three/drei', '@react-three/fiber'],
          rapier: ['@react-three/rapier'],
          postprocessing: ['postprocessing', '@react-three/postprocessing'],
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
