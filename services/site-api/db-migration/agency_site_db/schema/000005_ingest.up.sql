-- Audit + idempotency ledger for the admin publish (ingest) pipeline. One row
-- per begin/commit cycle. manifest_checksum lets a re-run short-circuit an
-- already-published build.

CREATE TABLE ingest_jobs (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    article_slug      text NOT NULL,
    article_type      article_type NOT NULL,
    version           integer NOT NULL DEFAULT 0,
    status            text NOT NULL DEFAULT 'begun',   -- begun | committed | failed
    source_commit     text NOT NULL DEFAULT '',
    source_ref        text NOT NULL DEFAULT '',
    manifest_checksum text NOT NULL DEFAULT '',
    requested_by      text NOT NULL DEFAULT '',
    error             text NOT NULL DEFAULT '',
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    committed_at      timestamptz
);
CREATE INDEX idx_ingest_jobs_slug     ON ingest_jobs (article_slug);
CREATE INDEX idx_ingest_jobs_checksum ON ingest_jobs (manifest_checksum);
CREATE TRIGGER trg_ingest_jobs_updated_at BEFORE UPDATE ON ingest_jobs
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
