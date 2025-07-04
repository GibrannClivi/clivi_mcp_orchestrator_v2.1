/**
 * Debug específico de suscripciones de Chargebee para test@upgradebalance.com
 */

const { config } = require('./dist/config/index.js');

async function debugChargebeeSubscriptions() {
  console.log('🔍 DEBUG SUSCRIPCIONES CHARGEBEE - test@upgradebalance.com');
  console.log('========================================================');
  
  const customerId = 'AzZjJbUmdM0uB2R90'; // ID del cliente correcto
  const baseUrl = `https://${config.chargebee.site}.chargebee.com/api/v2`;
  const apiKey = config.chargebee.apiKey;
  
  try {
    // Obtener suscripciones del cliente
    const url = `${baseUrl}/subscriptions?customer_id=${customerId}`;
    console.log(`📡 Request URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
        'Accept': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status} - ${response.statusText}`);
    
    if (!response.ok) {
      console.error(`❌ Error HTTP: ${response.status}`);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      return;
    }
    
    const data = await response.json();
    
    console.log('\n📋 SUSCRIPCIONES COMPLETAS:');
    console.log('===========================');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n📊 ANÁLISIS DE SUSCRIPCIONES:');
    console.log('=============================');
    
    if (!data.list || data.list.length === 0) {
      console.log('❌ No hay suscripciones para este cliente');
    } else {
      console.log(`✅ ENCONTRADAS: ${data.list.length} suscripción(es)`);
      
      data.list.forEach((item, index) => {
        const subscription = item.subscription;
        console.log(`\n💳 Suscripción #${index + 1}:`);
        console.log(`   ID: ${subscription.id}`);
        console.log(`   Estado: ${subscription.status}`);
        console.log(`   Plan ID: ${subscription.plan_id}`);
        console.log(`   Plan Cantidad: ${subscription.plan_quantity}`);
        console.log(`   Plan Unit Price: ${subscription.plan_unit_price / 100} ${subscription.currency_code}`);
        console.log(`   Fecha inicio: ${new Date(subscription.started_at * 1000).toISOString()}`);
        
        if (subscription.status === 'active') {
          console.log('   🟢 ACTIVA - Esta es la suscripción actual');
        }
        
        // Plan details
        if (item.plan) {
          const plan = item.plan;
          console.log(`\n   📋 Detalles del Plan:`);
          console.log(`      Nombre: ${plan.name}`);
          console.log(`      ID: ${plan.id}`);
          console.log(`      Precio: ${plan.price / 100} ${plan.currency_code}`);
          console.log(`      Periodo: ${plan.period} ${plan.period_unit}`);
        }
      });
      
      // Encontrar suscripción activa
      const activeSubscription = data.list.find(item => item.subscription.status === 'active');
      if (activeSubscription) {
        console.log('\n🎯 DATOS PARA RESPUESTA GRAPHQL:');
        console.log('================================');
        console.log(`Plan: ${activeSubscription.plan?.name || activeSubscription.subscription.plan_id}`);
        console.log(`Estado: ${activeSubscription.subscription.status}`);
        console.log(`Próximo cobro: ${activeSubscription.subscription.next_billing_at ? new Date(activeSubscription.subscription.next_billing_at * 1000).toISOString() : 'N/A'}`);
        console.log(`Monto: ${activeSubscription.subscription.plan_unit_price / 100} ${activeSubscription.subscription.currency_code}`);
      }
    }
    
  } catch (error) {
    console.error('\n💥 ERROR en la consulta de suscripciones:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar el debug
debugChargebeeSubscriptions()
  .then(() => {
    console.log('\n✅ Debug de suscripciones completado');
  })
  .catch(err => {
    console.error('\n💥 Error fatal:', err);
  });
