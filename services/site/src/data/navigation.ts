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
          eyebrow: "What we do",
          title: "High-performance AI systems, engineered end to end",
          description:
            "We design, optimize and ship production AI infrastructure — from custom inference runtimes to reliable agentic systems.",
          href: p("/expertise"),
          cta: "Explore our expertise",
        },
        columns: [
          {
            heading: "Practices",
            links: [
              { label: "AI Engineering", href: p("/expertise/ai-engineering"), description: "LLM & agent systems, production-grade." },
              { label: "Inference Optimization", href: p("/expertise/inference-optimization"), description: "Cut latency and cost by 40–70%." },
              { label: "Agentic Systems", href: p("/expertise/agentic-systems"), description: "Autonomous agents that survive production." },
              { label: "Systems Programming", href: p("/expertise/systems-programming"), description: "Rust, Zig & Go for the hot path." },
            ],
          },
          {
            heading: "How we work",
            links: [
              { label: "Engagements", href: p("/expertise#engagements"), description: "Audits, builds and staff-level embeds." },
              { label: t("nav.caseStudies"), href: p("/studies"), description: "Selected work and measured outcomes." },
              { label: t("nav.whitePapers"), href: p("/white-papers"), description: "Free technical deep dives." },
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
          eyebrow: "Selected work",
          title: "Deep dives with measured outcomes",
          description:
            "Anonymized case studies on inference cost reduction, agent reliability and systems-level performance.",
          href: p("/studies"),
          cta: "Browse all studies",
        },
        columns: [
          {
            heading: "By topic",
            links: [
              { label: "Inference & Cost", href: p("/studies?topic=inference") },
              { label: "Agentic AI", href: p("/studies?topic=agentic") },
              { label: "Data Pipelines", href: p("/studies?topic=data") },
              { label: "Performance", href: p("/studies?topic=performance") },
            ],
          },
          {
            heading: "Read",
            links: [
              { label: t("nav.articles"), href: p("/articles"), description: "Field notes & engineering essays." },
              { label: t("nav.whitePapers"), href: p("/white-papers"), description: "Long-form technical reports." },
            ],
          },
        ],
      },
    },
    {
      label: t("nav.company"),
      href: p("/about"),
      mega: {
        columns: [
          {
            heading: t("nav.company"),
            links: [
              { label: t("nav.about"), href: p("/about"), description: "Who we are." },
              { label: t("nav.careers"), href: p("/careers"), description: "Join the studio." },
              { label: t("nav.faq"), href: p("/faq"), description: "Common questions." },
              { label: t("nav.contact"), href: p("/contact"), description: "Talk to us." },
            ],
          },
          {
            heading: "Resources",
            links: [
              { label: t("nav.whitePapers"), href: p("/white-papers") },
              { label: t("nav.newsletter"), href: p("/newsletter") },
              { label: t("nav.bookCall"), href: p("/book") },
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

/** Primary CTA at the end of the header, localized. */
export function getHeaderCta(t: T, locale: Locale): NavLink {
  return { label: t("nav.bookCall"), href: localizedPath("/book", locale) };
}

/** Localized footer navigation. */
export function getFooterNav(t: T, locale: Locale): MegaColumn[] {
  const p = (href: string) => localizedPath(href, locale);
  return [
    {
      heading: t("footer.expertise"),
      links: [
        { label: "AI Engineering", href: p("/expertise/ai-engineering") },
        { label: "Inference Optimization", href: p("/expertise/inference-optimization") },
        { label: "Agentic Systems", href: p("/expertise/agentic-systems") },
        { label: "Systems Programming", href: p("/expertise/systems-programming") },
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
        { label: t("nav.newsletter"), href: p("/newsletter") },
      ],
    },
  ];
}
