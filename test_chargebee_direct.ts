/**
 * Direct Chargebee API test to verify if the issue is in our code or the API
 */

import { config } from './src/config';

async function testChargebeeAPIDirectly() {
  console.log('🧪 TESTING CHARGEBEE API DIRECTLY');
  console.log('='.repeat(60));

  const baseUrl = `https://${config.chargebee.site}.chargebee.com/api/v2`;
  const apiKey = config.chargebee.apiKey;
  const authHeader = `Basic ${Buffer.from(apiKey + ':').toString('base64')}`;

  const testEmails = [
    'test@upgradebalance.com',
    'saidh.jimenez@clivi.com.mx'
  ];

  for (const email of testEmails) {
    console.log(`\n🔸 Testing ${email}`);
    console.log('-'.repeat(40));

    try {
      // Step 1: Search customer by email
      console.log(`1️⃣ Searching customer by email: ${email}`);
      const customerResponse = await fetch(`${baseUrl}/customers?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      });

      if (!customerResponse.ok) {
        console.error(`❌ Customer search failed: ${customerResponse.status} ${customerResponse.statusText}`);
        continue;
      }

      const customerData = await customerResponse.json() as any;
      console.log(`📊 Found ${customerData.list?.length || 0} customers`);

      if (!customerData.list || customerData.list.length === 0) {
        console.log(`❌ No customers found for ${email}`);
        continue;
      }

      // Find exact email match
      const exactCustomer = customerData.list.find((item: any) => 
        item.customer.email && item.customer.email.toLowerCase() === email.toLowerCase()
      );

      if (!exactCustomer) {
        console.log(`❌ No exact email match found`);
        console.log(`📋 Available emails: ${customerData.list.map((item: any) => item.customer.email).join(', ')}`);
        continue;
      }

      const customer = exactCustomer.customer;
      console.log(`✅ Found exact customer: ${customer.email} (ID: ${customer.id})`);

      // Step 2: Get subscriptions for this customer
      console.log(`2️⃣ Getting subscriptions for customer_id: ${customer.id}`);
      const subscriptionResponse = await fetch(`${baseUrl}/subscriptions?customer_id=${encodeURIComponent(customer.id)}`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      });

      if (!subscriptionResponse.ok) {
        console.error(`❌ Subscription search failed: ${subscriptionResponse.status} ${subscriptionResponse.statusText}`);
        continue;
      }

      const subscriptionData = await subscriptionResponse.json() as any;
      console.log(`📊 Found ${subscriptionData.list?.length || 0} subscriptions`);

      if (subscriptionData.list && subscriptionData.list.length > 0) {
        subscriptionData.list.forEach((item: any, index: number) => {
          const sub = item.subscription;
          console.log(`   Subscription ${index + 1}:`);
          console.log(`     ID: ${sub.id}`);
          console.log(`     Customer ID: ${sub.customer_id}`);
          console.log(`     Status: ${sub.status}`);
          console.log(`     Plan ID: ${sub.plan_id || 'N/A'}`);
          if (sub.subscription_items && sub.subscription_items.length > 0) {
            console.log(`     Subscription Items: ${sub.subscription_items.map((si: any) => si.item_price_id).join(', ')}`);
          }
        });
      } else {
        console.log(`❌ No subscriptions found for customer ${customer.id}`);
      }

    } catch (error) {
      console.error(`❌ Error testing ${email}:`, error);
    }
  }

  console.log(`\n\n🔍 ANALYSIS`);
  console.log('='.repeat(60));
  console.log(`If both customers return the same subscription ID, then:`);
  console.log(`1. The issue is in Chargebee's API or data`);
  console.log(`2. There might be a shared subscription between users`);
  console.log(`3. The subscription might be incorrectly assigned in Chargebee`);
  console.log(`\nIf they return different subscription IDs, then:`);
  console.log(`1. The issue is in our application code`);
  console.log(`2. There might be a caching or state management problem`);
  console.log(`3. The consolidation logic might be mixing data`);
}

testChargebeeAPIDirectly().catch(console.error);
