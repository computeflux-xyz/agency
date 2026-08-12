import type { Locale } from "@i18n";
import type { PracticeContent, PracticeFlow } from "@data/practiceContent";

const flowFr: PracticeFlow = {
  nodes: [
    { id: "req", label: "Requêtes", tone: "default" },
    { id: "bat", label: "Batching", tone: "fix" },
    { id: "qal", label: "Qualité", tone: "fix" },
    { id: "cch", label: "Cache", tone: "default" },
    { id: "cst", label: "Coûts", tone: "default" },
  ],
  edges: [
    { from: "req", to: "bat", label: "charge" },
    { from: "bat", to: "qal", label: "réglages" },
    { from: "qal", to: "cch", label: "mise en service" },
    { from: "cch", to: "cst", label: "mesures" },
  ],
};

const flowEn: PracticeFlow = {
  nodes: [
    { id: "req", label: "Requests", tone: "default" },
    { id: "bat", label: "Batching", tone: "fix" },
    { id: "qal", label: "Quality", tone: "fix" },
    { id: "cch", label: "Cache", tone: "default" },
    { id: "cst", label: "Cost", tone: "default" },
  ],
  edges: [
    { from: "req", to: "bat", label: "load" },
    { from: "bat", to: "qal", label: "tuning" },
    { from: "qal", to: "cch", label: "release" },
    { from: "cch", to: "cst", label: "measurements" },
  ],
};

const ioFr: PracticeContent = {
  heroTitle: "Rien ne s'optimise avant d'être mesuré.",
  heroLead:
    "Quantification, batching continu, cache et décodage spéculatif : on fait baisser la latence de queue et la facture, avec un banc qui prouve que la qualité n'a pas bougé.",
  overviewEyebrow: "Vue d'ensemble",
  overviewTitle: "Un gain non mesuré n'est pas un gain.",
  overviewBullets: [
    "Un banc reproductible d'abord : latence médiane et de queue, débit, coût par requête, sur votre trafic, pas sur un classement public.",
    "Quantification et distillation, avec le jeu de qualité qui décide si ça sort. Une précision réduite qui dégrade les réponses n'est pas une optimisation.",
    "Architecture de service : batching continu, cache de préfixes et décodage spéculatif, réglés ensemble parce qu'ils interagissent.",
    "Chemin critique sur mesure quand le moteur générique ne suffit plus : là seulement, et avec la mesure qui le justifie.",
  ],
  overviewCta: "Faisons baisser votre facture d'inférence",
  pipelineEyebrow: "Comment on construit",
  pipelineTitle: "Le chemin d'une requête, et ce qu'on y règle.",
  pipelineLead:
    "La charge arrive, le batching décide de ce qui part ensemble, un jeu de qualité décide de ce qui sort, le cache absorbe ce qui se répète, et la mesure dit ce que ça coûte. Chaque réglage se juge sur le même banc.",
  flowAlt:
    "Diagramme : les requêtes entrantes passent par le batching, un jeu de qualité valide les réglages, le cache absorbe les répétitions, puis la latence et le coût sont mesurés.",
  flowCaption: "Un réglage qui ne passe pas le jeu de qualité ne sort pas.",
  flowLegendFix: "Notre intervention",
  flowLegendDefault: "Le chemin",
  darkTitle: "La latence de queue est celle qu'on ressent.",
  darkLead:
    "Une médiane flatteuse cache les requêtes qui font abandonner vos utilisateurs. On règle sur la latence de queue et sur le coût par requête, et on publie les deux avant et après, sinon il n'y a rien à comparer.",
  pipelineTools: [
    { name: "vLLM", si: "Vllm" },
    { name: "PyTorch", si: "Pytorch" },
    { name: "NVIDIA", si: "Nvidia" },
    { name: "Hugging Face", si: "Huggingface" },
    { name: "ONNX", si: "Onnx" },
    { name: "Grafana", si: "Grafana" },
  ],
  stackLabel: "Ce sur quoi nous construisons",
  stackLead:
    "Des moteurs remplaçables et un banc qui, lui, ne change pas : c'est le banc qui rend deux moteurs comparables.",
  buildStack: [
    "vLLM",
    "SGLang",
    "TensorRT-LLM",
    "llama.cpp",
    "ONNX Runtime",
    "PyTorch",
    "Triton",
    "CUDA",
    "GGUF / AWQ / GPTQ",
    "Rust",
    "Prometheus",
    "Grafana",
    "Kubernetes",
  ],
  teamEyebrow: "L'équipe",
  teamTitle: "Des gens qui mesurent avant de toucher.",
  teamLead:
    "Une petite équipe senior, entièrement à distance, qui instrumente d'abord et n'annonce un gain qu'une fois reproduit.",
};

