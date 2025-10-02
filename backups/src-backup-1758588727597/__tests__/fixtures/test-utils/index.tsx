/**
 * 測試工具函數
 */

import { configureStore } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react-native';
import React from 'react';

// Mock Redux Store
export const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      // 添加必要的 reducers
      auth: (state = { user: null, isAuthenticated: false }, action) => state,
      cards: (state = { items: [], loading: false }, action) => state,
      market: (state = { prices: {}, loading: false }, action) => state,
      ...initialState,
    },
    preloadedState: initialState,
  });
};

// 自定義渲染函數
export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createMockStore(preloadedState),
    ...renderOptions
  }: RenderOptions & { preloadedState?: any; store?: any } = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// 等待異步操作完成
export const waitForAsync = (ms = 0) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 模擬用戶輸入
export const mockUserInput = (value: string) => {
  return {
    target: { value },
    currentTarget: { value },
    nativeEvent: { text: value },
  };
};

// 模擬觸摸事件
export const mockTouchEvent = (x = 0, y = 0) => {
  return {
    nativeEvent: {
      locationX: x,
      locationY: y,
      pageX: x,
      pageY: y,
    },
  };
};

// 模擬滾動事件
export const mockScrollEvent = (contentOffset = { x: 0, y: 0 }) => {
  return {
    nativeEvent: {
      contentOffset,
      contentSize: { width: 375, height: 812 },
      layoutMeasurement: { width: 375, height: 812 },
    },
  };
};

// 生成隨機測試數據
export const generateTestData = (type: string, count = 1) => {
  const generators = {
    string: () => Math.random().toString(36).substring(7),
    number: () => Math.floor(Math.random() * 1000),
    boolean: () => Math.random() > 0.5,
    email: () => `${Math.random().toString(36).substring(7)}@example.com`,
    url: () => `https://example.com/${Math.random().toString(36).substring(7)}`,
    date: () => new Date().toISOString(),
  };

  if (count === 1) {
    return generators[type as keyof typeof generators]?.() || '';
  }

  return Array.from(
    { length: count },
    () => generators[type as keyof typeof generators]?.() || ''
  );
};

// 模擬 API 響應
export const mockApiResponse = (data: any, success = true) => {
  return Promise.resolve({
    success,
    ...data,
  });
};

// 模擬 API 錯誤
export const mockApiError = (message = 'API Error') => {
  return Promise.reject(new Error(message));
};

// 模擬延遲
export const mockDelay = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// 清理測試環境
export const cleanupTest = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
};

// 設置測試環境變量
export const setTestEnv = (env: Record<string, string>) => {
  Object.entries(env).forEach(([key, value]) => {
    process.env[key] = value;
  });
};

// 重置測試環境變量
export const resetTestEnv = () => {
  delete process.env.NODE_ENV;
  delete process.env.API_BASE_URL;
  delete process.env.TEST_MODE;
};

// 模擬文件上傳
export const mockFileUpload = (file: {
  name: string;
  type: string;
  size: number;
}) => {
  return {
    name: file.name,
    type: file.type,
    size: file.size,
    uri: `file://mock/${file.name}`,
  };
};

// 模擬圖片選擇
export const mockImagePicker = (imageUri: string) => {
  return {
    assets: [
      {
        uri: imageUri,
        width: 800,
        height: 600,
        type: 'image/jpeg',
        fileSize: 125000,
      },
    ],
    canceled: false,
  };
};

// 模擬相機權限
export const mockCameraPermission = (granted: boolean) => {
  return {
    status: granted ? 'granted' : 'denied',
    granted,
  };
};

// 模擬網絡狀態
export const mockNetworkState = (isConnected: boolean) => {
  return {
    isConnected,
    type: isConnected ? 'wifi' : 'none',
  };
};
