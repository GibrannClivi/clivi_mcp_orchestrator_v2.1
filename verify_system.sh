#!/bin/bash

# Sistema de Perfiles Unificados - Verificación Rápida
# Este script verifica que el sistema esté funcionando correctamente

echo "🎯 VERIFICACIÓN DEL SISTEMA DE PERFILES UNIFICADOS"
echo "================================================="
echo ""

# URL del servicio
URL="https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql"

echo "🌐 Endpoint: $URL"
echo ""

# Test básico con usuario conocido
echo "🔍 Probando con usuario: saidh.jimenez@clivi.com.mx"
echo ""

# Query GraphQL simple
QUERY='{
  "query": "query getUserProfile($query: String!) { getUserProfile(query: $query) { name email customerId contactId userId subscriptionStatus plan sourceBreakdown { field value source } } }",
  "variables": { "query": "saidh.jimenez@clivi.com.mx" }
}'

# Hacer la consulta
RESPONSE=$(curl -s -X POST "$URL" \
  -H "Content-Type: application/json" \
  -d "$QUERY")

# Verificar respuesta
if echo "$RESPONSE" | grep -q "Saidh jimenez"; then
  echo "✅ Sistema funcionando correctamente"
  echo "📋 Usuario encontrado: $(echo "$RESPONSE" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)"
  echo "💳 Customer ID: $(echo "$RESPONSE" | grep -o '"customerId":"[^"]*"' | cut -d'"' -f4)"
  echo "📊 Estado: $(echo "$RESPONSE" | grep -o '"subscriptionStatus":"[^"]*"' | cut -d'"' -f4)"
else
  echo "❌ Error en el sistema"
  echo "Respuesta: $RESPONSE"
fi

echo ""
echo "🎉 Verificación completada"
