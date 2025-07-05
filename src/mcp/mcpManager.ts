/**
 * CLEAN MCP Manager - Firebase with FIRESTORE ONLY (No Auth needed)
 * Simple integration like Chargebee and HubSpot
 */
import { config } from '../config/index';
import { QueryType } from '../utils/queryDetector';

/**
 * Direct API client for Chargebee - ONLY real data
 * SUPPORTS EMAIL, PHONE, AND NAME SEARCHES
 */
class ChargebeeAPIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = `https://${config.chargebee.site}.chargebee.com/api/v2`;
    this.apiKey = config.chargebee.apiKey;
  }

  async searchCustomer(query: string, queryType: 'email' | 'phone' | 'name'): Promise<any> {
    try {
      console.log(`🔍 Chargebee API: Searching for customer with ${queryType}: ${query}`);
      
      // NUEVA ESTRATEGIA: Listar customers y filtrar manualmente 
      // porque el filtro de email de Chargebee no funciona correctamente
      const url = `${this.baseUrl}/customers?limit=100`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`❌ Chargebee API: HTTP ${response.status} - ${response.statusText}`);
        return null;
      }

      const data = await response.json() as any;
      
      if (!data.list || data.list.length === 0) {
        console.log(`❌ Chargebee API: No customers found`);
        return null;
      }

      // FILTRAR MANUALMENTE por coincidencia exacta
      let targetCustomer = null;
      
      for (const item of data.list) {
        const customer = item.customer;
        let isExactMatch = false;
        
        switch (queryType) {
          case 'email':
            isExactMatch = customer.email && customer.email.toLowerCase() === query.toLowerCase();
            break;
          case 'phone':
            const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');
            isExactMatch = customer.phone && normalizePhone(customer.phone) === normalizePhone(query);
            break;
          case 'name':
            isExactMatch = customer.first_name && customer.first_name.toLowerCase().includes(query.toLowerCase());
            break;
        }
        
        if (isExactMatch) {
          targetCustomer = customer;
          break;
        }
      }
      
      if (!targetCustomer) {
        console.log(`❌ Chargebee API: No customer found with exact match for ${queryType}: ${query}`);
        return null;
      }

      console.log(`✅ Chargebee API: Found real customer ${targetCustomer.email}`);
      return targetCustomer;
    } catch (error) {
      console.error('Chargebee API error:', error);
      return null;
    }
  }

  async getSubscriptions(customerId: string): Promise<any[]> {
    try {
      console.log(`🔍 Chargebee API: Getting subscriptions for customer ${customerId}`);
      const url = `${this.baseUrl}/subscriptions?customer_id=${customerId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.log(`❌ Chargebee API: Failed to get subscriptions - HTTP ${response.status}`);
        return [];
      }

      const data = await response.json() as any;
      const subscriptions = data.list || [];
      
      // FILTRAR SOLO SUSCRIPCIONES DEL CUSTOMER ESPECÍFICO
      const filteredSubscriptions = subscriptions.filter((item: any) => 
        item.subscription && item.subscription.customer_id === customerId
      );
      
      console.log(`✅ Chargebee API: Found ${filteredSubscriptions.length} subscriptions for customer ${customerId}`);
      
      return filteredSubscriptions;
    } catch (error) {
      console.error('Chargebee subscriptions error:', error);
      return [];
    }
  }
}

/**
 * Direct API client for HubSpot - ONLY real data
 * SUPPORTS EMAIL, PHONE, AND NAME SEARCHES
 */
class HubSpotAPIClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.hubapi.com';

  constructor() {
    this.apiKey = config.hubspot.apiKey;
  }

  async searchContact(query: string, queryType: 'email' | 'phone' | 'name'): Promise<any> {
    try {
      console.log(`🔍 HubSpot API: Searching for contact with ${queryType}: ${query}`);
      
      let searchData: any;
      switch (queryType) {
        case 'email':
          searchData = {
            filterGroups: [{
              filters: [{
                propertyName: 'email',
                operator: 'EQ',
                value: query
              }]
            }],
            properties: [
              'email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle',
              'hs_lead_status', 'hubspotscore', 'lastmodifieddate', 'createdate',
              // Campos médicos fundamentales
              'treatment', 'plan_included_package', 'px_information', 
              'specialists_assigned', 'supplies', 'last_prescription', 'zero',
              'plan_name',
              // Campos alternativos comunes en HubSpot
              'medical_treatment', 'package_plan', 'patient_info',
              'assigned_specialists', 'medical_supplies', 'prescription_info',
              'treatment_plan', 'subscription_plan', 'medical_plan'
            ]
          };
          break;
        case 'phone':
          searchData = {
            filterGroups: [{
              filters: [{
                propertyName: 'phone',
                operator: 'EQ',
                value: query
              }]
            }],
            properties: [
              'email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle',
              'hs_lead_status', 'hubspotscore', 'lastmodifieddate', 'createdate',
              // Campos médicos fundamentales
              'treatment', 'plan_included_package', 'px_information', 
              'specialists_assigned', 'supplies', 'last_prescription', 'zero',
              'plan_name',
              // Campos alternativos comunes en HubSpot
              'medical_treatment', 'package_plan', 'patient_info',
              'assigned_specialists', 'medical_supplies', 'prescription_info',
              'treatment_plan', 'subscription_plan', 'medical_plan'
            ]
          };
          break;
        case 'name':
          searchData = {
            filterGroups: [{
              filters: [{
                propertyName: 'firstname',
                operator: 'EQ',
                value: query
              }]
            }],
            properties: [
              'email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle',
              'hs_lead_status', 'hubspotscore', 'lastmodifieddate', 'createdate',
              // Campos médicos fundamentales
              'treatment', 'plan_included_package', 'px_information', 
              'specialists_assigned', 'supplies', 'last_prescription', 'zero',
              'plan_name',
              // Campos alternativos comunes en HubSpot
              'medical_treatment', 'package_plan', 'patient_info',
              'assigned_specialists', 'medical_supplies', 'prescription_info',
              'treatment_plan', 'subscription_plan', 'medical_plan'
            ]
          };
          break;
      }

      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchData)
      });

      if (!response.ok) {
        console.log(`❌ HubSpot API: HTTP ${response.status} - ${response.statusText}`);
        return null;
      }

      const data = await response.json() as any;
      
      if (!data.results || data.results.length === 0) {
        console.log(`❌ HubSpot API: No contact found for ${queryType}: ${query}`);
        return null;
      }

      const contact = data.results[0];
      
      // VALIDACIÓN CRÍTICA: Verificar coincidencia exacta
      let isExactMatch = false;
      switch (queryType) {
        case 'email':
          isExactMatch = contact.properties.email && contact.properties.email.toLowerCase() === query.toLowerCase();
          break;
        case 'phone':
          const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');
          isExactMatch = contact.properties.phone && normalizePhone(contact.properties.phone) === normalizePhone(query);
          break;
        case 'name':
          const queryLower = query.toLowerCase();
          const firstName = (contact.properties.firstname || '').toLowerCase();
          const lastName = (contact.properties.lastname || '').toLowerCase();
          isExactMatch = firstName.includes(queryLower) || lastName.includes(queryLower) || 
                        queryLower.includes(firstName) || queryLower.includes(lastName);
          break;
      }
      
      if (!isExactMatch) {
        console.log(`❌ HubSpot API: Contact found but doesn't match query. Found: ${contact.properties.email}, Searched: ${query}`);
        return null;
      }

      console.log(`✅ HubSpot API: Found real contact ${contact.properties.email}`);
      return contact;
    } catch (error) {
      console.error('HubSpot API error:', error);
      return null;
    }
  }
}

