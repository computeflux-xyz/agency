# `site` Cloudflare terraform

Provisions the durable Cloudflare edge resources for the `computeflux.xyz` site:

- **R2 bucket** `computeflux-site-assets` : stores article artifacts.
- **Public custom domain** `assets.computeflux.xyz` : Cloudflare-managed DNS + TLS
  (`cloudflare_r2_custom_domain`), so artifacts are served at
  `https://assets.computeflux.xyz/<key>`.
- **Cache ruleset** : aggressive edge/browser caching for that domain.
- **Worker routes** `computeflux.xyz/*` + `www/*` : run the `computeflux-site`
  Worker on the apex + www via `cloudflare_workers_route`, on top of the existing
  proxied DNS records (nothing deleted).

## What is NOT here (and why)

The site worker (`computeflux-site`) is an Astro static-assets worker whose **code
and assets** are deployed by **wrangler** (`wrangler deploy`). Terraform does not
touch the worker script — but it owns the **routing** (`cloudflare_workers_route`),
so the CI deploy token stays Workers-only and `wrangler.toml` needs no `routes`.

Routes (not a custom domain) are used deliberately: the apex + www already have
externally managed, proxied DNS records (`A computeflux.xyz`, `CNAME www`). A
Workers custom domain would refuse to attach over them (Cloudflare error 100117).
A route runs the Worker for matching requests over the existing record instead —
the record is preserved; the origin is bypassed for matched paths.

Apply order: the Worker must exist first (`wrangler deploy`), then
`terraform apply` creates the routes.

Bind the bucket into the worker by adding this to `../../wrangler.toml`:

```toml
[[r2_buckets]]
binding     = "ARTICLES"
bucket_name = "computeflux-site-assets"
```

Then in SSR the bucket is reachable via `Astro.locals.runtime.env.ARTICLES`, and
publicly via `https://assets.computeflux.xyz/<key>`.

## Run

```bash
terraform init
terraform plan
terraform apply
```

## State and secrets

`terraform.tfvars` is committed but encrypted at rest with git-crypt (see the
agency repo-root `.gitattributes`). Unlock the repo with `git-crypt unlock
<keyfile>` before running Terraform, and back up / share the key
(`git-crypt export-key` or `git-crypt add-gpg-user`).

Local `*.tfstate` stays gitignored (local state). For team use, uncomment the R2
`backend "s3"` block in `terraform.tf` and create a `computeflux-tfstate` bucket
first.

## Outputs

```bash
terraform output assets_url        # https://assets.computeflux.xyz
terraform output assets_bucket     # computeflux-site-assets
terraform output r2_s3_endpoint    # for S3 uploads / wrangler
```
