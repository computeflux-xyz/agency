# Serve the computeflux-site Worker on the apex + www via Workers Routes (not a
# custom domain). Routes run the Worker on top of the EXISTING proxied DNS records
# (A computeflux.xyz, CNAME www) — nothing is deleted, so the current records are
# preserved. Requests matching a pattern run the Worker; the origin is bypassed.
#
# Requirements: the hostnames must have a *proxied* DNS record in the zone (they
# do), and the Worker must already exist (wrangler deploy) before apply.

variable "worker_name" {
  description = "Name of the site Worker (matches wrangler.toml `name`)"
  type        = string
  default     = "computeflux-site"
}

variable "site_route_patterns" {
  description = "Route patterns that run the site Worker"
  type        = list(string)
  default     = ["computeflux.xyz/*", "www.computeflux.xyz/*"]
}

resource "cloudflare_workers_route" "site" {
  for_each = toset(var.site_route_patterns)

  zone_id = var.cloudflare_zone_id
  pattern = each.value
  script  = var.worker_name
}

output "site_routes" {
  description = "Worker route patterns serving the site"
  value       = sort(var.site_route_patterns)
}
