#!/usr/bin/env node

/**
 * Test de búsqueda por teléfono para +18043047420
 */

import { UserProfileService } from '../src/services/userProfileService.js';

async function testPhoneSearch() {
  const service = new UserProfileService();
  
  console.log('🔍 PRUEBA DE BÚSQUEDA POR TELÉFONO');
  console.log('=' .repeat(60));
  console.log('📱 Buscando: +18043047420');
  console.log('');
  
  try {
    const startTime = Date.now();
    const profile = await service.getUserProfile('+18043047420');
    const endTime = Date.now();
    
    console.log('✅ RESULTADO EXITOSO:');
    console.log(`📧 Email encontrado: ${profile.email}`);
    console.log(`👤 Nombre completo: ${profile.name}`);
    console.log(`📱 Teléfono: ${profile.phone}`);
    console.log(`💳 Customer ID: ${profile.customerId || 'N/A'}`);
    console.log(`🎯 Contact ID: ${profile.contactId || 'N/A'}`);
    console.log(`🔥 User ID: ${profile.userId || 'N/A'}`);
    console.log(`⏱️  Tiempo de búsqueda: ${endTime - startTime}ms`);
    console.log(`🔗 Campos consolidados: ${profile.sourceBreakdown?.length || 0}`);
    
    console.log('\n📊 FUENTES DE DATOS:');
    profile.sourceBreakdown?.forEach((source, index) => {
      const icon = source.source === 'chargebee' ? '💳' : source.source === 'hubspot' ? '🎯' : source.source === 'firebase' ? '🔥' : '🔍';
      console.log(`   ${index + 1}. ${icon} ${source.field}: "${source.value}" → ${source.source.toUpperCase()}`);
    });
    
    console.log('\n🎉 ¡BÚSQUEDA POR TELÉFONO FUNCIONA PERFECTAMENTE!');
    
  } catch (error) {
    console.error('❌ Error en la búsqueda:', error);
  }
}

testPhoneSearch();
