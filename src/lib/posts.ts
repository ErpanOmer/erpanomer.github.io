/**
 * Unified post data layer.
 * Handles merging static Markdown (Astro Content Collection) and D1 database posts.
 */
import type { D1Database } from "@cloudflare/workers-types";

// ---------- Types ----------

/** Raw D1 row shape */
export interface DBPostRow {
    slug: string;
    id: string | null;
    title: string;
    description: string | null;
    content: string | null;
    html_content: string | null;
    pub_date: number | null;
    last_modified: number | null;
    author: string | null;
    cover: string | null;
    tags: string; // JSON string
    draft: number; // 0 or 1
    views: number;
    likes: number;
    source_article_id: string | null;
    canonical_url: string | null;
    created_at: number | null;
    updated_at: number | null;
    published_at: number | null;
    deleted_at: number | null;
}

export type PostDateInput = string | number | Date | null | undefined;

/** Normalized post returned to callers / API responses */
export interface NormalizedPost {
    slug: string;
    title: string;
    description: string;
    content?: string;
    htmlContent?: string;
    pubDate: string; // YYYY-MM-DD
    lastModified: string | null; // ISO string
    author: string;
    cover: string | null;
    tags: string[];
    draft: boolean;
    views: number;
    likes: number;
    sourceArticleId?: string | null;
    canonicalUrl?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    publishedAt?: string | null;
    deletedAt?: string | null;
    /** Where the post originates: 'static', 'db', or 'merged' */
    source?: string;
}

// ---------- Helpers ----------

export function parsePostDate(value: PostDateInput): Date | null {
    if (value === null || value === undefined || value === '') return null;

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    const rawValue = typeof value === 'string' ? value.trim() : value;
    if (rawValue === '') return null;

    let date: Date;
    if (typeof rawValue === 'number' || /^\d+$/.test(rawValue)) {
        const numericValue = Number(rawValue);
        const timestamp = numericValue < 1_000_000_000_000 ? numericValue * 1000 : numericValue;
        date = new Date(timestamp);
    } else {
        date = new Date(rawValue);
    }

    return Number.isNaN(date.getTime()) ? null : date;
}

export function toPostDateTime(value: PostDateInput, fallback?: PostDateInput): string | undefined {
    const date = parsePostDate(value) || parsePostDate(fallback);
    return date?.toISOString();
}

export function formatPostDate(
    value: PostDateInput,
    locale: string = 'zh-CN',
    options?: Intl.DateTimeFormatOptions,
    fallback?: string,
): string {
    const date = parsePostDate(value);
    if (!date) return fallback ?? '';
    return date.toLocaleDateString(locale, options);
}

function toISOOrNull(ts: PostDateInput): string | null {
    return toPostDateTime(ts) ?? null;
}

function toDateString(ts: PostDateInput): string {
    return (toPostDateTime(ts) || new Date().toISOString()).split('T')[0];
}

