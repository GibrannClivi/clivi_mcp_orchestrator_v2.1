/**
 * User Profile Service - Core business logic for consolidating user data
 * Implements the main getUserProfile functionality
 */
import { UserProfile, FieldSource, Appointment, Ticket, EmergencyContact } from '../graphql/types';
import { detectQueryType, normalizeQuery, validateQuery, QueryType } from '../utils/queryDetector';
import { mcpManager, MCPManager } from '../mcp/mcpManager';
import CacheManager from '../cache/cacheManager';

export class UserProfileService {
  private mcpManager: MCPManager;
  private cacheManager: CacheManager;

  constructor() {
    this.mcpManager = mcpManager;
    this.cacheManager = new CacheManager();
  }

  /**
   * Get comprehensive user profile from multiple sources
   */
  async getUserProfile(query: string): Promise<UserProfile> {
    const startTime = Date.now();
    
    // Detect query type and normalize
    const queryType = detectQueryType(query);
    const normalizedQuery = normalizeQuery(query, queryType);
    
    console.log(`Processing profile query: ${query} (type: ${queryType})`);
    
    // Validate query format (but be permissive with phone numbers for better UX)
    if (!validateQuery(normalizedQuery, queryType)) {
      // For phone numbers, be more permissive and try anyway
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
      const sources = await this.mcpManager.fetchAllSources(normalizedQuery, queryType);
      
      console.log(`Data sources used: ${Object.keys(sources).join(', ')}`);
      
      // Check if any source has real data
      const hasRealData = Object.values(sources).some(source => 
        source.data && Object.keys(source.data).length > 0
      );

      if (!hasRealData) {
        console.log('❌ No real data found in any MCP source, returning minimal profile');
        
        // Return minimal profile with only the query information if it's an email
        if (queryType === 'email') {
          const minimalProfile: UserProfile = {
            // Only set the email field if query is an email
            email: normalizedQuery,
            
            // All other fields remain undefined or empty
            name: undefined,
            firstName: undefined,
            lastName: undefined,
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
            planStatus: undefined,
            medicalPlan: undefined,
            medicine: [],
            medicineCount: 0,
            selfSupplyLogs: [],
            lastAppointment: undefined,
            nextAppointment: undefined,
            allergies: [],
            emergencyContact: undefined,
            suggestions: [],
            sourceBreakdown: [
              {
                field: 'email',
                value: normalizedQuery,
                source: 'query'
              },
              {
                field: 'status',
                value: 'no_real_data_found',
                source: 'system'
              }
            ]
          };
          
          // Cache the minimal result
          await this.cacheManager.set(cacheKey, minimalProfile);
          return minimalProfile;
        } else {
          // For non-email queries, return completely empty profile
          return await this.getFallbackProfile(normalizedQuery);
        }
      }
      
      // Consolidate data from all sources
      const profile = await this.consolidateUserProfile(sources, normalizedQuery, queryType);
      
      // Cache the result
      await this.cacheManager.set(cacheKey, profile);
      
      const endTime = Date.now();
      console.log(`✅ Profile consolidated in ${endTime - startTime}ms`);
      
      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      // Return fallback with suggestions instead of error
      console.log('⚠️ Error occurred, returning fallback with suggestions');
      return await this.getFallbackProfile(query);
    }
  }

