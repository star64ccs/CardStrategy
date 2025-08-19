import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import PrivacyScreen from '@/screens/PrivacyScreen';
import privacyReducer from '@/store/slices/privacySlice';
import { createMockPrivacyPreferences } from '@/__tests__/setup/test-utils';

// Mock react-redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn()
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'zh-TW' }
  })
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn()
  })
}));

const mockDispatch = jest.fn();
const mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('PrivacyScreen', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        privacy: privacyReducer
      }
    });

    mockUseDispatch.mockReturnValue(mockDispatch);
    mockUseSelector.mockImplementation((selector) =>
      selector(store.getState())
    );

    jest.clearAllMocks();
  });

  const renderPrivacyScreen = () => {
    return render(
      <Provider store={store}>
        <PrivacyScreen />
      </Provider>
    );
  };

  describe('Initial Render', () => {
    it('should render loading state when preferences are loading', () => {
      mockUseSelector.mockImplementation((selector) => {
        const state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: true,
            preferences: null
          }
        });
      });

      renderPrivacyScreen();

      expect(screen.getByText('privacy.loading')).toBeTruthy();
    });

    it('should render privacy screen with tabs when data is loaded', () => {
      const mockPreferences = createMockPrivacyPreferences();
      mockUseSelector.mockImplementation((selector) => {
        const state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences
          }
        });
      });

      renderPrivacyScreen();

      expect(screen.getByText('privacy.title')).toBeTruthy();
      expect(screen.getByText('privacy.tabs.overview')).toBeTruthy();
      expect(screen.getByText('privacy.tabs.consent')).toBeTruthy();
      expect(screen.getByText('privacy.tabs.rights')).toBeTruthy();
      expect(screen.getByText('privacy.tabs.settings')).toBeTruthy();
    });
  });

  describe('Overview Tab', () => {
    beforeEach(() => {
      const mockPreferences = createMockPrivacyPreferences();
      const mockDashboard = {
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

      mockUseSelector.mockImplementation((selector) => {
        const state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences,
            dashboard: mockDashboard
          }
        });
      });
    });

    it('should display privacy dashboard information', () => {
      renderPrivacyScreen();

      expect(screen.getByText('privacy.dashboard.title')).toBeTruthy();
      expect(screen.getByText('privacy.dashboard.consent_summary')).toBeTruthy();
      expect(screen.getByText('privacy.dashboard.data_rights_summary')).toBeTruthy();
      expect(screen.getByText('privacy.dashboard.compliance_score')).toBeTruthy();
    });

    it('should display compliance check button', () => {
      renderPrivacyScreen();

      const complianceButton = screen.getByText('privacy.compliance.check_button');
      expect(complianceButton).toBeTruthy();
    });

    it('should trigger compliance check when button is pressed', async () => {
      renderPrivacyScreen();

      const complianceButton = screen.getByText('privacy.compliance.check_button');
      fireEvent.press(complianceButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });

    it('should display quick actions', () => {
      renderPrivacyScreen();

      expect(screen.getByText('privacy.quick_actions.title')).toBeTruthy();
      expect(screen.getByText('privacy.quick_actions.preferences')).toBeTruthy();
      expect(screen.getByText('privacy.quick_actions.history')).toBeTruthy();
      expect(screen.getByText('privacy.quick_actions.rights')).toBeTruthy();
    });
  });

  describe('Consent Tab', () => {
    beforeEach(() => {
      const mockPreferences = createMockPrivacyPreferences();
      const mockConsentHistory = [
        {
          id: 'consent-1',
          type: 'marketing',
          purpose: 'email_marketing',
          legalBasis: 'consent',
          granted: true,
          timestamp: new Date().toISOString()
        }
      ];

      mockUseSelector.mockImplementation((selector) => {
        const state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences,
            consentHistory: mockConsentHistory
          }
        });
      });
    });

    it('should display consent management section', () => {
      renderPrivacyScreen();

      // Switch to consent tab
      const consentTab = screen.getByText('privacy.tabs.consent');
      fireEvent.press(consentTab);

      expect(screen.getByText('privacy.consent.title')).toBeTruthy();
      expect(screen.getByText('privacy.consent.description')).toBeTruthy();
    });

    it('should display consent history', () => {
      renderPrivacyScreen();

      // Switch to consent tab
      const consentTab = screen.getByText('privacy.tabs.consent');
      fireEvent.press(consentTab);

      expect(screen.getByText('privacy.consent.history.title')).toBeTruthy();
    });

    it('should display marketing consent options', () => {
      renderPrivacyScreen();

      // Switch to consent tab
      const consentTab = screen.getByText('privacy.tabs.consent');
      fireEvent.press(consentTab);

      expect(screen.getByText('privacy.consent.marketing.title')).toBeTruthy();
      expect(screen.getByText('privacy.consent.marketing.email')).toBeTruthy();
      expect(screen.getByText('privacy.consent.marketing.sms')).toBeTruthy();
      expect(screen.getByText('privacy.consent.marketing.push')).toBeTruthy();
    });

    it('should display data sharing consent options', () => {
      renderPrivacyScreen();

      // Switch to consent tab
      const consentTab = screen.getByText('privacy.tabs.consent');
      fireEvent.press(consentTab);

      expect(screen.getByText('privacy.consent.data_sharing.title')).toBeTruthy();
      expect(screen.getByText('privacy.consent.data_sharing.analytics')).toBeTruthy();
      expect(screen.getByText('privacy.consent.data_sharing.third_party')).toBeTruthy();
    });
  });

  describe('Data Rights Tab', () => {
    beforeEach(() => {
      const mockPreferences = createMockPrivacyPreferences();
      const mockDataRightsRequests = [
        {
          id: 'request-1',
          type: 'access',
          description: 'Request access to my data',
          priority: 'medium',
          status: 'pending',
          createdAt: new Date().toISOString()
        }
      ];

      mockUseSelector.mockImplementation((selector) => {
        const state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences,
            dataRightsRequests: mockDataRightsRequests
          }
        });
      });
    });

    it('should display data rights section', () => {
      renderPrivacyScreen();

      // Switch to rights tab
      const rightsTab = screen.getByText('privacy.tabs.rights');
      fireEvent.press(rightsTab);

      expect(screen.getByText('privacy.data_rights.title')).toBeTruthy();
      expect(screen.getByText('privacy.data_rights.description')).toBeTruthy();
    });

    it('should display data rights types', () => {
      renderPrivacyScreen();

      // Switch to rights tab
      const rightsTab = screen.getByText('privacy.tabs.rights');
      fireEvent.press(rightsTab);

      expect(screen.getByText('privacy.data_rights.types.access')).toBeTruthy();
      expect(screen.getByText('privacy.data_rights.types.rectification')).toBeTruthy();
      expect(screen.getByText('privacy.data_rights.types.erasure')).toBeTruthy();
      expect(screen.getByText('privacy.data_rights.types.portability')).toBeTruthy();
    });

    it('should display data rights request button', () => {
      renderPrivacyScreen();

      // Switch to rights tab
      const rightsTab = screen.getByText('privacy.tabs.rights');
      fireEvent.press(rightsTab);

      expect(screen.getByText('privacy.data_rights.request.submit')).toBeTruthy();
    });
  });

  describe('Settings Tab', () => {
    beforeEach(() => {
      const mockPreferences = createMockPrivacyPreferences();

      mockUseSelector.mockImplementation((selector) => {
        const state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences
          }
        });
      });
    });

    it('should display privacy settings section', () => {
      renderPrivacyScreen();

      // Switch to settings tab
      const settingsTab = screen.getByText('privacy.tabs.settings');
      fireEvent.press(settingsTab);

      expect(screen.getByText('privacy.settings.title')).toBeTruthy();
      expect(screen.getByText('privacy.settings.region')).toBeTruthy();
      expect(screen.getByText('privacy.settings.notifications')).toBeTruthy();
    });

    it('should display notification settings', () => {
      renderPrivacyScreen();

      // Switch to settings tab
      const settingsTab = screen.getByText('privacy.tabs.settings');
      fireEvent.press(settingsTab);

      expect(screen.getByText('privacy.settings.notifications_description')).toBeTruthy();
    });

    it('should display data retention settings', () => {
      renderPrivacyScreen();

      // Switch to settings tab
      const settingsTab = screen.getByText('privacy.tabs.settings');
      fireEvent.press(settingsTab);

      expect(screen.getByText('privacy.settings.data_retention')).toBeTruthy();
      expect(screen.getByText('privacy.settings.data_retention_description')).toBeTruthy();
    });

    it('should display advanced settings', () => {
      renderPrivacyScreen();

      // Switch to settings tab
      const settingsTab = screen.getByText('privacy.tabs.settings');
      fireEvent.press(settingsTab);

      expect(screen.getByText('privacy.settings.advanced.title')).toBeTruthy();
      expect(screen.getByText('privacy.settings.advanced.export_data')).toBeTruthy();
      expect(screen.getByText('privacy.settings.advanced.delete_data')).toBeTruthy();
    });
  });

  describe('Children Protection', () => {
    beforeEach(() => {
      const mockPreferences = createMockPrivacyPreferences();

      mockUseSelector.mockImplementation((selector) => {
        const state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences
          }
        });
      });
    });

    it('should display children protection section', () => {
      renderPrivacyScreen();

      expect(screen.getByText('privacy.children_protection.title')).toBeTruthy();
      expect(screen.getByText('privacy.children_protection.age_verification')).toBeTruthy();
      expect(screen.getByText('privacy.children_protection.parental_consent')).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when preferences fail to load', () => {
      mockUseSelector.mockImplementation((selector) => {
        const state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferencesError: 'Failed to load preferences'
          }
        });
      });

      renderPrivacyScreen();

      expect(screen.getByText('Failed to load preferences')).toBeTruthy();
    });
  });

  describe('Refresh Functionality', () => {
    it('should trigger refresh when pull to refresh', async () => {
      const mockPreferences = createMockPrivacyPreferences();

      mockUseSelector.mockImplementation((selector) => {
        const state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences
          }
        });
      });

      renderPrivacyScreen();

      // Simulate pull to refresh
      const scrollView = screen.getByTestId('privacy-scroll-view');
      fireEvent(scrollView, 'refresh');

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled();
      });
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', () => {
      const mockPreferences = createMockPrivacyPreferences();

      mockUseSelector.mockImplementation((selector) => {
        const state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences
          }
        });
      });

      renderPrivacyScreen();

      // Initially overview tab should be active
      expect(screen.getByText('privacy.dashboard.title')).toBeTruthy();

      // Switch to consent tab
      const consentTab = screen.getByText('privacy.tabs.consent');
      fireEvent.press(consentTab);
      expect(screen.getByText('privacy.consent.title')).toBeTruthy();

      // Switch to rights tab
      const rightsTab = screen.getByText('privacy.tabs.rights');
      fireEvent.press(rightsTab);
      expect(screen.getByText('privacy.data_rights.title')).toBeTruthy();

      // Switch to settings tab
      const settingsTab = screen.getByText('privacy.tabs.settings');
      fireEvent.press(settingsTab);
      expect(screen.getByText('privacy.settings.title')).toBeTruthy();
    });
  });
});
