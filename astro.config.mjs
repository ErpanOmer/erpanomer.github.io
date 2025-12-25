import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind';
import path from 'path'
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://erpanomer.github.io',
  base: '/',
  output: 'server',
  adapter: cloudflare(),

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

  build: {
    inlineStylesheets: 'always',
  },

  server: {
    open: true
  }
})