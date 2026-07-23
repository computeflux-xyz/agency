variable "cloudflare_api_token" {
  description = "Cloudflare API token with R2 Edit + Zone DNS Edit on the computeflux.xyz zone"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Zone ID for computeflux.xyz"
  type        = string
}

variable "assets_bucket_name" {
  description = "R2 bucket name for article artifacts"
  type        = string
  default     = "computeflux-site-assets"
}

variable "assets_domain" {
  description = "Public custom domain for the assets bucket"
  type        = string
  default     = "assets.computeflux.xyz"
}

variable "r2_location" {
  description = "R2 location hint (WEUR, EEUR, ENAM, WNAM, APAC)"
  type        = string
  default     = "WEUR"
}

variable "enable_cache_rules" {
  description = "Attach an aggressive cache ruleset for the assets domain"
  type        = bool
  default     = true
}

variable "min_tls" {
  description = "Minimum TLS version for the assets custom domain"
  type        = string
  default     = "1.2"
}
