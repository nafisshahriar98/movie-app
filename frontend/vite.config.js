 import { defineConfig } from 'vite'
  import react from '@vitejs/plugin-react'

  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/tmdb-image': {
          target: 'https://image.tmdb.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/tmdb-image/, ''),
          secure: false,
        },
        '/api/piratebay': {
          target: 'https://apibay.org',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/piratebay/, ''),
        }
      }
    }
  })