/**
 * Deep copy for the /expertise/agentic-systems page.
 *
 * Same shape and same organism as the other full practice pages (see
 * `practiceContent.ts` and `PracticeDetail.astro`) — only the argument changes.
 * French-first, English mirror.
 *
 * The argument: autonomy is not the feature, being able to stop is. A demo agent
 * has no bound, no contract on its tool calls and no way back for a human; all
 * three are exactly what production asks for first. So the five stages are the
 * anatomy of ONE run — the request, the bounded loop, the guardrail every tool
 * call passes, the state that is kept, the trajectory you can read afterwards.
 *
 * No invented measurements anywhere: the sketch draws topology, not data.
 */

import type { Locale } from "@i18n";
import type { PracticeContent, PracticeFlow } from "@data/practiceContent";

/* Stage ids are shared across locales; only the mono labels differ. The stencils
   in `PipelineSketch` are position-based, so the order carries meaning: what
   comes in → the bounded loop we own → the gate no tool call skips → the durable
   store → the surface a human reads. */
const flowFr: PracticeFlow = {
  nodes: [
    { id: "req", label: "Demandes", tone: "default" },
    { id: "lop", label: "Boucle", tone: "fix" },
    { id: "grd", label: "Garde-fous", tone: "fix" },
    { id: "mem", label: "Mémoire", tone: "default" },
    { id: "trc", label: "Traces", tone: "default" },
  ],
  edges: [
    { from: "req", to: "lop", label: "plan" },
    { from: "lop", to: "grd", label: "appels d'outils" },
    { from: "grd", to: "mem", label: "état validé" },
    { from: "mem", to: "trc", label: "parcours" },
  ],
};

const flowEn: PracticeFlow = {
  nodes: [
    { id: "req", label: "Requests", tone: "default" },
    { id: "lop", label: "Loop", tone: "fix" },
    { id: "grd", label: "Guardrails", tone: "fix" },
    { id: "mem", label: "Memory", tone: "default" },
    { id: "trc", label: "Traces", tone: "default" },
  ],
  edges: [
    { from: "req", to: "lop", label: "plan" },
    { from: "lop", to: "grd", label: "tool calls" },
    { from: "grd", to: "mem", label: "checked state" },
    { from: "mem", to: "trc", label: "trajectories" },
  ],
};

const agFr: PracticeContent = {
  /* Le hero montre de l'autonomie sous surveillance : une cellule qui travaille
     seule, un relais quand un bras lâche, une main au-dessus de l'arrêt, un
     troupeau qui se retourne au sifflet. Le titre reprend exactement ça — ce
     qu'on vend n'est pas l'autonomie, c'est l'autonomie qu'on peut arrêter. */
  heroTitle: "De l'autonomie qu'on peut arrêter.",
  /* Espace insécable avant le deux-points : sans elle, `text-balance` le rejette
     en début de ligne dans le hero. */
  heroLead:
    "Boucles bornées, appels d'outils sous contrat, reprises et points d'arrêt : des agents à qui confier un vrai processus, et que vous gardez sous la main.",
  overviewEyebrow: "Vue d'ensemble",
  /* Le pendant de « Le modèle n'est pas le produit » sur la page IA. */
  overviewTitle: "Une démo n'est pas un système.",
  overviewBullets: [
    "Boucle bornée : un nombre d'étapes, un budget et un état explicite. Un agent qui ne sait pas s'arrêter n'est pas autonome, il est en fuite.",
    "Appels d'outils sous contrat : schémas d'entrée et de sortie validés, erreurs typées, réessais idempotents. C'est là que la plupart des agents cassent.",
    "Reprise et points d'arrêt : coupe-circuits, délais d'attente, et un endroit précis où un humain reprend la main sans tout rejouer.",
    "Évaluation au niveau du parcours : on juge la trajectoire complète, pas la dernière réponse, et chaque exécution reste rejouable.",
  ],
  overviewCta: "Cadrons votre système d'agents",
  pipelineEyebrow: "Comment on construit",
  pipelineTitle: "Ce qu'une exécution traverse.",
  pipelineLead:
    "Une demande devient un plan, le plan appelle des outils, chaque appel passe des garde-fous, l'état validé va en mémoire, et la trajectoire complète reste lisible après coup. La boucle est bornée à chaque tour.",
  flowAlt:
    "Diagramme : une demande produit un plan, le plan déclenche des appels d'outils, les garde-fous valident chaque appel, l'état validé est retenu en mémoire, et la trajectoire complète est consultable.",
  flowCaption: "Aucun appel d'outil ne sort sans être validé.",
  flowLegendFix: "Notre intervention",
  flowLegendDefault: "L'exécution",
  darkTitle: "Un agent doit pouvoir échouer proprement.",
  darkLead:
    "Un outil qui tombe, une sortie hors format, une boucle qui s'emballe : ces trois cas arrivent en production, pas en démo. On les traite comme des chemins nominaux — repli, coupe-circuit, arrêt net — plutôt que comme des exceptions qu'on découvrira plus tard.",
  pipelineTools: [
    { name: "LangChain", si: "Langchain" },
    { name: "Temporal", si: "" },
    { name: "Ray", si: "Ray" },
    { name: "Redis", si: "Redis" },
    { name: "PostgreSQL", si: "Postgresql" },
    { name: "OpenTelemetry", si: "Opentelemetry" },
  ],
  stackLabel: "Ce sur quoi nous construisons",
  stackLead:
    "Un orchestrateur, un état durable, une trace : le framework d'agents du moment changera, ces trois-là doivent lui survivre.",
  buildStack: [
    "LangGraph",
    "LangChain",
    "Temporal",
    "Ray",
    "MCP",
    "PostgreSQL",
    "Redis",
    "Qdrant",
    "pgvector",
    "OpenTelemetry",
    "Pydantic",
    "Kubernetes",
  ],
  teamEyebrow: "L'équipe",
  teamTitle: "Des ingénieurs systèmes, pas des scénaristes.",
  teamLead:
    "Une petite équipe senior, entièrement à distance, qui traite un agent comme un système distribué : état, pannes, reprises.",
};

