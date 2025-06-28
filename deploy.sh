#!/bin/bash

# MCP Orchestrator v1 - Deployment Script for Google Cloud Run
set -e

# Configuration
PROJECT_ID="dtwo-qa"
SERVICE_NAME="mcp-orchestrator-v1"
REGION="us-central1"
REPOSITORY="cloud-run-source-deploy"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}/${SERVICE_NAME}"
MEMORY="1Gi"
CPU="1"
MAX_INSTANCES="10"
PORT="4001"

echo "🚀 Starting deployment to Google Cloud Run..."

# Check if logged in
echo "📋 Checking Google Cloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with Google Cloud. Please run: gcloud auth login"
    exit 1
fi

# Set project
echo "🔧 Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo "🔌 Enabling required APIs..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com

# Build and push Docker image using Cloud Build with Artifact Registry
echo "🏗️  Building and pushing Docker image to Artifact Registry..."
gcloud builds submit --tag ${IMAGE_NAME}

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory ${MEMORY} \
  --cpu ${CPU} \
  --max-instances ${MAX_INSTANCES} \
  --port ${PORT} \
  --set-env-vars NODE_ENV=production,CACHE_TTL=3600 \
  --set-env-vars CHARGEBEE_ENABLED=true,HUBSPOT_ENABLED=true,FIREBASE_ENABLED=true \
  --set-env-vars CHARGEBEE_SITE=your-chargebee-site \
  --set-env-vars CHARGEBEE_API_KEY=your-chargebee-api-key \
  --set-env-vars HUBSPOT_ACCESS_TOKEN=your-hubspot-access-token \
  --set-env-vars HUBSPOT_API_KEY=your-hubspot-api-key \
  --set-env-vars HUBSPOT_PORTAL_ID=your-hubspot-portal-id \
  --set-env-vars PRIVATE_APP_ACCESS_TOKEN=your-hubspot-private-app-token \
  --set-env-vars GOOGLE_CLOUD_PROJECT=dtwo-qa \
  --set-env-vars FIRESTORE_PROJECT_ID=dtwo-qa \
  --timeout 300 \
  --concurrency 80

# Get service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')

echo "✅ Deployment completed successfully!"
echo "🌐 Service URL: ${SERVICE_URL}"
echo "🔍 Health check: ${SERVICE_URL}/graphql?query={health}"
echo "📊 GraphQL Playground: ${SERVICE_URL}/graphql"

# Test the deployed service
echo "🧪 Testing deployment..."
if curl -f -s "${SERVICE_URL}/graphql" -H "Content-Type: application/json" -d '{"query":"{ health }"}' > /dev/null; then
    echo "✅ Service is responding correctly!"
else
    echo "⚠️  Service might not be ready yet. Please check logs: gcloud run logs read ${SERVICE_NAME} --region=${REGION}"
fi

echo "🎉 Deployment complete! Your MCP Orchestrator v1 is now running on Cloud Run."
