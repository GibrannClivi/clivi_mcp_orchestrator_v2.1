#!/usr/bin/env node

/**
 * Test script to validate NO DATA CONTAMINATION between users
 * This ensures each query returns only the user's own data
 */

import { UserProfileService } from './src/services/userProfileService';

async function testDataIsolation() {
  const userProfileService = new UserProfileService();
  
  console.log('🧪 Testing DATA ISOLATION - No Contamination Between Users');
  console.log('=' .repeat(80));

  const testCases = [
    {
      description: 'Known real email',
      query: 'saidh.jimenez@clivi.com.mx',
      type: 'email',
      expectData: true
    },
    {
      description: 'Non-existent email',
      query: 'nonexistent@example.com',
      type: 'email',
      expectData: false
    },
    {
      description: 'Non-existent phone',
      query: '+1999999999',
      type: 'phone',
      expectData: false
    },
    {
      description: 'Non-existent name',
      query: 'NonExistent Person',
      type: 'name',
      expectData: false
    }
  ];

  let isolationPassed = true;
  let realDataQueries = 0;
  let emptyDataQueries = 0;

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.description} (${testCase.query})`);
    console.log('-'.repeat(70));
    
    try {
      const startTime = Date.now();
      const profile = await userProfileService.getUserProfile(testCase.query);
      const endTime = Date.now();
      
      console.log(`✅ Query completed in ${endTime - startTime}ms`);
      
      // Count real data sources (excluding query source)
      const realDataSources = profile.sourceBreakdown?.filter(source => 
        ['chargebee', 'hubspot', 'firebase', 'chargebee_api', 'hubspot_api', 'firebase_api'].includes(source.source)
      ) || [];
      
      const hasRealData = realDataSources.length > 0;
      
      console.log(`📊 Real data sources: ${realDataSources.length}`);
      console.log(`🔍 Expected data: ${testCase.expectData ? 'YES' : 'NO'}, Found data: ${hasRealData ? 'YES' : 'NO'}`);
      
      if (hasRealData) {
        realDataQueries++;
        
        // For queries that found data, validate it matches the query
        let dataMatchesQuery = false;
        
        if (testCase.type === 'email') {
          dataMatchesQuery = profile.email === testCase.query;
          console.log(`📧 Email match: Query(${testCase.query}) vs Found(${profile.email || 'none'})`);
        } else if (testCase.type === 'phone') {
          // Normalize phones for comparison
          const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');
          const queryNorm = normalizePhone(testCase.query);
          const foundNorm = profile.phone ? normalizePhone(profile.phone) : '';
          dataMatchesQuery = queryNorm === foundNorm;
          console.log(`📞 Phone match: Query(${queryNorm}) vs Found(${foundNorm || 'none'})`);
        } else if (testCase.type === 'name') {
          const queryLower = testCase.query.toLowerCase();
          const foundName = (profile.name || '').toLowerCase();
          const foundFirst = (profile.firstName || '').toLowerCase();
          const foundLast = (profile.lastName || '').toLowerCase();
          
          dataMatchesQuery = foundName.includes(queryLower) || 
                           queryLower.includes(foundFirst) || 
                           queryLower.includes(foundLast);
          console.log(`👤 Name match: Query(${queryLower}) vs Found(${foundName || 'none'})`);
        }
        
        if (testCase.expectData && dataMatchesQuery) {
          console.log('✅ CORRECT: Expected data found and matches query');
        } else if (!testCase.expectData || !dataMatchesQuery) {
          console.log('❌ DATA CONTAMINATION: Found data that doesn\'t match query');
          isolationPassed = false;
          
          // Show contaminated data details
          console.log('🚨 CONTAMINATED DATA:');
          console.log(`  Email: ${profile.email || 'none'}`);
          console.log(`  Phone: ${profile.phone || 'none'}`);
          console.log(`  Name: ${profile.name || 'none'}`);
          console.log(`  Subscription: ${profile.subscriptionStatus || 'none'}`);
          
          realDataSources.forEach(source => {
            console.log(`  ❌ ${source.field}: ${source.source}`);
          });
        }
      } else {
        emptyDataQueries++;
        
        if (testCase.expectData) {
          console.log('⚠️  Expected data but none found (could be API limitation)');
        } else {
          console.log('✅ CORRECT: No data found for non-existent query');
        }
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
      if (!testCase.expectData) {
        console.log('✅ CORRECT: Error thrown for non-existent data (no fallbacks)');
        emptyDataQueries++;
      } else {
        isolationPassed = false;
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 DATA ISOLATION TEST RESULTS');
  console.log('='.repeat(80));
  console.log(`Total Tests: ${testCases.length}`);
  console.log(`Queries with Real Data: ${realDataQueries}`);
  console.log(`Queries with No Data: ${emptyDataQueries}`);
  console.log(`Data Isolation: ${isolationPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (isolationPassed) {
    console.log('\n✅ CRITICAL SUCCESS:');
    console.log('✅ NO DATA CONTAMINATION detected');
    console.log('✅ Each query returns only matching user data');
    console.log('✅ Non-existent users don\'t get contaminated with other user data');
    console.log('✅ System maintains strict data isolation');
  } else {
    console.log('\n❌ CRITICAL FAILURE:');
    console.log('❌ DATA CONTAMINATION detected');
    console.log('❌ Some queries return data from other users');
    console.log('❌ System needs immediate fixes to prevent data leakage');
  }
  
  return isolationPassed;
}

// Run the critical test
testDataIsolation().then(passed => {
  process.exit(passed ? 0 : 1);
}).catch(error => {
  console.error('Test failed with error:', error);
  process.exit(1);
});
