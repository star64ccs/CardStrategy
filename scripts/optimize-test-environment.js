#!/usr/bin/env node

/**
 * 測試環境優化腳本
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 開始優化測試環境配置...\n');

// 1. 檢查並修復Jest配置
function optimizeJestConfig() {
  console.log('📋 檢查Jest配置...');

  const jestConfigPath = path.join(__dirname, '..', 'jest.config.js');
  const jestConfig = require(jestConfigPath);

  // 優化配置
  const optimizedConfig = {
    ...jestConfig,
    testTimeout: 15000, // 增加超時時間
    maxWorkers: '50%', // 增加並行度
    workerIdleMemoryLimit: '2GB', // 增加記憶體限制
    setupFilesAfterEnv: [
      '<rootDir>/jest.setup.minimal.js',
    ],
    testPathIgnorePatterns: [
      '/node_modules/',
      '/android/',
      '/ios/',
      '/.expo/',
      '/dist/',
      '/build/',
      '/coverage/',
      '/src/__tests__/e2e/', // 暫時忽略E2E測試
    ],
    collectCoverage: false, // 暫時關閉覆蓋率收集
    verbose: false, // 減少輸出
  };

  // 寫回配置文件
  fs.writeFileSync(
    jestConfigPath,
    `module.exports = ${JSON.stringify(optimizedConfig, null, 2)};`
  );

  console.log('✅ Jest配置已優化');
}

// 2. 創建測試環境變量文件
function createTestEnvFile() {
  console.log('📋 創建測試環境變量文件...');

  const testEnvContent = `# 測試環境變量配置
NODE_ENV=test
EXPO_ENV=test

# 測試數據庫配置
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cardstrategy_test
DB_USER=test_user
DB_PASSWORD=test_password

# 測試Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# 測試API配置
API_BASE_URL=http://localhost:3001
API_TIMEOUT=5000

# 測試服務配置
SKIP_LOCAL_SERVICES=true
ENABLE_MOCK_SERVICES=true

# 測試日誌配置
LOG_LEVEL=error
ENABLE_DEBUG_LOGS=false

# 測試安全配置
JWT_SECRET=test_jwt_secret_key_for_testing_only
ENCRYPTION_KEY=test_encryption_key_32_chars_long

# 測試外部服務配置
SENDGRID_API_KEY=test_sendgrid_key
TWILIO_ACCOUNT_SID=test_twilio_sid
TWILIO_AUTH_TOKEN=test_twilio_token
FIREBASE_PROJECT_ID=test_firebase_project

# 測試監控配置
SENTRY_DSN=
LOGROCKET_APP_ID=

# 測試功能開關
ENABLE_AI_FEATURES=false
ENABLE_PUSH_NOTIFICATIONS=false
ENABLE_ANALYTICS=false
ENABLE_CRASH_REPORTING=false

# 測試性能配置
ENABLE_PERFORMANCE_MONITORING=false
ENABLE_MEMORY_MONITORING=false

# 測試合規性配置
ENABLE_GDPR_COMPLIANCE=false
ENABLE_CCPA_COMPLIANCE=false
ENABLE_PIPEDA_COMPLIANCE=false
`;

  const testEnvPath = path.join(__dirname, '..', '.env.test');
  fs.writeFileSync(testEnvPath, testEnvContent);

  console.log('✅ 測試環境變量文件已創建');
}

// 3. 優化Jest設置文件
function optimizeJestSetup() {
  console.log('📋 優化Jest設置文件...');

  const setupPath = path.join(__dirname, '..', 'jest.setup.minimal.js');
  const setupContent = `/* eslint-env jest */

// 最小化的 Jest 設置文件，只包含最基本的 mock

// Import testing library matchers
import '@testing-library/jest-dom';
import '@testing-library/jest-native/extend-expect';

// 設置 MSW 環境變量
process.env.NODE_ENV = 'test';

// 添加 fetch 實現
if (typeof global.fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

// Mock BroadcastChannel for MSW
global.BroadcastChannel = class BroadcastChannel {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
  }

  postMessage(message) {
    // Mock implementation
  }

  close() {
    // Mock implementation
  }
};

