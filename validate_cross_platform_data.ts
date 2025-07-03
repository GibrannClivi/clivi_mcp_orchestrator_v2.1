/**
 * Cross-Platform Data Validation Script
 * Verifies that user data is consistent across Chargebee, HubSpot, and Firebase
 */

const validationEndpoint = 'https://mcp-orchestrator-v1-456314813706.us-central1.run.app/graphql';

const validationQuery = `
  query GetUserProfile($query: String!) {
    getUserProfile(query: $query) {
      # Basic Info
      email
      firstName
      lastName
      name
      phone
      company
      jobTitle
      
      # Chargebee Data
      customerId
      subscriptionStatus
      plan
      nextBillingAmount
      nextBillingDate
      billingCycle
      subscriptionId
      
      # HubSpot Data
      contactId
      lastActivity
      dealStage
      leadScore
      lastTicket
      
      # Firebase Data
      userId
      planStatus
      medicalPlan
      medicine
      allergies
      
      # Source tracking
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
  jobTitle?: string;
  customerId?: string;
  subscriptionStatus?: string;
  plan?: string;
  nextBillingAmount?: number;
  nextBillingDate?: string;
  billingCycle?: string;
  subscriptionId?: string;
  contactId?: string;
  lastActivity?: string;
  dealStage?: string;
  leadScore?: number;
  lastTicket?: string;
  userId?: string;
  planStatus?: string;
  medicalPlan?: string;
  medicine?: string[];
  allergies?: string[];
  sourceBreakdown?: Array<{
    field: string;
    value: string;
    source: string;
  }>;
}

interface ValidationResult {
  email: string;
  isValid: boolean;
  issues: string[];
  platformData: {
    chargebee: any;
    hubspot: any;
    firebase: any;
  };
  crossPlatformConsistency: {
    emailConsistent: boolean;
    nameConsistent: boolean;
    phoneConsistent: boolean;
    companyConsistent: boolean;
  };
}

async function fetchUserProfile(email: string): Promise<UserProfile | null> {
  try {
    console.log(`\n🔍 Fetching profile for: ${email}`);
    
    const response = await fetch(validationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: validationQuery,
        variables: { query: email }
      })
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const result = await response.json() as any;
    
    if (result.errors) {
      console.error(`❌ GraphQL Errors:`, result.errors);
      return null;
    }

    const profile = result.data?.getUserProfile;
    if (!profile) {
      console.log(`❌ No profile data returned for ${email}`);
      return null;
    }

    return profile;
  } catch (error) {
    console.error(`❌ Request failed for ${email}:`, error);
    return null;
  }
}

function extractPlatformData(profile: UserProfile): { chargebee: any; hubspot: any; firebase: any } {
  const platformData = {
    chargebee: {},
    hubspot: {},
    firebase: {}
  };

  if (!profile.sourceBreakdown) {
    return platformData;
  }

  profile.sourceBreakdown.forEach(source => {
    if (source.source.includes('chargebee')) {
      (platformData.chargebee as any)[source.field] = source.value;
    } else if (source.source.includes('hubspot')) {
      (platformData.hubspot as any)[source.field] = source.value;
    } else if (source.source.includes('firebase')) {
      (platformData.firebase as any)[source.field] = source.value;
    }
  });

  return platformData;
}

function validateCrossPlatformConsistency(profile: UserProfile, platformData: any): ValidationResult {
  const issues: string[] = [];
  const email = profile.email || 'unknown';

  // Check email consistency
  let emailConsistent = true;
  const emails = [
    platformData.chargebee.email,
    platformData.hubspot.email,
    platformData.firebase.email
  ].filter(e => e && e !== 'null');

  if (emails.length > 1) {
    const uniqueEmails = [...new Set(emails)];
    if (uniqueEmails.length > 1) {
      emailConsistent = false;
      issues.push(`Email inconsistency: ${uniqueEmails.join(' vs ')}`);
    }
  }

  // Check name consistency
  let nameConsistent = true;
  const chargebeeName = `${platformData.chargebee.firstName || ''} ${platformData.chargebee.lastName || ''}`.trim();
  const hubspotName = `${platformData.hubspot.firstName || ''} ${platformData.hubspot.lastName || ''}`.trim();
  const firebaseName = platformData.firebase.displayName || '';

  const names = [chargebeeName, hubspotName, firebaseName].filter(n => n && n !== '');
  if (names.length > 1) {
    const uniqueNames = [...new Set(names)];
    if (uniqueNames.length > 1) {
      nameConsistent = false;
      issues.push(`Name inconsistency: ${uniqueNames.join(' vs ')}`);
    }
  }

  // Check phone consistency
  let phoneConsistent = true;
  const phones = [
    platformData.chargebee.phone,
    platformData.hubspot.phone,
    platformData.firebase.phone
  ].filter(p => p && p !== 'null');

  if (phones.length > 1) {
    const uniquePhones = [...new Set(phones)];
    if (uniquePhones.length > 1) {
      phoneConsistent = false;
      issues.push(`Phone inconsistency: ${uniquePhones.join(' vs ')}`);
    }
  }

  // Check company consistency
  let companyConsistent = true;
  const companies = [
    platformData.chargebee.company,
    platformData.hubspot.company,
    platformData.firebase.company
  ].filter(c => c && c !== 'null');

  if (companies.length > 1) {
    const uniqueCompanies = [...new Set(companies)];
    if (uniqueCompanies.length > 1) {
      companyConsistent = false;
      issues.push(`Company inconsistency: ${uniqueCompanies.join(' vs ')}`);
    }
  }

  // Additional validations
  
  // Validate Chargebee data integrity
  if (profile.customerId && profile.subscriptionId) {
    if (!profile.subscriptionStatus || !profile.plan) {
      issues.push('Chargebee: Customer and subscription exist but missing status/plan');
    }
  }

  // Validate HubSpot data integrity
  if (profile.contactId) {
    if (!profile.firstName && !profile.lastName && !profile.name) {
      issues.push('HubSpot: Contact exists but missing name information');
    }
  }

  // Validate Firebase data integrity
  if (profile.userId) {
    if (!profile.email) {
      issues.push('Firebase: User exists but missing email');
    }
  }

  // Cross-platform relationship validation
  if (profile.email && profile.customerId && !profile.contactId) {
    issues.push('Data Gap: User exists in Chargebee but not in HubSpot CRM');
  }

  if (profile.email && profile.contactId && !profile.customerId) {
    issues.push('Data Gap: User exists in HubSpot but not in Chargebee billing');
  }

  if (profile.email && (profile.customerId || profile.contactId) && !profile.userId) {
    issues.push('Data Gap: User exists in billing/CRM but not in Firebase auth');
  }

  return {
    email,
    isValid: issues.length === 0,
    issues,
    platformData,
    crossPlatformConsistency: {
      emailConsistent,
      nameConsistent,
      phoneConsistent,
      companyConsistent
    }
  };
}

async function validateMultipleUsers() {
  console.log('🔍 Cross-Platform Data Validation Report');
  console.log('='.repeat(60));

  const testUsers = [
    'test@upgradebalance.com',
    'saidh.jimenez@clivi.com.mx',
    'nonexistent@example.com',
    'admin@clivi.com.mx' // Adding another test user
  ];

  const validationResults: ValidationResult[] = [];

  for (const email of testUsers) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📧 Validating: ${email}`);
    console.log(`${'='.repeat(60)}`);

    const profile = await fetchUserProfile(email);
    
    if (!profile) {
      console.log(`❌ No data available for validation`);
      continue;
    }

    console.log(`\n📊 Raw Profile Data:`);
    console.log(`   Email: ${profile.email || 'null'}`);
    console.log(`   Name: ${profile.name || 'null'}`);
    console.log(`   Phone: ${profile.phone || 'null'}`);
    console.log(`   Company: ${profile.company || 'null'}`);
    console.log(`   Customer ID: ${profile.customerId || 'null'}`);
    console.log(`   Subscription ID: ${profile.subscriptionId || 'null'}`);
    console.log(`   Contact ID: ${profile.contactId || 'null'}`);
    console.log(`   User ID: ${profile.userId || 'null'}`);

    const platformData = extractPlatformData(profile);
    console.log(`\n🏢 Platform-Specific Data:`);
    console.log(`   Chargebee:`, Object.keys(platformData.chargebee).length > 0 ? platformData.chargebee : 'No data');
    console.log(`   HubSpot:`, Object.keys(platformData.hubspot).length > 0 ? platformData.hubspot : 'No data');
    console.log(`   Firebase:`, Object.keys(platformData.firebase).length > 0 ? platformData.firebase : 'No data');

    const validation = validateCrossPlatformConsistency(profile, platformData);
    validationResults.push(validation);

    console.log(`\n✅ Validation Results:`);
    if (validation.isValid) {
      console.log(`   ✅ All data is consistent across platforms`);
    } else {
      console.log(`   ❌ ${validation.issues.length} issues found:`);
      validation.issues.forEach(issue => {
        console.log(`      - ${issue}`);
      });
    }

    console.log(`\n🔄 Cross-Platform Consistency:`);
    console.log(`   Email: ${validation.crossPlatformConsistency.emailConsistent ? '✅' : '❌'}`);
    console.log(`   Name: ${validation.crossPlatformConsistency.nameConsistent ? '✅' : '❌'}`);
    console.log(`   Phone: ${validation.crossPlatformConsistency.phoneConsistent ? '✅' : '❌'}`);
    console.log(`   Company: ${validation.crossPlatformConsistency.companyConsistent ? '✅' : '❌'}`);

    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Generate summary report
  console.log(`\n\n📋 VALIDATION SUMMARY REPORT`);
  console.log(`${'='.repeat(60)}`);
  
  const validUsers = validationResults.filter(r => r.isValid);
  const invalidUsers = validationResults.filter(r => !r.isValid);

  console.log(`\n📊 Overall Statistics:`);
  console.log(`   Total users validated: ${validationResults.length}`);
  console.log(`   Users with consistent data: ${validUsers.length}`);
  console.log(`   Users with data issues: ${invalidUsers.length}`);

  if (invalidUsers.length > 0) {
    console.log(`\n❌ Users with Data Issues:`);
    invalidUsers.forEach(user => {
      console.log(`\n   📧 ${user.email}:`);
      user.issues.forEach(issue => {
        console.log(`      - ${issue}`);
      });
    });
  }

  console.log(`\n🔄 Cross-Platform Consistency Summary:`);
  const emailConsistencyRate = (validationResults.filter(r => r.crossPlatformConsistency.emailConsistent).length / validationResults.length * 100).toFixed(1);
  const nameConsistencyRate = (validationResults.filter(r => r.crossPlatformConsistency.nameConsistent).length / validationResults.length * 100).toFixed(1);
  const phoneConsistencyRate = (validationResults.filter(r => r.crossPlatformConsistency.phoneConsistent).length / validationResults.length * 100).toFixed(1);
  const companyConsistencyRate = (validationResults.filter(r => r.crossPlatformConsistency.companyConsistent).length / validationResults.length * 100).toFixed(1);

  console.log(`   Email consistency: ${emailConsistencyRate}%`);
  console.log(`   Name consistency: ${nameConsistencyRate}%`);
  console.log(`   Phone consistency: ${phoneConsistencyRate}%`);
  console.log(`   Company consistency: ${companyConsistencyRate}%`);

  // Recommendations
  console.log(`\n💡 RECOMMENDATIONS:`);
  if (invalidUsers.length > 0) {
    console.log(`   1. Review and reconcile data inconsistencies for ${invalidUsers.length} users`);
    console.log(`   2. Implement data synchronization processes between platforms`);
    console.log(`   3. Establish data validation rules at the API level`);
  } else {
    console.log(`   ✅ All user data is consistent across platforms!`);
  }

  return validationResults;
}

// Run the validation
validateMultipleUsers().catch(console.error);
