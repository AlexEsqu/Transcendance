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
      `${process.env.VITE_HOST}`
    ],
  },
  hmr: {
      // Configuration HMR pour fonctionner derrière Nginx
      protocol: 'wss',
      host: `${process.env.VITE_HOST}`,
      port: 443
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
