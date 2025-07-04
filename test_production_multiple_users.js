require('dotenv').config();

const test_production_multiple_users = async () => {
  const productionUrl = 'https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql';
  
  // Lista de emails para probar (algunos probablemente existan en el sistema)
  const testEmails = [
    'gustavo.salgado@clivi.com.mx', // Email original
    'test@clivi.com.mx', // Email genérico
    'admin@clivi.com.mx', // Email administrativo
    'usuario@ejemplo.com', // Email de prueba genérico
    'cristian.rosillo@clivi.com.mx' // Otro email que podría existir basado en logs previos
  ];
  
  console.log('🌐 Test Múltiple del MCP Orchestrator en Producción');
  console.log('====================================================');
  console.log('🔗 URL de producción:', productionUrl);
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📧 Emails a probar:', testEmails.length);
  console.log('─────────────────────────────────────────────────────');

  try {
    // Importar fetch dinámicamente
    const fetch = (await import('node-fetch')).default;

    // Query GraphQL simple para verificar usuarios
    const createQuery = (email) => ({
      query: `
        query TestUser($query: String!) {
          getUserProfile(query: $query) {
            # Campos básicos para verificar existencia
            userId
            contactId
            customerId
            email
            name
            firstName
            lastName
            phone
            
            # Información de planes/suscripciones
            plan
            subscriptionStatus
            planStatus
            
            # Trazabilidad
            sourceBreakdown {
              field
              value
              source
            }
          }
        }
      `,
      variables: {
        query: email
      }
    });

    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      console.log(`\n${i + 1}. 🔍 Probando con: ${email}`);
      console.log('─'.repeat(50));
      
      try {
        const startTime = Date.now();
        const response = await fetch(productionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'MCP-Orchestrator-MultiTest/1.0'
          },
          body: JSON.stringify(createQuery(email)),
          timeout: 15000 // 15 segundos timeout
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log(`   ⏱️  Tiempo: ${responseTime}ms | Status: ${response.status}`);

        if (response.ok) {
          const result = await response.json();
          
          if (result.errors) {
            console.log(`   ❌ Error: ${result.errors[0].message}`);
          } else if (result.data && result.data.getUserProfile) {
            const profile = result.data.getUserProfile;
            console.log(`   ✅ ¡USUARIO ENCONTRADO!`);
            console.log(`   📧 Email: ${profile.email || email}`);
            console.log(`   👤 Nombre: ${profile.name || profile.firstName || 'N/A'}`);
            console.log(`   🆔 IDs: User=${profile.userId || 'N/A'}, Contact=${profile.contactId || 'N/A'}, Customer=${profile.customerId || 'N/A'}`);
            console.log(`   📋 Plan: ${profile.plan || 'N/A'} | Estado: ${profile.subscriptionStatus || profile.planStatus || 'N/A'}`);
            
            if (profile.sourceBreakdown && profile.sourceBreakdown.length > 0) {
              const sources = [...new Set(profile.sourceBreakdown.map(s => s.source))];
              console.log(`   📊 Fuentes: ${sources.join(', ')} (${profile.sourceBreakdown.length} campos)`);
            }
            
            console.log('\n   📄 Respuesta completa:');
            console.log(JSON.stringify(result.data.getUserProfile, null, 4));
            
            // Si encontramos un usuario, podemos hacer un análisis más detallado
            console.log('\n   ⭐ ANÁLISIS DETALLADO:');
            const hasChargebee = profile.sourceBreakdown?.some(s => s.source === 'chargebee');
            const hasHubSpot = profile.sourceBreakdown?.some(s => s.source === 'hubspot');
            const hasFirestore = profile.sourceBreakdown?.some(s => s.source === 'firestore');
            
            console.log(`   💳 Chargebee: ${hasChargebee ? '✅ Conectado' : '❌ Sin datos'}`);
            console.log(`   📞 HubSpot: ${hasHubSpot ? '✅ Conectado' : '❌ Sin datos'}`);
            console.log(`   🏥 Firestore: ${hasFirestore ? '✅ Conectado' : '❌ Sin datos'}`);
            
          } else {
            console.log(`   ❌ Usuario no encontrado (respuesta vacía)`);
          }
        } else {
          console.log(`   ❌ Error HTTP: ${response.status} ${response.statusText}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error de conexión: ${error.message}`);
      }
      
      // Pequeña pausa entre consultas para no sobrecargar el servidor
      if (i < testEmails.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo
      }
    }

  } catch (error) {
    console.error('\n❌ Error general durante las pruebas:', error.message);
  }

  console.log('\n🏁 Test múltiple completado');
  console.log('============================');
  console.log('⏰ Fin:', new Date().toISOString());
  
  // Test adicional del endpoint de salud
  console.log('\n🔧 Probando endpoint de salud...');
  try {
    const fetch = (await import('node-fetch')).default;
    const healthQuery = {
      query: `query { health }`
    };
    
    const response = await fetch(productionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(healthQuery)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Health check: ${result.data?.health || 'OK'}`);
    } else {
      console.log(`❌ Health check failed: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Health check error: ${error.message}`);
  }
};

// Ejecutar el test
test_production_multiple_users().catch(console.error);
