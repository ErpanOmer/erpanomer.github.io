-- Migration: Add content and admin fields to posts table
-- This migration is safe to run on existing data; it only adds new columns.

-- Add new columns (ALTER TABLE ADD COLUMN is safe if column doesn't exist)
-- SQLite will error if column already exists, so we use a trick with try/catch in the runner,
-- or simply run these one by one. D1 supports IF NOT EXISTS-style via ignoring errors.

ALTER TABLE posts ADD COLUMN id TEXT;
ALTER TABLE posts ADD COLUMN content TEXT;
ALTER TABLE posts ADD COLUMN html_content TEXT;
ALTER TABLE posts ADD COLUMN source_article_id TEXT;
ALTER TABLE posts ADD COLUMN canonical_url TEXT;
ALTER TABLE posts ADD COLUMN created_at INTEGER;
ALTER TABLE posts ADD COLUMN published_at INTEGER;
ALTER TABLE posts ADD COLUMN deleted_at INTEGER;

-- Set default for title if it was nullable before
-- (existing rows may have NULL title from view/like upserts)

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_posts_source_article_id ON posts(source_article_id);
CREATE INDEX IF NOT EXISTS idx_posts_draft_pub_date ON posts(draft, pub_date);
CREATE INDEX IF NOT EXISTS idx_posts_updated_at ON posts(updated_at);
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at);

-- Backfill created_at for existing rows
UPDATE posts SET created_at = updated_at WHERE created_at IS NULL AND updated_at IS NOT NULL;
UPDATE posts SET created_at = pub_date WHERE created_at IS NULL AND pub_date IS NOT NULL;
