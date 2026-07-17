# AdminApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiAdminArticlesIngestBeginPost**](AdminApi.md#apiadminarticlesingestbeginpost) | **POST** /api/admin/articles/ingest/begin | Begin an article publish |
| [**apiAdminArticlesIngestCommitPost**](AdminApi.md#apiadminarticlesingestcommitpost) | **POST** /api/admin/articles/ingest/commit | Commit an article publish |
| [**apiAdminArticlesSlugDelete**](AdminApi.md#apiadminarticlesslugdelete) | **DELETE** /api/admin/articles/{slug} | Delete an article |



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

