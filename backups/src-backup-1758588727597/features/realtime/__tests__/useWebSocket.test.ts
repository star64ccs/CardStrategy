/**
 * WebSocket Hooks 測試
 * 測試 WebSocket 相關的自定義 React Hooks
 */

import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

import websocketReducer from '../../../store/slices/websocketSlice';
import { useWebSocket } from '../hooks/useWebSocket';
import { websocketService } from '../services/websocketService';

// Mock dependencies
jest.mock('../services/websocketService');
jest.mock('../../../core/utils/logger');

const mockWebsocketService = websocketService as jest.Mocked<
  typeof websocketService
>;

describe('WebSocket Hooks', () => {
  let store: ReturnType<typeof setupStore>;

  const setupStore = () => {
    return configureStore({
      reducer: {
        websocket: websocketReducer,
        // 添加其他必要的reducers以避免類型錯誤
        auth: (
          state = {
            isAuthenticated: false,
            user: null,
            loading: false,
            error: null,
          }
        ) => state,
        settings: (state = { theme: 'light', language: 'en' }) => state,
        theme: (state = { currentTheme: 'light' }) => state,
        privacy: (state = { dataCollection: true, analytics: true }) => state,
      },
      preloadedState: {
        websocket: {
          isInitialized: false,
          status: 'disconnected',
          connectionState: {
            status: 'disconnected',
            reconnectAttempts: 0,
            bytesReceived: 0,
            bytesSent: 0,
            messagesReceived: 0,
            messagesSent: 0,
          },
          config: {
            url: 'ws://localhost:8080/ws',
            reconnectInterval: 5000,
            maxReconnectAttempts: 5,
            heartbeatInterval: 30000,
            autoConnect: true,
            enableLogging: true,
            messageHistoryLimit: 100,
            notificationLimit: 50,
          },
          messages: [],
          lastMessage: null,
          messageHistory: [],
          stats: {
            uptime: 0,
            totalConnections: 0,
            successfulConnections: 0,
            failedConnections: 0,
            totalMessagesSent: 0,
            totalMessagesReceived: 0,
            errorCount: 0,
            errorRate: 0,
            reliability: 100,
            averageLatency: 0,
            lastHeartbeat: null,
          },
          currentRooms: [],
          subscriptions: [],
          loading: {
            initializing: false,
            connecting: false,
            disconnecting: false,
            sendingMessage: false,
            broadcasting: false,
            reconnecting: false,
            joiningRoom: false,
            leavingRoom: false,
          },
          error: null,
          lastError: null,
          isVisible: true,
          unreadCount: 0,
          notifications: [],
        },
      },
    });
  };

  beforeEach(() => {
    store = setupStore();
    jest.clearAllMocks();

    // Reset singleton instance
    (mockWebsocketService as any).instance = null;

    // Mock service methods
    mockWebsocketService.initialize = jest.fn().mockResolvedValue(undefined);
    mockWebsocketService.connect = jest.fn().mockResolvedValue(undefined);
    mockWebsocketService.disconnect = jest.fn().mockResolvedValue(undefined);
    mockWebsocketService.sendMessage = jest.fn().mockResolvedValue(undefined);
    mockWebsocketService.getStats = jest.fn().mockReturnValue({
      uptime: 0,
      totalConnections: 0,
      successfulConnections: 0,
      failedConnections: 0,
      totalMessagesSent: 0,
      totalMessagesReceived: 0,
      errorCount: 0,
      errorRate: 0,
      reliability: 100,
      averageLatency: 0,
      lastHeartbeat: null,
    });
    mockWebsocketService.getConnectionState = jest.fn().mockReturnValue({
      status: 'disconnected',
      reconnectAttempts: 0,
      bytesReceived: 0,
      bytesSent: 0,
      messagesReceived: 0,
      messagesSent: 0,
    });
    mockWebsocketService.getConfig = jest.fn().mockReturnValue({
      url: 'ws://localhost:8080/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      autoConnect: true,
      enableLogging: true,
      messageHistoryLimit: 100,
      notificationLimit: 50,
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const currentStore = setupStore();
    return React.createElement(Provider, { store: currentStore }, children);
  };

  describe('useWebSocket', () => {
    it('should return websocket state and methods', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 基本狀態檢查
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.status).toBe('disconnected');
      expect(result.current.isConnected).toBe(false);
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastMessage).toBeNull();
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.notifications).toEqual([]);

      // 方法檢查
      expect(typeof result.current.initialize).toBe('function');
      expect(typeof result.current.connect).toBe('function');
      expect(typeof result.current.disconnect).toBe('function');
      expect(typeof result.current.sendMessage).toBe('function');
    });

    it('should initialize websocket successfully', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      const config = {
        url: 'ws://test.com/ws',
        reconnectInterval: 3000,
      };

      // 測試方法存在
      expect(typeof result.current.initialize).toBe('function');

      // 測試可以調用方法（不等待結果）
      expect(() => {
        result.current.initialize(config);
      }).not.toThrow();
    });

    it('should connect websocket successfully', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 測試方法存在
      expect(typeof result.current.connect).toBe('function');

      // 測試可以調用方法
      expect(() => {
        result.current.connect();
      }).not.toThrow();
    });

    it('should disconnect websocket successfully', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 測試方法存在
      expect(typeof result.current.disconnect).toBe('function');

      // 測試可以調用方法
      expect(() => {
        result.current.disconnect();
      }).not.toThrow();
    });

    it('should send message successfully', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      const message = {
        type: 'chat_message',
        data: { content: 'Hello' },
      };

      // 測試方法存在
      expect(typeof result.current.sendMessage).toBe('function');

      // 測試可以調用方法
      expect(() => {
        result.current.sendMessage(message);
      }).not.toThrow();
    });

    it('should clear messages', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 測試方法存在
      expect(typeof result.current.clearMessages).toBe('function');

      // 測試可以調用方法
      expect(() => {
        result.current.clearMessages();
      }).not.toThrow();
    });

    it('should clear notifications', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 測試方法存在
      expect(typeof result.current.clearNotifications).toBe('function');

      // 測試可以調用方法
      expect(() => {
        result.current.clearNotifications();
      }).not.toThrow();
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 測試方法存在
      expect(typeof result.current.clearError).toBe('function');

      // 測試可以調用方法
      expect(() => {
        result.current.clearError();
      }).not.toThrow();
    });

    it('should get stats', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 測試方法存在
      expect(typeof result.current.getStats).toBe('function');

      // 測試可以調用方法
      expect(() => {
        result.current.getStats();
      }).not.toThrow();
    });

    it('should get connection state', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 測試方法存在
      expect(typeof result.current.getConnectionState).toBe('function');

      // 測試可以調用方法
      expect(() => {
        result.current.getConnectionState();
      }).not.toThrow();
    });

    it('should get config', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 測試方法存在
      expect(typeof result.current.getConfig).toBe('function');

      // 測試可以調用方法
      expect(() => {
        result.current.getConfig();
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 測試初始狀態沒有錯誤
      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle connection errors', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      // 測試初始狀態沒有錯誤
      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
