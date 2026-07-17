/**
 * Expertise / service lines. Powers the /expertise landing, the satellite
 * /expertise/[slug] pages, homepage grid and mega-menu.
 */

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
  capabilities: Capability[];
  stack: string[];
  /** Representative, defensible outcome metric. */
  outcome: { value: string; label: string };
};

export const expertise: Expertise[] = [
  {
    slug: "ai-engineering",
    index: "01",
    title: "AI Engineering",
    shortTitle: "AI Engineering",
    tagline: "The factory that runs LLMs and agents in production.",
    summary:
      "We build the reliable, observable and cost-controlled infrastructure that turns models into products — RAG, evaluation, routing, guardrails and everything in between.",
    intro:
      "AI Engineering is the discipline of putting LLM- and agent-based systems into production reliably, at scale and within budget. We rarely train models; we build the factory around them — ingestion, retrieval, evaluation, observability, cost governance and safety — so your team ships AI features that hold up under real traffic.",
    capabilities: [
      {
        title: "Advanced RAG",
        description:
          "HyDE, CRAG, Self-RAG and Graph-RAG patterns over high-performance vector stores, tuned for recall and latency.",
      },
      {
        title: "Evaluation & observability",
        description:
          "Automated eval harnesses, tracing and regression gates so quality is measurable, not vibes.",
      },
      {
        title: "Cost & token governance",
        description:
          "Model routing, caching and budgets that keep inference spend predictable as usage grows.",
      },
      {
        title: "Safety & guardrails",
        description:
          "Prompt-injection defense, output validation and PII controls enforced at the system boundary.",
      },
    ],
    stack: ["Python", "TypeScript", "vLLM", "LangGraph", "Qdrant", "LangFuse"],
    outcome: { value: "99.9%", label: "eval-gated release confidence" },
  },
  {
    slug: "inference-optimization",
    index: "02",
    title: "Inference Optimization",
    shortTitle: "Inference",
    tagline: "Lower latency. Lower cost. Same or better quality.",
    summary:
      "Quantization, speculative decoding, custom kernels and serving architecture that typically cut inference cost by 40–70% while improving tail latency.",
    intro:
      "Inference is the single largest line item in most AI budgets. We attack it from every angle — quantization, distillation, speculative decoding, batching strategy, KV-cache management and custom GPU/CPU kernels — to drive down cost and tail latency without sacrificing output quality.",
    capabilities: [
      {
        title: "Quantization & distillation",
        description:
          "INT8/FP8 and structured distillation with rigorous quality benchmarking before anything ships.",
      },
      {
        title: "Serving architecture",
        description:
          "Continuous batching, KV-cache tuning and speculative decoding on vLLM / TensorRT-LLM.",
      },
      {
        title: "Custom kernels",
        description:
          "Rust, Zig and CUDA components for the hot path — tokenizers, samplers, caches, rate limiters.",
      },
      {
        title: "Benchmarking",
        description:
          "Reproducible latency/cost/quality benchmarks so gains are proven, not promised.",
      },
    ],
    stack: ["Rust", "CUDA", "vLLM", "TensorRT-LLM", "Triton", "Zig"],
    outcome: { value: "40–70%", label: "typical inference cost reduction" },
  },
  {
    slug: "agentic-systems",
    index: "03",
    title: "Agentic Systems",
    shortTitle: "Agentic",
    tagline: "Autonomous agents that survive contact with production.",
    summary:
      "Reliable agent architectures with memory, tool-calling, fallback strategies and evaluation — designed for real workloads, not demos.",
    intro:
      "Most agent demos fall apart in production. We design agentic systems that don't: durable memory, dependable tool-calling, bounded reasoning loops, fallback strategies and continuous evaluation. The result is autonomy you can actually trust with real business processes.",
    capabilities: [
      {
        title: "Agent architecture",
        description:
          "Graph-based orchestration with explicit state, retries and human-in-the-loop checkpoints.",
      },
      {
        title: "Memory & tools",
        description:
          "Reliable tool-calling contracts and memory management that stays coherent over long horizons.",
      },
      {
        title: "Reliability engineering",
        description:
          "Fallbacks, circuit breakers and timeouts so a single flaky tool doesn't sink the run.",
      },
      {
        title: "Agent evaluation",
        description:
          "Trajectory-level evaluation and monitoring to catch quality regressions before users do.",
      },
    ],
    stack: ["Python", "LangGraph", "Go", "Temporal", "LangFuse", "Rust"],
    outcome: { value: "10×", label: "fewer production incidents vs. naive agents" },
  },
  {
    slug: "systems-programming",
    index: "04",
    title: "Systems Programming",
    shortTitle: "Systems",
    tagline: "Low-level performance and safety for the critical path.",
    summary:
      "When milliseconds and memory matter, we drop to Rust, Zig, Go and C++ to build the fast, safe components your platform depends on.",
    intro:
      "Some problems can't be solved in a scripting language. When throughput, latency or memory safety are non-negotiable, we build in Rust, Zig, Go and C++ — data pipelines, inference servers, caches, network services and embedded components engineered for performance and correctness.",
    capabilities: [
      {
        title: "High-throughput pipelines",
        description:
          "Replace slow Python/Spark stages with Rust/Go pipelines for order-of-magnitude speedups.",
      },
      {
        title: "Low-latency services",
        description:
          "Network and serving components tuned for predictable p99 under heavy concurrency.",
      },
      {
        title: "Memory safety",
        description:
          "Rust/Zig sandboxing and safe FFI for security-sensitive and resource-constrained workloads.",
      },
      {
        title: "Profiling & tuning",
        description:
          "Deep profiling — CPU, memory, cache, syscalls — to find and remove the real bottlenecks.",
      },
    ],
    stack: ["Rust", "Zig", "Go", "C++", "Kubernetes", "eBPF"],
    outcome: { value: "p99", label: "latency engineered, not hoped for" },
  },
];

export function getExpertise(slug: string): Expertise | undefined {
  return expertise.find((e) => e.slug === slug);
}
