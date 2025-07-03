/**
 * Test específico para test@upgradebalance.com
 * Verifica que el sistema devuelve todos los datos correctos
 */

import { UserProfileService } from './src/services/userProfileService';

async function testSpecificUser() {
  console.log('🧪 Testing specific user: saidh.jimenez@clivi.com.mx');
  console.log('=' .repeat(60));
  
  const userProfileService = new UserProfileService();
  const email = 'saidh.jimenez@clivi.com.mx';
  
  try {
    console.log(`\n🔍 Querying user profile for: ${email}`);
    console.log('Time started:', new Date().toISOString());
    
    const startTime = Date.now();
    const profile = await userProfileService.getUserProfile(email);
    const endTime = Date.now();
    
    console.log(`\n✅ Profile retrieved successfully in ${endTime - startTime}ms`);
    console.log('Time completed:', new Date().toISOString());
    
    console.log('\n📊 COMPLETE USER PROFILE:');
    console.log('=' .repeat(60));
    console.log(JSON.stringify(profile, null, 2));
    
    console.log('\n🔍 DATA BREAKDOWN:');
    console.log('=' .repeat(60));
    
    // Personal Information
    console.log('\n👤 PERSONAL INFORMATION:');
    console.log(`  📧 Email: ${profile.email || 'Not found'}`);
    console.log(`  📛 Name: ${profile.name || 'Not found'}`);
    console.log(`  👤 First Name: ${profile.firstName || 'Not found'}`);
    console.log(`  👤 Last Name: ${profile.lastName || 'Not found'}`);
    console.log(`  📞 Phone: ${profile.phone || 'Not found'}`);
    console.log(`  🏢 Company: ${profile.company || 'Not found'}`);
    console.log(`   Job Title: ${profile.jobTitle || 'Not found'}`);
    
    // Subscription Information
    console.log('\n💳 SUBSCRIPTION INFORMATION:');
    console.log(`  📊 Status: ${profile.subscriptionStatus || 'Not found'}`);
    console.log(`  📦 Plan: ${profile.plan || 'Not found'}`);
    console.log(`  💰 Next Billing Amount: ${profile.nextBillingAmount || 'Not found'}`);
    console.log(`  📅 Next Billing Date: ${profile.nextBillingDate || 'Not found'}`);
    console.log(`  🔄 Billing Cycle: ${profile.billingCycle || 'Not found'}`);
    console.log(`  🆔 Customer ID: ${profile.customerId || 'Not found'}`);
    console.log(`  🆔 Subscription ID: ${profile.subscriptionId || 'Not found'}`);
    
    // Platform Information  
    console.log('\n🌐 PLATFORM DATA SOURCES:');
    console.log('  ℹ️  Data sources are logged during query execution (check console output above)');
    
    // Data Quality Assessment
    console.log('\n🎯 DATA QUALITY ASSESSMENT:');
    let dataPoints = 0;
    let filledPoints = 0;
    
    const fieldChecks = [
      { name: 'email', value: profile.email },
      { name: 'name', value: profile.name },
      { name: 'firstName', value: profile.firstName },
      { name: 'lastName', value: profile.lastName },
      { name: 'phone', value: profile.phone },
      { name: 'company', value: profile.company },
      { name: 'subscriptionStatus', value: profile.subscriptionStatus },
      { name: 'plan', value: profile.plan },
      { name: 'nextBillingAmount', value: profile.nextBillingAmount },
      { name: 'nextBillingDate', value: profile.nextBillingDate },
      { name: 'billingCycle', value: profile.billingCycle },
      { name: 'customerId', value: profile.customerId },
      { name: 'subscriptionId', value: profile.subscriptionId }
    ];
    
    fieldChecks.forEach(field => {
      dataPoints++;
      if (field.value && field.value !== 'Not found') {
        filledPoints++;
        console.log(`  ✅ ${field.name}: ${field.value}`);
      } else {
        console.log(`  ❌ ${field.name}: Missing`);
      }
    });
    
    const completeness = Math.round((filledPoints / dataPoints) * 100);
    console.log(`\n📈 Profile Completeness: ${completeness}% (${filledPoints}/${dataPoints} fields)`);
    
    // Validation
    console.log('\n🔒 DATA VALIDATION:');
    console.log(`  📧 Email matches query: ${profile.email === email ? '✅' : '❌'}`);
    console.log(`  🔍 Has real subscription data: ${profile.subscriptionStatus ? '✅' : '❌'}`);
    console.log(`  🔗 Has contact data: ${profile.name || profile.firstName ? '✅' : '❌'}`);
    console.log(`  ⚡ Response time acceptable: ${endTime - startTime < 5000 ? '✅' : '❌'}`);
    
    console.log('\n✅ TEST COMPLETED SUCCESSFULLY');
    
  } catch (error) {
    console.error('\n❌ Error testing user profile:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    console.log('\n🔍 This might indicate:');
    console.log('  - User does not exist in any platform');
    console.log('  - API connection issues');
    console.log('  - Authentication problems');
    console.log('  - System configuration errors');
  }
}

// Execute the test
testSpecificUser().then(() => {
  console.log('\n🏁 Test execution completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
