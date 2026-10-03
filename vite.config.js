import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base: './' keeps every asset path relative, so the build works from a
// subdomain root, a sub-folder, or a file preview without changes.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
