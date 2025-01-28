import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind';
import path from 'path'

export default defineConfig({
  site: 'https://erpanomer.github.io',
  base: '/',
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('src')
      }
    }
  },
  experimental: {
    svg: true,
  },
})