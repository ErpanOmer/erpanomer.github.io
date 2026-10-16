import { getCollection } from 'astro:content';
import type { PostSummary, CatalogOptions } from './public-posts';
import { queryPublicPosts } from './public-posts';
import type { D1Database } from '@cloudflare/workers-types';

export async function getStaticSummaries(): Promise<PostSummary[]> {
    const entries = await getCollection('blog', ({ data }) => !data.draft);
    return entries.map(({ slug, data }) => ({
        slug, title: data.title, description: data.description,
        pubDate: data.pubDate.toISOString(), lastModified: data.lastModified?.toISOString() || null,
        author: data.author, cover: data.cover || null, tags: data.tags, views: null, likes: null,
    }));
}

export async function getCatalog(db: D1Database | undefined, options: CatalogOptions, limit?: number) {
    return queryPublicPosts(db, await getStaticSummaries(), options, { allowMissingTable: import.meta.env.DEV, limit });
}