  /**
   * Consolidate data from multiple MCP sources into a single UserProfile
   */
  private async consolidateUserProfile(sources: Record<string, any>, query: string, queryType: QueryType): Promise<UserProfile> {
    // Initialize ALL fields with default values to ensure complete schema response
    const profile: UserProfile = {
      // Basic Info (HubSpot)
      name: undefined,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      company: undefined,
      jobTitle: undefined,
      
      // Billing Info (Chargebee)
      subscriptionStatus: undefined,
      plan: undefined,
      nextBillingAmount: undefined,
      nextBillingDate: undefined,
      billingCycle: undefined,
      customerId: undefined,
      subscriptionId: undefined,
      
      // CRM Info (HubSpot)
      contactId: undefined,
      lastActivity: undefined,
      dealStage: undefined,
      leadScore: undefined,
      lastTicket: undefined,
      
      // Medical Info (Firebase)
      userId: undefined,
      planStatus: undefined,
      medicalPlan: undefined,
      medicine: [],
      medicineCount: 0,
      selfSupplyLogs: [],
      lastAppointment: undefined,
      nextAppointment: undefined,
      allergies: [],
      emergencyContact: undefined,
      
      // System Info
      sourceBreakdown: [],
      suggestions: []
    };
    
    const sourceBreakdown: FieldSource[] = [];
    let hasRealData = false;

    // Always set the email if the query is an email
    if (queryType === 'email') {
      profile.email = query;
      sourceBreakdown.push({
        field: 'email',
        value: query,
        source: 'query'
      });
    }

    // Check if we have any real data from the sources
    Object.values(sources).forEach(source => {
      if (source.data && Object.keys(source.data).length > 0) {
        hasRealData = true;
      }
    });

    // Process Chargebee data (billing info)
    if (sources.chargebee?.data) {
      const chargebeeData = sources.chargebee.data;
      
      if (chargebeeData.subscriptionStatus) {
        profile.subscriptionStatus = chargebeeData.subscriptionStatus;
        sourceBreakdown.push({
          field: 'subscriptionStatus',
          value: chargebeeData.subscriptionStatus,
          source: 'chargebee'
        });
      }
      
      if (chargebeeData.plan) {
        profile.plan = chargebeeData.plan;
        sourceBreakdown.push({
          field: 'plan',
          value: chargebeeData.plan,
          source: 'chargebee'
        });
      }
      
      if (chargebeeData.nextBillingAmount) {
        profile.nextBillingAmount = chargebeeData.nextBillingAmount;
        sourceBreakdown.push({
          field: 'nextBillingAmount',
          value: chargebeeData.nextBillingAmount.toString(),
          source: 'chargebee'
        });
      }
      
      if (chargebeeData.nextBillingDate) {
        profile.nextBillingDate = chargebeeData.nextBillingDate;
        sourceBreakdown.push({
          field: 'nextBillingDate',
          value: chargebeeData.nextBillingDate,
          source: 'chargebee'
        });
      }
      
      if (chargebeeData.billingCycle) {
        profile.billingCycle = chargebeeData.billingCycle;
        sourceBreakdown.push({
          field: 'billingCycle',
          value: chargebeeData.billingCycle,
          source: 'chargebee'
        });
      }
      
      if (chargebeeData.customerId) {
        profile.customerId = chargebeeData.customerId;
        sourceBreakdown.push({
          field: 'customerId',
          value: chargebeeData.customerId,
          source: 'chargebee'
        });
      }
      
      if (chargebeeData.subscriptionId) {
        profile.subscriptionId = chargebeeData.subscriptionId;
        sourceBreakdown.push({
          field: 'subscriptionId',
          value: chargebeeData.subscriptionId,
          source: 'chargebee'
        });
      }

      // Extract basic info from Chargebee if available
      if (chargebeeData.firstName && !profile.firstName) {
        profile.firstName = chargebeeData.firstName;
        sourceBreakdown.push({
          field: 'firstName',
          value: chargebeeData.firstName,
          source: 'chargebee'
        });
      }

      if (chargebeeData.lastName && !profile.lastName) {
        profile.lastName = chargebeeData.lastName;
        sourceBreakdown.push({
          field: 'lastName',
          value: chargebeeData.lastName,
          source: 'chargebee'
        });
      }

      if (chargebeeData.company && !profile.company) {
        profile.company = chargebeeData.company;
        sourceBreakdown.push({
          field: 'company',
          value: chargebeeData.company,
          source: 'chargebee'
        });
      }

      // Build name from firstName + lastName if not already set
      if (!profile.name && (chargebeeData.firstName || chargebeeData.lastName)) {
        const fullName = [chargebeeData.firstName, chargebeeData.lastName].filter(Boolean).join(' ');
        if (fullName) {
          profile.name = fullName;
          sourceBreakdown.push({
            field: 'name',
            value: fullName,
            source: 'chargebee'
          });
        }
      }
    }

    // Process HubSpot data (CRM info)
    if (sources.hubspot?.data) {
      const hubspotData = sources.hubspot.data;
      
      if (hubspotData.contactId) {
        profile.contactId = hubspotData.contactId;
        sourceBreakdown.push({
          field: 'contactId',
          value: hubspotData.contactId,
          source: 'hubspot'
        });
      }
      
      if (hubspotData.name) {
        profile.name = hubspotData.name;
        sourceBreakdown.push({
          field: 'name',
          value: hubspotData.name,
          source: 'hubspot'
        });
      }
      
      if (hubspotData.firstName) {
        profile.firstName = hubspotData.firstName;
        sourceBreakdown.push({
          field: 'firstName',
          value: hubspotData.firstName,
          source: 'hubspot'
        });
      }
      
      if (hubspotData.lastName) {
        profile.lastName = hubspotData.lastName;
        sourceBreakdown.push({
          field: 'lastName',
          value: hubspotData.lastName,
          source: 'hubspot'
        });
      }
      
      if (hubspotData.email) {
        profile.email = hubspotData.email;
        sourceBreakdown.push({
          field: 'email',
          value: hubspotData.email,
          source: 'hubspot'
        });
      }
      
      if (hubspotData.phone) {
        profile.phone = hubspotData.phone;
        sourceBreakdown.push({
          field: 'phone',
          value: hubspotData.phone,
          source: 'hubspot'
        });
      }
      
      if (hubspotData.company) {
        profile.company = hubspotData.company;
        sourceBreakdown.push({
          field: 'company',
          value: hubspotData.company,
          source: 'hubspot'
        });
      }
      
      if (hubspotData.jobTitle) {
        profile.jobTitle = hubspotData.jobTitle;
        sourceBreakdown.push({
          field: 'jobTitle',
          value: hubspotData.jobTitle,
          source: 'hubspot'
        });
      }
      
      if (hubspotData.lastActivity) {
        profile.lastActivity = hubspotData.lastActivity;
        sourceBreakdown.push({
          field: 'lastActivity',
          value: hubspotData.lastActivity,
          source: 'hubspot'
        });
      }
      
      if (hubspotData.dealStage) {
        profile.dealStage = hubspotData.dealStage;
        sourceBreakdown.push({
          field: 'dealStage',
          value: hubspotData.dealStage,
          source: 'hubspot'
        });
      }
      
      if (hubspotData.leadScore) {
        profile.leadScore = hubspotData.leadScore;
        sourceBreakdown.push({
          field: 'leadScore',
          value: hubspotData.leadScore.toString(),
          source: 'hubspot'
        });
      }
      
      if (hubspotData.lastTicket) {
        profile.lastTicket = hubspotData.lastTicket;
        sourceBreakdown.push({
          field: 'lastTicket',
          value: `${hubspotData.lastTicket.subject} (${hubspotData.lastTicket.status})`,
          source: 'hubspot'
        });
      }
    }

    // Process Firebase data (medical info)
    if (sources.firebase?.data) {
      const firebaseData = sources.firebase.data;
      
      if (firebaseData.userId) {
        profile.userId = firebaseData.userId;
        sourceBreakdown.push({
          field: 'userId',
          value: firebaseData.userId,
          source: 'firebase'
        });
      }
      
      if (firebaseData.planStatus) {
        profile.planStatus = firebaseData.planStatus;
        sourceBreakdown.push({
          field: 'planStatus',
          value: firebaseData.planStatus,
          source: 'firebase'
        });
      }
      
      if (firebaseData.medicalPlan) {
        profile.medicalPlan = firebaseData.medicalPlan;
        sourceBreakdown.push({
          field: 'medicalPlan',
          value: firebaseData.medicalPlan,
          source: 'firebase'
        });
      }
      
      if (firebaseData.medicine) {
        profile.medicine = firebaseData.medicine;
        profile.medicineCount = firebaseData.medicine.length;
        sourceBreakdown.push({
          field: 'medicine',
          value: `${firebaseData.medicine.length} medications`,
          source: 'firebase'
        });
      }
      
      if (firebaseData.selfSupplyLogs) {
        profile.selfSupplyLogs = firebaseData.selfSupplyLogs;
        sourceBreakdown.push({
          field: 'selfSupplyLogs',
          value: `${firebaseData.selfSupplyLogs.length} entries`,
          source: 'firebase'
        });
      }
      
      if (firebaseData.lastAppointment) {
        profile.lastAppointment = firebaseData.lastAppointment;
        sourceBreakdown.push({
          field: 'lastAppointment',
          value: `${firebaseData.lastAppointment.date} (${firebaseData.lastAppointment.status})`,
          source: 'firebase'
        });
      }
      
      if (firebaseData.nextAppointment) {
        profile.nextAppointment = firebaseData.nextAppointment;
        sourceBreakdown.push({
          field: 'nextAppointment',
          value: `${firebaseData.nextAppointment.date} (${firebaseData.nextAppointment.status})`,
          source: 'firebase'
        });
      }
      
      if (firebaseData.allergies) {
        profile.allergies = firebaseData.allergies;
        sourceBreakdown.push({
          field: 'allergies',
          value: `${firebaseData.allergies.length} allergies`,
          source: 'firebase'
        });
      }
      
      if (firebaseData.emergencyContact) {
        profile.emergencyContact = firebaseData.emergencyContact;
        sourceBreakdown.push({
          field: 'emergencyContact',
          value: `${firebaseData.emergencyContact.name} (${firebaseData.emergencyContact.relationship})`,
          source: 'firebase'
        });
      }

      // Extract basic info from Firebase if available
      if (firebaseData.displayName && !profile.name) {
        profile.name = firebaseData.displayName;
        sourceBreakdown.push({
          field: 'name',
          value: firebaseData.displayName,
          source: 'firebase'
        });
      }

      if (firebaseData.email && !profile.email) {
        profile.email = firebaseData.email;
        sourceBreakdown.push({
          field: 'email',
          value: firebaseData.email,
          source: 'firebase'
        });
      }

      // Add missing fields from Firebase with proper mapping
      if (firebaseData.uid && !profile.userId) {
        profile.userId = firebaseData.uid;
        sourceBreakdown.push({
          field: 'userId',
          value: firebaseData.uid,
          source: 'firebase'
        });
      }

      // Ensure medicineCount is calculated if medicine exists
      if (firebaseData.medicine && !profile.medicineCount) {
        const count = Array.isArray(firebaseData.medicine) ? firebaseData.medicine.length : 1;
        profile.medicineCount = count;
        sourceBreakdown.push({
          field: 'medicineCount',
          value: count.toString(),
          source: 'firebase'
        });
      }
    }

    // Handle errors from sources (include them in source breakdown for debugging)
    Object.entries(sources).forEach(([source, response]) => {
      if (response.error) {
        sourceBreakdown.push({
          field: 'error',
          value: response.error,
          source: source
        });
      }
    });

    // Always include source breakdown
    profile.sourceBreakdown = sourceBreakdown;

    // If no real data was found, return fallback with suggestions
    if (!hasRealData) {
      console.log('❌ No real data found in any MCP source, providing fallback with suggestions');
      // We need the original query to provide proper fallback
      // This will be handled by the caller method
      return profile;
    }

    return profile;
  }

