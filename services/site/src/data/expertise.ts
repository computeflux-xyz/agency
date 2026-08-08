/**
 * Expertise / service lines. Powers the /expertise landing, the satellite
 * /expertise/[slug] pages, the mega-menu and footer.
 *
 * Copy is French-first (the agency is French); English mirrors it. Content is
 * locale-aware via getExpertise(locale) / getExpertiseItem(locale, slug).
 *
 * No unprovable numbers, no programming-language lists. The framing targets
 * the people who buy this: teams that need AI engineers, data engineers and
 * data architects to get things into production.
 */

import type { Locale } from "@i18n";

export type Capability = {
  title: string;
  description: string;
};

export type Expertise = {
  slug: string;
  /** Two-digit index used as a mono label in the UI (e.g. "01"). */
  index: string;
  title: string;
  /** Short label for compact contexts (cards, menu). */
  shortTitle: string;
  tagline: string;
  /** One-paragraph summary used on cards and meta description. */
  summary: string;
  /** Longer intro shown on the detail page. */
  intro: string;
  /**
   * The symptom that sends someone to THIS practice rather than a neighbouring
   * one, written to complete "Start here if…". Six summaries all read as
   * competent engineering; only the symptom tells a visitor which door is
   * theirs, so the /expertise hub leads with it. Phrased from the buyer's side
   * (what they are living with), never from ours (what we sell).
   */
  entryPoint: string;
  capabilities: Capability[];
};

