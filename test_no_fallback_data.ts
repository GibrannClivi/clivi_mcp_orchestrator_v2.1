/**
 * Prueba específica para verificar que NO usamos datos inventados ni fallbacks
 * Busca un email que no debería existir en ninguna plataforma: prueba2@msi.com
 */
import { config } from './src/config';
import { MCPManager } from './src/mcp/mcpManager';
import { QueryType, detectQueryType } from './src/utils/queryDetector';

async function testNoFallbackData() {
  console.log('🚀 Iniciando prueba para verificar que NO hay datos inventados ni fallbacks...');
  
  // Email que no debería existir en ninguna plataforma
  const testEmail = 'prueba2@msi.com';
  
  console.log(`\n📧 Buscando: ${testEmail}`);
  console.log('📋 Configuración actual:');
  console.log(`- Chargebee Site: ${config.chargebee.site}`);
  console.log(`- Chargebee Enabled: ${config.chargebee.enabled}`);
  console.log(`- HubSpot Enabled: ${config.hubspot.enabled}`);
  console.log(`- Firebase Enabled: ${config.firebase.enabled}`);
  
  const mcpManager = new MCPManager();
  
  try {
    // Inicializar el manager
    await mcpManager.initialize();
    
    // Detectar tipo de consulta
    const queryType = detectQueryType(testEmail);
    console.log(`\n🔍 Tipo de consulta detectado: ${queryType}`);
    
    // Realizar búsqueda en todas las fuentes
    console.log(`\n🔍 Buscando "${testEmail}" en todas las plataformas...`);
    const result = await mcpManager.fetchAllSources(testEmail, queryType);
    
    console.log('\n📊 RESULTADOS COMPLETOS:');
    console.log(JSON.stringify(result, null, 2));
    
    // Analizar resultados específicos por plataforma
    console.log('\n🔍 ANÁLISIS DETALLADO POR PLATAFORMA:');
    
    // Chargebee
    if (result.chargebee) {
      console.log('\n🟡 CHARGEBEE:');
      const hasChargebeeData = result.chargebee.data && Object.keys(result.chargebee.data).length > 0;
      if (hasChargebeeData && (result.chargebee.data.email || result.chargebee.data.customerId)) {
        console.log('❌ PROBLEMA: Se encontraron datos de cliente en Chargebee');
        console.log('Datos encontrados:', {
          customerId: result.chargebee.data.customerId,
          email: result.chargebee.data.email,
          firstName: result.chargebee.data.firstName,
          lastName: result.chargebee.data.lastName,
          company: result.chargebee.data.company
        });
      } else {
        console.log('✅ CORRECTO: No se encontraron datos de cliente en Chargebee');
      }
      
      if (hasChargebeeData && result.chargebee.data.subscriptionId) {
        console.log('❌ PROBLEMA: Se encontraron datos de suscripción en Chargebee');
        console.log('Datos de suscripción:', {
          subscriptionId: result.chargebee.data.subscriptionId,
          plan: result.chargebee.data.plan,
          status: result.chargebee.data.subscriptionStatus
        });
      } else {
        console.log('✅ CORRECTO: No se encontraron datos de suscripción en Chargebee');
      }
    } else {
      console.log('✅ CORRECTO: No hay datos de Chargebee');
    }
    
    // HubSpot
    if (result.hubspot) {
      console.log('\n🟡 HUBSPOT:');
      const hasHubspotData = result.hubspot.data && Object.keys(result.hubspot.data).length > 0;
      if (hasHubspotData && (result.hubspot.data.email || result.hubspot.data.contactId)) {
        console.log('❌ PROBLEMA: Se encontraron datos de contacto en HubSpot');
        console.log('Contacto encontrado:', {
          contactId: result.hubspot.data.contactId,
          email: result.hubspot.data.email,
          firstName: result.hubspot.data.firstName,
          lastName: result.hubspot.data.lastName,
          company: result.hubspot.data.company
        });
      } else {
        console.log('✅ CORRECTO: No se encontraron contactos en HubSpot');
      }
      
      if (hasHubspotData && result.hubspot.data.company) {
        console.log('❌ PROBLEMA: Se encontraron datos de empresa en HubSpot');
        console.log('Empresa encontrada:', result.hubspot.data.company);
      } else {
        console.log('✅ CORRECTO: No se encontraron empresas en HubSpot');
      }
    } else {
      console.log('✅ CORRECTO: No hay datos de HubSpot');
    }
    
    // Firebase
    if (result.firebase) {
      console.log('\n🟡 FIREBASE:');
      const hasFirebaseData = result.firebase.data && Object.keys(result.firebase.data).length > 0;
      if (hasFirebaseData && (result.firebase.data.email || result.firebase.data.userId)) {
        console.log('❌ PROBLEMA: Se encontraron datos de usuario en Firebase');
        console.log('Usuario encontrado:', {
          userId: result.firebase.data.userId,
          email: result.firebase.data.email,
          displayName: result.firebase.data.displayName,
          emailVerified: result.firebase.data.emailVerified
        });
      } else {
        console.log('✅ CORRECTO: No se encontraron usuarios en Firebase');
      }
    } else {
      console.log('✅ CORRECTO: No hay datos de Firebase');
    }
    
    // Verificación final
    console.log('\n🎯 VERIFICACIÓN FINAL:');
    
    const hasAnyData = (
      (result.chargebee?.data && Object.keys(result.chargebee.data).length > 0 && (result.chargebee.data.email || result.chargebee.data.customerId)) ||
      (result.hubspot?.data && Object.keys(result.hubspot.data).length > 0 && (result.hubspot.data.email || result.hubspot.data.contactId)) ||
      (result.firebase?.data && Object.keys(result.firebase.data).length > 0 && (result.firebase.data.email || result.firebase.data.userId))
    );
    
    if (hasAnyData) {
      console.log('❌ FALLO: El sistema devolvió datos para un email que no debería existir');
      console.log('❌ Esto indica que podría haber datos inventados o fallbacks activos');
    } else {
      console.log('✅ ÉXITO: El sistema NO devolvió datos inventados ni fallbacks');
      console.log('✅ Solo se devuelven datos reales de las APIs');
    }
    
    console.log('\n✅ Prueba completada');
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error);
    
    // Verificar si el error es esperado (por ejemplo, 404 cuando no se encuentra nada)
    if (error instanceof Error && error.message && error.message.includes('404')) {
      console.log('✅ Error 404 es esperado - confirma que no hay datos inventados');
    }
  } finally {
    await mcpManager.cleanup();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  testNoFallbackData().catch(console.error);
}

export { testNoFallbackData };
