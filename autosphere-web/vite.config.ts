import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass(req) {
          // GET /auth/login is the login page (SPA route). Only proxy POST (login API).
          if (req.method === 'GET') return '/index.html';
        },
      },
    },
  },
})
