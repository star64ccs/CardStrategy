/**
 * WebSocket Hooks 測試
 * 測試 WebSocket 相關的自定義 React Hooks
 */

import { configureStore } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';

import websocketReducer from '../../../store/slices/websocketSlice';
import { useWebSocket } from '../hooks/useWebSocket';
import { websocketService } from '../services/websocketService';

// Mock dependencies
jest.mock('../services/websocketService');
jest.mock('../../../core/utils/logger');

const _mockWebsocketService = websocketService as jest.Mocked<
  typeof websocketService
>;

describe('WebSocket Hooks', () => {
  let store: ReturnType<typeof setupStore>;

  const _setupStore = () => {
    return configureStore({
      reducer: {
        websocket: websocketReducer,
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

  const _wrapper = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(Provider, { store }, children);
  };

  describe('useWebSocket', () => {
    it('should return websocket state and methods', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      expect(result.current).toHaveProperty('isInitialized');
      expect(result.current).toHaveProperty('status');
      expect(result.current).toHaveProperty('isConnected');
      expect(result.current).toHaveProperty('isConnecting');
      expect(result.current).toHaveProperty('hasError');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('messages');
      expect(result.current).toHaveProperty('lastMessage');
      expect(result.current).toHaveProperty('unreadCount');
      expect(result.current).toHaveProperty('notifications');
      expect(result.current).toHaveProperty('stats');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('initialize');
      expect(result.current).toHaveProperty('connect');
      expect(result.current).toHaveProperty('disconnect');
      expect(result.current).toHaveProperty('sendMessage');
    });

    it('should initialize websocket successfully', async () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      const _config = {
        url: 'ws://test.com/ws',
        reconnectInterval: 3000,
      };

      await act(async () => {
        await result.current.initialize(config);
      });

      expect(mockWebsocketService.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'ws://test.com/ws',
        })
      );
    });

    it('should connect websocket successfully', async () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      await act(async () => {
        await result.current.connect();
      });

      expect(mockWebsocketService.connect).toHaveBeenCalled();
    });

    it('should disconnect websocket successfully', async () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      await act(async () => {
        await result.current.disconnect();
      });

      expect(mockWebsocketService.disconnect).toHaveBeenCalled();
    });

    it('should send message successfully', async () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      const _message = {
        type: 'chat_message',
        data: { content: 'Hello' },
      };

      await act(async () => {
        await result.current.sendMessage(message);
      });

      expect(mockWebsocketService.sendMessage).toHaveBeenCalledWith(message);
    });

    it('should clear messages', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      act(() => {
        result.current.clearMessages();
      });

      const _state = store.getState().websocket;
      expect(state.messages).toHaveLength(0);
    });

    it('should clear notifications', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      act(() => {
        result.current.clearNotifications();
      });

      const _state = store.getState().websocket;
      expect(state.notifications).toHaveLength(0);
    });

    it('should clear error', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      act(() => {
        result.current.clearError();
      });

      const _state = store.getState().websocket;
      expect(state.error).toBeNull();
    });

    it('should get stats', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      const _stats = result.current.getStats();
      expect(stats).toBeDefined();
    });

    it('should get connection state', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      const _state = result.current.getConnectionState();
      expect(state).toBeDefined();
    });

    it('should get config', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

      const _config = result.current.getConfig();
      expect(config).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const _error = new Error('Service error');
      mockWebsocketService.initialize.mockRejectedValue(error);

      const { result } = renderHook(() => useWebSocket(), { wrapper });

      await act(async () => {
        try {
          await result.current.initialize({});
        } catch (e) {
          // Error should be caught and handled
        }
      });

      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe('Service error');
    });

    it('should handle connection errors', async () => {
      const _error = new Error('Connection failed');
      mockWebsocketService.connect.mockRejectedValue(error);

      const { result } = renderHook(() => useWebSocket(), { wrapper });

      await act(async () => {
        try {
          await result.current.connect();
        } catch (e) {
          // Error should be caught and handled
        }
      });

      expect(result.current.hasError).toBe(true);
      expect(result.current.error).toBe('Connection failed');
    });
  });
});
