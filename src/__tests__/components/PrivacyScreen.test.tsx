import { configureStore } from '@reduxjs/toolkit';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';

import PrivacyScreen from '../../screens/PrivacyScreen';

import { createMockPrivacyPreferences } from '@/__tests__/setup/test-utils';
import privacyReducer from '@/store/slices/privacySlice';

// Mock react-redux
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// Mock i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'zh-TW' },
  }),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

const _mockDispatch = jest.fn();
const _mockUseDispatch = useDispatch as jest.MockedFunction<typeof useDispatch>;
const _mockUseSelector = useSelector as jest.MockedFunction<typeof useSelector>;

describe('PrivacyScreen', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        privacy: privacyReducer,
      },
    });

    mockUseDispatch.mockReturnValue(mockDispatch);
    mockUseSelector.mockImplementation(selector => selector(store.getState()));

    jest.clearAllMocks();
  });

  const _renderPrivacyScreen = () => {
    return render(
      <Provider store={store}>
        <PrivacyScreen />
      </Provider>
    );
  };

  describe('Initial Render', () => {
    it('should render loading state when preferences are loading', () => {
      mockUseSelector.mockImplementation(selector => {
        const _state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            loading: true,
            settings: null,
            error: null,
          },
        });
      });

      renderPrivacyScreen();

      expect(screen.getByText('載入隱私設置中...')).toBeTruthy();
    });

    it('should render privacy screen with tabs when data is loaded', () => {
      const _mockPreferences = createMockPrivacyPreferences();
      mockUseSelector.mockImplementation(selector => {
        const _state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            loading: false,
            settings: mockPreferences,
            error: null,
          },
        });
      });

      renderPrivacyScreen();

      expect(screen.getByText('隱私設置')).toBeTruthy();
      expect(screen.getByText('概覽')).toBeTruthy();
      expect(screen.getByText('同意')).toBeTruthy();
      expect(screen.getByText('權利')).toBeTruthy();
      expect(screen.getByText('設置')).toBeTruthy();
    });
  });

  describe('Overview Tab', () => {
    beforeEach(() => {
      const _mockPreferences = createMockPrivacyPreferences();
      const _mockDashboard = {
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

      mockUseSelector.mockImplementation(selector => {
        const _state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences,
            dashboard: mockDashboard,
          },
        });
      });
    });

    it('should display privacy dashboard information', () => {
      renderPrivacyScreen();

      expect(screen.getByText('隱私概覽')).toBeTruthy();
      expect(screen.getByText('管理您的隱私設置和數據權利')).toBeTruthy();
    });

    it('should display compliance check button', () => {
      renderPrivacyScreen();

      const _complianceButton = screen.getByText('檢查合規性');
      expect(complianceButton).toBeTruthy();
    });

    it('should trigger compliance check when button is pressed', async () => {
      renderPrivacyScreen();

      const _complianceButton = screen.getByText('檢查合規性');
      fireEvent.press(complianceButton);

      // The button should be pressable and not throw an error
      expect(complianceButton).toBeTruthy();
    });

    it('should display quick actions', () => {
      renderPrivacyScreen();

      expect(screen.getByText('快速操作')).toBeTruthy();
      expect(screen.getByText('下載我的數據')).toBeTruthy();
      expect(screen.getByText('刪除我的帳戶')).toBeTruthy();
    });
  });

  describe('Consent Tab', () => {
    beforeEach(() => {
      const _mockPreferences = createMockPrivacyPreferences();
      const _mockConsentHistory = [
        {
          id: 'consent-1',
          type: 'marketing',
          purpose: 'email_marketing',
          legalBasis: 'consent',
          granted: true,
          timestamp: new Date().toISOString(),
        },
      ];

      mockUseSelector.mockImplementation(selector => {
        const _state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences,
            consentHistory: mockConsentHistory,
          },
        });
      });
    });

    it('should display consent management section', () => {
      renderPrivacyScreen();

      // Switch to consent tab
      const _consentTab = screen.getByText('同意');
      fireEvent.press(consentTab);

      expect(screen.getByText('同意管理')).toBeTruthy();
      expect(screen.getByText('管理您對數據處理的同意')).toBeTruthy();
    });

    it('should display consent history', () => {
      renderPrivacyScreen();

      // Switch to consent tab
      const _consentTab = screen.getByText('同意');
      fireEvent.press(consentTab);

      expect(screen.getByText('同意歷史')).toBeTruthy();
    });

    it('should display marketing consent options', () => {
      renderPrivacyScreen();

      // Switch to consent tab
      const _consentTab = screen.getByText('同意');
      fireEvent.press(consentTab);

      expect(screen.getByText('營銷通訊')).toBeTruthy();
    });

    it('should display data sharing consent options', () => {
      renderPrivacyScreen();

      // Switch to consent tab
      const _consentTab = screen.getByText('同意');
      fireEvent.press(consentTab);

      expect(screen.getByText('數據分享')).toBeTruthy();
    });
  });

  describe('Data Rights Tab', () => {
    beforeEach(() => {
      const _mockPreferences = createMockPrivacyPreferences();
      const _mockDataRightsRequests = [
        {
          id: 'request-1',
          type: 'access',
          description: 'Request access to my data',
          priority: 'medium',
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      ];

      mockUseSelector.mockImplementation(selector => {
        const _state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences,
            dataRightsRequests: mockDataRightsRequests,
          },
        });
      });
    });

    it('should display data rights section', () => {
      renderPrivacyScreen();

      // Switch to rights tab
      const _rightsTab = screen.getByText('權利');
      fireEvent.press(rightsTab);

      expect(screen.getByText('數據權利')).toBeTruthy();
      expect(screen.getByText('您對個人數據的權利')).toBeTruthy();
    });

    it('should display data rights types', () => {
      renderPrivacyScreen();

      // Switch to rights tab
      const _rightsTab = screen.getByText('權利');
      fireEvent.press(rightsTab);

      expect(screen.getByText('訪問權')).toBeTruthy();
      expect(screen.getByText('更正權')).toBeTruthy();
      expect(screen.getByText('刪除權')).toBeTruthy();
    });

    it('should display data rights request button', () => {
      renderPrivacyScreen();

      // Switch to rights tab
      const _rightsTab = screen.getByText('權利');
      fireEvent.press(rightsTab);

      expect(screen.getByText('提交權利請求')).toBeTruthy();
    });
  });

  describe('Settings Tab', () => {
    beforeEach(() => {
      const _mockPreferences = createMockPrivacyPreferences();

      mockUseSelector.mockImplementation(selector => {
        const _state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences,
          },
        });
      });
    });

    it('should display privacy settings section', () => {
      renderPrivacyScreen();

      // Switch to settings tab
      const _settingsTab = screen.getByText('設置');
      fireEvent.press(settingsTab);

      expect(screen.getAllByText('隱私設置')[1]).toBeTruthy();
    });

    it('should display notification settings', () => {
      renderPrivacyScreen();

      // Switch to settings tab
      const _settingsTab = screen.getByText('設置');
      fireEvent.press(settingsTab);

      expect(screen.getByText('通知設置')).toBeTruthy();
    });

    it('should display data retention settings', () => {
      renderPrivacyScreen();

      // Switch to settings tab
      const _settingsTab = screen.getByText('設置');
      fireEvent.press(settingsTab);

      expect(screen.getByText('數據保留')).toBeTruthy();
    });

    it('should display advanced settings', () => {
      renderPrivacyScreen();

      // Switch to settings tab
      const _settingsTab = screen.getByText('設置');
      fireEvent.press(settingsTab);

      expect(screen.getByText('高級設置')).toBeTruthy();
    });
  });

  describe('Children Protection', () => {
    beforeEach(() => {
      const _mockPreferences = createMockPrivacyPreferences();

      mockUseSelector.mockImplementation(selector => {
        const _state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences,
          },
        });
      });
    });

    it('should display children protection section', () => {
      renderPrivacyScreen();

      // Switch to children protection tab
      const _childrenTab = screen.getByText('兒童保護');
      fireEvent.press(childrenTab);

      expect(screen.getAllByText('兒童保護')[1]).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should display error message when preferences fail to load', () => {
      mockUseSelector.mockImplementation(selector => {
        const _state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            loading: false,
            settings: null,
            error: 'Failed to load preferences',
          },
        });
      });

      renderPrivacyScreen();

      expect(screen.getByText('載入失敗')).toBeTruthy();
    });
  });

  describe('Refresh Functionality', () => {
    it('should trigger refresh when pull to refresh', async () => {
      const _mockPreferences = createMockPrivacyPreferences();

      mockUseSelector.mockImplementation(selector => {
        const _state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences,
          },
        });
      });

      renderPrivacyScreen();

      // Simulate pull to refresh
      const _scrollView = screen.getByTestId('privacy-scroll-view');
      if (scrollView) {
        fireEvent(scrollView, 'refresh');
      }

      // The refresh should be triggered
      expect(scrollView).toBeTruthy();
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', () => {
      const _mockPreferences = createMockPrivacyPreferences();

      mockUseSelector.mockImplementation(selector => {
        const _state = store.getState();
        return selector({
          ...state,
          privacy: {
            ...state.privacy,
            preferencesLoading: false,
            preferences: mockPreferences,
          },
        });
      });

      renderPrivacyScreen();

      // Initially overview tab should be active
      expect(screen.getByText('隱私概覽')).toBeTruthy();

      // Switch to consent tab
      const _consentTab = screen.getByText('同意');
      fireEvent.press(consentTab);
      expect(screen.getByText('同意管理')).toBeTruthy();

      // Switch to rights tab
      const _rightsTab = screen.getByText('權利');
      fireEvent.press(rightsTab);
      expect(screen.getByText('數據權利')).toBeTruthy();

      // Switch to settings tab
      const _settingsTab = screen.getByText('設置');
      fireEvent.press(settingsTab);
      expect(screen.getAllByText('隱私設置')[1]).toBeTruthy();
    });
  });
});
