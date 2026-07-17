import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * Content collections for editorial content that ships with the site and is
 * fully prerendered for SEO: `studies` (case studies) and `articles` (blog /
 * engineering essays).
 *
 * Dynamically loaded studies/articles (from the future backend, e.g. exported
 * ObservableHQ notebooks) will reuse the same frontmatter shape so cards and
 * detail pages are interchangeable — see src/lib/api for the matching types.
 */

const editorial = {
  title: z.string(),
  description: z.string(),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  topics: z.array(z.string()).default([]),
  cover: z.string().optional(),
  featured: z.boolean().default(false),
  author: z.string().default("Computeflux"),
  draft: z.boolean().default(false),
};

const studies = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/studies" }),
  schema: z.object({
    ...editorial,
    client: z.string().optional(),
    industry: z.string().optional(),
    /** Headline outcome metrics for the study. */
    outcomes: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .default([]),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/articles" }),
  schema: z.object(editorial),
});

export const collections = { studies, articles };
