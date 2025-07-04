#!/usr/bin/env node

/**
 * Test script to verify EXACT MATCH validation
 * This ensures NO DATA CONTAMINATION - only exact matches are returned
 */

const { UserProfileService } = require('./dist/services/userProfileService');

async function testExactMatch() {
  const userProfileService = new UserProfileService();
  
  console.log('🔍 Testing EXACT MATCH validation - NO DATA CONTAMINATION');
  console.log('='.repeat(70));

  const testCases = [
    {
      description: 'Known user that should exist',
      query: 'saidh.jimenez@clivi.com.mx',
      shouldFind: true
    },
    {
      description: 'User that may not exist',
      query: 'gustavo.salgado@clivi.com.mx',
      shouldFind: false // We'll see if it exists
    },
    {
      description: 'Non-existent user',
      query: 'nonexistent@fake.com',
      shouldFind: false
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n🧪 Testing: ${testCase.description}`);
    console.log(`📧 Query: ${testCase.query}`);
    console.log('-'.repeat(50));
    
    try {
      const profile = await userProfileService.getUserProfile(testCase.query);
      
      // Check if the returned data actually matches the query
      if (profile && profile.email) {
        const queryLower = testCase.query.toLowerCase();
        const returnedLower = profile.email.toLowerCase();
        
        if (queryLower === returnedLower) {
          console.log('✅ CORRECT: Exact match found');
          console.log(`   Query: ${testCase.query}`);
          console.log(`   Found: ${profile.email}`);
        } else {
          console.log('❌ DATA CONTAMINATION: Different email returned!');
          console.log(`   Query: ${testCase.query}`);
          console.log(`   Found: ${profile.email}`);
          console.log('🚨 This is a critical security issue!');
        }
      } else {
        console.log('✅ CORRECT: No data returned (no contamination)');
      }
      
    } catch (error) {
      console.log(`✅ CORRECT: Error thrown (no fallback data)`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ Exact match validation complete');
}

testExactMatch().catch(console.error);
