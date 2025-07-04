const https = require('https');

const diagnostic_integrations = async () => {
  const productionUrl = 'https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql';
  const testEmail = 'cristhian.rosillo@clivi.com.mx';
  
  console.log('🔍 Diagnóstico Completo de Integraciones MCP');
  console.log('=============================================');
  console.log(`📧 Usuario de prueba: ${testEmail}`);
  console.log(`🌐 Endpoint: ${productionUrl}`);
  console.log('────────────────────────────────────────────');

  try {
    // 1. Health Check del sistema
    console.log('\n🏥 1. Health Check del Sistema...');
    const healthQuery = {
      query: `query { getHealth }`
    };

    const healthResponse = await fetch(productionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(healthQuery)
    });

    if (healthResponse.ok) {
      const healthResult = await healthResponse.json();
      console.log(`✅ Sistema: ${healthResult.data.getHealth}`);
    } else {
      console.log(`❌ Health Check falló: ${healthResponse.status}`);
    }

    // 2. Consulta básica para verificar disponibilidad de campos
    console.log('\n📊 2. Verificación de Schema GraphQL...');
    const basicQuery = {
      query: `
        query TestBasic {
          getUserProfile(query: "${testEmail}") {
            email
            name
            firstName
            lastName
            phone
            contactId
            customerId
            userId
            subscriptionId
            plan
            subscriptionStatus
            planStatus
            medicineCount
            sourceBreakdown {
              field
              value
              source
            }
          }
        }
      `
    };

    const basicResponse = await fetch(productionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(basicQuery)
    });

    const basicResult = await basicResponse.json();
    
    if (basicResult.errors) {
      console.log('❌ Errores en schema GraphQL:');
      basicResult.errors.forEach(error => {
        console.log(`   - ${error.message}`);
      });
    } else {
      console.log('✅ Schema GraphQL válido');
      
      if (basicResult.data && basicResult.data.getUserProfile) {
        const profile = basicResult.data.getUserProfile;
        console.log('\n📋 Perfil obtenido:');
        console.log(`   Email: ${profile.email || 'N/A'}`);
        console.log(`   Nombre: ${profile.name || 'N/A'}`);
        console.log(`   Teléfono: ${profile.phone || 'N/A'}`);
        
        console.log('\n🔍 IDs por fuente:');
        console.log(`   Contact ID (HubSpot): ${profile.contactId || 'N/A'}`);
        console.log(`   Customer ID (Chargebee): ${profile.customerId || 'N/A'}`);
        console.log(`   User ID (Firebase): ${profile.userId || 'N/A'}`);
        
        console.log('\n💳 Datos comerciales:');
        console.log(`   Plan: ${profile.plan || 'N/A'}`);
        console.log(`   Estado suscripción: ${profile.subscriptionStatus || 'N/A'}`);
        console.log(`   Plan médico: ${profile.planStatus || 'N/A'}`);
        
        console.log('\n🏥 Datos médicos:');
        console.log(`   Cantidad medicinas: ${profile.medicineCount || 'N/A'}`);
        
        console.log('\n📊 Trazabilidad de fuentes:');
        if (profile.sourceBreakdown && profile.sourceBreakdown.length > 0) {
          const sources = {};
          profile.sourceBreakdown.forEach(item => {
            if (!sources[item.source]) sources[item.source] = [];
            sources[item.source].push(`${item.field}: ${item.value}`);
          });
          
          Object.entries(sources).forEach(([source, fields]) => {
            console.log(`   📍 ${source.toUpperCase()}:`);
            fields.forEach(field => console.log(`      - ${field}`));
          });
        } else {
          console.log('   ❌ No hay trazabilidad de fuentes');
        }
        
      } else {
        console.log(`❌ No se encontraron datos para: ${testEmail}`);
      }
    }

    // 3. Consulta extendida para verificar campos adicionales
    console.log('\n🧪 3. Verificación de Campos Extendidos...');
    const extendedQuery = {
      query: `
        query TestExtended {
          getUserProfile(query: "${testEmail}") {
            email
            name
            sourceBreakdown {
              field
              value
              source
            }
            suggestions
          }
        }
      `
    };

    const extendedResponse = await fetch(productionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(extendedQuery)
    });

    const extendedResult = await extendedResponse.json();
    
    if (extendedResult.errors) {
      console.log('❌ Errores en consulta extendida:');
      extendedResult.errors.forEach(error => {
        console.log(`   - ${error.message}`);
      });
    } else {
      console.log('✅ Campos extendidos disponibles');
      
      if (extendedResult.data && extendedResult.data.getUserProfile) {
        const profile = extendedResult.data.getUserProfile;
        
        if (profile.suggestions && profile.suggestions.length > 0) {
          console.log('📋 Sugerencias disponibles:');
          profile.suggestions.forEach(suggestion => {
            console.log(`   - ${suggestion}`);
          });
        }
      }
    }

    // 4. Análisis por fuente de datos
    console.log('\n🔍 4. Análisis por Fuente de Datos...');
    
    if (basicResult.data && basicResult.data.getUserProfile && basicResult.data.getUserProfile.sourceBreakdown) {
      const breakdown = basicResult.data.getUserProfile.sourceBreakdown;
      const sourceStats = {};
      
      breakdown.forEach(item => {
        if (!sourceStats[item.source]) {
          sourceStats[item.source] = { count: 0, fields: [] };
        }
        sourceStats[item.source].count++;
        sourceStats[item.source].fields.push(item.field);
      });
      
      Object.entries(sourceStats).forEach(([source, stats]) => {
        console.log(`   📊 ${source.toUpperCase()}: ${stats.count} campos`);
        console.log(`      Campos: ${stats.fields.join(', ')}`);
      });
      
      // Verificar si HubSpot está retornando datos
      const hubspotData = sourceStats['hubspot'];
      const chargebeeData = sourceStats['chargebee'];
      const firebaseData = sourceStats['firebase'] || sourceStats['firestore'];
      
      console.log('\n🎯 Estado de Integraciones:');
      console.log(`   HubSpot: ${hubspotData ? `✅ ${hubspotData.count} campos` : '❌ Sin datos'}`);
      console.log(`   Chargebee: ${chargebeeData ? `✅ ${chargebeeData.count} campos` : '❌ Sin datos'}`);
      console.log(`   Firebase: ${firebaseData ? `✅ ${firebaseData.count} campos` : '❌ Sin datos'}`);
      
      if (!hubspotData) {
        console.log('\n⚠️  PROBLEMA DETECTADO: HubSpot no está retornando datos');
        console.log('   Posibles causas:');
        console.log('   1. Token de HubSpot expirado o inválido');
        console.log('   2. El usuario no existe en HubSpot');
        console.log('   3. Problemas de conectividad con HubSpot API');
        console.log('   4. Configuración incorrecta en el servidor');
      }
      
    } else {
      console.log('❌ No hay sourceBreakdown disponible para análisis');
    }

    // 5. Test con usuario conocido del sistema
    console.log('\n🧪 5. Test con Usuario del Sistema...');
    const knownUserQuery = {
      query: `
        query TestKnownUser {
          getUserProfile(query: "test@upgradebalance.com") {
            email
            name
            contactId
            customerId
            userId
            sourceBreakdown {
              field
              value
              source
            }
          }
        }
      `
    };

    const knownUserResponse = await fetch(productionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(knownUserQuery)
    });

    const knownUserResult = await knownUserResponse.json();
    
    if (knownUserResult.data && knownUserResult.data.getUserProfile) {
      const profile = knownUserResult.data.getUserProfile;
      console.log('✅ Usuario conocido encontrado:');
      console.log(`   Email: ${profile.email}`);
      console.log(`   Nombre: ${profile.name || 'N/A'}`);
      
      const sources = profile.sourceBreakdown ? 
        [...new Set(profile.sourceBreakdown.map(item => item.source))] : [];
      console.log(`   Fuentes activas: ${sources.join(', ')}`);
      
    } else if (knownUserResult.errors) {
      console.log('❌ Error en consulta de usuario conocido:');
      knownUserResult.errors.forEach(error => {
        console.log(`   - ${error.message}`);
      });
    } else {
      console.log('❌ Usuario conocido no encontrado');
    }

  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error.message);
  }

  console.log('\n🏁 Diagnóstico Completado');
  console.log('========================');
  console.log('Verifique los resultados arriba para identificar problemas específicos.');
};

// Ejecutar diagnóstico
diagnostic_integrations().catch(console.error);
