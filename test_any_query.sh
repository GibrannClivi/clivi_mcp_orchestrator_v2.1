#!/bin/bash

# Script para probar que el sistema funciona con cualquier query
# Incluye usuarios predefinidos y usuarios aleatorios

echo "🧪 Probando el sistema con queries aleatorios..."

# Función para hacer queries GraphQL
make_query() {
  local query="$1"
  local description="$2"
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "🔍 $description"
  echo "Query: '$query'"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  
  curl -s -X POST http://localhost:4001/graphql \
    -H "Content-Type: application/json" \
    -d '{
      "query": "query($searchQuery: String!) { getUserProfile(query: $searchQuery) { name email phone planStatus subscriptionStatus nextBillingAmount nextBillingDate lastAppointment { date status } lastTicket { subject status createdAt } medicine selfSupplyLogs sourceBreakdown { field value source } } }",
      "variables": { "searchQuery": "'"$query"'" }
    }' | jq '.'
}

# Esperar a que el servidor esté listo
echo "⏳ Esperando que el servidor esté listo..."
sleep 3

# 1. Usuario predefinido (Kyle)
make_query "kyle@kjernigan.net" "Usuario predefinido - Kyle por email"

# 2. Usuario predefinido (Jair)
make_query "Jair Morales Olvera" "Usuario predefinido - Jair por nombre"

# 3. Usuario completamente aleatorio - por nombre
make_query "María Fernández López" "Usuario aleatorio - por nombre"

# 4. Usuario completamente aleatorio - por email
make_query "john.doe@example.com" "Usuario aleatorio - por email"

# 5. Usuario completamente aleatorio - por teléfono
make_query "+1-555-999-8888" "Usuario aleatorio - por teléfono"

# 6. Nombre en otro idioma
make_query "Zhang Wei" "Usuario aleatorio - nombre chino"

# 7. Email con dominio diferente
make_query "sarah.connor@skynet.ai" "Usuario aleatorio - email futurista"

# 8. Teléfono mexicano
make_query "+52-55-1234-5678" "Usuario aleatorio - teléfono mexicano"

# 9. Nombre con caracteres especiales
make_query "José María García-Pérez" "Usuario aleatorio - nombre con acentos"

# 10. Email corporativo
make_query "ceo@startupxyz.com" "Usuario aleatorio - email corporativo"

echo ""
echo "✅ Pruebas completadas! El sistema debe funcionar con cualquier query."
echo "📊 Todos los queries deben retornar datos, ya sea reales o por fallback."
