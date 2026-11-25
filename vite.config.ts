import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'qavelyr-logo.png',
          'robots.txt',
        ],
        manifest: {
          id: '/',
          name: 'Free PDF Studio',
          short_name: 'PDF Studio',
          description: 'Professional, completely free & privacy-first PDF tools running 100% in-browser.',
          theme_color: '#e11d48',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,mjs,wasm}'],
          globIgnores: ['**/tesseract/**', '**/assets/aistudio/**'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // Keep precache lightweight (<5 MB total)
          navigateFallback: '/index.html',
          runtimeCaching: [
            {
              urlPattern: /\/tesseract\/.*/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'tesseract-traineddata',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                },
              },
            },
            {
              urlPattern: /\/pdfjs\/(cmaps|standard_fonts)\/.*/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'pdfjs-resources',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 30 * 24 * 60 * 60,
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('pdfjs-dist')) return 'pdfjs';
            if (id.includes('tesseract.js')) return 'tesseract';
            if (id.includes('pdf-lib')) return 'pdflib';
            if (id.includes('jszip')) return 'jszip';
            if (id.includes('docx')) return 'docx';
            if (id.includes('@pdfsmaller')) return 'pdf-crypto';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