function parseJsonTags(raw: string | null | undefined): string[] {
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/**
 * Simple slugify: lowercase, replace spaces/special chars with hyphens,
 * collapse multiple hyphens, trim hyphens from edges.
 * For non-latin characters (e.g. Chinese), fall back to post-{timestamp}.
 */
export function slugify(text: string): string {
    let slug = text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // remove non-word chars except spaces and hyphens
        .replace(/[\s_]+/g, '-')  // spaces/underscores → hyphens
        .replace(/-+/g, '-')     // collapse multiple hyphens
        .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens

    // If slug is empty (e.g. all Chinese characters were stripped), use timestamp
    if (!slug) {
        slug = `post-${Date.now()}`;
    }
    return slug;
}

// ---------- Normalize ----------

export function normalizeDbPost(row: DBPostRow): NormalizedPost {
    return {
        slug: row.slug,
        title: row.title || '',
        description: row.description || '',
        content: row.content || undefined,
        htmlContent: row.html_content || undefined,
        pubDate: toDateString(row.pub_date),
        lastModified: toISOOrNull(row.last_modified),
        author: row.author || 'ErpanOmer',
        cover: row.cover || null,
        tags: parseJsonTags(row.tags),
        draft: row.draft === 1,
        views: row.views || 0,
        likes: row.likes || 0,
        sourceArticleId: row.source_article_id,
        canonicalUrl: row.canonical_url,
        createdAt: toISOOrNull(row.created_at),
        updatedAt: toISOOrNull(row.updated_at),
        publishedAt: toISOOrNull(row.published_at),
        deletedAt: toISOOrNull(row.deleted_at),
        source: 'db',
    };
}

export function normalizeStaticPost(entry: {
    slug: string;
    data: {
        title: string;
        description: string;
        pubDate: Date;
        lastModified?: Date;
        author: string;
        cover?: string;
        tags: string[];
        draft: boolean;
    };
}): NormalizedPost {
    return {
        slug: entry.slug,
        title: entry.data.title,
        description: entry.data.description,
        pubDate: entry.data.pubDate.toISOString().split('T')[0],
        lastModified: entry.data.lastModified ? entry.data.lastModified.toISOString() : entry.data.pubDate.toISOString(),
        author: entry.data.author || 'ErpanOmer',
        cover: entry.data.cover || null,
        tags: entry.data.tags || [],
        draft: entry.data.draft ?? false,
        views: 0,
        likes: 0,
        source: 'static',
    };
}

/**
 * Merge static Markdown posts with D1 posts.
 * - If same slug exists in both, merge: D1 metadata wins, static content wins.
 * - D1-only posts are included (source='db').
 * - Static-only posts are included (source='static').
 * - Deleted posts (deleted_at not null) are excluded.
 * - Sorted by pubDate descending.
 */
export function mergeStaticAndDbPosts(
    staticPosts: NormalizedPost[],
    dbPosts: NormalizedPost[],
): NormalizedPost[] {
    const dbMap = new Map<string, NormalizedPost>();
    for (const p of dbPosts) {
        // Skip deleted posts
        if (p.deletedAt) continue;
        dbMap.set(p.slug, p);
    }

    const merged = new Map<string, NormalizedPost>();

    // Process static posts first
    for (const sp of staticPosts) {
        const dp = dbMap.get(sp.slug);
        if (dp) {
            // Merge: D1 metadata wins, but keep static source info
            merged.set(sp.slug, {
                ...sp,
                // D1 metadata overrides
                title: dp.title || sp.title,
                description: dp.description || sp.description,
                pubDate: dp.pubDate || sp.pubDate,
                lastModified: dp.lastModified || sp.lastModified,
                author: dp.author || sp.author,
                cover: dp.cover || sp.cover,
                tags: dp.tags.length > 0 ? dp.tags : sp.tags,
                draft: dp.draft,
                views: dp.views,
                likes: dp.likes,
                source: 'merged',
            });
            dbMap.delete(sp.slug);
        } else {
            merged.set(sp.slug, sp);
        }
    }

    // Add D1-only posts
    for (const [slug, dp] of dbMap) {
        // Only include published, non-deleted D1-only posts
        if (!dp.draft && !dp.deletedAt) {
            merged.set(slug, dp);
        }
    }

    // Sort by pubDate descending
    const result = Array.from(merged.values());
    result.sort((a, b) => {
        const da = new Date(a.pubDate).getTime();
        const db = new Date(b.pubDate).getTime();
        return db - da;
    });

    return result;
}

// ---------- DB Query Functions ----------

export async function getDbPostBySlug(
    db: D1Database,
    slug: string,
    includeDraft = false,
): Promise<DBPostRow | null> {
    let sql = 'SELECT * FROM posts WHERE slug = ? AND deleted_at IS NULL';
    if (!includeDraft) {
        sql += ' AND draft = 0';
    }
    return db.prepare(sql).bind(slug).first<DBPostRow>();
}

export async function getDbPublishedPosts(
    db: D1Database,
    options?: { limit?: number; offset?: number },
): Promise<DBPostRow[]> {
    const limit = options?.limit ?? 100;
    const offset = options?.offset ?? 0;
    const { results } = await db.prepare(
        'SELECT * FROM posts WHERE draft = 0 AND deleted_at IS NULL ORDER BY pub_date DESC LIMIT ? OFFSET ?'
    ).bind(limit, offset).all<DBPostRow>();
    return results;
}

interface AdminPostsOptions {
    status?: 'all' | 'draft' | 'published';
    limit?: number;
    cursor?: number;
    q?: string;
    tag?: string;
    includeDeleted?: boolean;
}

export async function getAdminPosts(
    db: D1Database,
    options?: AdminPostsOptions,
): Promise<{ items: DBPostRow[]; nextCursor: number; hasMore: boolean }> {
    const status = options?.status ?? 'all';
    const limit = options?.limit ?? 20;
    const cursor = options?.cursor ?? 0;
    const q = options?.q;
    const tag = options?.tag;
    const includeDeleted = options?.includeDeleted ?? false;

    const conditions: string[] = [];
    const binds: any[] = [];

    if (!includeDeleted) {
        conditions.push('deleted_at IS NULL');
    }

    if (status === 'draft') {
        conditions.push('draft = 1');
    } else if (status === 'published') {
        conditions.push('draft = 0');
    }

    if (q) {
        conditions.push('(title LIKE ? OR description LIKE ?)');
        binds.push(`%${q}%`, `%${q}%`);
    }

    if (tag) {
        conditions.push('tags LIKE ?');
        binds.push(`%"${tag}"%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    binds.push(limit + 1, cursor);

    const sql = `SELECT * FROM posts ${where} ORDER BY COALESCE(pub_date, created_at) DESC LIMIT ? OFFSET ?`;
    const { results } = await db.prepare(sql).bind(...binds).all<DBPostRow>();

    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;
    const nextCursor = hasMore ? cursor + limit : cursor + items.length;

    return { items, nextCursor, hasMore };
}

// ---------- DB Mutation Functions ----------

interface UpsertPayload {
    sourceArticleId?: string;
    slug?: string;
    title: string;
    description?: string;
    markdownContent?: string;
    content?: string;
    htmlContent?: string;
    html_content?: string;
    pubDate?: string;
    pub_date?: string;
    lastModified?: string;
    last_modified?: string;
    author?: string;
    draft?: boolean;
    tags?: string[];
    cover?: string;
}

export async function upsertAdminPost(
    db: D1Database,
    payload: UpsertPayload,
    baseUrl: string = 'https://erpanomer.nurverse.com',
): Promise<NormalizedPost> {
    const now = Date.now();

    // Resolve aliased fields
    const markdownContent = payload.markdownContent || payload.content || '';
    const htmlContent = payload.htmlContent || payload.html_content || '';
    const pubDateStr = payload.pubDate || payload.pub_date;
    const lastModifiedStr = payload.lastModified || payload.last_modified;

    const pubDate = parsePostDate(pubDateStr)?.getTime() ?? now;
    const lastModified = parsePostDate(lastModifiedStr)?.getTime() ?? now;
    const draft = payload.draft === undefined ? true : payload.draft;
    const tags = JSON.stringify(payload.tags || []);
    const author = payload.author || 'ErpanOmer';
    const description = payload.description || '';
    const cover = payload.cover || '';

    let slug = payload.slug;

    // Check if sourceArticleId already exists → update that row
    if (payload.sourceArticleId) {
        const existing = await db.prepare(
            'SELECT slug FROM posts WHERE source_article_id = ? AND deleted_at IS NULL'
        ).bind(payload.sourceArticleId).first<{ slug: string }>();

        if (existing) {
            // Update existing post by source_article_id
            slug = existing.slug;
            return updateAdminPost(db, slug, payload, baseUrl);
        }
    }

    // Check if slug already exists → update
    if (slug) {
        const existing = await db.prepare(
            'SELECT slug FROM posts WHERE slug = ?'
        ).bind(slug).first<{ slug: string }>();

        if (existing) {
            return updateAdminPost(db, slug, payload, baseUrl);
        }
    }

    // Generate slug if not provided
    if (!slug) {
        slug = slugify(payload.title);
    }

    // Ensure slug uniqueness
    const slugExists = await db.prepare(
        'SELECT slug FROM posts WHERE slug = ?'
    ).bind(slug).first();
    if (slugExists) {
        slug = `${slug}-${Date.now()}`;
    }

    const canonicalUrl = `${baseUrl}/blog/${slug}`;
    const publishedAt = (!draft) ? now : null;

    await db.prepare(`
        INSERT INTO posts (slug, id, title, description, content, html_content, pub_date, last_modified, author, cover, tags, draft, views, likes, source_article_id, canonical_url, created_at, updated_at, published_at, deleted_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, NULL)
    `).bind(
        slug,
        `post-${now}`,
        payload.title,
        description,
        markdownContent,
        htmlContent,
        pubDate,
        lastModified,
        author,
        cover,
        tags,
        draft ? 1 : 0,
        payload.sourceArticleId || null,
        canonicalUrl,
        now,
        now,
        publishedAt,
    ).run();

    const row = await db.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first<DBPostRow>();
    return normalizeDbPost(row!);
}

export async function updateAdminPost(
    db: D1Database,
    slug: string,
    payload: Partial<UpsertPayload>,
    baseUrl: string = 'https://erpanomer.nurverse.com',
): Promise<NormalizedPost> {
    const now = Date.now();

    // Get existing post
    const existing = await db.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first<DBPostRow>();
    if (!existing) {
        throw new Error('Post not found');
    }

    const markdownContent = payload.markdownContent || payload.content;
    const htmlContent = payload.htmlContent || payload.html_content;
    const pubDateStr = payload.pubDate || payload.pub_date;
    const lastModifiedStr = payload.lastModified || payload.last_modified;

    const title = payload.title ?? existing.title;
    const description = payload.description ?? existing.description;
    const content = markdownContent !== undefined ? markdownContent : existing.content;
    const html = htmlContent !== undefined ? htmlContent : existing.html_content;
    const pubDate = parsePostDate(pubDateStr)?.getTime() ?? existing.pub_date ?? now;
    const lastModified = parsePostDate(lastModifiedStr)?.getTime() ?? now;
    const author = payload.author ?? existing.author;
    const cover = payload.cover !== undefined ? payload.cover : existing.cover;
    const tags = payload.tags ? JSON.stringify(payload.tags) : existing.tags;
    const draft = payload.draft !== undefined ? (payload.draft ? 1 : 0) : existing.draft;
    const sourceArticleId = payload.sourceArticleId ?? existing.source_article_id;
    const canonicalUrl = existing.canonical_url || `${baseUrl}/blog/${slug}`;

    // If publishing (draft → published) and no published_at yet, set it
    let publishedAt = existing.published_at;
    if (draft === 0 && !publishedAt) {
        publishedAt = now;
    }

    await db.prepare(`
        UPDATE posts SET
            title = ?, description = ?, content = ?, html_content = ?,
            pub_date = ?, last_modified = ?, author = ?, cover = ?,
            tags = ?, draft = ?, source_article_id = ?, canonical_url = ?,
            updated_at = ?, published_at = ?
        WHERE slug = ?
    `).bind(
        title, description, content, html,
        pubDate, lastModified, author, cover,
        tags, draft, sourceArticleId, canonicalUrl,
        now, publishedAt,
        slug,
    ).run();

    const row = await db.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first<DBPostRow>();
    return normalizeDbPost(row!);
}

export async function softDeleteAdminPost(db: D1Database, slug: string): Promise<void> {
    const now = Date.now();
    await db.prepare(
        'UPDATE posts SET deleted_at = ?, updated_at = ? WHERE slug = ?'
    ).bind(now, now, slug).run();
}

export async function publishAdminPost(db: D1Database, slug: string): Promise<NormalizedPost> {
    const now = Date.now();
    const existing = await db.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first<DBPostRow>();
    if (!existing) {
        throw new Error('Post not found');
    }

    const publishedAt = existing.published_at || now;
    const pubDate = existing.pub_date || now;

    await db.prepare(`
        UPDATE posts SET draft = 0, published_at = ?, pub_date = ?, last_modified = ?, updated_at = ?
        WHERE slug = ?
    `).bind(publishedAt, pubDate, now, now, slug).run();

    const row = await db.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first<DBPostRow>();
    return normalizeDbPost(row!);
}

export async function unpublishAdminPost(db: D1Database, slug: string): Promise<NormalizedPost> {
    const now = Date.now();
    await db.prepare(`
        UPDATE posts SET draft = 1, last_modified = ?, updated_at = ?
        WHERE slug = ?
    `).bind(now, now, slug).run();

    const row = await db.prepare('SELECT * FROM posts WHERE slug = ?').bind(slug).first<DBPostRow>();
    return normalizeDbPost(row!);
}
