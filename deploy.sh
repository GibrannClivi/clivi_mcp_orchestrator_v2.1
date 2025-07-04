#!/bin/bash

# 🚀 Deploy Script para MCP Orchestrator con Variables de Entorno
set -e

echo "🧹 Limpiando versiones previas de Cloud Run y Artifact Registry..."

# Variables
PROJECT_ID="dtwo-qa"
SERVICE_NAME="mcp-orchestrator-v1"
REGION="us-central1"
REPOSITORY="mcp-orchestrator"
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME"

# Configurar proyecto
gcloud config set project $PROJECT_ID

echo "🗑️  Eliminando servicio existente de Cloud Run..."
gcloud run services delete $SERVICE_NAME --region=$REGION --quiet || echo "⚠️  Servicio no existía"

echo "🗑️  Limpiando imágenes del Artifact Registry..."
# Crear repositorio si no existe
gcloud artifacts repositories create $REPOSITORY --repository-format=docker --location=$REGION --quiet || echo "✅ Repositorio ya existe"

# Listar y eliminar imágenes existentes
gcloud artifacts docker images list $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME --format="value(IMAGE)" | while read image; do
    echo "Eliminando imagen: $image"
    gcloud artifacts docker images delete "$image" --quiet || echo "⚠️  No se pudo eliminar $image"
done

echo "🔨 Construyendo nueva imagen Docker..."
docker build -t $IMAGE_NAME:latest .

echo "📦 Subiendo imagen al Artifact Registry..."
docker push $IMAGE_NAME:latest

echo "🚀 Desplegando a Cloud Run con variables de entorno..."

# Cargar variables del archivo .env y verificar que se leyeron correctamente
echo "📋 Cargando variables de entorno desde .env..."
if [ ! -f .env ]; then
    echo "❌ Error: archivo .env no encontrado"
    exit 1
fi

# Exportar variables del .env
export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)

# Verificar variables críticas
echo "🔍 Verificando variables críticas..."
if [ -z "$CHARGEBEE_SITE" ] || [ -z "$CHARGEBEE_API_KEY" ]; then
    echo "❌ Error: Variables de Chargebee no configuradas"
    exit 1
fi

if [ -z "$HUBSPOT_ACCESS_TOKEN" ]; then
    echo "❌ Error: Variables de HubSpot no configuradas"
    exit 1
fi

if [ -z "$GOOGLE_AISTUDIO_API_KEY" ]; then
    echo "❌ Error: Variables de Google AI Studio no configuradas"
    exit 1
fi

echo "✅ Variables de entorno verificadas correctamente"

gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_NAME:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=4001 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --timeout=300 \
  --set-env-vars="ENV=$ENV" \
  --set-env-vars="PROJECT_NAME=$PROJECT_NAME" \
  --set-env-vars="CHARGEBEE_SITE=$CHARGEBEE_SITE" \
  --set-env-vars="CHARGEBEE_API_KEY=$CHARGEBEE_API_KEY" \
  --set-env-vars="GOOGLE_AISTUDIO_API_KEY=$GOOGLE_AISTUDIO_API_KEY" \
  --set-env-vars="HUBSPOT_ACCESS_TOKEN=$HUBSPOT_ACCESS_TOKEN" \
  --set-env-vars="HUBSPOT_API_KEY=$HUBSPOT_API_KEY" \
  --set-env-vars="HUBSPOT_PORTAL_ID=$HUBSPOT_PORTAL_ID" \
  --set-env-vars="HUBSPOT_CLIENT_SECRET=$HUBSPOT_CLIENT_SECRET" \
  --set-env-vars="PRIVATE_APP_ACCESS_TOKEN=$PRIVATE_APP_ACCESS_TOKEN" \
  --set-env-vars="GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT" \
  --set-env-vars="FIRESTORE_PROJECT_ID=$FIRESTORE_PROJECT_ID" \
  --set-env-vars="USE_REAL_MCP=$USE_REAL_MCP" \
  --set-env-vars="CACHE_TTL_SECONDS=$CACHE_TTL_SECONDS" \
  --set-env-vars="LOG_LEVEL=$LOG_LEVEL" \
  --set-env-vars="CORS_ALLOW_ORIGINS=$CORS_ALLOW_ORIGINS" \
  --set-env-vars="GRAPHQL_INTROSPECTION=$GRAPHQL_INTROSPECTION" \
  --set-env-vars="GRAPHQL_PLAYGROUND=$GRAPHQL_PLAYGROUND"

echo "✅ Despliegue completado!"

# Obtener la URL del servicio
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "🎯 INFORMACIÓN DEL DESPLIEGUE:"
echo "================================="
echo "📍 Service URL: $SERVICE_URL"
echo "📍 GraphQL Endpoint: $SERVICE_URL/graphql"
echo "📍 Health Check: $SERVICE_URL/health"
echo "📍 Región: $REGION"
echo "📍 Proyecto: $PROJECT_ID"
echo ""

echo "🧪 QUERY DE PRUEBA PARA POSTMAN:"
echo "================================="
echo "Method: POST"
echo "URL: $SERVICE_URL/graphql"
echo "Headers:"
echo "  Content-Type: application/json"
echo ""
echo "Body (JSON):"
cat << EOF
{
  "query": "query GetUserProfile(\$query: String!) { getUserProfile(query: \$query) { name firstName lastName email phone company subscriptionStatus plan nextBillingAmount customerId contactId sourceBreakdown { field value source } } }",
  "variables": { "query": "saidh.jimenez@clivi.com.mx" }
}
EOF

echo ""
echo ""
echo "🔍 CURL DE PRUEBA:"
echo "=================="
echo "curl -X POST $SERVICE_URL/graphql \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"query\": \"query GetUserProfile(\\\$query: String!) { getUserProfile(query: \\\$query) { name firstName lastName email phone company subscriptionStatus plan nextBillingAmount customerId contactId sourceBreakdown { field value source } } }\","
echo "    \"variables\": { \"query\": \"saidh.jimenez@clivi.com.mx\" }"
echo "  }'"

echo ""
echo "✅ Listo para usar!"
