import type { D1Database } from '@cloudflare/workers-types';

export const POST_PAGE_SIZE = 12;
export type PostSort = 'latest' | 'views' | 'likes';
export interface PostSummary {
    slug: string;
    title: string;
    description: string;
    pubDate: string;
    lastModified: string | null;
    author: string;
    cover: string | null;
    tags: string[];
    views: number | null;
    likes: number | null;
}
export interface CatalogMeta {
    total: number;
    matchingTotal: number;
    views: number | null;
    likes: number | null;
    tagCount: number;
    tags: Array<{ name: string; count: number }>;
}
export interface CatalogOptions {
    q: string;
    tag: string;
    sort: PostSort;
    cursor?: string;
    includeMeta: boolean;
}
export interface CatalogPage {
    items: PostSummary[];
    nextCursor: string | null;
    hasMore: boolean;
    source: 'combined' | 'static';
    meta?: CatalogMeta;
}
export class CatalogInputError extends Error {}
interface Cursor {
    v: 1;
    q: string;
    tag: string;
    sort: PostSort;
    source: CatalogPage['source'];
    value: number;
    date: number;
    slug: string;
}

export function parseCatalogOptions(params: URLSearchParams): CatalogOptions {
    const q = (params.get('q') || '').trim();
    const tag = (params.get('tag') || '').trim();
    const sort = params.get('sort') || 'latest';
    const cursor = params.get('cursor') || undefined;
    const include = params.get('includeMeta');
    if (q.length > 100 || tag.length > 100 || (cursor?.length || 0) > 4096 ||
        !['latest', 'views', 'likes'].includes(sort) ||
        (include !== null && !['0', '1'].includes(include))) {
        throw new CatalogInputError('查询参数无效，请缩短关键词或重新选择排序。');
    }
    const options = { q, tag, sort: sort as PostSort, cursor, includeMeta: include === '1' };
    if (cursor) decodeCursor(options);
    return options;
}

function decodeCursor(options: CatalogOptions): Cursor | undefined {
    if (!options.cursor) return;
    try {
        const bytes = Uint8Array.from(atob(options.cursor.replace(/-/g, '+').replace(/_/g, '/')),char=>char.charCodeAt(0));
        const value = JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
        if (value.v !== 1 || value.q !== options.q || value.tag !== options.tag || value.sort !== options.sort ||
            !['combined', 'static'].includes(value.source) || !Number.isFinite(value.value) ||
            !Number.isFinite(value.date) || typeof value.slug !== 'string' || !value.slug || value.slug.length > 500) {
            throw new Error('Invalid cursor');
        }
        return value;
    } catch {
        throw new CatalogInputError('分页位置已失效，请重新加载文章列表。');
    }
}

