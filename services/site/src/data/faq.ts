import type { Locale } from "@i18n";

export type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

/** Category labels are locale-aware; the array is used to group + order. */
export function getFaqCategories(locale: Locale): string[] {
  return locale === "fr"
    ? ["Travailler avec nous", "Missions & tarifs", "Technique", "Carrières"]
    : ["Working with us", "Engagements & pricing", "Technology", "Careers"];
}

const faqFr: FaqItem[] = [
  {
    category: "Travailler avec nous",
    question: "Quel genre d'entreprise est Computeflux ?",
    answer:
      "Computeflux est un studio d'ingénierie de données de données bordelais. Nous mettons l'IA et les systèmes de données en production, de façon fiable : inférence, agents, pipelines de données. Nous livrons des systèmes qui tiennent, pas des démos.",
  },
  {
    category: "Travailler avec nous",
    question: "Avec qui travaillez-vous en général ?",
    answer:
      "Des entreprises qui mettent l'IA ou leurs données en production et qui se soucient de fiabilité, de latence et de coût. Nous travaillons à distance, avec des lancements ponctuels sur site, aux côtés de vos équipes tech, data et produit.",
  },
  {
    category: "Travailler avec nous",
    question: "Comment démarre-t-on un projet ?",
    answer:
      "Réservez un appel d'introduction. On cadre le problème, on s'accorde sur un résultat clair et on propose une mission, souvent un court audit ou un développement ciblé, pour que vous voyiez de la valeur vite avant d'aller plus loin.",
  },
  {
    category: "Missions & tarifs",
    question: "Quelles formes de mission proposez-vous ?",
    answer:
      "Trois formes principales : (1) le cadrage, une plongée à périmètre fixe avec des recommandations concrètes ; (2) le développement, où l'on conçoit et livre un système ou un composant ; (3) le renfort d'équipe, une capacité d'ingénierie senior intégrée à votre équipe sur une période donnée.",
  },
  {
    category: "Missions & tarifs",
    question: "Comment sont fixés les tarifs ?",
    answer:
      "Le cadrage est à prix fixe. Le développement se fait par jalons. Le renfort se facture à la journée. On est transparents sur le périmètre et on ne facture jamais de surprise : tout changement de périmètre est validé avant de commencer.",
  },
  {
    category: "Missions & tarifs",
    question: "Signez-vous des NDA et travaillez-vous sous nos conditions de PI ?",
    answer:
      "Oui. On travaille régulièrement sous NDA et on cède au client toute la propriété intellectuelle livrée. Les cas clients sont toujours anonymisés et publiés uniquement avec un accord explicite.",
  },
  {
    category: "Technique",
    question: "Entraînez-vous des modèles de fondation ?",
    answer:
      "Rarement. Notre métier, c'est l'ingénierie autour du modèle : recherche, évaluation, mise en service, optimisation et sécurité, pour faire tourner des modèles de façon fiable et sobre en production. On fait du fine-tuning ou de la distillation quand c'est le bon outil, mais on ne vend pas l'entraînement de modèles comme service phare.",
  },
  {
    category: "Technique",
    question: "À quoi ressemble votre approche technique ?",
    answer:
      "On choisit les outils pour le problème, pas pour la mode. Des langages robustes pour l'orchestration, des composants taillés pour la performance là où la latence et la mémoire comptent, des moteurs d'inférence éprouvés pour le service, et de l'observabilité et de l'évaluation de bout en bout.",
  },
  {
    category: "Technique",
    question: "Pouvez-vous vraiment faire baisser nos coûts d'inférence ?",
    answer:
      "Souvent, oui. On agit sur la quantification, l'architecture de service, le cache et des composants sur mesure. On mesure avant et après, pour que les économies soient prouvées et non affirmées.",
  },
  {
    category: "Carrières",
    question: "Recrutez-vous ?",
    answer:
      "On grandit avec prudence. Si vous êtes un ingénieur senior qui aime la performance, la donnée ou les problèmes d'IA en production, on serait ravis d'échanger. Voyez notre page Carrières et candidatez directement : pas d'ATS, pas de silence radio.",
  },
  {
    category: "Carrières",
    question: "Travaillez-vous entièrement à distance ?",
    answer:
      "Oui. On est en télétravail, basés en France, avec des sessions ponctuelles en présentiel. On privilégie le travail en profondeur et la collaboration asynchrone.",
  },
];

const faqEn: FaqItem[] = [
  {
    category: "Working with us",
    question: "What kind of company is Computeflux?",
    answer:
      "Computeflux is a French engineering studio. We put AI and data systems into production, reliably: inference, agents, data pipelines. We deliver systems that hold up, not demos.",
  },
  {
    category: "Working with us",
    question: "Who do you typically work with?",
    answer:
      "Companies putting AI or their data into production that care about reliability, latency and cost. We work remotely, with occasional on-site kick-offs, alongside your engineering, data and product teams.",
  },
  {
    category: "Working with us",
    question: "How do we start a project?",
    answer:
      "Book an introductory call. We scope the problem, agree on a clear outcome and propose an engagement, usually a short audit or a focused build, so you see value quickly before committing further.",
  },
  {
    category: "Engagements & pricing",
    question: "What engagement models do you offer?",
    answer:
      "Three main shapes: (1) scoping, a fixed-scope deep dive with concrete recommendations; (2) build, where we design and ship a system or component; (3) team embed, senior engineering capacity plugged into your team for a defined period.",
  },
  {
    category: "Engagements & pricing",
    question: "How is pricing structured?",
    answer:
      "Scoping is fixed-price. Builds are milestone-based. Embeds are billed per day. We're transparent about scope and never bill for surprises: any change in scope is agreed before work starts.",
  },
  {
    category: "Engagements & pricing",
    question: "Do you sign NDAs and work under our IP terms?",
    answer:
      "Yes. We routinely work under NDA and assign all delivered IP to the client. Case studies are always anonymized and only published with explicit consent.",
  },
  {
    category: "Technology",
    question: "Do you train foundation models?",
    answer:
      "Rarely. Our focus is the engineering around the model: retrieval, evaluation, serving, optimization and safety, to run models reliably and cheaply in production. We fine-tune or distill where it's the right tool, but we don't sell model training as a headline service.",
  },
  {
    category: "Technology",
    question: "What does your approach look like?",
    answer:
      "We choose tools for the problem, not for fashion. Robust languages for orchestration, components built for performance where latency and memory matter, proven inference engines for serving, and observability and evaluation end to end.",
  },
  {
    category: "Technology",
    question: "Can you really bring our inference costs down?",
    answer:
      "Often, yes. We work on quantization, serving architecture, caching and custom components. We measure before and after, so savings are proven, not asserted.",
  },
  {
    category: "Careers",
    question: "Are you hiring?",
    answer:
      "We grow deliberately. If you're a senior engineer who loves performance, data or hard AI-in-production problems, we'd like to hear from you. See our Careers page and apply directly: no ATS, no ghosting.",
  },
  {
    category: "Careers",
    question: "Do you work fully remote?",
    answer:
      "Yes. We're remote, based in France, with occasional in-person sessions. We optimize for deep work and asynchronous collaboration.",
  },
];

const byLocale: Record<Locale, FaqItem[]> = { fr: faqFr, en: faqEn };

export function getFaq(locale: Locale): FaqItem[] {
  return byLocale[locale] ?? faqEn;
}
