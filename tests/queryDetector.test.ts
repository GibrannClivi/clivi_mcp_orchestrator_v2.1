/**
 * Tests for query detector utility
 */
import { detectQueryType, validateEmail, validatePhone, normalizeQuery } from '../src/utils/queryDetector';

describe('Query Detector', () => {
  describe('detectQueryType', () => {
    test('should detect email queries', () => {
      expect(detectQueryType('user@example.com')).toBe('email');
      expect(detectQueryType('test.user+tag@domain.co.uk')).toBe('email');
    });

    test('should detect phone queries', () => {
      expect(detectQueryType('+1234567890')).toBe('phone');
      expect(detectQueryType('1234567890')).toBe('phone');
      expect(detectQueryType('(123) 456-7890')).toBe('phone');
    });

    test('should detect name queries', () => {
      expect(detectQueryType('John Doe')).toBe('name');
      expect(detectQueryType('María García')).toBe('name');
      expect(detectQueryType('Kyle')).toBe('name');
    });
  });

  describe('validateEmail', () => {
    test('should validate correct emails', () => {
      expect(validateEmail('user@example.com')).toBe(true);
      expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    test('should reject invalid emails', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
    });
  });

  describe('normalizeQuery', () => {
    test('should normalize email queries', () => {
      expect(normalizeQuery('USER@EXAMPLE.COM', 'email')).toBe('user@example.com');
    });

    test('should normalize name queries', () => {
      expect(normalizeQuery('john doe', 'name')).toBe('John Doe');
    });
  });
});
