/* eslint-env jest */

import 'react-native-gesture-handler/jestSetup';
import 'jest-extended';
// import { server } from './src/__tests__/setup/msw-server'; // 暫時註釋掉
// 暫時跳過所有設置文件的引用

// 啟動 MSW 服務器
// beforeAll(() => server.listen()); // 暫時註釋掉
// afterEach(() => server.resetHandlers()); // 暫時註釋掉
// afterAll(() => server.close()); // 暫時註釋掉

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
jest.mock('react-native-qrcode-scanner');
jest.mock('react-native-permissions');
jest.mock('react-native-encrypted-storage');
jest.mock('react-native-biometrics');
jest.mock('react-native-keychain');
// jest.mock('react-native-async-storage'); // 已移除，使用 @react-native-async-storage/async-storage
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
const mockAsyncStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock SecureStore
const mockSecureStore = {
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn(),
};

jest.mock('expo-secure-store', () => mockSecureStore);

// Mock FileSystem
const mockFileSystem = {
  documentDirectory: '/mock/document/directory/',
  cacheDirectory: '/mock/cache/directory/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
  getInfoAsync: jest.fn(),
};

jest.mock('expo-file-system', () => mockFileSystem);

// Mock Camera
const mockCamera = {
  CameraType: {
    front: 'front',
    back: 'back',
  },
  FlashMode: {
    on: 'on',
    off: 'off',
    auto: 'auto',
    torch: 'torch',
  },
  requestCameraPermissionsAsync: jest.fn(),
  requestMicrophonePermissionsAsync: jest.fn(),
};

jest.mock('expo-camera', () => mockCamera);

// Mock ImagePicker
const mockImagePicker = {
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    All: 'All',
    Videos: 'Videos',
    Images: 'Images',
  },
  ImagePickerResult: {
    canceled: false,
    assets: [
      {
        uri: 'mock-image-uri',
        width: 100,
        height: 100,
        type: 'image/jpeg',
      },
    ],
  },
};

jest.mock('expo-image-picker', () => mockImagePicker);

// Mock Dimensions
const mockDimensions = {
  get: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 3,
    fontScale: 1,
  })),
};

jest.mock('react-native/Libraries/Utilities/Dimensions', () => mockDimensions);

// Mock Platform
const mockPlatform = {
  OS: 'ios',
  Version: 15,
  isPad: false,
  isTV: false,
  select: jest.fn((obj) => obj.ios || obj.default),
};

jest.mock('react-native/Libraries/Utilities/Platform', () => mockPlatform);

// Mock Alert
const mockAlert = jest.fn();
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: mockAlert,
}));

// Mock Share
const mockShare = jest.fn();
jest.mock('react-native/Libraries/Share/Share', () => ({
  share: mockShare,
}));

// Mock Linking
const mockLinking = {
  openURL: jest.fn(),
  canOpenURL: jest.fn(),
  getInitialURL: jest.fn(),
};

jest.mock('react-native/Libraries/Linking/Linking', () => mockLinking);

// Mock PermissionsAndroid
const mockPermissionsAndroid = {
  PERMISSIONS: {
    CAMERA: 'android.permission.CAMERA',
    WRITE_EXTERNAL_STORAGE: 'android.permission.WRITE_EXTERNAL_STORAGE',
    READ_EXTERNAL_STORAGE: 'android.permission.READ_EXTERNAL_STORAGE',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    NEVER_ASK_AGAIN: 'never_ask_again',
  },
  request: jest.fn(),
  check: jest.fn(),
};

jest.mock(
  'react-native/Libraries/PermissionsAndroid/PermissionsAndroid',
  () => mockPermissionsAndroid
);

// Mock NetInfo
const mockNetInfo = {
  addEventListener: jest.fn(),
  fetch: jest.fn(() =>
    Promise.resolve({ isConnected: true, isInternetReachable: true })
  ),
  useNetInfo: jest.fn(() => ({ isConnected: true, isInternetReachable: true })),
};

// jest.mock('@react-native-community/netinfo', () => mockNetInfo); // 暫時註釋掉

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  const Text = require('react-native/Libraries/Text/Text');
  const ScrollView = require('react-native/Libraries/Components/ScrollView/ScrollView');
  const TouchableOpacity = require('react-native/Libraries/Components/Touchable/TouchableOpacity');

  return {
    // Swipeable: removed duplicate,
    // DrawerLayout: removed duplicate,
    State: {},
    ScrollView,
    Slider: View,
    Switch: View,
    TextInput: require('react-native/Libraries/Components/TextInput/TextInput'),
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
    Directions: {},
    gestureHandlerRootHOC: jest.fn((component) => component),
    // Swipeable: removed duplicate,
    // DrawerLayout: removed duplicate,
    TouchableHighlight: TouchableOpacity,
    TouchableNativeFeedback: TouchableOpacity,
    TouchableOpacity,
    TouchableWithoutFeedback: TouchableOpacity,
  };
});

// Export mocks for use in tests
export {
  mockAsyncStorage,
  mockSecureStore,
  mockFileSystem,
  mockCamera,
  mockImagePicker,
  mockDimensions,
  mockPlatform,
  mockAlert,
  mockShare,
  mockLinking,
  mockPermissionsAndroid,
  mockNetInfo,
};
