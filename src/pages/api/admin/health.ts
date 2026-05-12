import type { APIRoute } from 'astro';
import { requireAdmin } from '@/lib/admin-auth';

export const GET: APIRoute = async ({ request, locals }) => {
    const env = locals.runtime.env;

    const authError = await requireAdmin(request, env);
    if (authError) return authError;

    const url = new URL(request.url);
    const site = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
        ? `${url.protocol}//${url.host}`
        : 'https://erpanomer.nurverse.com';

    return new Response(
        JSON.stringify({
            success: true,
            data: {
                site,
                database: 'BLOG_DB',
                author: 'ErpanOmer',
            },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
};
