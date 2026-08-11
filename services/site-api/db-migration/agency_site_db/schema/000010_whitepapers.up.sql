-- Whitepapers
--
-- Two things make this unlike `articles` and justify separate tables rather
-- than a third ArticleType:
--
--   1. The built artifact is a single PDF per language, so there is no manifest,
--      no asset tree and no entrypoint to model.
--   2. The PDF must never be publicly reachable. It stays private in object
--      storage and is delivered as an email attachment once a visitor has
--      identified themselves. Reusing the article read path would have exposed
--      public blob URLs and defeated the whole point.
--
-- Topics are a jsonb array instead of a join on `topics`: a whitepaper carries
-- a couple of display tags, while the taxonomy tables exist to power article
-- filtering and counting, which whitepapers do not use. jsonb rather than
-- text[] keeps the driver surface identical to the rest of the schema.

CREATE TABLE whitepapers (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         text NOT NULL UNIQUE,
    status       text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    featured     boolean NOT NULL DEFAULT false,
    topics       jsonb NOT NULL DEFAULT '[]'::jsonb,
    publish_date date,
    source_dir   text NOT NULL DEFAULT '',
    created_at   timestamptz NOT NULL DEFAULT now(),
    updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_whitepapers_status ON whitepapers (status);
CREATE INDEX idx_whitepapers_publish_date ON whitepapers (publish_date DESC NULLS LAST);

CREATE TRIGGER trg_whitepapers_updated_at BEFORE UPDATE ON whitepapers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- One row per language edition. `sha256` is the identity of the built PDF and
-- makes a re-publish idempotent.
CREATE TABLE whitepaper_locales (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    whitepaper_id uuid NOT NULL REFERENCES whitepapers (id) ON DELETE CASCADE,
    lang          text NOT NULL,
    title         text NOT NULL,
    shortdesc     text NOT NULL DEFAULT '',
    longdesc      text NOT NULL DEFAULT '',
    pages         integer NOT NULL DEFAULT 0,
    filename      text NOT NULL,
    r2_key        text NOT NULL,
    sha256        text NOT NULL,
    byte_size     bigint NOT NULL DEFAULT 0,
    published_at  timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now(),
    UNIQUE (whitepaper_id, lang)
);

CREATE INDEX idx_whitepaper_locales_paper ON whitepaper_locales (whitepaper_id);

CREATE TRIGGER trg_whitepaper_locales_updated_at BEFORE UPDATE ON whitepaper_locales
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE whitepaper_requests (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    whitepaper_id     uuid REFERENCES whitepapers (id) ON DELETE SET NULL,
    slug              text NOT NULL,
    lang              text NOT NULL,
    name              text NOT NULL,
    surname           text NOT NULL,
    email             text NOT NULL,
    phone_number      text NOT NULL,
    preferred_contact text NOT NULL CHECK (preferred_contact IN ('phone', 'email')),
    company           text NOT NULL DEFAULT '',
    linkedin_profile  text NOT NULL DEFAULT '',
    message           text NOT NULL DEFAULT '',
    delivery_status   text NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed')),
    delivery_error    text NOT NULL DEFAULT '',
    delivered_at      timestamptz,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_whitepaper_requests_created_at ON whitepaper_requests (created_at DESC);
CREATE INDEX idx_whitepaper_requests_email ON whitepaper_requests (email);
CREATE INDEX idx_whitepaper_requests_slug ON whitepaper_requests (slug);

CREATE TRIGGER trg_whitepaper_requests_updated_at BEFORE UPDATE ON whitepaper_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
