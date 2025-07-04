#!/usr/bin/env node

/**
 * Script para agregar un usuario de prueba en Firebase/Firestore
 * Para demostrar la integración completa con las 3 plataformas
 */

import { config } from './src/config/index.js';

async function addTestUserToFirestore() {
  console.log('🔥 AGREGANDO USUARIO DE PRUEBA A FIREBASE/FIRESTORE');
  console.log('='.repeat(60));
  
  try {
    // Import Firebase Admin dynamically
    const admin = await import('firebase-admin');
    const path = await import('path');
    
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      const credentialsPath = path.resolve(process.cwd(), 'firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json');
      const serviceAccount = require(credentialsPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.firebase?.projectId
      });
    }

    const db = admin.firestore();
    
    // Usuario de prueba que coincida con uno que también esté en Chargebee/HubSpot
    // Vamos a usar el mismo email que ya probamos para ver la consolidación completa
    const testUser = {
      email: 'saidh.jimenez@clivi.com.mx',
      firstName: 'Jesus Saidh',
      lastName: 'Jimenez Fuentes',
      displayName: 'Jesus Saidh Jimenez Fuentes',
      phoneNumber: '+525542553723',
      
      // Datos médicos específicos de la app
      planStatus: 'active',
      medicalPlan: 'Premium Health Plan',
      medicine: [
        {
          name: 'Metformina',
          dosage: '500mg',
          frequency: 'Twice daily',
          prescribedDate: '2024-01-15',
          doctor: 'Dr. García'
        },
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          prescribedDate: '2024-02-20',
          doctor: 'Dr. Rodríguez'
        }
      ],
      allergies: [
        {
          name: 'Penicillin',
          severity: 'high',
          reaction: 'Severe rash and difficulty breathing'
        },
        {
          name: 'Shellfish',
          severity: 'medium',
          reaction: 'Digestive upset'
        }
      ],
      emergencyContact: {
        name: 'María Jimenez',
        relationship: 'Mother',
        phone: '+525512345678',
        email: 'maria.jimenez@email.com'
      },
      lastAppointment: '2025-06-15T10:30:00Z',
      nextAppointment: '2025-07-20T14:00:00Z',
      selfSupplyLogs: [
        {
          date: '2025-07-01',
          medicineId: 'metformina-500',
          taken: true,
          time: '08:00'
        },
        {
          date: '2025-07-01',
          medicineId: 'lisinopril-10',
          taken: true,
          time: '20:00'
        }
      ],
      
      // Metadatos
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    };
    
    console.log('📝 Creando usuario de prueba...');
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`👤 Nombre: ${testUser.displayName}`);
    console.log(`📱 Teléfono: ${testUser.phoneNumber}`);
    console.log(`🏥 Plan: ${testUser.medicalPlan}`);
    console.log(`💊 Medicamentos: ${testUser.medicine.length}`);
    console.log(`🚨 Alergias: ${testUser.allergies.length}`);
    
    // Crear documento en Firestore
    const docRef = await db.collection('users').add(testUser);
    
    console.log('\n✅ Usuario creado exitosamente!');
    console.log(`🆔 Document ID: ${docRef.id}`);
    
    // Verificar que se creó correctamente
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('\n🔍 Verificación - Datos guardados:');
      const data = doc.data();
      console.log(`📧 Email: ${data?.email}`);
      console.log(`👤 Nombre: ${data?.displayName}`);
      console.log(`🏥 Plan médico: ${data?.medicalPlan}`);
      console.log(`💊 Medicamentos: ${data?.medicine?.length || 0}`);
      
      console.log('\n🎉 ¡LISTO! Ahora puedes probar la integración completa');
      console.log('🔥 Firebase/Firestore tiene datos para: saidh.jimenez@clivi.com.mx');
      console.log('💳 Chargebee tiene datos para: saidh.jimenez@clivi.com.mx');
      console.log('🎯 HubSpot tiene datos para: saidh.jimenez@clivi.com.mx');
      console.log('\n➡️  Ejecuta: npx tsx test_saidh_user.ts');
    }
    
  } catch (error) {
    console.error('❌ Error agregando usuario de prueba:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 SUGERENCIA: Verifica que tengas permisos de escritura en Firestore');
      console.log('🔧 Puedes verificar las reglas de seguridad en la consola de Firebase');
    }
  }
}

// Función para eliminar el usuario de prueba (limpieza)
async function removeTestUser() {
  console.log('🧹 ELIMINANDO USUARIO DE PRUEBA');
  console.log('='.repeat(40));
  
  try {
    const admin = await import('firebase-admin');
    const path = await import('path');
    
    if (!admin.apps.length) {
      const credentialsPath = path.resolve(process.cwd(), 'firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json');
      const serviceAccount = require(credentialsPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: config.firebase?.projectId
      });
    }

    const db = admin.firestore();
    
    // Buscar y eliminar el usuario de prueba
    const query = await db.collection('users')
      .where('email', '==', 'saidh.jimenez@clivi.com.mx')
      .get();
    
    if (!query.empty) {
      for (const doc of query.docs) {
        await doc.ref.delete();
        console.log(`✅ Eliminado documento: ${doc.id}`);
      }
    } else {
      console.log('ℹ️  No se encontró usuario de prueba para eliminar');
    }
    
  } catch (error) {
    console.error('❌ Error eliminando usuario de prueba:', error);
  }
}

// Ejecutar según el argumento
if (import.meta.url === `file://${process.argv[1]}`) {
  const action = process.argv[2];
  
  if (action === 'remove') {
    removeTestUser()
      .then(() => {
        console.log('\n🏁 Limpieza completada');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 ERROR:', error);
        process.exit(1);
      });
  } else {
    addTestUserToFirestore()
      .then(() => {
        console.log('\n🏁 Usuario de prueba agregado');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 ERROR:', error);
        process.exit(1);
      });
  }
}
