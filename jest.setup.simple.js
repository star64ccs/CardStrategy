/* eslint-env jest */

// 簡化的 Jest 設置文件，只包含必要的 mock

// Mock Expo modules
jest.mock('expo-camera');
jest.mock('expo-image-picker');
jest.mock('expo-file-system');
jest.mock('expo-secure-store');
jest.mock('expo-notifications');
jest.mock('expo-location');
jest.mock('expo-device');
jest.mock('expo-constants');
jest.mock('expo-font');
jest.mock('expo-splash-screen');
jest.mock('expo-status-bar');

// Mock React Native modules
jest.mock('react-native-vector-icons');
jest.mock('react-native-chart-kit');
jest.mock('react-native-svg');
jest.mock('react-native-modal');
jest.mock('react-native-toast-message');
jest.mock('react-native-loading-spinner-overlay');
jest.mock('react-native-image-zoom-viewer');
jest.mock('react-native-permissions');
jest.mock('react-native-encrypted-storage');
jest.mock('react-native-biometrics');
jest.mock('react-native-keychain');
jest.mock('react-native-sqlite-storage');
jest.mock('react-native-fs');
jest.mock('react-native-pdf');
jest.mock('react-native-share');
jest.mock('react-native-print');
jest.mock('react-native-html-to-pdf');

// Mock navigation
jest.mock('@react-navigation/native');
jest.mock('@react-navigation/stack');
jest.mock('@react-navigation/bottom-tabs');

// Mock Redux
jest.mock('react-redux');

// Mock i18next
jest.mock('i18next', () => ({
  t: (key) => key,
  changeLanguage: jest.fn(),
  language: 'zh-TW',
}));

// Mock axios
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
  },
}));

// Global test utilities
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    State: {},
    Directions: {},
    gestureHandlerRootHOC: jest.fn((component) => component),
    Swipeable: View,
    DrawerLayout: View,
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-screens
jest.mock('react-native-screens', () => {
  const RNScreens = require('react-native-screens/mock');
  return RNScreens;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

// Mock react-native-paper
jest.mock('react-native-paper', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  return {
    Provider: ({ children }) => React.createElement(View, {}, children),
    Button: ({ children, onPress }) => React.createElement(View, { onPress }, children),
    Text: ({ children }) => React.createElement(View, {}, children),
    Card: ({ children }) => React.createElement(View, {}, children),
    TextInput: ({ children }) => React.createElement(View, {}, children),
    FAB: ({ children }) => React.createElement(View, {}, children),
    IconButton: ({ children }) => React.createElement(View, {}, children),
    Appbar: ({ children }) => React.createElement(View, {}, children),
    BottomNavigation: ({ children }) => React.createElement(View, {}, children),
    useTheme: () => ({
      colors: {
        primary: '#000',
        background: '#fff',
        surface: '#fff',
        text: '#000',
      },
    }),
  };
});
