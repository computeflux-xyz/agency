/* tslint:disable */
/* eslint-disable */
/**
 * 
 * @export
 * @interface DtosArticleDetailResp
 */
export interface DtosArticleDetailResp {
    /**
     * 
     * @type {Array<DtosManifestFileResp>}
     * @memberof DtosArticleDetailResp
     */
    assets?: Array<DtosManifestFileResp>;
    /**
     * 
     * @type {Array<DtosAuthorResp>}
     * @memberof DtosArticleDetailResp
     */
    authors?: Array<DtosAuthorResp>;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    baseUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    canonicalUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    coverImage?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    coverVideo?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    datePublished?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    dateUpdated?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    entryUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    entrypoint?: string;
    /**
     * 
     * @type {boolean}
     * @memberof DtosArticleDetailResp
     */
    featured?: boolean;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    longdesc?: string;
    /**
     * 
     * @type {number}
     * @memberof DtosArticleDetailResp
     */
    readingTime?: number;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    seoDescription?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    seoTitle?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    shortdesc?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    slug?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    title?: string;
    /**
     * 
     * @type {Array<DtosTopicResp>}
     * @memberof DtosArticleDetailResp
     */
    topics?: Array<DtosTopicResp>;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleDetailResp
     */
    type?: string;
    /**
     * 
     * @type {number}
     * @memberof DtosArticleDetailResp
     */
    version?: number;
}
/**
 * 
 * @export
 * @interface DtosArticleSummaryResp
 */
export interface DtosArticleSummaryResp {
    /**
     * 
     * @type {string}
     * @memberof DtosArticleSummaryResp
     */
    coverImage?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleSummaryResp
     */
    coverVideo?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleSummaryResp
     */
    datePublished?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleSummaryResp
     */
    dateUpdated?: string;
    /**
     * 
     * @type {boolean}
     * @memberof DtosArticleSummaryResp
     */
    featured?: boolean;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleSummaryResp
     */
    id?: string;
    /**
     * 
     * @type {number}
     * @memberof DtosArticleSummaryResp
     */
    readingTime?: number;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleSummaryResp
     */
    shortdesc?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleSummaryResp
     */
    slug?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleSummaryResp
     */
    title?: string;
    /**
     * 
     * @type {Array<DtosTopicResp>}
     * @memberof DtosArticleSummaryResp
     */
    topics?: Array<DtosTopicResp>;
    /**
     * 
     * @type {string}
     * @memberof DtosArticleSummaryResp
     */
    type?: string;
}
/**
 * 
 * @export
 * @interface DtosAuthorResp
 */
export interface DtosAuthorResp {
    /**
     * 
     * @type {string}
     * @memberof DtosAuthorResp
     */
    avatarUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosAuthorResp
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosAuthorResp
     */
    slug?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosAuthorResp
     */
    title?: string;
}
/**
 * 
 * @export
 * @interface DtosErrorResp
 */
export interface DtosErrorResp {
    /**
     * 
     * @type {string}
     * @memberof DtosErrorResp
     */
    code?: string;
    /**
     * 
     * @type {{ [key: string]: string; }}
     * @memberof DtosErrorResp
     */
    fields?: { [key: string]: string; };
    /**
     * 
     * @type {string}
     * @memberof DtosErrorResp
     */
    message?: string;
}
/**
 * 
 * @export
 * @interface DtosIngestBeginReq
 */
export interface DtosIngestBeginReq {
    /**
     * 
     * @type {Array<string>}
     * @memberof DtosIngestBeginReq
     */
    authors?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    canonicalUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    coverPath?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    coverVideoPath?: string;
    /**
     * 
     * @type {boolean}
     * @memberof DtosIngestBeginReq
     */
    featured?: boolean;
    /**
     * 
     * @type {Array<DtosIngestFileReq>}
     * @memberof DtosIngestBeginReq
     */
    files: Array<DtosIngestFileReq>;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    longdesc?: string;
    /**
     * 
     * @type {number}
     * @memberof DtosIngestBeginReq
     */
    readingMinutes?: number;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    seoDescription?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    seoTitle?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    shortdesc?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    slug: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    sourceCommit?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    sourceDir?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    sourceRef?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    title: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof DtosIngestBeginReq
     */
    topics?: Array<string>;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginReq
     */
    type: string;
}
/**
 * 
 * @export
 * @interface DtosIngestBeginResp
 */
