#!/bin/bash

# Script de ejemplo para consulta GraphQL completa por defecto
# Cuando se proporciona un email, se ejecuta la consulta más completa

EMAIL="$1"

if [ -z "$EMAIL" ]; then
    echo "❌ Por favor proporciona un email como argumento"
    echo "Uso: ./graphql_complete_query.sh <email>"
    echo "Ejemplo: ./graphql_complete_query.sh saidh.jimenez@clivi.com.mx"
    exit 1
fi

echo "🔍 Ejecutando consulta GraphQL completa para: $EMAIL"
echo "🌐 Endpoint: http://localhost:4000/"
echo ""

curl -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ 
      getUserProfile(query: \"'$EMAIL'\") { 
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
    }"
  }' \
  http://localhost:4000/ | jq '.'
