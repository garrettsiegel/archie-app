import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Relative base so the built site works from a GitHub Pages project path.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
