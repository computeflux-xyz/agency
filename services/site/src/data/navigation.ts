export type NavLink = {
  label: string;
  href: string;
  description?: string;
  badge?: string;
};

export type MegaColumn = {
  heading: string;
  links: NavLink[];
};

export type NavItem = {
  label: string;
  href: string;
  mega?: {
    feature?: {
      eyebrow: string;
      title: string;
      description: string;
      href: string;
      cta: string;
    };
    columns: MegaColumn[];
  };
};

export const primaryNav: NavItem[] = [
  {
    label: "Expertise",
    href: "/expertise",
    mega: {
      feature: {
        eyebrow: "What we do",
        title: "High-performance AI systems, engineered end to end",
        description:
          "We design, optimize and ship production AI infrastructure — from custom inference runtimes to reliable agentic systems.",
        href: "/expertise",
        cta: "Explore our expertise",
      },
      columns: [
        {
          heading: "Practices",
          links: [
            {
              label: "AI Engineering",
              href: "/expertise/ai-engineering",
              description: "LLM & agent systems, production-grade.",
            },
            {
              label: "Inference Optimization",
              href: "/expertise/inference-optimization",
              description: "Cut latency and cost by 40–70%.",
            },
            {
              label: "Agentic Systems",
              href: "/expertise/agentic-systems",
              description: "Autonomous agents that survive production.",
            },
            {
              label: "Systems Programming",
              href: "/expertise/systems-programming",
              description: "Rust, Zig & Go for the hot path.",
            },
          ],
        },
        {
          heading: "How we work",
          links: [
            {
              label: "Engagements",
              href: "/expertise#engagements",
              description: "Audits, builds and staff-level embeds.",
            },
            {
              label: "Case studies",
              href: "/studies",
              description: "Selected work and measured outcomes.",
            },
            {
              label: "White papers",
              href: "/white-papers",
              description: "Free technical deep dives.",
            },
          ],
        },
      ],
    },
  },
  {
    label: "Studies",
    href: "/studies",
    mega: {
      feature: {
        eyebrow: "Selected work",
        title: "Deep dives with measured outcomes",
        description:
          "Anonymized case studies on inference cost reduction, agent reliability and systems-level performance.",
        href: "/studies",
        cta: "Browse all studies",
      },
      columns: [
        {
          heading: "By topic",
          links: [
            { label: "Inference & Cost", href: "/studies?topic=inference" },
            { label: "Agentic AI", href: "/studies?topic=agentic" },
            { label: "Data Pipelines", href: "/studies?topic=data" },
            { label: "Performance", href: "/studies?topic=performance" },
          ],
        },
        {
          heading: "Read",
          links: [
            {
              label: "Articles",
              href: "/articles",
              description: "Field notes & engineering essays.",
            },
            {
              label: "White papers",
              href: "/white-papers",
              description: "Long-form technical reports.",
            },
          ],
        },
      ],
    },
  },
  {
    label: "Company",
    href: "/about",
    mega: {
      columns: [
        {
          heading: "Company",
          links: [
            { label: "About", href: "/about", description: "Who we are." },
            { label: "Careers", href: "/careers", description: "Join the studio." },
            { label: "FAQ", href: "/faq", description: "Common questions." },
            { label: "Contact", href: "/contact", description: "Talk to us." },
          ],
        },
        {
          heading: "Resources",
          links: [
            { label: "White papers", href: "/white-papers" },
            { label: "Newsletter", href: "/newsletter" },
            { label: "Book a call", href: "/book" },
          ],
        },
      ],
    },
  },
  {
    label: "White papers",
    href: "/white-papers",
  },
];

/** Primary call-to-action shown at the end of the header. */
export const headerCta: NavLink = { label: "Book a call", href: "/book" };

export const footerNav: MegaColumn[] = [
  {
    heading: "Expertise",
    links: [
      { label: "AI Engineering", href: "/expertise/ai-engineering" },
      { label: "Inference Optimization", href: "/expertise/inference-optimization" },
      { label: "Agentic Systems", href: "/expertise/agentic-systems" },
      { label: "Systems Programming", href: "/expertise/systems-programming" },
    ],
  },
  {
    heading: "Work",
    links: [
      { label: "Case studies", href: "/studies" },
      { label: "Articles", href: "/articles" },
      { label: "White papers", href: "/white-papers" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Engage",
    links: [
      { label: "Book a call", href: "/book" },
      { label: "Newsletter", href: "/newsletter" },
    ],
  },
];
