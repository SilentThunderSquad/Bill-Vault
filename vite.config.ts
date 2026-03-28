import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import viteCompression from 'vite-plugin-compression'
import path from 'path'

export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Babel plugins for optimization
      babel: {
        plugins: [
          // Remove PropTypes in production
          ['babel-plugin-transform-react-remove-prop-types', { removeImport: true }],
        ],
      },
    }),
    tailwindcss(),
    // Gzip compression
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // Only compress files > 10KB
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression (better than gzip)
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240,
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/*.svg', 'icons/*.png', 'robots.txt', 'sitemap.xml'],
      manifest: {
        id: '/',
        name: 'Bill Vault',
        short_name: 'Bill Vault',
        description: 'Store bills securely, track product warranties, and get alerts before they expire.',
        theme_color: '#1E1B4B',
        background_color: '#0F0D1A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['finance', 'utilities', 'productivity'],
        shortcuts: [
          {
            name: 'Add Bill',
            short_name: 'Add',
            description: 'Add a new bill',
            url: '/bills/new',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'My Bills',
            short_name: 'Bills',
            description: 'View all bills',
            url: '/bills',
            icons: [{ src: '/icons/icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/(auth|callback)/, /\.(js|css|png|jpg|svg|ico)$/],
        // Skip waiting and claim clients immediately for faster updates
        skipWaiting: true,
        clientsClaim: true,
        // Import warranty notification handler into main service worker
        importScripts: ['/sw-warranty-handler.js'],
        runtimeCaching: [
          {
            // Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Supabase storage (images/files) - cache first for performance
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [200] // Only cache successful responses, not opaque
              }
            }
          },
          {
            // Supabase API - network first with fallback
            // IMPORTANT: Only cache 200 responses to avoid caching auth errors
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour (short for API data)
              },
              cacheableResponse: {
                statuses: [200] // Only cache successful responses
              }
            }
          },
          {
            // Supabase Auth - never cache
            urlPattern: /^https:\/\/.*\.supabase\.co\/auth\/.*/i,
            handler: 'NetworkOnly'
          }
        ],
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: true, // Enable PWA in development for warranty notification testing
        type: 'module',
        navigateFallback: '/index.html'
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separate each major library into its own chunk
          if (id.includes('tesseract.js')) {
            return 'tesseract';
          }
          if (id.includes('pdfjs-dist')) {
            return 'pdfjs';
          }
          if (id.includes('recharts')) {
            return 'recharts';
          }
          if (id.includes('framer-motion')) {
            return 'framer-motion';
          }
          if (id.includes('node_modules')) {
            // Split node_modules into smaller chunks
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('@base-ui')) {
              return 'base-ui';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('react-router-dom') || id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor';
            }
            if (id.includes('date-fns')) {
              return 'date-utils';
            }
            // Other node_modules → vendor chunk
            return 'vendor-libs';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
  },
})
