-- Publishing model: each publish creates an immutable article_versions row and
-- a fresh R2 prefix. Committing flips articles.current_version_id to it (atomic
-- swap + trivial rollback). The version's manifest jsonb is the denormalized
-- blob list the read API returns in a single row.

CREATE TABLE articles (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug               text NOT NULL UNIQUE,
    type               article_type NOT NULL,
    title              text NOT NULL,
    shortdesc          text NOT NULL DEFAULT '',
    longdesc           text NOT NULL DEFAULT '',
    status             article_status NOT NULL DEFAULT 'draft',
    featured           boolean NOT NULL DEFAULT false,
    sort_order         integer NOT NULL DEFAULT 0,
    cover_image_url    text NOT NULL DEFAULT '',
    cover_video_url    text NOT NULL DEFAULT '',
    reading_minutes    integer NOT NULL DEFAULT 0,
    seo_title          text NOT NULL DEFAULT '',
    seo_description    text NOT NULL DEFAULT '',
    canonical_url      text NOT NULL DEFAULT '',
    source_dir         text NOT NULL DEFAULT '',
    current_version_id uuid,
    search_tsv tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(shortdesc, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(longdesc, '')), 'C')
    ) STORED,
    published_at       timestamptz,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_articles_type_status   ON articles (type, status);
CREATE INDEX idx_articles_published_at  ON articles (published_at DESC);
CREATE INDEX idx_articles_featured      ON articles (featured) WHERE status = 'published';
CREATE INDEX idx_articles_search        ON articles USING GIN (search_tsv);
CREATE TRIGGER trg_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE article_versions (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id   uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    version      integer NOT NULL,
    status       article_status NOT NULL DEFAULT 'draft',
    r2_prefix    text NOT NULL,
    entrypoint   text NOT NULL DEFAULT 'index.html',
    manifest     jsonb NOT NULL DEFAULT '{}'::jsonb,
    build_commit text NOT NULL DEFAULT '',
    build_ref    text NOT NULL DEFAULT '',
    checksum     text NOT NULL DEFAULT '',
    byte_size    bigint NOT NULL DEFAULT 0,
    file_count   integer NOT NULL DEFAULT 0,
    created_at   timestamptz NOT NULL DEFAULT now(),
    committed_at timestamptz,
    UNIQUE (article_id, version)
);
CREATE INDEX idx_article_versions_article_status ON article_versions (article_id, status);

-- Circular FK added after both tables exist; SET NULL so deleting the live
-- version never orphans the article row.
ALTER TABLE articles
    ADD CONSTRAINT fk_articles_current_version
    FOREIGN KEY (current_version_id) REFERENCES article_versions(id) ON DELETE SET NULL;

CREATE TABLE article_assets (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    version_id    uuid NOT NULL REFERENCES article_versions(id) ON DELETE CASCADE,
    path          text NOT NULL,
    r2_key        text NOT NULL,
    content_type  text NOT NULL DEFAULT 'application/octet-stream',
    byte_size     bigint NOT NULL DEFAULT 0,
    sha256        text NOT NULL,
    kind          asset_kind NOT NULL DEFAULT 'other',
    is_entrypoint boolean NOT NULL DEFAULT false,
    created_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (version_id, path)
);
CREATE INDEX idx_article_assets_version ON article_assets (version_id);
CREATE INDEX idx_article_assets_sha256  ON article_assets (sha256);
