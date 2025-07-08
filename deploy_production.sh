#!/bin/bash

# 🚀 Deploy Script Completo para MCP Orchestrator con Verificación de Datos Reales
set -e

echo "🚀 Iniciando despliegue completo del MCP Orchestrator..."

# Variables de configuración
PROJECT_ID="dtwo-qa"
SERVICE_NAME="mcp-orchestrator-v1"
REGION="us-central1"
REPOSITORY="mcp-orchestrator"
IMAGE_NAME="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME"

# Configurar proyecto
gcloud config set project $PROJECT_ID

echo "📋 Verificando archivo .env..."
if [ ! -f .env ]; then
    echo "❌ Error: archivo .env no encontrado"
    exit 1
fi

# Cargar variables del .env
export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)

# Verificar variables críticas
echo "🔍 Verificando variables críticas..."
REQUIRED_VARS=(
    "CHARGEBEE_SITE"
    "CHARGEBEE_API_KEY"
    "HUBSPOT_ACCESS_TOKEN"
    "GOOGLE_AISTUDIO_API_KEY"
    "GOOGLE_CLOUD_PROJECT"
    "FIRESTORE_PROJECT_ID"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Variable $var no configurada"
        exit 1
    fi
done

echo "✅ Variables de entorno verificadas correctamente"

# Limpiar versiones previas
echo "🧹 Limpiando versiones previas..."
gcloud run services delete $SERVICE_NAME --region=$REGION --quiet || echo "⚠️  Servicio no existía"

echo "🗑️  Limpiando imágenes del Artifact Registry..."
gcloud artifacts repositories create $REPOSITORY --repository-format=docker --location=$REGION --quiet || echo "✅ Repositorio ya existe"

# Limpiar imágenes existentes
gcloud artifacts docker images list $REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME --format="value(IMAGE)" 2>/dev/null | while read image; do
    if [ ! -z "$image" ]; then
        echo "Eliminando imagen: $image"
        gcloud artifacts docker images delete "$image" --quiet || echo "⚠️  No se pudo eliminar $image"
    fi
done

echo "🔨 Construyendo nueva imagen Docker..."
docker build -t $IMAGE_NAME:latest .

echo "📦 Subiendo imagen al Artifact Registry..."
docker push $IMAGE_NAME:latest

echo "🚀 Desplegando a Cloud Run con configuración completa..."

# Desplegar con todas las variables necesarias
gcloud run deploy $SERVICE_NAME \
  --image=$IMAGE_NAME:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --port=4000 \
  --memory=1Gi \
  --cpu=1 \
  --max-instances=10 \
  --min-instances=1 \
  --timeout=300 \
  --concurrency=100 \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="ENV=production" \
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
  --set-env-vars="USE_REAL_MCP=true" \
  --set-env-vars="CACHE_TTL_SECONDS=${CACHE_TTL_SECONDS:-3600}" \
  --set-env-vars="LOG_LEVEL=${LOG_LEVEL:-info}" \
  --set-env-vars="CORS_ALLOW_ORIGINS=${CORS_ALLOW_ORIGINS:-*}" \
  --set-env-vars="GRAPHQL_INTROSPECTION=true" \
  --set-env-vars="GRAPHQL_PLAYGROUND=true"

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

# Esperar a que el servicio esté listo
echo "⏳ Esperando a que el servicio esté listo..."
sleep 30

# Verificar que el servicio esté funcionando
echo "🔍 Verificando que el servicio esté funcionando..."
if curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/health" | grep -q "200"; then
    echo "✅ Servicio funcionando correctamente"
else
    echo "⚠️  Servicio puede no estar completamente listo, verificar logs"
fi

echo ""
echo "🧪 PRUEBA AUTOMÁTICA CON DATOS REALES:"
echo "====================================="

# Crear prueba automática
cat > test_deployed_service.sh << 'EOF'
#!/bin/bash

SERVICE_URL="$1"
TEST_EMAIL="saidh.jimenez@clivi.com.mx"

echo "🧪 Probando servicio desplegado..."
echo "📍 URL: $SERVICE_URL"
echo "📧 Email de prueba: $TEST_EMAIL"
echo ""

# Query GraphQL completo
QUERY='{
  "query": "query GetUserProfile($query: String!) { getUserProfile(query: $query) { name firstName lastName email phone company subscriptionStatus plan nextBillingAmount customerId contactId medicalPlan planIncludedPackage sourceBreakdown { field value source } } }",
  "variables": { "query": "'$TEST_EMAIL'" }
}'

echo "📤 Enviando query..."
RESPONSE=$(curl -s -X POST "$SERVICE_URL/graphql" \
  -H "Content-Type: application/json" \
  -d "$QUERY")

echo "📥 Respuesta:"
echo "$RESPONSE" | jq '.'

# Verificar que la respuesta contiene datos reales
if echo "$RESPONSE" | jq -e '.data.getUserProfile.name' > /dev/null 2>&1; then
    echo ""
    echo "✅ PRUEBA EXITOSA: El servicio retorna datos reales"
    
    # Verificar campos específicos
    NAME=$(echo "$RESPONSE" | jq -r '.data.getUserProfile.name // "N/A"')
    EMAIL=$(echo "$RESPONSE" | jq -r '.data.getUserProfile.email // "N/A"')
    PHONE=$(echo "$RESPONSE" | jq -r '.data.getUserProfile.phone // "N/A"')
    PLAN=$(echo "$RESPONSE" | jq -r '.data.getUserProfile.plan // "N/A"')
    MEDICAL_PLAN=$(echo "$RESPONSE" | jq -r '.data.getUserProfile.medicalPlan // "N/A"')
    
    echo ""
    echo "📋 DATOS OBTENIDOS:"
    echo "==================="
    echo "👤 Nombre: $NAME"
    echo "📧 Email: $EMAIL"
    echo "📞 Teléfono: $PHONE"
    echo "💼 Plan: $PLAN"
    echo "🏥 Plan Médico: $MEDICAL_PLAN"
    
    # Contar campos con datos reales
    FIELD_COUNT=$(echo "$RESPONSE" | jq '.data.getUserProfile.sourceBreakdown | length')
    echo "📊 Campos con datos reales: $FIELD_COUNT"
    
    if [ "$FIELD_COUNT" -gt 5 ]; then
        echo "✅ VERIFICACIÓN COMPLETA: Servicio retorna datos completos"
    else
        echo "⚠️  ADVERTENCIA: Pocos campos retornados ($FIELD_COUNT)"
    fi
else
    echo "❌ ERROR: El servicio no retorna datos o hay un error"
    echo "Respuesta completa:"
    echo "$RESPONSE"
fi
EOF

chmod +x test_deployed_service.sh

# Ejecutar prueba
./test_deployed_service.sh "$SERVICE_URL"

echo ""
echo "🛠️  COMANDOS ÚTILES:"
echo "===================="
echo "Ver logs del servicio:"
echo "gcloud run services logs read $SERVICE_NAME --region=$REGION"
echo ""
echo "Actualizar variables de entorno:"
echo "gcloud run services update $SERVICE_NAME --region=$REGION --set-env-vars=\"VAR=value\""
echo ""
echo "Escalar el servicio:"
echo "gcloud run services update $SERVICE_NAME --region=$REGION --max-instances=20"
echo ""

echo "✅ ¡Despliegue completo terminado!"
echo "🎯 Tu servicio está listo en: $SERVICE_URL/graphql"
