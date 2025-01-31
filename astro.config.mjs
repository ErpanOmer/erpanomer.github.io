import {
  defineConfig
} from 'astro/config'
import tailwind from '@astrojs/tailwind';
import path from 'path'
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

console.log(Boolean(process.env.IS_SERVER))

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
  },
  ...(process.env.IS_SERVER ? {
    output: 'server',
    adapter: node({
      mode: 'middleware'
    })
  }: {})
})