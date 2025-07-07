/**
 * GraphQL types for MCP Orchestrator API
 * Implements the COMPLETE schema for all available fields from MCP sources
 */

export interface Appointment {
  appointmentId?: string;
  date?: string;
  type?: string;
  doctor?: string;
  status?: string;
  location?: string;
  notes?: string;
}

export interface Ticket {
  ticketId?: string;
  subject?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
  assignedTo?: string;
}

export interface EmergencyContact {
  name?: string;
  phone?: string;
  relationship?: string;
}

export interface PaymentHistory {
  id?: string;
  status?: string;
  type?: string;
  createdAt?: string;
  total?: number;
  amount?: number;
  currency?: string;
  description?: string;
}

export interface FieldSource {
  field: string;
  value?: string;
  source: string; // "chargebee", "hubspot", "firebase"
}

export interface UserProfile {
  // Basic Info (HubSpot)
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  
  // Billing Info (Chargebee)
  subscriptionStatus?: string;
  plan?: string;
  nextBillingAmount?: number;
  nextBillingDate?: string;
  billingCycle?: string;
  customerId?: string;
  subscriptionId?: string;
  
  // CRM Info (HubSpot)
  contactId?: string;
  lastActivity?: string;
  dealStage?: string;
  leadScore?: number;
  lastTicket?: Ticket;
  
  // Medical Info from HubSpot (Fundamentales)
  planIncludedPackage?: string;
  planName?: string;
  pxInformation?: string;
  specialistsAssigned?: string;
  supplies?: string;
  lastPrescription?: string;
  zero?: string;
  
  // Payment History from HubSpot
  lastTwoPayments?: PaymentHistory[];
  paymentHistory?: PaymentHistory[];
  
  // Medical Info (Firebase)
  userId?: string;
  emailAdress?: string; // Important field from Firebase for user profile confirmation
  planStatus?: string;
  medicalPlan?: string;
  medicine?: string[];
  medicineCount?: number;
  selfSupplyLogs?: string[];
  lastAppointment?: Appointment;
  nextAppointment?: Appointment;
  allergies?: string[];
  emergencyContact?: EmergencyContact;
  treatments?: any[]; // Array of treatment objects
  healthSummary?: any; // Health summary object
  
  // System Info
  sourceBreakdown?: FieldSource[];
  suggestions?: string[];
}

export interface MCPToolInfo {
  name: string;
  description?: string;
  inputSchema?: any;
}

export interface MCPServiceHealth {
  status: 'healthy' | 'unhealthy' | 'not_connected';
  error?: string;
  timestamp?: string;
}

export interface MCPDocumentation {
  status: 'connected' | 'error' | 'not_connected';
  tools?: MCPToolInfo[];
  error?: string;
}

export interface MCPSystemInfo {
  health: Record<string, MCPServiceHealth>;
  documentation: Record<string, MCPDocumentation>;
  timestamp: string;
}

// GraphQL Schema Definition
export const typeDefs = `#graphql
  type Query {
    getUserProfile(query: String!): UserProfile
    getMCPSystemInfo: MCPSystemInfo
    health: String
  }

  type HealthSummary {
    currentWeight: String
    height: String
    bmi: String
    bloodPressure: BloodPressure
    vitalSigns: VitalSigns
    medications: [Medication]
    allergies: [AllergyDetail]
    conditions: [MedicalCondition]
    labResults: [LabResult]
    medicalHistory: MedicalHistory
    progressMetrics: ProgressMetrics
    clinicalNotes: [ClinicalNote]
  }

  type BloodPressure {
    systolic: Int
    diastolic: Int
    date: String
  }

  type VitalSigns {
    heartRate: Int
    temperature: Float
    respiratoryRate: Int
    oxygenSaturation: Int
    recordedAt: String
  }

  type Medication {
    name: String
    dosage: String
    frequency: String
    startDate: String
    prescribedBy: String
  }

  type AllergyDetail {
    substance: String
    severity: String
    reaction: String
  }

  type MedicalCondition {
    name: String
    diagnosedDate: String
    status: String
    treatingPhysician: String
  }

  type LabResult {
    testName: String
    value: String
    referenceRange: String
    date: String
    status: String
  }

  type MedicalHistory {
    surgeries: [Surgery]
    familyHistory: [FamilyHistoryItem]
    immunizations: [Immunization]
  }

  type Surgery {
    procedure: String
    date: String
    surgeon: String
  }

  type FamilyHistoryItem {
    condition: String
    relation: String
  }

  type Immunization {
    vaccine: String
    date: String
    booster: Boolean
  }

  type ProgressMetrics {
    weightLoss: WeightLossMetrics
    glucoseControl: GlucoseControlMetrics
  }

  type WeightLossMetrics {
    startingWeight: Float
    currentWeight: Float
    goalWeight: Float
    lossToDate: Float
  }

  type GlucoseControlMetrics {
    averageGlucose: Float
    hba1c: Float
    lastReading: GlucoseReading
  }

  type GlucoseReading {
    value: Float
    date: String
  }

  type ClinicalNote {
    date: String
    author: String
    note: String
    category: String
  }

  type UserProfile {
    # Basic Info (HubSpot)
    name: String
    firstName: String
    lastName: String
    email: String
    phone: String
    company: String
    jobTitle: String
    
    # Billing Info (Chargebee)
    subscriptionStatus: String
    plan: String
    nextBillingAmount: Float
    nextBillingDate: String
    billingCycle: String
    customerId: String
    subscriptionId: String
    
    # CRM Info (HubSpot)
    contactId: String
    lastActivity: String
    dealStage: String
    leadScore: Int
    lastTicket: Ticket
    
    # Medical Info from HubSpot (Fundamentales)
    planIncludedPackage: String
    planName: String
    pxInformation: String
    specialistsAssigned: String
    supplies: String
    lastPrescription: String
    zero: String
    
    # Payment History from HubSpot
    lastTwoPayments: [PaymentHistory]
    paymentHistory: [PaymentHistory]
    
    # Medical Info (Firebase)
    userId: String
    emailAdress: String
    planStatus: String
    medicalPlan: String
    medicine: [String]
    medicineCount: Int
    selfSupplyLogs: [String]
    lastAppointment: Appointment
    nextAppointment: Appointment
    allergies: [String]
    emergencyContact: EmergencyContact
    treatments: [String]
    healthSummary: HealthSummary
    
    # System Info
    sourceBreakdown: [FieldSource]
    suggestions: [String]
  }

  type Appointment {
    appointmentId: String
    date: String
    type: String
    doctor: String
    status: String
    location: String
    notes: String
  }

  type Ticket {
    ticketId: String
    subject: String
    status: String
    priority: String
    createdAt: String
    assignedTo: String
  }

  type EmergencyContact {
    name: String
    phone: String
    relationship: String
  }

  type PaymentHistory {
    id: String
    status: String
    type: String
    createdAt: String
    total: Float
    amount: Float
    currency: String
    description: String
  }

  type FieldSource {
    field: String!
    value: String
    source: String!
  }

  type MCPToolInfo {
    name: String!
    description: String
    inputSchema: String
  }

  type MCPServiceHealth {
    status: String!
    error: String
    timestamp: String
  }

  type MCPDocumentation {
    status: String!
    tools: [MCPToolInfo]
    error: String
  }

  type MCPSystemInfo {
    health: String!
    documentation: String!
    timestamp: String!
  }

  type Query {
    getUserProfile(query: String!): UserProfile
    getMCPSystemInfo: MCPSystemInfo
    health: String
  }
`;
