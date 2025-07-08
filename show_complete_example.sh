#!/bin/bash

# Script para mostrar ejemplo completo de consulta por email
# Genera un archivo con todos los datos que regresa la consulta

EMAIL="${1:-saidh.jimenez@clivi.com.mx}"
OUTPUT_FILE="example_response_$(date +%Y%m%d_%H%M%S).json"

echo "🔍 MOSTRANDO EJEMPLO COMPLETO DE CONSULTA POR EMAIL"
echo "=================================================="
echo "📧 Email: $EMAIL"
echo "📄 Guardando en: $OUTPUT_FILE"
echo ""

# Verificar si el servidor está corriendo
if ! curl -s -H "Content-Type: application/json" -d '{"query": "{ health }"}' http://localhost:4000/ > /dev/null 2>&1; then
    echo "❌ El servidor MCP Orchestrator no está corriendo"
    echo "Ejecuta: npm start"
    exit 1
fi

echo "🚀 Servidor MCP Orchestrator detectado"
echo ""

# Ejecutar consulta completa y guardar respuesta
echo "📋 Ejecutando consulta completa..."
curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{
    \"query\": \"{ 
      getUserProfile(query: \\\"$EMAIL\\\") { 
        name 
        firstName 
        lastName 
        email 
        emailAdress 
        phone 
        company 
        jobTitle 
        subscriptionStatus 
        plan 
        nextBillingAmount 
        nextBillingDate 
        billingCycle 
        customerId 
        subscriptionId 
        contactId 
        lastActivity 
        dealStage 
        leadScore 
        planIncludedPackage 
        planName 
        pxInformation 
        specialistsAssigned 
        supplies 
        lastPrescription 
        zero 
        lastTwoPayments { 
          id 
          status 
          amount 
          currency 
          createdAt 
          description 
        } 
        userId 
        planStatus 
        medicalPlan 
        medicine 
        medicineCount 
        allergies 
        treatments 
        lastAppointment { 
          appointmentId 
          date 
          type 
          doctor 
          status 
          notes 
        } 
        nextAppointment { 
          appointmentId 
          date 
          type 
          doctor 
          status 
          notes 
        } 
        emergencyContact { 
          name 
          phone 
          relationship 
        } 
        selfSupplyLogs 
        sourceBreakdown { 
          field 
          value 
          source 
        } 
        suggestions 
      } 
    }\"
  }" \
  http://localhost:4000/ > "$OUTPUT_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Consulta completada exitosamente"
    echo ""
    
    # Mostrar resumen de la respuesta
    echo "📊 RESUMEN DE LA RESPUESTA:"
    echo "=========================="
    
    # Extraer información clave usando jq si está disponible
    if command -v jq &> /dev/null; then
        echo "👤 Nombre: $(jq -r '.data.getUserProfile.name // "N/A"' "$OUTPUT_FILE")"
        echo "📧 Email: $(jq -r '.data.getUserProfile.email // "N/A"' "$OUTPUT_FILE")"
        echo "📞 Teléfono: $(jq -r '.data.getUserProfile.phone // "N/A"' "$OUTPUT_FILE")"
        echo "💳 Plan: $(jq -r '.data.getUserProfile.plan // "N/A"' "$OUTPUT_FILE")"
        echo "🏥 Plan Médico: $(jq -r '.data.getUserProfile.medicalPlan // "N/A"' "$OUTPUT_FILE")"
        echo "📦 Paquete: $(jq -r '.data.getUserProfile.planIncludedPackage // "N/A"' "$OUTPUT_FILE")"
        echo "🩺 Tratamientos: $(jq -r '.data.getUserProfile.treatments // [] | join(", ")' "$OUTPUT_FILE")"
        echo "💊 Medicamentos: $(jq -r '.data.getUserProfile.medicineCount // 0' "$OUTPUT_FILE")"
        echo ""
        
        # Contar fuentes de datos
        echo "📊 FUENTES DE DATOS:"
        jq -r '.data.getUserProfile.sourceBreakdown[]?.source // empty' "$OUTPUT_FILE" | sort | uniq -c | while read count source; do
            echo "  ✓ $source: $count campos"
        done
        echo ""
        
        # Mostrar JSON formateado
        echo "📋 RESPUESTA COMPLETA (JSON FORMATEADO):"
        echo "========================================"
        jq '.' "$OUTPUT_FILE"
    else
        echo "⚠️  jq no está instalado. Mostrando JSON sin formato:"
        cat "$OUTPUT_FILE"
    fi
    
    echo ""
    echo "💾 Respuesta guardada en: $OUTPUT_FILE"
    echo ""
    echo "🔍 Para ver solo campos específicos:"
    echo "  jq '.data.getUserProfile | {name, email, phone, medicalPlan}' $OUTPUT_FILE"
    echo ""
    echo "📊 Para ver solo el desglose por fuente:"
    echo "  jq '.data.getUserProfile.sourceBreakdown' $OUTPUT_FILE"
    
else
    echo "❌ Error ejecutando consulta"
    exit 1
fi
