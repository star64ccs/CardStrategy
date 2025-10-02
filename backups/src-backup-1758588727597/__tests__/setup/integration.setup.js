/**
 * 整合測試設置文件
 * 服務間交互，API調用測試
 */

import '@testing-library/jest-native/extend-expect';
import { configure } from '@testing-library/react-native';

// 配置測試庫
configure({
  asyncUtilTimeout: 10000,
  getElementError: (message, container) => {
    const error = new Error(message);
    error.stack = null;
    return error;
  },
});

// 全局測試設置
beforeEach(() => {
  // 清理所有模擬
  jest.clearAllMocks();
});

afterEach(() => {
  // 重置所有模擬
  jest.resetAllMocks();
});

// 模擬全局對象
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 模擬 React Native 平台
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(obj => obj.ios),
}));

// 模擬 AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// 模擬 Expo 模組
jest.mock('expo', () => ({
  ...jest.requireActual('expo'),
  Linking: {
    openURL: jest.fn(),
  },
}));

// 模擬網路請求
global.fetch = jest.fn();

// 模擬計時器
jest.useFakeTimers();

// 設置測試環境變量
process.env.NODE_ENV = 'test';
process.env.API_BASE_URL = 'http://localhost:3000';
