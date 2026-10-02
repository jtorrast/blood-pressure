import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages sirve la app en https://<usuario>.github.io/blood-pressure/
export default defineConfig({
  base: '/blood-pressure/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Módulos opcionales de jsPDF (exportar HTML/SVG) que la app no usa: no se guardan para uso sin conexión.
        globIgnores: ['**/html2canvas-*.js', '**/purify.es-*.js', '**/index.es-*.js'],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: 'Tensión arterial',
        short_name: 'Tensión',
        description: 'Registro sencillo de mediciones de tensión arterial.',
        lang: 'es-ES',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#eef2f5',
        theme_color: '#eef2f5',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
