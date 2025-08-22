import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { NavigationContainer } from '@react-navigation/native';
import { theme } from '@/config/theme';

// Import all reducers
import authReducer from '@/store/slices/authSlice';
import cardReducer from '@/store/slices/cardSlice';
import collectionReducer from '@/store/slices/collectionSlice';
import investmentReducer from '@/store/slices/investmentSlice';
import marketReducer from '@/store/slices/marketSlice';
import aiReducer from '@/store/slices/aiSlice';
import membershipReducer from '@/store/slices/membershipSlice';
import settingsReducer from '@/store/slices/settingsSlice';
import scanHistoryReducer from '@/store/slices/scanHistorySlice';
import feedbackReducer from '@/store/slices/feedbackSlice';
import privacyReducer from '@/store/slices/privacySlice';

// Create test Redux store
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      card: cardReducer,
      collection: collectionReducer,
      investment: investmentReducer,
      market: marketReducer,
      ai: aiReducer,
      membership: membershipReducer,
      settings: settingsReducer,
      scanHistory: scanHistoryReducer,
      feedback: feedbackReducer,
      privacy: privacyReducer,
    },
    preloadedState,
  });
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any;
  store?: any;
  withNavigation?: boolean;
}

const customRender = (ui: ReactElement, options: CustomRenderOptions = {}) => {
  const {
    preloadedState = {},
    store = createTestStore(preloadedState),
    withNavigation = false,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => {
    const content = <Provider store={store}>{children}</Provider>;

    if (withNavigation) {
      return <NavigationContainer>{content}</NavigationContainer>;
    }

    return content;
  };

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  profile: {
    avatar: 'https://example.com/avatar.jpg',
    displayName: 'Test User',
    bio: 'Test bio',
  },
  ...overrides,
});

export const createMockCard = (overrides = {}) => ({
  id: '1',
  name: 'Test Card',
  type: 'Monster',
  rarity: 'Rare',
  image: 'https://example.com/card.jpg',
  price: 100,
  condition: 'Mint',
  ...overrides,
});

export const createMockScanHistory = (overrides = {}) => ({
  id: '1',
  userId: '1',
  cardId: '1',
  cardName: 'Test Card',
  cardImage: 'https://example.com/card.jpg',
  scanType: 'recognition' as const,
  scanResult: {
    success: true,
    confidence: 0.95,
    recognizedCard: createMockCard(),
  },
  imageUri: 'https://example.com/scan.jpg',
  scanDate: new Date().toISOString(),
  processingTime: 1500,
  metadata: {
    deviceInfo: 'iPhone 14',
    appVersion: '1.0.0',
    scanMethod: 'camera',
    imageQuality: 'high',
  },
  tags: ['test'],
  notes: 'Test scan',
  isFavorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockConditionAnalysis = (overrides = {}) => ({
  overallGrade: 'Near Mint',
  overallScore: 8.5,
  confidence: 0.92,
  factors: {
    corners: { score: 8.0, details: 'Minor wear on corners' },
    edges: { score: 9.0, details: 'Clean edges' },
    surface: { score: 8.5, details: 'Good surface condition' },
    centering: { score: 8.0, details: 'Slightly off-center' },
    printQuality: { score: 9.0, details: 'Excellent print quality' },
  },
  damageAssessment: {
    scratches: [],
    dents: [],
    creases: [],
    stains: [],
    fading: 'None',
  },
  marketImpact: {
    estimatedValue: 120,
    valueRange: { min: 100, max: 140 },
    marketTrend: 'stable',
  },
  preservationTips: [
    'Store in protective sleeve',
    'Keep away from direct sunlight',
    'Maintain stable humidity',
  ],
  ...overrides,
});

export const createMockFeedback = (overrides = {}) => ({
  id: '1',
  userId: '1',
  type: 'bug_report' as const,
  title: 'Test Feedback',
  description: 'This is a test feedback',
  category: 'ui_ux' as const,
  priority: 'medium' as const,
  status: 'pending' as const,
  tags: ['test'],
  votes: 0,
  hasResponse: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createMockPrivacyPreferences = (overrides = {}) => ({
  id: '1',
  userId: '1',
  region: 'CN' as const,
  language: 'zh-TW',
  termsAccepted: true,
  termsAcceptedAt: new Date().toISOString(),
  privacyPolicyAccepted: true,
  privacyPolicyAcceptedAt: new Date().toISOString(),
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
  dataProcessingConsent: {
    accountManagement: true,
    serviceProvision: true,
    paymentProcessing: true,
    marketing: false,
    analytics: true,
    security: true,
    legalCompliance: true,
    customerSupport: true,
    research: false,
    thirdPartyIntegration: false,
  },
  notificationPreferences: {
    privacyUpdates: true,
    dataBreach: true,
    consentChanges: true,
    legalUpdates: true,
  },
  dataRetentionSettings: {
    accountData: '7_years',
    transactionData: '7_years',
    usageData: '2_years',
    marketingData: '2_years',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Utility functions
export const waitFor = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const mockApiResponse = (
  data: any,
  success = true,
  message = 'Success'
) => ({
  success,
  message,
  data,
});

export const mockApiError = (message = 'Error', status = 400) => ({
  success: false,
  message,
  status,
});

// Custom matchers
export const expectToBeVisible = (element: any) => {
  expect(element).toBeTruthy();
  expect(element.props.style).not.toContainEqual({ display: 'none' });
};

export const expectToHaveText = (element: any, text: string) => {
  expect(element).toHaveTextContent(text);
};

export const expectToHaveStyle = (element: any, style: any) => {
  expect(element.props.style).toMatchObject(style);
};

// Export custom render and store
export { customRender as render, createTestStore };

// Re-export testing-library utilities
export * from '@testing-library/react-native';
