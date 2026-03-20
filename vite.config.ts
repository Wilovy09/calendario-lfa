import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/calendario-lfa/',
  plugins: [tailwindcss(), vue(), vueDevTools()],
  server: {
    allowedHosts: ['localhost', 'b05c-2806-109f-1-d33e-dc8f-1959-69b3-c9b7.ngrok-free.app'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
