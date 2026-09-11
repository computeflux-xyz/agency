import { ApiError, createApiClient, type ArticleType } from "@lib/api";
import { localizedPath, type Locale } from "@i18n";

export type LatestEntry = {
  title: string;
  href: string;
  date?: string;
  readingTime?: number;
  lang?: string;
};

const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; entries: LatestEntry[] }>();
const SECTION: Record<ArticleType, string> = {
  study: "/studies",
  blog: "/articles",
};

export async function latestContent(options: {
  apiBaseUrl?: string;
  locale: Locale;
  type: ArticleType;
  limit?: number;
}): Promise<LatestEntry[]> {
  const { apiBaseUrl, locale, type, limit = 3 } = options;
  if (!apiBaseUrl) return [];

  const key = `${apiBaseUrl}|${locale}|${type}|${limit}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.entries;

  let entries: LatestEntry[] = [];
  try {
    const list = await createApiClient({ baseUrl: apiBaseUrl, lang: locale }).listArticles({
      types: [type],
      sort: "recent",
      page: 1,
      pageSize: limit,
    });
    entries = (Array.isArray(list.items) ? list.items : [])
      .filter((a) => Boolean(a.slug))
      .slice(0, limit)
      .map((a) => ({
        title: a.title,
        href: localizedPath(`${SECTION[type]}/${a.slug}`, locale),
        date: a.datePublished || undefined,
        readingTime: a.readingTime > 0 ? a.readingTime : undefined,
        lang: a.lang,
      }));
  } catch (err) {
    if (!(err instanceof ApiError)) console.error(`nav latest ${type} API error:`, err);
    entries = [];
  }

  cache.set(key, { at: Date.now(), entries });
  return entries;
}
