#!/bin/bash

# Script de validación simple usando curl directo
# Evita problemas de caracteres de control

echo "🔍 VALIDACIÓN SIMPLE DE CAMPOS POR FUENTE"
echo "========================================="
echo ""

EMAIL="cristhian.rosillo@clivi.com.mx"
ENDPOINT="http://localhost:4000/graphql"

echo "📧 Usuario: $EMAIL"
echo "🌐 Endpoint: $ENDPOINT"
echo ""

# Crear query GraphQL sin caracteres especiales
cat > query.json << 'EOF'
{
  "query": "query getUserProfile($query: String!) { getUserProfile(query: $query) { name firstName lastName email phone company subscriptionStatus plan customerId contactId userId planStatus medicalPlan medicineCount sourceBreakdown { field value source } } }",
  "variables": {
    "query": "cristhian.rosillo@clivi.com.mx"
  }
}
EOF

echo "🚀 Ejecutando consulta GraphQL..."

# Ejecutar con curl
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d @query.json \
  "$ENDPOINT" > response.json

echo ""
echo "📋 RESPUESTA:"
echo "============"
cat response.json
echo ""

# Verificar si es JSON válido y extraer datos básicos
if python3 -m json.tool response.json > /dev/null 2>&1; then
    echo "✅ JSON válido"
    echo ""
    
    echo "📊 EXTRAYENDO CAMPOS PRINCIPALES:"
    echo "================================"
    
    # Extraer campos usando python
    python3 << 'EOF'
import json

try:
    with open('response.json', 'r') as f:
        data = json.load(f)
    
    if 'data' in data and 'getUserProfile' in data['data']:
        profile = data['data']['getUserProfile']
        
        print("🔸 Identificación:")
        print(f"  ✓ Email: {profile.get('email', 'N/A')}")
        print(f"  ✓ Nombre: {profile.get('name', 'N/A')}")
        print(f"  ✓ User ID: {profile.get('userId', 'N/A')}")
        print(f"  ✓ Customer ID: {profile.get('customerId', 'N/A')}")
        print(f"  ✓ Contact ID: {profile.get('contactId', 'N/A')}")
        
        print("\n🔸 Suscripción:")
        print(f"  ✓ Estado: {profile.get('subscriptionStatus', 'N/A')}")
        print(f"  ✓ Plan: {profile.get('plan', 'N/A')}")
        print(f"  ✓ Plan Médico: {profile.get('medicalPlan', 'N/A')}")
        print(f"  ✓ Estado Plan: {profile.get('planStatus', 'N/A')}")
        
        print("\n🔸 Datos Médicos:")
        print(f"  ✓ Medicamentos Count: {profile.get('medicineCount', 'N/A')}")
        
        if 'sourceBreakdown' in profile and profile['sourceBreakdown']:
            print("\n📊 FUENTES DE DATOS:")
            sources = {}
            for item in profile['sourceBreakdown']:
                source = item['source']
                if source not in sources:
                    sources[source] = 0
                sources[source] += 1
            
            for source, count in sources.items():
                print(f"  📈 {source.capitalize()}: {count} campos")
        else:
            print("\n❌ No hay sourceBreakdown disponible")
    else:
        print("❌ Estructura de respuesta inesperada")
        if 'errors' in data:
            print("Errores:")
            for error in data['errors']:
                print(f"  - {error.get('message', 'Error desconocido')}")
        
except Exception as e:
    print(f"❌ Error: {e}")
EOF
    
else
    echo "❌ JSON inválido o error en la respuesta"
    echo "Raw response:"
    cat response.json
fi

# Limpiar archivos temporales
rm -f query.json response.json

echo ""
echo "✅ Validación completada"
