CREATE TABLE meeting_requests (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name              text NOT NULL,
    surname           text NOT NULL,
    email             text NOT NULL,
    phone_number      text NOT NULL,
    company           text NOT NULL DEFAULT '',
    linkedin_profile  text NOT NULL DEFAULT '',
    message           text NOT NULL,
    start_date        timestamptz NOT NULL,
    end_date          timestamptz NOT NULL,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT meeting_requests_window_ck CHECK (end_date > start_date)
);

CREATE INDEX idx_meeting_requests_start_date ON meeting_requests (start_date);
CREATE INDEX idx_meeting_requests_created_at ON meeting_requests (created_at DESC);

CREATE TRIGGER trg_meeting_requests_updated_at BEFORE UPDATE ON meeting_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
