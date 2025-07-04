const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with credentials
const serviceAccount = require('./firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'dtwo-qa'
});

const db = admin.firestore();

async function checkSaidhJimenez() {
  try {
    console.log('🔍 Checking for Saidh Jimenez in Firestore...');
    
    // Search by name variations
    const nameVariations = ['Saidh Jimenez', 'saidh jimenez', 'Saidh', 'saidh'];
    
    for (const name of nameVariations) {
      console.log(`\n--- Searching for: "${name}" ---`);
      
      // Search by displayName
      const displayNameQuery = await db.collection('users')
        .where('displayName', '==', name)
        .get();
      
      if (!displayNameQuery.empty) {
        console.log(`✅ Found ${displayNameQuery.docs.length} user(s) by displayName "${name}"`);
        displayNameQuery.docs.forEach(doc => {
          const data = doc.data();
          console.log(`  - ID: ${doc.id}`);
          console.log(`  - Email: ${data.email || 'N/A'}`);
          console.log(`  - Phone: ${data.phoneNumber || data.phone || 'N/A'}`);
          console.log(`  - DisplayName: ${data.displayName || 'N/A'}`);
          console.log(`  - FirstName: ${data.firstName || 'N/A'}`);
          console.log(`  - LastName: ${data.lastName || 'N/A'}`);
        });
      }
      
      // Search by firstName
      const firstNameQuery = await db.collection('users')
        .where('firstName', '==', name)
        .get();
      
      if (!firstNameQuery.empty) {
        console.log(`✅ Found ${firstNameQuery.docs.length} user(s) by firstName "${name}"`);
        firstNameQuery.docs.forEach(doc => {
          const data = doc.data();
          console.log(`  - ID: ${doc.id}`);
          console.log(`  - Email: ${data.email || 'N/A'}`);
          console.log(`  - Phone: ${data.phoneNumber || data.phone || 'N/A'}`);
          console.log(`  - DisplayName: ${data.displayName || 'N/A'}`);
          console.log(`  - FirstName: ${data.firstName || 'N/A'}`);
          console.log(`  - LastName: ${data.lastName || 'N/A'}`);
        });
      }
    }
    
    // Also search for any user with email containing "saidh"
    console.log('\n--- Searching for emails containing "saidh" ---');
    const allUsersQuery = await db.collection('users').get();
    
    allUsersQuery.docs.forEach(doc => {
      const data = doc.data();
      if (data.email && data.email.toLowerCase().includes('saidh')) {
        console.log(`✅ Found user with email containing "saidh"`);
        console.log(`  - ID: ${doc.id}`);
        console.log(`  - Email: ${data.email}`);
        console.log(`  - Phone: ${data.phoneNumber || data.phone || 'N/A'}`);
        console.log(`  - DisplayName: ${data.displayName || 'N/A'}`);
        console.log(`  - FirstName: ${data.firstName || 'N/A'}`);
        console.log(`  - LastName: ${data.lastName || 'N/A'}`);
      }
    });
    
  } catch (error) {
    console.error('Error checking Saidh Jimenez:', error);
  }
}

checkSaidhJimenez().then(() => {
  console.log('\n🔍 Check complete');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
