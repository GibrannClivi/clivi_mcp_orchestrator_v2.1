/**
 * Optimized MCP Manager - Clean version with ONLY real APIs
 * Removes all mock data and redundant code
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { config } from '../config';
import { QueryType } from '../utils/queryDetector';

/**
 * Direct API client for Chargebee - ONLY real data
 */
class ChargebeeAPIClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = `https://${config.chargebee.site}.chargebee.com/api/v2`;
    this.apiKey = config.chargebee.apiKey;
  }

  async searchCustomer(email: string): Promise<any> {
    try {
      console.log(`🔍 Chargebee API: Searching for customer with email: ${email}`);
      
      const response = await fetch(`${this.baseUrl}/customers?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Chargebee API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json() as any;
      console.log(`✅ Chargebee API: Found ${data.list?.length || 0} customers`);
      return data;
    } catch (error) {
      console.error('Chargebee API error:', error);
      return null;
    }
  }

  async getSubscriptions(email: string): Promise<any[]> {
    try {
      console.log(`🔍 Chargebee API: Getting subscriptions for: ${email}`);
      
      const response = await fetch(`${this.baseUrl}/subscriptions?customer_email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Chargebee subscriptions API error: ${response.status}`);
        return [];
      }

      const data = await response.json() as any;
      console.log(`✅ Chargebee API: Found ${data.list?.length || 0} subscriptions`);
      return data.list || [];
    } catch (error) {
      console.error('Chargebee subscriptions API error:', error);
      return [];
    }
  }

  async getPlanDetails(planId: string): Promise<any> {
    try {
      console.log(`🔍 Chargebee API: Getting plan details for: ${planId}`);
      
      const response = await fetch(`${this.baseUrl}/plans/${planId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Chargebee plan API error: ${response.status}`);
        return null;
      }

      const data = await response.json() as any;
      console.log(`✅ Chargebee API: Found plan details for ${planId}`);
      return data.plan || null;
    } catch (error) {
      console.error('Chargebee plan API error:', error);
      return null;
    }
  }

  async getItemPriceDetails(itemPriceId: string): Promise<any> {
    try {
      console.log(`🔍 Chargebee API: Getting item price details for: ${itemPriceId}`);
      
      const response = await fetch(`${this.baseUrl}/item_prices/${itemPriceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.apiKey + ':').toString('base64')}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Chargebee item price API error: ${response.status}`);
        return null;
      }

      const data = await response.json() as any;
      console.log(`✅ Chargebee API: Found item price details for ${itemPriceId}`);
      return data.item_price || null;
    } catch (error) {
      console.error('Chargebee item price API error:', error);
      return null;
    }
  }
}

/**
 * Direct API client for HubSpot - ONLY real data
 */
class HubSpotAPIClient {
  private baseUrl = 'https://api.hubapi.com';
  private apiKey: string;

  constructor() {
    this.apiKey = config.hubspot.apiKey;
  }

  async searchContact(email: string): Promise<any> {
    try {
      console.log(`🔍 HubSpot API: Searching for contact with email: ${email}`);
      
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filterGroups: [{
            filters: [{
              value: email,
              propertyName: 'email',
              operator: 'EQ'
            }]
          }],
          properties: [
            'email', 'firstname', 'lastname', 'phone', 'company', 'jobtitle',
            'city', 'state', 'country', 'lifecyclestage', 'lead_status',
            'lastmodifieddate', 'createdate'
          ],
          limit: 1
        })
      });

      if (!response.ok) {
        console.error(`HubSpot API error: ${response.status}`);
        return null;
      }

      const data = await response.json() as any;
      console.log(`✅ HubSpot API: Found ${data.results?.length || 0} contacts`);
      console.log(`🔍 Raw HubSpot data:`, JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error('HubSpot API error:', error);
      return null;
    }
  }
}

/**
 * Direct API client for Firebase - ONLY real data
 */
class FirebaseAPIClient {
  private projectId: string;
  private credentialsPath: string;

  constructor() {
    this.projectId = config.firebase.projectId;
    this.credentialsPath = config.firebase.credentialsPath;
  }

  async searchUser(email: string): Promise<any> {
    try {
      console.log(`🔍 Firebase API: Searching for user with email: ${email}`);
      
      if (!this.credentialsPath || !this.projectId) {
        console.log(`⚠️  Firebase credentials not configured`);
        return null;
      }

      // Import Firebase Admin dynamically
      const admin = await import('firebase-admin');
      
      // Initialize Firebase Admin if not already initialized
      if (!admin.apps.length) {
        const serviceAccount = require(this.credentialsPath);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: this.projectId
        });
      }

      // Search user by email
      try {
        const userRecord = await admin.auth().getUserByEmail(email);
        console.log(`✅ Firebase API: Found real user ${userRecord.email}`);
        
        // Get additional user data from Firestore if available
        let firestoreData = {};
        try {
          const db = admin.firestore();
          const userDoc = await db.collection('users').doc(userRecord.uid).get();
          if (userDoc.exists) {
            firestoreData = userDoc.data() || {};
            console.log(`✅ Firebase API: Found Firestore data for user`);
          }
        } catch (firestoreError) {
          console.log(`⚠️  Firebase API: No Firestore data found for user`);
        }

        return {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || null,
          emailVerified: userRecord.emailVerified,
          disabled: userRecord.disabled,
          createdAt: userRecord.metadata.creationTime,
          lastSignIn: userRecord.metadata.lastSignInTime,
          customClaims: userRecord.customClaims || {},
          firestoreData
        };
      } catch (authError: any) {
        if (authError.code === 'auth/user-not-found') {
          console.log(`❌ Firebase API: No real user found for ${email}`);
          return null;
        }
        throw authError;
      }
    } catch (error) {
      console.error('Firebase API error:', error);
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
 * Optimized MCP Manager - Clean and efficient
 */
export class MCPManager {
  private isInitialized = false;
  private chargebeeClient: Client | null = null;
  private hubspotClient: Client | null = null;
  private firebaseClient: Client | null = null;
  
  // Direct API clients for real data
  private chargebeeAPI: ChargebeeAPIClient;
  private hubspotAPI: HubSpotAPIClient;
  private firebaseAPI: FirebaseAPIClient;

  constructor() {
    this.chargebeeAPI = new ChargebeeAPIClient();
    this.hubspotAPI = new HubSpotAPIClient();
    this.firebaseAPI = new FirebaseAPIClient();
  }

  /**
   * Initialize MCP connections - streamlined
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('✅ MCP Manager already initialized');
      return;
    }

    console.log('🚀 Initializing MCP Manager (optimized version)...');

    // Initialize in parallel for better performance
    const initPromises = [
      this.initializeChargebee(),
      this.initializeHubSpot(),
      this.initializeFirebase()
    ];

    await Promise.allSettled(initPromises);
    this.isInitialized = true;
    console.log('✅ MCP Manager initialization complete');
  }

  private async initializeChargebee(): Promise<void> {
    try {
      if (config.chargebee.enabled) {
        console.log('🔗 Chargebee: Initializing MCP connection...');
        const transport = new StdioClientTransport({
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-chargebee', config.chargebee.site, config.chargebee.apiKey]
        });
        
        this.chargebeeClient = new Client({ name: 'mcp-chargebee-client', version: '1.0.0' }, { capabilities: {} });
        await this.chargebeeClient.connect(transport);
        console.log('✅ Chargebee MCP connection established');
      } else {
        console.log('⚠️  Chargebee MCP disabled - missing configuration');
      }
    } catch (error) {
      console.error('❌ Chargebee MCP initialization failed:', error);
      this.chargebeeClient = null;
    }
  }

  private async initializeHubSpot(): Promise<void> {
    try {
      if (config.hubspot.enabled) {
        console.log('🔗 HubSpot: Initializing MCP connection...');
        const transport = new StdioClientTransport({
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-hubspot', config.hubspot.apiKey]
        });
        
        this.hubspotClient = new Client({ name: 'mcp-hubspot-client', version: '1.0.0' }, { capabilities: {} });
        await this.hubspotClient.connect(transport);
        console.log('✅ HubSpot MCP connection established');
      } else {
        console.log('⚠️  HubSpot MCP disabled - missing configuration');
      }
    } catch (error) {
      console.error('❌ HubSpot MCP initialization failed:', error);
      this.hubspotClient = null;
    }
  }

  private async initializeFirebase(): Promise<void> {
    try {
      if (config.firebase.enabled) {
        console.log('🔗 Firebase: Initializing MCP connection...');
        const transport = new StdioClientTransport({
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-firebase', config.firebase.projectId, config.firebase.credentialsPath]
        });
        
        this.firebaseClient = new Client({ name: 'mcp-firebase-client', version: '1.0.0' }, { capabilities: {} });
        await this.firebaseClient.connect(transport);
        console.log('✅ Firebase MCP connection established');
      } else {
        console.log('⚠️  Firebase MCP disabled - missing configuration');
      }
    } catch (error) {
      console.error('❌ Firebase MCP initialization failed:', error);
      this.firebaseClient = null;
    }
  }

  /**
   * Fetch all data sources - optimized to use real APIs first
   */
  async fetchAllSources(query: string, queryType: QueryType): Promise<Record<string, MCPResponse>> {
    console.log(`🔍 Fetching data for ${queryType}: ${query} (ONLY REAL APIS)`);

    if (!this.isInitialized) {
      await this.initialize();
    }

    // Fetch from all sources in parallel for better performance
    const [chargebeeResult, hubspotResult, firebaseResult] = await Promise.allSettled([
      this.callChargebeeMCP(query, queryType),
      this.callHubSpotMCP(query, queryType),
      this.callFirebaseMCP(query, queryType)
    ]);

    return {
      chargebee: chargebeeResult.status === 'fulfilled' ? chargebeeResult.value : { data: {}, error: 'Failed', source: 'chargebee' },
      hubspot: hubspotResult.status === 'fulfilled' ? hubspotResult.value : { data: {}, error: 'Failed', source: 'hubspot' },
      firebase: firebaseResult.status === 'fulfilled' ? firebaseResult.value : { data: {}, error: 'Failed', source: 'firebase' }
    };
  }

  /**
   * Call Chargebee - real API first, then MCP
   */
  private async callChargebeeMCP(query: string, queryType: QueryType): Promise<MCPResponse> {
    console.log(`🔍 Chargebee: Using ONLY real API data for ${queryType}: ${query}`);

    // Always try direct API first
    if (queryType === 'email') {
      try {
        const customerData = await this.chargebeeAPI.searchCustomer(query);
        if (customerData?.list?.length > 0) {
          const customer = customerData.list[0].customer;
          console.log(`✅ Found Chargebee customer via direct API: ${customer.email}`);
          
          // Get subscription data
          const subscriptions = await this.chargebeeAPI.getSubscriptions(query);
          let subscriptionData = {};
          
          if (subscriptions.length > 0) {
            const subscription = subscriptions[0].subscription;
            console.log(`🔍 Raw subscription data:`, JSON.stringify(subscription, null, 2));
            
            // Get plan details from subscription items (Chargebee v2 API structure)
            let planName = null;
            let planId = null;
            
            // Try to get plan from subscription_items first (newer API structure)
            if (subscription.subscription_items && subscription.subscription_items.length > 0) {
              const planItem = subscription.subscription_items.find((item: any) => item.item_type === 'plan');
              if (planItem && planItem.item_price_id) {
                planId = planItem.item_price_id;
                planName = planId; // Use plan ID as fallback
                console.log(`✅ Found plan ID from subscription_items: ${planId}`);
                
                // Try to get item price details first (for newer API structure)
                try {
                  const itemPriceDetails = await this.chargebeeAPI.getItemPriceDetails(planId);
                  if (itemPriceDetails && itemPriceDetails.name) {
                    planName = itemPriceDetails.name;
                    console.log(`✅ Found plan name from item price API: ${planName}`);
                  } else if (itemPriceDetails && itemPriceDetails.id) {
                    // Sometimes the name might be in a different field or we need to parse the ID
                    const readableName = planId.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                    planName = readableName;
                    console.log(`✅ Generated readable plan name: ${planName}`);
                  } else {
                    console.log(`⚠️  Item price details not found, trying plan API for: ${planId}`);
                    
                    // Fallback: try plan API with the item_price_id
                    const planDetails = await this.chargebeeAPI.getPlanDetails(planId);
                    if (planDetails && planDetails.name) {
                      planName = planDetails.name;
                      console.log(`✅ Found plan name from plan API: ${planName}`);
                    } else {
                      // Generate a readable name from the ID as final fallback
                      planName = planId
                        .replace(/-/g, ' ')
                        .replace(/\b\w/g, (l: string) => l.toUpperCase())
                        .replace('Mxn', 'MXN')
                        .replace('Monthly', 'Mensual');
                      console.log(`✅ Generated readable plan name from ID: ${planName}`);
                    }
                  }
                } catch (error) {
                  console.log(`⚠️  Could not fetch plan details for ${planId}, generating readable name`);
                  planName = planId
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (l: string) => l.toUpperCase())
                    .replace('Mxn', 'MXN')
                    .replace('Monthly', 'Mensual');
                }
              }
            }
            
            // Fallback: try legacy plan_id field
            if (!planName && subscription.plan_id) {
              planId = subscription.plan_id;
              try {
                const planDetails = await this.chargebeeAPI.getPlanDetails(planId);
                if (planDetails && planDetails.name) {
                  planName = planDetails.name;
                  console.log(`✅ Found plan name from legacy plan_id: ${planName}`);
                } else {
                  planName = planId;
                }
              } catch (error) {
                planName = planId;
              }
            }
            
            // Try different fields for billing amount
            let billingAmount = null;
            if (subscription.due_amount && subscription.due_amount > 0) {
              billingAmount = subscription.due_amount;
            } else if (subscription.mrr && subscription.mrr > 0) {
              billingAmount = subscription.mrr;
            } else if (subscription.plan_amount && subscription.plan_amount > 0) {
              billingAmount = subscription.plan_amount;
            }
            
            subscriptionData = {
              subscriptionStatus: subscription.status || null,
              plan: planName || null,
              nextBillingAmount: billingAmount,
              nextBillingDate: subscription.next_billing_at ? new Date(subscription.next_billing_at * 1000).toISOString() : null,
              billingCycle: subscription.billing_period_unit || null,
              subscriptionId: subscription.id || null
            };
            
            console.log(`🔍 Subscription data processed:`, JSON.stringify(subscriptionData, null, 2));
          }

          return {
            data: {
              customerId: customer.id || null,
              email: customer.email || null,
              firstName: customer.first_name || null,
              lastName: customer.last_name || null,
              company: customer.company || null,
              ...subscriptionData
            },
            source: 'chargebee_api'
          };
        }
      } catch (error) {
        console.error(`❌ Chargebee API error: ${error}`);
      }
    }

    // Try MCP as fallback
    if (this.chargebeeClient) {
      try {
        const response = await this.chargebeeClient.callTool({ name: 'chargebee_search_customers', arguments: { email: query } });
        if (response.content && Array.isArray(response.content) && response.content[0]?.text) {
          const result = JSON.parse(response.content[0].text);
          console.log(`✅ Chargebee MCP response received`);
          return { data: result, source: 'chargebee_mcp' };
        }
      } catch (error) {
        console.error(`❌ Chargebee MCP error: ${error}`);
      }
    }

    console.log(`❌ No Chargebee data found for: ${query}`);
    return { data: {}, source: 'chargebee' };
  }

  /**
   * Call HubSpot - real API first, then MCP
   */
  private async callHubSpotMCP(query: string, queryType: QueryType): Promise<MCPResponse> {
    console.log(`🔍 HubSpot: Using ONLY real API data for ${queryType}: ${query}`);

    // Always try direct API first
    if (queryType === 'email') {
      try {
        const contactData = await this.hubspotAPI.searchContact(query);
        if (contactData?.results?.length > 0) {
          const contact = contactData.results[0];
          const properties = contact.properties || {};
          
          console.log(`✅ Found HubSpot contact via direct API: ${properties.email}`);
          console.log(`🔍 Contact properties:`, JSON.stringify(properties, null, 2));
          
          return {
            data: {
              contactId: contact.id || null,
              email: properties.email || null,
              firstName: properties.firstname || null,
              lastName: properties.lastname || null,
              name: `${properties.firstname || ''} ${properties.lastname || ''}`.trim() || null,
              phone: properties.phone || null,
              company: properties.company || null,
              jobTitle: properties.jobtitle || null,
              city: properties.city || null,
              state: properties.state || null,
              country: properties.country || null,
              lifecycleStage: properties.lifecyclestage || null,
              leadStatus: properties.lead_status || null,
              lastModified: properties.lastmodifieddate || null,
              createdAt: properties.createdate || null
            },
            source: 'hubspot_api'
          };
        }
      } catch (error) {
        console.error(`❌ HubSpot API error: ${error}`);
      }
    }

    // Try MCP as fallback
    if (this.hubspotClient) {
      try {
        const response = await this.hubspotClient.callTool({ name: 'hubspot_search_contacts', arguments: { email: query } });
        if (response.content && Array.isArray(response.content) && response.content[0]?.text) {
          const result = JSON.parse(response.content[0].text);
          console.log(`✅ HubSpot MCP response received`);
          return { data: result, source: 'hubspot_mcp' };
        }
      } catch (error) {
        console.error(`❌ HubSpot MCP error: ${error}`);
      }
    }

    console.log(`❌ No HubSpot data found for: ${query}`);
    return { data: {}, source: 'hubspot' };
  }

  /**
   * Call Firebase - real API first, then MCP
   */
  private async callFirebaseMCP(query: string, queryType: QueryType): Promise<MCPResponse> {
    console.log(`🔍 Firebase: Using ONLY real API data for ${queryType}: ${query}`);

    // Always try direct API first
    if (queryType === 'email') {
      try {
        const userData = await this.firebaseAPI.searchUser(query);
        if (userData) {
          console.log(`✅ Found Firebase user via direct API: ${userData.email}`);
          console.log(`🔍 Firebase user data:`, JSON.stringify(userData, null, 2));
          
          return {
            data: {
              userId: userData.uid || null,
              email: userData.email || null,
              displayName: userData.displayName || null,
              emailVerified: userData.emailVerified || false,
              disabled: userData.disabled || false,
              createdAt: userData.createdAt || null,
              lastSignIn: userData.lastSignIn || null,
              customClaims: userData.customClaims || {},
              firestoreData: userData.firestoreData || {},
              // Medical data from Firestore or custom claims
              planStatus: userData.customClaims?.planStatus || userData.firestoreData?.planStatus || null,
              medicalPlan: userData.customClaims?.medicalPlan || userData.firestoreData?.medicalPlan || null,
              medicine: userData.customClaims?.medicine || userData.firestoreData?.medicine || [],
              appointments: userData.customClaims?.appointments || userData.firestoreData?.appointments || [],
              allergies: userData.customClaims?.allergies || userData.firestoreData?.allergies || []
            },
            source: 'firebase_api'
          };
        }
      } catch (error) {
        console.error(`❌ Firebase API error: ${error}`);
      }
    }

    // Try MCP as fallback
    if (this.firebaseClient) {
      try {
        const response = await this.firebaseClient.callTool({ name: 'firebase_search_users', arguments: { email: query } });
        if (response.content && Array.isArray(response.content) && response.content[0]?.text) {
          const result = JSON.parse(response.content[0].text);
          console.log(`✅ Firebase MCP response received`);
          return { data: result, source: 'firebase_mcp' };
        }
      } catch (error) {
        console.error(`❌ Firebase MCP error: ${error}`);
      }
    }

    console.log(`❌ No Firebase data found for: ${query}`);
    return { data: {}, source: 'firebase' };
  }

  /**
   * Cleanup MCP connections
   */
  async cleanup(): Promise<void> {
    console.log('🔌 Cleaning up MCP connections...');
    
    const cleanupPromises = [];
    
    if (this.chargebeeClient) {
      cleanupPromises.push(this.chargebeeClient.close().then(() => console.log('✅ Chargebee MCP closed')));
      this.chargebeeClient = null;
    }

    if (this.hubspotClient) {
      cleanupPromises.push(this.hubspotClient.close().then(() => console.log('✅ HubSpot MCP closed')));
      this.hubspotClient = null;
    }

    if (this.firebaseClient) {
      cleanupPromises.push(this.firebaseClient.close().then(() => console.log('✅ Firebase MCP closed')));
      this.firebaseClient = null;
    }

    await Promise.allSettled(cleanupPromises);
    this.isInitialized = false;
    console.log('✅ All MCP connections cleaned up');
  }

  /**
   * Health check for all services
   */
  async getHealthStatus(): Promise<any> {
    const health: any = {
      initialized: this.isInitialized,
      timestamp: new Date().toISOString()
    };

    // Check MCP connections
    health.chargebee = this.chargebeeClient ? { status: 'connected' } : { status: 'not_connected' };
    health.hubspot = this.hubspotClient ? { status: 'connected' } : { status: 'not_connected' };
    health.firebase = this.firebaseClient ? { status: 'connected' } : { status: 'not_connected' };

    return health;
  }

  /**
   * Document available tools for all MCPs
   */
  async documentAvailableTools(): Promise<any> {
    console.log('📋 Documenting available MCP tools...');
    
    const toolsDocumentation: any = {
      timestamp: new Date().toISOString(),
      chargebee: { status: 'not_connected', tools: [] },
      hubspot: { status: 'not_connected', tools: [] },
      firebase: { status: 'not_connected', tools: [] }
    };

    if (this.chargebeeClient) {
      try {
        const chargebeeTools = await this.chargebeeClient.listTools();
        toolsDocumentation.chargebee = {
          status: 'connected',
          tools: chargebeeTools.tools?.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          })) || []
        };
      } catch (error) {
        toolsDocumentation.chargebee = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    if (this.hubspotClient) {
      try {
        const hubspotTools = await this.hubspotClient.listTools();
        toolsDocumentation.hubspot = {
          status: 'connected',
          tools: hubspotTools.tools?.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          })) || []
        };
      } catch (error) {
        toolsDocumentation.hubspot = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    if (this.firebaseClient) {
      try {
        const firebaseTools = await this.firebaseClient.listTools();
        toolsDocumentation.firebase = {
          status: 'connected',
          tools: firebaseTools.tools?.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: tool.inputSchema
          })) || []
        };
      } catch (error) {
        toolsDocumentation.firebase = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    return toolsDocumentation;
  }
}

// Export singleton instance
export const mcpManager = new MCPManager();
