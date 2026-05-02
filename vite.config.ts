import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  root: fileURLToPath(new URL('./apps/simple-telly', import.meta.url)),
  plugins: [
    vue(),
    tailwindcss(),
    vueJsx(),
    process.env.NODE_ENV !== 'test' && vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/simple-telly/src', import.meta.url)),
      '@simple-telly/ui': fileURLToPath(new URL('./libs/simple-telly-ui/src', import.meta.url)),
    },
  },
})
