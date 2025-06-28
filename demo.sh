#!/bin/bash

# MCP Orchestrator v1 - Demo Script
# Muestra las capacidades del API GraphQL con datos reales

echo "🚀 MCP Orchestrator v1 - Demo en Vivo"
echo "=================================="
echo ""

# URL del servidor GraphQL
GRAPHQL_URL="http://localhost:4001"

echo "📊 Estado del servidor GraphQL:"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health }"}' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n🔍 Demo 1: Consulta por Email (Kyle Jernigan)"
echo "============================================"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"kyle@kjernigan.net\") { name email phone subscriptionStatus nextBillingAmount planStatus medicine lastAppointment { date status } sourceBreakdown { field source } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n🔍 Demo 2: Consulta por Nombre (Jose Antonio)"
echo "============================================="
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"Jose Antonio Trejo Torres\") { name email subscriptionStatus planStatus medicine lastTicket { subject status } lastAppointment { date doctor } sourceBreakdown { field source } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n🔍 Demo 3: Usuario no encontrado (fallback)"
echo "==========================================="
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"usuario.nuevo@example.com\") { name email subscriptionStatus planStatus sourceBreakdown { field source } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n📈 Demo 4: Introspección del Schema GraphQL"
echo "==========================================="
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { __schema { queryType { name fields { name type { name } } } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n✅ Demo completado - MCP Orchestrator v1 funcionando correctamente!"
echo "🌐 GraphQL Playground disponible en: http://localhost:4001/"
echo "📚 Documentación completa en el README.md"
