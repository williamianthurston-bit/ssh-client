import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Standalone browser-preview config (no Electron)
export default defineConfig({
  root: 'src/renderer',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src/renderer/src'),
      '@renderer': resolve(__dirname, 'src/renderer/src')
    }
  },
  server: {
    host: '127.0.0.1',
    port: 3456,
    strictPort: true
  },
  build: {
    outDir: resolve(__dirname, 'out/preview'),
    emptyOutDir: true
  }
})
