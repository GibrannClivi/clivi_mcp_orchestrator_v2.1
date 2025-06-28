/**
 * Debugging script to test different email variations in HubSpot
 */
import * as dotenv from 'dotenv';
dotenv.config();

async function searchHubSpotEmail(email: string) {
  const apiKey = process.env.HUBSPOT_API_KEY;
  
  console.log(`\n🔍 Testing HubSpot API with email: "${email}"`);
  
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        }],
        properties: ['email', 'firstname', 'lastname', 'hs_object_id'],
        limit: 5
      })
    });

    if (!response.ok) {
      console.error(`❌ Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log(`📊 Found: ${data.results?.length || 0} contacts`);
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((contact: any, index: number) => {
        console.log(`   ${index + 1}. ${contact.properties.firstname} ${contact.properties.lastname} (${contact.properties.email})`);
      });
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function searchByName() {
  const apiKey = process.env.HUBSPOT_API_KEY;
  
  console.log(`\n🔍 Searching by name: "Cristian Rosillo"`);
  
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [
            {
              propertyName: 'firstname',
              operator: 'CONTAINS_TOKEN',
              value: 'Cristian'
            }
          ]
        }],
        properties: ['email', 'firstname', 'lastname', 'hs_object_id'],
        limit: 10
      })
    });

    if (!response.ok) {
      console.error(`❌ Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log(`📊 Found: ${data.results?.length || 0} contacts with name "Cristian"`);
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((contact: any, index: number) => {
        console.log(`   ${index + 1}. ${contact.properties.firstname} ${contact.properties.lastname} (${contact.properties.email})`);
      });
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function main() {
  console.log('🔍 Testing different email variations and name search...');
  
  // Test different email variations
  const emailVariations = [
    'cristian.rosillo@clivi.com.mx',
    'Cristian.Rosillo@clivi.com.mx',
    'CRISTIAN.ROSILLO@CLIVI.COM.MX',
    'cristian.rosillo@clivi.mx',
    'cristian@clivi.com.mx'
  ];
  
  for (const email of emailVariations) {
    await searchHubSpotEmail(email);
  }
  
  // Search by name
  await searchByName();
}

main().catch(console.error);
