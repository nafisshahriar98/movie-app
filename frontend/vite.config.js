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
        },
        // YTS has a clean API with pre-filtered streamable torrents — try this before apibay
        '/api/yts': {
          target: 'https://yts.mx',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/yts/, ''),
        }
      }
    }
  })