#!/usr/bin/env node

/**
 * Script rápido para consultar usuario por email
 * Devuelve los campos más importantes por defecto
 */

import fetch from 'node-fetch';

async function queryUserProfile(email: string) {
  console.log(`🔍 Consultando perfil de usuario: ${email}`);
  
  const defaultQuery = `
    query GetUserProfile($email: String!) {
      getUserProfile(query: $email) {
        # Información básica
        name
        firstName
        lastName
        email
        emailAdress
        phone
        
        # Información de suscripción
        subscriptionStatus
        plan
        customerId
        subscriptionId
        
        # Información médica esencial
        userId
        planStatus
        medicalPlan
        planIncludedPackage
        treatments
        medicineCount
        
        # Desglose de fuentes
        sourceBreakdown {
          field
          value
          source
        }
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
        query: defaultQuery,
        variables: { email }
      }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('❌ Errores en la consulta:');
      result.errors.forEach((error: any) => console.error(`  - ${error.message}`));
      return null;
    }

    if (!result.data?.getUserProfile) {
      console.log('❌ No se encontraron datos para este usuario');
      return null;
    }

    const profile = result.data.getUserProfile;
    
    console.log('\n✅ PERFIL DEL USUARIO:');
    console.log('='.repeat(40));
    console.log(`👤 Nombre: ${profile.name || 'N/A'}`);
    console.log(`📧 Email: ${profile.email || 'N/A'}`);
    console.log(`📞 Teléfono: ${profile.phone || 'N/A'}`);
    console.log(`💳 Plan: ${profile.plan || 'N/A'}`);
    console.log(`🏥 Plan Médico: ${profile.medicalPlan || 'N/A'}`);
    console.log(`📦 Paquete: ${profile.planIncludedPackage || 'N/A'}`);
    console.log(`🩺 Tratamientos: ${JSON.stringify(profile.treatments)}`);
    console.log(`💊 Medicamentos: ${profile.medicineCount || 0}`);
    
    console.log('\n📊 Fuentes de datos:');
    const sources = [...new Set(profile.sourceBreakdown?.map((item: any) => item.source) || [])];
    sources.forEach(source => {
      console.log(`  ✓ ${source}`);
    });
    
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
  console.log('Uso: npx ts-node query_user.ts <email>');
  console.log('Ejemplo: npx ts-node query_user.ts saidh.jimenez@clivi.com.mx');
  process.exit(1);
}

// Ejecutar consulta
queryUserProfile(email)
  .then((profile) => {
    if (profile) {
      console.log('\n✅ Consulta completada');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 ERROR:', error);
    process.exit(1);
  });
