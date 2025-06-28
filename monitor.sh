#!/bin/bash

# MCP Orchestrator v1 - Health Check and Monitoring Script

SERVICE_URL="https://mcp-orchestrator-v1-zpittimqlq-uc.a.run.app"
SERVICE_NAME="mcp-orchestrator-v1"
REGION="us-central1"

echo "🔍 MCP Orchestrator v1 - Health Check & Monitoring"
echo "=================================================="

# Function to check service health
check_health() {
    echo "🏥 Checking service health..."
    
    # Health check endpoint
    if curl -f -s "${SERVICE_URL}/graphql" -H "Content-Type: application/json" -d '{"query":"{ health }"}' | grep -q "healthy"; then
        echo "✅ Health check: PASSED"
        return 0
    else
        echo "❌ Health check: FAILED"
        return 1
    fi
}

# Function to check GraphQL introspection
check_introspection() {
    echo "🔍 Checking GraphQL schema introspection..."
    
    if curl -f -s "${SERVICE_URL}/graphql" -H "Content-Type: application/json" -d '{"query":"{ __schema { types { name } } }"}' | grep -q "__schema"; then
        echo "✅ GraphQL introspection: WORKING"
        return 0
    else
        echo "❌ GraphQL introspection: FAILED"
        return 1
    fi
}

# Function to get service status from Cloud Run
get_service_status() {
    echo "📊 Getting Cloud Run service status..."
    
    gcloud run services describe ${SERVICE_NAME} \
        --region=${REGION} \
        --format="table(metadata.name,status.url,status.conditions[0].status,spec.template.spec.containers[0].image)"
}

# Function to get recent logs
get_recent_logs() {
    echo "📋 Getting recent logs (last 10 entries)..."
    
    gcloud run logs read ${SERVICE_NAME} \
        --region=${REGION} \
        --limit=10 \
        --format="table(timestamp,severity,textPayload)"
}

# Function to get service metrics
get_metrics() {
    echo "📈 Service metrics and info..."
    
    echo "🌐 Service URL: ${SERVICE_URL}"
    echo "📍 Region: ${REGION}"
    echo "🏷️  Service: ${SERVICE_NAME}"
    
    # Get revision info
    REVISION=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.latestReadyRevisionName)")
    echo "🔄 Latest Revision: ${REVISION}"
    
    # Check if service is ready
    STATUS=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format="value(status.conditions[0].status)")
    echo "🚦 Status: ${STATUS}"
}

# Main execution
echo ""
get_metrics
echo ""
check_health
echo ""
check_introspection
echo ""
get_service_status
echo ""

# Ask user if they want to see logs
read -p "📋 Do you want to see recent logs? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    get_recent_logs
fi

echo ""
echo "🎯 Monitoring complete!"
echo "💡 For continuous monitoring, run: watch -n 30 ./monitor.sh"
echo "📊 For detailed metrics, visit: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}/metrics"
