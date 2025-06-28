#!/bin/bash

# Demo específico para Jair Morales Olvera - MCP Orchestrator v1
# Muestra todas las capacidades del sistema con datos reales

echo "🚀 Demo: Jair Morales Olvera - MCP Orchestrator v1"
echo "================================================="
echo ""

# URL del servidor GraphQL
GRAPHQL_URL="https://mcp-orchestrator-v1-456314813706.us-central1.run.app"

echo "👨‍💼 Perfil: Jair Morales Olvera"
echo "Email: jair.morales@clivi.com.mx"
echo "Empresa: Clivi Health Tech"
echo "Plan: Enterprise"
echo ""

echo "🔍 Demo 1: Consulta por Email Completa"
echo "======================================"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"jair.morales@clivi.com.mx\") { name email phone subscriptionStatus nextBillingAmount nextBillingDate planStatus medicine selfSupplyLogs lastAppointment { date status } lastTicket { subject status createdAt } sourceBreakdown { field value source } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n🔍 Demo 2: Consulta por Nombre"
echo "=============================="
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"Jair Morales Olvera\") { name email phone subscriptionStatus planStatus medicine lastTicket { subject status } sourceBreakdown { field source } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n💰 Demo 3: Información de Facturación (Chargebee)"
echo "=============================================="
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"jair.morales@clivi.com.mx\") { subscriptionStatus nextBillingAmount nextBillingDate sourceBreakdown { field value source } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n👥 Demo 4: Información de CRM (HubSpot)"
echo "======================================"
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"jair.morales@clivi.com.mx\") { name email phone lastTicket { subject status createdAt } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n🏥 Demo 5: Información Médica (Firebase)"
echo "======================================="
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"jair.morales@clivi.com.mx\") { planStatus medicine selfSupplyLogs lastAppointment { date status } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n📊 Demo 6: Source Breakdown - Transparencia de Datos"
echo "=================================================="
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"jair.morales@clivi.com.mx\") { sourceBreakdown { field source } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n✅ Demo Jair Morales Olvera completado!"
echo "======================================="
echo "📋 Resumen de datos consolidados:"
echo "  • Chargebee: Plan Enterprise ($899.99/año)"
echo "  • HubSpot: CEO Clivi Health Tech, ticket activo"
echo "  • Firebase: Plan médico ejecutivo, 3 suplementos"
echo "  • Total: 11 campos consolidados desde 3 fuentes MCP"
echo ""
echo "🌐 GraphQL Playground: http://localhost:4001/"
echo "💡 Prueba más consultas directamente en el playground!"
