# MeetingsApi

All URIs are relative to *http://localhost*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**apiMeetingsPost**](MeetingsApi.md#apimeetingspost) | **POST** /api/meetings | Request a 30-minute meeting |



## apiMeetingsPost

> DtosMeetingRequestResp apiMeetingsPost(body)

Request a 30-minute meeting

Registers a \&quot;30-minute Rendez-vous\&quot; request and triggers the acknowledgement email to the requester plus a notification email to the team.

### Example

```ts
import {
  Configuration,
  MeetingsApi,
} from '@computeflux/site-api-client';
import type { ApiMeetingsPostRequest } from '@computeflux/site-api-client';

async function example() {
  console.log("🚀 Testing @computeflux/site-api-client SDK...");
  const config = new Configuration({ 
    // To configure API key authorization: BearerAuth
    apiKey: "YOUR API KEY",
  });
  const api = new MeetingsApi(config);

  const body = {
    // DtosMeetingRequestReq | Meeting request
    body: ...,
  } satisfies ApiMeetingsPostRequest;

  try {
    const data = await api.apiMeetingsPost(body);
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
| **body** | [DtosMeetingRequestReq](DtosMeetingRequestReq.md) | Meeting request | |

### Return type

[**DtosMeetingRequestResp**](DtosMeetingRequestResp.md)

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

