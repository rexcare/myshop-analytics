gcloud functions deploy shopify-etl \
  --runtime python38 \
  --entry-point function_handler \
  --trigger-event providers/cloud.firestore/eventTypes/document.create \
  --trigger-resource "projects/clearanalytics-dev/databases/(default)/documents/company/{company_name}" \
  --timeout=540 
