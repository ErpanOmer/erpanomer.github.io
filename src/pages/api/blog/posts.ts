import type { APIRoute } from 'astro';
import { getCatalog, catalogCacheContext } from '@/lib/blog-catalog';
import { CatalogInputError, parseCatalogOptions } from '@/lib/public-posts';

export const GET: APIRoute = async ({ url, locals }) => {
    try {
        const options = parseCatalogOptions(url.searchParams);
        const page = await getCatalog(locals.runtime?.env?.BLOG_DB, options, undefined, catalogCacheContext(url));
        return Response.json(page, { headers: {
            'Cache-Control': page.source === 'combined' ? 'public, max-age=0, s-maxage=60' : 'no-store',
            'X-Content-Type-Options': 'nosniff',
        } });
    } catch (error) {
        const invalid = error instanceof CatalogInputError;
        if (!invalid) console.error('Public catalog query failed:', error);
        return Response.json({ message: invalid ? error.message : '文章暂时加载失败，请稍后重试。' }, {
            status: invalid ? 400 : 503, headers: { 'Cache-Control': 'no-store' },
        });
    }
};
