/**
 * 簡化版 useWebSocket Hook 測試
 * 專注於基本功能測試，避免複雜的異步操作
 */

import { configureStore } from '@reduxjs/toolkit';
import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { Provider } from 'react-redux';
import { useWebSocket } from '../hooks/useWebSocket.simple';

// Mock WebSocket Service
const mockWebsocketService = {
  initialize: jest.fn(),
  connect: jest.fn(),
  disconnect: jest.fn(),
  sendMessage: jest.fn(),
  setEventHandlers: jest.fn(),
  getConnectionState: jest.fn(() => 'disconnected'),
  getStats: jest.fn(() => ({
    totalMessages: 0,
    totalErrors: 0,
    uptime: 0,
  })),
  getConfig: jest.fn(() => ({
    url: '',
    reconnectInterval: 5000,
    maxReconnectAttempts: 3,
  })),
};

// Mock websocketSlice
const mockWebsocketSlice = {
  name: 'websocket',
  initialState: {
    isInitialized: false,
    status: 'disconnected',
    isConnected: false,
    isConnecting: false,
    hasError: false,
    error: null,
    messages: [],
    lastMessage: null,
    unreadCount: 0,
    notifications: [],
    currentRooms: [],
    subscriptions: [],
    loading: false,
    stats: {
      totalMessages: 0,
      totalErrors: 0,
      uptime: 0,
    },
  },
  reducers: {
    setError: (state: any, action: any) => {
      state.error = action.payload;
      state.hasError = true;
    },
    clearError: (state: any) => {
      state.error = null;
      state.hasError = false;
    },
    clearMessages: (state: any) => {
      state.messages = [];
    },
    clearNotifications: (state: any) => {
      state.notifications = [];
    },
  },
};

// 設置測試 store
const setupStore = () => {
  return configureStore({
    reducer: {
      websocket: (state = mockWebsocketSlice.initialState, action: any) => {
        const reducer = mockWebsocketSlice.reducers[action.type];
        if (reducer) {
          reducer(state, action);
        }
        return state;
      },
    },
  });
};

// Mock websocketService
jest.mock('../services/websocketService', () => ({
  websocketService: mockWebsocketService,
}));

// Mock websocketSlice actions
jest.mock('../../../store/slices/websocketSlice', () => ({
  initializeWebSocket: jest.fn(() => ({
    type: 'websocket/initializeWebSocket',
  })),
  connectWebSocket: jest.fn(() => ({ type: 'websocket/connectWebSocket' })),
  disconnectWebSocket: jest.fn(() => ({
    type: 'websocket/disconnectWebSocket',
  })),
  sendWebSocketMessage: jest.fn(() => ({
    type: 'websocket/sendWebSocketMessage',
  })),
  broadcastMessage: jest.fn(() => ({ type: 'websocket/broadcastMessage' })),
  reconnectWebSocket: jest.fn(() => ({ type: 'websocket/reconnectWebSocket' })),
  setError: jest.fn(message => ({ type: 'setError', payload: message })),
  clearError: jest.fn(() => ({ type: 'clearError' })),
  clearMessages: jest.fn(() => ({ type: 'clearMessages' })),
  clearNotifications: jest.fn(() => ({ type: 'clearNotifications' })),
  setVisibility: jest.fn(() => ({ type: 'setVisibility' })),
  updateConnectionState: jest.fn(() => ({ type: 'updateConnectionState' })),
  updateStats: jest.fn(() => ({ type: 'updateStats' })),
  joinRoom: jest.fn(() => ({ type: 'joinRoom' })),
  leaveRoom: jest.fn(() => ({ type: 'leaveRoom' })),
  receiveMessage: jest.fn(() => ({ type: 'receiveMessage' })),
  addSubscription: jest.fn(() => ({ type: 'addSubscription' })),
  removeSubscription: jest.fn(() => ({ type: 'removeSubscription' })),
}));

describe('useWebSocket Hook - 簡化測試', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => {
    const store = setupStore();
    return React.createElement(Provider, { store }, children);
  };

  describe('基本功能測試', () => {
    it('should render without crashing', () => {
      expect(() => {
        renderHook(() => useWebSocket(), { wrapper });
      }).not.toThrow();
    });

    it('should return expected properties', () => {
      const { result } = renderHook(() => useWebSocket(), { wrapper });

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
      const { result } = renderHook(() => useWebSocket(), { wrapper });

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
      const { result } = renderHook(() => useWebSocket(), { wrapper });

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
      const { result } = renderHook(() => useWebSocket(), { wrapper });

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
});
