/**
 * Server-side half of the analytics setup: the page context that `BaseLayout`
 * stamps on `<body>` and that `@lib/client/analytics` attaches to every event.
 *
 * The page type is derived from the URL rather than declared page by page, so
 * a new route is classified correctly the moment it exists. A layout can still
 * override it explicitly (`pageType` prop) when the URL is not the whole story.
 */

/** Sections whose second path segment is a content slug, and their type names. */
const COLLECTIONS: Record<string, { index: string; detail: string }> = {
  articles: { index: "articles_index", detail: "article" },
  studies: { index: "studies_index", detail: "study" },
  expertise: { index: "expertise_index", detail: "expertise" },
  careers: { index: "careers_index", detail: "job" },
  "white-papers": { index: "whitepapers_index", detail: "whitepaper" },
};

/** Single-page routes, keyed by their first (and only) segment. */
const SINGLES = new Set(["contact", "book", "faq", "about", "privacy", "404"]);

export interface PageContext {
  pageType: string;
  /** Slug of the content being viewed, empty on index and static pages. */
  slug: string;
}

/**
 * Classify a canonical (locale-stripped) pathname.
 *
 * `/studies/rust-ingestion-pipeline` -> `{ pageType: "study", slug: "rust-ingestion-pipeline" }`
 */
export function pageContextFor(canonicalPath: string): PageContext {
  const segments = canonicalPath.split("/").filter(Boolean);

  if (segments.length === 0) return { pageType: "home", slug: "" };

  const [head, ...rest] = segments;
  const collection = COLLECTIONS[head];
  if (collection) {
    const slug = rest.join("/");
    return slug
      ? { pageType: collection.detail, slug }
      : { pageType: collection.index, slug: "" };
  }

  if (SINGLES.has(head)) return { pageType: head, slug: "" };

  return { pageType: "page", slug: segments.join("/") };
}
