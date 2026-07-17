-- Many-to-many relations: article <-> topic, article <-> author, and a
-- self-referential "related articles" edge.

CREATE TABLE article_topics (
    article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    topic_id   uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, topic_id)
);
CREATE INDEX idx_article_topics_topic ON article_topics (topic_id);

CREATE TABLE article_authors (
    article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    author_id  uuid NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    sort_order integer NOT NULL DEFAULT 0,
    PRIMARY KEY (article_id, author_id)
);
CREATE INDEX idx_article_authors_author ON article_authors (author_id);

CREATE TABLE article_related (
    article_id         uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    related_article_id uuid NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    sort_order         integer NOT NULL DEFAULT 0,
    PRIMARY KEY (article_id, related_article_id),
    CHECK (article_id <> related_article_id)
);
CREATE INDEX idx_article_related_related ON article_related (related_article_id);
