import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'gsap': ['gsap'],
          'framer-motion': ['framer-motion'],
          'three': ['three', '@react-three/fiber', '@react-three/drei'],
          'reactflow': ['reactflow'],
          'i18n': ['i18next', 'react-i18next'],
        }
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})