export interface DtosIngestBeginResp {
    /**
     * 
     * @type {boolean}
     * @memberof DtosIngestBeginResp
     */
    alreadyPublished?: boolean;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginResp
     */
    baseUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginResp
     */
    entrypoint?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginResp
     */
    jobId?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginResp
     */
    prefix?: string;
    /**
     * 
     * @type {Array<string>}
     * @memberof DtosIngestBeginResp
     */
    skipped?: Array<string>;
    /**
     * 
     * @type {Array<DtosIngestUploadResp>}
     * @memberof DtosIngestBeginResp
     */
    uploads?: Array<DtosIngestUploadResp>;
    /**
     * 
     * @type {number}
     * @memberof DtosIngestBeginResp
     */
    version?: number;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestBeginResp
     */
    versionId?: string;
}
/**
 * 
 * @export
 * @interface DtosIngestCommitReq
 */
export interface DtosIngestCommitReq {
    /**
     * 
     * @type {string}
     * @memberof DtosIngestCommitReq
     */
    jobId?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestCommitReq
     */
    versionId: string;
}
/**
 * 
 * @export
 * @interface DtosIngestFileReq
 */
export interface DtosIngestFileReq {
    /**
     * 
     * @type {number}
     * @memberof DtosIngestFileReq
     */
    byteSize?: number;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestFileReq
     */
    contentType?: string;
    /**
     * 
     * @type {boolean}
     * @memberof DtosIngestFileReq
     */
    isEntrypoint?: boolean;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestFileReq
     */
    path: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestFileReq
     */
    sha256: string;
}
/**
 * 
 * @export
 * @interface DtosIngestUploadResp
 */
export interface DtosIngestUploadResp {
    /**
     * 
     * @type {string}
     * @memberof DtosIngestUploadResp
     */
    contentType?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestUploadResp
     */
    key?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestUploadResp
     */
    path?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestUploadResp
     */
    putUrl?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosIngestUploadResp
     */
    url?: string;
}
/**
 * 
 * @export
 * @interface DtosManifestFileResp
 */
export interface DtosManifestFileResp {
    /**
     * 
     * @type {number}
     * @memberof DtosManifestFileResp
     */
    byteSize?: number;
    /**
     * 
     * @type {string}
     * @memberof DtosManifestFileResp
     */
    contentType?: string;
    /**
     * 
     * @type {boolean}
     * @memberof DtosManifestFileResp
     */
    isEntrypoint?: boolean;
    /**
     * 
     * @type {string}
     * @memberof DtosManifestFileResp
     */
    kind?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosManifestFileResp
     */
    path?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosManifestFileResp
     */
    url?: string;
}
/**
 * 
 * @export
 * @interface DtosPaginatedArticlesResp
 */
export interface DtosPaginatedArticlesResp {
    /**
     * 
     * @type {Array<DtosArticleSummaryResp>}
     * @memberof DtosPaginatedArticlesResp
     */
    items?: Array<DtosArticleSummaryResp>;
    /**
     * 
     * @type {number}
     * @memberof DtosPaginatedArticlesResp
     */
    page?: number;
    /**
     * 
     * @type {number}
     * @memberof DtosPaginatedArticlesResp
     */
    pageSize?: number;
    /**
     * 
     * @type {number}
     * @memberof DtosPaginatedArticlesResp
     */
    total?: number;
    /**
     * 
     * @type {number}
     * @memberof DtosPaginatedArticlesResp
     */
    totalBlogPosts?: number;
    /**
     * 
     * @type {number}
     * @memberof DtosPaginatedArticlesResp
     */
    totalCaseStudies?: number;
}
/**
 * 
 * @export
 * @interface DtosTopicResp
 */
export interface DtosTopicResp {
    /**
     * 
     * @type {number}
     * @memberof DtosTopicResp
     */
    articleCount?: number;
    /**
     * 
     * @type {string}
     * @memberof DtosTopicResp
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosTopicResp
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof DtosTopicResp
     */
    slug?: string;
}
