export type FaqItem = {
  question: string;
  answer: string;
  category: string;
};

export const faqCategories = [
  "Working with us",
  "Engagements & pricing",
  "Technology",
  "Careers",
] as const;

export const faqs: FaqItem[] = [
  {
    category: "Working with us",
    question: "What kind of company is Computeflux?",
    answer:
      "Computeflux is a deep tech research & development studio. We specialize in high-complexity software and AI systems — inference optimization, agentic architectures and low-level systems programming — delivering reliable, production-grade solutions rather than demos.",
  },
  {
    category: "Working with us",
    question: "Who do you typically work with?",
    answer:
      "Scale-ups and larger organizations that are putting AI into production and care about reliability, latency and cost. We work fully remote with occasional on-site kick-offs, and partner with engineering, data and platform teams.",
  },
  {
    category: "Working with us",
    question: "How do we start a project?",
    answer:
      "Book an introductory call. We scope the problem, agree on a clear outcome and propose an engagement — usually starting with a short audit or a focused build so you see value quickly before committing further.",
  },
  {
    category: "Engagements & pricing",
    question: "What engagement models do you offer?",
    answer:
      "Three main shapes: (1) Audits & roadmaps — a fixed-scope deep dive with concrete recommendations; (2) Builds — we design and ship a system or component; (3) Staff-level embed — senior/principal engineering capacity plugged into your team for a defined period.",
  },
  {
    category: "Engagements & pricing",
    question: "How is pricing structured?",
    answer:
      "Audits are fixed-price. Builds are milestone-based. Embeds are billed per day. We're transparent about scope and never bill for surprises — any change in scope is agreed before work starts.",
  },
  {
    category: "Engagements & pricing",
    question: "Do you sign NDAs and work under our IP terms?",
    answer:
      "Yes. We routinely work under NDA and assign all delivered IP to the client. Case studies are always anonymized and only published with explicit permission.",
  },
  {
    category: "Technology",
    question: "Do you train foundation models?",
    answer:
      "Rarely. Our focus is AI engineering — the infrastructure that runs models reliably and cheaply in production: retrieval, evaluation, serving, optimization and safety. We fine-tune and distill where it's the right tool, but we don't sell model training as a headline service.",
  },
  {
    category: "Technology",
    question: "What does your stack look like?",
    answer:
      "Python and TypeScript for application and orchestration layers; Rust, Zig, Go and C++ for performance-critical components; vLLM / TensorRT-LLM for serving; and modern observability and evaluation tooling throughout. We choose tools for the problem, not for fashion.",
  },
  {
    category: "Technology",
    question: "Can you really cut our inference costs?",
    answer:
      "In most cases, yes — 40–70% reductions are common through quantization, better serving architecture, caching and custom kernels. We always benchmark before and after so the savings are measured, not asserted.",
  },
  {
    category: "Careers",
    question: "Are you hiring?",
    answer:
      "We grow deliberately. If you're a senior/staff engineer who loves performance, systems programming or hard AI-in-production problems, we'd like to hear from you. See our Careers page and apply directly — no ATS, no ghosting.",
  },
  {
    category: "Careers",
    question: "Do you work fully remote?",
    answer:
      "Yes. We're remote-first across the EU with occasional in-person sessions. We optimize for deep work and asynchronous collaboration.",
  },
];
