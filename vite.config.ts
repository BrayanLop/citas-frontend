import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// La API de Citas corre en http://localhost:5202 (perfil "http") y no expone CORS.
// Usamos un proxy: el front llama a /api/... y Vite lo reenvía al backend.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5202',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
