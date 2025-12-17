import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  assetsInclude: ['**/*.html'],
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
