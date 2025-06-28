/**
 * Search for Rosillo in HubSpot
 */
import * as dotenv from 'dotenv';
dotenv.config();

async function searchByLastName() {
  const apiKey = process.env.HUBSPOT_API_KEY;
  
  console.log(`\n🔍 Searching by lastname: "Rosillo"`);
  
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
              propertyName: 'lastname',
              operator: 'CONTAINS_TOKEN',
              value: 'Rosillo'
            }
          ]
        }],
        properties: ['email', 'firstname', 'lastname', 'hs_object_id', 'phone', 'company'],
        limit: 10
      })
    });

    if (!response.ok) {
      console.error(`❌ Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log(`📊 Found: ${data.results?.length || 0} contacts with lastname "Rosillo"`);
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((contact: any, index: number) => {
        console.log(`   ${index + 1}. ${contact.properties.firstname} ${contact.properties.lastname}`);
        console.log(`      📧 ${contact.properties.email || 'No email'}`);
        console.log(`      🏢 ${contact.properties.company || 'No company'}`);
        console.log(`      📱 ${contact.properties.phone || 'No phone'}`);
        console.log(`      🆔 ID: ${contact.id}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function searchInCompany() {
  const apiKey = process.env.HUBSPOT_API_KEY;
  
  console.log(`\n🔍 Searching by company containing "clivi"`);
  
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
              propertyName: 'company',
              operator: 'CONTAINS_TOKEN',
              value: 'clivi'
            }
          ]
        }],
        properties: ['email', 'firstname', 'lastname', 'hs_object_id', 'phone', 'company'],
        limit: 20
      })
    });

    if (!response.ok) {
      console.error(`❌ Error: ${response.status}`);
      return;
    }

    const data = await response.json();
    console.log(`📊 Found: ${data.results?.length || 0} contacts with company containing "clivi"`);
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((contact: any, index: number) => {
        console.log(`   ${index + 1}. ${contact.properties.firstname} ${contact.properties.lastname}`);
        console.log(`      📧 ${contact.properties.email || 'No email'}`);
        console.log(`      🏢 ${contact.properties.company || 'No company'}`);
        console.log(`      🆔 ID: ${contact.id}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

async function main() {
  await searchByLastName();
  await searchInCompany();
}

main().catch(console.error);
