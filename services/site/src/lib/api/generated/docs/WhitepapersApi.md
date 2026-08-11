# WhitepapersApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiWhitepapersGet**](WhitepapersApi.md#apiwhitepapersget) | **GET** /api/whitepapers | List published whitepapers |
| [**apiWhitepapersSlugGet**](WhitepapersApi.md#apiwhitepapersslugget) | **GET** /api/whitepapers/{slug} | Get one published whitepaper |
| [**apiWhitepapersSlugRequestPost**](WhitepapersApi.md#apiwhitepapersslugrequestpost) | **POST** /api/whitepapers/{slug}/request | Request a whitepaper |



## apiWhitepapersGet

> Array&lt;DtosWhitePaperResp&gt; apiWhitepapersGet(lang, featured)

List published whitepapers

Metadata only. The documents themselves are gated: they are delivered by email after a request.

### Example

```ts
import {
  Configuration,
  WhitepapersApi,
} from '@computeflux/site-api-client';
import type { ApiWhitepapersGetRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const api = new WhitepapersApi();

  const body = {
    // string | Content language (en, fr) (optional)
    lang: lang_example,
    // boolean | Only featured whitepapers (optional)
    featured: true,
  } satisfies ApiWhitepapersGetRequest;

  try {
    const data = await api.apiWhitepapersGet(body);
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
| **lang** | `string` | Content language (en, fr) | [Optional] [Defaults to `undefined`] |
| **featured** | `boolean` | Only featured whitepapers | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;DtosWhitePaperResp&gt;**](DtosWhitePaperResp.md)

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


## apiWhitepapersSlugGet

> DtosWhitePaperResp apiWhitepapersSlugGet(slug, lang)

Get one published whitepaper

Metadata only; never a link to the PDF.

### Example

```ts
import {
  Configuration,
  WhitepapersApi,
} from '@computeflux/site-api-client';
import type { ApiWhitepapersSlugGetRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const api = new WhitepapersApi();

  const body = {
    // string | Whitepaper slug
    slug: slug_example,
    // string | Content language (en, fr) (optional)
    lang: lang_example,
  } satisfies ApiWhitepapersSlugGetRequest;

  try {
    const data = await api.apiWhitepapersSlugGet(body);
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
| **lang** | `string` | Content language (en, fr) | [Optional] [Defaults to `undefined`] |

### Return type

[**DtosWhitePaperResp**](DtosWhitePaperResp.md)

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


## apiWhitepapersSlugRequestPost

> DtosWhitePaperRequestResp apiWhitepapersSlugRequestPost(slug, body)

Request a whitepaper

Captures the lead and emails the PDF in the requested language, with a notification to the team.

### Example

```ts
import {
  Configuration,
  WhitepapersApi,
} from '@computeflux/site-api-client';
import type { ApiWhitepapersSlugRequestPostRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new WhitepapersApi(config);

  const body = {
    // string | Whitepaper slug
    slug: slug_example,
    // DtosWhitePaperRequestReq | Contact details
    body: ...,
  } satisfies ApiWhitepapersSlugRequestPostRequest;

  try {
    const data = await api.apiWhitepapersSlugRequestPost(body);
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
| **body** | [DtosWhitePaperRequestReq](DtosWhitePaperRequestReq.md) | Contact details | |

### Return type

[**DtosWhitePaperRequestResp**](DtosWhitePaperRequestResp.md)

### Authorization

[BearerAuth](../README.md#BearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `application/json`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Created |  -  |
| **400** | Bad Request |  -  |
| **401** | Unauthorized |  -  |
| **404** | Not Found |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

