/**
 * Debug script specifically for Chargebee subscription ID contamination
 * This will test the Chargebee API calls directly to see where the problem is
 */

const apiEndpoint = 'https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql';

const profileQuery = `
  query GetUserProfile($query: String!) {
    getUserProfile(query: $query) {
      email
      customerId
      subscriptionId
      plan
      nextBillingAmount
      sourceBreakdown {
        field
        value
        source
      }
    }
  }
`;

interface DebugResult {
  email: string;
  customerId: string | null;
  subscriptionId: string | null;
  plan: string | null;
  nextBillingAmount: number | null;
}

async function makeProfileRequest(email: string): Promise<any> {
  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: profileQuery,
        variables: { query: email }
      })
    });

    const result = await response.json();
    return result.data?.getUserProfile;
  } catch (error) {
    console.error(`❌ Request failed for ${email}:`, error);
    return null;
  }
}

async function debugChargebeeSubscriptions() {
  console.log('🔍 DEBUGGING CHARGEBEE SUBSCRIPTION ID CONTAMINATION\n');
  console.log('='.repeat(70));

  const testEmails = [
    'test@upgradebalance.com',
    'saidh.jimenez@clivi.com.mx'
  ];

  const results: DebugResult[] = [];

  for (let i = 0; i < testEmails.length; i++) {
    const email = testEmails[i];
    console.log(`\n🔸 Testing ${email}`);
    
    const profile = await makeProfileRequest(email);
    if (profile) {
      console.log(`   Customer ID: ${profile.customerId || 'null'}`);
      console.log(`   Subscription ID: ${profile.subscriptionId || 'null'}`);
      console.log(`   Plan: ${profile.plan || 'null'}`);
      console.log(`   Next Billing: ${profile.nextBillingAmount || 'null'}`);
      
      results.push({
        email,
        customerId: profile.customerId,
        subscriptionId: profile.subscriptionId,
        plan: profile.plan,
        nextBillingAmount: profile.nextBillingAmount
      });

      // Show relevant source breakdown
      if (profile.sourceBreakdown) {
        const chargebeeFields = profile.sourceBreakdown.filter((s: any) => s.source === 'chargebee');
        console.log(`   Chargebee fields (${chargebeeFields.length}):`);
        chargebeeFields.forEach((field: any) => {
          console.log(`     ${field.field}: ${field.value}`);
        });
      }
    } else {
      console.log(`   ❌ No data returned`);
    }

    // Wait between requests to ensure they're processed separately
    if (i < testEmails.length - 1) {
      console.log(`   ⏳ Waiting 3 seconds before next request...`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  console.log(`\n\n🔬 SUBSCRIPTION ID ANALYSIS:`);
  console.log('='.repeat(70));

  if (results.length >= 2) {
    const [result1, result2] = results;
    
    console.log(`\n📊 Comparison:`);
    console.log(`User 1: ${result1.email}`);
    console.log(`  Customer ID: ${result1.customerId}`);
    console.log(`  Subscription ID: ${result1.subscriptionId}`);
    console.log(`  Plan: ${result1.plan}`);
    
    console.log(`\nUser 2: ${result2.email}`);
    console.log(`  Customer ID: ${result2.customerId}`);
    console.log(`  Subscription ID: ${result2.subscriptionId}`);
    console.log(`  Plan: ${result2.plan}`);

    // Check for problems
    const problems: string[] = [];
    
    if (result1.customerId === result2.customerId) {
      problems.push('❌ SAME CUSTOMER ID - Different users have the same customer ID');
    }
    
    if (result1.subscriptionId === result2.subscriptionId && result1.subscriptionId) {
      problems.push('❌ SAME SUBSCRIPTION ID - Different users have the same subscription ID');
    }
    
    if (result1.plan === result2.plan && result1.plan) {
      problems.push('⚠️  SAME PLAN - Different users have the same plan (could be coincidence)');
    }
    
    if (result1.nextBillingAmount === result2.nextBillingAmount && result1.nextBillingAmount) {
      problems.push('⚠️  SAME BILLING AMOUNT - Different users have the same billing amount (could be coincidence)');
    }

    if (problems.length === 0) {
      console.log(`\n✅ NO CONTAMINATION DETECTED - Each user has unique identifiers`);
    } else {
      console.log(`\n🚨 CONTAMINATION DETECTED:`);
      problems.forEach(problem => console.log(`   ${problem}`));
      
      console.log(`\n💡 ANALYSIS:`);
      if (result1.customerId === result2.customerId) {
        console.log(`   - The root cause is likely in the customer search logic`);
        console.log(`   - Both emails are returning the same Chargebee customer`);
        console.log(`   - Check the email matching logic in ChargebeeAPIClient.searchCustomer()`);
      } else if (result1.subscriptionId === result2.subscriptionId) {
        console.log(`   - Different customers but same subscription indicates:`);
        console.log(`   - Possible shared subscription or caching issue`);
        console.log(`   - Check the subscription retrieval logic`);
      }
    }
  }

  console.log(`\n\n🔍 NEXT STEPS:`);
  console.log('='.repeat(70));
  console.log(`1. Check the logs in Cloud Run for the Chargebee API calls`);
  console.log(`2. Verify the exact email matching logic in searchCustomer()`);
  console.log(`3. Test the Chargebee API directly with curl to verify responses`);
  console.log(`4. Check if there's any caching or static variable issues`);
}

// Run the debug
debugChargebeeSubscriptions().catch(console.error);
