import {
  defineConfig
} from 'astro/config'
import tailwind from '@astrojs/tailwind';
import path from 'path'

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://erpanomer.github.io',
  base: '/',
  integrations: [tailwind(), sitemap({
    serialize(item) {
      item.lastmod = new Date();
      return item;
    },
  })],
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
  build: {
    inlineStylesheets: `always`,
  },
  server: {
    open: true
  }
})