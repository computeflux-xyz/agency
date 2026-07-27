# First-visit locale redirect at the edge. Visitors geolocated to
# var.redirect_country are 302'd from an un-prefixed page URL to its
# /<redirect_locale> equivalent, so a French visitor landing on "/" gets
# "/fr". This runs before the Worker, keeping the static pages fully cacheable
#
# It is deliberately narrow so it only ever touches page navigations:
#   * GET requests whose Accept header asks for text/html (never JS/CSS/img/RSS,
#     never the /api endpoints or form POSTs),
#   * on the site hosts only (not the assets subdomain),
#   * not already under /<locale>,
#   * with no `locale` cookie, the language switcher sets that cookie, so an
#     explicit choice permanently opts out of the redirect.

variable "enable_geo_redirect" {
  description = "Attach the first-visit country -> locale redirect ruleset"
  type        = bool
  default     = true
}

variable "redirect_country" {
  description = "ISO 3166-1 alpha-2 country whose visitors are redirected to the localized site"
  type        = string
  default     = "FR"
}

variable "redirect_locale" {
  description = "URL prefix / locale served to redirect_country visitors"
  type        = string
  default     = "fr"
}

variable "site_hosts" {
  description = "Hostnames the redirect applies to (the site apex + www, not the assets subdomain)"
  type        = list(string)
  default     = ["computeflux.xyz", "www.computeflux.xyz"]
}

locals {
  geo_redirect_host_set = "{${join(" ", [for h in var.site_hosts : "\"${h}\""])}}"

  geo_redirect_expression = join(" and ", [
    "(http.host in ${local.geo_redirect_host_set})",
    "(http.request.method eq \"GET\")",
    "any(http.request.headers[\"accept\"][*] contains \"text/html\")",
    "(ip.src.country eq \"${var.redirect_country}\")",
    "not (http.request.uri.path eq \"/${var.redirect_locale}\" or starts_with(http.request.uri.path, \"/${var.redirect_locale}/\"))",
    "not starts_with(http.request.uri.path, \"/api/\")",
    "not (http.cookie contains \"locale=\")",
  ])

  # Preserve the visited path under the locale prefix; query string is carried
  # by preserve_query_string below.
  geo_redirect_target = "concat(\"https://\", http.host, \"/${var.redirect_locale}\", http.request.uri.path)"
}

resource "cloudflare_ruleset" "geo_locale_redirect" {
  count = var.enable_geo_redirect ? 1 : 0

  zone_id     = var.cloudflare_zone_id
  name        = "Geo locale redirect"
  description = "First-visit ${var.redirect_country} -> /${var.redirect_locale} redirect"
  kind        = "zone"
  phase       = "http_request_dynamic_redirect"

  rules = [
    {
      action      = "redirect"
      expression  = local.geo_redirect_expression
      description = "Redirect ${var.redirect_country} visitors to /${var.redirect_locale} unless already localized or opted out"
      enabled     = true
      action_parameters = {
        from_value = {
          status_code = 302
          target_url = {
            expression = local.geo_redirect_target
          }
          preserve_query_string = true
        }
      }
    }
  ]
}
