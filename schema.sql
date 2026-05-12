-- 存储博客文章完整元数据
CREATE TABLE IF NOT EXISTS posts (
    slug TEXT PRIMARY KEY,
    id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    html_content TEXT,
    pub_date INTEGER,
    last_modified INTEGER,
    author TEXT DEFAULT 'ErpanOmer',
    cover TEXT,
    tags TEXT DEFAULT '[]',
    draft INTEGER DEFAULT 1,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    source_article_id TEXT,
    canonical_url TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    published_at INTEGER,
    deleted_at INTEGER
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_posts_source_article_id ON posts(source_article_id);
CREATE INDEX IF NOT EXISTS idx_posts_draft_pub_date ON posts(draft, pub_date);
CREATE INDEX IF NOT EXISTS idx_posts_sidebar_recent ON posts(draft, deleted_at, pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_sidebar_popular ON posts(draft, deleted_at, views DESC, pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at);
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at);

-- 用于速率限制的审计日志 (保持不变)
CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'view' (浏览) 或 'like' (点赞)
    ip_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interactions_slug_ip ON interactions(slug, ip_hash);
