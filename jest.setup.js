import 'react-native-gesture-handler/jestSetup';

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
jest.mock('react-native-async-storage');
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
  language: 'zh-TW'
}));

// Mock axios
jest.mock('axios');

// Global test utilities
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
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
  multiRemove: jest.fn()
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock SecureStore
const mockSecureStore = {
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  isAvailableAsync: jest.fn()
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
  getInfoAsync: jest.fn()
};

jest.mock('expo-file-system', () => mockFileSystem);

// Mock Camera
const mockCamera = {
  CameraType: {
    front: 'front',
    back: 'back'
  },
  FlashMode: {
    on: 'on',
    off: 'off',
    auto: 'auto',
    torch: 'torch'
  },
  requestCameraPermissionsAsync: jest.fn(),
  requestMicrophonePermissionsAsync: jest.fn()
};

jest.mock('expo-camera', () => mockCamera);

// Mock ImagePicker
const mockImagePicker = {
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    All: 'All',
    Videos: 'Videos',
    Images: 'Images'
  },
  ImagePickerResult: {
    canceled: false,
    assets: [
      {
        uri: 'mock-image-uri',
        width: 100,
        height: 100,
        type: 'image/jpeg'
      }
    ]
  }
};

jest.mock('expo-image-picker', () => mockImagePicker);

// Export mocks for use in tests
export {
  mockAsyncStorage,
  mockSecureStore,
  mockFileSystem,
  mockCamera,
  mockImagePicker
};
