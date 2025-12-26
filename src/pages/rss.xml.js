import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
    const blog = await getCollection('blog');

    // Sort posts by date (newest first)
    blog.sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());

    return rss({
        title: 'ErpanOmer Blog',
        description: '资深 Web 前端工程师，专注于 Shopify 独立站开发与 Cloudflare 边缘计算。',
        site: context.site,
        items: blog.map((post) => ({
            title: post.data.title,
            pubDate: post.data.pubDate,
            description: post.data.description,
            link: `/blog/${post.slug}/`,
        })),
        customData: `<language>zh-cn</language>`,
    });
}