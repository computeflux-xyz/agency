/**
 * Deep copy for the /expertise/ai-engineering page.
 *
 * Same shape and same organism as the data-engineering page (see
 * `practiceContent.ts` and `PracticeDetail.astro`) — only the argument changes.
 * French-first, English mirror.
 *
 * The argument: we rarely train models, we build what surrounds them. So the
 * five stages are not "collect → train → deploy" (which would promise research
 * we do not sell) but the loop an AI feature actually lives in: the context it
 * retrieves, the prompt/model boundary, the evals that gate a release, the served
 * endpoint, the product people use.
 *
 * No invented measurements anywhere: the sketch draws topology, not data.
 */

import type { Locale } from "@i18n";
import type { PracticeContent, PracticeFlow } from "@data/practiceContent";

/* Stage ids are shared across locales; only the mono labels differ. The stencils
   in `PipelineSketch` are position-based, so the order carries meaning:
   sources of context → the model boundary → the gate → what serves it → the
   product surface. */
const flowFr: PracticeFlow = {
  nodes: [
    { id: "ctx", label: "Contexte", tone: "default" },
    { id: "mdl", label: "Modèle", tone: "fix" },
    { id: "evl", label: "Évals", tone: "fix" },
    { id: "srv", label: "Service", tone: "default" },
    { id: "prd", label: "Produit", tone: "default" },
  ],
  edges: [
    { from: "ctx", to: "mdl", label: "recherche" },
    { from: "mdl", to: "evl", label: "réponses" },
    { from: "evl", to: "srv", label: "mise en prod" },
    { from: "srv", to: "prd", label: "traces" },
  ],
};

const flowEn: PracticeFlow = {
  nodes: [
    { id: "ctx", label: "Context", tone: "default" },
    { id: "mdl", label: "Model", tone: "fix" },
    { id: "evl", label: "Evals", tone: "fix" },
    { id: "srv", label: "Serving", tone: "default" },
    { id: "prd", label: "Product", tone: "default" },
  ],
  edges: [
    { from: "ctx", to: "mdl", label: "retrieval" },
    { from: "mdl", to: "evl", label: "answers" },
    { from: "evl", to: "srv", label: "release" },
    { from: "srv", to: "prd", label: "traces" },
  ],
};

const aiFr: PracticeContent = {
  /* Le hero montre des animaux intelligents qui se servent d'outils — corbeau,
     chimpanzé, dauphin, éléphant. C'est exactement l'argument de la page :
     l'intelligence brute ne produit rien seule, ce sont les outils autour qui la
     rendent utile. Même chose pour un modèle. Deux phrases plutôt qu'une : la
     première pose la limite de l'outil, la seconde dit ce qu'on vend. */
  heroTitle: "Des systèmes qui résolvent des problèmes complexes.",
  /* Le verbe d'abord : ce qu'on construit, ce sont des systèmes intelligents —
     pas des prompts, pas des démos. Les quatre outils suivent, dans l'ordre où on
     les construit. La nuance « modèle ≠ produit » est le titre de la section juste
     en dessous, inutile de la dire deux fois ici. */
  heroLead:
    "Nous concevons des systèmes intelligents qui tiennent en production : contexte maîtrisé, évaluations, garde-fous, traces.",
  overviewEyebrow: "Vue d'ensemble",
  overviewTitle: "Le modèle n'est pas le produit.",
  overviewBullets: [
    "Recherche de contexte : découpage, index et reformulation, pour que le modèle réponde sur vos documents plutôt que de deviner.",
    "Évaluations avant mise en production : des jeux de cas qui font échouer une régression avant vos utilisateurs.",
    "Garde-fous et traces : sorties contraintes, refus explicites, et chaque appel rejouable quand quelqu'un demande pourquoi.",
    "Coûts sous contrôle : cache, routage entre modèles, et la mesure de ce que coûte réellement une requête.",
  ],
  overviewCta: "Bâtissons votre système IA",
  pipelineEyebrow: "Comment on construit",
  pipelineTitle: "La boucle d'une fonctionnalité d'IA.",
  pipelineLead:
    "Le contexte arrive, le modèle répond, les évaluations décident si ça sort, le service tient la charge, et le produit renvoie des traces qui alimentent la prochaine évaluation. C'est une boucle, pas une ligne droite.",
  flowAlt:
    "Diagramme : le contexte récupéré alimente le modèle, ses réponses passent des évaluations, la version validée est mise en service, et le produit renvoie des traces.",
  flowCaption: "Rien ne passe en production sans avoir franchi les évaluations.",
  flowLegendFix: "Notre intervention",
  flowLegendDefault: "La boucle",
  darkTitle: "Une évaluation vaut mieux qu'une intuition.",
  darkLead:
    "Un prompt qui « marche mieux » sans jeu de cas n'est pas une amélioration, c'est une opinion. Nous construisons l'évaluation d'abord : elle rend les changements comparables, et les régressions visibles avant la mise en production.",
  pipelineTools: [
    { name: "PyTorch", si: "Pytorch" },
    { name: "Hugging Face", si: "Huggingface" },
    { name: "vLLM", si: "Vllm" },
    { name: "LangChain", si: "Langchain" },
    { name: "Qdrant", si: "Qdrant" },
    { name: "Ollama", si: "Ollama" },
  ],
  stackLabel: "Ce sur quoi nous construisons",
  stackLead:
    "Des briques ouvertes et remplaçables : le modèle du jour changera, l'ingénierie autour doit lui survivre.",
  buildStack: [
    "PyTorch",
    "Hugging Face",
    "vLLM",
    "llama.cpp",
    "Ollama",
    "Qdrant",
    "pgvector",
    "LangChain",
    "LlamaIndex",
    "Ray",
    "MLflow",
    "OpenTelemetry",
    "Kubernetes",
  ],
  teamEyebrow: "L'équipe",
  teamTitle: "Des ingénieurs, pas des prompteurs.",
  teamLead:
    "Une petite équipe senior, entièrement à distance, qui lit les traces avant de changer un prompt.",
};

