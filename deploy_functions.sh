#!/bin/sh

gcloud functions deploy cookbizjp-ga4-data-transfer-gcs-to-s3 \
--runtime nodejs16 \
--trigger-resource cookbizjp-ga4-exported-data \
--trigger-event google.storage.object.finalize \
--entry-point execute \
--region asia-northeast1 \
--service-account "recommend-data-mart-account@ga4-248020302-325503.iam.gserviceaccount.com"