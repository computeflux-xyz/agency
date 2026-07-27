import type { Locale } from "@i18n";

export type Job = {
  slug: string;
  title: string;
  team: string;
  location: string;
  type: string;
  remote: boolean;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  datePosted: string;
};

const jobsFr: Job[] = [
  {
    slug: "ingenieur-ia-inference",
    title: "Ingénieur IA senior, inférence & performance",
    team: "Ingénierie",
    location: "Télétravail (France / UE)",
    type: "CDI / mission",
    remote: true,
    datePosted: "2026-01-15",
    summary:
      "Prendre en charge la partie difficile : rendre de gros modèles rapides et sobres en production. Vous livrez des optimisations de service, de batching et de cache qui font bouger la latence et le coût réels.",
    responsibilities: [
      "Concevoir et mettre en œuvre des optimisations d'inférence sur le service, le batching et le cache.",
      "Écrire des composants critiques taillés pour la performance.",
      "Construire des benchmarks reproductibles qui prouvent les gains de coût et de latence.",
      "Accompagner les équipes clientes du prototype à la production.",
    ],
    requirements: [
      "Solide expérience des systèmes haute performance.",
      "Pratique du service de modèles de langage en production.",
      "Un historique d'améliorations mesurables de latence ou de coût.",
      "À l'aise pour prendre en charge des problèmes ambigus de bout en bout.",
    ],
  },
  {
    slug: "ingenieur-ia-agents",
    title: "Ingénieur IA senior, systèmes agentiques",
    team: "Ingénierie",
    location: "Télétravail (France / UE)",
    type: "CDI / mission",
    remote: true,
    datePosted: "2026-01-15",
    summary:
      "Construire des systèmes d'agents qui survivent vraiment à la production : mémoire durable, appel d'outils fiable et évaluation qui attrape les régressions avant les utilisateurs.",
    responsibilities: [
      "Architecturer une orchestration d'agents à état explicite avec stratégies de repli.",
      "Concevoir l'évaluation et l'observabilité des parcours d'agents.",
      "Mettre en œuvre les patterns de fiabilité : reprises, coupe-circuits, délais d'attente.",
      "Contribuer à une infrastructure d'agents réutilisable entre les missions.",
    ],
    requirements: [
      "Bonne maîtrise d'un langage d'orchestration et d'un langage système.",
      "Expérience de mise en production de fonctionnalités IA ou d'agents.",
      "Rigueur sur l'évaluation, l'observabilité et la fiabilité.",
      "Communication écrite claire dans une équipe en télétravail.",
    ],
  },
];

const jobsEn: Job[] = [
  {
    slug: "ingenieur-ia-inference",
    title: "Senior AI Engineer, Inference & Performance",
    team: "Engineering",
    location: "Remote (France / EU)",
    type: "Permanent / contract",
    remote: true,
    datePosted: "2026-01-15",
    summary:
      "Own the hard part: making large models fast and frugal in production. You'll ship serving, batching and caching optimizations that move real latency and cost numbers.",
    responsibilities: [
      "Design and implement inference optimizations across serving, batching and caching.",
      "Write performance-critical components.",
      "Build reproducible benchmarks that prove cost and latency gains.",
      "Support client teams from prototype to production.",
    ],
    requirements: [
      "Strong experience with high-performance systems.",
      "Hands-on with serving language models in production.",
      "A track record of measurable latency or cost improvements.",
      "Comfortable owning ambiguous problems end to end.",
    ],
  },
  {
    slug: "ingenieur-ia-agents",
    title: "Senior AI Engineer, Agentic Systems",
    team: "Engineering",
    location: "Remote (France / EU)",
    type: "Permanent / contract",
    remote: true,
    datePosted: "2026-01-15",
    summary:
      "Build agent systems that actually survive production: durable memory, reliable tool-calling and evaluation that catches regressions before users do.",
    responsibilities: [
      "Architect explicit-state agent orchestration with fallback strategies.",
      "Design evaluation and observability for agent trajectories.",
      "Implement reliability patterns: retries, circuit breakers, timeouts.",
      "Contribute reusable agent infrastructure across engagements.",
    ],
    requirements: [
      "Solid command of an orchestration language and a systems language.",
      "Experience shipping AI or agent features to production.",
      "Rigorous about evaluation, observability and reliability.",
      "Clear written communicator in a remote team.",
    ],
  },
];

const byLocale: Record<Locale, Job[]> = { fr: jobsFr, en: jobsEn };

/** All jobs for a locale (falls back to English). */
export function getJobs(locale: Locale): Job[] {
  return byLocale[locale] ?? jobsEn;
}

/** A single job by slug for a locale. */
export function getJob(locale: Locale, slug: string): Job | undefined {
  return getJobs(locale).find((j) => j.slug === slug);
}

/** Slugs are locale-independent; used by getStaticPaths. */
export const jobSlugs = jobsEn.map((j) => j.slug);
