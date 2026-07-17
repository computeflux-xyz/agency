# ArticlesApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiArticlesGet**](ArticlesApi.md#apiarticlesget) | **GET** /api/articles | List published articles |
| [**apiArticlesSlugGet**](ArticlesApi.md#apiarticlesslugget) | **GET** /api/articles/{slug} | Get a published article |
| [**apiTopicsGet**](ArticlesApi.md#apitopicsget) | **GET** /api/topics | List topics |



## apiArticlesGet

> DtosPaginatedArticlesResp apiArticlesGet(types, topics, featured, q, sort, page, pageSize)

List published articles

Paginated list of published articles/studies with topic, type and full-text filters.

### Example

```ts
import {
  Configuration,
  ArticlesApi,
} from '@computeflux/site-api-client';
import type { ApiArticlesGetRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const api = new ArticlesApi();

  const body = {
    // string | Comma-separated types: blog,study (optional)
    types: types_example,
    // string | Comma-separated topic slugs (optional)
    topics: topics_example,
    // boolean | Only featured articles (optional)
    featured: true,
    // string | Full-text search over title/summary/body (optional)
    q: q_example,
    // string | recent | title | featured (default) (optional)
    sort: sort_example,
    // number | 1-based page (default 1) (optional)
    page: 56,
    // number | Items per page (default 12, max 100) (optional)
    pageSize: 56,
  } satisfies ApiArticlesGetRequest;

  try {
    const data = await api.apiArticlesGet(body);
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
| **types** | `string` | Comma-separated types: blog,study | [Optional] [Defaults to `undefined`] |
| **topics** | `string` | Comma-separated topic slugs | [Optional] [Defaults to `undefined`] |
| **featured** | `boolean` | Only featured articles | [Optional] [Defaults to `undefined`] |
| **q** | `string` | Full-text search over title/summary/body | [Optional] [Defaults to `undefined`] |
| **sort** | `string` | recent | title | featured (default) | [Optional] [Defaults to `undefined`] |
| **page** | `number` | 1-based page (default 1) | [Optional] [Defaults to `undefined`] |
| **pageSize** | `number` | Items per page (default 12, max 100) | [Optional] [Defaults to `undefined`] |

### Return type

[**DtosPaginatedArticlesResp**](DtosPaginatedArticlesResp.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **400** | Bad Request |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiArticlesSlugGet

> DtosArticleDetailResp apiArticlesSlugGet(slug)

Get a published article

Returns article metadata plus the render manifest (entry URL + R2 blob list).

### Example

```ts
import {
  Configuration,
  ArticlesApi,
} from '@computeflux/site-api-client';
import type { ApiArticlesSlugGetRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const api = new ArticlesApi();

  const body = {
    // string | Article slug
    slug: slug_example,
  } satisfies ApiArticlesSlugGetRequest;

  try {
    const data = await api.apiArticlesSlugGet(body);
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

[**DtosArticleDetailResp**](DtosArticleDetailResp.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## apiTopicsGet

> Array&lt;DtosTopicResp&gt; apiTopicsGet()

List topics

Curated taxonomy with published-article counts.

### Example

```ts
import {
  Configuration,
  ArticlesApi,
} from '@computeflux/site-api-client';
import type { ApiTopicsGetRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const api = new ArticlesApi();

  try {
    const data = await api.apiTopicsGet();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;DtosTopicResp&gt;**](DtosTopicResp.md)

### Authorization

No authorization required

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

