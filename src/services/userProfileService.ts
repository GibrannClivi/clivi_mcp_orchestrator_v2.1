/**
 * User Profile Service - FIREBASE/FIRESTORE INTEGRATION (SIMPLE)
 */
import { UserProfile, FieldSource } from '../graphql/types';
import { detectQueryType, normalizeQuery, validateQuery, QueryType } from '../utils/queryDetector';
import { mcpManager } from '../mcp/mcpManager';
import CacheManager from '../cache/cacheManager';

export class UserProfileService {
  private cacheManager: CacheManager;

  constructor() {
    this.cacheManager = new CacheManager();
  }

  async getUserProfile(query: string): Promise<UserProfile> {
    const startTime = Date.now();
    
    // Detect query type and normalize
    const queryType = detectQueryType(query);
    const normalizedQuery = normalizeQuery(query, queryType);
    
    console.log(`Processing profile query: ${query} (type: ${queryType})`);
    
    // Validate query format (but be permissive with phone numbers for better UX)
    if (!validateQuery(normalizedQuery, queryType)) {
      if (queryType !== 'phone') {
        throw new Error(`Invalid ${queryType} format: ${query}`);
      } else {
        console.log(`⚠️  Phone validation failed but proceeding: ${query}`);
      }
    }

    // Check cache first
    const cacheKey = this.cacheManager.generateProfileCacheKey(normalizedQuery, queryType);
    const cached = await this.cacheManager.get(cacheKey);
    
    if (cached) {
      console.log(`✅ Cache hit for ${queryType}: ${normalizedQuery}`);
      return cached as UserProfile;
    }

    console.log(`🔍 Cache miss, fetching from MCP sources for ${queryType}: ${normalizedQuery}`);

    try {
      // Fetch data from all MCP sources in parallel
      const sources = await mcpManager.fetchAllSources(normalizedQuery, queryType);
      
      console.log(`Data sources used: ${Object.keys(sources).join(', ')}`);
      
      // Check if any source has real data
      const hasRealData = Object.values(sources).some(source => 
        source.data && Object.keys(source.data).length > 0
      );

      if (!hasRealData) {
        console.log('❌ No real data found in any MCP source');
        throw new Error(`No data found for user: ${normalizedQuery}`);
      }
      
      // Consolidate data from all sources - ONLY REAL DATA
      const profile = await this.consolidateUserProfile(sources, normalizedQuery, queryType);
      
      // Cache the result
      await this.cacheManager.set(cacheKey, profile);
      
      const endTime = Date.now();
      console.log(`✅ Profile consolidated in ${endTime - startTime}ms`);
      
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  private async consolidateUserProfile(sources: Record<string, any>, query: string, queryType: QueryType): Promise<UserProfile> {
    const profile: UserProfile = {
      name: undefined,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      company: undefined,
      jobTitle: undefined,
      subscriptionStatus: undefined,
      plan: undefined,
      nextBillingAmount: undefined,
      nextBillingDate: undefined,
      billingCycle: undefined,
      customerId: undefined,
      subscriptionId: undefined,
      contactId: undefined,
      lastActivity: undefined,
      dealStage: undefined,
      leadScore: undefined,
      lastTicket: undefined,
      userId: undefined,
      emailAdress: undefined,
      planStatus: undefined,
      medicalPlan: undefined,
      medicine: [],
      medicineCount: 0,
      selfSupplyLogs: [],
      lastAppointment: undefined,
      nextAppointment: undefined,
      allergies: [],
      emergencyContact: undefined,
      treatments: [],
      healthSummary: undefined,
      sourceBreakdown: [],
      suggestions: []
    };
    
    const sourceBreakdown: FieldSource[] = [];
    let hasRealData = false;

    // Set the queried field based on query type
    if (queryType === 'email') {
      profile.email = query;
      sourceBreakdown.push({ field: 'email', value: query, source: 'query' });
    } else if (queryType === 'phone') {
      profile.phone = query;
      sourceBreakdown.push({ field: 'phone', value: query, source: 'query' });
    } else if (queryType === 'name') {
      profile.name = query;
      sourceBreakdown.push({ field: 'name', value: query, source: 'query' });
    }

    // Process HubSpot data
    if (sources.hubspot?.data?.contact) {
      const contact = sources.hubspot.data.contact;
      hasRealData = true;
      
      if (contact.id) {
        profile.contactId = contact.id;
        sourceBreakdown.push({ field: 'contactId', value: contact.id, source: 'hubspot' });
      }

      if (contact.properties) {
        const props = contact.properties;
        
        if (props.email && !profile.email) {
          profile.email = props.email;
          sourceBreakdown.push({ field: 'email', value: props.email, source: 'hubspot' });
        }

        if (props.phone && !profile.phone) {
          profile.phone = props.phone;
          sourceBreakdown.push({ field: 'phone', value: props.phone, source: 'hubspot' });
        }

        if (props.firstname && !profile.firstName) {
          profile.firstName = props.firstname;
          sourceBreakdown.push({ field: 'firstName', value: props.firstname, source: 'hubspot' });
        }

        if (props.lastname && !profile.lastName) {
          profile.lastName = props.lastname;
          sourceBreakdown.push({ field: 'lastName', value: props.lastname, source: 'hubspot' });
        }

        if ((props.firstname || props.lastname) && !profile.name) {
          profile.name = `${props.firstname || ''} ${props.lastname || ''}`.trim();
          sourceBreakdown.push({ field: 'name', value: profile.name, source: 'hubspot' });
        }

        if (props.company) {
          profile.company = props.company;
          sourceBreakdown.push({ field: 'company', value: props.company, source: 'hubspot' });
        }

        if (props.jobtitle) {
          profile.jobTitle = props.jobtitle;
          sourceBreakdown.push({ field: 'jobTitle', value: props.jobtitle, source: 'hubspot' });
        }
      }
    }

    // Process Chargebee data
    if (sources.chargebee?.data?.customer) {
      const customer = sources.chargebee.data.customer;
      hasRealData = true;
      
      if (customer.id) {
        profile.customerId = customer.id;
        sourceBreakdown.push({ field: 'customerId', value: customer.id, source: 'chargebee' });
      }

      if (sources.chargebee.data.subscription) {
        const subscription = sources.chargebee.data.subscription;
        
        if (subscription.id) {
          profile.subscriptionId = subscription.id;
          sourceBreakdown.push({ field: 'subscriptionId', value: subscription.id, source: 'chargebee' });
        }

        if (subscription.status) {
          profile.subscriptionStatus = subscription.status;
          sourceBreakdown.push({ field: 'subscriptionStatus', value: subscription.status, source: 'chargebee' });
        }

        if (subscription.plan_id) {
          const planName = this.formatPlanName(subscription.plan_id);
          profile.plan = planName;
          sourceBreakdown.push({ field: 'plan', value: planName, source: 'chargebee' });
        } else if (subscription.subscription_items && subscription.subscription_items.length > 0) {
          // Extract plan from subscription items (Chargebee v2 API structure)
          const planItem = subscription.subscription_items.find((item: any) => item.item_type === 'plan');
          if (planItem && planItem.item_price_id) {
            const planName = this.formatPlanName(planItem.item_price_id);
            profile.plan = planName;
            sourceBreakdown.push({ field: 'plan', value: planName, source: 'chargebee' });
          }
        }
      }

      if (customer.first_name && !profile.firstName) {
        profile.firstName = customer.first_name;
        sourceBreakdown.push({ field: 'firstName', value: customer.first_name, source: 'chargebee' });
      }

      if (customer.last_name && !profile.lastName) {
        profile.lastName = customer.last_name;
        sourceBreakdown.push({ field: 'lastName', value: customer.last_name, source: 'chargebee' });
      }

      if (customer.email && !profile.email) {
        profile.email = customer.email;
        sourceBreakdown.push({ field: 'email', value: customer.email, source: 'chargebee' });
      }

      if ((customer.first_name || customer.last_name) && !profile.name) {
        profile.name = `${customer.first_name || ''} ${customer.last_name || ''}`.trim();
        sourceBreakdown.push({ field: 'name', value: profile.name, source: 'chargebee' });
      }
    }

    // Process Firebase data - FIRESTORE ONLY (SIMPLE)
    if (sources.firebase?.data?.user) {
      const firebaseUser = sources.firebase.data.user;
      hasRealData = true;
      
      // Set userId from Firebase UID
      if (firebaseUser.uid) {
        profile.userId = firebaseUser.uid;
        sourceBreakdown.push({ field: 'userId', value: firebaseUser.uid, source: 'firebase' });
      }
      
      // Extract email from Firebase if not already set
      if (firebaseUser.email && !profile.email) {
        profile.email = firebaseUser.email;
        sourceBreakdown.push({ field: 'email', value: firebaseUser.email, source: 'firebase' });
      }
      
      // Extract emailAdress (important for user profile confirmation)
      if (firebaseUser.emailAdress) {
        profile.emailAdress = firebaseUser.emailAdress;
        sourceBreakdown.push({ field: 'emailAdress', value: firebaseUser.emailAdress, source: 'firebase' });
      }
      
      // Extract phone from Firebase if not already set
      if (firebaseUser.phoneNumber && !profile.phone) {
        profile.phone = firebaseUser.phoneNumber;
        sourceBreakdown.push({ field: 'phone', value: firebaseUser.phoneNumber, source: 'firebase' });
      }
      
      // Extract displayName from Firebase if not already set
      if (firebaseUser.displayName && !profile.name) {
        profile.name = firebaseUser.displayName;
        sourceBreakdown.push({ field: 'name', value: firebaseUser.displayName, source: 'firebase' });
      }
      
      // Extract firstName/lastName if not already set
      if (firebaseUser.firstName && !profile.firstName) {
        profile.firstName = firebaseUser.firstName;
        sourceBreakdown.push({ field: 'firstName', value: firebaseUser.firstName, source: 'firebase' });
      }
      
      if (firebaseUser.lastName && !profile.lastName) {
        profile.lastName = firebaseUser.lastName;
        sourceBreakdown.push({ field: 'lastName', value: firebaseUser.lastName, source: 'firebase' });
      }
      
      // Medical/App specific data - FIREBASE UNIQUE FEATURES
      if (firebaseUser.planStatus) {
        profile.planStatus = firebaseUser.planStatus;
        sourceBreakdown.push({ field: 'planStatus', value: firebaseUser.planStatus, source: 'firebase' });
      }
      
      if (firebaseUser.medicalPlan) {
        profile.medicalPlan = firebaseUser.medicalPlan;
        sourceBreakdown.push({ field: 'medicalPlan', value: firebaseUser.medicalPlan, source: 'firebase' });
      }
      
      if (firebaseUser.medicine && Array.isArray(firebaseUser.medicine)) {
        profile.medicine = firebaseUser.medicine;
        profile.medicineCount = firebaseUser.medicine.length;
        sourceBreakdown.push({ field: 'medicine', value: `${firebaseUser.medicine.length} medications`, source: 'firebase' });
      }
      
      if (firebaseUser.allergies && Array.isArray(firebaseUser.allergies)) {
        profile.allergies = firebaseUser.allergies;
        sourceBreakdown.push({ field: 'allergies', value: `${firebaseUser.allergies.length} allergies`, source: 'firebase' });
      }
      
      if (firebaseUser.emergencyContact) {
        profile.emergencyContact = firebaseUser.emergencyContact;
        sourceBreakdown.push({ field: 'emergencyContact', value: `${firebaseUser.emergencyContact.name}`, source: 'firebase' });
      }
      
      if (firebaseUser.selfSupplyLogs && Array.isArray(firebaseUser.selfSupplyLogs)) {
        profile.selfSupplyLogs = firebaseUser.selfSupplyLogs;
        sourceBreakdown.push({ field: 'selfSupplyLogs', value: `${firebaseUser.selfSupplyLogs.length} entries`, source: 'firebase' });
      }
      
      if (firebaseUser.lastAppointment) {
        profile.lastAppointment = firebaseUser.lastAppointment;
        sourceBreakdown.push({ field: 'lastAppointment', value: `${firebaseUser.lastAppointment.date || firebaseUser.lastAppointment.datetime}`, source: 'firebase' });
      }
      
      if (firebaseUser.nextAppointment) {
        profile.nextAppointment = firebaseUser.nextAppointment;
        sourceBreakdown.push({ field: 'nextAppointment', value: `${firebaseUser.nextAppointment.date || firebaseUser.nextAppointment.datetime}`, source: 'firebase' });
      }
      
      // NEW REQUIRED FIELDS: treatments and healthSummary
      if (firebaseUser.treatments && Array.isArray(firebaseUser.treatments)) {
        profile.treatments = firebaseUser.treatments;
        sourceBreakdown.push({ field: 'treatments', value: `${firebaseUser.treatments.length} treatments`, source: 'firebase' });
      }
      
      if (firebaseUser.healthSummary) {
        profile.healthSummary = firebaseUser.healthSummary;
        sourceBreakdown.push({ field: 'healthSummary', value: 'Health summary available', source: 'firebase' });
      }
    }

    // Add error information for sources that failed
    Object.entries(sources).forEach(([source, response]) => {
      if (response.error) {
        sourceBreakdown.push({ field: 'error', value: response.error, source: source });
      }
    });

    profile.sourceBreakdown = sourceBreakdown;

    if (!hasRealData) {
      throw new Error(`No real data available for user: ${query}`);
    }

    return profile;
  }

  /**
   * Convert Chargebee item_price_id to human-readable plan name
   */
  private formatPlanName(itemPriceId: string): string {
    // Map of known plan IDs to readable names
    const planNameMap: { [key: string]: string } = {
      'clivi-zero-ozempic-1mg-MXN-Monthly': 'Plan Zero + Ozempic 1mg Mensual',
      'zero-pro-wegovy-050-MXN-Monthly': 'Zero Pro + Wegovy 0.5mg Mensual',
      'clivi-zero-pro-b2c-MXN-Monthly': 'Clivi Zero Pro B2C Mensual',
      'clivi-zero-pro-b2c-MXN-Yearly': 'Clivi Zero Pro B2C Anual'
    };

    return planNameMap[itemPriceId] || itemPriceId;
  }

  async getHealth(): Promise<string> {
    return 'MCP Orchestrator is healthy! 🚀';
  }
}

// Create singleton instance
export const userProfileService = new UserProfileService();
