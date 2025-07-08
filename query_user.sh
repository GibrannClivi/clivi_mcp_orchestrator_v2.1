#!/bin/bash

# Script para consultar usuario por email
# Uso: ./query_user.sh <email> [complete]

EMAIL="$1"
COMPLETE="$2"

if [ -z "$EMAIL" ]; then
    echo "❌ Por favor proporciona un email como argumento"
    echo "Uso: ./query_user.sh <email> [complete]"
    echo "Ejemplo: ./query_user.sh saidh.jimenez@clivi.com.mx"
    echo "Ejemplo completo: ./query_user.sh saidh.jimenez@clivi.com.mx complete"
    exit 1
fi

# Verificar si el servidor está corriendo
if ! curl -s -H "Content-Type: application/json" -d '{"query": "{ health }"}' http://localhost:4000/ > /dev/null 2>&1; then
    echo "❌ El servidor MCP Orchestrator no está corriendo"
    echo "Ejecuta: npm start"
    exit 1
fi

echo "🚀 Servidor MCP Orchestrator detectado en http://localhost:4000/"

if [ "$COMPLETE" = "complete" ]; then
    echo "📋 Ejecutando consulta completa..."
    npx ts-node complete_user_query.ts "$EMAIL"
else
    echo "📋 Ejecutando consulta rápida..."
    npx ts-node query_user.ts "$EMAIL"
fi
