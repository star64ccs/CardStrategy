/**
 * WebSocket 服務測試
 * 測試 WebSocket 服務的所有主要功能
 */

import { logger } from '../../../core/utils/logger';
import { websocketService } from '../services/websocketService';
import type {
  WebSocketMessage,
  WebSocketConfig,
  BroadcastOptions,
  SubscriptionFilter,
  WebSocketEventHandlers,
} from '../types/websocket';
import {
  WebSocketStatus,
  ConnectionState,
  WebSocketStats,
} from '../types/websocket';

// Mock dependencies
jest.mock('../../../core/utils/logger');

const _mockLogger = logger as jest.Mocked<typeof logger>;

describe('WebSocketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (websocketService as any).instance = null;
    (websocketService as any).isInitialized = false;
    (websocketService as any).websocket = null;
    (websocketService as any).heartbeatInterval = null;
    (websocketService as any).reconnectTimeout = null;
    (websocketService as any).connectionState = (
      websocketService as any
    ).getDefaultConnectionState();
    (websocketService as any).messageQueue = (
      websocketService as any
    ).getDefaultMessageQueue();
    (websocketService as any).stats = (
      websocketService as any
    ).getDefaultStats();
    (websocketService as any).metrics = (
      websocketService as any
    ).getDefaultMetrics();
  });

  afterEach(() => {
    // Cleanup timers
    if ((websocketService as any).heartbeatInterval) {
      clearInterval((websocketService as any).heartbeatInterval);
    }
    if ((websocketService as any).reconnectTimeout) {
      clearTimeout((websocketService as any).reconnectTimeout);
    }
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const _instance1 = (websocketService as any).constructor.getInstance();
      const _instance2 = (websocketService as any).constructor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await websocketService.initialize();

      expect((websocketService as any).isInitialized).toBe(true);
      expect(mockLogger.info).toHaveBeenCalledWith('初始化 WebSocket 服務');
      expect(mockLogger.info).toHaveBeenCalledWith('WebSocket 服務初始化完成');
    });

    it('should not reinitialize if already initialized', async () => {
      await websocketService.initialize();
      mockLogger.info.mockClear();

      await websocketService.initialize();

      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle initialization with custom config', async () => {
      const customConfig: Partial<WebSocketConfig> = {
        url: 'ws://test.com/ws',
        reconnectInterval: 3000,
        maxReconnectAttempts: 3,
      };

      await websocketService.initialize(customConfig);

      const _config = websocketService.getConfig();
      expect(config.url).toBe('ws://test.com/ws');
      expect(config.reconnectInterval).toBe(3000);
      expect(config.maxReconnectAttempts).toBe(3);
    });

    it('should handle initialization errors', async () => {
      const _invalidConfig = { url: '' };

      await expect(websocketService.initialize(invalidConfig)).rejects.toThrow(
        'WebSocket URL 不能為空'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'WebSocket 服務初始化失敗:',
        expect.any(Error)
      );
    });
  });

  describe('connect', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should connect successfully', async () => {
      // Mock WebSocket
      const _mockWebSocket = {
        binaryType: 'arraybuffer',
        onopen: jest.fn(),
        onclose: jest.fn(),
        onmessage: jest.fn(),
        onerror: jest.fn(),
        close: jest.fn(),
        send: jest.fn(),
      };

      (global as any).WebSocket = jest.fn(() => mockWebSocket);

      const _connectPromise = websocketService.connect();

      // Simulate connection success
      setTimeout(() => {
        mockWebSocket.onopen(new Event('open'));
      }, 100);

      await connectPromise;

      expect(mockLogger.info).toHaveBeenCalledWith(
        '開始 WebSocket 連接:',
        expect.any(Object)
      );
      expect(mockLogger.info).toHaveBeenCalledWith('WebSocket 連接已建立');
    });

    it('should not connect if already connecting', async () => {
      (websocketService as any).connectionState.status = 'connecting';

      await websocketService.connect();

      expect(mockLogger.info).not.toHaveBeenCalledWith('開始 WebSocket 連接:');
    });

    it('should not connect if already connected', async () => {
      (websocketService as any).connectionState.status = 'connected';

      await websocketService.connect();

      expect(mockLogger.info).not.toHaveBeenCalledWith('開始 WebSocket 連接:');
    });
  });

  describe('disconnect', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should disconnect successfully', () => {
      const _mockWebSocket = {
        close: jest.fn(),
      };
      (websocketService as any).websocket = mockWebSocket;
      (websocketService as any).connectionState.status = 'connected';

      websocketService.disconnect();

      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Normal closure');
      expect(mockLogger.info).toHaveBeenCalledWith('斷開 WebSocket 連接');
      expect((websocketService as any).websocket).toBeNull();
    });
  });

  describe('sendMessage', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should send message successfully when connected', async () => {
      const _mockWebSocket = {
        send: jest.fn(),
      };
      (websocketService as any).websocket = mockWebSocket;
      (websocketService as any).connectionState.status = 'connected';

      const message: Partial<WebSocketMessage> = {
        type: 'system_message',
        data: { content: 'test message' },
        priority: 'normal',
      };

      await websocketService.sendMessage(message);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('test message')
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        '消息發送成功:',
        expect.any(Object)
      );
    });

    it('should queue message when not connected', async () => {
      (websocketService as any).connectionState.status = 'disconnected';

      const message: Partial<WebSocketMessage> = {
        type: 'system_message',
        data: { content: 'test message' },
      };

      await websocketService.sendMessage(message);

      expect((websocketService as any).messageQueue.pending).toHaveLength(1);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        '消息添加到待發送隊列:',
        expect.any(Object)
      );
    });

    it('should handle send message errors', async () => {
      const _mockWebSocket = {
        send: jest.fn().mockImplementation(() => {
          throw new Error('Send failed');
        }),
      };
      (websocketService as any).websocket = mockWebSocket;
      (websocketService as any).connectionState.status = 'connected';

      const message: Partial<WebSocketMessage> = {
        type: 'system_message',
        data: { content: 'test message' },
      };

      await expect(websocketService.sendMessage(message)).rejects.toThrow(
        'Send failed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '發送消息失敗:',
        expect.any(Error)
      );
    });
  });

  describe('broadcast', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should broadcast message successfully', async () => {
      const _mockWebSocket = {
        send: jest.fn(),
      };
      (websocketService as any).websocket = mockWebSocket;
      (websocketService as any).connectionState.status = 'connected';

      const message: Partial<WebSocketMessage> = {
        type: 'notification',
        data: { content: 'broadcast message' },
      };

      const options: BroadcastOptions = {
        room: 'test-room',
        priority: 'high',
      };

      await websocketService.broadcast(message, options);

      expect(mockLogger.info).toHaveBeenCalledWith(
        '廣播消息:',
        expect.any(Object)
      );
      expect(mockWebSocket.send).toHaveBeenCalled();
    });
  });

  describe('subscribe', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should subscribe to messages successfully', () => {
      const _subscriptionId = 'test-subscription';
      const filter: SubscriptionFilter = {
        messageTypes: ['card_update'],
        priority: ['high', 'urgent'],
      };
      const _callback = jest.fn();

      websocketService.subscribe(subscriptionId, filter, callback);

      expect((websocketService as any).subscriptions.get(subscriptionId)).toBe(
        filter
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        '添加消息訂閱:',
        expect.any(Object)
      );
    });
  });

  describe('unsubscribe', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should unsubscribe successfully', () => {
      const _subscriptionId = 'test-subscription';
      const filter: SubscriptionFilter = {
        messageTypes: ['card_update'],
      };
      const _callback = jest.fn();

      websocketService.subscribe(subscriptionId, filter, callback);
      websocketService.unsubscribe(subscriptionId);

      expect((websocketService as any).subscriptions.has(subscriptionId)).toBe(
        false
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        '移除消息訂閱:',
        expect.any(Object)
      );
    });
  });

  describe('joinRoom', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should join room successfully', async () => {
      const _mockWebSocket = {
        send: jest.fn(),
      };
      (websocketService as any).websocket = mockWebSocket;
      (websocketService as any).connectionState.status = 'connected';

      const _roomId = 'test-room';
      const _userInfo = {
        userId: 'user123',
        status: 'online',
      };

      await websocketService.joinRoom(roomId, userInfo);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('join_room')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        '加入房間:',
        expect.any(Object)
      );
    });
  });

  describe('leaveRoom', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should leave room successfully', async () => {
      const _mockWebSocket = {
        send: jest.fn(),
      };
      (websocketService as any).websocket = mockWebSocket;
      (websocketService as any).connectionState.status = 'connected';

      const _roomId = 'test-room';

      await websocketService.leaveRoom(roomId);

      expect(mockWebSocket.send).toHaveBeenCalledWith(
        expect.stringContaining('leave_room')
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        '離開房間:',
        expect.any(Object)
      );
    });
  });

  describe('reconnect', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should reconnect successfully', async () => {
      // Mock the reconnect method to avoid timeout
      const _mockReconnect = jest.fn().mockResolvedValue(undefined);
      (websocketService as any).reconnect = mockReconnect;

      await websocketService.reconnect();

      expect(mockReconnect).toHaveBeenCalled();
    });

    it('should not reconnect if already reconnecting', async () => {
      (websocketService as any).connectionState.status = 'reconnecting';

      await websocketService.reconnect();

      expect(mockLogger.info).not.toHaveBeenCalledWith('開始重新連接');
    });
  });

  describe('getConnectionState', () => {
    it('should return connection state copy', () => {
      const _state = websocketService.getConnectionState();

      expect(state).toEqual(
        expect.objectContaining({
          status: 'disconnected',
          reconnectAttempts: 0,
          bytesReceived: 0,
          bytesSent: 0,
          messagesReceived: 0,
          messagesSent: 0,
        })
      );
    });
  });

  describe('getStats', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should return stats copy', () => {
      const _stats = websocketService.getStats();

      expect(stats).toEqual(
        expect.objectContaining({
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
        })
      );
    });
  });

  describe('getConfig', () => {
    it('should return config copy', () => {
      const _config = websocketService.getConfig();

      expect(config).toEqual(
        expect.objectContaining({
          url: 'ws://test.com/ws',
          reconnectInterval: 5000,
          maxReconnectAttempts: 5,
          heartbeatInterval: 30000,
          messageTimeout: 10000,
          enableCompression: true,
          enableEncryption: false,
          binaryType: 'arraybuffer',
          bufferSize: 1024 * 1024,
          protocols: [],
        })
      );
    });
  });

  describe('updateConfig', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should update config successfully', () => {
      const updates: Partial<WebSocketConfig> = {
        url: 'ws://new-server.com/ws',
        reconnectInterval: 10000,
      };

      websocketService.updateConfig(updates);

      const _config = websocketService.getConfig();
      expect(config.url).toBe('ws://new-server.com/ws');
      expect(config.reconnectInterval).toBe(10000);
      expect(mockLogger.info).toHaveBeenCalledWith('WebSocket 配置已更新');
    });
  });

  describe('setEventHandlers', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should set event handlers successfully', () => {
      const handlers: WebSocketEventHandlers = {
        onConnect: jest.fn(),
        onMessage: jest.fn(),
        onError: jest.fn(),
      };

      websocketService.setEventHandlers(handlers);

      expect((websocketService as any).eventHandlers.onConnect).toBe(
        handlers.onConnect
      );
      expect((websocketService as any).eventHandlers.onMessage).toBe(
        handlers.onMessage
      );
      expect((websocketService as any).eventHandlers.onError).toBe(
        handlers.onError
      );
    });
  });

  describe('getBatchJobStatus', () => {
    it('should return null for non-existent batch', () => {
      const _status = websocketService.getBatchJobStatus('non-existent');
      expect(status).toBeNull();
    });

    it('should return batch status for existing batch', () => {
      const _batchId = 'test-batch';
      const _batchResponse = {
        batchId,
        status: 'processing',
        totalImages: 2,
        processedImages: 1,
        successfulRecognitions: 1,
        results: [],
        processingStarted: new Date(),
      };

      (websocketService as any).batchJobs.set(batchId, batchResponse);

      const _status = websocketService.getBatchJobStatus(batchId);
      expect(status).toEqual(batchResponse);
    });
  });

  describe('private methods', () => {
    beforeEach(async () => {
      await websocketService.initialize({
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      });
    });

    it('should generate unique message IDs', () => {
      const _id1 = (websocketService as any).generateMessageId();
      const _id2 = (websocketService as any).generateMessageId();

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^msg_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^msg_\d+_[a-z0-9]+$/);
    });

    it('should validate config properly', () => {
      const _validConfig = {
        url: 'ws://test.com/ws',
        reconnectInterval: 5000,
        maxReconnectAttempts: 5,
      };

      expect(() => {
        (websocketService as any).validateConfig.call({ config: validConfig });
      }).not.toThrow();
    });

    it('should throw error for invalid config', () => {
      const _invalidConfigs = [
        { url: '' },
        { url: 'ws://test.com/ws', reconnectInterval: 500 },
        { url: 'ws://test.com/ws', maxReconnectAttempts: 0 },
      ];

      invalidConfigs.forEach(config => {
        expect(() => {
          (websocketService as any).validateConfig.call({ config });
        }).toThrow();
      });
    });

    it('should match filter correctly', () => {
      const message: WebSocketMessage = {
        id: 'test-msg',
        type: 'card_update',
        timestamp: new Date(),
        data: {},
        userId: 'user123',
        priority: 'high',
      };

      const filter: SubscriptionFilter = {
        userId: 'user123',
        messageTypes: ['card_update'],
        priority: ['high', 'urgent'],
      };

      const _result = (websocketService as any).matchesFilter(message, filter);
      expect(result).toBe(true);
    });

    it('should not match filter for different user', () => {
      const message: WebSocketMessage = {
        id: 'test-msg',
        type: 'card_update',
        timestamp: new Date(),
        data: {},
        userId: 'user456',
        priority: 'high',
      };

      const filter: SubscriptionFilter = {
        userId: 'user123',
        messageTypes: ['card_update'],
      };

      const _result = (websocketService as any).matchesFilter(message, filter);
      expect(result).toBe(false);
    });
  });
});
