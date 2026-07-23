output "assets_bucket" {
  description = "R2 bucket name for article artifacts"
  value       = cloudflare_r2_bucket.assets.name
}

output "assets_url" {
  description = "Public base URL for article artifacts"
  value       = "https://${var.assets_domain}"
}

output "r2_s3_endpoint" {
  description = "S3-compatible endpoint for the bucket (uploads, wrangler binding)"
  value       = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
}
