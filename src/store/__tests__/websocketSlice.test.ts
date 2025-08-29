/**
 * WebSocket Redux Slice 測試
 * 測試 WebSocket 相關的 Redux 狀態管理
 */

import { configureStore } from '@reduxjs/toolkit';

import { websocketService } from '../../features/realtime/services/websocketService';
import type {
  WebSocketMessage,
  WebSocketConfig,
  ConnectionState,
  WebSocketStats,
  BroadcastOptions,
} from '../../features/realtime/types/websocket';
import websocketReducer, {
  websocketSlice,
  receiveMessage,
  updateConnectionState,
  updateStats,
  clearMessages,
  clearNotifications,
  setVisibility,
  addSubscription,
  removeSubscription,
  clearError,
  setError,
  initializeWebSocket,
  connectWebSocket,
  disconnectWebSocket,
  sendWebSocketMessage,
  broadcastMessage,
  reconnectWebSocket,
  joinRoom,
  leaveRoom,
  selectStatus,
  selectIsConnected,
  selectIsConnecting,
  selectHasError,
} from '../slices/websocketSlice';

// Mock dependencies
jest.mock('../../features/realtime/services/websocketService');
jest.mock('../../core/utils/logger');

const _mockWebsocketService = websocketService as jest.Mocked<
  typeof websocketService
>;

