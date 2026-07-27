-- Localization: articles gain a `lang` dimension. A logical article (slug) may
-- exist in several languages. Each (slug, lang) is an independent editorial row
-- with its own versions/assets/manifest, but shares taxonomy and cross-links.
-- 'en' is the canonical, always-complete locale. Other locales are opt-in per
-- article and fall back to 'en' on detail reads.

ALTER TABLE articles ADD COLUMN lang text NOT NULL DEFAULT 'en';
ALTER TABLE articles DROP CONSTRAINT articles_slug_key;
ALTER TABLE articles ADD CONSTRAINT articles_slug_lang_key UNIQUE (slug, lang);
CREATE INDEX idx_articles_slug_lang ON articles (slug, lang);

-- French full-text vector. A GENERATED column requires an IMMUTABLE expression,
-- so the text-search config must be a literal, hence a second column rather
-- than one whose config is driven by the `lang` value. The read path queries
-- whichever column matches the requested locale. The original english
-- `search_tsv` is retained unchanged for 'en'.
ALTER TABLE articles ADD COLUMN search_tsv_fr tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(shortdesc, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(longdesc, '')), 'C')
) STORED;
CREATE INDEX idx_articles_search_fr ON articles USING GIN (search_tsv_fr);
