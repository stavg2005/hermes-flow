// vite.config.ts
import { defineConfig } from 'vitest/config'  // ← Change this line
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true, // Enables global test functions without imports
  },
  server:{
host:'0.0.0.0',
port:5173,
watch:{
  usePolling:true,
  interval:100
},
hmr:{
  host:'0.0.0.0',
  port:5173
}
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
