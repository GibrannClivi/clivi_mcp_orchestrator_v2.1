/**
 * Utility functions for detecting query types and validating inputs
 */
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export type QueryType = 'email' | 'phone' | 'name';

/**
 * Detecta el tipo de consulta basado en las reglas del proyecto mejoradas:
 * - Email → contiene @
 * - Teléfono → numérico, con prefijo +, o formatos con puntos/guiones/paréntesis
 * - Nombre → texto sin @ ni números
 */
export function detectQueryType(query: string): QueryType {
  const trimmedQuery = query.trim();
  
  // Email detection
  if (trimmedQuery.includes('@')) {
    return 'email';
  }
  
  // Phone detection - improved regex to catch more formats
  // Matches: +1234567890, 1234567890, (555) 123-4567, 555.123.4567, etc.
  const phoneRegex = /^[\+]?[\d\s\-\.\(\)]+$/;
  const cleanQuery = trimmedQuery.replace(/[\+\-\(\)\s\.]/g, '');
  
  if (phoneRegex.test(trimmedQuery) && cleanQuery.length >= 7 && /^\d+$/.test(cleanQuery)) {
    return 'phone';
  }
  
  // Name by default (text without @ or phone patterns)
  return 'name';
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number using libphonenumber-js
 */
export function validatePhone(phone: string): boolean {
  try {
    // Try to parse with default country (US) for better validation
    return isValidPhoneNumber(phone, 'US');
  } catch {
    // Fallback: basic format validation
    const cleanPhone = phone.replace(/[\+\-\(\)\s]/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15 && /^\d+$/.test(cleanPhone);
  }
}

/**
 * Validate name (improved validation with better flexibility)
 */
export function validateName(name: string): boolean {
  const trimmed = name.trim();
  // Allow names as short as 1 character, useful for testing and single names
  return trimmed.length >= 1 && trimmed.length <= 200;
}

/**
 * Normalize phone number to E164 format with improved cleaning
 */
export function normalizePhone(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumber(phone, 'US');
    return phoneNumber?.format('E.164') || phone;
  } catch {
    // Fallback: clean the number but keep it as is, handle more formats
    let cleaned = phone.replace(/[\-\(\)\s\.]/g, '');
    // Add + prefix if not present for international format
    if (!cleaned.startsWith('+') && cleaned.length >= 10) {
      cleaned = '+1' + cleaned;
    }
    return cleaned;
  }
}

/**
 * Normalize the query based on its type
 */
export function normalizeQuery(query: string, queryType: QueryType): string {
  const trimmedQuery = query.trim();
  
  switch (queryType) {
    case 'email':
      return trimmedQuery.toLowerCase();
    case 'phone':
      return normalizePhone(trimmedQuery);
    case 'name':
      // Keep original casing for better name matching, normalize spaces
      return trimmedQuery
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .trim();
    default:
      return trimmedQuery;
  }
}

/**
 * Create normalized search variants for name matching
 * Helps with case-insensitive searches
 */
export function createNameSearchVariants(name: string): string[] {
  const normalized = name.trim().replace(/\s+/g, ' ');
  const variants = [
    normalized, // Original case
    normalized.toLowerCase(), // All lowercase
    normalized.toUpperCase(), // All uppercase
    normalized.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' '), // Title case
  ];
  
  // Remove duplicates and return
  return [...new Set(variants)];
}

/**
 * Validate query based on its type
 */
export function validateQuery(query: string, queryType: QueryType): boolean {
  switch (queryType) {
    case 'email':
      return validateEmail(query);
    case 'phone':
      return validatePhone(query);
    case 'name':
      return validateName(query);
    default:
      return false;
  }
}
