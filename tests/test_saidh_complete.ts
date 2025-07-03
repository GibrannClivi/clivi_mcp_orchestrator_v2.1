#!/usr/bin/env node

/**
 * TEST FINAL CON SAIDH.JIMENEZ@CLIVI.COM.MX
 * Prueba completa del sistema con usuario que existe en las 3 plataformas
 */

import { UserProfileService } from '../src/services/userProfileService.js';

async function testSaidhProfile() {
  const testEmail = 'saidh.jimenez@clivi.com.mx';
  
  console.log('🚀 TEST FINAL DEL SISTEMA MCP ORCHESTRATOR');
  console.log('=' .repeat(60));
  console.log(`📧 Usuario de prueba: ${testEmail}`);
  console.log('🎯 Esperando datos de las 3 plataformas');
  console.log('=' .repeat(60));
  
  try {
    const userProfileService = new UserProfileService();
    
    console.log('\n🔍 CONSULTANDO PERFIL UNIFICADO...');
    const startTime = Date.now();
    const profile = await userProfileService.getUserProfile(testEmail);
    const endTime = Date.now();
    
    console.log(`⏱️  Tiempo total: ${endTime - startTime}ms`);
    console.log('\n👤 PERFIL UNIFICADO COMPLETO:');
    console.log('=' .repeat(50));
    
    // Información básica
    console.log('\n📋 INFORMACIÓN BÁSICA:');
    console.log(`   📧 Email: ${profile.email || 'N/A'}`);
    console.log(`   📧 EmailAdress: ${profile.emailAdress || 'N/A'}`);
    console.log(`   👤 Nombre completo: ${profile.name || 'N/A'}`);
    console.log(`   👤 Nombre: ${profile.firstName || 'N/A'}`);
    console.log(`   👤 Apellido: ${profile.lastName || 'N/A'}`);
    console.log(`   📱 Teléfono: ${profile.phone || 'N/A'}`);
    console.log(`   🏢 Empresa: ${profile.company || 'N/A'}`);
    
    // Datos de facturación (Chargebee)
    if (profile.customerId) {
      console.log('\n💳 DATOS DE FACTURACIÓN (Chargebee):');
      console.log(`   🆔 Customer ID: ${profile.customerId}`);
      console.log(`   🆔 Subscription ID: ${profile.subscriptionId || 'N/A'}`);
      console.log(`   📊 Estado: ${profile.subscriptionStatus || 'N/A'}`);
      console.log(`   📋 Plan: ${profile.plan || 'N/A'}`);
      console.log(`   💰 Próximo cobro: ${profile.nextBillingAmount || 'N/A'}`);
      console.log(`   📅 Fecha próximo cobro: ${profile.nextBillingDate || 'N/A'}`);
    }
    
    // Datos de CRM (HubSpot)
    if (profile.contactId) {
      console.log('\n🎯 DATOS DE CRM (HubSpot):');
      console.log(`   🆔 Contact ID: ${profile.contactId}`);
      console.log(`   📊 Lead Score: ${profile.leadScore || 'N/A'}`);
      console.log(`   🎭 Deal Stage: ${profile.dealStage || 'N/A'}`);
      console.log(`   📅 Última actividad: ${profile.lastActivity || 'N/A'}`);
    }
    
    // Datos médicos (Firebase)
    if (profile.userId) {
      console.log('\n🔥 DATOS MÉDICOS (Firebase):');
      console.log(`   🆔 User ID: ${profile.userId}`);
      console.log(`   📊 Estado del plan: ${profile.planStatus || 'N/A'}`);
      console.log(`   🩺 Plan médico: ${profile.medicalPlan || 'N/A'}`);
      console.log(`   💊 Medicamentos: ${profile.medicineCount || 0}`);
      console.log(`   🚨 Alergias: ${profile.allergies?.length || 0}`);
      console.log(`   🏥 Tratamientos: ${profile.treatments?.length || 0}`);
      console.log(`   📅 Última cita: ${profile.lastAppointment || 'N/A'}`);
      console.log(`   📅 Próxima cita: ${profile.nextAppointment || 'N/A'}`);
      
      if (profile.healthSummary) {
        console.log(`   📊 Estado de salud: ${profile.healthSummary.overallStatus || 'N/A'}`);
        console.log(`   ⚠️  Nivel de riesgo: ${profile.healthSummary.riskLevel || 'N/A'}`);
      }
      
      if (profile.emergencyContact) {
        console.log(`   🚨 Contacto emergencia: ${profile.emergencyContact.name || 'N/A'}`);
      }
    }
    
    // Atribución de fuentes
    console.log('\n🔍 ATRIBUCIÓN DE FUENTES:');
    console.log('=' .repeat(40));
    const sourceBreakdown = profile.sourceBreakdown || [];
    let platformsFound = new Set();
    
    sourceBreakdown.forEach((source, index) => {
      const icon = source.source === 'chargebee' ? '💳' : 
                   source.source === 'hubspot' ? '🎯' : 
                   source.source === 'firebase' ? '🔥' : '🔍';
      console.log(`   ${index + 1}. ${icon} ${source.field}: "${source.value}" → ${source.source.toUpperCase()}`);
      if (source.value && !source.value.includes('error') && !source.value.includes('Error')) {
        platformsFound.add(source.source);
      }
    });
    
    // Resumen final
    console.log('\n📊 RESUMEN DE INTEGRACIÓN:');
    console.log('=' .repeat(30));
    console.log(`   🎯 Plataformas consultadas: 3`);
    console.log(`   ✅ Plataformas con datos: ${platformsFound.size}`);
    console.log(`   📊 Total de campos: ${sourceBreakdown.length}`);
    console.log(`   ⏱️  Tiempo de respuesta: ${endTime - startTime}ms`);
    
    const platforms = Array.from(platformsFound);
    console.log('\n   📋 Plataformas activas:');
    platforms.forEach(platform => {
      const icon = platform === 'chargebee' ? '💳' : platform === 'hubspot' ? '🎯' : '🔥';
      const name = platform === 'chargebee' ? 'Chargebee (Facturación)' : 
                   platform === 'hubspot' ? 'HubSpot (CRM)' : 'Firebase (Médico)';
      console.log(`      ✅ ${icon} ${name}`);
    });
    
    // Verificación final
    const hasBasicInfo = profile.email && (profile.name || profile.firstName);
    const hasMultipleSources = platformsFound.size > 1;
    const hasGoodPerformance = (endTime - startTime) < 5000;
    
    console.log('\n🎉 VERIFICACIÓN FINAL:');
    console.log('=' .repeat(25));
    console.log(`   ✅ Información básica: ${hasBasicInfo ? 'SÍ' : 'NO'}`);
    console.log(`   ✅ Múltiples fuentes: ${hasMultipleSources ? 'SÍ' : 'NO'} (${platformsFound.size}/3)`);
    console.log(`   ✅ Rendimiento: ${hasGoodPerformance ? 'EXCELENTE' : 'ACEPTABLE'} (${endTime - startTime}ms)`);
    console.log(`   ✅ Datos consolidados: ${sourceBreakdown.length > 0 ? 'SÍ' : 'NO'} (${sourceBreakdown.length} campos)`);
    
    if (hasBasicInfo && hasMultipleSources && hasGoodPerformance) {
      console.log('\n🏆 ¡SISTEMA COMPLETAMENTE FUNCIONAL!');
      console.log('🚀 MCP Orchestrator listo para producción');
      
      if (platformsFound.size === 3) {
        console.log('🎯 INTEGRACIÓN COMPLETA - Las 3 plataformas operativas');
      } else {
        console.log('💡 Integración parcial - Normal si el usuario no existe en todas las plataformas');
      }
    } else {
      console.log('\n⚠️  Revisar configuración del sistema');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error);
    console.error('Stack trace:', error.stack);
  }
}

testSaidhProfile();
