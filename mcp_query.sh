#!/bin/bash

# Script universal para consultas del MCP Orchestrator
# Uso: ./mcp_query.sh <email> [tipo]
# Tipos: quick, complete, medical, subscription, graphql

EMAIL="$1"
TYPE="$2"

if [ -z "$EMAIL" ]; then
    echo "❌ Por favor proporciona un email como argumento"
    echo ""
    echo "Uso: ./mcp_query.sh <email> [tipo]"
    echo ""
    echo "Tipos disponibles:"
    echo "  quick       - Consulta rápida con campos básicos (por defecto)"
    echo "  complete    - Consulta completa con todos los campos"
    echo "  medical     - Solo información médica"
    echo "  subscription - Solo información de suscripción"
    echo "  graphql     - Consulta GraphQL directa con cURL"
    echo ""
    echo "Ejemplos:"
    echo "  ./mcp_query.sh saidh.jimenez@clivi.com.mx"
    echo "  ./mcp_query.sh saidh.jimenez@clivi.com.mx complete"
    echo "  ./mcp_query.sh saidh.jimenez@clivi.com.mx medical"
    exit 1
fi

# Verificar si el servidor está corriendo
if ! curl -s -H "Content-Type: application/json" -d '{"query": "{ health }"}' http://localhost:4000/ > /dev/null 2>&1; then
    echo "❌ El servidor MCP Orchestrator no está corriendo"
    echo "Ejecuta: npm start"
    exit 1
fi

echo "🚀 Servidor MCP Orchestrator detectado en http://localhost:4000/"

# Establecer tipo por defecto
if [ -z "$TYPE" ]; then
    TYPE="quick"
fi

case "$TYPE" in
    "quick")
        echo "📋 Ejecutando consulta rápida..."
        npx ts-node query_user.ts "$EMAIL"
        ;;
    "complete")
        echo "📋 Ejecutando consulta completa..."
        npx ts-node complete_user_query.ts "$EMAIL"
        ;;
    "medical")
        echo "🏥 Ejecutando consulta médica..."
        curl -X POST \
          -H "Content-Type: application/json" \
          -d "{\"query\": \"{ getUserProfile(query: \\\"$EMAIL\\\") { name email userId planStatus medicalPlan planIncludedPackage treatments medicine medicineCount allergies lastAppointment { date type doctor status } nextAppointment { date type doctor } emergencyContact { name phone relationship } sourceBreakdown { field value source } } }\"}" \
          http://localhost:4000/ | jq '.'
        ;;
    "subscription")
        echo "💳 Ejecutando consulta de suscripción..."
        curl -X POST \
          -H "Content-Type: application/json" \
          -d "{\"query\": \"{ getUserProfile(query: \\\"$EMAIL\\\") { name email subscriptionStatus plan nextBillingAmount nextBillingDate billingCycle customerId subscriptionId lastTwoPayments { id status amount currency createdAt } sourceBreakdown { field value source } } }\"}" \
          http://localhost:4000/ | jq '.'
        ;;
    "graphql")
        echo "🔍 Ejecutando consulta GraphQL directa..."
        ./graphql_complete_query.sh "$EMAIL"
        ;;
    *)
        echo "❌ Tipo de consulta no válido: $TYPE"
        echo "Tipos disponibles: quick, complete, medical, subscription, graphql"
        exit 1
        ;;
esac
