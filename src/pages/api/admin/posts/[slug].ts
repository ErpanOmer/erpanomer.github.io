import type { APIRoute } from 'astro';
import { requireAdmin } from '@/lib/admin-auth';
import { getDbPostBySlug, updateAdminPost, softDeleteAdminPost, normalizeDbPost } from '@/lib/posts';

/**
 * GET /api/admin/posts/[slug] — Get single post detail
 */
export const GET: APIRoute = async ({ request, locals, params, url }) => {
    const env = locals.runtime.env;

    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const db = env.BLOG_DB;
        const slug = params.slug;

        if (!slug) {
            return new Response(
                JSON.stringify({ success: false, message: 'slug is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const row = await getDbPostBySlug(db, slug, true);
        if (!row) {
            return new Response(
                JSON.stringify({ success: false, message: 'Post not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const post = normalizeDbPost(row);
        const origin = url.origin;

        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    slug: post.slug,
                    title: post.title,
                    description: post.description,
                    markdownContent: post.content || '',
                    htmlContent: post.htmlContent || '',
                    pubDate: post.pubDate,
                    lastModified: post.lastModified,
                    author: post.author,
                    draft: post.draft,
                    tags: post.tags,
                    cover: post.cover,
                    views: post.views,
                    likes: post.likes,
                    sourceArticleId: post.sourceArticleId,
                    canonicalUrl: post.canonicalUrl,
                    url: `${origin}/blog/${post.slug}`,
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        console.error('GET /api/admin/posts/[slug] error:', err);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

/**
 * PUT /api/admin/posts/[slug] — Update a post
 */
export const PUT: APIRoute = async ({ request, locals, params, url }) => {
    const env = locals.runtime.env;

    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const db = env.BLOG_DB;
        const slug = params.slug;

        if (!slug) {
            return new Response(
                JSON.stringify({ success: false, message: 'slug is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const body = await request.json();

        // Disallow slug modification for simplicity
        if (body.slug && body.slug !== slug) {
            return new Response(
                JSON.stringify({ success: false, message: 'Slug modification is not supported. Create a new post instead.' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const origin = url.origin;

        const post = await updateAdminPost(db, slug, body, origin);

        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    slug: post.slug,
                    url: `${origin}/blog/${post.slug}`,
                },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        if (err.message === 'Post not found') {
            return new Response(
                JSON.stringify({ success: false, message: 'Post not found' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }
        console.error('PUT /api/admin/posts/[slug] error:', err);
        return new Response(
            JSON.stringify({ success: false, message: err.message || 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};

/**
 * DELETE /api/admin/posts/[slug] — Soft delete a post
 */
export const DELETE: APIRoute = async ({ request, locals, params }) => {
    const env = locals.runtime.env;

    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    try {
        const db = env.BLOG_DB;
        const slug = params.slug;

        if (!slug) {
            return new Response(
                JSON.stringify({ success: false, message: 'slug is required' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        await softDeleteAdminPost(db, slug);

        return new Response(
            JSON.stringify({ success: true, message: 'Post deleted' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        console.error('DELETE /api/admin/posts/[slug] error:', err);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
