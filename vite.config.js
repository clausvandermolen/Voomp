import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Phase 4 Lighthouse optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Code-split large components
          'interactive-map': ['./src/components/map/InteractiveListingMap.jsx'],
          'vendor': [
            'react',
            'react-dom',
            'react-router-dom',
          ],
        },
      },
    },
    // Enable source maps for debugging in production
    sourcemap: false,
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
})
