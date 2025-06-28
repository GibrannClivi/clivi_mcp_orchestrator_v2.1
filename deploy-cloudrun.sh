#!/bin/bash

# MCP Orchestrator v1 - Cloud Run Deployment Script
# Usage: ./deploy-cloudrun.sh [PROJECT_ID] [REGION]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${1:-"your-project-id"}
REGION=${2:-"us-central1"}
SERVICE_NAME="mcp-orchestrator-v1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo -e "${BLUE}🚀 Starting deployment of MCP Orchestrator v1 to Cloud Run${NC}"
echo -e "${BLUE}Project: ${PROJECT_ID}${NC}"
echo -e "${BLUE}Region: ${REGION}${NC}"
echo -e "${BLUE}Service: ${SERVICE_NAME}${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud CLI not found. Please install it first.${NC}"
    echo -e "${YELLOW}Visit: https://cloud.google.com/sdk/docs/install${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Verify project exists
echo -e "${YELLOW}🔍 Verifying Google Cloud project...${NC}"
if ! gcloud projects describe "$PROJECT_ID" &> /dev/null; then
    echo -e "${RED}❌ Project $PROJECT_ID not found or no access.${NC}"
    echo -e "${YELLOW}Please check your project ID and permissions.${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}⚙️  Setting Google Cloud project...${NC}"
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo -e "${YELLOW}🔌 Enabling required Google Cloud APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    --project="$PROJECT_ID"

# Configure Docker for GCR
echo -e "${YELLOW}🐳 Configuring Docker for Google Container Registry...${NC}"
gcloud auth configure-docker --quiet

# Build the Docker image
echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
docker build -t "$IMAGE_NAME:latest" .

# Push the image to GCR
echo -e "${YELLOW}📤 Pushing image to Google Container Registry...${NC}"
docker push "$IMAGE_NAME:latest"

# Deploy to Cloud Run
echo -e "${YELLOW}🚀 Deploying to Cloud Run...${NC}"
gcloud run deploy "$SERVICE_NAME" \
    --image="$IMAGE_NAME:latest" \
    --platform=managed \
    --region="$REGION" \
    --allow-unauthenticated \
    --port=8080 \
    --memory=1Gi \
    --cpu=1 \
    --max-instances=10 \
    --min-instances=0 \
    --concurrency=100 \
    --timeout=300 \
    --set-env-vars="NODE_ENV=production,PORT=8080,GRAPHQL_ENDPOINT=/graphql,CACHE_TTL=7200,LOG_LEVEL=info" \
    --project="$PROJECT_ID"

# Get the service URL
SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --project="$PROJECT_ID" --format="value(status.url)")

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Service URL: ${SERVICE_URL}${NC}"
echo -e "${GREEN}📊 GraphQL Endpoint: ${SERVICE_URL}/graphql${NC}"
echo -e "${GREEN}🏥 Health Check: ${SERVICE_URL}/health${NC}"

# Test the deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"
if curl -s -f "${SERVICE_URL}/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed!${NC}"
else
    echo -e "${RED}❌ Health check failed. Check the logs.${NC}"
fi

echo -e "${BLUE}📋 Next steps:${NC}"
echo -e "${BLUE}1. Set your MCP credentials using:${NC}"
echo -e "${YELLOW}   gcloud run services update ${SERVICE_NAME} --region=${REGION} \\${NC}"
echo -e "${YELLOW}     --set-env-vars=\"CHARGEBEE_API_KEY=your_key,HUBSPOT_API_KEY=your_key\"${NC}"
echo -e "${BLUE}2. Test the GraphQL API:${NC}"
echo -e "${YELLOW}   curl -X POST ${SERVICE_URL}/graphql \\${NC}"
echo -e "${YELLOW}     -H \"Content-Type: application/json\" \\${NC}"
echo -e "${YELLOW}     -d '{\"query\":\"{ health }\"}'${NC}"
echo -e "${BLUE}3. Monitor logs:${NC}"
echo -e "${YELLOW}   gcloud logs tail projects/${PROJECT_ID}/logs/run.googleapis.com%2Frequests${NC}"

echo -e "${GREEN}🎉 MCP Orchestrator v1 is now running on Cloud Run!${NC}"
