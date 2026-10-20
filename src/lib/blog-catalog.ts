import { getCollection } from 'astro:content';
import type { PostSummary, CatalogOptions } from './public-posts';
import { queryPublicPosts, queryPublicPostMetadata } from './public-posts';
import { readCatalogCache, type CatalogCacheContext } from './catalog-cache';
import type { D1Database } from '@cloudflare/workers-types';

export async function getStaticSummaries(): Promise<PostSummary[]> {
    const entries = await getCollection('blog', ({ data }) => !data.draft);
    return entries.map(({ slug, data }) => ({
        slug, title: data.title, description: data.description,
        pubDate: data.pubDate.toISOString(), lastModified: data.lastModified?.toISOString() || null,
        author: data.author, cover: data.cover || null, tags: data.tags, views: null, likes: null,
    }));
}

// Cache is explicitly disabled in development: local D1 edits remain immediately visible.
export function catalogCacheContext(url: URL): CatalogCacheContext | undefined {
    if (!import.meta.env.PROD || typeof caches === 'undefined') return;
    return { origin: url.origin, open: () => caches.open('public-catalog-v2') };
}

async function readMetadata(db: D1Database | undefined, staticPosts: PostSummary[], options: CatalogOptions, cache?: CatalogCacheContext) {
    // Metadata does not depend on sort, page size, cursor, or the page requesting it.
    return readCatalogCache(db ? cache : undefined, ['metadata', staticPosts, options.q, options.tag], () =>
        queryPublicPostMetadata(db, staticPosts, options, { allowMissingTable: import.meta.env.DEV }));
}

export async function getCatalogMetadata(db: D1Database | undefined, cache?: CatalogCacheContext) {
    const result = await readMetadata(db, await getStaticSummaries(), { q:'',tag:'',sort:'latest',includeMeta:true }, cache);
    return result.meta;
}

export async function getCatalog(db: D1Database | undefined, options: CatalogOptions, limit?: number, cache?: CatalogCacheContext) {
    const staticPosts = await getStaticSummaries();
    const pageOptions = { ...options, includeMeta: false };
    const [page, metadata] = await Promise.all([
        readCatalogCache(db ? cache : undefined,
            ['page', staticPosts, options.q, options.tag, options.sort, options.cursor || '', limit ?? 12], () =>
                queryPublicPosts(db, staticPosts, pageOptions, { allowMissingTable: import.meta.env.DEV, limit })),
        options.includeMeta ? readMetadata(db, staticPosts, options, cache) : undefined,
    ]);
    if (metadata && metadata.source !== page.source) throw new Error('Catalog data source changed; please retry.');
    return metadata ? { ...page, meta: metadata.meta } : page;
}
