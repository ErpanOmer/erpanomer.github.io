import type { APIRoute } from 'astro';
import { getPost, incrementView, toggleLike } from '@/lib/db';

export const GET: APIRoute = async ({ params, request, locals }) => {
    const { slug } = params;
    if (!slug) return new Response('Missing slug', { status: 400 });

    const db = locals.runtime.env.BLOG_DB;
    // Use visitorId from middleware, fallback to 'anonymous' if completely missing (rare)
    const visitorId = locals.visitorId || 'anonymous';

    try {
        const post = await getPost(db, slug, visitorId);
        // If post is not found in DB yet (sync pending), return 0s
        // Or we could trigger a sync here? For now, just safe defaults.
        const stats = {
            views: post?.views || 0,
            likes: post?.likes || 0,
            userHasLiked: post?.userHasLiked || false
        };

        return new Response(JSON.stringify(stats), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

export const POST: APIRoute = async ({ params, request, locals }) => {
    const { slug } = params;
    if (!slug) return new Response('Missing slug', { status: 400 });

    // Anti-abuse: Check Origin
    const origin = request.headers.get('Origin');
    const allowedOrigin = new URL(request.url).origin;
    // Locally origin might be diff, or null. In prod strictly check. 
    // For simplicity we allow same-origin requests primarily.
    // if (origin && origin !== allowedOrigin) return new Response('Forbidden', { status: 403 });

    const db = locals.runtime.env.BLOG_DB;
    const visitorId = locals.visitorId || 'anonymous';

    try {
        const body = await request.json();
        const { type } = body as { type: 'view' | 'like' };

        if (type === 'view') {
            await incrementView(db, slug, visitorId);
        } else if (type === 'like') {
            await toggleLike(db, slug, visitorId);
        } else {
            return new Response('Invalid type', { status: 400 });
        }

        // Return updated stats
        const post = await getPost(db, slug, visitorId);
        const stats = {
            views: post?.views || 0,
            likes: post?.likes || 0,
            userHasLiked: post?.userHasLiked || false
        };

        return new Response(JSON.stringify(stats), {
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error updating stats:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