/**
 * SIMPLE Firebase/Firestore API client - FIRESTORE ONLY
 * No Firebase Auth needed - just like Chargebee and HubSpot!
 */
class FirebaseAPIClient {

  constructor() {
    // No configuration needed - will auto-detect credentials
  }

  async searchUser(query: string, queryType: 'email' | 'phone' | 'name'): Promise<any> {
    try {
      console.log(`🔍 Firebase API: Searching Firestore for user with ${queryType}: ${query}`);
      
      // Import Firebase Admin dynamically
      const admin = await import('firebase-admin');
      const path = await import('path');
      const fs = await import('fs');
      
      // Initialize Firebase Admin if not already initialized
      if (!admin.default.apps || admin.default.apps.length === 0) {
        console.log('🔧 Firebase API: Initializing Firebase Admin...');
        
        try {
          // Try environment variable first (for Cloud Run)
          if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            console.log('Using GOOGLE_APPLICATION_CREDENTIALS');
            admin.default.initializeApp({
              credential: admin.default.credential.applicationDefault()
            });
          } else {
            // Use local credentials file
            const credentialsPath = path.join(process.cwd(), 'firestore', 'dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json');
            if (fs.existsSync(credentialsPath)) {
              console.log(`Using local credentials file: ${credentialsPath}`);
              const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
              admin.default.initializeApp({
                credential: admin.default.credential.cert(serviceAccount)
              });
            } else {
              throw new Error('No Firebase credentials found');
            }
          }
          console.log('✅ Firebase Admin initialized successfully');
        } catch (error) {
          console.error('❌ Firebase Admin initialization failed:', error);
          return null;
        }
      }

      const db = admin.default.firestore();
      let userDoc = null;
      
      // Search based on query type with EXACT MATCH validation
      if (queryType === 'email') {
        // First try emailAddress field (correct field in Firestore)
        const emailAddressQuery = await db.collection('users').where('emailAddress', '==', query).limit(1).get();
        if (!emailAddressQuery.empty) {
          userDoc = emailAddressQuery.docs[0];
          console.log('✅ Found user by emailAddress field');
        } else {
          // Fallback to email field
          const emailQuery = await db.collection('users').where('email', '==', query).limit(1).get();
          if (!emailQuery.empty) {
            userDoc = emailQuery.docs[0];
            console.log('✅ Found user by email field (fallback)');
          }
        }
      } else if (queryType === 'phone') {
        const phoneQuery = await db.collection('users').where('phoneNumber', '==', query).limit(1).get();
        if (!phoneQuery.empty) {
          userDoc = phoneQuery.docs[0];
          console.log('✅ Found user by phoneNumber field');
        }
      } else if (queryType === 'name') {
        const nameQuery = await db.collection('users').where('nameDisplay', '==', query).limit(1).get();
        if (!nameQuery.empty) {
          userDoc = nameQuery.docs[0];
          console.log('✅ Found user by nameDisplay field');
        }
      }

      if (userDoc) {
        const userData = userDoc.data();
        
        // VALIDACIÓN CRÍTICA: Verificar coincidencia exacta
        let isExactMatch = false;
        switch (queryType) {
          case 'email':
            isExactMatch = (userData.emailAddress && userData.emailAddress.toLowerCase() === query.toLowerCase()) ||
                          (userData.email && userData.email.toLowerCase() === query.toLowerCase());
            break;
          case 'phone':
            const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, '');
            isExactMatch = userData.phoneNumber && normalizePhone(userData.phoneNumber) === normalizePhone(query);
            break;
          case 'name':
            isExactMatch = userData.nameDisplay && userData.nameDisplay.toLowerCase().includes(query.toLowerCase());
            break;
        }
        
        if (!isExactMatch) {
          console.log(`❌ Firebase API: User found but doesn't match query. Found: ${userData.emailAddress || userData.email}, Searched: ${query}`);
          return null;
        }
        
        console.log(`✅ Firebase API: User found - ID: ${userDoc.id}`);
        
        return {
          uid: userDoc.id,
          email: userData.emailAddress || userData.email,
          emailAddress: userData.emailAddress,
          phoneNumber: userData.phoneNumber,
          displayName: userData.nameDisplay,
          firstName: userData.nameFirst,
          lastName: userData.nameLast || userData.lastName,
          planStatus: userData.planStatus,
          medicalPlan: userData.medicalPlan,
          treatments: userData.treatments || [],
          healthSummary: userData.healthSummary || {}
        };
      } else {
        console.log(`❌ Firebase API: No user found for ${queryType}: ${query}`);
        return null;
      }
    } catch (error: any) {
      console.error(`❌ Firebase API: Error searching for ${queryType}: ${query}`, error.message);
      return null;
    }
  }
}

