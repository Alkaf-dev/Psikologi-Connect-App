import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/Psikologi-Connect-App/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/app': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/livewire': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})
