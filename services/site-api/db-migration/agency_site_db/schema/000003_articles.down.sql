ALTER TABLE articles DROP CONSTRAINT IF EXISTS fk_articles_current_version;
DROP TABLE IF EXISTS article_assets;
DROP TABLE IF EXISTS article_versions;
DROP TABLE IF EXISTS articles;
