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
    "site.tagline": "AI and data engineering that reaches production",
    "site.description":
      "Computeflux is a French engineering studio. We help companies put AI and data systems into production: inference, agents and reliable data pipelines. We provide the AI engineers, data engineers and data architects your project needs.",

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

    // Mega-menu extras
    "nav.expertise.ai": "AI Engineering",
    "nav.expertise.aiDesc": "Models and agents, production-grade.",
    "nav.expertise.inference": "Inference",
    "nav.expertise.inferenceDesc": "Less latency, less cost.",
    "nav.expertise.agents": "Agentic Systems",
    "nav.expertise.agentsDesc": "Agents that survive production.",
    "nav.expertise.data": "Data engineering",
    "nav.expertise.dataDesc": "Clean data, solid architecture.",
    "nav.engagements": "Engagements",
    "nav.engagementsDesc": "Scoping, build and team embed.",
    "nav.caseStudiesDesc": "Selected work with real outcomes.",
    "nav.whitePapersDesc": "Free technical deep dives.",
    "nav.whitePapersDesc2": "Long-form technical reports.",
    "nav.byTopic": "By topic",
    "nav.topic.inference": "Inference & cost",
    "nav.topic.agentic": "Agentic AI",
    "nav.topic.data": "Data pipelines",
    "nav.topic.performance": "Performance",
    "nav.read": "Read",
    "nav.articlesDesc": "Field notes and engineering essays.",
    "nav.aboutDesc": "Who we are.",
    "nav.careersDesc": "Join the studio.",
    "nav.faqDesc": "Common questions.",
    "nav.contactDesc": "Talk to us.",
    "nav.resources": "Resources",

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
      "Field notes and engineering essays on AI in production: inference, agents, performance and the discipline of AI engineering.",
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

    // Home — hero
    "hero.eyebrow": "Engineering studio · France",
    "hero.titleA": "We put your",
    "hero.titleHighlight": "AI",
    "hero.titleB": "into production.",
    "hero.lead": "Computeflux is a French engineering studio. We provide the engineers who make AI and data hold up against the real world:",
    "hero.rot.1": "inference in production.",
    "hero.rot.2": "reliable agents.",
    "hero.rot.3": "your data pipelines.",
    "hero.rot.4": "your costs under control.",
    "hero.ctaExplore": "See what we do",
    "hero.pill.inference": "AI engineers",
    "hero.pill.agentic": "Data engineers",
    "hero.pill.langs": "Data architects",
    "hero.scroll": "Scroll",

    // Home — what we do (editorial block, replaces stat row + card grid)
    "home.intro.eyebrow": "What we do",
    "home.intro.title": "Engineers, not slides.",
    "home.intro.p1": "Most AI projects don't stall because of the model. They stall because the engineering around it is missing: production, reliability, clean data, cost control.",
    "home.intro.p2": "That is exactly our job. We plug into your team, work in your code, and leave you a system you understand and keep.",
    "home.intro.li1title": "AI engineering",
    "home.intro.li1body": "Getting your models and agents into production: evaluation, guardrails, observability, controlled cost.",
    "home.intro.li2title": "Inference",
    "home.intro.li2body": "Bringing down the latency and the bill of your models without sacrificing quality.",
    "home.intro.li3title": "Data engineering & architecture",
    "home.intro.li3body": "Pipelines and a data architecture your teams and your models can rely on.",

    // Home — thesis panel
    "home.thesis.eyebrow": "Our point of view",
    "home.thesis.p1a": "A promising model is not enough. What decides in production is",
    "home.thesis.p1span": "the engineering around the model",
    "home.thesis.p1b": ": evaluation, serving, data, reliability.",
    "home.thesis.p2": "We build that engineering. Reliable, observable, frugal systems that turn a promising model into a product you can count on.",
    "home.thesis.dont": "What we don't sell:",
    "home.thesis.slideware": "slideware",
    "home.thesis.vanity": "empty promises",
    "home.thesis.or": "or",
    "home.thesis.hype": "hype",
    "home.thesis.cta": "Who we are",

    // Home — selected work
    "home.work.eyebrow": "Selected work",
    "home.work.title": "Real outcomes, not slideware",
    "home.work.lead": "Anonymized client work, published only with their consent.",
    "home.work.all": "All work",

    // Approach section (home + expertise) — simplified, no rigid cards
    "approach.eyebrow": "How we work",
    "approach.title": "Simple and honest",
    "approach.lead": "No catch-all retainer. Every engagement targets a clear outcome, agreed with you before we start.",
    "approach.s1.title": "We look first",
    "approach.s1.desc": "We dig into your stack, measure, find what's stuck and hand you a concrete, prioritized plan.",
    "approach.s1.meta": "Scoping",
    "approach.s2.title": "We build",
    "approach.s2.desc": "We design and ship the system or component: inference engine, agent architecture, data pipeline. Milestone-based, production-ready.",
    "approach.s2.meta": "Build",
    "approach.s3.title": "We strengthen your team",
    "approach.s3.desc": "We plug into your team, work in your code, level up your engineers and leave you self-sufficient.",
    "approach.s3.meta": "Embed",

    // CTA section (default copy)
    "cta.eyebrow": "Let's work together",
    "cta.title": "An AI or data project to get into production?",
    "cta.lead": "Book a 30-minute call. We'll tell you honestly whether we can help, and how.",
    "cta.studies": "See our work",

    // Expertise
    "expertise.learnMore": "Learn more",
    "expertise.title": "Expertise",
    "expertise.metaDescription":
      "What Computeflux does: AI engineering, inference, agentic systems and data engineering. The engineering that gets AI and data into production.",
    "expertise.hero.eyebrow": "What we do",
    "expertise.hero.title": "AI and data engineering, end to end",
    "expertise.hero.lead":
      "We provide the engineers your project is missing: AI engineers, data engineers, data architects. We solve concrete production problems and we prove the results.",
    "expertise.practices": "Practices",
    "expertise.overview": "Overview",
    "expertise.capabilities": "What we do",
    "expertise.related": "Other practices",
    "expertise.all": "All expertise",
    "expertise.cta.eyebrow": "Not sure where to start?",
    "expertise.cta.title": "Book a scoping call",
    "expertise.cta.lead":
      "Tell us the problem. We'll tell you honestly which skills fit, what an engagement would look like, and whether we're the right team for it.",
    "expertise.detail.practice": "Practice",
    "expertise.detail.ctaTitle": "A {topic} project?",

    // About
    "about.title": "About",
    "about.metaDescription":
      "Computeflux is a French engineering studio. We provide the AI engineers, data engineers and data architects that companies need to get their projects into production.",
    "about.hero.eyebrow": "Who we are",
    "about.hero.title": "A French engineering studio for AI and data",
    "about.hero.lead":
      "We provide the engineers your project is missing, and we make things hold up in production. We build reliable, useful and honest systems.",
    "about.studio": "The studio",
    "about.p1":
      "We started Computeflux because we kept seeing the same thing: capable teams with promising projects, blocked not by the model but by everything around it. Inference that cost too much. Agents that worked in a demo and fell over in production. Data nobody could trust.",
    "about.p2":
      "Those are engineering problems, and they are the ones we love. We come from data engineering and modern AI engineering, right where cost, latency and reliability are not negotiable.",
    "about.p3":
      "We stay deliberately small and senior. When you work with Computeflux, you work with the people doing the work, and you keep everything we build. Case studies are always anonymized and only published with explicit consent.",
    "about.principles": "How we think",
    "about.pr1.title": "Measure, then optimize",
    "about.pr1.body":
      "Every claim we make is backed by a measurement. We instrument before we touch anything, so an improvement is proven, not asserted.",
    "about.pr2.title": "Reliability is an architecture",
    "about.pr2.body":
      "You don't bolt reliability on at the end. We design for observability, evaluation and graceful failure from the first commit.",
    "about.pr3.title": "The right tool for the job",
    "about.pr3.body":
      "We stay pragmatic. We reach for performance where it matters and keep things simple everywhere else.",
    "about.pr4.title": "No bullshit",
    "about.pr4.body":
      "We tell you when we are not the right fit, when a problem is easier than you think, and when it is harder. Honesty compounds.",
    "about.basedIn": "Based in",
    "about.founded": "Founded",

    // Contact
    "contact.title": "Contact",
    "contact.metaDescription":
      "Talk to Computeflux about your AI or data project. We'll tell you honestly whether we can help.",
    "contact.hero.eyebrow": "Get in touch",
    "contact.hero.title": "Let's talk about your project",
    "contact.hero.lead":
      "Tell us where you are and where you want to go. We read every message ourselves.",
    "contact.formTitle": "Send a message",
    "contact.name": "Your name",
    "contact.email": "Email",
    "contact.reach": "How should we reach you?",
    "contact.phone": "By phone",
    "contact.message": "Your message",
    "contact.send": "Send message",
    "contact.firstName": "First name",
    "contact.lastName": "Last name",
    "contact.phoneNumber": "Phone number",
    "contact.company": "Company",
    "contact.linkedin": "LinkedIn profile",
    "contact.optional": "Optional",
    "contact.byPhone": "By phone",
    "contact.byEmail": "By email",
    "contact.channelEmail": "Email",
    "contact.channelBook": "Book a call",
    "contact.channelBookValue": "30-minute intro",
    "contact.channelCareers": "Careers",
    "contact.channelCareersValue": "Join the studio",
    "contact.basedNote": "Based in {location}. We work remote-first and reply quickly.",
    "contact.networkError": "Network error. Please try again, or email us directly.",
    "contact.sending": "Sending your message…",
    "contact.sent": "Thanks, your message is on its way. We'll get back to you shortly.",
    "contact.error": "Something went wrong. Please try again.",

    // Book a call
    "book.title": "Book a call",
    "book.metaDescription":
      "Book a 30-minute call with Computeflux. We'll tell you honestly whether we can help with your AI or data project.",
    "book.hero.eyebrow": "Book a call",
    "book.hero.title": "Book a 30-minute call",
    "book.hero.lead":
      "A focused 30 minutes to understand your project. No sales script.",
    "book.expectTitle": "What to expect",
    "book.expect1": "A focused 30 minutes, no sales script.",
    "book.expect2": "An honest read on whether we can help.",
    "book.expect3": "Concrete next steps, whether or not we work together.",
    "book.formTitle": "Request a slot",
    "book.name": "Your name",
    "book.email": "Email",
    "book.window": "Your availability",
    "book.windowFrom": "From",
    "book.windowTo": "To",
    "book.about": "What's it about?",
    "book.request": "Request call",
    "book.slotSubtitle": "Tell us when suits you, we'll confirm by email quickly.",
    "book.preferEmail": "Prefer email? Reach us at",
    "book.firstName": "First name",
    "book.lastName": "Last name",
    "book.phoneNumber": "Phone number",
    "book.company": "Company",
    "book.linkedin": "LinkedIn profile",
    "book.optional": "Optional",
    "book.windowFromLabel": "Preferred window, from",
    "book.windowToLabel": "…until",
    "book.aboutLabel": "What would you like to solve?",
    "book.networkError": "Network error. Please try again, or email us directly.",
    "book.windowError": "The end of your window must be after the start.",
    "book.sending": "Sending your request…",
    "book.sent": "Thanks, your request is in. We'll come back with a slot shortly.",
    "book.error": "Something went wrong. Please try again.",

    // FAQ
    "faq.title": "FAQ",
    "faq.metaDescription": "Common questions about working with Computeflux.",
    "faq.hero.eyebrow": "FAQ",
    "faq.hero.title": "Frequently asked questions",
    "faq.hero.lead": "Short, honest answers. If yours isn't here, just ask.",
    "faq.ctaEyebrow": "Still curious?",
    "faq.ctaTitle": "Didn't find your answer?",
    "faq.ctaLead": "Ask us directly. We reply to every message ourselves.",

    // Newsletter
    "newsletter.title": "Newsletter",
    "newsletter.metaDescription":
      "Occasional, technical, no fluff. Subscribe to the Computeflux newsletter.",
    "newsletter.hero.eyebrow": "Newsletter",
    "newsletter.hero.title": "No fluff. Just engineering.",
    "newsletter.hero.lead":
      "One email when we have something genuinely useful to share. No spam, unsubscribe in one click.",
    "newsletter.topicsTitle": "What you'll get",
    "newsletter.topic1": "Inference techniques that actually move the numbers",
    "newsletter.topic2": "Field notes on agents in production",
    "newsletter.topic3": "Data engineering that holds up",

    // Privacy
    "privacy.title": "Privacy",
    "privacy.metaDescription": "How Computeflux handles your data.",
    "privacy.hero.eyebrow": "Legal",
    "privacy.hero.title": "Privacy policy",
    "privacy.updated": "Last updated",
    "privacy.updatedDate": "17 July 2026",
    "privacy.intro":
      "We keep this simple, because our data practices are simple. We collect the least we can, we don't sell anything, and you can ask us to delete your data at any time.",
    "privacy.collectTitle": "What we collect",
    "privacy.collectBody":
      "Only what you send us: the contact, booking and newsletter forms (name, email, phone if you provide it, and your message). Basic, privacy-friendly analytics on page views, without invasive tracking.",
    "privacy.useTitle": "How we use it",
    "privacy.useBody":
      "To reply to you, prepare a call, or send the newsletter if you subscribed. Nothing else.",
    "privacy.analyticsTitle": "Analytics",
    "privacy.analyticsBody":
      "We use privacy-friendly analytics without third-party advertising cookies.",
    "privacy.rightsTitle": "Your rights",
    "privacy.rightsBody":
      "Ask us for a copy of your data or its deletion at any time. Write to us and we'll take care of it.",

    // White papers
    "whitePapers.title": "White papers",
    "whitePapers.metaDescription":
      "Free technical deep dives from Computeflux on AI and data in production.",
    "whitePapers.hero.eyebrow": "Resources",
    "whitePapers.hero.title": "White papers",
    "whitePapers.hero.lead":
      "Free technical deep dives. No email wall on the ideas that matter.",
    "whitePapers.download": "Download PDF",
    "whitePapers.wp1.title": "Getting inference costs under control",
    "whitePapers.wp1.desc":
      "A practical guide to the levers that bring down the cost of serving a model.",
    "whitePapers.wp2.title": "Agents that survive production",
    "whitePapers.wp2.desc":
      "How to design agentic systems that hold up outside a demo.",
    "whitePapers.wp3.title": "Data foundations for AI",
    "whitePapers.wp3.desc":
      "Pipelines and architecture your teams and models can rely on.",
    "whitePapers.notice": "Downloads go live with our backend. Until then, {email} and we'll send the PDF directly.",
    "whitePapers.noticeLink": "email us",
    "whitePapers.wp1.topic": "Inference",
    "whitePapers.wp2.topic": "Agents",
    "whitePapers.wp3.topic": "Data",
    "whitePapers.cta.eyebrow": "Custom deep dive",
    "whitePapers.cta.title": "Want a report on your stack?",
    "whitePapers.cta.lead":
      "We produce tailored technical deep dives: an honest assessment of your AI or data system, with concrete, prioritized recommendations.",

    // Careers
    "careers.title": "Careers",
    "careers.metaDescription":
      "Join Computeflux. A small, senior engineering studio working on AI and data in production.",
    "careers.hero.eyebrow": "Careers",
    "careers.hero.title": "Build the engineering that makes AI real",
    "careers.hero.lead":
      "A small, senior team. You'll own real problems and see them through to production.",
    "careers.why": "Why Computeflux",
    "careers.openRolesOne": "OPEN ROLE",
    "careers.openRolesMany": "OPEN ROLES",
    "careers.viewRole": "View role",
    "careers.noRoleTitle": "Don't see your role?",
    "careers.noRoleLead": "We're always glad to meet good engineers. Write to us.",
    "careers.doTitle": "What you'll do",
    "careers.lookingTitle": "What we're looking for",
    "careers.applyTitle": "Apply",
    "careers.applyLead": "We read every application ourselves.",
    "careers.applyName": "Your name",
    "careers.applyEmail": "Email",
    "careers.applyLink": "Link (LinkedIn, GitHub, portfolio)",
    "careers.applyMessage": "A word about you",
    "careers.submit": "Submit application",
    "careers.allRoles": "← All open roles",
    "careers.openRole": "Open role",
    "careers.applyLinks": "Links (GitHub, LinkedIn, site)",
    "careers.applyWhy": "Why Computeflux?",
    "careers.applyWhyHint": "The most important field. Tell us what you'd want to work on.",
    "careers.perk1": "Small, senior team with real ownership.",
    "careers.perk2": "Remote-friendly, based in France.",
    "careers.perk3": "Real problems, in production, not slideware.",
    "careers.perk4": "You keep learning on hard, worthwhile work.",

    // Studies index
    "studies.title": "Case studies",
    "studies.metaDescription":
      "Anonymized client work from Computeflux on AI and data in production.",
    "studies.hero.eyebrow": "Selected work",
    "studies.hero.title": "Case studies",
    "studies.hero.lead":
      "Anonymized client work, published only with their consent.",
    "studies.countOne": "STUDY",
    "studies.countMany": "STUDIES",
    "studies.filterAll": "All",

    // 404
    "notFound.code": "Error 404",
    "notFound.title": "This page doesn't exist",
    "notFound.lead": "The link is broken or the page has moved.",
    "notFound.home": "Back home",
    "notFound.studies": "Browse case studies",

    // Article card
    "articleCard.study": "Case study",
    "articleCard.article": "Article",
    "articleCard.readTime": "min read",

    // API notice
    "apiNotice.badge": "Coming soon",
    "apiNotice.preview": "Preview.",
    "apiNotice.body": "This feature is on its way. In the meantime, write to us and we'll help you directly.",

    // Newsletter form
    "newsletterForm.label": "Email address",
    "newsletterForm.placeholder": "you@company.com",
    "newsletterForm.subscribe": "Subscribe",
  },
  fr: {
    // Site meta
    "site.tagline": "L'ingénierie IA et data qui va jusqu'en production",
    "site.description":
      "Computeflux est un studio d'ingénierie de données bordelais. Nous aidons les entreprises à mettre l'IA et leurs systèmes de données en production : inférence, agents et pipelines de données fiables. Nous fournissons les ingénieurs IA, data engineers et architectes de données dont votre projet a besoin.",

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

    // Mega-menu extras
    "nav.expertise.ai": "Ingénierie IA",
    "nav.expertise.aiDesc": "Modèles et agents, prêts pour la production.",
    "nav.expertise.inference": "Inférence",
    "nav.expertise.inferenceDesc": "Moins de latence, moins de coût.",
    "nav.expertise.agents": "Systèmes agentiques",
    "nav.expertise.agentsDesc": "Des agents qui survivent à la production.",
    "nav.expertise.data": "Ingénierie de données",
    "nav.expertise.dataDesc": "Des données propres, une architecture solide.",
    "nav.engagements": "Missions",
    "nav.engagementsDesc": "Cadrage, développement et renfort d'équipe.",
    "nav.caseStudiesDesc": "Des réalisations avec de vrais résultats.",
    "nav.whitePapersDesc": "Des analyses techniques gratuites.",
    "nav.whitePapersDesc2": "Des rapports techniques de fond.",
    "nav.byTopic": "Par sujet",
    "nav.topic.inference": "Inférence & coût",
    "nav.topic.agentic": "IA agentique",
    "nav.topic.data": "Pipelines de données",
    "nav.topic.performance": "Performance",
    "nav.read": "À lire",
    "nav.articlesDesc": "Notes de terrain et essais d'ingénierie.",
    "nav.aboutDesc": "Qui sommes-nous.",
    "nav.careersDesc": "Rejoignez le studio.",
    "nav.faqDesc": "Questions fréquentes.",
    "nav.contactDesc": "Parlez-nous.",
    "nav.resources": "Ressources",

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
      "Notes de terrain et essais d'ingénierie sur l'IA en production : inférence, agents, performance et la discipline de l'ingénierie IA.",
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

    // Home — hero
    "hero.eyebrow": "studio d'ingénierie de données 100% remote",
    "hero.titleA": "Des ingénieurs pour votre",
    "hero.titleHighlight": "IA",
    "hero.titleB": "en production.",
    "hero.lead": "Computeflux est un studio d'ingénierie de données bordelais. Nous fournissons les ingénieurs qui font tenir l'IA et vos données face au réel :",
    "hero.rot.1": "l'inférence en production.",
    "hero.rot.2": "des agents fiables.",
    "hero.rot.3": "vos pipelines de données.",
    "hero.rot.4": "vos coûts sous contrôle.",
    "hero.ctaExplore": "Voir ce que nous faisons",
    "hero.pill.inference": "Ingénieurs IA",
    "hero.pill.agentic": "Data engineers",
    "hero.pill.langs": "Architectes de données",
    "hero.scroll": "Défiler",

    // Home — what we do (editorial block, replaces stat row + card grid)
    "home.intro.eyebrow": "Ce que nous faisons",
    "home.intro.title": "Des ingénieurs, pas des slides.",
    "home.intro.p1": "La plupart des projets d'IA ne calent pas à cause du modèle. Ils calent parce qu'il manque l'ingénierie autour : la mise en production, la fiabilité, les données propres, la maîtrise des coûts.",
    "home.intro.p2": "C'est exactement notre métier. Nous nous intégrons à votre équipe, nous travaillons dans votre code, et nous vous laissons un système que vous comprenez et que vous gardez.",
    "home.intro.li1title": "Ingénierie IA",
    "home.intro.li1body": "Mettre vos modèles et vos agents en production : évaluation, garde-fous, observabilité, coûts maîtrisés.",
    "home.intro.li2title": "Inférence",
    "home.intro.li2body": "Faire baisser la latence et la facture de vos modèles sans sacrifier la qualité.",
    "home.intro.li3title": "Ingénierie & architecture de données",
    "home.intro.li3body": "Des pipelines et une architecture de données sur lesquels vos équipes et vos modèles peuvent s'appuyer.",

    // Home — thesis panel
    "home.thesis.eyebrow": "Notre point de vue",
    "home.thesis.p1a": " Ce qui décide en production, c'est",
    "home.thesis.p1span": "l'ingénierie autour du modèle",
    "home.thesis.p1b": ": l'évaluation, la mise en service, les données, la fiabilité.",
    "home.thesis.p2": "Nous construisons cette ingénierie. Des systèmes fiables, observables et sobres, qui transforment un modèle prometteur en produit sur lequel vous pouvez compter.",
    "home.thesis.dont": "Ce que nous ne vendons pas :",
    "home.thesis.slideware": "des slides",
    "home.thesis.vanity": "de fausses promesses",
    "home.thesis.or": "ni",
    "home.thesis.hype": "de hype",
    "home.thesis.cta": "Qui sommes-nous",

    // Home — selected work
    "home.work.eyebrow": "Quelques réalisations",
    "home.work.title": "Des résultats concrets, pas des slides",
    "home.work.lead": "Des cas clients anonymisés, publiés uniquement avec leur accord.",
    "home.work.all": "Toutes les réalisations",

    // Approach section (home + expertise) — simplified, no rigid cards
    "approach.eyebrow": "Notre façon de travailler",
    "approach.title": "Simple et honnête",
    "approach.lead": "Pas de forfait fourre-tout. Chaque mission vise un résultat clair, discuté avec vous avant de commencer.",
    "approach.s1.title": "On regarde d'abord",
    "approach.s1.desc": "On plonge dans votre stack, on mesure, on identifie ce qui coince et on vous rend un plan concret et priorisé.",
    "approach.s1.meta": "Cadrage",
    "approach.s2.title": "On construit",
    "approach.s2.desc": "On conçoit et on livre le système ou le composant : moteur d'inférence, architecture d'agents, pipeline de données. Par jalons, prêt pour la production.",
    "approach.s2.meta": "Développement",
    "approach.s3.title": "On renforce votre équipe",
    "approach.s3.desc": "On s'intègre à votre équipe, on travaille dans votre code, on fait monter vos ingénieurs en compétence et on vous laisse autonomes.",
    "approach.s3.meta": "Renfort",

    // CTA section (default copy)
    "cta.eyebrow": "Travaillons ensemble",
    "cta.title": "Un projet d'IA ou de données à faire tenir en production ?",
    "cta.lead": "Réservez un appel de 30 minutes. On vous dira franchement si on peut vous aider, et comment.",
    "cta.studies": "Voir les réalisations",

    // Expertise
    "expertise.learnMore": "En savoir plus",
    "expertise.title": "Expertise",
    "expertise.metaDescription":
      "Ce que fait Computeflux : ingénierie IA, inférence, systèmes agentiques et ingénierie de données. L'ingénierie qui met l'IA et les données en production.",
    "expertise.hero.eyebrow": "Ce que nous faisons",
    "expertise.hero.title": "L'ingénierie IA et data, de bout en bout",
    "expertise.hero.lead":
      "Nous fournissons les ingénieurs qui manquent à votre projet : ingénieurs IA, data engineers, architectes de données. Nous réglons des problèmes concrets de production et nous prouvons les résultats.",
    "expertise.practices": "Pratiques",
    "expertise.overview": "Vue d'ensemble",
    "expertise.capabilities": "Ce que nous faisons",
    "expertise.related": "Autres pratiques",
    "expertise.all": "Toute l'expertise",
    "expertise.cta.eyebrow": "Vous ne savez pas par où commencer ?",
    "expertise.cta.title": "Réservez un appel de cadrage",
    "expertise.cta.lead":
      "Dites-nous le problème. On vous dira franchement quelles compétences correspondent, à quoi ressemblerait la mission, et si nous sommes la bonne équipe.",
    "expertise.detail.practice": "Pratique",
    "expertise.detail.ctaTitle": "Un projet {topic} ?",

    // About
    "about.title": "À propos",
    "about.metaDescription":
      "Computeflux est un studio d'ingénierie de données bordelais. Nous fournissons les ingénieurs IA, data engineers et architectes de données dont les entreprises ont besoin pour mettre leurs projets en production.",
    "about.hero.eyebrow": "Qui sommes-nous",
    "about.hero.title": "Un studio d'ingénierie de données français pour l'IA et la data",
    "about.hero.lead":
      "Nous fournissons les ingénieurs qui manquent à votre projet, et nous faisons tenir les choses en production. Nous construisons des systèmes fiables, utiles et honnêtes.",
    "about.studio": "Le studio",
    "about.p1":
      "Nous avons créé Computeflux parce qu'on voyait toujours la même chose : des équipes solides avec des projets prometteurs, bloquées non par le modèle mais par tout ce qui l'entoure. Une inférence trop chère. Des agents qui marchaient en démo et s'effondraient en production. Des données auxquelles personne ne pouvait se fier.",
    "about.p2":
      "Ce sont des problèmes d'ingénierie, et ce sont ceux qu'on aime. Nous venons de l'ingénierie de données et de l'ingénierie IA moderne, là où le coût, la latence et la fiabilité ne sont pas négociables.",
    "about.p3":
      "Nous restons volontairement petits et seniors. Quand vous travaillez avec Computeflux, vous travaillez avec les personnes qui font le travail, et vous gardez tout ce que nous construisons. Les cas clients sont toujours anonymisés et publiés uniquement avec un accord explicite.",
    "about.principles": "Notre façon de penser",
    "about.pr1.title": "Mesurer, puis optimiser",
    "about.pr1.body":
      "Chaque affirmation que nous faisons repose sur une mesure. On instrumente avant de toucher à quoi que ce soit, pour qu'une amélioration soit prouvée et non affirmée.",
    "about.pr2.title": "La fiabilité est une architecture",
    "about.pr2.body":
      "La fiabilité ne se rajoute pas à la fin. On conçoit pour l'observabilité, l'évaluation et l'échec maîtrisé dès le premier commit.",
    "about.pr3.title": "Le bon outil pour le bon travail",
    "about.pr3.body":
      "On reste pragmatiques. On va chercher la performance là où elle compte et on garde les choses simples partout ailleurs.",
    "about.pr4.title": "Pas de baratin",
    "about.pr4.body":
      "On vous dit quand on n'est pas le bon choix, quand un problème est plus simple que prévu, et quand il est plus dur. L'honnêteté paie sur la durée.",
    "about.basedIn": "Basés à",
    "about.founded": "Fondé en",

    // Contact
    "contact.title": "Contact",
    "contact.metaDescription":
      "Parlez de votre projet d'IA ou de données à Computeflux. On vous dira franchement si on peut vous aider.",
    "contact.hero.eyebrow": "Écrivez-nous",
    "contact.hero.title": "Parlons de votre projet",
    "contact.hero.lead":
      "Dites-nous où vous en êtes et où vous voulez aller. On lit chaque message nous-mêmes.",
    "contact.formTitle": "Envoyer un message",
    "contact.name": "Votre nom",
    "contact.email": "E-mail",
    "contact.reach": "Comment vous joindre ?",
    "contact.phone": "Par téléphone",
    "contact.message": "Votre message",
    "contact.send": "Envoyer le message",
    "contact.firstName": "Prénom",
    "contact.lastName": "Nom",
    "contact.phoneNumber": "Numéro de téléphone",
    "contact.company": "Entreprise",
    "contact.linkedin": "Profil LinkedIn",
    "contact.optional": "Facultatif",
    "contact.byPhone": "Par téléphone",
    "contact.byEmail": "Par e-mail",
    "contact.channelEmail": "E-mail",
    "contact.channelBook": "Réserver un appel",
    "contact.channelBookValue": "Intro de 30 minutes",
    "contact.channelCareers": "Carrières",
    "contact.channelCareersValue": "Rejoindre le studio",
    "contact.basedNote": "Basés à {location}. On travaille en télétravail et on répond vite.",
    "contact.networkError": "Erreur réseau. Réessayez, ou écrivez-nous directement par e-mail.",
    "contact.sending": "Envoi de votre message…",
    "contact.sent": "Merci, votre message est parti. On vous répond très vite.",
    "contact.error": "Une erreur est survenue. Réessayez.",

    // Book a call
    "book.title": "Réserver un appel",
    "book.metaDescription":
      "Réservez un appel de 30 minutes avec Computeflux. On vous dira franchement si on peut aider sur votre projet d'IA ou de données.",
    "book.hero.eyebrow": "Réserver un appel",
    "book.hero.title": "Réservez un appel de 30 minutes",
    "book.hero.lead":
      "30 minutes ciblées pour comprendre votre projet. Sans discours commercial.",
    "book.expectTitle": "À quoi s'attendre",
    "book.expect1": "30 minutes ciblées, sans discours commercial.",
    "book.expect2": "Un avis honnête sur notre capacité à aider.",
    "book.expect3": "Des prochaines étapes concrètes, qu'on travaille ensemble ou non.",
    "book.formTitle": "Demander un créneau",
    "book.name": "Votre nom",
    "book.email": "E-mail",
    "book.window": "Vos disponibilités",
    "book.windowFrom": "Du",
    "book.windowTo": "Au",
    "book.about": "De quoi s'agit-il ?",
    "book.request": "Demander l'appel",
    "book.slotSubtitle": "Dites-nous ce qui vous arrange, on confirme par e-mail rapidement.",
    "book.preferEmail": "Vous préférez l'e-mail ? Écrivez-nous à",
    "book.firstName": "Prénom",
    "book.lastName": "Nom",
    "book.phoneNumber": "Numéro de téléphone",
    "book.company": "Entreprise",
    "book.linkedin": "Profil LinkedIn",
    "book.optional": "Facultatif",
    "book.windowFromLabel": "Créneau souhaité, du",
    "book.windowToLabel": "…au",
    "book.aboutLabel": "Que souhaitez-vous résoudre ?",
    "book.networkError": "Erreur réseau. Réessayez, ou écrivez-nous directement par e-mail.",
    "book.windowError": "La fin de votre créneau doit être après le début.",
    "book.sending": "Envoi de votre demande…",
    "book.sent": "Merci, votre demande est enregistrée. On revient vers vous avec un créneau très vite.",
    "book.error": "Une erreur est survenue. Réessayez.",

    // FAQ
    "faq.title": "FAQ",
    "faq.metaDescription": "Les questions fréquentes sur le fait de travailler avec Computeflux.",
    "faq.hero.eyebrow": "FAQ",
    "faq.hero.title": "Questions fréquentes",
    "faq.hero.lead": "Des réponses courtes et honnêtes. Si la vôtre n'y est pas, demandez.",
    "faq.ctaEyebrow": "Encore une question ?",
    "faq.ctaTitle": "Vous n'avez pas trouvé votre réponse ?",
    "faq.ctaLead": "Demandez-nous directement. On répond à chaque message nous-mêmes.",

    // Newsletter
    "newsletter.title": "Newsletter",
    "newsletter.metaDescription":
      "Occasionnel, technique, sans superflu. Abonnez-vous à la newsletter Computeflux.",
    "newsletter.hero.eyebrow": "Newsletter",
    "newsletter.hero.title": "Pas de superflu. De l'ingénierie.",
    "newsletter.hero.lead":
      "Un e-mail quand on a quelque chose de vraiment utile à partager. Pas de spam, désabonnement en un clic.",
    "newsletter.topicsTitle": "Ce que vous recevrez",
    "newsletter.topic1": "Des techniques d'inférence qui font vraiment bouger les chiffres",
    "newsletter.topic2": "Des retours de terrain sur les agents en production",
    "newsletter.topic3": "De l'ingénierie de données qui tient",

    // Privacy
    "privacy.title": "Confidentialité",
    "privacy.metaDescription": "Comment Computeflux traite vos données.",
    "privacy.hero.eyebrow": "Mentions",
    "privacy.hero.title": "Politique de confidentialité",
    "privacy.updated": "Dernière mise à jour",
    "privacy.updatedDate": "17 juillet 2026",
    "privacy.intro":
      "On fait simple, parce que nos pratiques le sont. On collecte le minimum, on ne vend rien, et vous pouvez nous demander de supprimer vos données à tout moment.",
    "privacy.collectTitle": "Ce que nous collectons",
    "privacy.collectBody":
      "Uniquement ce que vous nous envoyez : les formulaires de contact, de rendez-vous et de newsletter (nom, e-mail, téléphone si vous le donnez, et votre message). Des statistiques de fréquentation basiques et respectueuses de la vie privée, sans pistage intrusif.",
    "privacy.useTitle": "Comment nous les utilisons",
    "privacy.useBody":
      "Pour vous répondre, préparer un appel, ou vous envoyer la newsletter si vous vous y êtes abonné. Rien d'autre.",
    "privacy.analyticsTitle": "Statistiques",
    "privacy.analyticsBody":
      "Nous utilisons une solution de statistiques respectueuse de la vie privée, sans cookies publicitaires tiers.",
    "privacy.rightsTitle": "Vos droits",
    "privacy.rightsBody":
      "Demandez-nous une copie de vos données ou leur suppression à tout moment. Écrivez-nous et on s'en occupe.",

    // White papers
    "whitePapers.title": "Livres blancs",
    "whitePapers.metaDescription":
      "Des analyses techniques gratuites de Computeflux sur l'IA et la data en production.",
    "whitePapers.hero.eyebrow": "Ressources",
    "whitePapers.hero.title": "Livres blancs",
    "whitePapers.hero.lead":
      "Des analyses techniques gratuites. Pas de mur d'e-mail sur les idées qui comptent.",
    "whitePapers.download": "Télécharger le PDF",
    "whitePapers.wp1.title": "Reprendre la main sur les coûts d'inférence",
    "whitePapers.wp1.desc":
      "Un guide pratique des leviers qui font baisser le coût de service d'un modèle.",
    "whitePapers.wp2.title": "Des agents qui survivent à la production",
    "whitePapers.wp2.desc":
      "Comment concevoir des systèmes agentiques qui tiennent hors démo.",
    "whitePapers.wp3.title": "Des fondations de données pour l'IA",
    "whitePapers.wp3.desc":
      "Des pipelines et une architecture sur lesquels vos équipes et vos modèles peuvent s'appuyer.",
    "whitePapers.notice": "Les téléchargements arrivent avec notre backend. En attendant, {email} et on vous envoie le PDF directement.",
    "whitePapers.noticeLink": "écrivez-nous",
    "whitePapers.wp1.topic": "Inférence",
    "whitePapers.wp2.topic": "Agents",
    "whitePapers.wp3.topic": "Données",
    "whitePapers.cta.eyebrow": "Analyse sur mesure",
    "whitePapers.cta.title": "Vous voulez un rapport sur votre stack ?",
    "whitePapers.cta.lead":
      "Nous produisons des analyses techniques sur mesure : un état des lieux honnête de votre système d'IA ou de données, avec des recommandations concrètes et priorisées.",

    // Careers
    "careers.title": "Carrières",
    "careers.metaDescription":
      "Rejoignez Computeflux. Un petit studio d'ingénierie de données senior qui travaille sur l'IA et la data en production.",
    "careers.hero.eyebrow": "Carrières",
    "careers.hero.title": "Construisez l'ingénierie qui rend l'IA réelle",
    "careers.hero.lead":
      "Une petite équipe senior. Vous prenez en charge de vrais problèmes et vous les menez jusqu'en production.",
    "careers.why": "Pourquoi Computeflux",
    "careers.openRolesOne": "POSTE OUVERT",
    "careers.openRolesMany": "POSTES OUVERTS",
    "careers.viewRole": "Voir le poste",
    "careers.noRoleTitle": "Vous ne voyez pas votre poste ?",
    "careers.noRoleLead": "On est toujours content de rencontrer de bons ingénieurs. Écrivez-nous.",
    "careers.doTitle": "Ce que vous ferez",
    "careers.lookingTitle": "Ce que nous cherchons",
    "careers.applyTitle": "Candidater",
    "careers.applyLead": "On lit chaque candidature nous-mêmes.",
    "careers.applyName": "Votre nom",
    "careers.applyEmail": "E-mail",
    "careers.applyLink": "Lien (LinkedIn, GitHub, portfolio)",
    "careers.applyMessage": "Un mot sur vous",
    "careers.submit": "Envoyer ma candidature",
    "careers.allRoles": "← Tous les postes ouverts",
    "careers.openRole": "Poste ouvert",
    "careers.applyLinks": "Liens (GitHub, LinkedIn, site)",
    "careers.applyWhy": "Pourquoi Computeflux ?",
    "careers.applyWhyHint": "Le champ le plus important. Dites-nous ce sur quoi vous aimeriez travailler.",
    "careers.perk1": "Petite équipe senior, avec de vraies responsabilités.",
    "careers.perk2": "Télétravail bienvenu, basés en France.",
    "careers.perk3": "De vrais problèmes, en production, pas des slides.",
    "careers.perk4": "Vous apprenez sans cesse sur des sujets exigeants et utiles.",

    // Studies index
    "studies.title": "Études de cas",
    "studies.metaDescription":
      "Des cas clients anonymisés de Computeflux sur l'IA et la data en production.",
    "studies.hero.eyebrow": "Quelques réalisations",
    "studies.hero.title": "Études de cas",
    "studies.hero.lead":
      "Des cas clients anonymisés, publiés uniquement avec leur accord.",
    "studies.countOne": "ÉTUDE",
    "studies.countMany": "ÉTUDES",
    "studies.filterAll": "Toutes",

    // 404
    "notFound.code": "Erreur 404",
    "notFound.title": "Cette page n'existe pas",
    "notFound.lead": "Le lien est cassé ou la page a été déplacée.",
    "notFound.home": "Retour à l'accueil",
    "notFound.studies": "Voir les études de cas",

    // Article card
    "articleCard.study": "Étude de cas",
    "articleCard.article": "Article",
    "articleCard.readTime": "min de lecture",

    // API notice
    "apiNotice.badge": "Bientôt disponible",
    "apiNotice.preview": "Aperçu.",
    "apiNotice.body": "Cette fonctionnalité arrive. En attendant, écrivez-nous et on vous aide directement.",

    // Newsletter form
    "newsletterForm.label": "Adresse e-mail",
    "newsletterForm.placeholder": "vous@entreprise.com",
    "newsletterForm.subscribe": "S'abonner",
  },
} satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)["en"];
