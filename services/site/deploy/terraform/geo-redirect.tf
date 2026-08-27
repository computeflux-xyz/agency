# Optional first-visit locale redirect at the edge. DISABLED by default.
#
# HISTORY / TRAP: this ruleset used to 302 FR-geolocated visitors from "/" to
# "/fr", back when English was the unprefixed default locale. `astro.config.mjs`
# later flipped the scheme — `defaultLocale: "fr"` with
# `prefixDefaultLocale: false`, so French is now served unprefixed at the root
# and English lives under /en. `/fr/*` stopped existing, and the rule kept
# rewriting every French visitor's page URL to a 404 (including /en, which the
# old guard did not exempt, so French visitors could not reach English either).
#
# With French at the root there is nothing to redirect a French visitor to: the
# root already is their locale. The only remaining use for this ruleset is the
# mirror case — pushing non-French visitors to /en. That is off by default
# because it 302s the entire non-French internet away from the canonical root
# pages, which is an indexing regression; hreflang + the language switcher cover
# discovery without it. Turn it on only deliberately.
#
# When enabled it stays narrow, so it only ever touches page navigations:
#   * GET requests whose Accept header asks for text/html (never JS/CSS/img/RSS,
#     never the /api endpoints or form POSTs),
#   * on the site hosts only (not the assets subdomain),
#   * not already under /<alternate_locale>,
#   * not a verified crawler,
#   * with no `locale` cookie — the language switcher sets that cookie, so an
#     explicit choice permanently opts out of the redirect.

variable "enable_geo_redirect" {
  description = "Attach the first-visit country -> /<alternate_locale> redirect ruleset. Off by default: the default locale (fr) is served unprefixed at the root, so no redirect is needed to serve French visitors French."
  type        = bool
  default     = false
}

variable "default_locale_countries" {
  description = "ISO 3166-1 alpha-2 countries served the unprefixed default locale (fr). Visitors from anywhere else are redirected to /<alternate_locale> when enable_geo_redirect is true."
  type        = list(string)
  default     = ["FR"]
}

variable "alternate_locale" {
  description = "URL prefix / locale served to visitors outside default_locale_countries. Must match a prefixed locale that actually exists in astro.config.mjs i18n.locales."
  type        = string
  default     = "en"
}

variable "site_hosts" {
  description = "Hostnames the redirect applies to (the site apex + www, not the assets subdomain)"
  type        = list(string)
  default     = ["computeflux.xyz", "www.computeflux.xyz"]
}

locals {
  geo_redirect_host_set = "{${join(" ", [for h in var.site_hosts : "\"${h}\""])}}"

  geo_redirect_country_set = "{${join(" ", [for c in var.default_locale_countries : "\"${c}\""])}}"

  geo_redirect_expression = join(" and ", [
    "(http.host in ${local.geo_redirect_host_set})",
    "(http.request.method eq \"GET\")",
    "any(http.request.headers[\"accept\"][*] contains \"text/html\")",
    "not (ip.src.country in ${local.geo_redirect_country_set})",
    "not (http.request.uri.path eq \"/${var.alternate_locale}\" or starts_with(http.request.uri.path, \"/${var.alternate_locale}/\"))",
    "not starts_with(http.request.uri.path, \"/api/\")",
    "not (http.cookie contains \"locale=\")",
    "not cf.client.bot",
  ])

  # Preserve the visited path under the locale prefix; query string is carried
  # by preserve_query_string below.
  geo_redirect_target = "concat(\"https://\", http.host, \"/${var.alternate_locale}\", http.request.uri.path)"
}

resource "cloudflare_ruleset" "geo_locale_redirect" {
  count = var.enable_geo_redirect ? 1 : 0

  zone_id     = var.cloudflare_zone_id
  name        = "Geo locale redirect"
  description = "First-visit non-${join("/", var.default_locale_countries)} -> /${var.alternate_locale} redirect"
  kind        = "zone"
  phase       = "http_request_dynamic_redirect"

  rules = [
    {
      action      = "redirect"
      expression  = local.geo_redirect_expression
      description = "Redirect visitors outside ${join("/", var.default_locale_countries)} to /${var.alternate_locale} unless already localized, a crawler, or opted out"
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
