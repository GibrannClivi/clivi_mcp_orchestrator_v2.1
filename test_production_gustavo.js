require('dotenv').config();

const test_production_endpoint = async () => {
  const testEmail = 'gustavo.salgado@clivi.com.mx';
  const productionUrl = 'https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql';
  
  console.log('🌐 Test del MCP Orchestrator en Producción');
  console.log('==========================================');
  console.log('📧 Email de prueba:', testEmail);
  console.log('🔗 URL de producción:', productionUrl);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('───────────────────────────────────────────');

  try {
    // Importar fetch dinámicamente
    const fetch = (await import('node-fetch')).default;

    // Query GraphQL completa para el usuario
    const graphqlQuery = {
      query: `
        query TestProduction($query: String!, $queryType: String!) {
          getUserProfile(query: $query, queryType: $queryType) {
            # Identificadores
            userId
            contactId
            customerId
            subscriptionId
            
            # Información personal
            email
            name
            firstName
            lastName
            phone
            emailAddress
            
            # Datos comerciales (Chargebee)
            plan
            subscriptionStatus
            
            # Datos médicos (Firestore)
            planStatus
            medicineCount
            healthSummary
            treatments
            allergies
            
            # Historial médico
            lastAppointment
            nextAppointment
            emergencyContact
            
            # Trazabilidad completa
            sourceBreakdown {
              field
              value
              source
            }
            
            # Sugerencias
            suggestions
          }
        }
      `,
      variables: {
        query: testEmail,
        queryType: "email"
      }
    };

    console.log('\n🚀 Enviando consulta a producción...');
    console.log('📋 Query:', 'getUserProfile con email');
    console.log('🎯 Variables:', JSON.stringify(graphqlQuery.variables, null, 2));

    // Realizar consulta HTTP POST
    const startTime = Date.now();
    const response = await fetch(productionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'MCP-Orchestrator-Test/1.0'
      },
      body: JSON.stringify(graphqlQuery),
      timeout: 30000 // 30 segundos timeout
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`\n⏱️  Tiempo de respuesta: ${responseTime}ms`);
    console.log(`🌐 Status HTTP: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      
      console.log('\n✅ Respuesta exitosa recibida!');
      console.log('================================');
      
      if (result.errors) {
        console.log('\n❌ Errores en GraphQL:');
        result.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.message}`);
          if (error.path) {
            console.log(`      Path: ${error.path.join(' → ')}`);
          }
          if (error.extensions) {
            console.log(`      Extensions:`, error.extensions);
          }
        });
      }
      
      if (result.data && result.data.getUserProfile) {
        const profile = result.data.getUserProfile;
        
        console.log('\n👤 PERFIL DE USUARIO ENCONTRADO');
        console.log('===============================');
        
        // Información básica
        console.log('\n📋 Información Básica:');
        console.log(`   Nombre: ${profile.name || 'N/A'}`);
        console.log(`   Email: ${profile.email || 'N/A'}`);
        console.log(`   Teléfono: ${profile.phone || 'N/A'}`);
        console.log(`   Email Address (Firestore): ${profile.emailAddress || 'N/A'}`);
        
        // Identificadores
        console.log('\n🆔 Identificadores:');
        console.log(`   User ID (Firestore): ${profile.userId || 'N/A'}`);
        console.log(`   Contact ID (HubSpot): ${profile.contactId || 'N/A'}`);
        console.log(`   Customer ID (Chargebee): ${profile.customerId || 'N/A'}`);
        console.log(`   Subscription ID: ${profile.subscriptionId || 'N/A'}`);
        
        // Datos comerciales
        console.log('\n💳 Información Comercial (Chargebee):');
        console.log(`   Plan: ${profile.plan || 'N/A'}`);
        console.log(`   Estado Suscripción: ${profile.subscriptionStatus || 'N/A'}`);
        
        // Datos médicos
        console.log('\n🏥 Información Médica (Firestore):');
        console.log(`   Estado Plan Médico: ${profile.planStatus || 'N/A'}`);
        console.log(`   Cantidad Medicinas: ${profile.medicineCount || 0}`);
        
        // Health Summary
        if (profile.healthSummary) {
          console.log('\n🩺 Resumen de Salud:');
          const hs = profile.healthSummary;
          
          if (typeof hs === 'object') {
            if (hs.currentWeight) console.log(`   Peso actual: ${hs.currentWeight}`);
            if (hs.height) console.log(`   Altura: ${hs.height}`);
            if (hs.bloodPressure) console.log(`   Presión arterial: ${hs.bloodPressure}`);
            
            if (hs.medications && Array.isArray(hs.medications)) {
              console.log(`   Medicamentos: ${hs.medications.length} registrados`);
              hs.medications.slice(0, 3).forEach((med, i) => {
                console.log(`     ${i+1}. ${med.name || 'N/A'} - ${med.dosage || 'N/A'}`);
              });
              if (hs.medications.length > 3) {
                console.log(`     ... y ${hs.medications.length - 3} más`);
              }
            }
            
            if (hs.allergies && Array.isArray(hs.allergies)) {
              console.log(`   Alergias: ${hs.allergies.join(', ')}`);
            }
            
            if (hs.conditions && Array.isArray(hs.conditions)) {
              console.log(`   Condiciones: ${hs.conditions.join(', ')}`);
            }
            
            if (hs.vitalSigns) {
              console.log(`   Signos vitales:`);
              if (hs.vitalSigns.heartRate) console.log(`     Ritmo cardíaco: ${hs.vitalSigns.heartRate} bpm`);
              if (hs.vitalSigns.temperature) console.log(`     Temperatura: ${hs.vitalSigns.temperature}`);
            }
          } else {
            console.log(`   Health Summary: ${JSON.stringify(hs)}`);
          }
        } else {
          console.log('   Health Summary: ❌ No disponible');
        }
        
        // Tratamientos y alergias adicionales
        if (profile.treatments && Array.isArray(profile.treatments) && profile.treatments.length > 0) {
          console.log(`\n💊 Tratamientos: ${profile.treatments.length} activos`);
          profile.treatments.slice(0, 2).forEach((treatment, i) => {
            console.log(`   ${i+1}. ${treatment.name || 'N/A'} - ${treatment.status || 'N/A'}`);
          });
        }
        
        if (profile.allergies && Array.isArray(profile.allergies) && profile.allergies.length > 0) {
          console.log(`\n🚨 Alergias: ${profile.allergies.join(', ')}`);
        }
        
        // Citas médicas
        if (profile.lastAppointment) {
          console.log('\n📅 Última Cita:', JSON.stringify(profile.lastAppointment, null, 2));
        }
        
        if (profile.nextAppointment) {
          console.log('\n📅 Próxima Cita:', JSON.stringify(profile.nextAppointment, null, 2));
        }
        
        // Contacto de emergencia
        if (profile.emergencyContact) {
          console.log('\n🆘 Contacto de Emergencia:', JSON.stringify(profile.emergencyContact, null, 2));
        }
        
        // Trazabilidad de fuentes
        if (profile.sourceBreakdown && profile.sourceBreakdown.length > 0) {
          console.log('\n📊 Trazabilidad de Datos:');
          
          const chargebeeFields = profile.sourceBreakdown.filter(s => s.source === 'chargebee');
          const hubspotFields = profile.sourceBreakdown.filter(s => s.source === 'hubspot');
          const firestoreFields = profile.sourceBreakdown.filter(s => s.source === 'firestore');
          const queryFields = profile.sourceBreakdown.filter(s => s.source === 'query');
          
          if (chargebeeFields.length > 0) {
            console.log(`   💳 Chargebee (${chargebeeFields.length} campos):`);
            chargebeeFields.forEach(field => {
              console.log(`     - ${field.field}: ${field.value}`);
            });
          }
          
          if (hubspotFields.length > 0) {
            console.log(`   📞 HubSpot (${hubspotFields.length} campos):`);
            hubspotFields.forEach(field => {
              console.log(`     - ${field.field}: ${field.value}`);
            });
          }
          
          if (firestoreFields.length > 0) {
            console.log(`   🏥 Firestore (${firestoreFields.length} campos):`);
            firestoreFields.forEach(field => {
              console.log(`     - ${field.field}: ${field.value}`);
            });
          }
          
          if (queryFields.length > 0) {
            console.log(`   🔍 Query (${queryFields.length} campos):`);
            queryFields.forEach(field => {
              console.log(`     - ${field.field}: ${field.value}`);
            });
          }
        }
        
        // Sugerencias
        if (profile.suggestions && profile.suggestions.length > 0) {
          console.log('\n💡 Sugerencias:');
          profile.suggestions.forEach((suggestion, i) => {
            console.log(`   ${i+1}. ${suggestion}`);
          });
        }
        
        // Análisis de integridad de datos
        console.log('\n🔍 Análisis de Integridad de Datos:');
        const hasChargebeeData = profile.customerId || profile.plan;
        const hasHubSpotData = profile.contactId;
        const hasFirestoreData = profile.userId || profile.healthSummary;
        
        console.log(`   Chargebee: ${hasChargebeeData ? '✅ Datos presentes' : '❌ Sin datos'}`);
        console.log(`   HubSpot: ${hasHubSpotData ? '✅ Datos presentes' : '❌ Sin datos'}`);
        console.log(`   Firestore: ${hasFirestoreData ? '✅ Datos presentes' : '❌ Sin datos'}`);
        
        const totalSources = [hasChargebeeData, hasHubSpotData, hasFirestoreData].filter(Boolean).length;
        console.log(`   Total fuentes activas: ${totalSources}/3`);
        
      } else {
        console.log('\n❌ No se encontraron datos del usuario');
        console.log('   Posibles causas:');
        console.log('   - El email no existe en ninguna fuente');
        console.log('   - Error en la configuración de alguna integración');
        console.log('   - Problemas de conectividad con las fuentes');
      }
      
    } else {
      console.log('\n❌ Error HTTP en la respuesta');
      console.log(`   Status: ${response.status}`);
      console.log(`   Status Text: ${response.statusText}`);
      
      try {
        const errorBody = await response.text();
        console.log('   Response Body:', errorBody);
      } catch (e) {
        console.log('   No se pudo leer el cuerpo de la respuesta');
      }
    }

  } catch (error) {
    console.error('\n❌ Error durante la consulta:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Error de conexión: No se pudo conectar al servidor');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏱️  Error de timeout: El servidor tardó demasiado en responder');
    } else if (error.name === 'AbortError') {
      console.error('⏱️  Error de timeout: La consulta fue cancelada');
    } else {
      console.error('🐛 Error inesperado:', error);
    }
  }

  console.log('\n🏁 Test de producción completado');
  console.log('================================');
  console.log('⏰ Fin:', new Date().toISOString());
};

// Ejecutar el test
test_production_endpoint().catch(console.error);
