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
    "hero.eyebrow": "Data & AI engineering · fully remote",
    "hero.top": "Data, AI and systems engineering. 100% remote.",
    "hero.subrow":
      "We excel at cloud architectures, but also bare metal when sovereignty matters to you.",
    "hero.title.a": "From",
    "hero.title.hl": "bare metal",
    "hero.title.b": "to the model.",
    "hero.title.l2": "And it holds in production.",
    "hero.lead": "Computeflux is a French data and AI engineering agency, working entirely remotely. We step in where things break between the prototype and production:",
    "hero.rot.1": "inference that costs too much.",
    "hero.rot.2": "the pipeline that fails at night.",
    "hero.rot.3": "the agent that only worked in the demo.",
    "hero.rot.4": "numbers nobody believes.",
    "hero.rot.5": "servers that need taming.",
    "hero.ctaExplore": "See what we do",
    "hero.photo.a": "Scoping",
    "hero.photo.b": "Execution",
    "hero.scroll": "Scroll",

    // Home — diagnostic section (case nav + content cards)
    "diag.causeLabel": "What is usually going on",
    "diag.actionLabel": "What we do",

    // Home — cases section header (the ten-case rotation)
    "diagHome.eyebrow": "Typical cases",
    "diagHome.title": "A few typical cases we treat on a regular basis.",
    "diagHome.more": "See the expertise",

    // Home — "your problems" revealing deck
    "vostro.eyebrow": "Your problems",
    "vostro.title": "Six problems we solve from day one.",
    "vostro.sub": "Scroll. Each card is a real 2026 need — pick yours, we'll tell you how we'd approach it.",
    "vostro.cta": "Book a call",

    // Home — our own systems in production
    "systems.eyebrow": "Our own systems",
    "systems.title.a": "We don't just advise.",
    "systems.title.hl": "We run our own platforms.",
    "systems.subtitle.hl": "Computeflux",
    "systems.subtitle.rest":
      "The products below are ours: designed, shipped and maintained by us. We only sell engagements with real added value.",
    "systems.hardLabel": "The hard part",
    "systems.visit": "Visit the site",
    "systems.source": "Source code",

    // Home — what we do
    "practices.eyebrow": "What we do",
    "practices.title": "Our technical expertise gives us an end-to-end approach.",
    "practices.lead.a": "Most suppliers stop at the edge of their own layer.",
    "practices.lead.b": "We are able to",
    "practices.lead.hl": "go down into the low layers of cloud and bare-metal systems to optimise performance and costs",
    "practices.lead.c": "while keeping the solutions understandable at knowledge handover. No black boxes, no AI hyphen-slop.",
    "practices.learnMore": "Learn more",
    // Pyramid layers, base → apex (labels shown on the pyramid levels)
    "practices.layer.1": "Bare metal & compute",
    "practices.layer.2": "Data engineering",
    "practices.layer.3": "AI engineering",
    "practices.layer.4": "Semantic",
    "practices.layer.5": "API",

    // Home — sovereignty, energy and cost structure
    "sov.eyebrow": "Sovereignty & cost",
    "sov.title": "Your data has no reason to cross the Atlantic.",
    "sov.lead": "We design and operate data and AI systems at European providers — OVHcloud, Scaleway, Hetzner — or on hardware you own. Not out of principle: because energy, law and cost structure all point that way, and because an open stack lets you leave whenever you want.",
    "sov.photo.label": "Trade-offs",
    "sov.c1.title": "Energy is the limiting factor again",
    "sov.c1.body": "Data centres consumed around 415 TWh of electricity in 2024, close to 1.5% of world consumption, and the IEA projects roughly 945 TWh by 2030. Counting AI and crypto with them, the same agency saw the total passing 1,000 TWh as early as 2026. In practice: capacity is booked years ahead, the price of a kWh belongs in the architecture equation, and the idea that compute gets cheaper forever is no longer a given. What you pay per token, someone pays first in megawatts.",
    "sov.c1.action": "So we measure what you actually consume, size accordingly, and move heavy batch work to the hours when electricity is cheapest and least carbon-intensive.",
    "sov.c2.title": "Variable or fixed cost is a decision, not a religion",
    "sov.c2.body": "Metered billing is excellent when the load is irregular or unknown. It turns into a tax when the load is heavy and predictable: nightly training, hot storage, continuous ingestion. The historical lock-in was getting data out; the European Data Act removed it — switching charges are being phased out and disappear entirely in January 2027. Migrating is a calculation again, not a punishment.",
    "sov.c3.title": "The law follows the provider, not the location of the disk",
    "sov.c3.body": "The CLOUD Act lets US authorities compel an American operator to hand over data it controls, including data stored in Europe; and since the Schrems II judgment, a transfer to the United States requires demonstrable supplementary safeguards. A European provider, a SecNumCloud qualification or your own hardware are not marketing arguments: they are the only answers that survive the question “who can be compelled?”.",
    "sov.c4.title": "Portability is a technical property, not a contract clause",
    "sov.c4.body": "Open formats and replaceable engines: a lakehouse in Parquet and Iceberg can be read elsewhere, an open-weight model served by vLLM redeploys onto other GPUs, a cluster described in OpenTofu rebuilds at another provider. We avoid services whose API is the entire product — that is what makes the cost of leaving quantifiable from day one.",
    "sov.stackLabel": "What we build on",
    "sov.stackNote": "Nothing on this list belongs to a single vendor.",
    "sov.sourcesLabel": "Sources",
    "sov.sourceAria": "Source {n}",
    "sov.cta": "Talk about infrastructure",

    // Sovereignty expertise page deep-dive
    "sovPage.steps": "Our approach",

    // Reused by the "why" section — the dragon can burn these words
    "home.thesis.slideware": "slideware",
    "home.thesis.vanity": "empty promises",
    "home.thesis.or": "or",
    "home.thesis.hype": "hype",

    // Home — case studies (API-driven, hidden when empty)
    "home.work.eyebrow": "Case studies",
    "home.work.title": "What it looks like for real",
    "home.work.lead": "Anonymized client work, published only with their consent.",
    "home.work.all": "All case studies",

    // Home — writing (API-driven, hidden when empty)
    "home.writing.eyebrow": "Field notes",
    "home.writing.title": "What we write when we've learned something",
    "home.writing.lead": "No recycled industry news. Field reports, with the numbers when we're allowed to publish them.",
    "home.writing.all": "All articles",

    // Approach section (home + expertise) — simplified, no rigid cards
    "approach.eyebrow": "How we work",
    "approach.title": "Three ways to work together",
    "approach.lead": "No catch-all retainer. Every engagement targets an outcome written down before we start.",
    "approach.s1.title": "We look first",
    "approach.s1.desc": "We dig into your stack, measure, find what's stuck and hand you a prioritized plan. Usable even if you stop there.",
    "approach.s1.meta": "Scoping",
    "approach.s2.title": "We build",
    "approach.s2.desc": "We design and ship the system: inference engine, agent architecture, pipeline, hardware foundation. Milestone by milestone, with code your team can take over.",
    "approach.s2.meta": "Build",
    "approach.s3.title": "We strengthen your team",
    "approach.s3.desc": "We plug into your team, work in your repository, level up your engineers — and leave when you no longer need us.",
    "approach.s3.meta": "Embed",
    "common.readMore": "Read more",
    "common.readLess": "Show less",
    "approach.axis.out": "Alongside your team",
    "approach.axis.in": "Inside your team",
    "approach.legend.us": "Computeflux",
    "approach.legend.you": "Your team",

    // CTA section (default copy)
    "cta.eyebrow": "Let's work together",
    "cta.title": "A system to make hold in production?",
    "cta.lead": "Book thirty minutes. We'll tell you straight whether it's for us — and if not, who to call.",
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
    "expertise.startHere": "Start here if",
    "expertise.overview": "Overview",
    "expertise.capabilities": "What we do",
    "expertise.related": "Other practices",
    "expertise.related.title": "The rest of the practice.",
    /* Shown under every practice page, so it cannot name one of them. */
    "expertise.related.lead":
      "A practice rarely arrives on its own. The others sit on the same surface — pick the one your problem actually starts in.",
    "expertise.all": "All expertise",
    "expertise.cta.eyebrow": "Not sure where to start?",
    "expertise.cta.title": "Book a scoping call",
    "expertise.cta.lead":
      "Tell us the problem. We'll tell you honestly which skills fit, what an engagement would look like, and whether we're the right team for it.",
    "expertise.detail.practice": "Computeflux",
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
    "studies.searchPlaceholder": "Search case studies…",
    "studies.searchLabel": "Search case studies",
    "studies.searchButton": "Search",
    "studies.countOne": "STUDY",
    "studies.countMany": "STUDIES",
    "studies.filterAll": "All",
    "studies.empty": "No case studies match your filters.",
    "studies.clearFilters": "Clear filters",
    "studies.prev": "← Prev",
    "studies.next": "Next →",
    "studies.pagination": "Pagination",
    "studies.ctaEyebrow": "Your turn",
    "studies.ctaTitle": "Talk through your own case",
    "studies.ctaLead":
      "Bring us the problem as it stands today. We'll tell you what we would do about it.",

    // Study detail
    "study.preparing": "This case study is being prepared and will be available shortly.",

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
    "hero.eyebrow": "Ingénierie data & IA · 100 % à distance",
    "hero.top": "Ingénierie data, IA et système. 100 % à distance.",
    "hero.subrow":
      "Nous excellons dans les architectures cloud, mais aussi en bare metal si la souveraineté vous semble primordiale.",
    "hero.title.a": "Du",
    "hero.title.hl": "bare metal",
    "hero.title.b": "au modèle.",
    "hero.title.l2": "Et ça tient en production.",
    "hero.lead": "Computeflux est une agence française d'ingénierie data et IA, entièrement à distance. Nous intervenons là où ça casse entre le prototype et la production :",
    "hero.rot.1": "l'inférence qui coûte trop cher.",
    "hero.rot.2": "le pipeline qui tombe la nuit.",
    "hero.rot.3": "l'agent qui ne marchait qu'en démo.",
    "hero.rot.4": "les chiffres que personne ne croit.",
    "hero.rot.5": "les serveurs qu'il faut dompter.",
    "hero.ctaExplore": "Voir ce que nous faisons",
    "hero.photo.a": "Cadrage",
    "hero.photo.b": "Exécution",
    "hero.scroll": "Défiler",

    // Home — section diagnostic (navigation des cas + cartes de contenu)
    "diag.causeLabel": "Ce qui se passe le plus souvent",
    "diag.actionLabel": "Ce qu'on fait",

    // Home — header de section des cas
    "diagHome.eyebrow": "Cas typiques",
    "diagHome.title": "Quelques cas typiques que nous traitons régulièrement.",
    "diagHome.more": "Voir l'expertise",

    // Home — deck révélateur « vos problématiques »
    "vostro.eyebrow": "Vos problématiques",
    "vostro.title": "Six problèmes qu'on règle dès le premier jour.",
    "vostro.sub": "Faites défiler. Chaque carte est un besoin réel de 2026 — prenez le vôtre, on vous dira comment on l'aborderait.",
    "vostro.cta": "Réserver un appel",

    // Home — nos propres systèmes en production
    "systems.eyebrow": "Nos propres systèmes",
    "systems.title.a": "Nous ne faisons pas que conseiller,",
    "systems.title.hl": "nous maintenons nos propres plateformes",
    "systems.subtitle.hl": "Computeflux",
    "systems.subtitle.rest":
      "Les produits ci-dessous sont les nôtres : conçus, mis en ligne et maintenus par nous. Nous ne vendons que des prestations avec une vraie valeur ajoutée.",
    "systems.hardLabel": "Le morceau difficile",
    "systems.visit": "Voir le site",
    "systems.source": "Code source",

    // Home — ce que nous faisons
    "practices.eyebrow": "Ce que nous faisons",
    "practices.title": "Notre expertise technique nous permet d'avoir une approche de bout en bout.",
    "practices.lead.a": "La plupart des prestataires s'arrêtent à la frontière de leur zone de connaissance.",
    "practices.lead.b": "Nous sommes en mesure de",
    "practices.lead.hl": "descendre dans les couches basses des systèmes cloud et bare metal pour optimiser la performance et les coûts",
    "practices.lead.c": "tout en gardant les solutions compréhensibles lors de la passation des connaissances.",
    "practices.learnMore": "En savoir plus",
    // Couches de la pyramide, base → sommet (libellés affichés sur les niveaux)
    "practices.layer.1": "Bare metal & calcul",
    "practices.layer.2": "Ingénierie des données",
    "practices.layer.3": "Ingénierie IA",
    "practices.layer.4": "Sémantique",
    "practices.layer.5": "API",

    // Home — souveraineté, énergie et structure de coûts
    "sov.eyebrow": "Souveraineté & coûts",
    "sov.title": "Vos données n'ont aucune raison de traverser l'Atlantique.",
    "sov.lead": "Nous concevons et exploitons des systèmes data et IA chez des hébergeurs européens — OVHcloud, Scaleway, Hetzner — ou sur du matériel qui vous appartient. Pas par principe : parce que l'énergie, le droit et la structure de coûts vont dans ce sens, et parce qu'un stack ouvert vous laisse partir quand vous voulez.",
    "sov.photo.label": "Arbitrage",
    "sov.c1.title": "L'énergie est redevenue le facteur limitant",
    "sov.c1.body": "Les centres de données ont consommé environ 415 TWh d'électricité en 2024, près de 1,5 % de la consommation mondiale, et l'AIE projette autour de 945 TWh en 2030. En y ajoutant l'IA et la crypto, la même agence voyait le total dépasser 1 000 TWh dès 2026. Concrètement : la capacité se réserve des années à l'avance, le prix du kWh entre dans l'équation d'architecture, et l'idée que le calcul coûtera toujours moins cher n'est plus un acquis. Ce qui se paie au token se paie d'abord en mégawatts.",
    "sov.c1.action": "Donc on mesure ce que vous consommez réellement, on dimensionne en conséquence, et on décale les traitements lourds vers les heures où l'électricité est la moins chère et la moins carbonée.",
    "sov.c2.title": "Coût variable ou coût fixe : c'est une décision, pas une religion",
    "sov.c2.body": "La facturation à l'usage est excellente quand la charge est irrégulière ou inconnue. Elle devient un impôt quand la charge est lourde et prévisible : entraînement nocturne, stockage chaud, ingestion continue. Le verrou historique, c'était de faire sortir les données ; le Data Act européen l'a levé — les frais de changement de fournisseur s'éteignent progressivement et disparaissent en janvier 2027. Migrer redevient un calcul, plus une punition.",
    "sov.c3.title": "Le droit suit le fournisseur, pas l'emplacement du disque",
    "sov.c3.body": "Le CLOUD Act permet aux autorités américaines d'exiger d'un opérateur américain les données qu'il contrôle, y compris stockées en Europe ; et depuis l'arrêt Schrems II, un transfert vers les États-Unis exige des garanties supplémentaires démontrables. Un hébergeur européen, une qualification SecNumCloud ou votre propre matériel ne sont pas des arguments marketing : ce sont les seules réponses qui tiennent à la question « qui peut être contraint ? ».",
    "sov.c4.title": "La portabilité est une propriété technique, pas une clause de contrat",
    "sov.c4.body": "Formats ouverts et moteurs interchangeables : un lakehouse en Parquet et Iceberg se relit ailleurs, un modèle à poids ouverts servi par vLLM se redéploie sur d'autres GPU, un cluster décrit en OpenTofu se reconstruit chez un autre hébergeur. On évite les services dont l'API est tout le produit — c'est ce qui rend le coût de sortie chiffrable dès le premier jour.",
    "sov.stackLabel": "Ce sur quoi nous construisons",
    "sov.stackNote": "Rien dans cette liste n'appartient à un seul fournisseur.",
    "sov.sourcesLabel": "Sources",
    "sov.sourceAria": "Source {n}",
    "sov.cta": "Parler d'infrastructure",

    // Page expertise souveraineté — approfondissement
    "sovPage.steps": "Notre approche",

    // Réutilisées par la section « pourquoi » — le dragon peut brûler ces mots
    "home.thesis.slideware": "des slides",
    "home.thesis.vanity": "de fausses promesses",
    "home.thesis.or": "ni",
    "home.thesis.hype": "de hype",

    // Home — études de cas (API, masquée si vide)
    "home.work.eyebrow": "Études de cas",
    "home.work.title": "Ce que ça donne en vrai",
    "home.work.lead": "Des cas clients anonymisés, publiés uniquement avec leur accord.",
    "home.work.all": "Toutes les études",

    // Home — notes de terrain (API, masquée si vide)
    "home.writing.eyebrow": "Notes de terrain",
    "home.writing.title": "Ce qu'on écrit quand on a appris quelque chose",
    "home.writing.lead": "Pas de veille recopiée. Des retours d'expérience, avec les chiffres quand on a le droit de les publier.",
    "home.writing.all": "Tous les articles",

    // Approach section (home + expertise) — simplified, no rigid cards
    "approach.eyebrow": "Notre façon de travailler",
    "approach.title": "Trois manières de travailler ensemble",
    "approach.lead": "Pas de forfait fourre-tout. Chaque mission vise un résultat écrit noir sur blanc avant qu'on commence.",
    "approach.s1.title": "On regarde d'abord",
    "approach.s1.desc": "On plonge dans votre stack, on mesure, on identifie ce qui coince et on vous rend un plan priorisé. Utilisable même si vous vous arrêtez là.",
    "approach.s1.meta": "Cadrage",
    "approach.s2.title": "On construit",
    "approach.s2.desc": "On conçoit et on livre le système : moteur d'inférence, architecture d'agents, pipeline, socle matériel. Par jalons, avec du code que vos équipes peuvent reprendre.",
    "approach.s2.meta": "Développement",
    "approach.s3.title": "On renforce votre équipe",
    "approach.s3.desc": "On s'intègre à votre équipe, on travaille dans votre dépôt, on fait monter vos ingénieurs — et on part quand vous n'avez plus besoin de nous.",
    "approach.s3.meta": "Renfort",
    "common.readMore": "Lire la suite",
    "common.readLess": "Réduire",
    "approach.axis.out": "À côté de votre équipe",
    "approach.axis.in": "Dans votre équipe",
    "approach.legend.us": "Computeflux",
    "approach.legend.you": "Votre équipe",

    // CTA section (default copy)
    "cta.eyebrow": "Travaillons ensemble",
    "cta.title": "Un système à faire tenir en production ?",
    "cta.lead": "Réservez trente minutes. On vous dira franchement si c'est pour nous — et sinon, vers qui aller.",
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
    "expertise.startHere": "Commencez ici si",
    "expertise.overview": "Vue d'ensemble",
    "expertise.capabilities": "Ce que nous faisons",
    "expertise.related": "Autres pratiques",
    "expertise.related.title": "Le reste de la pratique.",
    /* Affiché sous chaque page de pratique : ne peut donc en nommer aucune. */
    "expertise.related.lead":
      "Une pratique arrive rarement seule. Les autres sont sur la même surface — choisissez celle où votre problème commence vraiment.",
    "expertise.all": "Toute l'expertise",
    "expertise.cta.eyebrow": "Vous ne savez pas par où commencer ?",
    "expertise.cta.title": "Réservez un appel de cadrage",
    "expertise.cta.lead":
      "Dites-nous le problème. On vous dira franchement quelles compétences correspondent, à quoi ressemblerait la mission, et si nous sommes la bonne équipe.",
    "expertise.detail.practice": "Computeflux",
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
    "studies.searchPlaceholder": "Rechercher des études de cas…",
    "studies.searchLabel": "Rechercher des études de cas",
    "studies.searchButton": "Rechercher",
    "studies.countOne": "ÉTUDE",
    "studies.countMany": "ÉTUDES",
    "studies.filterAll": "Toutes",
    "studies.empty": "Aucune étude de cas ne correspond à vos filtres.",
    "studies.clearFilters": "Réinitialiser les filtres",
    "studies.prev": "← Précédent",
    "studies.next": "Suivant →",
    "studies.pagination": "Pagination",
    "studies.ctaEyebrow": "À votre tour",
    "studies.ctaTitle": "Parlons de votre cas",
    "studies.ctaLead":
      "Présentez-nous le problème tel qu'il se pose aujourd'hui. Nous vous dirons comment nous l'aborderions.",

    // Study detail
    "study.preparing": "Cette étude de cas est en préparation et sera bientôt disponible.",

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
