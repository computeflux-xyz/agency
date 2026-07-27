export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  fr: "FR",
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
