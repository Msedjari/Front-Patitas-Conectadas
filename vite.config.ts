import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { config } from './src/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: config.apiUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    cors: true
  }
})
