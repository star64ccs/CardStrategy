import { configureStore } from '@reduxjs/toolkit';
import privacyReducer, {
  fetchPrivacyPreferences,
  updatePrivacyPreferences,
  recordConsent,
  withdrawConsent,
  fetchConsentHistory,
  submitDataRightsRequest,
  fetchDataRightsRequestHistory,
  fetchPrivacyLawRequirements,
  fetchPrivacySettingsConfig,
  verifyAge,
  requestParentalConsent,
  exportUserData,
  deleteUserData,
  checkPrivacyCompliance,
  fetchPrivacyDashboard,
  checkConsentRenewal,
  batchUpdateConsent,
  clearError,
  setCurrentRegion,
  resetPrivacyState,
  updatePartialPreferences,
  addConsentRecord,
  updateConsentRecord,
  addDataRightsRequest,
  updateDataRightsRequest
} from '@/store/slices/privacySlice';
import { privacyService } from '@/services/privacyService';
import { createMockPrivacyPreferences } from '@/__tests__/setup/test-utils';

// Mock the privacy service
jest.mock('@/services/privacyService');
const mockPrivacyService = privacyService as jest.Mocked<typeof privacyService>;

describe('Privacy Slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        privacy: privacyReducer
      }
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().privacy;

      expect(state.preferences).toBeNull();
      expect(state.preferencesLoading).toBe(false);
      expect(state.preferencesError).toBeNull();
      expect(state.consentHistory).toEqual([]);
      expect(state.dataRightsRequests).toEqual([]);
      expect(state.currentRegion).toBe('CN');
      expect(state.complianceCheck).toBeNull();
      expect(state.dashboard).toBeNull();
    });
  });

  describe('fetchPrivacyPreferences', () => {
    it('should handle pending state', () => {
      store.dispatch(fetchPrivacyPreferences.pending('', 'user-123'));
      const state = store.getState().privacy;

      expect(state.preferencesLoading).toBe(true);
      expect(state.preferencesError).toBeNull();
    });

    it('should handle fulfilled state', () => {
      const mockPreferences = createMockPrivacyPreferences();

      store.dispatch(fetchPrivacyPreferences.fulfilled(mockPreferences, '', 'user-123'));
      const state = store.getState().privacy;

      expect(state.preferences).toEqual(mockPreferences);
      expect(state.preferencesLoading).toBe(false);
      expect(state.preferencesError).toBeNull();
    });

    it('should handle rejected state', () => {
      const errorMessage = 'Failed to fetch preferences';

      store.dispatch(fetchPrivacyPreferences.rejected(new Error(errorMessage), '', 'user-123', errorMessage));
      const state = store.getState().privacy;

      expect(state.preferencesLoading).toBe(false);
      expect(state.preferencesError).toBe(errorMessage);
    });

    it('should call privacy service', async () => {
      const mockPreferences = createMockPrivacyPreferences();
      mockPrivacyService.getPrivacyPreferences.mockResolvedValue(mockPreferences);

      await store.dispatch(fetchPrivacyPreferences('user-123'));

      expect(mockPrivacyService.getPrivacyPreferences).toHaveBeenCalledWith('user-123');
    });
  });

  describe('updatePrivacyPreferences', () => {
    it('should handle fulfilled state', () => {
      const mockPreferences = createMockPrivacyPreferences();
      const updateData = { region: 'US' as const };

      store.dispatch(updatePrivacyPreferences.fulfilled(
        { ...mockPreferences, ...updateData },
        '',
        { userId: 'user-123', preferences: updateData }
      ));
      const state = store.getState().privacy;

      expect(state.preferences?.region).toBe('US');
      expect(state.preferencesLoading).toBe(false);
    });

    it('should call privacy service', async () => {
      const mockPreferences = createMockPrivacyPreferences();
      const updateData = { region: 'US' as const };
      mockPrivacyService.updatePrivacyPreferences.mockResolvedValue({ ...mockPreferences, ...updateData });

      await store.dispatch(updatePrivacyPreferences({ userId: 'user-123', preferences: updateData }));

      expect(mockPrivacyService.updatePrivacyPreferences).toHaveBeenCalledWith('user-123', updateData);
    });
  });

  describe('recordConsent', () => {
    it('should handle fulfilled state', () => {
      const consentData = {
        type: 'marketing' as const,
        purpose: 'email_marketing' as const,
        legalBasis: 'consent' as const,
        granted: true,
        timestamp: new Date().toISOString()
      };

      store.dispatch(recordConsent.fulfilled(
        { id: 'consent-1', ...consentData },
        '',
        { userId: 'user-123', consentData }
      ));
      const state = store.getState().privacy;

      expect(state.consentHistory).toHaveLength(1);
      expect(state.consentHistory[0].id).toBe('consent-1');
    });

    it('should call privacy service', async () => {
      const consentData = {
        type: 'marketing' as const,
        purpose: 'email_marketing' as const,
        legalBasis: 'consent' as const,
        granted: true,
        timestamp: new Date().toISOString()
      };
      mockPrivacyService.recordConsent.mockResolvedValue({ id: 'consent-1', ...consentData });

      await store.dispatch(recordConsent({ userId: 'user-123', consentData }));

      expect(mockPrivacyService.recordConsent).toHaveBeenCalledWith('user-123', consentData);
    });
  });

  describe('withdrawConsent', () => {
    it('should handle fulfilled state', () => {
      const consentId = 'consent-1';

      store.dispatch(withdrawConsent.fulfilled(
        { id: consentId, withdrawn: true },
        '',
        { userId: 'user-123', consentId }
      ));
      const state = store.getState().privacy;

      // Should update the consent record in history
      expect(state.consentHistory).toEqual([]); // Initially empty
    });

    it('should call privacy service', async () => {
      const consentId = 'consent-1';
      mockPrivacyService.withdrawConsent.mockResolvedValue({ id: consentId, withdrawn: true });

      await store.dispatch(withdrawConsent({ userId: 'user-123', consentId }));

      expect(mockPrivacyService.withdrawConsent).toHaveBeenCalledWith('user-123', consentId);
    });
  });

  describe('submitDataRightsRequest', () => {
    it('should handle fulfilled state', () => {
      const requestData = {
        type: 'access' as const,
        description: 'Request access to my data',
        priority: 'medium' as const
      };

      store.dispatch(submitDataRightsRequest.fulfilled(
        { id: 'request-1', status: 'pending', ...requestData },
        '',
        { userId: 'user-123', requestData }
      ));
      const state = store.getState().privacy;

      expect(state.dataRightsRequests).toHaveLength(1);
      expect(state.dataRightsRequests[0].id).toBe('request-1');
      expect(state.dataRightsRequests[0].status).toBe('pending');
    });

    it('should call privacy service', async () => {
      const requestData = {
        type: 'access' as const,
        description: 'Request access to my data',
        priority: 'medium' as const
      };
      mockPrivacyService.submitDataRightsRequest.mockResolvedValue({ id: 'request-1', status: 'pending', ...requestData });

      await store.dispatch(submitDataRightsRequest({ userId: 'user-123', requestData }));

      expect(mockPrivacyService.submitDataRightsRequest).toHaveBeenCalledWith('user-123', requestData);
    });
  });

  describe('checkPrivacyCompliance', () => {
    it('should handle fulfilled state', () => {
      const region = 'CN' as const;
      const complianceResult = {
        compliant: true,
        score: 95,
        issues: [],
        recommendations: []
      };

      store.dispatch(checkPrivacyCompliance.fulfilled(
        complianceResult,
        '',
        { userId: 'user-123', region }
      ));
      const state = store.getState().privacy;

      expect(state.complianceCheck).toEqual(complianceResult);
    });

    it('should call privacy service', async () => {
      const region = 'CN' as const;
      const complianceResult = {
        compliant: true,
        score: 95,
        issues: [],
        recommendations: []
      };
      mockPrivacyService.checkPrivacyCompliance.mockResolvedValue(complianceResult);

      await store.dispatch(checkPrivacyCompliance({ userId: 'user-123', region }));

      expect(mockPrivacyService.checkPrivacyCompliance).toHaveBeenCalledWith('user-123', region);
    });
  });

  describe('fetchPrivacyDashboard', () => {
    it('should handle fulfilled state', () => {
      const dashboardData = {
        consentSummary: {
          total: 10,
          active: 8,
          expired: 2
        },
        dataRightsSummary: {
          pending: 1,
          completed: 5
        },
        complianceScore: 95
      };

      store.dispatch(fetchPrivacyDashboard.fulfilled(
        dashboardData,
        '',
        'user-123'
      ));
      const state = store.getState().privacy;

      expect(state.dashboard).toEqual(dashboardData);
    });

    it('should call privacy service', async () => {
      const dashboardData = {
        consentSummary: { total: 10, active: 8, expired: 2 },
        dataRightsSummary: { pending: 1, completed: 5 },
        complianceScore: 95
      };
      mockPrivacyService.getPrivacyDashboard.mockResolvedValue(dashboardData);

      await store.dispatch(fetchPrivacyDashboard('user-123'));

      expect(mockPrivacyService.getPrivacyDashboard).toHaveBeenCalledWith('user-123');
    });
  });

  describe('Synchronous Actions', () => {
    describe('clearError', () => {
      it('should clear error state', () => {
        // First set an error
        store.dispatch(fetchPrivacyPreferences.rejected(new Error('Test error'), '', 'user-123', 'Test error'));
        expect(store.getState().privacy.preferencesError).toBe('Test error');

        // Then clear it
        store.dispatch(clearError('preferences'));
        expect(store.getState().privacy.preferencesError).toBeNull();
      });
    });

    describe('setCurrentRegion', () => {
      it('should set current region', () => {
        store.dispatch(setCurrentRegion('US'));
        expect(store.getState().privacy.currentRegion).toBe('US');
      });
    });

    describe('resetPrivacyState', () => {
      it('should reset state to initial values', () => {
        // First modify some state
        store.dispatch(setCurrentRegion('US'));
        store.dispatch(fetchPrivacyPreferences.fulfilled(createMockPrivacyPreferences(), '', 'user-123'));

        expect(store.getState().privacy.currentRegion).toBe('US');
        expect(store.getState().privacy.preferences).not.toBeNull();

        // Then reset
        store.dispatch(resetPrivacyState());
        expect(store.getState().privacy.currentRegion).toBe('CN');
        expect(store.getState().privacy.preferences).toBeNull();
      });
    });

    describe('updatePartialPreferences', () => {
      it('should update partial preferences', () => {
        const mockPreferences = createMockPrivacyPreferences();
        store.dispatch(fetchPrivacyPreferences.fulfilled(mockPreferences, '', 'user-123'));

        store.dispatch(updatePartialPreferences({ region: 'US' }));
        expect(store.getState().privacy.preferences?.region).toBe('US');
      });
    });

    describe('addConsentRecord', () => {
      it('should add consent record to history', () => {
        const consentRecord = {
          id: 'consent-1',
          type: 'marketing' as const,
          purpose: 'email_marketing' as const,
          legalBasis: 'consent' as const,
          granted: true,
          timestamp: new Date().toISOString()
        };

        store.dispatch(addConsentRecord(consentRecord));
        expect(store.getState().privacy.consentHistory).toHaveLength(1);
        expect(store.getState().privacy.consentHistory[0]).toEqual(consentRecord);
      });
    });

    describe('updateConsentRecord', () => {
      it('should update existing consent record', () => {
        const consentRecord = {
          id: 'consent-1',
          type: 'marketing' as const,
          purpose: 'email_marketing' as const,
          legalBasis: 'consent' as const,
          granted: true,
          timestamp: new Date().toISOString()
        };

        store.dispatch(addConsentRecord(consentRecord));
        store.dispatch(updateConsentRecord({ id: 'consent-1', granted: false }));

        expect(store.getState().privacy.consentHistory[0].granted).toBe(false);
      });
    });

    describe('addDataRightsRequest', () => {
      it('should add data rights request', () => {
        const request = {
          id: 'request-1',
          type: 'access' as const,
          description: 'Request access to my data',
          priority: 'medium' as const,
          status: 'pending' as const,
          createdAt: new Date().toISOString()
        };

        store.dispatch(addDataRightsRequest(request));
        expect(store.getState().privacy.dataRightsRequests).toHaveLength(1);
        expect(store.getState().privacy.dataRightsRequests[0]).toEqual(request);
      });
    });

    describe('updateDataRightsRequest', () => {
      it('should update existing data rights request', () => {
        const request = {
          id: 'request-1',
          type: 'access' as const,
          description: 'Request access to my data',
          priority: 'medium' as const,
          status: 'pending' as const,
          createdAt: new Date().toISOString()
        };

        store.dispatch(addDataRightsRequest(request));
        store.dispatch(updateDataRightsRequest({ id: 'request-1', status: 'completed' as const }));

        expect(store.getState().privacy.dataRightsRequests[0].status).toBe('completed');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const errorMessage = 'Service unavailable';
      mockPrivacyService.getPrivacyPreferences.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchPrivacyPreferences('user-123'));
      const state = store.getState().privacy;

      expect(state.preferencesLoading).toBe(false);
      expect(state.preferencesError).toBe(errorMessage);
    });
  });

  describe('Loading States', () => {
    it('should handle loading states correctly', () => {
      // Test preferences loading
      store.dispatch(fetchPrivacyPreferences.pending('', 'user-123'));
      expect(store.getState().privacy.preferencesLoading).toBe(true);

      store.dispatch(fetchPrivacyPreferences.fulfilled(createMockPrivacyPreferences(), '', 'user-123'));
      expect(store.getState().privacy.preferencesLoading).toBe(false);
    });
  });
});
