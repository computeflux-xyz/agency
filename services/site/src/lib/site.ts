export type SocialLinks = {
  linkedin: string;
  github: string;
  x: string;
};

export type SiteConfig = {
  url: string;
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  defaultOgImage: string;
  locale: string;
  lang: string;
  email: string;
  location: string;
  foundingYear: number;
  social: SocialLinks;
  themeColor: string;
};

export const site: SiteConfig = {
  url: "https://computeflux.xyz",
  name: "Computeflux",
  legalName: "Computeflux",
  tagline: "Deep tech R&D for high-performance AI systems",
  description:
    "Computeflux is a deep tech research & development studio specializing in high-performance AI systems — inference optimization, agentic architectures and low-level systems programming (Rust, Zig, Go).",
  defaultOgImage: "/og/default.png",
  locale: "en_US",
  lang: "en",
  email: "hello@computeflux.xyz",
  location: "Bordeaux, France — remote worldwide",
  foundingYear: 2026,
  social: {
    linkedin: "https://www.linkedin.com/company/computeflux",
    github: "https://github.com/computeflux",
    x: "https://x.com/computeflux",
  },
  themeColor: "#f5f4ef",
};

export const twitterHandle = "@computeflux";
