import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import { env } from './vite.env.config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'generateSW',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Chronus App',
        short_name: 'Chronus',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ],
        id: '/',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff'
      },
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        navigateFallback: 'index.html',
        navigateFallbackAllowlist: [/^\/(?!api\/).*$/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200]
              },
              backgroundSync: {
                name: 'api-queue',
                options: {
                  maxRetentionTime: 24 * 60 // Retry for max of 24 hours (specified in minutes)
                }
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\./i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      }
    })
  ],
  base: '/',
  server: {
    host: env.VITE_HOST,
    port: parseInt(env.VITE_PORT),
    proxy: {
      '/api': {
        target: env.VITE_API_URL,
        changeOrigin: true
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'index.html'),
      },
    },
    outDir: 'dist'
  },
  preview: {
    allowedHosts: [env.VITE_ALLOWED_HOSTS], // or 'chronus.cc-an.com' if that's what you're sticking with
    host: env.VITE_HOST,
    port: parseInt(env.VITE_PORT),
    proxy: {
      '/api': {
        target: env.VITE_API_URL,
        changeOrigin: true
      }
    }
  }
})
