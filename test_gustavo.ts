#!/usr/bin/env node

/**
 * Script directo para verificar que gustavo.salgado@clivi.com.mx existe en Firebase
 */

import { config } from './src/config/index.js';

async function testGustavo() {
  console.log('🔍 VERIFICANDO GUSTAVO SALGADO EN FIREBASE');
  console.log('='.repeat(50));
  
  try {
    // Import Firebase Admin dynamically
    const admin = await import('firebase-admin');
    const path = await import('path');
    const fs = await import('fs');
    
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      const credentialsPath = path.join(process.cwd(), 'firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json');
      const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.firebase?.projectId
      });
    }

    const db = admin.firestore();
    const email = 'gustavo.salgado@clivi.com.mx';
    
    console.log(`📧 Buscando: ${email}`);
    
    // Buscar por emailAddress (campo correcto)
    console.log('\n1️⃣ Buscando por emailAddress...');
    const emailAddressQuery = await db.collection('users')
      .where('emailAddress', '==', email)
      .limit(1)
      .get();
    
    if (!emailAddressQuery.empty) {
      const doc = emailAddressQuery.docs[0];
      const data = doc.data();
      console.log(`✅ ENCONTRADO por emailAddress!`);
      console.log(`📄 Document ID: ${doc.id}`);
      console.log(`👤 Display Name: ${data.displayName || 'N/A'}`);
      console.log(`📧 Email Address: ${data.emailAddress || 'N/A'}`);
      console.log(`📧 Email: ${data.email || 'N/A'}`);
      console.log(`📱 Phone: ${data.phoneNumber || data.phone || 'N/A'}`);
      console.log(`🏥 Plan Status: ${data.planStatus || 'N/A'}`);
      console.log(`💊 Medicine: ${data.medicine?.length || 0} items`);
      
      return data;
    } else {
      console.log(`❌ No encontrado por emailAddress`);
    }
    
    // Buscar por email (campo alternativo)
    console.log('\n2️⃣ Buscando por email...');
    const emailQuery = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (!emailQuery.empty) {
      const doc = emailQuery.docs[0];
      const data = doc.data();
      console.log(`✅ ENCONTRADO por email!`);
      console.log(`📄 Document ID: ${doc.id}`);
      console.log(`👤 Display Name: ${data.displayName || 'N/A'}`);
      console.log(`📧 Email Address: ${data.emailAddress || 'N/A'}`);
      console.log(`📧 Email: ${data.email || 'N/A'}`);
      
      return data;
    } else {
      console.log(`❌ No encontrado por email`);
    }
    
    // Buscar manualmente listando algunos documentos
    console.log('\n3️⃣ Listando primeros 10 usuarios para verificar...');
    const allUsers = await db.collection('users').limit(10).get();
    
    allUsers.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${doc.id} - ${data.emailAddress || data.email || 'No email'}`);
    });
    
    console.log('\n❌ Gustavo Salgado NO encontrado en Firebase');
    
  } catch (error) {
    console.error('❌ Error verificando Gustavo:', error);
  }
}

// Ejecutar
testGustavo()
  .then(() => {
    console.log('\n🏁 Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 ERROR:', error);
    process.exit(1);
  });
