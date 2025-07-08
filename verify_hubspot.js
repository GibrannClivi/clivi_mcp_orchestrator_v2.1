#!/usr/bin/env node

/**
 * Verificador y solucionador de problemas de HubSpot API
 * Verifica el token, permisos y conectividad
 */

require('dotenv').config();

async function verifyAndFixHubSpotAPI() {
  console.log('🔧 VERIFICADOR DE HUBSPOT API');
  console.log('=============================');
  
  const apiKey = process.env.HUBSPOT_API_KEY;
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  
  if (!apiKey) {
    console.log('❌ HUBSPOT_API_KEY no configurado');
    return;
  }
  
  if (!portalId) {
    console.log('❌ HUBSPOT_PORTAL_ID no configurado');
    return;
  }
  
  console.log('✅ Variables configuradas');
  console.log(`📋 Portal ID: ${portalId}`);
  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
  console.log('');
  
  // Verificar formato del token
  console.log('🔍 VERIFICANDO FORMATO DEL TOKEN:');
  if (apiKey.startsWith('pat-')) {
    console.log('✅ Formato Personal Access Token correcto');
  } else if (apiKey.startsWith('eu1-') || apiKey.startsWith('na1-')) {
    console.log('✅ Formato API Key regional correcto');
  } else {
    console.log('⚠️  Formato de token no reconocido');
  }
  console.log('');
  
  // Test 1: Account Info (básico)
  console.log('🧪 TEST 1: Account Information');
  try {
    const accountResponse = await fetch('https://api.hubapi.com/account-info/v3/details', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${accountResponse.status} ${accountResponse.statusText}`);
    
    if (accountResponse.ok) {
      const accountData = await accountResponse.json();
      console.log('✅ Conexión exitosa');
      console.log(`📋 Portal: ${accountData.portalId}`);
      console.log(`🏢 Domain: ${accountData.accountType}`);
    } else {
      const errorText = await accountResponse.text();
      console.log(`❌ Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
  }
  console.log('');
  
  // Test 2: Contacts API (lo que usamos)
  console.log('🧪 TEST 2: Contacts API');
  try {
    const contactsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${contactsResponse.status} ${contactsResponse.statusText}`);
    
    if (contactsResponse.ok) {
      const contactsData = await contactsResponse.json();
      console.log('✅ Acceso a Contacts API exitoso');
      console.log(`📋 Contactos disponibles: ${contactsData.total || 'No especificado'}`);
    } else {
      const errorText = await contactsResponse.text();
      console.log(`❌ Error: ${errorText}`);
      
      if (contactsResponse.status === 401) {
        console.log('');
        console.log('🔧 SOLUCIONES PARA ERROR 401:');
        console.log('1. Verificar que el token no haya expirado');
        console.log('2. Verificar permisos de CRM en el token');
        console.log('3. Regenerar el Personal Access Token en HubSpot');
        console.log('4. Verificar que el portal ID sea correcto');
      }
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
  }
  console.log('');
  
  // Test 3: Search API (específico)
  console.log('🧪 TEST 3: Search API (que usamos en el sistema)');
  try {
    const searchPayload = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: 'test@example.com'
        }]
      }],
      properties: ['email', 'firstname', 'lastname']
    };
    
    const searchResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchPayload)
    });
    
    console.log(`📊 Status: ${searchResponse.status} ${searchResponse.statusText}`);
    
    if (searchResponse.ok) {
      console.log('✅ Search API funcionando');
    } else {
      const errorText = await searchResponse.text();
      console.log(`❌ Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`❌ Error de conexión: ${error.message}`);
  }
  console.log('');
  
  // Instrucciones para renovar token
  console.log('🔄 CÓMO RENOVAR EL TOKEN DE HUBSPOT:');
  console.log('=====================================');
  console.log('1. Ir a: https://app.hubspot.com/settings/integrations/api-key');
  console.log('2. O ir a: Settings > Integrations > Private Apps');
  console.log('3. Crear nuevo Private App o regenerar token existente');
  console.log('4. Asegurar permisos: CRM (read), Contacts (read/write)');
  console.log('5. Copiar el nuevo token y actualizar .env');
  console.log('');
  console.log('🔐 PERMISOS NECESARIOS:');
  console.log('- crm.objects.contacts.read');
  console.log('- crm.objects.deals.read');
  console.log('- crm.schemas.contacts.read');
  console.log('');
}

// Ejecutar verificación
verifyAndFixHubSpotAPI()
  .then(() => {
    console.log('✅ Verificación completada');
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
