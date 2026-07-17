import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";
import { site } from "@lib/site";

export async function GET(context: APIContext) {
  const origin = context.site?.toString() ?? site.url;

  const [articles, studies] = await Promise.all([
    getCollection("articles", ({ data }) => !data.draft),
    getCollection("studies", ({ data }) => !data.draft),
  ]);

  const items = [
    ...articles.map((a) => ({
      title: a.data.title,
      description: a.data.description,
      pubDate: a.data.publishDate,
      link: `/articles/${a.id}/`,
      categories: a.data.topics,
    })),
    ...studies.map((s) => ({
      title: s.data.title,
      description: s.data.description,
      pubDate: s.data.publishDate,
      link: `/studies/${s.id}/`,
      categories: s.data.topics,
    })),
  ].sort((x, y) => y.pubDate.valueOf() - x.pubDate.valueOf());

  return rss({
    title: `${site.name} — Articles & case studies`,
    description: site.description,
    site: origin,
    items,
    customData: `<language>${site.lang}</language>`,
  });
}
