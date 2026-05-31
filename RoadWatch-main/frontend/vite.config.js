import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Remove the old hand-written sw.js from the build — Workbox generates its own
      injectRegister: 'auto',

      // ── Web App Manifest ───────────────────────────────────────
      manifest: {
        name: 'RoadWatch',
        short_name: 'RoadWatch',
        description: 'Civic road transparency and complaint platform for India',
        theme_color: '#4f46e5',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        screenshots: [
          {
            src: 'screenshot_chat.png',
            sizes: '430x932',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'RoadWatch AI Assistant',
          },
          {
            src: 'screenshot_map.png',
            sizes: '430x932',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Road Infrastructure Map',
          },
        ],
      },

      // ── Workbox Configuration ──────────────────────────────────
      workbox: {
        // Files to precache (app shell) — Workbox auto-includes the Vite build output
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Runtime caching strategies
        runtimeCaching: [
          // ── Strategy 1: Road data API — NetworkFirst, 24 hr cache ──
          {
            urlPattern: /\/api\/roads/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'roadwatch-api-roads',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3,
            },
          },

          // ── Strategy 2: Complaints API — NetworkFirst, 1 hr cache ──
          {
            urlPattern: /\/api\/complaints/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'roadwatch-api-complaints',
              expiration: {
                maxAgeSeconds: 60 * 60, // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              networkTimeoutSeconds: 3,
            },
          },

          // ── Strategy 3: OpenStreetMap tiles — CacheFirst, max 500, 7 day ──
          {
            urlPattern: /^https:\/\/[a-c]?\.?tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'roadwatch-osm-tiles',
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          // ── Strategy 4: Gemini API — NetworkOnly (never cache AI responses) ──
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
            handler: 'NetworkOnly',
          },

          // ── Strategy 5: Google Fonts stylesheets — StaleWhileRevalidate ──
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },

          // ── Strategy 6: Google Fonts webfont files — CacheFirst, 1 year ──
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },

      // Dev options — enable SW in dev mode for testing
      devOptions: {
        enabled: false, // Set to true to test PWA in dev mode
      },
    }),
  ],
})
