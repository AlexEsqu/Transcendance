// @ts-ignore
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  assetsInclude: ['**/*.html'],
  server: {
    host: '0.0.0.0',
    port: 8080,
	allowedHosts: [
      "localhost",
      "typescript",
      "nginx"
    ],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
})
