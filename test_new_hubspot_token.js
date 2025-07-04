require('dotenv').config();

const test_new_hubspot_token = async () => {
  console.log('🔑 Test del Nuevo Token de HubSpot');
  console.log('=====================================');
  console.log(`📧 Usuario de prueba: cristhian.rosillo@clivi.com.mx`);
  console.log(`🔑 Nuevo token: ${process.env.HUBSPOT_ACCESS_TOKEN?.substring(0, 25)}...`);
  console.log('---');

  try {
    // Importar dinámicamente el client de HubSpot
    const { Client } = await import('@hubspot/api-client');
    const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

    // 1. Test básico de autenticación
    console.log('\n1️⃣ Test de autenticación...');
    try {
      const testAuth = await hubspotClient.crm.contacts.basicApi.getPage(1);
      console.log(`✅ Autenticación exitosa - Encontrados ${testAuth.results.length} contactos`);
    } catch (error) {
      console.error('❌ Error de autenticación:', error.message);
      return;
    }

    // 2. Búsqueda específica por email
    console.log('\n2️⃣ Búsqueda por email exacto...');
    const searchRequest = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: 'cristhian.rosillo@clivi.com.mx'
        }]
      }],
      properties: [
        'email', 'firstname', 'lastname', 'phone', 'company',
        'createdate', 'lastmodifieddate', 'lifecyclestage',
        'hs_lead_status', 'jobtitle'
      ],
      limit: 10
    };

    const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch(searchRequest);
    
    if (searchResponse.results && searchResponse.results.length > 0) {
      console.log(`✅ Usuario encontrado! (${searchResponse.results.length} resultados)`);
      
      searchResponse.results.forEach((contact, index) => {
        console.log(`\n📋 Contacto ${index + 1}:`);
        console.log(`   - ID: ${contact.id}`);
        console.log(`   - Email: ${contact.properties.email}`);
        console.log(`   - Nombre: ${contact.properties.firstname || 'N/A'} ${contact.properties.lastname || 'N/A'}`);
        console.log(`   - Teléfono: ${contact.properties.phone || 'N/A'}`);
        console.log(`   - Empresa: ${contact.properties.company || 'N/A'}`);
        console.log(`   - Cargo: ${contact.properties.jobtitle || 'N/A'}`);
        console.log(`   - Lifecycle Stage: ${contact.properties.lifecyclestage || 'N/A'}`);
        console.log(`   - Lead Status: ${contact.properties.hs_lead_status || 'N/A'}`);
        console.log(`   - Creado: ${contact.properties.createdate || 'N/A'}`);
        console.log(`   - Modificado: ${contact.properties.lastmodifieddate || 'N/A'}`);
        
        // Validar coincidencia exacta
        if (contact.properties.email === 'cristhian.rosillo@clivi.com.mx') {
          console.log(`   ✅ COINCIDENCIA EXACTA confirmada`);
        } else {
          console.log(`   ⚠️  Email no coincide exactamente: ${contact.properties.email}`);
        }
      });
    } else {
      console.log('❌ No se encontró el usuario en HubSpot');
      
      // Intentar búsqueda más amplia
      console.log('\n3️⃣ Búsqueda amplia por nombre...');
      const broadSearch = {
        filterGroups: [{
          filters: [{
            propertyName: 'firstname',
            operator: 'CONTAINS_TOKEN',
            value: 'cristhian'
          }]
        }],
        properties: ['email', 'firstname', 'lastname'],
        limit: 5
      };
      
      const broadResults = await hubspotClient.crm.contacts.searchApi.doSearch(broadSearch);
      if (broadResults.results?.length > 0) {
        console.log(`📋 Encontrados ${broadResults.results.length} contactos con nombre similar:`);
        broadResults.results.forEach((contact, i) => {
          console.log(`   ${i+1}. ${contact.properties.firstname} ${contact.properties.lastname} - ${contact.properties.email}`);
        });
      }
    }

    // 4. Test de información de la cuenta
    console.log('\n4️⃣ Información de la cuenta HubSpot...');
    try {
      const accountInfo = await hubspotClient.oauth.accessTokensApi.get(process.env.HUBSPOT_ACCESS_TOKEN);
      console.log(`✅ Portal ID: ${accountInfo.hubId}`);
      console.log(`✅ Scopes: ${accountInfo.scopes?.join(', ') || 'N/A'}`);
      console.log(`✅ Token válido hasta: ${accountInfo.expiresAt ? new Date(accountInfo.expiresAt).toISOString() : 'N/A'}`);
    } catch (error) {
      console.log('⚠️  No se pudo obtener info de la cuenta (permisos limitados)');
    }

  } catch (error) {
    console.error('❌ Error general:', error.message);
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.error('🔑 Token inválido o sin permisos suficientes');
    }
  }

  console.log('\n✅ Test del nuevo token completado');
};

// Ejecutar test
test_new_hubspot_token().catch(console.error);
