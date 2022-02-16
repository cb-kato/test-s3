#!/bin/sh

curl localhost:8080 \
  -X POST \
  -H "Content-Type: application/json" \
  -H "ce-id: 123451234512345" \
  -H "ce-specversion: 1.0" \
  -H "ce-time: 2020-01-02T12:34:56.789Z" \
  -H "ce-type: google.cloud.storage.object.v1.finalized" \
  -H "ce-source: //storage.googleapis.com/projects/_/buckets/test-cookbizjp-ga4-export-pageview" \
  -H "ce-subject: objects/exported/exported_000000000001.parquet" \
  -d '{
    "bucket": "test-cookbizjp-ga4-export-pageview",
    "contentType": "application/octet-stream",
    "crc32c": "Xtj/QQ==",
    "etag": "COG7+5KRg/YCEAE=",
    "generation": "1644977077542369",
    "id": "test-cookbizjp-ga4-export-pageview/exported/exported_000000000001.parquet/1644977077542369",
    "kind": "storage#object",
    "md5Hash": "78jd/4ewFt9OxMAr0vy3vw==",
    "mediaLink": "https://www.googleapis.com/download/storage/v1/b/test-cookbizjp-ga4-export-pageview/o/exported%2Fexported_000000000001.parquet?generation=1644977077542369&alt=media",
    "metageneration": "1",
    "name": "exported/exported_000000000001.parquet",
    "selfLink": "https://www.googleapis.com/storage/v1/b/test-cookbizjp-ga4-export-pageview/o/exported%2Fexported_000000000001.parquet",
    "size": "2374267",
    "storageClass": "STANDARD",
    "timeCreated": "2022-02-16T02:04:37.545Z",
    "timeStorageClassUpdated": "2022-02-16T02:04:37.545Z",
    "updated": "2022-02-16T02:04:37.545Z"
}'
