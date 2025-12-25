import { defineConfig, passthroughImageService } from 'astro/config'
import tailwind from '@astrojs/tailwind';
import path from 'path'
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://erpanomer.nurverse.com',
  base: '/',
  // SSR Mode
  output: 'server',

  // Use 'compile' service to optimize static images at build time
  // This works even in SSR mode for assets known at build time
  adapter: cloudflare({
    imageService: 'passthrough',
  }),
  image: {
    service: passthroughImageService()
  },

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
