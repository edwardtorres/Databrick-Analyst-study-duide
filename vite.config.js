import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Writes chunk-map.json next to index.html: { "4": "assets/ch4-<hash>.js", … }.
// The app reads it only when a chapter download fails, so Retry knows which
// file to re-import (with a cache-busting query) on every browser, without
// relying on the browser's error message (Safari's has no URL).
function chapterChunkMap() {
  return {
    name: 'chapter-chunk-map',
    apply: 'build',
    generateBundle(_, bundle) {
      const map = {}
      for (const [fileName, chunk] of Object.entries(bundle)) {
        const m = chunk.type === 'chunk' && chunk.isDynamicEntry && chunk.facadeModuleId?.match(/[\\/]src[\\/]data[\\/]ch(\d+)[\\/]index\.js$/)
        if (m) map[m[1]] = fileName
      }
      this.emitFile({ type: 'asset', fileName: 'chunk-map.json', source: JSON.stringify(map, null, 2) })
    },
  }
}

// base: './' keeps every asset path relative, so the build works from a
// subdomain root, a sub-folder, or a file preview without changes.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), chapterChunkMap()],
})
