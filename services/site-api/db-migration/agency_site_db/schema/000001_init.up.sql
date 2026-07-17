CREATE TYPE article_type AS ENUM ('blog', 'study');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

-- Classification of a built article asset, derived from its path in the
-- dist/ tree (entry html, runtime, vendored npm, own modules,
-- file attachments, cover media).
CREATE TYPE asset_kind AS ENUM ('entry', 'runtime', 'npm', 'import', 'file', 'cover', 'other');

-- Touches updated_at on every UPDATE; attached per-table below.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