export interface MCPResponse {
  data?: any;
  error?: string;
  source: string;
}

/**
 * CLEAN MCP Manager - Simple and efficient like Chargebee/HubSpot
 * SUPPORTS EMAIL, PHONE, AND NAME SEARCHES with REAL DATA ONLY
 */
export class MCPManager {
  private chargebeeClient: ChargebeeAPIClient;
  private hubspotClient: HubSpotAPIClient;
  private firebaseClient: FirebaseAPIClient;

  constructor() {
    this.chargebeeClient = new ChargebeeAPIClient();
    this.hubspotClient = new HubSpotAPIClient();
    this.firebaseClient = new FirebaseAPIClient();
  }

  /**
   * Fetch data from all MCP sources for a given query and type
   * Returns ONLY REAL DATA - no fallbacks, no mock data
   */
  async fetchAllSources(query: string, queryType: QueryType): Promise<Record<string, MCPResponse>> {
    console.log(`\n🔄 MCP Manager: Fetching from all sources for ${queryType}: ${query}`);
    
    const sources: Record<string, MCPResponse> = {};

    // Fetch from all sources in parallel for better performance
    const promises = [
      this.fetchChargebeeData(query, queryType),
      this.fetchHubSpotData(query, queryType),
      this.fetchFirebaseData(query, queryType)
    ];

    const [chargebeeResult, hubspotResult, firebaseResult] = await Promise.allSettled(promises);

    // Process Chargebee result
    if (chargebeeResult.status === 'fulfilled') {
      sources.chargebee = chargebeeResult.value;
    } else {
      sources.chargebee = { error: chargebeeResult.reason?.message || 'Unknown error', source: 'chargebee' };
    }

    // Process HubSpot result
    if (hubspotResult.status === 'fulfilled') {
      sources.hubspot = hubspotResult.value;
    } else {
      sources.hubspot = { error: hubspotResult.reason?.message || 'Unknown error', source: 'hubspot' };
    }

    // Process Firebase result
    if (firebaseResult.status === 'fulfilled') {
      sources.firebase = firebaseResult.value;
    } else {
      sources.firebase = { error: firebaseResult.reason?.message || 'Unknown error', source: 'firebase' };
    }

    console.log(`\n✅ MCP Manager: Completed fetching from all sources`);
    
    // Log which sources have real data
    Object.entries(sources).forEach(([sourceName, response]) => {
      if (response.data && Object.keys(response.data).length > 0) {
        console.log(`  ✅ ${sourceName}: Has real data`);
      } else if (response.error) {
        console.log(`  ❌ ${sourceName}: Error - ${response.error}`);
      } else {
        console.log(`  ⚪ ${sourceName}: No data found`);
      }
    });

    return sources;
  }

