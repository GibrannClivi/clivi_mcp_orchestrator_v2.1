/**
 * Debugging script to test HubSpot API directly
 */
import * as dotenv from 'dotenv';
dotenv.config();

async function testHubSpotAPI() {
  const apiKey = process.env.HUBSPOT_API_KEY;
  const email = 'cristian.rosillo@clivi.com.mx';
  
  console.log('🔍 Testing HubSpot API with email:', email);
  console.log('🔑 Using API Key:', apiKey?.substring(0, 10) + '...');
  
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
        properties: [
          'email', 'firstname', 'lastname', 'phone', 'company', 
          'jobtitle', 'city', 'state', 'country', 'website',
          'createdate', 'lastmodifieddate', 'hs_object_id',
          'lastactivitydate', 'hs_lead_status', 'hubspotscore',
          'lifecyclestage', 'hs_analytics_source', 'num_notes'
        ],
        limit: 10
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success! Found contacts:', data.results?.length || 0);
    console.log('📋 Full response:', JSON.stringify(data, null, 2));
    
    if (data.results && data.results.length > 0) {
      console.log('👤 First contact data:', JSON.stringify(data.results[0], null, 2));
    }
  } catch (error) {
    console.error('💥 Network/Parse error:', error);
  }
}

testHubSpotAPI().catch(console.error);
