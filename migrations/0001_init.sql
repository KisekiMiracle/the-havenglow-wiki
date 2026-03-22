-- Comments: tied to a specific blog post via post_slug
CREATE TABLE IF NOT EXISTS comments (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  post_slug   TEXT    NOT NULL,
  author_name TEXT    NOT NULL,
  author_email TEXT   NOT NULL,
  content     TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Reviews: site-wide, include a 1-5 star rating
CREATE TABLE IF NOT EXISTS reviews (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT    NOT NULL,
  author_email TEXT   NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  content     TEXT    NOT NULL,
  status      TEXT    NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_slug   ON comments (post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status);
CREATE INDEX IF NOT EXISTS idx_reviews_status  ON reviews  (status);
