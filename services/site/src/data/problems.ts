import type { Locale } from "@i18n";

export type Problem = {
  slug: string;
  n: string;
  title: string;
  body: string;
  tag: string;
  href: "/book" | string;
  booking: boolean;
};

const fr: Problem[] = [
  {
    slug: "poc",
    n: "01",
    title: "Lancer votre premier PoC data ou IA",
    body: "Un PoC qui reste une démo ne prouve rien. On le conçoit dès le départ pour être mesurable et prolongeable : données réelles, indicateurs définis, chemin défini vers la production.",
    tag: "Démarrer",
    href: "/book",
    booking: true,
  },
  {
    slug: "platform",
    n: "02",
    title: "Construire ou moderniser votre data platform",
    body: "Trop de fournisseurs s'arrêtent à l'outil. Nous livrons une plateforme que vos équipes utilisent vraiment : ingestion fiable, contrat de données, et une surface d'analyse cohérente.",
    tag: "Plateforme",
    href: "/expertise/data-engineering",
    booking: false,
  },
  {
    slug: "llm-prod",
    n: "03",
    title: "Mettre un LLM en production sans faire exploser la facture",
    body: "Le modèle n'est que le début. Évaluation, garde-fous, cache, routage et batching : on rend l'inférence fiable et bornée, avec une latence et un coût que vous maîtrisez.",
    tag: "Inférence",
    href: "/expertise/inference-optimization",
    booking: false,
  },
  {
    slug: "agents",
    n: "04",
    title: "Fiabiliser des agents autonomes pour de vrais processus",
    body: "Les démos d'agents ne survivent pas à la production. On borne les boucles, on rend les appels d'outils vérifiables, et on évalue des parcours entiers plutôt que des réponses isolées.",
    tag: "Agents",
    href: "/expertise/agentic-systems",
    booking: false,
  },
  {
    slug: "cloud-cost",
    n: "05",
    title: "Reprendre le contrôle de vos coûts cloud et GPU",
    body: "La facture à l'usage finit par dépasser le prix du matériel sur les charges lourdes. On mesure ce que vous consommez réellement, puis on arbitre : cloud, dédié, ou vos propres GPU.",
    tag: "Coûts",
    href: "/expertise/bare-metal",
    booking: false,
  },
  {
    slug: "sovereignty",
    n: "06",
    title: "Gagner en souveraineté sans sacrifier la vitesse",
    body: "Vos données n'ont aucune raison de traverser l'Atlantique. On conçoit des systèmes portables chez des hébergeurs européens ou sur votre matériel, sans ralentir votre déploiement.",
    tag: "Souveraineté",
    href: "/expertise/bare-metal",
    booking: false,
  },
];

const en: Problem[] = [
  {
    slug: "poc",
    n: "01",
    title: "Shipping your first data or AI PoC",
    body: "A PoC that stays a demo proves nothing. We design it from the start to be measurable and extendable: real data, defined metrics, a clear path to production.",
    tag: "Get started",
    href: "/book",
    booking: true,
  },
  {
    slug: "platform",
    n: "02",
    title: "Building or modernising your data platform",
    body: "Too many vendors stop at the tool. We deliver a platform your teams actually use: reliable ingestion, a data contract, and a coherent analytics surface.",
    tag: "Platform",
    href: "/expertise/data-engineering",
    booking: false,
  },
  {
    slug: "llm-prod",
    n: "03",
    title: "Putting an LLM in production without blowing the bill",
    body: "The model is only the start. Evaluation, guardrails, cache, routing and batching: we make inference reliable and bounded, with latency and cost you control.",
    tag: "Inference",
    href: "/expertise/inference-optimization",
    booking: false,
  },
  {
    slug: "agents",
    n: "04",
    title: "Making autonomous agents reliable for real processes",
    body: "Agent demos don't survive production. We bound the loops, make tool calls verifiable, and evaluate whole trajectories instead of isolated answers.",
    tag: "Agents",
    href: "/expertise/agentic-systems",
    booking: false,
  },
  {
    slug: "cloud-cost",
    n: "05",
    title: "Taking back control of your cloud and GPU costs",
    body: "The metered bill eventually passes the price of hardware on heavy loads. We measure what you actually consume, then arbitrate: cloud, dedicated, or your own GPUs.",
    tag: "Cost",
    href: "/expertise/bare-metal",
    booking: false,
  },
  {
    slug: "sovereignty",
    n: "06",
    title: "Gaining sovereignty without losing speed",
    body: "Your data has no reason to cross the Atlantic. We design portable systems at European providers or on your own hardware, without slowing your rollout.",
    tag: "Sovereignty",
    href: "/expertise/bare-metal",
    booking: false,
  },
];

const byLocale: Record<Locale, Problem[]> = { fr, en };

export function getProblems(locale: Locale): Problem[] {
  return byLocale[locale] ?? fr;
}