  /**
   * Get fallback profile for invalid or problematic queries
   * Returns completely empty profile for users not found
   */
  async getFallbackProfile(query: string): Promise<UserProfile> {
    const queryType = detectQueryType(query);
    const normalizedQuery = normalizeQuery(query, queryType);
    
    console.log(`🔄 No data found for: ${query} (type: ${queryType})`);
    
    const suggestions = this.generateSearchSuggestions(normalizedQuery, queryType);
    
    // Return complete schema with all fields initialized - no invented data
    const fallbackProfile: UserProfile = {
      // Basic Info (HubSpot)
      name: undefined,
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      phone: undefined,
      company: undefined,
      jobTitle: undefined,
      
      // Billing Info (Chargebee)
      subscriptionStatus: undefined,
      plan: undefined,
      nextBillingAmount: undefined,
      nextBillingDate: undefined,
      billingCycle: undefined,
      customerId: undefined,
      subscriptionId: undefined,
      
      // CRM Info (HubSpot)
      contactId: undefined,
      lastActivity: undefined,
      dealStage: undefined,
      leadScore: undefined,
      lastTicket: undefined,
      
      // Medical Info (Firebase)
      userId: undefined,
      planStatus: undefined,
      medicalPlan: undefined,
      medicine: [],
      medicineCount: 0,
      selfSupplyLogs: [],
      lastAppointment: undefined,
      nextAppointment: undefined,
      allergies: [],
      emergencyContact: undefined,
      
      // System Info
      suggestions: suggestions,
      sourceBreakdown: [
        {
          field: 'search_query',
          value: normalizedQuery,
          source: 'system'
        },
        {
          field: 'search_type',
          value: queryType,
          source: 'system'
        },
        {
          field: 'status',
          value: 'not_found',
          source: 'system'
        },
        {
          field: 'suggestions',
          value: suggestions.join(', '),
          source: 'system'
        }
      ]
    };

    return fallbackProfile;
  }

  /**
   * Generate helpful search suggestions when user is not found
   */
  private generateSearchSuggestions(query: string, queryType: QueryType): string[] {
    const suggestions: string[] = [];
    
    switch (queryType) {
      case 'name':
        suggestions.push('Intenta usar el email del usuario (ej: usuario@ejemplo.com)');
        suggestions.push('Intenta usar el número de teléfono (ej: +52 555 123 4567)');
        suggestions.push('Verifica que el nombre esté completo y bien escrito');
        break;
        
      case 'email':
        suggestions.push('Verifica que el email esté bien escrito');
        suggestions.push('Intenta usar el nombre completo del usuario');
        suggestions.push('Intenta usando el número de teléfono registrado');
        break;
        
      case 'phone':
        suggestions.push('Verifica el formato del teléfono (incluye código de país)');
        suggestions.push('Intenta usar el email del usuario');
        suggestions.push('Intenta usando el nombre completo del usuario');
        break;
    }
    
    return suggestions;
  }

  /**
   * Get health status
   */
  async getHealth(): Promise<string> {
    return 'MCP Orchestrator is healthy! 🚀';
  }
}

// Export singleton instance
export const userProfileService = new UserProfileService();
