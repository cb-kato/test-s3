#!/bin/sh

gcloud functions deploy cookbizjp-ga4-data-transfer-gcs-to-s3 \
--runtime nodejs16 \
--trigger-resource cookbizjp-ga4-exported-data \
--entry-point execute \
--region asia-northeast1 \
--trigger-event google.storage.object.finalize \
--env-vars-file=./env.yaml