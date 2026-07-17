-- Seed the curated topics that back the site's expertise/nav taxonomy. Ingest
-- also upserts topics by slug, so this only guarantees the nav-curated set
-- exists. Idempotent.

INSERT INTO topics (slug, name, description, sort_order) VALUES
    ('ai-engineering',         'AI Engineering',         'Production LLM and agent systems.',              1),
    ('inference-optimization', 'Inference Optimization', 'Lower latency and cost for model inference.',    2),
    ('agentic-systems',        'Agentic Systems',        'Reliable autonomous agents in production.',      3),
    ('systems-programming',    'Systems Programming',    'Low-level performance and safety.',              4),
    ('inference',              'Inference & Cost',       'Inference performance and spend.',               5),
    ('agentic',                'Agentic AI',             'Agent architectures and reliability.',           6),
    ('data',                   'Data Pipelines',         'High-throughput data engineering.',              7),
    ('performance',            'Performance',            'Throughput, latency and profiling.',             8),
    ('backend',                'Backend',                'Backend and distributed systems.',               9),
    ('system-engineering',     'System Engineering',     'Systems-level engineering.',                    10),
    ('low-level',              'Low Level',              'Low-level and kernel-adjacent work.',           11)
ON CONFLICT (slug) DO NOTHING;
