import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/mappls-auth': {
        target: 'https://outpost.mappls.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mappls-auth/, '/api/security/oauth/token'),
      },
      '/mappls-search': {
        target: 'https://atlas.mappls.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mappls-search/, '/api/places/nearby/json'),
      },
    },
  },
})
