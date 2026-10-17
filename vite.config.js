import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Frontend calls /api/... ; Vite proxies it to the Spring Boot backend in dev.
      '/api': { target: process.env.VITE_API_TARGET || 'http://localhost:8080', changeOrigin: true }
    }
  }
})
