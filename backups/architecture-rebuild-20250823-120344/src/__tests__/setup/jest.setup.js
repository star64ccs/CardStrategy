/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock axios with proper interceptors
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  })),
  default: {
      },
    })),
  },
}));

// Mock logger
jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock environment
jest.mock('../../config/environment', () => ({
  environment: {
    API_BASE_URL: 'http://localhost:3000/api',
    NODE_ENV: 'test',
  },
}));

// Mock validation service - 更詳細的 mock
jest.mock('../../utils/validationService', () => ({
  validateApiResponse: jest.fn(() => ({ isValid: true, errors: [] })),
  validateInput: jest.fn((schema, data, context) => ({ 
    isValid: true, 
    data: data, // 返回原始數據
    errors: [],
    errorMessage: undefined
  })),
  validationService: {
    })),
  },
}));

// 設置全局變數
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
};

// Mock react-native-push-notification
jest.mock('react-native-push-notification', () => ({
  configure: jest.fn(),
  localNotification: jest.fn(),
  localNotificationSchedule: jest.fn(),
  cancelLocalNotifications: jest.fn(),
  cancelAllLocalNotifications: jest.fn(),
  getScheduledLocalNotifications: jest.fn(),
  getDeliveredNotifications: jest.fn(),
  removeDeliveredNotifications: jest.fn(),
  removeAllDeliveredNotifications: jest.fn(),
  onNotification: jest.fn(),
  onRegister: jest.fn(),
  onRegistrationError: jest.fn(),
  requestPermissions: jest.fn(),
  subscribeToTopic: jest.fn(),
  unsubscribeFromTopic: jest.fn(),
  presentLocalNotification: jest.fn(),
  scheduleLocalNotification: jest.fn(),
  getInitialNotification: jest.fn(),
  getBadgeCount: jest.fn(),
  setBadgeCount: jest.fn(),
  clearAllNotifications: jest.fn(),
  getChannels: jest.fn(),
  channelExists: jest.fn(),
  createChannel: jest.fn(),
  deleteChannel: jest.fn(),
  getChannel: jest.fn(),
  checkPermissions: jest.fn(),
  abandonPermissions: jest.fn(),
}));

// Mock expo-linking
jest.mock('expo-linking', () => ({
  createURL: jest.fn(),
  makeUrl: jest.fn(),
  parse: jest.fn(),
  parseInitialURL: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn(),
  sendIntent: jest.fn(),
}));

// Mock expo-sharing
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn(() => Promise.resolve({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    isWifi: true,
    isCellular: false,
    isEthernet: false,
    isBluetooth: false,
    isVpn: false,
    isLocationEnabled: true,
    isAirplaneMode: false,
    isCarrier: false,
    isEmulator: false,
    isTablet: false,
    isTV: false,
    isPhone: false,
  })),
  refresh: jest.fn(),
  useNetInfo: jest.fn(() => ({
  })),
}));

// Mock process.env
process.env.NODE_ENV = 'test';
process.env.REACT_APP_API_URL = 'http://localhost:3000/api';
