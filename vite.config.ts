import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
  base: './',
  server: {
    port: 5173,
    host: true,
    hmr: {
      clientPort: 5173,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Three.js ecosystem
          'three': ['three'],
          'three-drei': ['@react-three/drei', '@react-three/fiber'],
          // Separate Rapier physics
          'rapier': ['@react-three/rapier'],
          // Separate post-processing
          'postprocessing': ['postprocessing', '@react-three/postprocessing'],
          // Separate React
          'react-vendor': ['react', 'react-dom'],
        }
      }
    },
    // Enable compression for production builds
    chunkSizeWarningLimit: 1000,
  }
})
