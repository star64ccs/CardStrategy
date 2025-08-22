/* global jest, describe, it, expect, beforeEach, afterEach */
import { privacyService } from '@/services/privacyService';
import { apiService } from '@/services/apiService';
import { storage } from '@/utils/storage';
import { logger } from '@/utils/logger';
import { validationService } from '@/utils/validationService';
import { createMockPrivacyPreferences } from '@/__tests__/setup/test-utils';

// Mock dependencies
jest.mock('@/services/apiService');
jest.mock('@/utils/storage');
jest.mock('@/utils/logger');
jest.mock('@/utils/validationService');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockStorage = storage as jest.Mocked<typeof storage>;
const mockLogger = logger as jest.Mocked<typeof logger>;
const mockValidationService = validationService as jest.Mocked<
  typeof validationService
>;

describe('PrivacyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPrivacyPreferences', () => {
    it('should fetch privacy preferences successfully', async () => {
      const mockPreferences = createMockPrivacyPreferences();
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockPreferences,
      });

      const result = await privacyService.getPrivacyPreferences('user-123');

      expect(mockApiService.get).toHaveBeenCalledWith(
        '/privacy/preferences/user-123'
      );
      expect(result).toEqual(mockPreferences);
    });

    it('should handle API errors', async () => {
      mockApiService.get.mockRejectedValue(new Error('API Error'));

      await expect(
        privacyService.getPrivacyPreferences('user-123')
      ).rejects.toThrow('API Error');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('updatePrivacyPreferences', () => {
    it('should update privacy preferences successfully', async () => {
      const mockPreferences = createMockPrivacyPreferences();
      const updateData = { region: 'US' as const };
      mockApiService.put.mockResolvedValue({
        success: true,
        data: { ...mockPreferences, ...updateData },
      });

      const result = await privacyService.updatePrivacyPreferences(
        'user-123',
        updateData
      );

      expect(mockApiService.put).toHaveBeenCalledWith(
        '/privacy/preferences/user-123',
        updateData
      );
      expect(result.region).toBe('US');
    });

    it('should validate input data', async () => {
      const invalidData = { region: 'INVALID' };
      mockValidationService.validatePrivacyPreferences.mockReturnValue({
        isValid: false,
        errors: ['Invalid region'],
      });

      await expect(
        privacyService.updatePrivacyPreferences('user-123', invalidData)
      ).rejects.toThrow();
      expect(
        mockValidationService.validatePrivacyPreferences
      ).toHaveBeenCalledWith(invalidData);
    });
  });

  describe('recordConsent', () => {
    it('should record consent successfully', async () => {
      const consentData = {
        type: 'marketing' as const,
        purpose: 'email_marketing' as const,
        legalBasis: 'consent' as const,
        granted: true,
        timestamp: new Date().toISOString(),
      };

      mockApiService.post.mockResolvedValue({
        success: true,
        data: { id: 'consent-1', ...consentData },
      });

      const result = await privacyService.recordConsent(
        'user-123',
        consentData
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/privacy/consent/user-123',
        consentData
      );
      expect(result.id).toBe('consent-1');
    });
  });

  describe('withdrawConsent', () => {
    it('should withdraw consent successfully', async () => {
      const consentId = 'consent-1';
      mockApiService.delete.mockResolvedValue({
        success: true,
        data: { id: consentId, withdrawn: true },
      });

      const result = await privacyService.withdrawConsent(
        'user-123',
        consentId
      );

      expect(mockApiService.delete).toHaveBeenCalledWith(
        `/privacy/consent/user-123/${consentId}`
      );
      expect(result.withdrawn).toBe(true);
    });
  });

  describe('submitDataRightsRequest', () => {
    it('should submit data rights request successfully', async () => {
      const requestData = {
        type: 'access' as const,
        description: 'Request access to my data',
        priority: 'medium' as const,
      };

      mockApiService.post.mockResolvedValue({
        success: true,
        data: { id: 'request-1', status: 'pending', ...requestData },
      });

      const result = await privacyService.submitDataRightsRequest(
        'user-123',
        requestData
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/privacy/rights/user-123',
        requestData
      );
      expect(result.id).toBe('request-1');
      expect(result.status).toBe('pending');
    });
  });

  describe('verifyAge', () => {
    it('should verify age successfully', async () => {
      const ageData = {
        birthDate: '1990-01-01',
        verificationMethod: 'document' as const,
      };

      mockApiService.post.mockResolvedValue({
        success: true,
        data: { verified: true, age: 34 },
      });

      const result = await privacyService.verifyAge('user-123', ageData);

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/privacy/age-verification/user-123',
        ageData
      );
      expect(result.verified).toBe(true);
      expect(result.age).toBe(34);
    });
  });

  describe('exportUserData', () => {
    it('should export user data successfully', async () => {
      const exportData = {
        format: 'json' as const,
        includeHistory: true,
      };

      mockApiService.post.mockResolvedValue({
        success: true,
        data: { downloadUrl: 'https://example.com/export.zip' },
      });

      const result = await privacyService.exportUserData(
        'user-123',
        exportData
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/privacy/export/user-123',
        exportData
      );
      expect(result.downloadUrl).toBe('https://example.com/export.zip');
    });
  });

  describe('deleteUserData', () => {
    it('should delete user data successfully', async () => {
      const deleteData = {
        reason: 'account_closure' as const,
        confirmation: true,
      };

      mockApiService.delete.mockResolvedValue({
        success: true,
        data: { deleted: true, timestamp: new Date().toISOString() },
      });

      const result = await privacyService.deleteUserData(
        'user-123',
        deleteData
      );

      expect(mockApiService.delete).toHaveBeenCalledWith(
        '/privacy/data/user-123',
        { data: deleteData }
      );
      expect(result.deleted).toBe(true);
    });
  });

  describe('checkPrivacyCompliance', () => {
    it('should check privacy compliance successfully', async () => {
      const region = 'CN' as const;
      mockApiService.post.mockResolvedValue({
        success: true,
        data: {
          compliant: true,
          score: 95,
          issues: [],
          recommendations: [],
        },
      });

      const result = await privacyService.checkPrivacyCompliance(
        'user-123',
        region
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/privacy/compliance/user-123',
        { region }
      );
      expect(result.compliant).toBe(true);
      expect(result.score).toBe(95);
    });
  });

  describe('savePrivacyPreferencesLocally', () => {
    it('should save preferences to local storage', async () => {
      const preferences = createMockPrivacyPreferences();
      mockStorage.setItem.mockResolvedValue();

      await privacyService.savePrivacyPreferencesLocally(
        'user-123',
        preferences
      );

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'privacy_preferences_user-123',
        JSON.stringify(preferences)
      );
    });
  });

  describe('getPrivacyPreferencesLocally', () => {
    it('should retrieve preferences from local storage', async () => {
      const preferences = createMockPrivacyPreferences();
      mockStorage.getItem.mockResolvedValue(JSON.stringify(preferences));

      const result =
        await privacyService.getPrivacyPreferencesLocally('user-123');

      expect(mockStorage.getItem).toHaveBeenCalledWith(
        'privacy_preferences_user-123'
      );
      expect(result).toEqual(preferences);
    });

    it('should return null if no preferences found', async () => {
      mockStorage.getItem.mockResolvedValue(null);

      const result =
        await privacyService.getPrivacyPreferencesLocally('user-123');

      expect(result).toBeNull();
    });
  });

  describe('calculateDeadline', () => {
    it('should calculate deadline for data rights request', () => {
      const requestDate = new Date('2024-01-01');
      const deadline = privacyService.calculateDeadline(requestDate, 'CN');

      expect(deadline).toBeInstanceOf(Date);
      expect(deadline.getTime()).toBeGreaterThan(requestDate.getTime());
    });
  });

  describe('getUserRegion', () => {
    it('should detect user region from IP', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: { region: 'US', country: 'United States' },
      });

      const result = await privacyService.getUserRegion();

      expect(mockApiService.get).toHaveBeenCalledWith('/privacy/region');
      expect(result).toBe('US');
    });
  });

  describe('checkConsentRenewal', () => {
    it('should check if consent needs renewal', async () => {
      const preferences = createMockPrivacyPreferences();
      mockApiService.post.mockResolvedValue({
        success: true,
        data: {
          needsRenewal: true,
          expiredConsents: ['marketing'],
          renewalDeadline: new Date().toISOString(),
        },
      });

      const result = await privacyService.checkConsentRenewal(
        'user-123',
        preferences
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        '/privacy/consent-renewal/user-123',
        preferences
      );
      expect(result.needsRenewal).toBe(true);
      expect(result.expiredConsents).toContain('marketing');
    });
  });

  describe('batchUpdateConsent', () => {
    it('should batch update multiple consents', async () => {
      const consentUpdates = [
        { type: 'marketing' as const, granted: true },
        { type: 'analytics' as const, granted: false },
      ];

      mockApiService.put.mockResolvedValue({
        success: true,
        data: { updated: 2, failed: 0 },
      });

      const result = await privacyService.batchUpdateConsent(
        'user-123',
        consentUpdates
      );

      expect(mockApiService.put).toHaveBeenCalledWith(
        '/privacy/consent/user-123/batch',
        consentUpdates
      );
      expect(result.updated).toBe(2);
      expect(result.failed).toBe(0);
    });
  });

  describe('getPrivacyDashboard', () => {
    it('should get privacy dashboard data', async () => {
      const dashboardData = {
        consentSummary: {
          total: 10,
          active: 8,
          expired: 2,
        },
        dataRightsSummary: {
          pending: 1,
          completed: 5,
        },
        complianceScore: 95,
      };

      mockApiService.get.mockResolvedValue({
        success: true,
        data: dashboardData,
      });

      const result = await privacyService.getPrivacyDashboard('user-123');

      expect(mockApiService.get).toHaveBeenCalledWith(
        '/privacy/dashboard/user-123'
      );
      expect(result).toEqual(dashboardData);
    });
  });
});
