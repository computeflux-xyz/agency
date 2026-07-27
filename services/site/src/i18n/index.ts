import { DEFAULT_LOCALE, LOCALES, toLocale, type Locale } from "./config";
import { ui, type UIKey } from "./ui";

export { DEFAULT_LOCALE, LOCALES, toLocale, type Locale } from "./config";
export {
  LOCALE_LABELS,
  LOCALE_SHORT,
  OG_LOCALE,
  DATE_LOCALE,
  isLocale,
} from "./config";

type AstroLike = { currentLocale?: string; url: URL };

export function getLocale(astro: AstroLike): Locale {
  return toLocale(astro.currentLocale ?? localeFromPath(astro.url.pathname));
}

export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0];
  return toLocale(first);
}

export function useTranslations(locale: Locale) {
  const dict = ui[locale] as Record<string, string>;
  const base = ui[DEFAULT_LOCALE] as Record<string, string>;
  return function t(key: UIKey | (string & {})): string {
    return dict[key] ?? base[key] ?? String(key);
  };
}

export function toCanonicalPath(pathname: string): string {
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }

  return pathname || "/";
}

export function localizedPath(canonicalPath: string, locale: Locale): string {
  const clean = canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

export type Alternate = { hreflang: string; href: string };

export function alternates(canonicalPath: string, origin: string): Alternate[] {
  const links: Alternate[] = LOCALES.map((locale) => ({
    hreflang: locale,
    href: new URL(localizedPath(canonicalPath, locale), origin).href,
  }));
  links.push({
    hreflang: "x-default",
    href: new URL(localizedPath(canonicalPath, DEFAULT_LOCALE), origin).href,
  });
  return links;
}
