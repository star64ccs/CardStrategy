/* global jest, describe, it, expect, beforeEach, afterEach */
import { validationService } from '@/utils/validationService';

describe('ValidationService', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        '123@test.com',
      ];

      validEmails.forEach((email) => {
        expect(validationService.validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user..name@example.com',
        'user@example..com',
      ];

      invalidEmails.forEach((email) => {
        expect(validationService.validateEmail(email)).toBe(false);
      });
    });

    it('should handle empty or null values', () => {
      expect(validationService.validateEmail('')).toBe(false);
      expect(validationService.validateEmail(null as any)).toBe(false);
      expect(validationService.validateEmail(undefined as any)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'Password123!',
        'MySecurePass1@',
        'ComplexP@ssw0rd',
        'Str0ng#Pass',
      ];

      strongPasswords.forEach((password) => {
        const result = validationService.validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        '123456', // too short
        'password', // no uppercase, no number, no special char
        'PASSWORD', // no lowercase, no number, no special char
        'Password', // no number, no special char
        'password123', // no uppercase, no special char
        'Password123', // no special char
      ];

      weakPasswords.forEach((password) => {
        const result = validationService.validatePassword(password);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it('should provide specific error messages', () => {
      const result = validationService.validatePassword('weak');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Password must be at least 8 characters long'
      );
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      );
      expect(result.errors).toContain(
        'Password must contain at least one number'
      );
      expect(result.errors).toContain(
        'Password must contain at least one special character'
      );
    });
  });

  describe('validateUsername', () => {
    it('should validate valid usernames', () => {
      const validUsernames = [
        'user123',
        'user_name',
        'user-name',
        'userName',
        'user123name',
      ];

      validUsernames.forEach((username) => {
        expect(validationService.validateUsername(username)).toBe(true);
      });
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        'u', // too short
        'user@name', // invalid character
        'user name', // space not allowed
        'user#name', // invalid character
        'user.name', // dot not allowed
        'user_name_with_very_long_name_that_exceeds_limit', // too long
      ];

      invalidUsernames.forEach((username) => {
        expect(validationService.validateUsername(username)).toBe(false);
      });
    });
  });

  describe('validateCardName', () => {
    it('should validate card names', () => {
      const validCardNames = [
        'Blue-Eyes White Dragon',
        'Dark Magician',
        'Red-Eyes B. Dragon',
        'Summoned Skull',
        'Blue-Eyes Ultimate Dragon',
      ];

      validCardNames.forEach((name) => {
        expect(validationService.validateCardName(name)).toBe(true);
      });
    });

    it('should reject invalid card names', () => {
      const invalidCardNames = [
        '', // empty
        'A', // too short
        'A'.repeat(101), // too long
        'Card@Name', // invalid character
        'Card#Name', // invalid character
      ];

      invalidCardNames.forEach((name) => {
        expect(validationService.validateCardName(name)).toBe(false);
      });
    });
  });

  describe('validatePrice', () => {
    it('should validate valid prices', () => {
      const validPrices = [0, 10.5, 100.99, 999.99, 1000];

      validPrices.forEach((price) => {
        expect(validationService.validatePrice(price)).toBe(true);
      });
    });

    it('should reject invalid prices', () => {
      const invalidPrices = [
        -1, // negative
        -10.5, // negative
        1001, // too high
        9999.99, // too high
      ];

      invalidPrices.forEach((price) => {
        expect(validationService.validatePrice(price)).toBe(false);
      });
    });
  });

  describe('validatePrivacyPreferences', () => {
    it('should validate valid privacy preferences', () => {
      const validPreferences = {
        region: 'CN',
        language: 'zh-TW',
        termsAccepted: true,
        privacyPolicyAccepted: true,
        marketingConsent: {
          email: true,
          sms: false,
          push: true,
          thirdParty: false,
          personalized: true,
        },
        dataSharingConsent: {
          analytics: true,
          thirdParty: false,
          crossBorder: false,
        },
      };

      const result =
        validationService.validatePrivacyPreferences(validPreferences);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid privacy preferences', () => {
      const invalidPreferences = {
        region: 'INVALID', // invalid region
        language: '', // empty language
        termsAccepted: false, // must be true
        privacyPolicyAccepted: false, // must be true
        marketingConsent: {
          email: 'invalid', // should be boolean
          sms: false,
          push: true,
          thirdParty: false,
          personalized: true,
        },
      };

      const result =
        validationService.validatePrivacyPreferences(invalidPreferences);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide specific error messages for privacy preferences', () => {
      const invalidPreferences = {
        region: 'INVALID',
        termsAccepted: false,
      };

      const result =
        validationService.validatePrivacyPreferences(invalidPreferences);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid region code');
      expect(result.errors).toContain('Terms must be accepted');
    });
  });

  describe('validateFeedback', () => {
    it('should validate valid feedback', () => {
      const validFeedback = {
        type: 'bug_report',
        title: 'Test Bug Report',
        description: 'This is a detailed description of the bug',
        category: 'ui_ux',
        priority: 'medium',
      };

      const result = validationService.validateFeedback(validFeedback);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid feedback', () => {
      const invalidFeedback = {
        type: 'invalid_type',
        title: '', // empty title
        description: 'Short', // too short
        category: 'invalid_category',
        priority: 'invalid_priority',
      };

      const result = validationService.validateFeedback(invalidFeedback);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should provide specific error messages for feedback', () => {
      const invalidFeedback = {
        type: 'invalid_type',
        title: '',
        description: 'Short',
      };

      const result = validationService.validateFeedback(invalidFeedback);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid feedback type');
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain(
        'Description must be at least 10 characters long'
      );
    });
  });

  describe('validateDataRightsRequest', () => {
    it('should validate valid data rights request', () => {
      const validRequest = {
        type: 'access',
        description: 'I would like to access my personal data',
        priority: 'medium',
      };

      const result = validationService.validateDataRightsRequest(validRequest);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid data rights request', () => {
      const invalidRequest = {
        type: 'invalid_type',
        description: '', // empty description
        priority: 'invalid_priority',
      };

      const result =
        validationService.validateDataRightsRequest(invalidRequest);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateAgeVerification', () => {
    it('should validate valid age verification data', () => {
      const validAgeData = {
        birthDate: '1990-01-01',
        verificationMethod: 'document',
      };

      const result = validationService.validateAgeVerification(validAgeData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid age verification data', () => {
      const invalidAgeData = {
        birthDate: 'invalid-date',
        verificationMethod: 'invalid_method',
      };

      const result = validationService.validateAgeVerification(invalidAgeData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate minimum age requirement', () => {
      const tooYoungAgeData = {
        birthDate: '2010-01-01', // 14 years old
        verificationMethod: 'document',
      };

      const result = validationService.validateAgeVerification(tooYoungAgeData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('User must be at least 13 years old');
    });
  });

  describe('validateConsentData', () => {
    it('should validate valid consent data', () => {
      const validConsentData = {
        type: 'marketing',
        purpose: 'email_marketing',
        legalBasis: 'consent',
        granted: true,
        timestamp: new Date().toISOString(),
      };

      const result = validationService.validateConsentData(validConsentData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid consent data', () => {
      const invalidConsentData = {
        type: 'invalid_type',
        purpose: 'invalid_purpose',
        legalBasis: 'invalid_basis',
        granted: 'invalid', // should be boolean
        timestamp: 'invalid-timestamp',
      };

      const result = validationService.validateConsentData(invalidConsentData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateImageFile', () => {
    it('should validate valid image files', () => {
      const validImages = [
        { name: 'test.jpg', size: 1024 * 1024, type: 'image/jpeg' },
        { name: 'test.png', size: 2 * 1024 * 1024, type: 'image/png' },
        { name: 'test.webp', size: 500 * 1024, type: 'image/webp' },
      ];

      validImages.forEach((image) => {
        expect(validationService.validateImageFile(image)).toBe(true);
      });
    });

    it('should reject invalid image files', () => {
      const invalidImages = [
        { name: 'test.txt', size: 1024, type: 'text/plain' }, // wrong type
        { name: 'test.jpg', size: 10 * 1024 * 1024, type: 'image/jpeg' }, // too large
        { name: 'test.png', size: 100, type: 'image/png' }, // too small
      ];

      invalidImages.forEach((image) => {
        expect(validationService.validateImageFile(image)).toBe(false);
      });
    });
  });

  describe('validateRequired', () => {
    it('should validate required fields', () => {
      expect(validationService.validateRequired('test')).toBe(true);
      expect(validationService.validateRequired(123)).toBe(true);
      expect(validationService.validateRequired(true)).toBe(true);
      expect(validationService.validateRequired(false)).toBe(true);
    });

    it('should reject empty required fields', () => {
      expect(validationService.validateRequired('')).toBe(false);
      expect(validationService.validateRequired(null)).toBe(false);
      expect(validationService.validateRequired(undefined)).toBe(false);
      expect(validationService.validateRequired([])).toBe(false);
      expect(validationService.validateRequired({})).toBe(false);
    });
  });

  describe('validateLength', () => {
    it('should validate string length', () => {
      expect(validationService.validateLength('test', 1, 10)).toBe(true);
      expect(validationService.validateLength('test', 4, 4)).toBe(true);
      expect(validationService.validateLength('', 0, 10)).toBe(true);
    });

    it('should reject strings outside length range', () => {
      expect(validationService.validateLength('test', 5, 10)).toBe(false);
      expect(validationService.validateLength('test', 1, 3)).toBe(false);
      expect(validationService.validateLength('', 1, 10)).toBe(false);
    });
  });

  describe('validatePattern', () => {
    it('should validate patterns', () => {
      expect(validationService.validatePattern('test123', /^[a-z0-9]+$/)).toBe(
        true
      );
      expect(validationService.validatePattern('TEST', /^[A-Z]+$/)).toBe(true);
      expect(validationService.validatePattern('123', /^\d+$/)).toBe(true);
    });

    it('should reject patterns that do not match', () => {
      expect(validationService.validatePattern('test@123', /^[a-z0-9]+$/)).toBe(
        false
      );
      expect(validationService.validatePattern('test', /^[A-Z]+$/)).toBe(false);
      expect(validationService.validatePattern('abc', /^\d+$/)).toBe(false);
    });
  });

  describe('validateRange', () => {
    it('should validate number ranges', () => {
      expect(validationService.validateRange(5, 1, 10)).toBe(true);
      expect(validationService.validateRange(1, 1, 10)).toBe(true);
      expect(validationService.validateRange(10, 1, 10)).toBe(true);
    });

    it('should reject numbers outside range', () => {
      expect(validationService.validateRange(0, 1, 10)).toBe(false);
      expect(validationService.validateRange(11, 1, 10)).toBe(false);
      expect(validationService.validateRange(-1, 1, 10)).toBe(false);
    });
  });

  describe('validateDate', () => {
    it('should validate valid dates', () => {
      expect(validationService.validateDate('2024-01-01')).toBe(true);
      expect(validationService.validateDate('2024-12-31')).toBe(true);
      expect(validationService.validateDate('2000-02-29')).toBe(true); // leap year
    });

    it('should reject invalid dates', () => {
      expect(validationService.validateDate('invalid-date')).toBe(false);
      expect(validationService.validateDate('2024-13-01')).toBe(false); // invalid month
      expect(validationService.validateDate('2024-02-30')).toBe(false); // invalid day
      expect(validationService.validateDate('2023-02-29')).toBe(false); // not leap year
    });
  });

  describe('validateUrl', () => {
    it('should validate valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com',
        'https://example.com/path',
        'https://example.com/path?param=value',
      ];

      validUrls.forEach((url) => {
        expect(validationService.validateUrl(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ftp://example.com', // unsupported protocol
        'example.com', // missing protocol
        'https://', // missing domain
        'https://.com', // invalid domain
      ];

      invalidUrls.forEach((url) => {
        expect(validationService.validateUrl(url)).toBe(false);
      });
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate valid phone numbers', () => {
      const validPhoneNumbers = [
        '+1234567890',
        '+1-234-567-8900',
        '+1 (234) 567-8900',
        '123-456-7890',
        '(123) 456-7890',
      ];

      validPhoneNumbers.forEach((phone) => {
        expect(validationService.validatePhoneNumber(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhoneNumbers = [
        '123', // too short
        'not-a-phone',
        '+12345678901234567890', // too long
        '123-456-789', // incomplete
        '+1-234-567-89000', // too many digits
      ];

      invalidPhoneNumbers.forEach((phone) => {
        expect(validationService.validatePhoneNumber(phone)).toBe(false);
      });
    });
  });
});
