import rss from '@astrojs/rss';
import { getCatalog } from '@/lib/blog-catalog';

export async function GET(context) {
    try {
        const page = await getCatalog(context.locals.runtime?.env?.BLOG_DB, { q:'', tag:'', sort:'latest', includeMeta:false }, 50);
        return rss({
            title: 'ErpanOmer Blog',
            description: '前端技术官 · 前端工程、Shopify、Cloudflare 与 AI 实践（最新 50 篇）',
            site: context.site,
            items: page.items.map(post=>({ title:post.title,pubDate:new Date(post.pubDate),description:post.description,link:`/blog/${post.slug}/` })),
            customData: '<language>zh-cn</language>',
        });
    } catch (error) {
        console.error('RSS catalog query:',error);
        return new Response('Feed temporarily unavailable', { status:503,headers:{'Cache-Control':'no-store'} });
    }
}
