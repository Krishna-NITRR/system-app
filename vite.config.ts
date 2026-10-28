import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      // The plain registration script never asks a new worker to take
      // over, so returning visitors kept the old build until every tab
      // was closed. Activate new builds as soon as they are installed.
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Krishna Mahawar',
        short_name: 'Krishna M',
        description: 'Start research from scratch, publish your work, and use it to land internships, jobs, or build startups.',
        theme_color: '#0a0a14',
        background_color: '#0a0a14',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    fs: {
      allow: ['..']
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