const aiEn: PracticeContent = {
  heroTitle: "Systems that solve complex problems.",
  heroLead:
    "We build intelligent systems that hold up in production: controlled context, evaluations, guardrails, traces.",
  overviewEyebrow: "Overview",
  overviewTitle: "The model is not the product.",
  overviewBullets: [
    "Context retrieval: chunking, indexing and query rewriting, so the model answers from your documents instead of guessing.",
    "Evaluations before release: case sets that fail a regression before your users do.",
    "Guardrails and traces: constrained outputs, explicit refusals, and every call replayable when someone asks why.",
    "Cost under control: caching, routing between models, and measuring what a request actually costs.",
  ],
  overviewCta: "Build your AI system",
  pipelineEyebrow: "How we build",
  pipelineTitle: "The loop an AI feature lives in.",
  pipelineLead:
    "Context comes in, the model answers, evaluations decide whether it ships, serving takes the load, and the product returns traces that feed the next evaluation. It is a loop, not a straight line.",
  flowAlt:
    "Diagram: retrieved context feeds the model, its answers pass evaluations, the approved version goes into serving, and the product returns traces.",
  flowCaption: "Nothing reaches production without clearing the evaluations.",
  flowLegendFix: "Our intervention",
  flowLegendDefault: "The loop",
  darkTitle: "An evaluation beats an intuition.",
  darkLead:
    "A prompt that \"works better\" with no case set behind it is not an improvement, it is an opinion. We build the evaluation first: it makes changes comparable and regressions visible before release.",
  pipelineTools: [
    { name: "PyTorch", si: "Pytorch" },
    { name: "Hugging Face", si: "Huggingface" },
    { name: "vLLM", si: "Vllm" },
    { name: "LangChain", si: "Langchain" },
    { name: "Qdrant", si: "Qdrant" },
    { name: "Ollama", si: "Ollama" },
  ],
  stackLabel: "What we build on",
  stackLead:
    "Open, replaceable pieces: today's best model will change, and the engineering around it has to outlive it.",
  buildStack: [
    "PyTorch",
    "Hugging Face",
    "vLLM",
    "llama.cpp",
    "Ollama",
    "Qdrant",
    "pgvector",
    "LangChain",
    "LlamaIndex",
    "Ray",
    "MLflow",
    "OpenTelemetry",
    "Kubernetes",
  ],
  teamEyebrow: "The team",
  teamTitle: "Engineers, not prompters.",
  teamLead: "A small, senior team, fully remote, that reads the traces before changing a prompt.",
};

const contentByLocale: Record<Locale, PracticeContent> = {
  fr: aiFr,
  en: aiEn,
};

const flowByLocale: Record<Locale, PracticeFlow> = {
  fr: flowFr,
  en: flowEn,
};

export function getAiEngineering(locale: Locale): {
  content: PracticeContent;
  flow: PracticeFlow;
} {
  return {
    content: contentByLocale[locale] ?? aiFr,
    flow: flowByLocale[locale] ?? flowFr,
  };
}
