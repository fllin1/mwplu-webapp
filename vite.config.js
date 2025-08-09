import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      // Ensure all CSS is preserved during build
      extractComments: false,
    },
    // Prevent CSS purging/tree-shaking issues
    devSourcemap: true,
  },
  build: {
    // Disable CSS code splitting to prevent issues with dynamic components
    cssCodeSplit: false,
    // Ensure all CSS is included in production
    cssMinify: true,
    rollupOptions: {
      output: {
        // Ensure CSS is properly bundled
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        // Prevent chunking issues that might affect CSS
        manualChunks: undefined,
      },
    },
  },
  // Ensure proper environment detection
  define: {
    __VUE_PROD_DEVTOOLS__: false,
  },
})
