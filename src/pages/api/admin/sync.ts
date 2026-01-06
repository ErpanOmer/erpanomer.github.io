import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { syncPost } from '@/lib/db';

export const GET: APIRoute = async ({ locals }) => {
    try {
        const posts = await getCollection('blog');
        const db = locals.runtime.env.BLOG_DB;

        let count = 0;
        for (const post of posts) {
            await syncPost(db, {
                slug: post.slug,
                title: post.data.title,
                description: post.data.description,
                pubDate: post.data.pubDate,
                lastModified: post.data.lastModified,
                author: post.data.author,
                cover: post.data.cover,
                tags: post.data.tags,
                draft: post.data.draft
            });
            count++;
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Synced ${count} posts`,
            syncedParams: posts.map(p => p.slug)
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Sync failed:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }), { status: 500 });
    }
}
