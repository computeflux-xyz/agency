DROP INDEX IF EXISTS idx_articles_search_fr;
DROP INDEX IF EXISTS idx_articles_slug_lang;
ALTER TABLE articles DROP COLUMN IF EXISTS search_tsv_fr;
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_slug_lang_key;
ALTER TABLE articles ADD CONSTRAINT articles_slug_key UNIQUE (slug);
ALTER TABLE articles DROP COLUMN IF EXISTS lang;
