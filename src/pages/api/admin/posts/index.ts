import type { APIRoute } from 'astro';
import { requireAdmin } from '@/lib/admin-auth';
import { getAdminPosts, upsertAdminPost, normalizeDbPost } from '@/lib/posts';

/**
 * GET /api/admin/posts — Admin post list
 */
export const GET: APIRoute = async ({ request, locals, url }) => {
    const env = locals.runtime.env;

    const authError = requireAdmin(request, env);
    if (authError) return authError;

    try {
        const db = env.BLOG_DB;

        const status = (url.searchParams.get('status') || 'all') as 'all' | 'draft' | 'published';
        const limit = parseInt(url.searchParams.get('limit') || '20', 10);
        const cursor = parseInt(url.searchParams.get('cursor') || '0', 10);
        const q = url.searchParams.get('q') || undefined;
        const tag = url.searchParams.get('tag') || undefined;
        const includeDeleted = url.searchParams.get('includeDeleted') === 'true';

        const { items, nextCursor, hasMore } = await getAdminPosts(db, {
            status, limit, cursor, q, tag, includeDeleted,
        });

        const origin = url.origin;

        const normalizedItems = items.map((row) => {
            const post = normalizeDbPost(row);
            return {
                slug: post.slug,
                title: post.title,
                description: post.description,
                author: post.author,
                cover: post.cover,
                tags: post.tags,
                draft: post.draft,
                pubDate: post.pubDate,
                lastModified: post.lastModified,
                views: post.views,
                likes: post.likes,
                url: `${origin}/blog/${post.slug}`,
            };
        });

        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    items: normalizedItems,
                    nextCursor,
                    hasMore,
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        console.error('GET /api/admin/posts error:', err);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

/**
 * POST /api/admin/posts — Create or upsert post
 */
export const POST: APIRoute = async ({ request, locals, url }) => {
    const env = locals.runtime.env;

    const authError = requireAdmin(request, env);
    if (authError) return authError;

    try {
        const db = env.BLOG_DB;
        const body = await request.json();

        if (!body.title) {
            return new Response(
                JSON.stringify({ success: false, message: 'title is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const origin = url.origin;
        const post = await upsertAdminPost(db, body, origin);

        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    slug: post.slug,
                    draft: post.draft,
                    url: `${origin}/blog/${post.slug}`,
                    publishedUrl: post.draft ? null : `${origin}/blog/${post.slug}`,
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        console.error('POST /api/admin/posts error:', err);
        return new Response(
            JSON.stringify({ success: false, message: err.message || 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
