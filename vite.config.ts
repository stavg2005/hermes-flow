import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // `react.exclude` is not needed; plugins already ignore /node_modules/
    react(),
    tailwindcss(),
  ],

  server: {
    host: true, // Listen on all addresses (good for mobile testing)
    port: 5173,
    strictPort: true,

    // File watching optimizations (this is a good setting)
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.git/**',
        '**/coverage/**',
      ],
    },

    // `hmr: { overlay: true }` is the default behavior, so it's not needed.
  },

  // Path aliases (this was already perfect)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    sourcemap: 'hidden',

    chunkSizeWarningLimit: 1000, // KB
  },

  // Test configuration (this was already perfect)
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
