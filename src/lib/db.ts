import type { D1Database } from "@cloudflare/workers-types";

// Type definition for Post from DB
export interface DBPost {
    slug: string;
    title: string;
    description: string;
    pub_date: number;
    last_modified: number;
    author: string;
    cover: string;
    tags: string; // JSON string
    draft: number;
    views: number;
    likes: number;
    userHasLiked?: boolean;
}

// Helper to hash IP addresses for privacy
export async function hashIp(ip: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function getPost(db: D1Database, slug: string, ip?: string): Promise<DBPost | null> {
    const post = await db.prepare(
        "SELECT * FROM posts WHERE slug = ?"
    ).bind(slug).first<DBPost>();

    if (!post) return null;

    // Parse tags if needed (it comes as string)
    // post.tags = JSON.parse(post.tags as string);

    if (ip) {
        const ipHash = await hashIp(ip);
        const likeRecord = await db.prepare(
            "SELECT 1 FROM interactions WHERE slug = ? AND action_type = 'like' AND ip_hash = ?"
        ).bind(slug, ipHash).first();
        post.userHasLiked = !!likeRecord;
    } else {
        post.userHasLiked = false;
    }

    return post;
}

export async function incrementView(db: D1Database, slug: string, ip: string) {
    const ipHash = await hashIp(ip);
    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;

    // Check for recent view
    const recentView = await db.prepare(
        "SELECT 1 FROM interactions WHERE slug = ? AND action_type = 'view' AND ip_hash = ? AND created_at > ?"
    ).bind(slug, ipHash, fifteenMinutesAgo).first();

    if (recentView) {
        return false; // Rate limited
    }

    // Record interaction
    await db.prepare(
        "INSERT INTO interactions (slug, action_type, ip_hash, created_at) VALUES (?, 'view', ?, ?)"
    ).bind(slug, ipHash, now).run();

    // Upsert views in posts table
    await db.prepare(`
    INSERT INTO posts (slug, views, updated_at) VALUES (?, 1, ?)
    ON CONFLICT(slug) DO UPDATE SET views = views + 1, updated_at = ?
  `).bind(slug, now, now).run();

    return true;
}

export async function toggleLike(db: D1Database, slug: string, ip: string) {
    const ipHash = await hashIp(ip);
    const now = Date.now();

    const existingLike = await db.prepare(
        "SELECT 1 FROM interactions WHERE slug = ? AND action_type = 'like' AND ip_hash = ?"
    ).bind(slug, ipHash).first();

    if (existingLike) {
        return { added: false, error: 'Already liked' };
    }

    await db.prepare(
        "INSERT INTO interactions (slug, action_type, ip_hash, created_at) VALUES (?, 'like', ?, ?)"
    ).bind(slug, ipHash, now).run();

    // Upsert likes in posts table
    await db.prepare(`
    INSERT INTO posts (slug, likes, updated_at) VALUES (?, 1, ?)
    ON CONFLICT(slug) DO UPDATE SET likes = likes + 1, updated_at = ?
  `).bind(slug, now, now).run();

    return { added: true };
}

// Sync function to upsert post data from Markdown
export async function syncPost(db: D1Database, data: {
    slug: string;
    title: string;
    description: string;
    pubDate: Date;
    lastModified?: Date;
    author: string;
    cover?: string;
    tags: string[];
    draft: boolean;
}) {
    const now = Date.now();

    // Use upsert ensuring we don't overwrite views/likes if row exists is slightly complex with REPLACE
    // SQLite UPSERT syntax:
    await db.prepare(`
    INSERT INTO posts (slug, title, description, pub_date, last_modified, author, cover, tags, draft, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      description = excluded.description,
      pub_date = excluded.pub_date,
      last_modified = excluded.last_modified,
      author = excluded.author,
      cover = excluded.cover,
      tags = excluded.tags,
      draft = excluded.draft,
      updated_at = excluded.updated_at
  `).bind(
        data.slug,
        data.title,
        data.description,
        data.pubDate.getTime(),
        data.lastModified ? data.lastModified.getTime() : now,
        data.author,
        data.cover || '',
        JSON.stringify(data.tags),
        data.draft ? 1 : 0,
        now
    ).run();
}

export async function getRecentPosts(db: D1Database, limit: number = 3): Promise<DBPost[]> {
    const { results } = await db.prepare(
        "SELECT * FROM posts WHERE draft = 0 ORDER BY pub_date DESC LIMIT ?"
    ).bind(limit).all<DBPost>();
    return results;
}


export async function getPopularPosts(db: D1Database, limit: number = 3): Promise<DBPost[]> {
    const { results } = await db.prepare(
        "SELECT * FROM posts WHERE draft = 0 ORDER BY views DESC, pub_date DESC LIMIT ?"
    ).bind(limit).all<DBPost>();
    return results;
}

export async function getAllPostStats(db: D1Database): Promise<Record<string, { views: number; likes: number }>> {
    const { results } = await db.prepare(
        "SELECT slug, views, likes FROM posts"
    ).all<{ slug: string; views: number; likes: number }>();

    // Convert to dictionary for O(1) lookup
    return results.reduce((acc, curr) => {
        acc[curr.slug] = { views: curr.views || 0, likes: curr.likes || 0 };
        return acc;
    }, {} as Record<string, { views: number; likes: number }>);
}
