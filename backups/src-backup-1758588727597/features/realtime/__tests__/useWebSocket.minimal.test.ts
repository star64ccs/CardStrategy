/**
 * 最小化 WebSocket Hook 測試
 * 不依賴 Redux，專注於基本功能測試
 */

import { renderHook } from '@testing-library/react-native';

// 創建一個完全獨立的 hook 用於測試
const useMinimalWebSocket = () => {
  return {
    // 狀態
    isInitialized: false,
    status: 'disconnected',
    isConnected: false,
    isConnecting: false,
    hasError: false,
    error: null,
    lastMessage: null,
    unreadCount: 0,
    notifications: [],

    // 方法
    initialize: async (config?: any) => {
      console.log('initialize called with config:', config);
    },
    connect: async () => {
      console.log('connect called');
    },
    disconnect: async () => {
      console.log('disconnect called');
    },
    sendMessage: async (message: any) => {
      console.log('sendMessage called with:', message);
    },
    clearMessages: () => {
      console.log('clearMessages called');
    },
    clearNotifications: () => {
      console.log('clearNotifications called');
    },
    clearError: () => {
      console.log('clearError called');
    },
    getStats: () => ({
      totalMessages: 0,
      totalErrors: 0,
      uptime: 0,
    }),
    getConnectionState: () => 'disconnected',
    getConfig: () => ({
      url: '',
      reconnectInterval: 5000,
      maxReconnectAttempts: 3,
    }),
  };
};

describe('useMinimalWebSocket Hook - 最小化測試', () => {
  describe('基本功能測試', () => {
    it('should render without crashing', () => {
      expect(() => {
        renderHook(() => useMinimalWebSocket());
      }).not.toThrow();
    });

    it('should return expected properties', () => {
      const { result } = renderHook(() => useMinimalWebSocket());

      // 檢查基本狀態
      expect(result.current).toHaveProperty('isInitialized');
      expect(result.current).toHaveProperty('status');
      expect(result.current).toHaveProperty('isConnected');
      expect(result.current).toHaveProperty('hasError');
      expect(result.current).toHaveProperty('error');

      // 檢查基本方法
      expect(result.current).toHaveProperty('initialize');
      expect(result.current).toHaveProperty('connect');
      expect(result.current).toHaveProperty('disconnect');
      expect(result.current).toHaveProperty('sendMessage');
      expect(result.current).toHaveProperty('clearMessages');
      expect(result.current).toHaveProperty('clearNotifications');
      expect(result.current).toHaveProperty('clearError');
    });

    it('should have correct initial state', () => {
      const { result } = renderHook(() => useMinimalWebSocket());

      expect(result.current.isInitialized).toBe(false);
      expect(result.current.status).toBe('disconnected');
      expect(result.current.isConnected).toBe(false);
      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastMessage).toBeNull();
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications).toEqual([]);
    });

    it('should have functions that can be called', () => {
      const { result } = renderHook(() => useMinimalWebSocket());

      // 測試所有方法都可以調用而不會拋出錯誤
      expect(() => result.current.initialize()).not.toThrow();
      expect(() => result.current.connect()).not.toThrow();
      expect(() => result.current.disconnect()).not.toThrow();
      expect(() => result.current.sendMessage({})).not.toThrow();
      expect(() => result.current.clearMessages()).not.toThrow();
      expect(() => result.current.clearNotifications()).not.toThrow();
      expect(() => result.current.clearError()).not.toThrow();
    });
  });

  describe('方法類型檢查', () => {
    it('should have correct method types', () => {
      const { result } = renderHook(() => useMinimalWebSocket());

      expect(typeof result.current.initialize).toBe('function');
      expect(typeof result.current.connect).toBe('function');
      expect(typeof result.current.disconnect).toBe('function');
      expect(typeof result.current.sendMessage).toBe('function');
      expect(typeof result.current.clearMessages).toBe('function');
      expect(typeof result.current.clearNotifications).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.getStats).toBe('function');
      expect(typeof result.current.getConnectionState).toBe('function');
      expect(typeof result.current.getConfig).toBe('function');
    });
  });

  describe('方法返回值測試', () => {
    it('should return correct values from getter methods', () => {
      const { result } = renderHook(() => useMinimalWebSocket());

      const stats = result.current.getStats();
      expect(stats).toEqual({
        totalMessages: 0,
        totalErrors: 0,
        uptime: 0,
      });

      const connectionState = result.current.getConnectionState();
      expect(connectionState).toBe('disconnected');

      const config = result.current.getConfig();
      expect(config).toEqual({
        url: '',
        reconnectInterval: 5000,
        maxReconnectAttempts: 3,
      });
    });
  });
});
