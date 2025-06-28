#!/bin/bash

# 🧪 Test de Usuario Real - Cristian Rosillo
# Prueba el sistema con datos reales de los MCP servers

set -e

API_URL="http://localhost:4001/"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="test_cristian_rosillo_${TIMESTAMP}.log"

echo "🚀 Test de Usuario Real: Cristian Rosillo"
echo "📝 Usando MCP servers reales (Chargebee, HubSpot, Firebase)"
echo "📋 Guardando resultados en: $LOG_FILE"
echo "🕒 Timestamp: $(date)"
echo "=" | tr '=' '-' | head -c 80
echo ""

# Función para realizar query GraphQL completa
query_cristian() {
    local query_value="$1"
    local test_name="$2"
    
    echo "🔍 Test: $test_name"
    echo "📞 Query: '$query_value'"
    echo "🔌 Consultando MCP reales..."
    
    # Query completa con todos los campos disponibles
    local graphql_query='{
        "query": "query { getUserProfile(query: \"'$query_value'\") { name email phone subscriptionStatus nextBillingAmount planStatus medicine lastTicket { subject status } lastAppointment { date doctor } sourceBreakdown { field source value } } }"
    }'
    
    echo "⏳ Ejecutando consulta real..."
    local start_time=$(date +%s%N)
    
    local response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$graphql_query" \
        "$API_URL" 2>/dev/null)
    
    local end_time=$(date +%s%N)
    local duration_ms=$(( (end_time - start_time) / 1000000 ))
    
    echo "📊 Respuesta (${duration_ms}ms):"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
    
    # Analizar la respuesta
    local has_data=$(echo "$response" | jq -r '.data.getUserProfile != null' 2>/dev/null || echo "false")
    local has_errors=$(echo "$response" | jq -r '.errors != null' 2>/dev/null || echo "false")
    
    if [[ "$has_data" == "true" && "$has_errors" == "false" ]]; then
        echo "✅ Consulta exitosa"
        
        # Extraer información de fuentes
        local sources=$(echo "$response" | jq -r '.data.getUserProfile.sourceBreakdown[]?.source' 2>/dev/null | sort -u | tr '\n' ', ' | sed 's/,$//')
        echo "🔌 Fuentes utilizadas: $sources"
        
        # Verificar datos específicos
        local name=$(echo "$response" | jq -r '.data.getUserProfile.name // "N/A"' 2>/dev/null)
        local email=$(echo "$response" | jq -r '.data.getUserProfile.email // "N/A"' 2>/dev/null)
        local subscription=$(echo "$response" | jq -r '.data.getUserProfile.subscriptionStatus // "N/A"' 2>/dev/null)
        
        echo "👤 Datos encontrados:"
        echo "   Nombre: $name"
        echo "   Email: $email" 
        echo "   Suscripción: $subscription"
    else
        echo "❌ Error en la consulta o datos no encontrados"
        if [[ "$has_errors" == "true" ]]; then
            local error_msg=$(echo "$response" | jq -r '.errors[0].message // "Error desconocido"' 2>/dev/null)
            echo "   Error: $error_msg"
        fi
    fi
    
    echo "=" | tr '=' '-' | head -c 80
    echo ""
    
    # Log detallado
    {
        echo "=== $test_name ==="
        echo "Query: $query_value"
        echo "Timestamp: $(date)"
        echo "Duration: ${duration_ms}ms"
        echo "Has Data: $has_data"
        echo "Has Errors: $has_errors"
        echo "Response: $response"
        echo ""
    } >> "$LOG_FILE"
}

# Verificar que el servidor esté funcionando
echo "🏥 Verificando estado del servidor..."
health_check=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"query": "{ health }"}' \
    "$API_URL" 2>/dev/null)

echo "📊 Health Check:"
echo "$health_check" | jq '.' 2>/dev/null || echo "$health_check"
echo ""

# Tests para Cristian Rosillo con diferentes variaciones
echo "📋 TESTS DE CRISTIAN ROSILLO - DATOS REALES"
echo "=" | tr '=' '-' | head -c 50

# Test 1: Por nombre completo
query_cristian "Cristian Rosillo" "Cristian Rosillo - Nombre Completo"

# Test 2: Variaciones del nombre
query_cristian "cristian rosillo" "Cristian Rosillo - Minúsculas"
query_cristian "CRISTIAN ROSILLO" "Cristian Rosillo - Mayúsculas"
query_cristian "Cristian" "Cristian - Nombre Simple"

# Test 3: Si tiene email conocido (asumiendo patrones comunes)
query_cristian "cristian.rosillo@gmail.com" "Cristian Rosillo - Email Gmail"
query_cristian "cristian@rosillo.com" "Cristian Rosillo - Email Dominio"
query_cristian "crosillo@company.com" "Cristian Rosillo - Email Corporativo"

# Test 4: Si tiene teléfono conocido (patrones comunes mexicanos)
query_cristian "+52 55 1234 5678" "Cristian Rosillo - Teléfono MX"
query_cristian "+1 555 123 4567" "Cristian Rosillo - Teléfono US"

# Test 5: Verificar que otros usuarios también funcionen con MCP real
echo "📋 VERIFICACIÓN CON OTROS USUARIOS CONOCIDOS"
echo "=" | tr '=' '-' | head -c 50

query_cristian "kyle@kjernigan.net" "Verificación Kyle - MCP Real"
query_cristian "jair.morales@clivi.com.mx" "Verificación Jair - MCP Real"

# Resumen final
echo ""
echo "🎉 RESUMEN DE TESTS DE CRISTIAN ROSILLO"
echo "=" | tr '=' '-' | head -c 80
echo "🕒 Finalizado: $(date)"
echo "📝 Resultados detallados guardados en: $LOG_FILE"
echo ""
echo "📊 Análisis de resultados:"
echo "   - Verificar si Cristian Rosillo existe en alguno de los MCP"
echo "   - Comprobar qué fuentes de datos están activas"
echo "   - Validar la integración con MCP reales"
echo ""
echo "📋 Para análisis detallado:"
echo "   cat $LOG_FILE"
echo "   grep 'Has Data: true' $LOG_FILE | wc -l  # Contar consultas exitosas"
echo "   grep 'Fuentes utilizadas' $LOG_FILE       # Ver qué MCP respondieron"
echo ""
echo "🔍 Si no se encuentran datos de Cristian Rosillo:"
echo "   - Es normal, puede no existir en los MCP reales"
echo "   - El sistema debería devolver datos de fallback"
echo "   - Verificar que los MCP estén conectados correctamente"
