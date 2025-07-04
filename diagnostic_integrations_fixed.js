#!/usr/bin/env node

const https = require('https');

// Configuración
const ENDPOINT = 'https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql';
const TEST_EMAIL = 'cristhian.rosillo@clivi.com.mx';

console.log('🔍 Diagnóstico Completo de Integraciones MCP');
console.log('=============================================');
console.log(`📧 Usuario de prueba: ${TEST_EMAIL}`);
console.log(`🌐 Endpoint: ${ENDPOINT}`);
console.log('────────────────────────────────────────────\n');

// Función para hacer la consulta GraphQL
function queryEndpoint(email) {
  const query = `
    query GetUserProfile($query: String!) {
      getUserProfile(query: $query) {
        name
        firstName
        lastName
        email
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
        userId
        planStatus
        medicalPlan
        medicine
        medicineCount
        selfSupplyLogs
        allergies
        sourceBreakdown {
          field
          value
          source
        }
        suggestions
      }
    }
  `;

  const variables = { query: email };

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query,
      variables
    });

    const url = new URL(ENDPOINT);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.write(data);
    req.end();
  });
}

// Función principal de diagnóstico
async function runDiagnostic() {
  try {
    console.log('🏥 1. Health Check del Sistema...');
    
    const result = await queryEndpoint(TEST_EMAIL);
    
    if (result.errors) {
      console.log('❌ Errores en la respuesta GraphQL:');
      result.errors.forEach(error => {
        console.log(`   - ${error.message}`);
      });
      return;
    }

    const profile = result.data?.getUserProfile;
    
    if (!profile) {
      console.log('❌ No se recibió perfil de usuario');
      return;
    }

    console.log('✅ Conexión al endpoint exitosa\n');

    // Analizar datos del usuario
    console.log('👤 2. Análisis de Datos de Usuario:');
    if (profile.name || profile.email || profile.phone) {
      console.log('✅ Datos básicos de usuario encontrados:');
      console.log(`   - Nombre: ${profile.name || 'N/A'}`);
      console.log(`   - Nombre: ${profile.firstName || 'N/A'} ${profile.lastName || 'N/A'}`);
      console.log(`   - Email: ${profile.email || 'N/A'}`);
      console.log(`   - Teléfono: ${profile.phone || 'N/A'}`);
      console.log(`   - Empresa: ${profile.company || 'N/A'}`);
      console.log(`   - Título profesional: ${profile.jobTitle || 'N/A'}`);
      console.log(`   - Contact ID: ${profile.contactId || 'N/A'}`);
      console.log(`   - User ID: ${profile.userId || 'N/A'}`);
    } else {
      console.log('❌ No se encontraron datos básicos de usuario');
    }

    console.log('\n💳 3. Análisis de Suscripción:');
    if (profile.subscriptionStatus || profile.plan || profile.customerId) {
      console.log('✅ Datos de suscripción encontrados:');
      console.log(`   - Estado: ${profile.subscriptionStatus || 'N/A'}`);
      console.log(`   - Plan: ${profile.plan || 'N/A'}`);
      console.log(`   - Customer ID: ${profile.customerId || 'N/A'}`);
      console.log(`   - Subscription ID: ${profile.subscriptionId || 'N/A'}`);
      console.log(`   - Próximo cobro: ${profile.nextBillingAmount || 'N/A'} (${profile.nextBillingDate || 'N/A'})`);
      console.log(`   - Ciclo de facturación: ${profile.billingCycle || 'N/A'}`);
    } else {
      console.log('❌ No se encontraron datos de suscripción');
    }

    console.log('\n🏥 4. Análisis de Información Médica:');
    if (profile.medicalPlan || profile.medicine || profile.allergies) {
      console.log('✅ Información médica encontrada:');
      console.log(`   - Plan médico: ${profile.medicalPlan || 'N/A'}`);
      console.log(`   - Plan status: ${profile.planStatus || 'N/A'}`);
      if (profile.medicine && profile.medicine.length > 0) {
        console.log(`   - Medicamentos (${profile.medicineCount || profile.medicine.length}): ${profile.medicine.join(', ')}`);
      } else {
        console.log('   - Medicamentos: N/A');
      }
      if (profile.allergies && profile.allergies.length > 0) {
        console.log(`   - Alergias: ${profile.allergies.join(', ')}`);
      } else {
        console.log('   - Alergias: N/A');
      }
      if (profile.selfSupplyLogs && profile.selfSupplyLogs.length > 0) {
        console.log(`   - Logs de auto-suministro: ${profile.selfSupplyLogs.length} registros`);
      }
    } else {
      console.log('❌ No se encontró información médica');
    }

    console.log('\n🔍 5. Análisis de Fuentes de Datos:');
    if (profile.sourceBreakdown && profile.sourceBreakdown.length > 0) {
      console.log('✅ Breakdown de fuentes encontrado:');
      
      // Agrupar por fuente
      const hubspotFields = profile.sourceBreakdown.filter(item => item.source === 'hubspot');
      const chargebeeFields = profile.sourceBreakdown.filter(item => item.source === 'chargebee');
      const firebaseFields = profile.sourceBreakdown.filter(item => item.source === 'firebase');
      
      console.log(`\n📊 HubSpot (${hubspotFields.length} campos):`);
      if (hubspotFields.length > 0) {
        hubspotFields.forEach(field => {
          console.log(`   - ${field.field}: ${field.value || 'N/A'}`);
        });
      } else {
        console.log('   ❌ Sin datos de HubSpot');
      }

      console.log(`\n💳 Chargebee (${chargebeeFields.length} campos):`);
      if (chargebeeFields.length > 0) {
        chargebeeFields.forEach(field => {
          console.log(`   - ${field.field}: ${field.value || 'N/A'}`);
        });
      } else {
        console.log('   ❌ Sin datos de Chargebee');
      }

      console.log(`\n🔥 Firebase (${firebaseFields.length} campos):`);
      if (firebaseFields.length > 0) {
        firebaseFields.forEach(field => {
          console.log(`   - ${field.field}: ${field.value || 'N/A'}`);
        });
      } else {
        console.log('   ❌ Sin datos de Firebase');
      }
    } else {
      console.log('❌ No se encontró breakdown de fuentes');
    }

    if (profile.suggestions && profile.suggestions.length > 0) {
      console.log('\n💡 Sugerencias del sistema:');
      profile.suggestions.forEach(suggestion => {
        console.log(`   - ${suggestion}`);
      });
    }

    console.log('\n🏁 Diagnóstico Completado');
    console.log('========================');
    console.log('✅ El sistema está respondiendo correctamente');
    
    // Resumen de estado
    const hubspotOk = profile.sourceBreakdown?.some(item => item.source === 'hubspot') || false;
    const chargebeeOk = profile.sourceBreakdown?.some(item => item.source === 'chargebee') || false;
    const firebaseOk = profile.sourceBreakdown?.some(item => item.source === 'firebase') || false;
    
    console.log('\n📊 Resumen de Estado:');
    console.log(`HubSpot: ${hubspotOk ? '✅' : '❌'}`);
    console.log(`Chargebee: ${chargebeeOk ? '✅' : '❌'}`);
    console.log(`Firebase: ${firebaseOk ? '✅' : '❌'}`);

  } catch (error) {
    console.log(`❌ Error general en diagnóstico: ${error.message}`);
  }
}

// Ejecutar el diagnóstico
runDiagnostic();
