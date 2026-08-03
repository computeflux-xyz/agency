export type SocialLinks = {
  linkedin: string;
  github: string;
  x: string;
};

export type SiteConfig = {
  url: string;
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  defaultOgImage: string;
  locale: string;
  lang: string;
  email: string;
  location: string;
  foundingYear: number;
  social: SocialLinks;
  themeColor: string;
};

export const site: SiteConfig = {
  url: "https://computeflux.xyz",
  name: "Computeflux",
  legalName: "Computeflux",
  tagline: "AI and data engineering that reaches production",
  description:
    "Computeflux is a French engineering studio. We help companies put AI and data systems into production: inference, agents and reliable data pipelines. We provide the AI engineers, data engineers and data architects your project needs.",
  defaultOgImage: "/og/default.png",
  locale: "fr_FR",
  lang: "fr",
  email: "hello@computeflux.xyz",
  location: "Bordeaux, France · remote worldwide",
  foundingYear: 2026,
  social: {
    linkedin: "https://www.linkedin.com/company/computeflux",
    github: "https://github.com/computeflux-xyz",
    x: "https://x.com/computeflux",
  },
  themeColor: "#f5f4ef",
};

export const twitterHandle = "@computeflux";

import { DATE_LOCALE, OG_LOCALE, type Locale } from "@i18n/config";
import { ui } from "@i18n/ui";

export function siteFor(locale: Locale): SiteConfig {
  const dict = ui[locale] ?? ui.fr;
  return {
    ...site,
    tagline: dict["site.tagline"] ?? site.tagline,
    description: dict["site.description"] ?? site.description,
    lang: locale,
    locale: OG_LOCALE[locale] ?? site.locale,
  };
}

export function dateLocale(locale: Locale): string {
  return DATE_LOCALE[locale] ?? "fr-FR";
}