function encodeCursor(post: PostSummary, options: CatalogOptions, source: CatalogPage['source']): string {
    const date = Date.parse(post.pubDate);
    const cursor: Cursor = {
        v: 1, q: options.q, tag: options.tag, sort: options.sort, source,
        value: options.sort === 'latest' ? date : Number(post[options.sort] || 0), date, slug: post.slug,
    };
    const bytes = new TextEncoder().encode(JSON.stringify(cursor));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function cleanTags(value: unknown): string[] {
    let tags = value;
    if (typeof tags === 'string') {
        try { tags = JSON.parse(tags); } catch { tags = []; }
    }
    return Array.isArray(tags) ? [...new Set(tags.filter((tag): tag is string => typeof tag === 'string').map(tag => tag.trim()).filter(Boolean))] : [];
}

// Both remote D1 and local Miniflare use SQLite JSON functions. Only summaries enter this CTE.
// A single JSON binding also avoids a placeholder for every static article field.
function timestamp(column: string, fallback = '0'): string {
    return `CASE WHEN ${column} IS NULL THEN ${fallback}
        WHEN typeof(${column}) IN ('integer','real') OR (trim(${column}) <> '' AND trim(${column}) NOT GLOB '*[^0-9]*')
        THEN CASE WHEN CAST(${column} AS REAL) < 1000000000000 THEN CAST(${column} AS INTEGER)*1000 ELSE CAST(${column} AS INTEGER) END
        ELSE COALESCE(CAST(ROUND((julianday(${column})-2440587.5)*86400000) AS INTEGER), ${fallback}) END`;
}

const validDbTitle = "NULLIF(trim(p.title), '') IS NOT NULL";
const tagsSql = (fallback: string) => `CASE WHEN json_valid(p.tags) THEN CASE WHEN json_type(p.tags)='array' AND json_array_length(p.tags)>0 THEN p.tags ELSE ${fallback} END ELSE ${fallback} END`;
const CATALOG_CTE = `WITH static_posts AS (
    SELECT json_extract(value,'$.slug') slug, json_extract(value,'$.title') title,
        json_extract(value,'$.description') description, json_extract(value,'$.date') date_ms,
        json_extract(value,'$.modified') modified_ms, json_extract(value,'$.author') author,
        json_extract(value,'$.cover') cover, json_extract(value,'$.tags') tags
    FROM json_each(?1)
), effective AS (
    SELECT s.slug,
        CASE WHEN ${validDbTitle} THEN p.title ELSE s.title END title,
        CASE WHEN ${validDbTitle} THEN COALESCE(NULLIF(p.description,''),s.description) ELSE s.description END description,
        CASE WHEN ${validDbTitle} THEN ${timestamp('p.pub_date', 's.date_ms')} ELSE s.date_ms END date_ms,
        CASE WHEN ${validDbTitle} THEN ${timestamp('p.last_modified', 's.modified_ms')} ELSE s.modified_ms END modified_ms,
        CASE WHEN ${validDbTitle} THEN COALESCE(NULLIF(p.author,''),s.author) ELSE s.author END author,
        CASE WHEN ${validDbTitle} THEN COALESCE(NULLIF(p.cover,''),s.cover) ELSE s.cover END cover,
        CASE WHEN ${validDbTitle} THEN ${tagsSql('s.tags')} ELSE s.tags END tags,
        MAX(COALESCE(p.views,0),0) views, MAX(COALESCE(p.likes,0),0) likes
    FROM static_posts s LEFT JOIN posts p ON p.slug=s.slug
    WHERE p.deleted_at IS NULL AND (NOT (${validDbTitle}) OR COALESCE(p.draft,1)=0)
    UNION ALL
    SELECT p.slug, p.title, COALESCE(p.description,''), ${timestamp('p.pub_date')},
        ${timestamp('p.last_modified', timestamp('p.pub_date'))}, COALESCE(p.author,'ErpanOmer'), NULLIF(p.cover,''),
        ${tagsSql("'[]'")}, MAX(COALESCE(p.views,0),0), MAX(COALESCE(p.likes,0),0)
    FROM posts p WHERE p.draft=0 AND p.deleted_at IS NULL AND ${validDbTitle}
        AND NOT EXISTS (SELECT 1 FROM static_posts s WHERE s.slug=p.slug)
), filtered AS (
    SELECT * FROM effective e
    WHERE (?2='' OR instr(lower(e.title || ' ' || e.description), lower(?2))>0
        OR EXISTS (SELECT 1 FROM json_each(e.tags) t WHERE t.type='text' AND instr(lower(t.value),lower(?2))>0))
        AND (?3='' OR EXISTS (SELECT 1 FROM json_each(e.tags) t WHERE t.type='text' AND trim(t.value)=?3))
)`;

function staticJson(posts: PostSummary[]): string {
    return JSON.stringify(posts.map(post => ({
        slug: post.slug, title: post.title, description: post.description,
        date: Date.parse(post.pubDate) || 0, modified: Date.parse(post.lastModified || post.pubDate) || 0,
        author: post.author, cover: post.cover, tags: JSON.stringify(cleanTags(post.tags)),
    })));
}

export async function queryPublicPosts(
    db: D1Database | undefined,
    staticPosts: PostSummary[],
    options: CatalogOptions,
    config: { allowMissingTable?: boolean; limit?: number } = {},
): Promise<CatalogPage> {
    const cursor = decodeCursor(options);
    const limit = config.limit ?? POST_PAGE_SIZE;
    if (!db) return staticPage(staticPosts, options, limit, cursor);
    const key = options.sort === 'latest' ? 'date_ms' : options.sort;
    const after = cursor ? `WHERE (${key} < ?4 OR (${key} = ?4 AND date_ms < ?5) OR (${key} = ?4 AND date_ms = ?5 AND slug < ?6))` : '';
    const order = `${key} DESC, date_ms DESC, slug COLLATE BINARY DESC`;
    const bindings = [staticJson(staticPosts), options.q, options.tag];
    const pageSql = `${CATALOG_CTE} SELECT slug,title,description,date_ms,modified_ms,author,cover,tags,views,likes FROM filtered ${after} ORDER BY ${order} LIMIT ?${cursor ? 7 : 4}`;
    const pageStatement = db.prepare(pageSql).bind(...bindings, ...(cursor ? [cursor.value, cursor.date, cursor.slug] : []), limit + 1);
    const statements = [pageStatement];
    if (options.includeMeta) {
        statements.push(db.prepare(`${CATALOG_CTE}
            SELECT COUNT(*) total, COALESCE(SUM(views),0) views, COALESCE(SUM(likes),0) likes,
                (SELECT COUNT(*) FROM filtered) matchingTotal FROM effective`).bind(...bindings));
        statements.push(db.prepare(`${CATALOG_CTE}
            SELECT name,COUNT(*) count FROM (
                SELECT DISTINCT e.slug,trim(t.value) name FROM effective e,json_each(e.tags) t
                WHERE t.type='text' AND trim(t.value)<>''
            ) GROUP BY name ORDER BY count DESC,name COLLATE BINARY ASC`).bind(...bindings));
    }
    let results;
    try {
        results = await db.batch(statements);
    } catch (error) {
        if (config.allowMissingTable && /no such table:\s*posts\b/i.test(String(error)) && cursor?.source !== 'combined') {
            return staticPage(staticPosts, options, limit, cursor);
        }
        throw error;
    }
    if (cursor?.source === 'static') throw new CatalogInputError('数据源已恢复，请重新加载文章列表。');
    const rows = results[0].results as Record<string, any>[];
    const items: PostSummary[] = rows.slice(0, limit).map(row => ({
        slug: row.slug, title: row.title, description: row.description,
        pubDate: new Date(row.date_ms).toISOString(), lastModified: row.modified_ms ? new Date(row.modified_ms).toISOString() : null,
        author: row.author, cover: row.cover, tags: cleanTags(row.tags), views: row.views, likes: row.likes,
    }));
    const hasMore = rows.length > limit;
    const page: CatalogPage = { items, hasMore, nextCursor: hasMore ? encodeCursor(items[items.length - 1], options, 'combined') : null, source: 'combined' };
    if (options.includeMeta) {
        const totals = results[1].results[0] as unknown as Omit<CatalogMeta, 'tags' | 'tagCount'>;
        const tags = results[2].results as unknown as CatalogMeta['tags'];
        page.meta = { ...totals, tagCount: tags.length, tags };
    }
    return page;
}

function staticPage(posts: PostSummary[], options: CatalogOptions, limit: number, cursor?: Cursor): CatalogPage {
    if (cursor?.source === 'combined') throw new Error('Database is unavailable; cannot continue the current catalog.');
    const all = posts.map(post => ({ ...post, tags: cleanTags(post.tags), views: null, likes: null }));
    const needle = options.q.toLowerCase();
    const filtered = all.filter(post => (!options.tag || post.tags.includes(options.tag)) &&
        (!needle || `${post.title} ${post.description}`.toLowerCase().includes(needle) || post.tags.some(tag=>tag.toLowerCase().includes(needle))))
        .sort((a,b) => Date.parse(b.pubDate)-Date.parse(a.pubDate) || (a.slug < b.slug ? 1 : a.slug > b.slug ? -1 : 0));
    const remaining = cursor ? filtered.filter(post => Date.parse(post.pubDate) < cursor.date ||
        (Date.parse(post.pubDate) === cursor.date && post.slug < cursor.slug)) : filtered;
    const items = remaining.slice(0,limit);
    const hasMore = remaining.length > limit;
    const page: CatalogPage = { items, hasMore, nextCursor: hasMore ? encodeCursor(items[items.length-1], options, 'static') : null, source: 'static' };
    if (options.includeMeta) {
        const tags = new Map<string,number>();
        all.forEach(post => post.tags.forEach(tag => tags.set(tag,(tags.get(tag)||0)+1)));
        page.meta = { total: all.length, matchingTotal: filtered.length, views: null, likes: null, tagCount: tags.size,
            tags: [...tags].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count || (a.name < b.name ? -1 : 1)) };
    }
    return page;
}
