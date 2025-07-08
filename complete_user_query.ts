#!/usr/bin/env node

/**
 * Script para ejecutar consulta GraphQL completa con email
 * Devuelve todos los campos disponibles del usuario
 */

import fetch from 'node-fetch';

async function queryCompleteUserProfile(email: string) {
  console.log('🔍 EJECUTANDO CONSULTA COMPLETA DE USUARIO');
  console.log('='.repeat(50));
  console.log(`📧 Email: ${email}`);
  console.log('');

  const completeQuery = `
    query GetCompleteUserProfile($email: String!) {
      getUserProfile(query: $email) {
        # Información básica
        name
        firstName
        lastName
        email
        emailAdress
        phone
        company
        jobTitle
        
        # Información de suscripción (Chargebee)
        subscriptionStatus
        plan
        nextBillingAmount
        nextBillingDate
        billingCycle
        customerId
        subscriptionId
        
        # Información CRM (HubSpot)
        contactId
        lastActivity
        dealStage
        leadScore
        
        # Información médica HubSpot
        planIncludedPackage
        planName
        pxInformation
        specialistsAssigned
        supplies
        lastPrescription
        zero
        
        # Historial de pagos
        lastTwoPayments {
          id
          status
          amount
          currency
          createdAt
          description
        }
        
        # Información médica Firebase
        userId
        planStatus
        medicalPlan
        medicine
        medicineCount
        allergies
        treatments
        
        # Citas
        lastAppointment {
          appointmentId
          date
          type
          doctor
          status
          notes
        }
        nextAppointment {
          appointmentId
          date
          type
          doctor
          status
          notes
        }
        
        # Contacto de emergencia
        emergencyContact {
          name
          phone
          relationship
        }
        
        # Logs de suministros
        selfSupplyLogs
        
        # Información detallada del sistema
        sourceBreakdown {
          field
          value
          source
        }
        
        # Sugerencias del sistema
        suggestions
      }
    }
  `;

  try {
    const response = await fetch('http://localhost:4000/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: completeQuery,
        variables: { email }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ Errores en la consulta GraphQL:');
      result.errors.forEach((error: any) => {
        console.error(`  - ${error.message}`);
      });
      return null;
    }

    if (!result.data || !result.data.getUserProfile) {
      console.log('❌ No se encontraron datos para este usuario');
      return null;
    }

    const profile = result.data.getUserProfile;
    
    console.log('✅ PERFIL COMPLETO DEL USUARIO:');
    console.log('='.repeat(50));
    
    // Información básica
    console.log('\n👤 INFORMACIÓN BÁSICA:');
    console.log(`Nombre: ${profile.name || 'N/A'}`);
    console.log(`Nombre: ${profile.firstName || 'N/A'} ${profile.lastName || 'N/A'}`);
    console.log(`Email: ${profile.email || 'N/A'}`);
    console.log(`Email Address: ${profile.emailAdress || 'N/A'}`);
    console.log(`Teléfono: ${profile.phone || 'N/A'}`);
    console.log(`Empresa: ${profile.company || 'N/A'}`);
    console.log(`Cargo: ${profile.jobTitle || 'N/A'}`);
    
    // Información de suscripción
    console.log('\n💳 INFORMACIÓN DE SUSCRIPCIÓN:');
    console.log(`Estado: ${profile.subscriptionStatus || 'N/A'}`);
    console.log(`Plan: ${profile.plan || 'N/A'}`);
    console.log(`ID Cliente: ${profile.customerId || 'N/A'}`);
    console.log(`ID Suscripción: ${profile.subscriptionId || 'N/A'}`);
    
    // Información médica
    console.log('\n🏥 INFORMACIÓN MÉDICA:');
    console.log(`ID Usuario: ${profile.userId || 'N/A'}`);
    console.log(`Estado del Plan: ${profile.planStatus || 'N/A'}`);
    console.log(`Plan Médico: ${profile.medicalPlan || 'N/A'}`);
    console.log(`Paquete Incluido: ${profile.planIncludedPackage || 'N/A'}`);
    console.log(`Tratamientos: ${JSON.stringify(profile.treatments) || 'N/A'}`);
    console.log(`Medicamentos: ${profile.medicineCount || 0} medicamentos`);
    console.log(`Alergias: ${profile.allergies?.length || 0} alergias`);
    
    // Información de citas
    if (profile.lastAppointment) {
      console.log('\n📅 ÚLTIMA CITA:');
      console.log(`Fecha: ${profile.lastAppointment.date || 'N/A'}`);
      console.log(`Tipo: ${profile.lastAppointment.type || 'N/A'}`);
      console.log(`Doctor: ${profile.lastAppointment.doctor || 'N/A'}`);
      console.log(`Estado: ${profile.lastAppointment.status || 'N/A'}`);
    }
    
    if (profile.nextAppointment) {
      console.log('\n📅 PRÓXIMA CITA:');
      console.log(`Fecha: ${profile.nextAppointment.date || 'N/A'}`);
      console.log(`Tipo: ${profile.nextAppointment.type || 'N/A'}`);
      console.log(`Doctor: ${profile.nextAppointment.doctor || 'N/A'}`);
    }
    
    // Contacto de emergencia
    if (profile.emergencyContact) {
      console.log('\n🚨 CONTACTO DE EMERGENCIA:');
      console.log(`Nombre: ${profile.emergencyContact.name || 'N/A'}`);
      console.log(`Teléfono: ${profile.emergencyContact.phone || 'N/A'}`);
      console.log(`Relación: ${profile.emergencyContact.relationship || 'N/A'}`);
    }
    
    // Desglose de fuentes
    console.log('\n📊 DESGLOSE POR FUENTE:');
    if (profile.sourceBreakdown && profile.sourceBreakdown.length > 0) {
      const groupedBySources = profile.sourceBreakdown.reduce((acc: any, item: any) => {
        if (!acc[item.source]) acc[item.source] = [];
        acc[item.source].push(`${item.field}: ${item.value}`);
        return acc;
      }, {});
      
      Object.entries(groupedBySources).forEach(([source, fields]) => {
        console.log(`\n  ${source.toUpperCase()}:`);
        (fields as string[]).forEach(field => {
          console.log(`    - ${field}`);
        });
      });
    }
    
    // Datos sin procesar (opcional)
    console.log('\n📋 DATOS COMPLETOS (JSON):');
    console.log(JSON.stringify(profile, null, 2));
    
    return profile;
    
  } catch (error) {
    console.error('❌ Error ejecutando consulta:', error);
    return null;
  }
}

// Obtener email del argumento de línea de comandos
const email = process.argv[2];

if (!email) {
  console.error('❌ Por favor proporciona un email como argumento');
  console.log('Uso: npx ts-node complete_user_query.ts <email>');
  console.log('Ejemplo: npx ts-node complete_user_query.ts saidh.jimenez@clivi.com.mx');
  process.exit(1);
}

// Ejecutar consulta
queryCompleteUserProfile(email)
  .then((profile) => {
    if (profile) {
      console.log('\n✅ Consulta completada exitosamente');
    } else {
      console.log('\n❌ No se pudo obtener el perfil del usuario');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 ERROR:', error);
    process.exit(1);
  });
