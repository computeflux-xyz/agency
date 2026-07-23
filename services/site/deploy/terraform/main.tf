# Article artifacts for the computeflux.xyz site, stored in R2 and served
# publicly at https://assets.computeflux.xyz. The site worker itself is deployed
# by wrangler (Astro static assets). It reads/writes this bucket through the R2
# binding declared in ../../wrangler.toml (see README).

resource "cloudflare_r2_bucket" "assets" {
  account_id = var.cloudflare_account_id
  name       = var.assets_bucket_name
  location   = var.r2_location
}

# Public custom domain for the bucket. Cloudflare provisions the DNS record and
# TLS certificate. `enabled = true` is required or the domain stays inactive.
resource "cloudflare_r2_custom_domain" "assets" {
  account_id  = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.assets.name
  zone_id     = var.cloudflare_zone_id
  domain      = var.assets_domain
  enabled     = true
  min_tls     = var.min_tls
}

# Aggressive edge and browser caching for the assets domain.
resource "cloudflare_ruleset" "assets_cache" {
  count = var.enable_cache_rules ? 1 : 0

  zone_id     = var.cloudflare_zone_id
  name        = "R2 ${var.assets_bucket_name} cache"
  description = "Aggressive caching for ${var.assets_domain}"
  kind        = "zone"
  phase       = "http_request_cache_settings"

  rules = [
    {
      action      = "set_cache_settings"
      expression  = "(http.host eq \"${var.assets_domain}\")"
      description = "Cache article artifacts aggressively"
      enabled     = true
      action_parameters = {
        cache = true
        edge_ttl = {
          mode    = "override_origin"
          default = 2592000 # 30 days
        }
        browser_ttl = {
          mode    = "override_origin"
          default = 604800 # 7 days
        }
        serve_stale = {
          disable_stale_while_updating = false
        }
        respect_strong_etags = true
      }
    }
  ]
}
