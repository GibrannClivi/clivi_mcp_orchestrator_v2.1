#!/bin/bash

# MCP Orchestrator v1 - Demo específico para Jair Morales Olvera
# Demuestra las capacidades completas del sistema con datos reales

echo "🎯 MCP Orchestrator v1 - Demo: Jair Morales Olvera"
echo "================================================="
echo ""

# URL del servidor GraphQL
GRAPHQL_URL="http://localhost:4001"

echo "🔍 Consulta 1: Por Nombre Completo"
echo "=================================="
echo "Query: Jair Morales Olvera"
echo ""
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"Jair Morales Olvera\") { name email phone subscriptionStatus nextBillingAmount nextBillingDate planStatus medicine lastTicket { subject status createdAt } lastAppointment { date status } sourceBreakdown { field source } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n🔍 Consulta 2: Por Email"
echo "======================="
echo "Query: jair.morales@consultoria.mx"
echo ""
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"jair.morales@consultoria.mx\") { name email subscriptionStatus nextBillingAmount planStatus medicine selfSupplyLogs lastTicket { subject status } sourceBreakdown { field value source } } }"
  }' \
  "$GRAPHQL_URL" | python3 -m json.tool

echo -e "\n\n📊 Análisis de Datos Consolidados"
echo "================================="
echo "✅ Datos de Chargebee MCP:"
echo "   - Subscription: Enterprise Yearly ($899.99)"
echo "   - Next Billing: 2026-01-15"
echo "   - Customer ID: cust_jair_003"
echo ""
echo "✅ Datos de HubSpot MCP:"
echo "   - Contact: CEO & Founder"
echo "   - Company: Consultoría Tecnológica MX"
echo "   - Active Ticket: Integración API Enterprise (High Priority)"
echo "   - Lead Score: 98/100"
echo ""
echo "✅ Datos de Firebase MCP:"
echo "   - Plan Médico: Plan Ejecutivo Premium"
echo "   - Medicamentos: 3 suplementos (Omega-3, Vitamina D3, Magnesio)"
echo "   - Última Cita: Chequeo ejecutivo anual (Completado)"
echo "   - Próxima Cita: Seguimiento nutricional (20 Jul 2025)"
echo ""
echo "🎯 Source Tracking:"
echo "   - Chargebee: Billing & subscription data"
echo "   - HubSpot: CRM & customer support data"
echo "   - Firebase: Medical & wellness data"

echo -e "\n\n🚀 ¡Demo completado! Jair Morales Olvera - Cliente Enterprise"
echo "Todos los datos consolidados exitosamente desde 3 fuentes MCP"

# Demo: Consulta completa de todos los campos para gracelucely@nomail.com
GRAPHQL_URL="https://mcp-orchestrator-v1-456314813706.us-central1.run.app"

curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getUserProfile(query: \"gracelucely@nomail.com\") { name firstName lastName email phone company jobTitle subscriptionStatus planId nextBillingAmount nextBillingDate billingCycle customerId subscriptionId contactId lastActivity dealStage leadScore lastTicket { ticketId subject status priority createdAt assignedTo } userId planStatus medicalPlan medicine medicineCount selfSupplyLogs lastAppointment { appointmentId date type doctor status location notes } nextAppointment { appointmentId date type doctor status location notes } allergies emergencyContact { name phone relationship } sourceBreakdown { field value source } } }"
  }' \
  "$GRAPHQL_URL/graphql" | python3 -m json.tool
