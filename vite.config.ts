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
        // Pre-generated pronunciation clips (~500 files, ~7MB — see
        // scripts/generate_audio.py) are deliberately NOT in globPatterns
        // above: forcing every visitor to download all of them upfront
        // would be a heavy, unannounced first-load cost on an otherwise
        // lightweight app. Instead, cache each clip the first time it's
        // played, so replays and later offline use are instant/offline —
        // consistent with the app's "fully offline" design without the
        // upfront tax.
        runtimeCaching: [
          {
            urlPattern: /\/audio\/.*\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pronunciation-audio',
              expiration: { maxEntries: 1000, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    modulePreload: {
      // Vite's default modulepreload injection would otherwise <link
      // modulepreload> the firebase chunk on every page load just because
      // it's *reachable* via dynamic import() — silently forcing the
      // ~700KB optional cloud-sync SDK to download for every visitor even
      // when cloud sync is never configured or used. Exclude it so it's
      // only fetched at the moment code actually calls import('firebase/*').
      resolveDependencies: (_url, deps) => deps.filter((dep) => !dep.includes('firebase')),
    },
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