  /**
   * Fetch Chargebee customer data
   */
  private async fetchChargebeeData(query: string, queryType: QueryType): Promise<MCPResponse> {
    try {
      const customer = await this.chargebeeClient.searchCustomer(query, queryType);
      
      if (!customer) {
        return { error: 'No customer found', source: 'chargebee' };
      }

      // Get subscription data
      const subscriptions = await this.chargebeeClient.getSubscriptions(customer.id);
      const activeSubscription = subscriptions.find(sub => sub.subscription?.status === 'active')?.subscription;

      return {
        data: {
          customer,
          subscription: activeSubscription || null,
          subscriptions: subscriptions.map(sub => sub.subscription)
        },
        source: 'chargebee'
      };
    } catch (error: any) {
      return { error: error.message, source: 'chargebee' };
    }
  }

  /**
   * Fetch HubSpot contact data
   */
  private async fetchHubSpotData(query: string, queryType: QueryType): Promise<MCPResponse> {
    try {
      const contact = await this.hubspotClient.searchContact(query, queryType);
      
      if (!contact) {
        return { error: 'No contact found', source: 'hubspot' };
      }

      return {
        data: { contact },
        source: 'hubspot'
      };
    } catch (error: any) {
      return { error: error.message, source: 'hubspot' };
    }
  }

  /**
   * Fetch Firebase/Firestore user data - SIMPLE like the others!
   */
  private async fetchFirebaseData(query: string, queryType: QueryType): Promise<MCPResponse> {
    try {
      const user = await this.firebaseClient.searchUser(query, queryType);
      
      if (!user) {
        return { error: 'No user found', source: 'firebase' };
      }

      return {
        data: { user },
        source: 'firebase'
      };
    } catch (error: any) {
      return { error: error.message, source: 'firebase' };
    }
  }
}

// Create singleton instance
export const mcpManager = new MCPManager();
