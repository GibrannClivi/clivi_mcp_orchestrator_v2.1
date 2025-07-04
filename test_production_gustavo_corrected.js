require('dotenv').config();

const test_production_endpoint_correct = async () => {
  const testEmail = 'gustavo.salgado@clivi.com.mx';
  const productionUrl = 'https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql';
  
  console.log('🌐 Test del MCP Orchestrator en Producción (Esquema Corregido)');
  console.log('==============================================================');
  console.log('📧 Email de prueba:', testEmail);
  console.log('🔗 URL de producción:', productionUrl);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('───────────────────────────────────────────────────────────────');

  try {
    // Importar fetch dinámicamente
    const fetch = (await import('node-fetch')).default;

    // Query GraphQL corregida usando solo campos disponibles en el esquema actual
    const graphqlQuery = {
      query: `
        query TestProduction($query: String!) {
          getUserProfile(query: $query) {
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
            company
            jobTitle
            
            # Datos comerciales (Chargebee)
            plan
            subscriptionStatus
            nextBillingAmount
            nextBillingDate
            billingCycle
            
            # Datos médicos (Firestore)
            planStatus
            medicalPlan
            medicine
            medicineCount
            selfSupplyLogs
            allergies
            
            # Datos de CRM (HubSpot)
            lastActivity
            dealStage
            leadScore
            lastTicket {
              ticketId
              subject
              status
              priority
              createdAt
              assignedTo
            }
            
            # Historial médico (con subcampos)
            lastAppointment {
              appointmentId
              date
              type
              doctor
              status
              location
              notes
            }
            nextAppointment {
              appointmentId
              date
              type
              doctor
              status
              location
              notes
            }
            emergencyContact {
              name
              phone
              relationship
            }
            
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
        query: testEmail
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
        console.log(`   Nombre completo: ${profile.name || 'N/A'}`);
        console.log(`   Nombre: ${profile.firstName || 'N/A'}`);
        console.log(`   Apellido: ${profile.lastName || 'N/A'}`);
        console.log(`   Email: ${profile.email || 'N/A'}`);
        console.log(`   Teléfono: ${profile.phone || 'N/A'}`);
        console.log(`   Empresa: ${profile.company || 'N/A'}`);
        console.log(`   Título trabajo: ${profile.jobTitle || 'N/A'}`);
        
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
        console.log(`   Próximo monto facturación: $${profile.nextBillingAmount || 0}`);
        console.log(`   Fecha próxima facturación: ${profile.nextBillingDate || 'N/A'}`);
        console.log(`   Ciclo facturación: ${profile.billingCycle || 'N/A'}`);
        
        // Datos médicos
        console.log('\n🏥 Información Médica (Firestore):');
        console.log(`   Estado Plan Médico: ${profile.planStatus || 'N/A'}`);
        console.log(`   Plan Médico: ${profile.medicalPlan || 'N/A'}`);
        console.log(`   Cantidad Medicinas: ${profile.medicineCount || 0}`);
        
        // Medicinas
        if (profile.medicine && Array.isArray(profile.medicine) && profile.medicine.length > 0) {
          console.log(`   Medicinas: ${profile.medicine.length} registradas`);
          profile.medicine.slice(0, 3).forEach((med, i) => {
            console.log(`     ${i+1}. ${med}`);
          });
          if (profile.medicine.length > 3) {
            console.log(`     ... y ${profile.medicine.length - 3} más`);
          }
        } else {
          console.log('   Medicinas: ❌ No disponibles');
        }
        
        // Alergias
        if (profile.allergies && Array.isArray(profile.allergies) && profile.allergies.length > 0) {
          console.log(`\n🚨 Alergias: ${profile.allergies.join(', ')}`);
        }
        
        // Self Supply Logs
        if (profile.selfSupplyLogs && Array.isArray(profile.selfSupplyLogs) && profile.selfSupplyLogs.length > 0) {
          console.log(`\n📦 Self Supply Logs: ${profile.selfSupplyLogs.length} entradas`);
        }
        
        // Datos de CRM (HubSpot)
        console.log('\n📞 Información CRM (HubSpot):');
        console.log(`   Última actividad: ${profile.lastActivity || 'N/A'}`);
        console.log(`   Etapa del deal: ${profile.dealStage || 'N/A'}`);
        console.log(`   Lead score: ${profile.leadScore || 'N/A'}`);
        
        // Último ticket
        if (profile.lastTicket) {
          console.log('\n🎫 Último Ticket:');
          console.log(`   ID: ${profile.lastTicket.ticketId || 'N/A'}`);
          console.log(`   Asunto: ${profile.lastTicket.subject || 'N/A'}`);
          console.log(`   Estado: ${profile.lastTicket.status || 'N/A'}`);
          console.log(`   Prioridad: ${profile.lastTicket.priority || 'N/A'}`);
          console.log(`   Creado: ${profile.lastTicket.createdAt || 'N/A'}`);
          console.log(`   Asignado a: ${profile.lastTicket.assignedTo || 'N/A'}`);
        }
        
        // Citas médicas
        if (profile.lastAppointment) {
          console.log('\n📅 Última Cita:');
          console.log(`   ID: ${profile.lastAppointment.appointmentId || 'N/A'}`);
          console.log(`   Fecha: ${profile.lastAppointment.date || 'N/A'}`);
          console.log(`   Tipo: ${profile.lastAppointment.type || 'N/A'}`);
          console.log(`   Doctor: ${profile.lastAppointment.doctor || 'N/A'}`);
          console.log(`   Estado: ${profile.lastAppointment.status || 'N/A'}`);
          console.log(`   Ubicación: ${profile.lastAppointment.location || 'N/A'}`);
          console.log(`   Notas: ${profile.lastAppointment.notes || 'N/A'}`);
        }
        
        if (profile.nextAppointment) {
          console.log('\n📅 Próxima Cita:');
          console.log(`   ID: ${profile.nextAppointment.appointmentId || 'N/A'}`);
          console.log(`   Fecha: ${profile.nextAppointment.date || 'N/A'}`);
          console.log(`   Tipo: ${profile.nextAppointment.type || 'N/A'}`);
          console.log(`   Doctor: ${profile.nextAppointment.doctor || 'N/A'}`);
          console.log(`   Estado: ${profile.nextAppointment.status || 'N/A'}`);
          console.log(`   Ubicación: ${profile.nextAppointment.location || 'N/A'}`);
          console.log(`   Notas: ${profile.nextAppointment.notes || 'N/A'}`);
        }
        
        // Contacto de emergencia
        if (profile.emergencyContact) {
          console.log('\n🆘 Contacto de Emergencia:');
          console.log(`   Nombre: ${profile.emergencyContact.name || 'N/A'}`);
          console.log(`   Teléfono: ${profile.emergencyContact.phone || 'N/A'}`);
          console.log(`   Relación: ${profile.emergencyContact.relationship || 'N/A'}`);
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
            chargebeeFields.slice(0, 5).forEach(field => {
              console.log(`     - ${field.field}: ${field.value}`);
            });
            if (chargebeeFields.length > 5) {
              console.log(`     ... y ${chargebeeFields.length - 5} más`);
            }
          }
          
          if (hubspotFields.length > 0) {
            console.log(`   📞 HubSpot (${hubspotFields.length} campos):`);
            hubspotFields.slice(0, 5).forEach(field => {
              console.log(`     - ${field.field}: ${field.value}`);
            });
            if (hubspotFields.length > 5) {
              console.log(`     ... y ${hubspotFields.length - 5} más`);
            }
          }
          
          if (firestoreFields.length > 0) {
            console.log(`   🏥 Firestore (${firestoreFields.length} campos):`);
            firestoreFields.slice(0, 5).forEach(field => {
              console.log(`     - ${field.field}: ${field.value}`);
            });
            if (firestoreFields.length > 5) {
              console.log(`     ... y ${firestoreFields.length - 5} más`);
            }
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
        const hasChargebeeData = profile.customerId || profile.plan || profile.subscriptionStatus;
        const hasHubSpotData = profile.contactId || profile.lastActivity;
        const hasFirestoreData = profile.userId || profile.planStatus || profile.medicineCount;
        
        console.log(`   Chargebee: ${hasChargebeeData ? '✅ Datos presentes' : '❌ Sin datos'}`);
        console.log(`   HubSpot: ${hasHubSpotData ? '✅ Datos presentes' : '❌ Sin datos'}`);
        console.log(`   Firestore: ${hasFirestoreData ? '✅ Datos presentes' : '❌ Sin datos'}`);
        
        const totalSources = [hasChargebeeData, hasHubSpotData, hasFirestoreData].filter(Boolean).length;
        console.log(`   Total fuentes activas: ${totalSources}/3`);
        
        // Completitud de datos clave
        const keyFields = ['name', 'email', 'phone', 'plan', 'planStatus'];
        const completedFields = keyFields.filter(field => profile[field]).length;
        console.log(`   Campos clave completados: ${completedFields}/${keyFields.length}`);
        
      } else {
        console.log('\n❌ No se encontraron datos del usuario');
        console.log('   Posibles causas:');
        console.log('   - El email no existe en ninguna fuente');
        console.log('   - Error en la configuración de alguna integración');
        console.log('   - Problemas de conectividad con las fuentes');
      }
      
      console.log('\n📄 Respuesta completa:');
      console.log(JSON.stringify(result, null, 2));
      
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
  console.log('=================================');
  console.log('⏰ Fin:', new Date().toISOString());
};

// Ejecutar el test
test_production_endpoint_correct().catch(console.error);
