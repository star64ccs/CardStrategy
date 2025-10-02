/**
 * 實時更新服務測試
 * 測試實時更新服務的所有主要功能
 */

import { logger } from '../../../core/utils/logger';
import { realtimeUpdateService } from '../services/realtimeUpdateService';
import type {
  RealtimeUpdate,
  UpdateHandler,
} from '../services/realtimeUpdateService';
import { websocketService } from '../services/websocketService';

// Mock dependencies
jest.mock('../services/websocketService');
jest.mock('../../../core/utils/logger');

const mockWebsocketService = websocketService as jest.Mocked<
  typeof websocketService
>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('RealtimeUpdateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset singleton instance
    (realtimeUpdateService as any).instance = null;
    (realtimeUpdateService as any).isInitialized = false;
    (realtimeUpdateService as any).updateHandlers = new Map();
    (realtimeUpdateService as any).updateQueue = [];
    (realtimeUpdateService as any).processingQueue = false;

    // Initialize stats properly
    (realtimeUpdateService as any).stats = {
      totalUpdates: 0,
      updatesByType: {},
      updatesByAction: {},
      lastUpdate: null,
      averageLatency: 0,
      errorCount: 0,
    };
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = (
        realtimeUpdateService as any
      ).constructor.getInstance();
      const instance2 = (
        realtimeUpdateService as any
      ).constructor.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      mockWebsocketService.setEventHandlers = jest.fn();

      await realtimeUpdateService.initialize();

      expect((realtimeUpdateService as any).isInitialized).toBe(true);
      expect(mockWebsocketService.setEventHandlers).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('初始化實時更新服務');
      expect(mockLogger.info).toHaveBeenCalledWith('實時更新服務初始化完成');
    });

    it('should not reinitialize if already initialized', async () => {
      mockWebsocketService.setEventHandlers = jest.fn();

      await realtimeUpdateService.initialize();
      mockLogger.info.mockClear();

      await realtimeUpdateService.initialize();

      expect(mockLogger.info).not.toHaveBeenCalled();
    });

    it('should handle initialization errors', async () => {
      mockWebsocketService.setEventHandlers = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('WebSocket service error');
        });

      await expect(realtimeUpdateService.initialize()).rejects.toThrow(
        'WebSocket service error'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '實時更新服務初始化失敗:',
        expect.any(Error)
      );
    });
  });

  describe('registerHandler', () => {
    it('should register handler successfully', () => {
      const handler: UpdateHandler = {
        id: 'test-handler',
        type: 'card',
        priority: 1,
        handler: jest.fn(),
      };

      realtimeUpdateService.registerHandler(handler);

      expect(
        (realtimeUpdateService as any).updateHandlers.has('test-handler')
      ).toBe(true);
      expect(mockLogger.debug).toHaveBeenCalledWith('註冊更新處理器:', {
        handlerId: 'test-handler',
        type: 'card',
      });
    });
  });

  describe('unregisterHandler', () => {
    it('should unregister handler successfully', () => {
      const handler: UpdateHandler = {
        id: 'test-handler',
        type: 'card',
        priority: 1,
        handler: jest.fn(),
      };

      realtimeUpdateService.registerHandler(handler);
      realtimeUpdateService.unregisterHandler('test-handler');

      expect(
        (realtimeUpdateService as any).updateHandlers.has('test-handler')
      ).toBe(false);
      expect(mockLogger.debug).toHaveBeenCalledWith('取消註冊更新處理器:', {
        handlerId: 'test-handler',
      });
    });
  });

  describe('sendUpdate', () => {
    beforeEach(async () => {
      mockWebsocketService.sendMessage = jest.fn().mockResolvedValue(undefined);
      await realtimeUpdateService.initialize();
    });

    it('should send update successfully', async () => {
      const update: Partial<RealtimeUpdate> = {
        type: 'card',
        action: 'update',
        entityId: 'card1',
        data: { name: 'Test Card' },
      };

      await realtimeUpdateService.sendUpdate(update);

      expect(mockWebsocketService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user_update',
          data: expect.objectContaining({
            type: 'card',
            action: 'update',
            entityId: 'card1',
            data: { name: 'Test Card' },
          }),
          priority: 'normal',
        })
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        '實時更新發送成功:',
        expect.any(Object)
      );
    });

    it('should handle send update errors', async () => {
      mockWebsocketService.sendMessage = jest
        .fn()
        .mockRejectedValue(new Error('Send failed'));

      const update: Partial<RealtimeUpdate> = {
        type: 'card',
        action: 'update',
        entityId: 'card1',
        data: { name: 'Test Card' },
      };

      await expect(realtimeUpdateService.sendUpdate(update)).rejects.toThrow(
        'Send failed'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        '發送實時更新失敗:',
        expect.any(Error)
      );
    });
  });

  describe('broadcastUpdate', () => {
    beforeEach(async () => {
      mockWebsocketService.broadcast = jest.fn().mockResolvedValue(undefined);
      await realtimeUpdateService.initialize();
    });

    it('should broadcast update successfully', async () => {
      const update: Partial<RealtimeUpdate> = {
        type: 'system',
        action: 'create',
        entityId: 'system',
        data: { message: 'System notification' },
      };

      const options = {
        room: 'general',
        userIds: ['user1', 'user2'],
      };

      await realtimeUpdateService.broadcastUpdate(update, options);

      expect(mockWebsocketService.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user_update',
          data: expect.objectContaining({
            type: 'system',
            action: 'create',
            entityId: 'system',
            data: { message: 'System notification' },
          }),
          priority: 'normal',
        }),
        options
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        '實時更新廣播成功:',
        expect.any(Object)
      );
    });
  });

  describe('handleCardUpdate', () => {
    beforeEach(async () => {
      mockWebsocketService.sendMessage = jest.fn().mockResolvedValue(undefined);
      await realtimeUpdateService.initialize();
    });

    it('should handle card update successfully', async () => {
      const cardId = 'card1';
      const action = 'update' as const;
      const data = { name: 'Updated Card', price: 100 };

      await realtimeUpdateService.handleCardUpdate(cardId, action, data);

      expect(mockWebsocketService.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user_update',
          data: expect.objectContaining({
            type: 'card',
            action: 'update',
            entityId: 'card1',
            data: { name: 'Updated Card', price: 100 },
            metadata: expect.objectContaining({
              source: 'card_update',
            }),
          }),
        })
      );
    });
  });

  describe('handleUserStatusUpdate', () => {
    beforeEach(async () => {
      mockWebsocketService.broadcast = jest.fn().mockResolvedValue(undefined);
      await realtimeUpdateService.initialize();
    });

    it('should handle user status update successfully', async () => {
      const userId = 'user1';
      const status = 'online' as const;
      const data = { device: 'mobile' };

      await realtimeUpdateService.handleUserStatusUpdate(userId, status, data);

      expect(mockWebsocketService.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user_update',
          data: expect.objectContaining({
            type: 'user',
            action: 'update',
            entityId: 'user1',
            data: expect.objectContaining({
              status: 'online',
              device: 'mobile',
            }),
            metadata: expect.objectContaining({
              source: 'user_status',
            }),
          }),
        }),
        undefined
      );
    });
  });

  describe('handleSystemNotification', () => {
    beforeEach(async () => {
      mockWebsocketService.broadcast = jest.fn().mockResolvedValue(undefined);
      await realtimeUpdateService.initialize();
    });

    it('should handle system notification successfully', async () => {
      const notification = {
        title: 'System Alert',
        message: 'Server maintenance scheduled',
        level: 'info',
      };

      await realtimeUpdateService.handleSystemNotification(notification);

      expect(mockWebsocketService.broadcast).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user_update',
          data: expect.objectContaining({
            type: 'system',
            action: 'create',
            entityId: 'system',
            data: {
              title: 'System Alert',
              message: 'Server maintenance scheduled',
              level: 'info',
            },
            metadata: expect.objectContaining({
              source: 'system_notification',
            }),
          }),
        }),
        undefined
      );
    });
  });

  describe('getStats', () => {
    it('should return stats copy', () => {
      const stats1 = realtimeUpdateService.getStats();
      const stats2 = realtimeUpdateService.getStats();

      expect(stats1).toEqual(stats2);
      expect(stats1).not.toBe(stats2); // Should be different objects
    });
  });

  describe('clearStats', () => {
    it('should clear stats successfully', () => {
      // First, update some stats
      (realtimeUpdateService as any).stats.totalUpdates = 10;
      (realtimeUpdateService as any).stats.lastUpdate = new Date();

      realtimeUpdateService.clearStats();

      const stats = realtimeUpdateService.getStats();
      expect(stats.totalUpdates).toBe(0);
      expect(stats.lastUpdate).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledWith('清除實時更新統計數據');
    });
  });

  describe('private methods', () => {
    beforeEach(async () => {
      await realtimeUpdateService.initialize();
    });

    describe('handleWebSocketMessage', () => {
      it('should process user_update messages', () => {
        const message = {
          type: 'user_update',
          data: {
            id: 'update1',
            type: 'card',
            action: 'update',
            entityId: 'card1',
            data: { name: 'Test' },
            timestamp: new Date(),
            version: 1,
          },
        };

        // Mock processQueue to prevent immediate processing
        const originalProcessQueue = (realtimeUpdateService as any)
          .processQueue;
        (realtimeUpdateService as any).processQueue = jest.fn();

        // Ensure updateQueue is properly initialized
        (realtimeUpdateService as any).updateQueue = [];

        (realtimeUpdateService as any).handleWebSocketMessage(message);

        expect((realtimeUpdateService as any).updateQueue.length).toBe(1);
        expect((realtimeUpdateService as any).updateQueue[0]).toEqual(
          message.data
        );
        expect((realtimeUpdateService as any).processQueue).toHaveBeenCalled();

        // Restore original method
        (realtimeUpdateService as any).processQueue = originalProcessQueue;
      });

      it('should ignore non-user_update messages', () => {
        const message = {
          type: 'heartbeat',
          data: { timestamp: new Date() },
        };

        (realtimeUpdateService as any).handleWebSocketMessage(message);

        expect((realtimeUpdateService as any).updateQueue.length).toBe(0);
      });
    });

    describe('processUpdate', () => {
      it('should add update to queue and start processing', () => {
        const update: RealtimeUpdate = {
          id: 'update1',
          type: 'card',
          action: 'update',
          entityId: 'card1',
          data: { name: 'Test' },
          timestamp: new Date(),
          version: 1,
        };

        // Mock processQueue to prevent immediate processing
        const originalProcessQueue = (realtimeUpdateService as any)
          .processQueue;
        (realtimeUpdateService as any).processQueue = jest.fn();

        // Ensure updateQueue is properly initialized
        (realtimeUpdateService as any).updateQueue = [];

        (realtimeUpdateService as any).processUpdate(update);

        expect((realtimeUpdateService as any).updateQueue.length).toBe(1);
        expect((realtimeUpdateService as any).updateQueue[0]).toEqual(update);
        expect(mockLogger.debug).toHaveBeenCalledWith(
          '實時更新已加入處理隊列:',
          expect.any(Object)
        );
        expect((realtimeUpdateService as any).processQueue).toHaveBeenCalled();

        // Restore original method
        (realtimeUpdateService as any).processQueue = originalProcessQueue;
      });
    });

    describe('executeUpdate', () => {
      it('should execute matching handlers', async () => {
        const mockHandler = jest.fn();
        const handler: UpdateHandler = {
          id: 'test-handler',
          type: 'card',
          priority: 1,
          handler: mockHandler,
        };

        realtimeUpdateService.registerHandler(handler);

        const update: RealtimeUpdate = {
          id: 'update1',
          type: 'card',
          action: 'update',
          entityId: 'card1',
          data: { name: 'Test' },
          timestamp: new Date(),
          version: 1,
        };

        await (realtimeUpdateService as any).executeUpdate(update);

        expect(mockHandler).toHaveBeenCalledWith(update);
        expect(mockLogger.debug).toHaveBeenCalledWith(
          '更新處理器執行成功:',
          expect.any(Object)
        );
      });

      it('should not execute non-matching handlers', async () => {
        const mockHandler = jest.fn();
        const handler: UpdateHandler = {
          id: 'test-handler',
          type: 'user',
          priority: 1,
          handler: mockHandler,
        };

        realtimeUpdateService.registerHandler(handler);

        const update: RealtimeUpdate = {
          id: 'update1',
          type: 'card',
          action: 'update',
          entityId: 'card1',
          data: { name: 'Test' },
          timestamp: new Date(),
          version: 1,
        };

        await (realtimeUpdateService as any).executeUpdate(update);

        expect(mockHandler).not.toHaveBeenCalled();
      });

      it('should handle handler errors gracefully', async () => {
        const mockHandler = jest.fn().mockImplementation(() => {
          throw new Error('Handler error');
        });

        const handler: UpdateHandler = {
          id: 'test-handler',
          type: 'card',
          priority: 1,
          handler: mockHandler,
        };

        realtimeUpdateService.registerHandler(handler);

        const update: RealtimeUpdate = {
          id: 'update1',
          type: 'card',
          action: 'update',
          entityId: 'card1',
          data: { name: 'Test' },
          timestamp: new Date(),
          version: 1,
        };

        await (realtimeUpdateService as any).executeUpdate(update);

        expect(mockLogger.error).toHaveBeenCalledWith(
          '更新處理器執行失敗:',
          expect.any(Object)
        );
      });
    });

    describe('generateUpdateId', () => {
      it('should generate unique update IDs', () => {
        const id1 = (realtimeUpdateService as any).generateUpdateId();
        const id2 = (realtimeUpdateService as any).generateUpdateId();

        expect(id1).not.toBe(id2);
        expect(id1).toMatch(/^update_\d+_[a-z0-9]+$/);
        expect(id2).toMatch(/^update_\d+_[a-z0-9]+$/);
      });
    });
  });
});
