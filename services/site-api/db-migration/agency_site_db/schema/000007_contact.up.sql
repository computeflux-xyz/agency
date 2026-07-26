CREATE TABLE contact_submissions (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name              text NOT NULL,
    surname           text NOT NULL,
    email             text NOT NULL,
    phone_number      text NOT NULL,
    preferred_contact text NOT NULL CHECK (preferred_contact IN ('phone', 'email')),
    company           text NOT NULL DEFAULT '',
    linkedin_profile  text NOT NULL DEFAULT '',
    message           text NOT NULL,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_contact_submissions_created_at ON contact_submissions (created_at DESC);

CREATE TRIGGER trg_contact_submissions_updated_at BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