const expertiseFr: Expertise[] = [
  {
    slug: "ai-engineering",
    index: "01",
    title: "Ingénierie IA",
    shortTitle: "Ingénierie IA",
    tagline: "Ce qui fait tenir vos modèles et vos agents face au réel.",
    summary:
      "Nous construisons l'ingénierie autour du modèle : évaluation, garde-fous, observabilité et maîtrise des coûts, pour que vos fonctionnalités d'IA tiennent en production.",
    intro:
      "L'ingénierie IA, c'est le métier qui consiste à mettre des systèmes à base de modèles et d'agents en production, de façon fiable et sans faire exploser la facture. Nous entraînons rarement des modèles ; nous bâtissons ce qui les entoure : ingestion, recherche, évaluation, observabilité, maîtrise des coûts et sécurité, pour que votre équipe livre des fonctionnalités qui tiennent sous le trafic réel.",
    entryPoint:
      "votre fonctionnalité d'IA marche en démo et déraille dès qu'elle voit du vrai trafic.",
    capabilities: [
      {
        title: "Recherche augmentée (RAG)",
        description:
          "Recherche documentaire et récupération de contexte réglées pour la pertinence et la latence.",
      },
      {
        title: "Évaluation & observabilité",
        description:
          "Bancs d'évaluation automatisés, traçage et garde-fous de non-régression pour que la qualité se mesure au lieu de se ressentir.",
      },
      {
        title: "Maîtrise des coûts",
        description:
          "Routage de modèles, cache et budgets pour garder une dépense d'inférence prévisible quand l'usage grandit.",
      },
      {
        title: "Sécurité & garde-fous",
        description:
          "Défense contre l'injection de prompt, validation des sorties et contrôle des données personnelles à la frontière du système.",
      },
    ],
  },
  {
    slug: "inference-optimization",
    index: "02",
    title: "Inférence",
    shortTitle: "Inférence",
    tagline: "Moins de latence, moins de coût, à qualité au moins égale.",
    summary:
      "Quantification, décodage spéculatif, batching et architecture de service pour faire baisser le coût et la latence de vos modèles sans sacrifier la qualité.",
    intro:
      "L'inférence est souvent la plus grosse ligne de dépense d'un projet d'IA. Nous l'attaquons sous tous les angles : quantification, distillation, décodage spéculatif, stratégie de batching, gestion du cache et composants critiques sur mesure, pour faire baisser le coût et la latence de queue sans dégrader la qualité des réponses.",
    entryPoint:
      "votre facture d'inférence grimpe plus vite que l'usage, ou vos utilisateurs attendent.",
    capabilities: [
      {
        title: "Quantification & distillation",
        description:
          "Réduction de précision et distillation, avec un benchmarking rigoureux de la qualité avant toute mise en production.",
      },
      {
        title: "Architecture de service",
        description:
          "Batching continu, réglage du cache et décodage spéculatif sur des moteurs d'inférence éprouvés.",
      },
      {
        title: "Composants critiques sur mesure",
        description:
          "Composants du chemin critique conçus pour la performance quand la latence et la mémoire ne sont pas négociables.",
      },
      {
        title: "Benchmarking",
        description:
          "Des mesures de latence, coût et qualité reproductibles, pour que les gains soient prouvés et non promis.",
      },
    ],
  },
  {
    slug: "agentic-systems",
    index: "03",
    title: "Systèmes agentiques",
    shortTitle: "Agents",
    tagline: "Des agents autonomes qui survivent à la production.",
    summary:
      "Des architectures d'agents fiables avec mémoire, appel d'outils, stratégies de repli et évaluation, pensées pour de vrais usages, pas pour une démo.",
    intro:
      "La plupart des démos d'agents s'effondrent en production. Nous concevons des systèmes agentiques qui tiennent : mémoire durable, appel d'outils fiable, boucles de raisonnement bornées, stratégies de repli et évaluation continue. Le résultat est une autonomie à laquelle vous pouvez confier de vrais processus métier.",
    entryPoint:
      "vous voulez confier un vrai processus à un agent sans perdre la main dessus.",
    capabilities: [
      {
        title: "Architecture d'agents",
        description:
          "Orchestration à état explicite, avec reprises et points de contrôle où un humain peut reprendre la main.",
      },
      {
        title: "Mémoire & outils",
        description:
          "Contrats d'appel d'outils fiables et gestion de mémoire qui reste cohérente sur la durée.",
      },
      {
        title: "Fiabilité",
        description:
          "Replis, coupe-circuits et délais d'attente pour qu'un outil défaillant ne fasse pas tomber toute la chaîne.",
      },
      {
        title: "Évaluation des agents",
        description:
          "Évaluation et supervision au niveau des parcours, pour attraper les régressions avant vos utilisateurs.",
      },
    ],
  },
  {
    slug: "data-engineering",
    index: "04",
    title: "Ingénierie & architecture de données",
    shortTitle: "Données",
    tagline: "Des données propres et une architecture sur laquelle s'appuyer.",
    summary:
      "Pipelines, modélisation et architecture de données fiables, sur lesquels vos équipes et vos modèles peuvent réellement compter.",
    intro:
      "Un projet d'IA ne vaut que ce que valent ses données. Nous concevons et fiabilisons les fondations : ingestion, pipelines, modélisation et architecture de données, afin que vos équipes prennent des décisions sur des chiffres justes et que vos modèles s'entraînent et s'exécutent sur une base saine.",
    entryPoint:
      "personne dans l'entreprise n'est d'accord sur le chiffre affiché.",
    capabilities: [
      {
        title: "Pipelines de données",
        description:
          "Ingestion et transformations fiables, remplaçant les traitements lents et fragiles par des chaînes tenables.",
      },
      {
        title: "Architecture de données",
        description:
          "Modélisation et organisation de la donnée pensées pour l'analyse, le reporting et l'entraînement de modèles.",
      },
      {
        title: "Qualité & fraîcheur",
        description:
          "Contrôles de qualité et de fraîcheur pour que les tableaux de bord et les modèles s'appuient sur des données à jour.",
      },
      {
        title: "Performance",
        description:
          "Profilage et réglage pour trouver et lever les vrais goulots d'étranglement de vos traitements.",
      },
    ],
  },
  {
    slug: "bare-metal",
    index: "05",
    title: "Bare metal & calcul",
    shortTitle: "Bare metal",
    tagline: "Du matériel bien exploité, quand le cloud coûte plus qu'il ne rend.",
    summary:
      "Serveurs dédiés, GPU, stockage et réseau : dimensionner puis exploiter du matériel physique pour les charges lourdes et régulières que le cloud facture trop cher.",
    intro:
      "Le cloud n'est pas toujours la réponse, et le bare metal non plus. Sur des charges lourdes et régulières — entraînement, traitement massif, stockage chaud — la facture à l'usage finit par dépasser le prix du matériel. Nous mesurons ce que vous consommez réellement, nous dimensionnons, puis nous exploitons : placement mémoire, réseau, disques, ordonnancement des tâches. Nous faisons tourner les deux modèles, donc nous n'avons aucune raison de vous pousser vers l'un plutôt que l'autre.",
    entryPoint:
      "vous payez une charge lourde et régulière au prix du cloud à l'usage.",
    capabilities: [
      {
        title: "Dimensionnement",
        description:
          "Mesure de la consommation réelle, puis arbitrage chiffré entre cloud, hébergement dédié et machines en propre.",
      },
      {
        title: "Exploitation système",
        description:
          "Placement NUMA, réglage du réseau et du stockage, ordonnancement des tâches : là où se joue l'écart entre matériel acheté et matériel réellement utilisé.",
      },
      {
        title: "Calcul GPU",
        description:
          "Partage, files d'attente et suivi d'occupation, pour que les cartes travaillent au lieu d'attendre.",
      },
      {
        title: "Continuité",
        description:
          "Sauvegardes, bascule et supervision, pour qu'une panne matérielle reste un incident et non un arrêt.",
      },
    ],
  },
  {
    slug: "sovereignty",
    index: "06",
    title: "Souveraineté & portabilité",
    shortTitle: "Souveraineté",
    tagline: "Vos données n'ont aucune raison de traverser l'Atlantique.",
    summary:
      "Nous concevons et exploitons des systèmes data et IA chez des hébergeurs européens ou sur votre propre matériel : portables, chiffrables, et sous votre contrôle juridique.",
    intro:
      "La souveraineté n'est pas une option de repli : c'est une propriété d'architecture. Vos données n'ont aucune raison de traverser l'Atlantique. Nous concevons des systèmes data et IA chez des hébergeurs européens — OVHcloud, Scaleway, Hetzner — ou sur du matériel qui vous appartient. Pas par principe : parce que l'énergie, le droit et la structure de coûts vont dans ce sens, et parce qu'un stack ouvert vous laisse partir quand vous voulez. Chaque choix se justifie par une mesure ou une contrainte juridique, pas par une promesse.",
    entryPoint:
      "vos données ne doivent pas quitter l'Europe, ou vous devez pouvoir partir quand vous voulez.",
    capabilities: [
      {
        title: "Juridiction & droit",
        description:
          "Le CLOUD Act et l'arrêt Schrems II : nous choisissons des hébergeurs et des qualifications — SecNumCloud — qui survivent à la question « qui peut être contraint ? ».",
      },
      {
        title: "Portabilité technique",
        description:
          "Formats ouverts et moteurs interchangeables : Parquet, Iceberg, modèles à poids ouverts, infra décrite en code. Le coût de sortie reste chiffrable du premier jour.",
      },
      {
        title: "Énergie & coût de structure",
        description:
          "Le kWh appartient à l'équation. On dimensionne en conséquence et on décale les charges lourdes vers les heures les moins chères et les moins carbonées.",
      },
      {
        title: "Cycle de vie",
        description:
          "Sauvegardes, bascule et reprise, sur votre matériel comme chez un hébergeur européen, avec le même niveau de rigueur.",
      },
    ],
  },
];

