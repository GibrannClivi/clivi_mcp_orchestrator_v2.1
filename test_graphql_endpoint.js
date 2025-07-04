require('dotenv').config();

const test_graphql_endpoint = async () => {
  console.log('🌐 Test del Endpoint GraphQL en Producción');
  console.log('==========================================');

  const testEmail = 'cristhian.rosillo@clivi.com.mx';
  const serverUrl = 'https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql';
  
  // Query GraphQL para probar
  const graphqlQuery = {
    query: `
      query getUserProfile($query: String!) {
        getUserProfile(query: $query) {
          userId
          contactId
          customerId
          subscriptionId
          email
          name
          firstName
          lastName
          phone
          plan
          subscriptionStatus
          planStatus
          medicineCount
          treatments
          # Campos médicos fundamentales de HubSpot
          planIncludedPackage
          planName
          pxInformation
          specialistsAssigned
          supplies
          lastPrescription
          zero
          healthSummary {
            currentWeight
            height
            bmi
            bloodPressure {
              systolic
              diastolic
              date
            }
            medications {
              name
              dosage
              frequency
            }
            allergies {
              substance
              severity
              reaction
            }
            conditions {
              name
              diagnosedDate
              status
            }
          }
          sourceBreakdown {
            field
            value
            source
          }
        }
      }
    `,
    variables: {
      query: testEmail
    }
  };

  console.log(`📧 Email de prueba: ${testEmail}`);
  console.log(`🌐 URL del servidor: ${serverUrl}`);
  console.log('───────────────────────────────────────');

  try {
    console.log('\n🔄 Intentando conectar al servidor GraphQL...');
    
    // Simular una petición HTTP POST al endpoint GraphQL
    const fetch = require('node-fetch');
    
    const response = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(graphqlQuery)
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.errors) {
        console.log('❌ Errores en la consulta GraphQL:');
        result.errors.forEach(error => {
          console.log(`   - ${error.message}`);
        });
      }
      
      if (result.data && result.data.getUserProfile) {
        console.log('\n✅ Consulta GraphQL exitosa!');
        console.log('============================');
        
        const profile = result.data.getUserProfile;
        
        console.log('👤 Información del Usuario:');
        console.log(`   User ID: ${profile.userId || 'N/A'}`);
        console.log(`   Contact ID: ${profile.contactId || 'N/A'}`);
        console.log(`   Customer ID: ${profile.customerId || 'N/A'}`);
        console.log(`   Email: ${profile.email || 'N/A'}`);
        console.log(`   Nombre: ${profile.name || 'N/A'}`);
        
        console.log('\n💳 Información de Suscripción:');
        console.log(`   Subscription ID: ${profile.subscriptionId || 'N/A'}`);
        console.log(`   Plan: ${profile.plan || 'N/A'}`);
        console.log(`   Status: ${profile.subscriptionStatus || 'N/A'}`);
        
        console.log('\n🏥 Información Médica:');
        console.log(`   Plan Status: ${profile.planStatus || 'N/A'}`);
        console.log(`   Medicinas: ${profile.medicineCount || 0}`);
        console.log(`   Health Summary: ${profile.healthSummary ? '✅ Disponible' : '❌ No disponible'}`);
        
        console.log('\n🏥 Campos Médicos de HubSpot (Fundamentales):');
        console.log(`   Plan Included Package: ${profile.planIncludedPackage || 'N/A'}`);
        console.log(`   Plan Name: ${profile.planName || 'N/A'}`);
        console.log(`   PX Information: ${profile.pxInformation || 'N/A'}`);
        console.log(`   Specialists Assigned: ${profile.specialistsAssigned || 'N/A'}`);
        console.log(`   Supplies: ${profile.supplies || 'N/A'}`);
        console.log(`   Last Prescription: ${profile.lastPrescription || 'N/A'}`);
        console.log(`   Zero: ${profile.zero || 'N/A'}`);
        console.log(`   Treatments: ${profile.treatments && profile.treatments.length > 0 ? profile.treatments.join(', ') : 'N/A'}`);
        
        if (profile.sourceBreakdown && profile.sourceBreakdown.length > 0) {
          console.log('\n📊 Trazabilidad de Datos:');
          profile.sourceBreakdown.forEach(item => {
            console.log(`   ${item.field}: ${item.value} (${item.source})`);
          });
        }
        
        console.log('\n🎯 Validaciones:');
        const hasChargebeeData = profile.customerId && profile.subscriptionId;
        const hasFirebaseData = profile.userId && profile.planStatus;
        const hasHealthSummary = profile.healthSummary;
        
        console.log(`   Chargebee: ${hasChargebeeData ? '✅' : '❌'} ${hasChargebeeData ? 'Datos presentes' : 'Sin datos'}`);
        console.log(`   Firestore: ${hasFirebaseData ? '✅' : '❌'} ${hasFirebaseData ? 'Datos presentes' : 'Sin datos'}`);
        console.log(`   Health Summary: ${hasHealthSummary ? '✅' : '❌'} ${hasHealthSummary ? 'Mapeado correctamente' : 'Sin datos'}`);
        
      } else {
        console.log('❌ No se obtuvieron datos del usuario');
      }
      
    } else {
      console.log(`❌ Error HTTP: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log(`   Respuesta: ${errorText}`);
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ No se pudo conectar al servicio GraphQL en producción');
      console.log('💡 Verificar que el servicio esté funcionando:');
      console.log('   1. Revisar URL: https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql');
      console.log('   2. Verificar conectividad de red');
      console.log('   3. Revisar logs de Cloud Run');
    } else {
      console.log('❌ Error en la consulta:', error.message);
    }
  }

  console.log('\n📋 Script de Prueba Manual:');
  console.log('============================');
  console.log('Para probar manualmente el servidor:');
  console.log('1. Ir a: https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql');
  console.log('2. Usar la siguiente query:');
  console.log(`
query {
  getUserProfile(query: "${testEmail}") {
    userId
    customerId
    email
    name
    plan
    subscriptionStatus
    medicineCount
    treatments
    # Campos médicos fundamentales de HubSpot
    planIncludedPackage
    planName
    pxInformation
    specialistsAssigned
    supplies
    lastPrescription
    zero
    healthSummary {
      currentWeight
      height
      bmi
      bloodPressure {
        systolic
        diastolic
        date
      }
      medications {
        name
        dosage
        frequency
      }
      allergies {
        substance
        severity
        reaction
      }
      conditions {
        name
        diagnosedDate
        status
      }
    }
    sourceBreakdown {
      field
      value
      source
    }
  }
}
  `);

  console.log('\n🏁 Test de endpoint GraphQL completado');
};

// Ejecutar el test
test_graphql_endpoint().catch(console.error);
