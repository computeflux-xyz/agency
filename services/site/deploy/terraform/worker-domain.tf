# The computeflux-site Worker (deployed by wrangler) is served on these custom
# domains. Terraform owns the attachment + DNS + TLS so the CI deploy token can
# stay Workers-only. The Worker must already exist (wrangler deploy) before apply.

variable "worker_name" {
  description = "Name of the site Worker (matches wrangler.toml `name`)"
  type        = string
  default     = "computeflux-site"
}

variable "site_hostnames" {
  description = "Hostnames routed to the site Worker"
  type        = list(string)
  default     = ["computeflux.xyz", "www.computeflux.xyz"]
}

resource "cloudflare_workers_custom_domain" "site" {
  for_each = toset(var.site_hostnames)

  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
  hostname   = each.value
  service    = var.worker_name
}

output "site_urls" {
  description = "Public URLs served by the site Worker"
  value       = [for h in var.site_hostnames : "https://${h}"]
}