const expertiseEn: Expertise[] = [
  {
    slug: "ai-engineering",
    index: "01",
    title: "AI Engineering",
    shortTitle: "AI Engineering",
    tagline: "What makes your models and agents hold up against the real world.",
    summary:
      "We build the engineering around the model: evaluation, guardrails, observability and cost control, so your AI features hold up in production.",
    intro:
      "AI engineering is the discipline of putting model- and agent-based systems into production reliably and within budget. We rarely train models; we build everything around them: ingestion, retrieval, evaluation, observability, cost control and safety, so your team ships features that hold up under real traffic.",
    entryPoint:
      "your AI feature works in the demo and drifts the moment it meets real traffic.",
    capabilities: [
      {
        title: "Retrieval-augmented (RAG)",
        description:
          "Document search and context retrieval tuned for relevance and latency.",
      },
      {
        title: "Evaluation & observability",
        description:
          "Automated eval harnesses, tracing and regression gates so quality is measured, not felt.",
      },
      {
        title: "Cost control",
        description:
          "Model routing, caching and budgets that keep inference spend predictable as usage grows.",
      },
      {
        title: "Safety & guardrails",
        description:
          "Prompt-injection defense, output validation and personal-data controls at the system boundary.",
      },
    ],
  },
  {
    slug: "inference-optimization",
    index: "02",
    title: "Inference",
    shortTitle: "Inference",
    tagline: "Lower latency, lower cost, quality at least as good.",
    summary:
      "Quantization, speculative decoding, batching and serving architecture to bring down the cost and latency of your models without sacrificing quality.",
    intro:
      "Inference is often the biggest line item in an AI project. We attack it from every angle: quantization, distillation, speculative decoding, batching strategy, cache management and custom hot-path components, to drive down cost and tail latency without degrading answer quality.",
    entryPoint:
      "your inference bill grows faster than your usage, or your users are waiting.",
    capabilities: [
      {
        title: "Quantization & distillation",
        description:
          "Precision reduction and distillation, with rigorous quality benchmarking before anything ships.",
      },
      {
        title: "Serving architecture",
        description:
          "Continuous batching, cache tuning and speculative decoding on proven inference engines.",
      },
      {
        title: "Custom hot-path components",
        description:
          "Critical-path components built for performance where latency and memory are non-negotiable.",
      },
      {
        title: "Benchmarking",
        description:
          "Reproducible latency, cost and quality measurements so gains are proven, not promised.",
      },
    ],
  },
  {
    slug: "agentic-systems",
    index: "03",
    title: "Agentic Systems",
    shortTitle: "Agents",
    tagline: "Autonomous agents that survive production.",
    summary:
      "Reliable agent architectures with memory, tool-calling, fallback strategies and evaluation, designed for real workloads, not a demo.",
    intro:
      "Most agent demos fall apart in production. We design agentic systems that hold: durable memory, dependable tool-calling, bounded reasoning loops, fallback strategies and continuous evaluation. The result is autonomy you can trust with real business processes.",
    entryPoint:
      "you want to hand a real process to an agent without losing control of it.",
    capabilities: [
      {
        title: "Agent architecture",
        description:
          "Explicit-state orchestration with retries and human-in-the-loop checkpoints.",
      },
      {
        title: "Memory & tools",
        description:
          "Reliable tool-calling contracts and memory that stays coherent over time.",
      },
      {
        title: "Reliability",
        description:
          "Fallbacks, circuit breakers and timeouts so one flaky tool doesn't sink the whole run.",
      },
      {
        title: "Agent evaluation",
        description:
          "Trajectory-level evaluation and monitoring to catch regressions before your users do.",
      },
    ],
  },
  {
    slug: "data-engineering",
    index: "04",
    title: "Data engineering & architecture",
    shortTitle: "Data",
    tagline: "Clean data and an architecture you can build on.",
    summary:
      "Reliable pipelines, modelling and data architecture your teams and your models can actually rely on.",
    intro:
      "An AI project is only as good as its data. We design and harden the foundations: ingestion, pipelines, modelling and data architecture, so your teams decide on accurate numbers and your models train and run on a healthy base.",
    entryPoint:
      "nobody in the company agrees on the number on the dashboard.",
    capabilities: [
      {
        title: "Data pipelines",
        description:
          "Reliable ingestion and transformations, replacing slow, fragile jobs with sustainable chains.",
      },
      {
        title: "Data architecture",
        description:
          "Modelling and organisation of data built for analytics, reporting and model training.",
      },
      {
        title: "Quality & freshness",
        description:
          "Quality and freshness checks so dashboards and models rely on up-to-date data.",
      },
      {
        title: "Performance",
        description:
          "Profiling and tuning to find and remove the real bottlenecks in your jobs.",
      },
    ],
  },
  {
    slug: "bare-metal",
    index: "05",
    title: "Bare metal & compute",
    shortTitle: "Bare metal",
    tagline: "Well-run hardware, for when the cloud costs more than it returns.",
    summary:
      "Dedicated servers, GPUs, storage and network: sizing and then actually running physical hardware for the heavy, steady workloads the cloud overcharges for.",
    intro:
      "The cloud is not always the answer, and neither is bare metal. On heavy, steady workloads — training, bulk processing, hot storage — the metered bill eventually passes the price of the hardware. We measure what you actually consume, size it, then run it: memory placement, network, disks, job scheduling. We operate both models, so we have no reason to push you towards either.",
    entryPoint:
      "you are paying metered cloud prices for a heavy, steady workload.",
    capabilities: [
      {
        title: "Sizing",
        description:
          "Measuring real consumption, then a costed decision between cloud, dedicated hosting and hardware you own.",
      },
      {
        title: "Systems operation",
        description:
          "NUMA placement, network and storage tuning, job scheduling — where the gap between hardware bought and hardware used is decided.",
      },
      {
        title: "GPU compute",
        description:
          "Sharing, queueing and occupancy tracking, so the cards work instead of waiting.",
      },
      {
        title: "Continuity",
        description:
          "Backups, failover and monitoring, so a hardware failure stays an incident rather than an outage.",
      },
    ],
  },
  {
    slug: "sovereignty",
    index: "06",
    title: "Sovereignty & portability",
    shortTitle: "Sovereignty",
    tagline: "Your data has no reason to cross the Atlantic.",
    summary:
      "We design and operate data and AI systems at European providers or on your own hardware: portable, quantifiable, and under your legal control.",
    intro:
      "Sovereignty is not a fallback option: it is an architectural property. Your data has no reason to cross the Atlantic. We design data and AI systems at European providers — OVHcloud, Scaleway, Hetzner — or on hardware you own. Not out of principle: because energy, law and cost structure all point that way, and because an open stack lets you leave whenever you want. Every choice is justified by a measurement or a legal constraint, not a promise.",
    entryPoint:
      "your data must not leave Europe, or you need to be able to walk away.",
    capabilities: [
      {
        title: "Jurisdiction & law",
        description:
          "The CLOUD Act and the Schrems II judgment: we choose providers and qualifications — SecNumCloud — that survive the question “who can be compelled?”.",
      },
      {
        title: "Technical portability",
        description:
          "Open formats and replaceable engines: Parquet, Iceberg, open-weight models, infrastructure-as-code. The exit cost stays quantifiable from day one.",
      },
      {
        title: "Energy & cost structure",
        description:
          "The kWh belongs in the architecture equation. We size accordingly and move heavy loads to the least expensive, least carbon-intensive hours.",
      },
      {
        title: "Lifecycle",
        description:
          "Backups, failover and recovery, on your hardware or at a European provider, to the same standard of rigour.",
      },
    ],
  },
];

const byLocale: Record<Locale, Expertise[]> = {
  fr: expertiseFr,
  en: expertiseEn,
};

/** All expertise entries for a locale (falls back to English). */
export function getExpertise(locale: Locale): Expertise[] {
  return byLocale[locale] ?? expertiseEn;
}

/** A single expertise entry by slug for a locale. */
export function getExpertiseItem(locale: Locale, slug: string): Expertise | undefined {
  return getExpertise(locale).find((e) => e.slug === slug);
}

/** Slugs are locale-independent; used by getStaticPaths. */
export const expertiseSlugs = expertiseEn.map((e) => e.slug);
