import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve, join } from 'path'
import { readFileSync, existsSync } from 'fs'
import { env } from './vite.env.config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'generateSW',
      includeAssets: ['chronus-white.svg', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Chronus App',
        short_name: 'Chronus',
        description: 'Chronus time tracking application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ],
        id: '/',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait'
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
        skipWaiting: true
      }
    })
  ],
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
    },
  },
  server: {
    host: env.VITE_HOST,
    port: parseInt(env.VITE_PORT),
    https: getHttpsOptions(),
    proxy: {
      '/api': {
        target: env.VITE_API_URL,
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        ws: true, // Enable WebSocket proxying
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
    allowedHosts: [env.VITE_ALLOWED_HOSTS],
    host: env.VITE_HOST,
    port: parseInt(env.VITE_PORT),
    https: getHttpsOptions(),
    proxy: {
      '/api': {
        target: env.VITE_API_URL,
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        ws: true, // Enable WebSocket proxying
      }
    }
  }
})

function getHttpsOptions(): { key: Buffer; cert: Buffer } | undefined {
  // Check environment variables first
  const sslKeyPath = process.env.SSL_KEYFILE;
  const sslCertPath = process.env.SSL_CERTFILE;
  
  // If both paths are provided via environment variables, use them
  if (sslKeyPath && sslCertPath) {
    try {
      if (!existsSync(sslKeyPath) || !existsSync(sslCertPath)) {
        console.warn(`⚠️  SSL certificate files not found at specified paths`);
        return undefined;
      }
      return {
        key: readFileSync(sslKeyPath),
        cert: readFileSync(sslCertPath),
      };
    } catch (error) {
      console.warn(`⚠️  Failed to load SSL certificates: ${error instanceof Error ? error.message : String(error)}`);
      console.warn("⚠️  Falling back to HTTP");
      return undefined;
    }
  }
  
  // Try default shared-certs location if no paths provided
  // From frontend/: go up to programming/, then into shared-certs/
  const programmingDir = join(__dirname, "../..");
  const defaultSharedCertsPath = join(
    programmingDir,
    "shared-certs"
  );
  const defaultKeyPath = join(defaultSharedCertsPath, "server.key");
  const defaultCertPath = join(defaultSharedCertsPath, "server.crt");
  
  if (existsSync(defaultKeyPath) && existsSync(defaultCertPath)) {
    try {
      const key = readFileSync(defaultKeyPath);
      const cert = readFileSync(defaultCertPath);
      console.log(`🔒 Using SSL certificates from: ${defaultSharedCertsPath}`);
      return { key, cert };
    } catch (error) {
      console.warn(`⚠️  Failed to read SSL certificates: ${error instanceof Error ? error.message : String(error)}`);
      return undefined;
    }
  }
  
  // Certificates not found, continue with HTTP
  return undefined;
}