describe('WebSocket Slice', () => {
  let store: ReturnType<typeof setupStore>;

  const _setupStore = () => {
    return configureStore({
      reducer: {
        websocket: websocketReducer,
      },
    });
  };

  beforeEach(() => {
    store = setupStore();
    jest.clearAllMocks();

    // Reset singleton instance
    (websocketService as any).instance = null;
    (websocketService as any).isInitialized = false;
  });

  describe('reducers', () => {
    describe('receiveMessage', () => {
      it('should add message to messages array', () => {
        const message: WebSocketMessage = {
          id: 'msg-1',
          type: 'chat_message',
          timestamp: new Date().toISOString(),
          data: { content: 'Hello' },
          sender: 'user123',
        };

        store.dispatch(receiveMessage(message));

        const _state = store.getState().websocket;
        expect(state.messages).toHaveLength(1);
        expect(state.messages[0]).toEqual(message);
        expect(state.lastMessage).toEqual(message);
        expect(state.unreadCount).toBe(0); // isVisible is true, so unreadCount should not increase
      });

      it('should limit message history', () => {
        const _initialState = store.getState().websocket;
        const _maxMessages = initialState.config.messageHistoryLimit;

        // Add more messages than the limit
        for (let i = 0; i < maxMessages + 5; i++) {
          const message: WebSocketMessage = {
            id: `msg-${i}`,
            type: 'chat_message',
            timestamp: new Date().toISOString(),
            data: { content: `Message ${i}` },
          };
          store.dispatch(receiveMessage(message));
        }

        const _state = store.getState().websocket;
        expect(state.messages).toHaveLength(maxMessages + 5); // messages array is not limited
        expect(state.messageHistory).toHaveLength(maxMessages); // messageHistory is limited
        expect(state.messageHistory[0].id).toBe('msg-5'); // Oldest message should be the 5th one
      });

      it('should handle notification messages', () => {
        const notification: WebSocketMessage = {
          id: 'notif-1',
          type: 'notification',
          timestamp: new Date().toISOString(),
          data: { title: 'New Card', content: 'Card added to collection' },
          priority: 'high',
        };

        store.dispatch(receiveMessage(notification));

        const _state = store.getState().websocket;
        expect(state.notifications).toHaveLength(1);
        expect(state.notifications[0]).toEqual(notification);
      });

      it('should limit notification history', () => {
        const _initialState = store.getState().websocket;
        const _maxNotifications = initialState.config.notificationLimit;

        // Add more notifications than the limit
        for (let i = 0; i < maxNotifications + 3; i++) {
          const notification: WebSocketMessage = {
            id: `notif-${i}`,
            type: 'notification',
            timestamp: new Date().toISOString(),
            data: { title: `Notification ${i}` },
            priority: 'high', // Add priority to trigger notification
          };
          store.dispatch(receiveMessage(notification));
        }

        const _state = store.getState().websocket;
        expect(state.notifications).toHaveLength(maxNotifications);
        expect(state.notifications[0].id).toBe('notif-3'); // Oldest notification should be the 3rd one
      });
    });

    describe('updateConnectionState', () => {
      it('should update connection state', () => {
        const newState: ConnectionState = {
          status: 'connected',
          reconnectAttempts: 0,
          bytesReceived: 1024,
          bytesSent: 512,
          messagesReceived: 5,
          messagesSent: 3,
        };

        store.dispatch(updateConnectionState(newState));

        const _state = store.getState().websocket;
        expect(state.status).toBe('connected');
        expect(state.connectionState).toEqual(newState);
      });
    });

    describe('updateStats', () => {
      it('should update stats', () => {
        const newStats: WebSocketStats = {
          uptime: 60000,
          totalConnections: 5,
          successfulConnections: 4,
          failedConnections: 1,
          totalMessagesSent: 100,
          totalMessagesReceived: 95,
          errorCount: 2,
          errorRate: 2.1,
          reliability: 97.9,
          averageLatency: 150,
          lastHeartbeat: new Date().toISOString(),
        };

        store.dispatch(updateStats(newStats));

        const _state = store.getState().websocket;
        expect(state.stats).toEqual(newStats);
      });
    });

    describe('clearMessages', () => {
      it('should clear all messages', () => {
        // Add some messages first
        const message: WebSocketMessage = {
          id: 'msg-1',
          type: 'chat_message',
          timestamp: new Date().toISOString(),
          data: { content: 'Hello' },
        };
        store.dispatch(receiveMessage(message));

        store.dispatch(clearMessages());

        const _state = store.getState().websocket;
        expect(state.messages).toHaveLength(0);
        expect(state.lastMessage).toBeNull();
        expect(state.unreadCount).toBe(0);
      });
    });

    describe('clearNotifications', () => {
      it('should clear all notifications', () => {
        // Add some notifications first
        const notification: WebSocketMessage = {
          id: 'notif-1',
          type: 'notification',
          timestamp: new Date().toISOString(),
          data: { title: 'Test' },
        };
        store.dispatch(receiveMessage(notification));

        store.dispatch(clearNotifications());

        const _state = store.getState().websocket;
        expect(state.notifications).toHaveLength(0);
      });
    });

    describe('setVisibility', () => {
      it('should update visibility state', () => {
        store.dispatch(setVisibility(false));

        const _state = store.getState().websocket;
        expect(state.isVisible).toBe(false);
      });
    });

    describe('addSubscription', () => {
      it('should add subscription', () => {
        const _subscription = {
          id: 'sub-1',
          filter: {
            messageTypes: ['card_update'],
            priority: ['high'],
          },
        };

        store.dispatch(addSubscription(subscription));

        const _state = store.getState().websocket;
        expect(state.subscriptions).toHaveLength(1);
        expect(state.subscriptions[0]).toEqual(subscription);
      });
    });

    describe('removeSubscription', () => {
      it('should remove subscription', () => {
        // Add subscription first
        const _subscription = {
          id: 'sub-1',
          filter: {
            messageTypes: ['card_update'],
          },
        };
        store.dispatch(addSubscription(subscription));

        store.dispatch(removeSubscription('sub-1'));

        const _state = store.getState().websocket;
        expect(state.subscriptions).toHaveLength(0);
      });
    });

    describe('clearError', () => {
      it('should clear error state', () => {
        // Set error first
        store.dispatch(setError('Test error'));

        store.dispatch(clearError());

        const _state = store.getState().websocket;
        expect(state.error).toBeNull();
      });
    });

    describe('setError', () => {
      it('should set error state', () => {
        const _errorMessage = 'Connection failed';

        store.dispatch(setError(errorMessage));

        const _state = store.getState().websocket;
        expect(state.error).toBe(errorMessage);
      });
    });
  });

  describe('async thunks', () => {
    beforeEach(async () => {
      // Initialize service for thunk tests
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    describe('initializeWebSocket', () => {
      it('should initialize websocket service successfully', async () => {
        mockWebsocketService.initialize.mockResolvedValue();

        const config: Partial<WebSocketConfig> = {
          url: 'ws://test.com/ws',
          reconnectInterval: 3000,
        };

        await store.dispatch(initializeWebSocket(config));

        expect(mockWebsocketService.initialize).toHaveBeenCalledWith(config);

        const _state = store.getState().websocket;
        expect(state.isInitialized).toBe(true);
        expect(state.loading.initializing).toBe(false);
      });

      it('should handle initialization error', async () => {
        const _error = new Error('Initialization failed');
        mockWebsocketService.initialize.mockRejectedValue(error);

        const _result = await store.dispatch(initializeWebSocket({}));

        expect(result.meta.requestStatus).toBe('rejected');

        const _state = store.getState().websocket;
        expect(state.error).toBe('Initialization failed');
        expect(state.loading.initializing).toBe(false);
      });
    });

    describe('connectWebSocket', () => {
      it('should connect websocket successfully', async () => {
        mockWebsocketService.connect.mockResolvedValue();

        await store.dispatch(connectWebSocket());

        expect(mockWebsocketService.connect).toHaveBeenCalled();

        const _state = store.getState().websocket;
        expect(state.loading.connecting).toBe(false);
      });

      it('should handle connection error', async () => {
        const _error = new Error('Connection failed');
        mockWebsocketService.connect.mockRejectedValue(error);

        const _result = await store.dispatch(connectWebSocket());

        expect(result.meta.requestStatus).toBe('rejected');

        const _state = store.getState().websocket;
        expect(state.error).toBe('Connection failed');
        expect(state.loading.connecting).toBe(false);
      });
    });

    describe('disconnectWebSocket', () => {
      it('should disconnect websocket successfully', async () => {
        mockWebsocketService.disconnect.mockResolvedValue();

        await store.dispatch(disconnectWebSocket());

        expect(mockWebsocketService.disconnect).toHaveBeenCalled();

        const _state = store.getState().websocket;
        expect(state.loading.disconnecting).toBe(false);
      });
    });

    describe('sendWebSocketMessage', () => {
      it('should send message successfully', async () => {
        mockWebsocketService.sendMessage.mockResolvedValue();

        const message: Partial<WebSocketMessage> = {
          type: 'chat_message',
          data: { content: 'Hello' },
        };

        await store.dispatch(sendWebSocketMessage(message));

        expect(mockWebsocketService.sendMessage).toHaveBeenCalledWith(message);

        const _state = store.getState().websocket;
        expect(state.loading.sendingMessage).toBe(false);
      });

      it('should handle send error', async () => {
        const _error = new Error('Send failed');
        mockWebsocketService.sendMessage.mockRejectedValue(error);

        const message: Partial<WebSocketMessage> = {
          type: 'chat_message',
          data: { content: 'Hello' },
        };

        const _result = await store.dispatch(sendWebSocketMessage(message));

        expect(result.meta.requestStatus).toBe('rejected');

        const _state = store.getState().websocket;
        expect(state.error).toBe('Send failed');
        expect(state.loading.sendingMessage).toBe(false);
      });
    });

    describe('broadcastMessage', () => {
      it('should broadcast message successfully', async () => {
        mockWebsocketService.broadcast.mockResolvedValue();

        const message: Partial<WebSocketMessage> = {
          type: 'notification',
          data: { content: 'Broadcast' },
        };
        const options: BroadcastOptions = {
          room: 'general',
          priority: 'high',
        };

        await store.dispatch(broadcastMessage({ message, options }));

        expect(mockWebsocketService.broadcast).toHaveBeenCalledWith(
          message,
          options
        );

        const _state = store.getState().websocket;
        expect(state.loading.broadcasting).toBe(false);
      });
    });

    describe('reconnectWebSocket', () => {
      it('should reconnect websocket successfully', async () => {
        mockWebsocketService.reconnect.mockResolvedValue();

        await store.dispatch(reconnectWebSocket());

        expect(mockWebsocketService.reconnect).toHaveBeenCalled();

        const _state = store.getState().websocket;
        expect(state.loading.reconnecting).toBe(false);
      });
    });

    describe('joinRoom', () => {
      it('should join room successfully', async () => {
        mockWebsocketService.joinRoom.mockResolvedValue();

        const _roomId = 'test-room';
        const _userInfo = { userId: 'user123' };

        await store.dispatch(joinRoom({ roomId, userInfo }));

        expect(mockWebsocketService.joinRoom).toHaveBeenCalledWith(
          roomId,
          userInfo
        );

        const _state = store.getState().websocket;
        expect(state.loading.joiningRoom).toBe(false);
      });
    });

    describe('leaveRoom', () => {
      it('should leave room successfully', async () => {
        mockWebsocketService.leaveRoom.mockResolvedValue();

        const _roomId = 'test-room';

        await store.dispatch(leaveRoom(roomId));

        expect(mockWebsocketService.leaveRoom).toHaveBeenCalledWith(roomId);

        const _state = store.getState().websocket;
        expect(state.loading.leavingRoom).toBe(false);
      });
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const _state = store.getState().websocket;

      expect(state).toEqual({
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
        messages: [],
        notifications: [],
        lastMessage: null,
        unreadCount: 0,
        isVisible: true,
        subscriptions: [],
        currentRooms: [],
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
        error: null,
        lastError: null,
        messageHistory: [],
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
      });
    });
  });

  describe('selectors', () => {
    it('should select connection status correctly', () => {
      const _state = store.getState();

      // Test initial state
      expect(selectStatus(state)).toBe('disconnected');
      expect(selectIsConnected(state)).toBe(false);
      expect(selectIsConnecting(state)).toBe(false);
      expect(selectHasError(state)).toBe(false);

      // Test connected state
      store.dispatch(
        updateConnectionState({
          status: 'connected',
          reconnectAttempts: 0,
          bytesReceived: 0,
          bytesSent: 0,
          messagesReceived: 0,
          messagesSent: 0,
        })
      );

      const _connectedState = store.getState();
      expect(selectStatus(connectedState)).toBe('connected');
      expect(selectIsConnected(connectedState)).toBe(true);
      expect(selectIsConnecting(connectedState)).toBe(false);

      // Test connecting state
      store.dispatch(
        updateConnectionState({
          status: 'connecting',
          reconnectAttempts: 0,
          bytesReceived: 0,
          bytesSent: 0,
          messagesReceived: 0,
          messagesSent: 0,
        })
      );

      const _connectingState = store.getState();
      expect(selectIsConnecting(connectingState)).toBe(true);

      // Test error state
      store.dispatch(setError('Test error'));

      const _errorState = store.getState();
      expect(selectHasError(errorState)).toBe(true);
    });
  });
});
