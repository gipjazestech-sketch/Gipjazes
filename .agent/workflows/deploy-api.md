---
description: Deploy the Gipjazes API to Google Cloud Run
---

// turbo-all
1. Build the Docker image
```bash
cd apps/api
docker build -t gcr.io/[PROJECT_ID]/gipjazes-api .
```

2. Push the image to Google Container Registry
```bash
docker push gcr.io/[PROJECT_ID]/gipjazes-api
```

3. Deploy to Cloud Run
```bash
gcloud run deploy gipjazes-api \
  --image gcr.io/[PROJECT_ID]/gipjazes-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "DATABASE_URL=[YOUR_POSTGRES_URL],JWT_SECRET=[YOUR_JWT_SECRET],S3_BUCKET_NAME=[YOUR_S3_BUCKET],AWS_ACCESS_KEY_ID=[YOUR_AWS_KEY],AWS_SECRET_ACCESS_KEY=[YOUR_AWS_SECRET]"
```

Alternatively, use the `cloudrun` MCP server provided:
1. Make sure you are logged into GCP.
2. Run the deployment via the MCP tool.
