export type NavLink = {
  label: string;
  href: string;
  description?: string;
  badge?: string;
};

export type MegaColumn = {
  heading: string;
  links: NavLink[];
};

export type NavItem = {
  label: string;
  href: string;
  mega?: {
    feature?: {
      eyebrow: string;
      title: string;
      description: string;
      href: string;
      cta: string;
      image?: string;
      image2x?: string;
    };
    columns: MegaColumn[];
  };
};

import { localizedPath, type Locale } from "@i18n";
import { useTranslations } from "@i18n";

type T = ReturnType<typeof useTranslations>;

export function getPrimaryNav(t: T, locale: Locale): NavItem[] {
  const p = (href: string) => localizedPath(href, locale);
  return [
    {
      label: t("nav.expertise"),
      href: p("/expertise"),
      mega: {
        feature: {
          eyebrow: t("expertise.hero.eyebrow"),
          title: t("expertise.hero.title"),
          description: t("expertise.metaDescription"),
          href: p("/expertise"),
          cta: t("hero.ctaExplore"),
          image: "/photos/mega-expertise-640.webp",
          image2x: "/photos/mega-expertise-1280.webp",
        },
        columns: [
          {
            heading: t("expertise.practices"),
            links: [
              { label: t("nav.expertise.ai"), href: p("/expertise/ai-engineering"), description: t("nav.expertise.aiDesc") },
              { label: t("nav.expertise.inference"), href: p("/expertise/inference-optimization"), description: t("nav.expertise.inferenceDesc") },
              { label: t("nav.expertise.agents"), href: p("/expertise/agentic-systems"), description: t("nav.expertise.agentsDesc") },
              { label: t("nav.expertise.data"), href: p("/expertise/data-engineering"), description: t("nav.expertise.dataDesc") },
              { label: t("nav.expertise.bareMetal"), href: p("/expertise/bare-metal"), description: t("nav.expertise.bareMetalDesc") },
            ],
          },
          {
            heading: t("approach.eyebrow"),
            links: [
              { label: t("nav.engagements"), href: p("/expertise#engagements"), description: t("nav.engagementsDesc") },
              { label: t("nav.bookCall"), href: p("/book"), description: t("nav.bookCallDesc") },
            ],
          },
        ],
      },
    },
    {
      label: t("nav.studies"),
      href: p("/studies"),
      mega: {
        feature: {
          eyebrow: t("home.work.eyebrow"),
          title: t("home.work.title"),
          description: t("studies.metaDescription"),
          href: p("/studies"),
          cta: t("home.work.all"),
          image: "/photos/mega-studies-640.webp",
          image2x: "/photos/mega-studies-1280.webp",
        },
        columns: [
          {
            heading: t("nav.read"),
            links: [
              { label: t("nav.articles"), href: p("/articles"), description: t("nav.articlesDesc") },
            ],
          },
        ],
      },
    },
    {
      label: t("nav.company"),
      href: p("/about"),
      mega: {
        feature: {
          eyebrow: t("about.hero.eyebrow"),
          title: t("about.hero.title"),
          description: t("about.metaDescription"),
          href: p("/about"),
          cta: t("nav.company.cta"),
          image: "/photos/mega-company-640.webp",
          image2x: "/photos/mega-company-1280.webp",
        },
        columns: [
          {
            heading: t("nav.company"),
            links: [
              { label: t("nav.about"), href: p("/about"), description: t("nav.aboutDesc") },
              { label: t("nav.careers"), href: p("/careers"), description: t("nav.careersDesc") },
              { label: t("nav.faq"), href: p("/faq"), description: t("nav.faqDesc") },
              { label: t("nav.contact"), href: p("/contact"), description: t("nav.contactDesc") },
            ],
          },
        ],
      },
    },
    {
      label: t("nav.whitePapers"),
      href: p("/white-papers"),
    },
  ];
}

export function getHeaderCta(t: T, locale: Locale): NavLink {
  return { label: t("nav.bookCall"), href: localizedPath("/book", locale) };
}

export function getFooterNav(t: T, locale: Locale): MegaColumn[] {
  const p = (href: string) => localizedPath(href, locale);
  return [
    {
      heading: t("footer.expertise"),
      links: [
        { label: t("nav.expertise.ai"), href: p("/expertise/ai-engineering") },
        { label: t("nav.expertise.inference"), href: p("/expertise/inference-optimization") },
        { label: t("nav.expertise.agents"), href: p("/expertise/agentic-systems") },
        { label: t("nav.expertise.data"), href: p("/expertise/data-engineering") },
        { label: t("nav.expertise.bareMetal"), href: p("/expertise/bare-metal") },
      ],
    },
    {
      heading: t("footer.work"),
      links: [
        { label: t("nav.caseStudies"), href: p("/studies") },
        { label: t("nav.articles"), href: p("/articles") },
        { label: t("nav.whitePapers"), href: p("/white-papers") },
      ],
    },
    {
      heading: t("footer.company"),
      links: [
        { label: t("nav.about"), href: p("/about") },
        { label: t("nav.careers"), href: p("/careers") },
        { label: t("nav.faq"), href: p("/faq") },
        { label: t("nav.contact"), href: p("/contact") },
      ],
    },
    {
      heading: t("footer.engage"),
      links: [
        { label: t("nav.bookCall"), href: p("/book") },
        { label: t("cta.contact"), href: p("/contact") },
      ],
    },
  ];
}
