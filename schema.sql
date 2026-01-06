-- 存储博客文章完整元数据
CREATE TABLE IF NOT EXISTS posts (
    slug TEXT PRIMARY KEY,
    title TEXT,
    description TEXT,
    pub_date INTEGER,
    last_modified INTEGER,
    author TEXT,
    cover TEXT,
    tags TEXT, -- JSON array string
    draft INTEGER DEFAULT 0, -- Boolean 0/1
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    updated_at INTEGER
);

-- 用于速率限制的审计日志 (保持不变)
CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'view' (浏览) 或 'like' (点赞)
    ip_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_interactions_slug_ip ON interactions(slug, ip_hash);
