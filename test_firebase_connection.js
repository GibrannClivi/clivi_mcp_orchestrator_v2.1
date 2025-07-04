/**
 * Test Firebase Connection
 */
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

async function testFirebaseConnection() {
  try {
    console.log('🔍 Testing Firebase Connection...');
    
    // Use absolute path from project root
    const credentialsPath = path.join(process.cwd(), 'firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json');
    console.log('📁 Credentials path:', credentialsPath);
    
    // Check if file exists
    if (!fs.existsSync(credentialsPath)) {
      console.error('❌ Credentials file not found at:', credentialsPath);
      return;
    }
    
    // Read and parse JSON file
    const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log('✅ Credentials loaded successfully');
    console.log('📊 Project ID:', serviceAccount.project_id);
    console.log('📊 Client Email:', serviceAccount.client_email);
    
    // Initialize Firebase Admin
    if (!admin.apps || !admin.apps.length) {
      console.log('🔧 Initializing Firebase Admin...');
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log('✅ Firebase Admin initialized successfully');
    }

    const db = admin.firestore();
    console.log('✅ Firestore database connected');
    
    // Test search for gustavo.salgado@clivi.com.mx
    const testEmail = 'gustavo.salgado@clivi.com.mx';
    console.log(`🔍 Testing search for: ${testEmail}`);
    
    // Search by emailAddress
    const emailAddressQuery = await db.collection('users')
      .where('emailAddress', '==', testEmail)
      .limit(1)
      .get();
    
    if (emailAddressQuery && !emailAddressQuery.empty) {
      console.log('✅ User found by emailAddress field');
      const userData = emailAddressQuery.docs[0].data();
      console.log('📊 User data preview:', {
        id: emailAddressQuery.docs[0].id,
        emailAddress: userData.emailAddress,
        firstName: userData.firstName,
        lastName: userData.lastName,
        planStatus: userData.planStatus,
        medicalPlan: userData.medicalPlan,
        medicine: userData.medicine ? userData.medicine.length : 0,
        allergies: userData.allergies ? userData.allergies.length : 0,
        treatments: userData.treatments ? userData.treatments.length : 0,
        medicalCategories: userData.medicalCategories ? userData.medicalCategories.length : 0
      });
    } else {
      console.log('❌ User not found by emailAddress field');
      
      // Try with email field
      const emailQuery = await db.collection('users')
        .where('email', '==', testEmail)
        .limit(1)
        .get();
      
      if (emailQuery && !emailQuery.empty) {
        console.log('✅ User found by email field');
        const userData = emailQuery.docs[0].data();
        console.log('📊 User data preview:', {
          id: emailQuery.docs[0].id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName
        });
      } else {
        console.log('❌ User not found by email field either');
      }
    }
    
    console.log('✅ Firebase connection test completed');
    
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error.message || error);
  }
}

testFirebaseConnection();
