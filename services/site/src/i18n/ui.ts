import type { Locale } from "./config";

/**
 * UI string dictionary.
 * English is the complete reference and French keys that are missing fall back to
 * English at lookup time (see `useTranslations`), so a partially translated
 * dictionary still renders. Add keys to `en` first.
 */
export const ui = {
  en: {
    // Site meta
    "site.tagline": "Deep tech R&D for high-performance AI systems",
    "site.description":
      "Computeflux is a deep tech research & development studio specializing in high-performance AI systems — inference optimization, agentic architectures and low-level systems programming (Rust, Zig, Go).",

    // Global chrome
    "nav.expertise": "Expertise",
    "nav.studies": "Studies",
    "nav.company": "Company",
    "nav.whitePapers": "White papers",
    "nav.about": "About",
    "nav.careers": "Careers",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.articles": "Articles",
    "nav.caseStudies": "Case studies",
    "nav.newsletter": "Newsletter",
    "nav.bookCall": "Book a call",
    "nav.privacy": "Privacy",
    "cta.contact": "Contact",
    "menu.open": "Open menu",
    "menu.close": "Close menu",
    "a11y.skipToContent": "Skip to content",

    // Language switcher
    "lang.switch": "Language",
    "lang.en": "English",
    "lang.fr": "Français",

    // Footer sections
    "footer.expertise": "Expertise",
    "footer.work": "Work",
    "footer.company": "Company",
    "footer.engage": "Engage",

    // Articles index
    "articles.title": "Articles",
    "articles.description":
      "Field notes and engineering essays on AI in production — inference, agents, performance and the discipline of AI Engineering.",
    "articles.eyebrow": "Writing",
    "articles.searchPlaceholder": "Search articles…",
    "articles.searchLabel": "Search articles",
    "articles.searchButton": "Search",
    "articles.filterAll": "All",
    "articles.countOne": "ARTICLE",
    "articles.countMany": "ARTICLES",
    "articles.empty": "No articles match your filters.",
    "articles.clearFilters": "Clear filters",
    "articles.prev": "← Prev",
    "articles.next": "Next →",
    "articles.pagination": "Pagination",
    "articles.ctaEyebrow": "Stay in the loop",
    "articles.ctaTitle": "Get new essays by email",
    "articles.ctaLead":
      "Occasional, technical, no fluff. Subscribe to the Computeflux newsletter.",

    // Article detail
    "article.preparing": "This article is being prepared and will be available shortly.",
  },
  fr: {
    // Site meta
    "site.tagline": "R&D deep tech pour des systèmes d'IA haute performance",
    "site.description":
      "Computeflux est un studio de recherche & développement deep tech spécialisé dans les systèmes d'IA haute performance — optimisation de l'inférence, architectures agentiques et programmation système bas niveau (Rust, Zig, Go).",

    // Global chrome
    "nav.expertise": "Expertise",
    "nav.studies": "Études",
    "nav.company": "Entreprise",
    "nav.whitePapers": "Livres blancs",
    "nav.about": "À propos",
    "nav.careers": "Carrières",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.articles": "Articles",
    "nav.caseStudies": "Études de cas",
    "nav.newsletter": "Newsletter",
    "nav.bookCall": "Réserver un appel",
    "nav.privacy": "Confidentialité",
    "cta.contact": "Contact",
    "menu.open": "Ouvrir le menu",
    "menu.close": "Fermer le menu",
    "a11y.skipToContent": "Aller au contenu",

    // Language switcher
    "lang.switch": "Langue",
    "lang.en": "English",
    "lang.fr": "Français",

    // Footer sections
    "footer.expertise": "Expertise",
    "footer.work": "Réalisations",
    "footer.company": "Entreprise",
    "footer.engage": "Contact",

    // Articles index
    "articles.title": "Articles",
    "articles.description":
      "Notes de terrain et essais d'ingénierie sur l'IA en production — inférence, agents, performance et la discipline de l'AI Engineering.",
    "articles.eyebrow": "Écrits",
    "articles.searchPlaceholder": "Rechercher des articles…",
    "articles.searchLabel": "Rechercher des articles",
    "articles.searchButton": "Rechercher",
    "articles.filterAll": "Tous",
    "articles.countOne": "ARTICLE",
    "articles.countMany": "ARTICLES",
    "articles.empty": "Aucun article ne correspond à vos filtres.",
    "articles.clearFilters": "Réinitialiser les filtres",
    "articles.prev": "← Précédent",
    "articles.next": "Suivant →",
    "articles.pagination": "Pagination",
    "articles.ctaEyebrow": "Restez informé",
    "articles.ctaTitle": "Recevez les nouveaux essais par e-mail",
    "articles.ctaLead":
      "Occasionnel, technique, sans superflu. Abonnez-vous à la newsletter Computeflux.",

    // Article detail
    "article.preparing": "Cet article est en préparation et sera bientôt disponible.",
  },
} satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)["en"];
