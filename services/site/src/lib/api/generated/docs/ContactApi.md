# ContactApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiContactPost**](ContactApi.md#apicontactpost) | **POST** /api/contact | Submit a contact request |



## apiContactPost

> DtosContactSubmitResp apiContactPost(body)

Submit a contact request

Registers a \&quot;Contact us\&quot; submission and triggers the acknowledgement email to the contact plus a notification email to the team.

### Example

```ts
import {
  Configuration,
  ContactApi,
} from '@computeflux/site-api-client';
import type { ApiContactPostRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new ContactApi(config);

  const body = {
    // DtosContactSubmitReq | Contact submission
    body: ...,
  } satisfies ApiContactPostRequest;

  try {
    const data = await api.apiContactPost(body);
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
| **body** | [DtosContactSubmitReq](DtosContactSubmitReq.md) | Contact submission | |

### Return type

[**DtosContactSubmitResp**](DtosContactSubmitResp.md)

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

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

