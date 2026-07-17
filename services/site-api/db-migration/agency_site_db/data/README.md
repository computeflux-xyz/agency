# `data/`

Optional, environment-specific seed/import scripts that are **not** part of the
golang-migrate sequence in `../schema/`.

The reference topic seed lives in the schema sequence
(`../schema/000006_seed_topics.up.sql`) so it applies uniformly in local and CI.
Keep this directory free of `NNNNNN_*.sql` files whose numbers collide with the
schema sequence — the k8s migration image merges `schema/` and `data/` into one
`/migrations` directory, so any migration files here must continue the schema
numbering (e.g. start at `001000_*`).
