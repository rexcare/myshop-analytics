gcloud functions deploy core-platform --entry-point main --runtime python38 --trigger-http --allow-unauthenticated --env-vars-file .env.yaml


# Setting secret configs
# gcloud secrets create SHOPIFY_PUBLIC_KEY  
# echo "thesecret" | gcloud secrets versions add SHOPIFY_PUBLIC_KEY --data-file=-