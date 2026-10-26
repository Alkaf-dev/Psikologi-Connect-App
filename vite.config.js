import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/Psikologi-Connect-App/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
})
