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
      "nginx",
      process.env.HOST
    ],
  },
  hmr: {
      // Configuration HMR pour fonctionner derrière Nginx
      clientPort: 8443,
      protocol: 'wss',
      host: 'localhost'
    },
    watch: {
      usePolling: true, // Nécessaire dans Docker
    },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  css: {
    postcss: './postcss.config.js',
  },
})
