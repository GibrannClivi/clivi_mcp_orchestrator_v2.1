#!/usr/bin/env node

/**
 * Script para agregar datos de prueba a Firebase/Firestore
 * y demostrar que la integración funciona perfectamente
 */

import admin from 'firebase-admin';
import path from 'path';

async function addTestUserToFirestore() {
  console.log('🔥 AGREGANDO USUARIO DE PRUEBA A FIRESTORE');
  console.log('='.repeat(50));
  
  try {
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      const credentialsPath = path.resolve(__dirname, 'firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json');
      const serviceAccount = require(credentialsPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'dtwo-ws8j9'
      });
    }

    const db = admin.firestore();
    
    // Crear usuario de prueba con datos médicos
    const testUser = {
      email: 'test@upgradebalance.com',
      firstName: 'Test',
      lastName: 'User Firebase',
      displayName: 'Test User Firebase',
      phoneNumber: '+1234567890',
      planStatus: 'active',
      medicalPlan: 'premium',
      medicine: [
        {
          name: 'Aspirin',
          dosage: '100mg',
          frequency: 'daily',
          prescribedBy: 'Dr. Smith'
        },
        {
          name: 'Vitamin D',
          dosage: '1000 IU',
          frequency: 'daily',
          prescribedBy: 'Dr. Johnson'
        }
      ],
      allergies: ['penicillin', 'shellfish'],
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'spouse',
        phone: '+1987654321'
      },
      selfSupplyLogs: [
        {
          date: '2025-01-01',
          medication: 'Aspirin',
          quantity: 30,
          source: 'pharmacy'
        }
      ],
      lastAppointment: {
        date: '2024-12-15',
        doctor: 'Dr. Smith',
        status: 'completed',
        notes: 'Regular checkup - all good'
      },
      nextAppointment: {
        date: '2025-03-15',
        doctor: 'Dr. Smith',
        status: 'scheduled',
        type: 'follow-up'
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Agregar el usuario a la colección 'users'
    const docRef = await db.collection('users').add(testUser);
    console.log(`✅ Usuario de prueba agregado con ID: ${docRef.id}`);
    
    // También agregar el usuario de Saidh para pruebas
    const saidhUser = {
      email: 'saidh.jimenez@clivi.com.mx',
      firstName: 'Jesus Saidh',
      lastName: 'Jimenez Fuentes',
      displayName: 'Jesus Saidh Jimenez Fuentes',
      phoneNumber: '+525542553723',
      planStatus: 'premium',
      medicalPlan: 'enterprise',
      medicine: [
        {
          name: 'Metformin',
          dosage: '500mg',
          frequency: 'twice daily',
          prescribedBy: 'Dr. Garcia'
        }
      ],
      allergies: ['latex'],
      emergencyContact: {
        name: 'Maria Jimenez',
        relationship: 'mother',
        phone: '+525512345678'
      },
      selfSupplyLogs: [
        {
          date: '2025-01-15',
          medication: 'Metformin',
          quantity: 60,
          source: 'pharmacy'
        }
      ],
      lastAppointment: {
        date: '2024-12-20',
        doctor: 'Dr. Garcia',
        status: 'completed',
        notes: 'Diabetes management - stable'
      },
      nextAppointment: {
        date: '2025-04-20',
        doctor: 'Dr. Garcia',
        status: 'scheduled',
        type: 'routine checkup'
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const saidhDocRef = await db.collection('users').add(saidhUser);
    console.log(`✅ Usuario Saidh agregado con ID: ${saidhDocRef.id}`);
    
    console.log('\n🎉 USUARIOS DE PRUEBA AGREGADOS EXITOSAMENTE');
    console.log('\nAhora puedes probar:');
    console.log('- test@upgradebalance.com');
    console.log('- saidh.jimenez@clivi.com.mx');
    console.log('- +1234567890 (teléfono de test user)');
    console.log('- +525542553723 (teléfono de Saidh)');
    console.log('- "Test User Firebase" (nombre)');
    console.log('- "Jesus Saidh" (nombre parcial)');
    
  } catch (error) {
    console.error('❌ Error agregando usuarios de prueba:', error);
  }
}

// Ejecutar si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  addTestUserToFirestore()
    .then(() => {
      console.log('\n✅ Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 ERROR:', error);
      process.exit(1);
    });
}
