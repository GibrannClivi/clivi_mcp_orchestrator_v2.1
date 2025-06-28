#!/bin/bash

# 🧪 Extended Testing Script para MCP Orchestrator v1
# Prueba múltiples usuarios y escenarios edge cases

set -e

API_URL="http://localhost:4001/"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="test_results_${TIMESTAMP}.log"

echo "🚀 Iniciando pruebas extensivas del MCP Orchestrator v1"
echo "📝 Guardando resultados en: $LOG_FILE"
echo "🕒 Timestamp: $(date)"
echo "=" | tr '=' '-' | head -c 80
echo ""

# Función para realizar query GraphQL
query_user() {
    local query_value="$1"
    local test_name="$2"
    local additional_fields="${3:-}"
    
    echo "🔍 Test: $test_name"
    echo "📞 Query: '$query_value'"
    
    local graphql_query='{
        "query": "query { getUserProfile(query: \"'$query_value'\") { name email phone subscriptionStatus nextBillingAmount planStatus medicine lastTicket { subject status } lastAppointment { date doctor } sourceBreakdown { field source } '$additional_fields' } }"
    }'
    
    echo "⏳ Ejecutando..."
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$graphql_query" \
        "$API_URL" 2>/dev/null)
    
    echo "📊 Respuesta:"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    echo "=" | tr '=' '-' | head -c 80
    echo ""
    
    # Log the results
    {
        echo "=== $test_name ==="
        echo "Query: $query_value"
        echo "Response: $response"
        echo ""
    } >> "$LOG_FILE"
}

# Test 1: Usuarios conocidos (casos base)
echo "📋 CATEGORÍA 1: Usuarios Conocidos"
echo "=" | tr '=' '-' | head -c 40

query_user "kyle@kjernigan.net" "Usuario Kyle - Email"
query_user "jair.morales@clivi.com.mx" "Usuario Jair - Email"
query_user "Jose Antonio Trejo Torres" "Usuario José - Nombre completo"
query_user "Cristian Rosillo" "Usuario Cristian - Nombre completo [REAL DATA]"

# Test 2: Variaciones de formato de email
echo "📋 CATEGORÍA 2: Variaciones de Email"
echo "=" | tr '=' '-' | head -c 40

query_user "KYLE@kjernigan.net" "Email con mayúsculas"
query_user "kyle@KJERNIGAN.NET" "Dominio en mayúsculas"
query_user "  kyle@kjernigan.net  " "Email con espacios"
query_user "jair.morales@CLIVI.COM.MX" "Email mixto mayúsculas"

# Test 3: Variaciones de nombres
echo "📋 CATEGORÍA 3: Variaciones de Nombres"
echo "=" | tr '=' '-' | head -c 40

query_user "kyle" "Nombre simple"
query_user "Kyle Jernigan" "Nombre y apellido"
query_user "jose antonio" "Nombre con minúsculas"
query_user "JOSE ANTONIO TREJO TORRES" "Nombre completo mayúsculas"
query_user "Dr. Jose Antonio Trejo Torres" "Nombre con título"
query_user "jose trejo" "Nombre parcial"

# Test 4: Números de teléfono (diferentes formatos)
echo "📋 CATEGORÍA 4: Formatos de Teléfono"
echo "=" | tr '=' '-' | head -c 40

query_user "+1234567890" "Teléfono internacional"
query_user "1234567890" "Teléfono sin prefijo"
query_user "+52 55 1234 5678" "Teléfono con espacios"
query_user "+52-55-1234-5678" "Teléfono con guiones"
query_user "(555) 123-4567" "Teléfono US format"
query_user "555.123.4567" "Teléfono con puntos"

# Test 5: Edge cases y caracteres especiales
echo "📋 CATEGORÍA 5: Edge Cases"
echo "=" | tr '=' '-' | head -c 40

query_user "test@example.com" "Email no existente"
query_user "12345" "Número corto"
query_user "a" "Query muy corto"
query_user "María José González-Pérez" "Nombre con acentos y guión"
query_user "user+tag@domain.com" "Email con símbolo +"
query_user "" "Query vacío"

# Test 6: Queries complejas (casos límite)
echo "📋 CATEGORÍA 6: Casos Límite"
echo "=" | tr '=' '-' | head -c 40

query_user "this.is.a.very.long.email.address.that.might.cause.issues@some-very-long-domain-name.com" "Email muy largo"
query_user "José María de la Cruz Martínez-López y Fernández" "Nombre muy largo"
query_user "+1234567890123456789" "Teléfono muy largo"
query_user "user@" "Email incompleto"
query_user "@domain.com" "Email sin usuario"

# Test 7: Caracteres especiales y Unicode
echo "📋 CATEGORÍA 7: Unicode y Caracteres Especiales"
echo "=" | tr '=' '-' | head -c 40

query_user "josé@méxico.com" "Email con caracteres especiales"
query_user "李小明" "Nombre en chino"
query_user "محمد عبدالله" "Nombre en árabe"
query_user "Владимир Путин" "Nombre en cirílico"
query_user "🚀🎯@test.com" "Email con emojis"

# Test 8: Performance tests (múltiples queries rápidas)
echo "📋 CATEGORÍA 8: Test de Performance"
echo "=" | tr '=' '-' | head -c 40

echo "🚀 Ejecutando 5 queries rápidas para probar cache..."
for i in {1..5}; do
    echo "🔄 Query $i/5..."
    query_user "kyle@kjernigan.net" "Cache test $i" >/dev/null 2>&1 &
done
wait
echo "✅ Performance tests completados"

# Test 9: Validación de campos específicos
echo "📋 CATEGORÍA 9: Campos Específicos"
echo "=" | tr '=' '-' | head -c 40

query_user "kyle@kjernigan.net" "Test campos completos" "createdAt updatedAt metadata"

# Test 10: Health check
echo "📋 CATEGORÍA 10: Health Check"
echo "=" | tr '=' '-' | head -c 40

echo "🏥 Health Check del sistema..."
health_response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "{ health }"}' \
    "$API_URL" 2>/dev/null)

echo "📊 Health Response:"
echo "$health_response" | jq '.' 2>/dev/null || echo "$health_response"

# Resumen final
echo ""
echo "🎉 RESUMEN DE PRUEBAS COMPLETADO"
echo "=" | tr '=' '-' | head -c 80
echo "🕒 Finalizado: $(date)"
echo "📝 Resultados guardados en: $LOG_FILE"
echo "📊 Total de categorías probadas: 10"
echo "🧪 Tipos de tests ejecutados:"
echo "   ✅ Usuarios conocidos"
echo "   ✅ Variaciones de email"
echo "   ✅ Variaciones de nombres"
echo "   ✅ Formatos de teléfono"
echo "   ✅ Edge cases"
echo "   ✅ Casos límite"
echo "   ✅ Unicode y caracteres especiales"
echo "   ✅ Performance y cache"
echo "   ✅ Campos específicos"
echo "   ✅ Health check"
echo ""
echo "📋 Para revisar los resultados detallados:"
echo "   cat $LOG_FILE"
echo "   grep -A 5 'ERROR\\|error' $LOG_FILE  # Ver errores"
echo "   grep -c 'Response:' $LOG_FILE  # Contar respuestas"
