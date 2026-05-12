-- Add covering indexes for article detail sidebar queries.
-- Recent posts: draft/deleted filter + pub_date sort.
-- Popular posts: draft/deleted filter + views/pub_date sort.

CREATE INDEX IF NOT EXISTS idx_posts_sidebar_recent
ON posts(draft, deleted_at, pub_date DESC);

CREATE INDEX IF NOT EXISTS idx_posts_sidebar_popular
ON posts(draft, deleted_at, views DESC, pub_date DESC);
