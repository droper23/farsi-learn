/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Relative base so the build works from any subpath (GitHub Pages project
// sites live at /<repo>/, custom domains live at /). Combined with
// HashRouter for client-side routing, this avoids any GitHub Pages SPA
// fallback configuration entirely.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        id: '/',
        name: 'Farsi Learn — Persian Language Learning',
        short_name: 'Farsi Learn',
        description: 'Learn Persian (Farsi) from the alphabet through advanced reading, with spaced repetition review.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        dir: 'ltr',
        lang: 'en',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The optional Firebase cloud-sync SDK is dynamically imported and
        // only fetched if a user configures + uses cloud sync — it must
        // not be force-downloaded into every visitor's offline cache.
        globIgnores: ['**/firebase-*.js'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setupTests.ts'],
    css: true,
  },
})
