/**
 * Debug script to test cache contamination and data mixing between queries
 * This script will make sequential queries and check if data from one query affects another
 */

const endpoint = 'https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql';

const query = `
  query GetUserProfile($query: String!) {
    getUserProfile(query: $query) {
      email
      firstName
      lastName
      name
      phone
      company
      subscriptionStatus
      plan
      nextBillingAmount
      customerId
      subscriptionId
      contactId
      userId
      sourceBreakdown {
        field
        value
        source
      }
    }
  }
`;

interface UserProfile {
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  company?: string;
  subscriptionStatus?: string;
  plan?: string;
  nextBillingAmount?: number;
  customerId?: string;
  subscriptionId?: string;
  contactId?: string;
  userId?: string;
  sourceBreakdown?: Array<{
    field: string;
    value: string;
    source: string;
  }>;
}

async function makeRequest(email: string): Promise<UserProfile | null> {
  try {
    console.log(`\n🔍 Making request for: ${email}`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { query: email }
      })
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error(`❌ GraphQL Errors:`, result.errors);
      return null;
    }

    const profile = result.data?.getUserProfile;
    if (!profile) {
      console.log(`❌ No profile data returned for ${email}`);
      return null;
    }

    console.log(`✅ Response received for ${email}:`);
    console.log(`   Email: ${profile.email || 'null'}`);
    console.log(`   Name: ${profile.name || 'null'}`);
    console.log(`   Company: ${profile.company || 'null'}`);
    console.log(`   Plan: ${profile.plan || 'null'}`);
    console.log(`   Customer ID: ${profile.customerId || 'null'}`);
    console.log(`   Contact ID: ${profile.contactId || 'null'}`);
    console.log(`   User ID: ${profile.userId || 'null'}`);
    
    // Check source breakdown
    if (profile.sourceBreakdown && profile.sourceBreakdown.length > 0) {
      console.log(`   📊 Sources:`);
      profile.sourceBreakdown.forEach((source: any) => {
        console.log(`      ${source.field}: ${source.value} (from ${source.source})`);
      });
    }

    return profile;
  } catch (error) {
    console.error(`❌ Request failed for ${email}:`, error);
    return null;
  }
}