const ioEn: PracticeContent = {
  heroTitle: "Nothing gets optimised before it is measured.",
  heroLead:
    "Quantization, continuous batching, caching and speculative decoding: we bring tail latency and the bill down, with a bench that proves quality did not move.",
  overviewEyebrow: "Overview",
  overviewTitle: "An unmeasured gain is not a gain.",
  overviewBullets: [
    "A reproducible bench first: median and tail latency, throughput, cost per request, on your traffic, not on a public leaderboard.",
    "Quantization and distillation, with the quality set deciding whether it ships. Reduced precision that degrades answers is not an optimisation.",
    "Serving architecture: continuous batching, prefix caching and speculative decoding, tuned together because they interact.",
    "A custom hot path when the generic engine is no longer enough: only then, and only with the measurement that justifies it.",
  ],
  overviewCta: "Bring your inference bill down",
  pipelineEyebrow: "How we build",
  pipelineTitle: "The path of a request, and what we tune on it.",
  pipelineLead:
    "Load arrives, batching decides what goes out together, a quality set decides what ships, the cache absorbs what repeats, and measurement says what it costs. Every change is judged on the same bench.",
  flowAlt:
    "Diagram: incoming requests pass through batching, a quality set validates the tuning, the cache absorbs repetition, then latency and cost are measured.",
  flowCaption: "A change that fails the quality set does not ship.",
  flowLegendFix: "Our intervention",
  flowLegendDefault: "The path",
  darkTitle: "Tail latency is the one people feel.",
  darkLead:
    "A flattering median hides the requests that make your users give up. We tune on tail latency and cost per request, and we publish both before and after, otherwise there is nothing to compare.",
  pipelineTools: [
    { name: "vLLM", si: "Vllm" },
    { name: "PyTorch", si: "Pytorch" },
    { name: "NVIDIA", si: "Nvidia" },
    { name: "Hugging Face", si: "Huggingface" },
    { name: "ONNX", si: "Onnx" },
    { name: "Grafana", si: "Grafana" },
  ],
  stackLabel: "What we build on",
  stackLead:
    "Replaceable engines and one bench that does not change: the bench is what makes two engines comparable.",
  buildStack: [
    "vLLM",
    "SGLang",
    "TensorRT-LLM",
    "llama.cpp",
    "ONNX Runtime",
    "PyTorch",
    "Triton",
    "CUDA",
    "GGUF / AWQ / GPTQ",
    "Rust",
    "Prometheus",
    "Grafana",
    "Kubernetes",
  ],
  teamEyebrow: "The team",
  teamTitle: "People who measure before touching.",
  teamLead:
    "A small, senior team, fully remote, that instruments first and only claims a gain once it reproduces.",
};

const contentByLocale: Record<Locale, PracticeContent> = {
  fr: ioFr,
  en: ioEn,
};

const flowByLocale: Record<Locale, PracticeFlow> = {
  fr: flowFr,
  en: flowEn,
};

export function getInferenceOptimization(locale: Locale): {
  content: PracticeContent;
  flow: PracticeFlow;
} {
  return {
    content: contentByLocale[locale] ?? ioFr,
    flow: flowByLocale[locale] ?? flowFr,
  };
}
