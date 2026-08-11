# AdminApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiAdminArticlesIngestBeginPost**](AdminApi.md#apiadminarticlesingestbeginpost) | **POST** /api/admin/articles/ingest/begin | Begin an article publish |
| [**apiAdminArticlesIngestCommitPost**](AdminApi.md#apiadminarticlesingestcommitpost) | **POST** /api/admin/articles/ingest/commit | Commit an article publish |
| [**apiAdminArticlesSlugDelete**](AdminApi.md#apiadminarticlesslugdelete) | **DELETE** /api/admin/articles/{slug} | Delete an article |
| [**apiAdminWhitepapersIngestBeginPost**](AdminApi.md#apiadminwhitepapersingestbeginpost) | **POST** /api/admin/whitepapers/ingest/begin | Begin a whitepaper publish |
| [**apiAdminWhitepapersIngestCommitPost**](AdminApi.md#apiadminwhitepapersingestcommitpost) | **POST** /api/admin/whitepapers/ingest/commit | Commit a whitepaper publish |
| [**apiAdminWhitepapersSlugDelete**](AdminApi.md#apiadminwhitepapersslugdelete) | **DELETE** /api/admin/whitepapers/{slug} | Delete a whitepaper |



## apiAdminArticlesIngestBeginPost

> DtosIngestBeginResp apiAdminArticlesIngestBeginPost(body)

Begin an article publish

Admin only. Registers a draft version and returns presigned R2 PUT URLs for the blobs that still need uploading.

### Example

```ts
import {
  Configuration,
  AdminApi,
} from '@computeflux/site-api-client';
import type { ApiAdminArticlesIngestBeginPostRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new AdminApi(config);

  const body = {
    // DtosIngestBeginReq | Article metadata + built file list
    body: ...,
  } satisfies ApiAdminArticlesIngestBeginPostRequest;

  try {
    const data = await api.apiAdminArticlesIngestBeginPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **body** | [DtosIngestBeginReq](DtosIngestBeginReq.md) | Article metadata + built file list | |

### Return type

[**DtosIngestBeginResp**](DtosIngestBeginResp.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiAdminArticlesIngestCommitPost

> DtosArticleDetailResp apiAdminArticlesIngestCommitPost(body)

Commit an article publish

Admin only. Verifies all blobs were uploaded, then atomically publishes the version.

### Example

```ts
import {
  Configuration,
  AdminApi,
} from '@computeflux/site-api-client';
import type { ApiAdminArticlesIngestCommitPostRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new AdminApi(config);

  const body = {
    // DtosIngestCommitReq | Version + job identifiers from begin
    body: ...,
  } satisfies ApiAdminArticlesIngestCommitPostRequest;

  try {
    const data = await api.apiAdminArticlesIngestCommitPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **body** | [DtosIngestCommitReq](DtosIngestCommitReq.md) | Version + job identifiers from begin | |

### Return type

[**DtosArticleDetailResp**](DtosArticleDetailResp.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiAdminArticlesSlugDelete

> apiAdminArticlesSlugDelete(slug)

Delete an article

Admin only. Removes the article and purges its R2 blobs.

### Example

```ts
import {
  Configuration,
  AdminApi,
} from '@computeflux/site-api-client';
import type { ApiAdminArticlesSlugDeleteRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new AdminApi(config);

  const body = {
    // string | Article slug
    slug: slug_example,
  } satisfies ApiAdminArticlesSlugDeleteRequest;

  try {
    const data = await api.apiAdminArticlesSlugDelete(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **slug** | `string` | Article slug | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiAdminWhitepapersIngestBeginPost

> DtosWhitePaperIngestResp apiAdminWhitepapersIngestBeginPost(body)

Begin a whitepaper publish

Admin only. Upserts the publication as a draft and returns presigned PUT URLs for the editions whose PDF is not already stored.

### Example

```ts
import {
  Configuration,
  AdminApi,
} from '@computeflux/site-api-client';
import type { ApiAdminWhitepapersIngestBeginPostRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new AdminApi(config);

  const body = {
    // DtosWhitePaperIngestReq | Whitepaper metadata + one entry per language
    body: ...,
  } satisfies ApiAdminWhitepapersIngestBeginPostRequest;

  try {
    const data = await api.apiAdminWhitepapersIngestBeginPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **body** | [DtosWhitePaperIngestReq](DtosWhitePaperIngestReq.md) | Whitepaper metadata + one entry per language | |

### Return type

[**DtosWhitePaperIngestResp**](DtosWhitePaperIngestResp.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiAdminWhitepapersIngestCommitPost

> DtosWhitePaperResp apiAdminWhitepapersIngestCommitPost(body)

Commit a whitepaper publish

Admin only. Verifies every edition\&#39;s PDF is stored, then publishes the whitepaper.

### Example

```ts
import {
  Configuration,
  AdminApi,
} from '@computeflux/site-api-client';
import type { ApiAdminWhitepapersIngestCommitPostRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new AdminApi(config);

  const body = {
    // DtosWhitePaperCommitReq | Slug to publish
    body: ...,
  } satisfies ApiAdminWhitepapersIngestCommitPostRequest;

  try {
    const data = await api.apiAdminWhitepapersIngestCommitPost(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **body** | [DtosWhitePaperCommitReq](DtosWhitePaperCommitReq.md) | Slug to publish | |

### Return type

[**DtosWhitePaperResp**](DtosWhitePaperResp.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiAdminWhitepapersSlugDelete

> apiAdminWhitepapersSlugDelete(slug)

Delete a whitepaper

Admin only. Removes the publication and purges its PDFs. Captured leads are kept.

### Example

```ts
import {
  Configuration,
  AdminApi,
} from '@computeflux/site-api-client';
import type { ApiAdminWhitepapersSlugDeleteRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new AdminApi(config);

  const body = {
    // string | Whitepaper slug
    slug: slug_example,
  } satisfies ApiAdminWhitepapersSlugDeleteRequest;

  try {
    const data = await api.apiAdminWhitepapersSlugDelete(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **slug** | `string` | Whitepaper slug | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **204** | No Content |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

