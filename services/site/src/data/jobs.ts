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

export const jobs: Job[] = [
  {
    slug: "staff-ai-engineer-inference",
    title: "Staff AI Engineer — Inference & Performance",
    team: "Engineering",
    location: "Remote (EU)",
    type: "Full-time / Contract",
    remote: true,
    datePosted: "2026-01-15",
    summary:
      "Own the hard parts of making large models cheap and fast in production. You'll ship quantization, custom kernels and serving architecture that move real latency and cost numbers.",
    responsibilities: [
      "Design and implement inference optimizations across serving, batching and caching.",
      "Write performance-critical components in Rust, Zig or CUDA.",
      "Build reproducible benchmarks that prove cost and latency gains.",
      "Partner with client teams to take optimizations from prototype to production.",
    ],
    requirements: [
      "Deep experience with high-performance systems (Rust/Zig/C++/Go).",
      "Hands-on with LLM serving (vLLM, TensorRT-LLM or similar).",
      "A track record of measurable latency/cost improvements.",
      "Comfortable owning ambiguous problems end to end.",
    ],
  },
  {
    slug: "senior-ai-engineer-agentic",
    title: "Senior AI Engineer — Agentic Systems",
    team: "Engineering",
    location: "Remote (EU)",
    type: "Full-time / Contract",
    remote: true,
    datePosted: "2026-01-15",
    summary:
      "Build agent systems that actually survive production — durable memory, reliable tool-calling and evaluation that catches regressions before users do.",
    responsibilities: [
      "Architect graph-based agent orchestration with explicit state and fallbacks.",
      "Design evaluation and observability for agent trajectories.",
      "Implement reliability patterns: retries, circuit breakers, timeouts.",
      "Contribute reusable agent infrastructure across engagements.",
    ],
    requirements: [
      "Strong Python plus one systems language (Go/Rust).",
      "Experience shipping LLM/agent features to production.",
      "Rigorous about evaluation, observability and reliability.",
      "Clear written communicator in a remote-first team.",
    ],
  },
];

export function getJob(slug: string): Job | undefined {
  return jobs.find((j) => j.slug === slug);
}
