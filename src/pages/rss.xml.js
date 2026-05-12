import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getDbPublishedPosts, mergeStaticAndDbPosts, normalizeDbPost, normalizeStaticPost, parsePostDate } from '@/lib/posts';

export async function GET(context) {
    const blog = await getCollection('blog', ({ data }) => !data.draft);
    const staticPosts = blog.map(normalizeStaticPost);

    // Fetch D1 published posts
    let dbPosts = [];
    try {
        const db = context.locals.runtime.env.BLOG_DB;
        const dbRows = await getDbPublishedPosts(db, { limit: 200 });
        dbPosts = dbRows.map(normalizeDbPost);
    } catch (e) {
        console.error('RSS: Failed to fetch D1 posts:', e);
    }

    // Merge and deduplicate
    const allPosts = mergeStaticAndDbPosts(staticPosts, dbPosts);

    return rss({
        title: 'ErpanOmer Blog',
        description: '资深 Web 前端工程师，专注于 Shopify 独立站开发与 Cloudflare 边缘计算。',
        site: context.site,
        items: allPosts.map((post) => ({
            title: post.title,
            pubDate: parsePostDate(post.pubDate) || new Date(),
            description: post.description,
            link: `/blog/${post.slug}/`,
        })),
        customData: `<language>zh-cn</language>`,
    });
}