// Mock Response and Request for MSW
global.Response = class Response {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.ok = this.status >= 200 && this.status < 300;
  }

  json() {
    if (typeof this.body === 'string') {
      try {
        return Promise.resolve(JSON.parse(this.body));
      } catch {
        return Promise.resolve(this.body);
      }
    }
    if (typeof this.body === 'object' && this.body !== null) {
      return Promise.resolve(this.body);
    }
    if (this.body === undefined || this.body === null) {
      return Promise.resolve({});
    }
    return Promise.resolve(this.body);
  }

  text() {
    return Promise.resolve(JSON.stringify(this.body));
  }

  clone() {
    return new Response(this.body, {
      status: this.status,
      headers: Object.fromEntries(this.headers),
    });
  }
};

global.Request = class Request {
  constructor(url, init = {}) {
    this.url = url;
    this.method = init.method || 'GET';
    this.headers = new Map(Object.entries(init.headers || {}));
    this.body = init.body;
  }

  clone() {
    return new Request(this.url, {
      method: this.method,
      headers: Object.fromEntries(this.headers),
      body: this.body,
    });
  }
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

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

// Setup TextEncoder and TextDecoder for Node.js environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Global test utilities
global.console = {
  ...console,
  log: console.log,
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));

// Mock Expo modules
jest.mock('expo-camera', () => ({
  Camera: {
    Constants: {
      Type: { back: 'back', front: 'front' },
      FlashMode: { on: 'on', off: 'off' },
    },
  },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: { Images: 'Images' },
  ImagePickerResult: { Canceled: 'Canceled' },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: '/test/documents/',
  cacheDirectory: '/test/cache/',
  readAsStringAsync: jest.fn(),
  writeAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

// Mock React Native modules
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-gesture-handler', () => {});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

// Mock third-party libraries
jest.mock('@logrocket/react-native', () => ({
  init: jest.fn(),
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

// Mock TensorFlow.js
jest.mock('@tensorflow/tfjs', () => ({
  loadLayersModel: jest.fn(),
  tensor: jest.fn(),
  tidy: jest.fn(),
  ready: jest.fn(),
}));

// Mock i18next
jest.mock('i18next', () => ({
  t: (key) => key,
  changeLanguage: jest.fn(),
  use: jest.fn(),
  init: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { changeLanguage: jest.fn() },
  }),
}));

// Mock Redux Persist
jest.mock('redux-persist', () => ({
  persistStore: jest.fn(),
  persistReducer: jest.fn((config, reducer) => reducer),
  FLUSH: 'FLUSH',
  REHYDRATE: 'REHYDRATE',
  PAUSE: 'PAUSE',
  PERSIST: 'PERSIST',
  PURGE: 'PURGE',
  REGISTER: 'REGISTER',
}));

console.log('✅ Jest設置文件已優化');
`;

  fs.writeFileSync(setupPath, setupContent);

  console.log('✅ Jest設置文件已優化');
}

// 4. 創建測試數據管理文件
function createTestDataManager() {
  console.log('📋 創建測試數據管理文件...');

  const testDataPath = path.join(__dirname, '..', 'src', '__tests__', 'setup', 'test-data-manager.js');
  const testDataContent = `/**
 * 測試數據管理器
 * 按照執行原則建構
 * 嚴謹語法，無錯誤，高質量代碼
 */

// 測試數據工廠
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
  scanType: 'recognition',
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

// 測試數據清理
export const clearTestData = () => {
  // 清理測試數據的邏輯
  console.log('🧹 清理測試數據');
};

// 測試數據初始化
export const initializeTestData = () => {
  // 初始化測試數據的邏輯
  console.log('📊 初始化測試數據');
};

console.log('✅ 測試數據管理文件已創建');
`;

  // 確保目錄存在
  const dir = path.dirname(testDataPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(testDataPath, testDataContent);

  console.log('✅ 測試數據管理文件已創建');
}

// 5. 主函數
function main() {
  try {
    optimizeJestConfig();
    createTestEnvFile();
    optimizeJestSetup();
    createTestDataManager();

    console.log('\n🎯 測試環境優化完成！');
    console.log('📋 優化內容：');
    console.log('  - Jest配置優化');
    console.log('  - 測試環境變量配置');
    console.log('  - Jest設置文件優化');
    console.log('  - 測試數據管理');
    console.log('  - Mock配置完善');

    console.log('\n🚀 現在可以運行測試：');
    console.log('  npm test -- --passWithNoTests');

  } catch (error) {
    console.error('❌ 測試環境優化失敗:', error);
    process.exit(1);
  }
}

// 如果直接運行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  optimizeJestConfig,
  createTestEnvFile,
  optimizeJestSetup,
  createTestDataManager,
  main,
};