async function testCacheContamination() {
  console.log('🧪 Testing Cache Contamination and Data Mixing\n');
  console.log('='.repeat(60));

  // Test emails in specific order
  const testEmails = [
    'test@upgradebalance.com',
    'saidh.jimenez@clivi.com.mx',
    'nonexistent@example.com'
  ];

  console.log(`\n📋 Test Plan:`);
  console.log(`1. Query ${testEmails[0]} (should have Chargebee + HubSpot data)`);
  console.log(`2. Query ${testEmails[1]} (should have different Chargebee + HubSpot data)`);
  console.log(`3. Query ${testEmails[2]} (should have no real data)`);
  console.log(`4. Query ${testEmails[0]} again (should return same as step 1, not contaminated)`);
  console.log(`5. Query ${testEmails[1]} again (should return same as step 2, not contaminated)`);

  const results: Array<{ email: string; profile: UserProfile | null; step: number }> = [];

  // Step 1: First email
  console.log(`\n🔸 STEP 1: Query ${testEmails[0]}`);
  const result1 = await makeRequest(testEmails[0]);
  results.push({ email: testEmails[0], profile: result1, step: 1 });
  
  // Wait a bit to ensure request completion
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 2: Second email
  console.log(`\n🔸 STEP 2: Query ${testEmails[1]}`);
  const result2 = await makeRequest(testEmails[1]);
  results.push({ email: testEmails[1], profile: result2, step: 2 });
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 3: Non-existent email
  console.log(`\n🔸 STEP 3: Query ${testEmails[2]} (non-existent)`);
  const result3 = await makeRequest(testEmails[2]);
  results.push({ email: testEmails[2], profile: result3, step: 3 });
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 4: First email again (check for contamination)
  console.log(`\n🔸 STEP 4: Query ${testEmails[0]} AGAIN (checking contamination)`);
  const result4 = await makeRequest(testEmails[0]);
  results.push({ email: testEmails[0], profile: result4, step: 4 });
  
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Step 5: Second email again (check for contamination)
  console.log(`\n🔸 STEP 5: Query ${testEmails[1]} AGAIN (checking contamination)`);
  const result5 = await makeRequest(testEmails[1]);
  results.push({ email: testEmails[1], profile: result5, step: 5 });

  // Analysis
  console.log(`\n\n🔬 CONTAMINATION ANALYSIS`);
  console.log('='.repeat(60));

  // Compare step 1 vs step 4 (same email, should be identical)
  const step1Profile = results.find(r => r.step === 1)?.profile;
  const step4Profile = results.find(r => r.step === 4)?.profile;
  
  console.log(`\n📊 Comparing Step 1 vs Step 4 (${testEmails[0]}):`);
  if (step1Profile && step4Profile) {
    const contamination1 = analyzeContamination(step1Profile, step4Profile, testEmails[0]);
    if (contamination1.length === 0) {
      console.log(`✅ NO CONTAMINATION: Data is identical between queries`);
    } else {
      console.log(`❌ CONTAMINATION DETECTED:`);
      contamination1.forEach(issue => console.log(`   - ${issue}`));
    }
  }

  // Compare step 2 vs step 5 (same email, should be identical)
  const step2Profile = results.find(r => r.step === 2)?.profile;
  const step5Profile = results.find(r => r.step === 5)?.profile;
  
  console.log(`\n📊 Comparing Step 2 vs Step 5 (${testEmails[1]}):`);
  if (step2Profile && step5Profile) {
    const contamination2 = analyzeContamination(step2Profile, step5Profile, testEmails[1]);
    if (contamination2.length === 0) {
      console.log(`✅ NO CONTAMINATION: Data is identical between queries`);
    } else {
      console.log(`❌ CONTAMINATION DETECTED:`);
      contamination2.forEach(issue => console.log(`   - ${issue}`));
    }
  }

  // Check if any query returned data from a different user
  console.log(`\n📊 Cross-contamination check:`);
  results.forEach((result, index) => {
    if (!result.profile) return;
    
    const expectedEmail = result.email;
    const returnedEmail = result.profile.email;
    
    if (returnedEmail && returnedEmail !== expectedEmail) {
      console.log(`❌ CROSS-CONTAMINATION: Step ${result.step} queried ${expectedEmail} but got data for ${returnedEmail}`);
    } else if (returnedEmail === expectedEmail) {
      console.log(`✅ Step ${result.step}: Correct email returned (${expectedEmail})`);
    } else {
      console.log(`⚠️  Step ${result.step}: No email in response for ${expectedEmail}`);
    }

    // Check if any other fields contain data from wrong user
    const profile = result.profile;
    let suspiciousData: string[] = [];
    
    // Check if customer ID or contact ID seem to belong to a different user
    if (profile.customerId && !profile.email?.includes(expectedEmail.split('@')[0])) {
      // This is a complex check, but for now just log
    }
    
    // Check if name data makes sense with email
    if (profile.name && expectedEmail.includes('test@') && !profile.name.toLowerCase().includes('test')) {
      suspiciousData.push(`Name '${profile.name}' doesn't match test email pattern`);
    }
    
    if (suspiciousData.length > 0) {
      console.log(`❌ SUSPICIOUS DATA in Step ${result.step}:`);
      suspiciousData.forEach(issue => console.log(`   - ${issue}`));
    }
  });

  console.log(`\n\n📋 COMPLETE RESULTS SUMMARY:`);
  console.log('='.repeat(60));
  results.forEach((result, index) => {
    console.log(`\nStep ${result.step}: ${result.email}`);
    if (result.profile) {
      console.log(`  Email: ${result.profile.email || 'null'}`);
      console.log(`  Name: ${result.profile.name || 'null'}`);
      console.log(`  Company: ${result.profile.company || 'null'}`);
      console.log(`  Plan: ${result.profile.plan || 'null'}`);
      console.log(`  Customer ID: ${result.profile.customerId || 'null'}`);
    } else {
      console.log(`  No data returned`);
    }
  });
}

function analyzeContamination(profile1: UserProfile, profile2: UserProfile, email: string): string[] {
  const issues: string[] = [];
  
  const fields = ['email', 'firstName', 'lastName', 'name', 'phone', 'company', 'subscriptionStatus', 'plan', 'nextBillingAmount', 'customerId', 'subscriptionId', 'contactId', 'userId'];
  
  fields.forEach(field => {
    const value1 = (profile1 as any)[field];
    const value2 = (profile2 as any)[field];
    
    if (value1 !== value2) {
      issues.push(`${field}: '${value1}' vs '${value2}'`);
    }
  });
  
  return issues;
}

// Run the test
testCacheContamination().catch(console.error);
