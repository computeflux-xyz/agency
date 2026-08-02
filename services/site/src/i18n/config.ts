// French first: Computeflux is a French agency, so `fr` is the reference locale
// and is served unprefixed at the root. English lives under /en.
export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
};

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
};

export const DATE_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  fr: "fr-FR",
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function toLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
