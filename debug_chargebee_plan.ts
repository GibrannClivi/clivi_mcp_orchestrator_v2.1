#!/usr/bin/env node

/**
 * Test de debugging para Chargebee - estructura de plan
 */

import { mcpManager } from './src/mcp/mcpManager.js';

async function debugChargebeePlan() {
  console.log('🔍 DEBUG: Estructura de datos de Chargebee');
  console.log('=' .repeat(60));
  
  try {
    const sources = await mcpManager.fetchAllSources('saidh.jimenez@clivi.com.mx', 'email');
    
    if (sources.chargebee && sources.chargebee.data) {
      console.log('\n📊 DATOS COMPLETOS DE CHARGEBEE:');
      console.log(JSON.stringify(sources.chargebee.data, null, 2));
      
      if (sources.chargebee.data.subscription) {
        console.log('\n🔍 SUSCRIPCIÓN DETALLADA:');
        console.log(JSON.stringify(sources.chargebee.data.subscription, null, 2));
      }
      
      if (sources.chargebee.data.subscriptions) {
        console.log('\n📋 TODAS LAS SUSCRIPCIONES:');
        sources.chargebee.data.subscriptions.forEach((sub, index) => {
          console.log(`\n--- Suscripción ${index + 1} ---`);
          console.log(JSON.stringify(sub, null, 2));
        });
      }
    } else {
      console.log('❌ No hay datos de Chargebee');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugChargebeePlan();