const agEn: PracticeContent = {
  heroTitle: "Autonomy you can stop.",
  heroLead:
    "Bounded loops, tool calls under contract, retries and stop points: agents you can hand a real process to, and still keep within reach.",
  overviewEyebrow: "Overview",
  overviewTitle: "A demo is not a system.",
  overviewBullets: [
    "A bounded loop: a step count, a budget and explicit state. An agent that cannot stop is not autonomous, it is loose.",
    "Tool calls under contract: validated input and output schemas, typed errors, idempotent retries. This is where most agents break.",
    "Recovery and stop points: circuit breakers, timeouts, and a precise place where a human takes over without replaying everything.",
    "Trajectory-level evaluation: we judge the whole run, not the last answer, and every run stays replayable.",
  ],
  overviewCta: "Scope your agent system",
  pipelineEyebrow: "How we build",
  pipelineTitle: "What one run goes through.",
  pipelineLead:
    "A request becomes a plan, the plan calls tools, every call clears the guardrails, checked state goes to memory, and the whole trajectory stays readable afterwards. The loop is bounded on every turn.",
  flowAlt:
    "Diagram: a request produces a plan, the plan triggers tool calls, guardrails validate each call, checked state is kept in memory, and the whole trajectory can be read back.",
  flowCaption: "No tool call leaves without being validated.",
  flowLegendFix: "Our intervention",
  flowLegendDefault: "The run",
  darkTitle: "An agent has to be able to fail cleanly.",
  darkLead:
    "A tool that goes down, an output off-schema, a loop that runs away: all three happen in production, not in the demo. We treat them as normal paths — fallback, circuit breaker, hard stop — rather than as exceptions to be discovered later.",
  pipelineTools: [
    { name: "LangChain", si: "Langchain" },
    { name: "Temporal", si: "" },
    { name: "Ray", si: "Ray" },
    { name: "Redis", si: "Redis" },
    { name: "PostgreSQL", si: "Postgresql" },
    { name: "OpenTelemetry", si: "Opentelemetry" },
  ],
  stackLabel: "What we build on",
  stackLead:
    "An orchestrator, durable state, a trace: this season's agent framework will change, those three have to outlive it.",
  buildStack: [
    "LangGraph",
    "LangChain",
    "Temporal",
    "Ray",
    "MCP",
    "PostgreSQL",
    "Redis",
    "Qdrant",
    "pgvector",
    "OpenTelemetry",
    "Pydantic",
    "Kubernetes",
  ],
  teamEyebrow: "The team",
  teamTitle: "Systems engineers, not scriptwriters.",
  teamLead:
    "A small, senior team, fully remote, that treats an agent as a distributed system: state, failures, recovery.",
};

const contentByLocale: Record<Locale, PracticeContent> = {
  fr: agFr,
  en: agEn,
};

const flowByLocale: Record<Locale, PracticeFlow> = {
  fr: flowFr,
  en: flowEn,
};

export function getAgenticSystems(locale: Locale): {
  content: PracticeContent;
  flow: PracticeFlow;
} {
  return {
    content: contentByLocale[locale] ?? agFr,
    flow: flowByLocale[locale] ?? flowFr,
  };
}
