/**
 * CLEAN MCP Manager - Firebase with FIRESTORE ONLY (No Auth needed)
 * Simple integration like Chargebee and HubSpot
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { config } from '../config';
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
      
      let url: string;
      switch (queryType) {
        case 'email':
          url = `${this.baseUrl}/customers?email=${encodeURIComponent(query)}`;
          break;
        case 'phone':
          url = `${this.baseUrl}/customers?phone=${encodeURIComponent(query)}`;
          break;
        case 'name':
          url = `${this.baseUrl}/customers?first_name=${encodeURIComponent(query)}`;
          break;
        default:
          url = `${this.baseUrl}/customers?email=${encodeURIComponent(query)}`;
      }
      
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
        console.log(`❌ Chargebee API: No customer found for ${queryType}: ${query}`);
        return null;
      }

      const customer = data.list[0].customer;
      console.log(`✅ Chargebee API: Found real customer ${customer.email}`);
      return customer;
    } catch (error) {
      console.error('Chargebee API error:', error);
      return null;
    }
  }

  async getSubscriptions(customerId: string): Promise<any[]> {
    try {
      const url = `${this.baseUrl}/subscriptions?customer_id=${customerId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json() as any;
      return data.list || [];
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
              'hs_lead_status', 'hubspotscore', 'lastmodifieddate', 'createdate'
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
              'hs_lead_status', 'hubspotscore', 'lastmodifieddate', 'createdate'
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
              'hs_lead_status', 'hubspotscore', 'lastmodifieddate', 'createdate'
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
  private credentialsPath: string | null;
  private projectId: string | null;

  constructor() {
    this.credentialsPath = config.firebase?.credentialsPath || null;
    this.projectId = config.firebase?.projectId || null;
  }

  async searchUser(query: string, queryType: 'email' | 'phone' | 'name'): Promise<any> {
    try {
      console.log(`🔍 Firebase API: Searching Firestore for user with ${queryType}: ${query}`);
      
      if (!this.credentialsPath || !this.projectId) {
        console.log(`⚠️  Firebase credentials not configured`);
        return null;
      }

      // Import Firebase Admin dynamically
      const admin = await import('firebase-admin');
      const path = await import('path');
      
      // Initialize Firebase Admin if not already initialized
      if (!admin.apps.length) {
        const credentialsPath = path.resolve(__dirname, '../../firestore/dtwo-firebase-adminsdk-ws8j9-0b9683f4ba.json');
        const serviceAccount = require(credentialsPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: this.projectId
        });
      }

      const db = admin.firestore();
      let firestoreDoc = null;
      let firestoreData = null;
      
      // Search ONLY in Firestore based on query type - SIMPLE like Chargebee/HubSpot
      switch (queryType) {
        case 'email':
          const emailQuery = await db.collection('users')
            .where('email', '==', query)
            .limit(1)
            .get();
          
          if (!emailQuery.empty) {
            firestoreDoc = emailQuery.docs[0];
            firestoreData = firestoreDoc.data();
            console.log(`✅ Firebase API: Found user in Firestore by email`);
          }
          break;
          
        case 'phone':
          // Try both phoneNumber and phone fields
          let phoneQuery = await db.collection('users')
            .where('phoneNumber', '==', query)
            .limit(1)
            .get();
          
          if (phoneQuery.empty) {
            phoneQuery = await db.collection('users')
              .where('phone', '==', query)
              .limit(1)
              .get();
          }
          
          if (!phoneQuery.empty) {
            firestoreDoc = phoneQuery.docs[0];
            firestoreData = firestoreDoc.data();
            console.log(`✅ Firebase API: Found user in Firestore by phone`);
          }
          break;
          
        case 'name':
          // Try exact match first on displayName
          let nameQuery = await db.collection('users')
            .where('displayName', '==', query)
            .limit(1)
            .get();
          
          if (!nameQuery.empty) {
            firestoreDoc = nameQuery.docs[0];
            firestoreData = firestoreDoc.data();
            console.log(`✅ Firebase API: Found user in Firestore by exact displayName`);
          } else {
            // Try searching by firstName if no exact match
            const nameParts = query.toLowerCase().split(' ').filter(part => part.length > 0);
            if (nameParts.length >= 1) {
              const firstName = nameParts[0];
              const firstNameQuery = await db.collection('users')
                .where('firstName', '==', firstName)
                .limit(1)
                .get();
              
              if (!firstNameQuery.empty) {
                firestoreDoc = firstNameQuery.docs[0];
                firestoreData = firestoreDoc.data();
                console.log(`✅ Firebase API: Found user in Firestore by firstName`);
              }
            }
          }
          break;
      }
      
      if (!firestoreDoc || !firestoreData) {
        console.log(`❌ Firebase API: No user found in Firestore for ${queryType}: ${query}`);
        return null;
      }
      
      // Return standardized user object from Firestore data ONLY - SIMPLE!
      return {
        uid: firestoreDoc.id,
        email: firestoreData.email || null,
        phoneNumber: firestoreData.phoneNumber || firestoreData.phone || null,
        displayName: firestoreData.displayName || firestoreData.firstName || null,
        firstName: firestoreData.firstName || null,
        lastName: firestoreData.lastName || null,
        // Medical/App specific data
        planStatus: firestoreData.planStatus || null,
        medicalPlan: firestoreData.medicalPlan || null,
        medicine: firestoreData.medicine || [],
        allergies: firestoreData.allergies || [],
        emergencyContact: firestoreData.emergencyContact || null,
        selfSupplyLogs: firestoreData.selfSupplyLogs || [],
        lastAppointment: firestoreData.lastAppointment || null,
        nextAppointment: firestoreData.nextAppointment || null,
        // Include all original Firestore data
        firestoreData
      };
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
