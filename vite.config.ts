import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-map': ['leaflet', 'leaflet-control-geocoder'],
          'vendor-google': ['@google/genai', '@react-oauth/google'],
          'vendor-ui': ['lucide-react', 'motion'],
          'vendor-socket': ['socket.io-client'],
        },
      },
    },
  },
})
