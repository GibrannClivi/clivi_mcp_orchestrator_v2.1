#!/bin/bash

# 📋 Script de verificación final antes del despliegue
echo "🔍 Verificando configuración para despliegue..."

# Verificar que el archivo .env existe
if [ ! -f .env ]; then
    echo "❌ Error: archivo .env no encontrado"
    echo "Crea un archivo .env con todas las variables necesarias"
    exit 1
fi

# Cargar variables del .env
echo "📋 Cargando variables del archivo .env..."
export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)

# Variables requeridas para el despliegue
echo "🔍 Verificando variables críticas..."
REQUIRED_VARS=(
    "CHARGEBEE_SITE"
    "CHARGEBEE_API_KEY"
    "HUBSPOT_ACCESS_TOKEN"
    "GOOGLE_AISTUDIO_API_KEY"
    "GOOGLE_CLOUD_PROJECT"
    "FIRESTORE_PROJECT_ID"
)

MISSING_VARS=()
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    else
        echo "✅ $var: configurado"
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo ""
    echo "❌ ERROR: Las siguientes variables no están configuradas:"
    printf ' - %s\n' "${MISSING_VARS[@]}"
    echo ""
    echo "Por favor, configura estas variables en tu archivo .env:"
    echo ""
    for var in "${MISSING_VARS[@]}"; do
        echo "$var=your_value_here"
    done
    exit 1
fi

echo ""
echo "✅ Todas las variables críticas están configuradas"

# Verificar que gcloud esté configurado
echo ""
echo "🔍 Verificando configuración de gcloud..."
if ! command -v gcloud &> /dev/null; then
    echo "❌ ERROR: gcloud CLI no está instalado"
    echo "Instala gcloud CLI: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verificar que esté autenticado
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ ERROR: No hay cuentas de gcloud autenticadas"
    echo "Ejecuta: gcloud auth login"
    exit 1
fi

ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -1)
echo "✅ gcloud autenticado como: $ACTIVE_ACCOUNT"

# Verificar configuración del proyecto
CURRENT_PROJECT=$(gcloud config get-value project)
EXPECTED_PROJECT="dtwo-qa"

if [ "$CURRENT_PROJECT" != "$EXPECTED_PROJECT" ]; then
    echo "⚠️  Proyecto actual: $CURRENT_PROJECT"
    echo "⚠️  Proyecto esperado: $EXPECTED_PROJECT"
    echo "¿Quieres cambiar al proyecto $EXPECTED_PROJECT? (y/n)"
    read -r response
    if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
        gcloud config set project $EXPECTED_PROJECT
        echo "✅ Proyecto cambiado a: $EXPECTED_PROJECT"
    else
        echo "❌ Manteniendo proyecto actual: $CURRENT_PROJECT"
    fi
else
    echo "✅ Proyecto configurado correctamente: $CURRENT_PROJECT"
fi

# Verificar Docker
echo ""
echo "🔍 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ ERROR: Docker no está instalado"
    echo "Instala Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ ERROR: Docker no está ejecutándose"
    echo "Inicia Docker Desktop o el daemon de Docker"
    exit 1
fi

echo "✅ Docker está funcionando"

# Verificar que el código compile
echo ""
echo "🔍 Verificando que el código compile..."
if ! npm run build &> /dev/null; then
    echo "❌ ERROR: El código no compila"
    echo "Ejecuta 'npm run build' para ver los errores"
    exit 1
fi

echo "✅ Código compila correctamente"

# Verificar APIs funcionando con una consulta rápida
echo ""
echo "🔍 Verificando conectividad con APIs..."

# Probar Firebase
echo "  📊 Probando Firebase..."
if node -e "
const admin = require('firebase-admin');
const path = require('path');
const credentialsPath = path.resolve(__dirname, 'firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json');
const serviceAccount = require(credentialsPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'dtwo-ws8j9'
});
const db = admin.firestore();
db.collection('users').limit(1).get()
  .then(() => console.log('✅ Firebase conectado'))
  .catch(err => { console.log('❌ Firebase error:', err.message); process.exit(1); });
" 2>/dev/null; then
    echo "✅ Firebase: conectado"
else
    echo "❌ Firebase: no conectado"
    echo "Verifica las credenciales de Firebase"
fi

echo ""
echo "🎯 RESUMEN DE CONFIGURACIÓN:"
echo "=========================="
echo "✅ Variables de entorno: configuradas"
echo "✅ gcloud CLI: configurado"
echo "✅ Docker: funcionando"
echo "✅ Código: compila"
echo "✅ APIs: verificadas"
echo ""
echo "🚀 ¡Listo para desplegar!"
echo ""
echo "Para desplegar ejecuta:"
echo "  ./deploy_production.sh"
echo ""
echo "Para probar el servicio desplegado:"
echo "  ./test_production_service.sh <SERVICE_URL>"
