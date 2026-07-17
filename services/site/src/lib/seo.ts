import { site } from "./site";

type Json = Record<string, unknown>;

export function organizationSchema(): Json {
  return {
    "@type": "Organization",
    "@id": `${site.url}/#organization`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: `${site.url}/logo.svg`,
    description: site.description,
    email: site.email,
    foundingDate: String(site.foundingYear),
    sameAs: [site.social.linkedin, site.social.github, site.social.x],
  };
}

export function websiteSchema(): Json {
  return {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { "@id": `${site.url}/#organization` },
    inLanguage: site.lang,
  };
}

export function webPageSchema(opts: {
  url: string;
  title: string;
  description: string;
}): Json {
  return {
    "@type": "WebPage",
    "@id": `${opts.url}#webpage`,
    url: opts.url,
    name: opts.title,
    description: opts.description,
    isPartOf: { "@id": `${site.url}/#website` },
    inLanguage: site.lang,
  };
}

export function breadcrumbSchema(
  items: { name: string; url: string }[],
): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function articleSchema(opts: {
  url: string;
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  section?: string;
  tags?: string[];
}): Json {
  return {
    "@type": "Article",
    "@id": `${opts.url}#article`,
    headline: opts.title,
    description: opts.description,
    image: opts.image,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    author: { "@type": "Organization", name: opts.authorName, url: site.url },
    publisher: { "@id": `${site.url}/#organization` },
    mainEntityOfPage: opts.url,
    ...(opts.section ? { articleSection: opts.section } : {}),
    ...(opts.tags && opts.tags.length ? { keywords: opts.tags.join(", ") } : {}),
    inLanguage: site.lang,
  };
}

export function faqSchema(items: { question: string; answer: string }[]): Json {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function jobPostingSchema(opts: {
  title: string;
  description: string;
  datePosted: string;
  employmentType: string;
  remote?: boolean;
  location?: string;
}): Json {
  return {
    "@type": "JobPosting",
    title: opts.title,
    description: opts.description,
    datePosted: opts.datePosted,
    employmentType: opts.employmentType,
    hiringOrganization: { "@id": `${site.url}/#organization` },
    ...(opts.remote
      ? {
          jobLocationType: "TELECOMMUTE",
          applicantLocationRequirements: {
            "@type": "Country",
            name: "European Union",
          },
        }
      : {}),
    ...(opts.location
      ? {
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: opts.location,
            },
          },
        }
      : {}),
  };
}

export function jsonLdGraph(...nodes: (Json | Json[])[]): string {
  const graph = nodes.flat();
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}
