import type { APIRoute } from 'astro';
import { requireAdmin } from '@/lib/admin-auth';
import { publishAdminPost } from '@/lib/posts';

/**
 * POST /api/admin/posts/[slug]/publish — Publish a draft post
 */
export const POST: APIRoute = async ({ request, locals, params, url }) => {
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

        const origin = url.origin;
        const post = await publishAdminPost(db, slug);

        return new Response(
            JSON.stringify({
                success: true,
                data: {
                    slug: post.slug,
                    draft: post.draft,
                    publishedUrl: `${origin}/blog/${post.slug}`,
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
        console.error('POST /api/admin/posts/[slug]/publish error:', err);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
};
