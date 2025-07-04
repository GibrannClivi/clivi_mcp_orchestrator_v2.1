/**
 * DEBUG ESPECÍFICO - Problema con cristhian.rosillo@clivi.com.mx en HubSpot
 * Vamos a diagnosticar paso a paso por qué no obtenemos datos
 */

import dotenv from 'dotenv';
dotenv.config();

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const EMAIL_TO_TEST = 'cristhian.rosillo@clivi.com.mx';

async function debugHubSpotDetailed() {
  console.log('🚀 DEBUG DETALLADO - HubSpot para cristhian.rosillo@clivi.com.mx');
  console.log('='.repeat(60));
  
  if (!HUBSPOT_API_KEY) {
    console.error('❌ HUBSPOT_API_KEY not found in environment');
    return;
  }
  
  console.log(`✅ API Key found: ${HUBSPOT_API_KEY.substring(0, 10)}...`);
  console.log(`🎯 Testing email: ${EMAIL_TO_TEST}`);
  
  try {
    // Test 1: Search usando el método actual
    console.log('\n📍 TEST 1: Search usando método actual (EQ operator)');
    const searchData1 = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: EMAIL_TO_TEST
        }]
      }],
      properties: [
        'email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle',
        'hs_lead_status', 'hubspotscore', 'lastmodifieddate', 'createdate'
      ]
    };
    
    const response1 = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchData1)
    });
    
    console.log(`Status: ${response1.status} ${response1.statusText}`);
    
    if (response1.ok) {
      const data1 = await response1.json() as any;
      console.log(`✅ Resultados encontrados: ${data1.results?.length || 0}`);
      if (data1.results && data1.results.length > 0) {
        console.log('📧 Email encontrado:', data1.results[0].properties.email);
        console.log('👤 Nombre:', data1.results[0].properties.firstname, data1.results[0].properties.lastname);
        console.log('🏢 Empresa:', data1.results[0].properties.company);
      } else {
        console.log('❌ No se encontraron resultados con operador EQ');
      }
    } else {
      const errorText = await response1.text();
      console.log('❌ Error en respuesta:', errorText);
    }
    
    // Test 2: Search con CONTAINS operator
    console.log('\n📍 TEST 2: Search usando CONTAINS operator');
    const searchData2 = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'CONTAINS_TOKEN',
          value: EMAIL_TO_TEST
        }]
      }],
      properties: [
        'email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle',
        'hs_lead_status', 'hubspotscore', 'lastmodifieddate', 'createdate'
      ]
    };
    
    const response2 = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchData2)
    });
    
    console.log(`Status: ${response2.status} ${response2.statusText}`);
    
    if (response2.ok) {
      const data2 = await response2.json() as any;
      console.log(`✅ Resultados encontrados: ${data2.results?.length || 0}`);
      if (data2.results && data2.results.length > 0) {
        data2.results.forEach((contact: any, index: number) => {
          console.log(`Contact ${index + 1}:`);
          console.log(`  📧 Email: ${contact.properties.email}`);
          console.log(`  👤 Nombre: ${contact.properties.firstname} ${contact.properties.lastname}`);
          console.log(`  🏢 Empresa: ${contact.properties.company}`);
          console.log(`  📞 Teléfono: ${contact.properties.phone}`);
        });
      } else {
        console.log('❌ No se encontraron resultados con operador CONTAINS_TOKEN');
      }
    } else {
      const errorText = await response2.text();
      console.log('❌ Error en respuesta:', errorText);
    }
    
    // Test 3: Buscar por partes del email (dominio)
    console.log('\n📍 TEST 3: Buscar por dominio (clivi.com.mx)');
    const searchData3 = {
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'CONTAINS_TOKEN',
          value: 'clivi.com.mx'
        }]
      }],
      properties: [
        'email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle',
        'hs_lead_status', 'hubspotscore', 'lastmodifieddate', 'createdate'
      ],
      limit: 20
    };
    
    const response3 = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchData3)
    });
    
    console.log(`Status: ${response3.status} ${response3.statusText}`);
    
    if (response3.ok) {
      const data3 = await response3.json() as any;
      console.log(`✅ Contactos con dominio clivi.com.mx: ${data3.results?.length || 0}`);
      
      if (data3.results && data3.results.length > 0) {
        let foundCristhian = false;
        data3.results.forEach((contact: any, index: number) => {
          const email = contact.properties.email;
          console.log(`  ${index + 1}. ${email} - ${contact.properties.firstname} ${contact.properties.lastname}`);
          
          if (email && email.toLowerCase() === EMAIL_TO_TEST.toLowerCase()) {
            foundCristhian = true;
            console.log(`  🎯 ¡ENCONTRADO! Este es el contacto que buscamos`);
          }
        });
        
        if (!foundCristhian) {
          console.log(`❌ cristhian.rosillo@clivi.com.mx NO encontrado en los resultados del dominio`);
        }
      }
    } else {
      const errorText = await response3.text();
      console.log('❌ Error en respuesta:', errorText);
    }
    
    // Test 4: Buscar por nombre
    console.log('\n📍 TEST 4: Buscar por nombre (cristhian)');
    const searchData4 = {
      filterGroups: [{
        filters: [{
          propertyName: 'firstname',
          operator: 'CONTAINS_TOKEN',
          value: 'cristhian'
        }]
      }],
      properties: [
        'email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle',
        'hs_lead_status', 'hubspotscore', 'lastmodifieddate', 'createdate'
      ],
      limit: 20
    };
    
    const response4 = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchData4)
    });
    
    console.log(`Status: ${response4.status} ${response4.statusText}`);
    
    if (response4.ok) {
      const data4 = await response4.json() as any;
      console.log(`✅ Contactos con nombre cristhian: ${data4.results?.length || 0}`);
      
      if (data4.results && data4.results.length > 0) {
        let foundCristhian = false;
        data4.results.forEach((contact: any, index: number) => {
          const email = contact.properties.email;
          const name = `${contact.properties.firstname} ${contact.properties.lastname}`;
          console.log(`  ${index + 1}. ${email} - ${name}`);
          
          if (email && email.toLowerCase() === EMAIL_TO_TEST.toLowerCase()) {
            foundCristhian = true;
            console.log(`  🎯 ¡ENCONTRADO! Este es el contacto que buscamos`);
          }
        });
        
        if (!foundCristhian) {
          console.log(`❌ cristhian.rosillo@clivi.com.mx NO encontrado en los resultados por nombre`);
        }
      }
    } else {
      const errorText = await response4.text();
      console.log('❌ Error en respuesta:', errorText);
    }
    
    // Test 5: Listar algunos contactos para ver formato
    console.log('\n📍 TEST 5: Listar algunos contactos para revisar formato');
    const response5 = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=5&properties=email,firstname,lastname,phone,company', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response5.ok) {
      const data5 = await response5.json() as any;
      console.log(`✅ Muestra de contactos en HubSpot: ${data5.results?.length || 0}`);
      
      if (data5.results && data5.results.length > 0) {
        data5.results.forEach((contact: any, index: number) => {
          console.log(`  ${index + 1}. ${contact.properties.email || 'No email'} - ${contact.properties.firstname || 'No name'} ${contact.properties.lastname || ''}`);
        });
      }
    } else {
      const errorText = await response5.text();
      console.log('❌ Error obteniendo muestra de contactos:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error general en debug:', error);
  }
  
  console.log('\n🏁 Debug completado');
}

// Ejecutar el debug
debugHubSpotDetailed().catch(console.error);
