import {
  Configuration,
  ArticlesApi,
  ResponseError,
  type Middleware,
  type DtosArticleDetailResp,
  type DtosArticleSummaryResp,
  type DtosAuthorResp,
  type DtosManifestFileResp,
  type DtosPaginatedArticlesResp,
  type DtosTopicResp,
} from "@api-client";

export class NotImplementedError extends Error {
  constructor(feature: string) {
    super(`[computeflux-api] "${feature}" is not implemented yet.`);
    this.name = "NotImplementedError";
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ArticleType = "study" | "blog";
export type Topic = { name: string; slug: string; description?: string; articleCount?: number };
export type Author = { name: string; slug: string; title?: string; avatarUrl?: string };

export type ArticleSummary = {
  id: string;
  type: ArticleType;
  slug: string;
  title: string;
  shortdesc: string;
  coverImage: string | null;
  coverVideo: string | null;
  topics: Topic[];
  featured: boolean;
  readingTime: number;
  datePublished: string;
  dateUpdated: string;
};

export type ManifestAsset = {
  path: string;
  url: string;
  contentType: string;
  byteSize: number;
  kind: string;
  isEntrypoint: boolean;
};

export type ArticleDocument = ArticleSummary & {
  longdesc: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  authors: Author[];
  version: number;
  entrypoint: string;
  baseUrl: string;
  entryUrl: string;
  assets: ManifestAsset[];
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalBlogPosts?: number;
  totalCaseStudies?: number;
};

export type WhitePaper = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage: string | null;
  pages: number;
  gated: boolean;
};
export type BookingSlot = { id: string; startsAt: string; endsAt: string; available: boolean };
export type ContactPayload = { name: string; email: string; company?: string; message: string };
export type JobApplicationPayload = {
  name: string;
  email: string;
  role: string;
  links?: string;
  message: string;
  cvUrl?: string;
};
export type NewsletterPayload = { email: string };

export type ListArticlesParams = {
  types?: ArticleType[];
  topics?: string[];
  featured?: boolean;
  search?: string;
  sort?: "recent" | "title" | "featured";
  page?: number;
  pageSize?: number;
};

export type ApiClientOptions = {
  baseUrl: string;
  token?: string;
  fetch?: typeof fetch;
};

export interface ComputefluxApi {
  listArticles(params?: ListArticlesParams): Promise<Paginated<ArticleSummary>>;
  getArticle(slug: string): Promise<ArticleDocument>;
  listTopics(): Promise<Topic[]>;
  listWhitePapers(): Promise<WhitePaper[]>;
  requestWhitePaper(slug: string, email: string): Promise<{ downloadUrl: string }>;
  listBookingSlots(): Promise<BookingSlot[]>;
  book(slotId: string, payload: ContactPayload): Promise<{ confirmationId: string }>;
  submitContact(payload: ContactPayload): Promise<{ ok: true }>;
  applyForJob(payload: JobApplicationPayload): Promise<{ ok: true }>;
  subscribeNewsletter(payload: NewsletterPayload): Promise<{ ok: true }>;
}

const mapTopic = (t: DtosTopicResp): Topic => ({
  name: t.name ?? "",
  slug: t.slug ?? "",
  description: t.description,
  articleCount: t.articleCount,
});

const mapAuthor = (a: DtosAuthorResp): Author => ({
  name: a.name ?? "",
  slug: a.slug ?? "",
  title: a.title,
  avatarUrl: a.avatarUrl,
});

const mapAsset = (m: DtosManifestFileResp): ManifestAsset => ({
  path: m.path ?? "",
  url: m.url ?? "",
  contentType: m.contentType ?? "",
  byteSize: m.byteSize ?? 0,
  kind: m.kind ?? "other",
  isEntrypoint: m.isEntrypoint ?? false,
});

const mapSummary = (a: DtosArticleSummaryResp): ArticleSummary => ({
  id: a.id ?? "",
  type: (a.type as ArticleType) ?? "blog",
  slug: a.slug ?? "",
  title: a.title ?? "",
  shortdesc: a.shortdesc ?? "",
  coverImage: a.coverImage ?? null,
  coverVideo: a.coverVideo ?? null,
  topics: (a.topics ?? []).map(mapTopic),
  featured: a.featured ?? false,
  readingTime: a.readingTime ?? 0,
  datePublished: a.datePublished ?? "",
  dateUpdated: a.dateUpdated ?? "",
});

const mapDocument = (d: DtosArticleDetailResp): ArticleDocument => ({
  ...mapSummary(d),
  longdesc: d.longdesc ?? "",
  seoTitle: d.seoTitle || undefined,
  seoDescription: d.seoDescription || undefined,
  canonicalUrl: d.canonicalUrl || undefined,
  authors: (d.authors ?? []).map(mapAuthor),
  version: d.version ?? 0,
  entrypoint: d.entrypoint ?? "",
  baseUrl: d.baseUrl ?? "",
  entryUrl: d.entryUrl ?? "",
  assets: (d.assets ?? []).map(mapAsset),
});

const mapPaginated = (p: DtosPaginatedArticlesResp): Paginated<ArticleSummary> => ({
  items: (p.items ?? []).map(mapSummary),
  page: p.page ?? 1,
  pageSize: p.pageSize ?? 0,
  total: p.total ?? 0,
  totalBlogPosts: p.totalBlogPosts,
  totalCaseStudies: p.totalCaseStudies,
});

async function asError(e: unknown): Promise<Error> {
  if (e instanceof ResponseError) {
    let code = "error";
    let message = e.response.statusText;
    try {
      const body = (await e.response.clone().json()) as { code?: string; message?: string };
      code = body.code ?? code;
      message = body.message ?? message;
    } catch {
      /* non-JSON body */
    }
    return new ApiError(e.response.status, code, message);
  }

  return e instanceof Error ? e : new Error(String(e));
}

class HttpApi implements ComputefluxApi {
  private readonly articles: ArticlesApi;

