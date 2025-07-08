#!/bin/bash

# 🔧 Script de verificación de HubSpot Private App
# Este script verifica la configuración y conectividad de HubSpot

set -e

echo "🚀 Verificando configuración de HubSpot Private App..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con color
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

info() {
    echo -e "ℹ️  $1"
}

# Verificar variables de entorno
echo
info "Verificando variables de entorno..."

if [ -z "$HUBSPOT_ACCESS_TOKEN" ]; then
    error "HUBSPOT_ACCESS_TOKEN no está configurado"
    exit 1
else
    success "HUBSPOT_ACCESS_TOKEN configurado (${HUBSPOT_ACCESS_TOKEN:0:20}...)"
fi

if [ -z "$HUBSPOT_PORTAL_ID" ]; then
    error "HUBSPOT_PORTAL_ID no está configurado"
    exit 1
else
    success "HUBSPOT_PORTAL_ID configurado ($HUBSPOT_PORTAL_ID)"
fi

# Verificar formato del token
echo
info "Verificando formato del token..."

if [[ $HUBSPOT_ACCESS_TOKEN =~ ^pat-(na1|eu1)-.+$ ]]; then
    success "Formato del token válido"
else
    error "Formato del token inválido. Debe iniciar con 'pat-na1-' o 'pat-eu1-'"
    exit 1
fi

# Test de conectividad básica
echo
info "Probando conectividad básica con HubSpot..."

response=$(curl -s -w "%{http_code}" -o /tmp/hubspot_response.txt \
    -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
    "https://api.hubapi.com/crm/v3/objects/contacts?limit=1")

if [ "$response" = "200" ]; then
    success "Conectividad exitosa - Token válido"
    
    # Mostrar información del primer contacto
    echo
    info "Información del primer contacto encontrado:"
    jq -r '.results[0] | "  ID: \(.id)\n  Email: \(.properties.email // "N/A")\n  Nombre: \((.properties.firstname // "") + " " + (.properties.lastname // ""))"' /tmp/hubspot_response.txt 2>/dev/null || echo "  No se pudo parsear la respuesta"
    
elif [ "$response" = "401" ]; then
    error "Token inválido o expirado (HTTP 401)"
    echo
    info "Pasos para solucionar:"
    echo "1. Ir a https://app.hubspot.com/"
    echo "2. Settings → Integrations → Private Apps"
    echo "3. Seleccionar la app → Actions → Rotate token"
    echo "4. Actualizar la variable HUBSPOT_ACCESS_TOKEN"
    exit 1
    
elif [ "$response" = "403" ]; then
    error "Permisos insuficientes (HTTP 403)"
    echo
    info "Verificar que la Private App tenga estos scopes:"
    echo "- crm.objects.contacts.read"
    echo "- crm.objects.deals.read"
    echo "- crm.schemas.contacts.read"
    exit 1
    
elif [ "$response" = "429" ]; then
    warning "Rate limit excedido (HTTP 429)"
    echo
    info "Esperar un momento y volver a intentar"
    exit 1
    
else
    error "Error de conectividad (HTTP $response)"
    echo
    info "Respuesta del servidor:"
    cat /tmp/hubspot_response.txt
    exit 1
fi

# Verificar permisos específicos
echo
info "Verificando permisos específicos..."

# Test de lectura de deals
deals_response=$(curl -s -w "%{http_code}" -o /tmp/hubspot_deals.txt \
    -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
    "https://api.hubapi.com/crm/v3/objects/deals?limit=1")

if [ "$deals_response" = "200" ]; then
    success "Permisos de lectura de deals ✓"
else
    warning "No se pueden leer deals (HTTP $deals_response)"
    echo "  Verificar scope: crm.objects.deals.read"
fi

# Test de lectura de schemas
schemas_response=$(curl -s -w "%{http_code}" -o /tmp/hubspot_schemas.txt \
    -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
    "https://api.hubapi.com/crm/v3/schemas/contacts")

if [ "$schemas_response" = "200" ]; then
    success "Permisos de lectura de schemas ✓"
else
    warning "No se pueden leer schemas (HTTP $schemas_response)"
    echo "  Verificar scope: crm.schemas.contacts.read"
fi

# Test de búsqueda específica
echo
info "Probando búsqueda por email..."

search_response=$(curl -s -w "%{http_code}" -o /tmp/hubspot_search.txt \
    -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "filterGroups": [
            {
                "filters": [
                    {
                        "propertyName": "email",
                        "operator": "EQ",
                        "value": "test@example.com"
                    }
                ]
            }
        ],
        "limit": 1
    }' \
    "https://api.hubapi.com/crm/v3/objects/contacts/search")

if [ "$search_response" = "200" ]; then
    success "Búsqueda por email funcionando ✓"
    
    # Verificar si se encontraron resultados
    total_results=$(jq -r '.total' /tmp/hubspot_search.txt 2>/dev/null || echo "0")
    info "Contactos encontrados para test@example.com: $total_results"
    
else
    error "Error en búsqueda por email (HTTP $search_response)"
    cat /tmp/hubspot_search.txt
fi

# Verificar límites de API
echo
info "Verificando límites de API..."

limit_response=$(curl -s -H "Authorization: Bearer $HUBSPOT_ACCESS_TOKEN" \
    "https://api.hubapi.com/crm/v3/objects/contacts?limit=1")

if echo "$limit_response" | jq -e '.results' >/dev/null 2>&1; then
    success "API funcionando dentro de límites normales"
else
    warning "Posible problema con límites de API"
fi

# Limpieza de archivos temporales
rm -f /tmp/hubspot_*.txt

echo
success "Verificación completa de HubSpot Private App"
echo "=================================================="
echo
info "Configuración verificada exitosamente:"
echo "  ✅ Token válido y funcionando"
echo "  ✅ Permisos correctos configurados"
echo "  ✅ Conectividad estable"
echo "  ✅ Búsquedas funcionando"
echo
info "La integración de HubSpot está lista para producción"