  constructor(options: ApiClientOptions) {
    const middleware: Middleware[] = [];
    if (options.token) {
      middleware.push({
        pre: async (context) => {
          context.init.headers = {
            ...context.init.headers,
            Authorization: `Bearer ${options.token}`,
          };
          return context;
        },
      });
    }
    const config = new Configuration({
      basePath: options.baseUrl.replace(/\/+$/, ""),
      fetchApi: options.fetch,
      middleware,
    });
    this.articles = new ArticlesApi(config);
  }

  async listArticles(params: ListArticlesParams = {}): Promise<Paginated<ArticleSummary>> {
    try {
      const res = await this.articles.apiArticlesGet({
        types: params.types?.length ? params.types.join(",") : undefined,
        topics: params.topics?.length ? params.topics.join(",") : undefined,
        featured: params.featured,
        q: params.search,
        sort: params.sort,
        page: params.page,
        pageSize: params.pageSize,
      });
      return mapPaginated(res);
    } catch (e) {
      throw await asError(e);
    }
  }

  async getArticle(slug: string): Promise<ArticleDocument> {
    try {
      return mapDocument(await this.articles.apiArticlesSlugGet({ slug }));
    } catch (e) {
      throw await asError(e);
    }
  }

  async listTopics(): Promise<Topic[]> {
    try {
      return (await this.articles.apiTopicsGet()).map(mapTopic);
    } catch (e) {
      throw await asError(e);
    }
  }

  listWhitePapers(): Promise<WhitePaper[]> {
    throw new NotImplementedError("listWhitePapers");
  }
  requestWhitePaper(): Promise<{ downloadUrl: string }> {
    throw new NotImplementedError("requestWhitePaper");
  }
  listBookingSlots(): Promise<BookingSlot[]> {
    throw new NotImplementedError("listBookingSlots");
  }
  book(): Promise<{ confirmationId: string }> {
    throw new NotImplementedError("book");
  }
  submitContact(): Promise<{ ok: true }> {
    throw new NotImplementedError("submitContact");
  }
  applyForJob(): Promise<{ ok: true }> {
    throw new NotImplementedError("applyForJob");
  }
  subscribeNewsletter(): Promise<{ ok: true }> {
    throw new NotImplementedError("subscribeNewsletter");
  }
}

export function createApiClient(options: ApiClientOptions): ComputefluxApi {
  return new HttpApi(options);
}

export const api: ComputefluxApi = createApiClient({
  baseUrl: (import.meta.env.API_BASE_URL as string | undefined) ?? "https://api.computeflux.xyz",
});
