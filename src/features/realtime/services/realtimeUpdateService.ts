/**
 * 實時UpdateService
 * Handle實時DataUpdate，Package括卡片Update、UserStatusUpdate、系統Notification等
 */

import { logger } from '../../../core/utils/logger';
import type {
  PresenceInfo,
  RealtimeUpdate,
  WebSocketMessage,
} from '../types/websocket';

import { websocketService } from './websocketService';

export interface UpdateHandler {
  id: string;
  type: string;
  handler: (update: RealtimeUpdate) => void;
  priority: number;
}

export interface UpdateFilter {
  types?: string[];
  entityIds?: string[];
  actions?: string[];
  userIds?: string[];
}

export interface UpdateStats {
  totalUpdates: number;
  updatesByType: Record<string, number>;
  updatesByAction: Record<string, number>;
  lastUpdate: Date | null;
  averageLatency: number;
  errorCount: number;
}

class RealtimeUpdateService {
  private static instance: RealtimeUpdateService;
  private readonly updateHandlers: Map<string, UpdateHandler> = new Map();
  private readonly updateQueue: RealtimeUpdate[] = [];
  private stats: UpdateStats;
  private isInitialized = false;
  private processingQueue = false;

  private constructor() {
    this.stats = this.getDefaultStats();
  }

  public static getInstance(): RealtimeUpdateService {
    if (!RealtimeUpdateService.instance) {
      RealtimeUpdateService.instance = new RealtimeUpdateService();
    }
    return RealtimeUpdateService.instance;
  }

  /**
   * Initialize實時UpdateService
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info('Initialize實時UpdateService');

      // Settings WebSocket MessageHandle器
      websocketService.setEventHandlers({
        onMessage: this.handleWebSocketMessage.bind(this),
        onConnect: this.handleWebSocketConnect.bind(this),
        onDisconnect: this.handleWebSocketDisconnect.bind(this),
      });

      this.isInitialized = true;
      logger.info('實時UpdateServiceInitialize完成');
    } catch (error: unknown) {
      logger.error('實時UpdateServiceInitializeFailed:', error);
      throw error;
    }
  }

  /**
   * RegisterUpdateHandle器
   */
  public registerHandler(handler: UpdateHandler): void {
    this.updateHandlers.set(handler.id, handler);
    logger.debug('註冊更新處理器:', {
      handlerId: handler.id,
      type: handler.type,
    });
  }

  /**
   * CancelRegisterUpdateHandle器
   */
  public unregisterHandler(handlerId: string): void {
    this.updateHandlers.delete(handlerId);
    logger.debug('取消註冊更新處理器:', { handlerId });
  }

  /**
   * Send實時Update
   */
  public async sendUpdate(update: Partial<RealtimeUpdate>): Promise<void> {
    const fullUpdate: RealtimeUpdate = {
      id: update.id || this.generateUpdateId(),
      type: update.type || 'system',
      action: update.action || 'update',
      entityId: update.entityId || '',
      data: update.data || {},
      timestamp: update.timestamp || new Date(),
      version: update.version || 1,
      checksum: update.checksum,
      metadata: update.metadata,
    };

    try {
      const message: Partial<WebSocketMessage> = {
        type: 'user_update',
        data: fullUpdate,
        priority: 'normal',
      };

      await websocketService.sendMessage(message);
      this.updateStats(fullUpdate);
      logger.debug('實時Update發送Success:', {
        updateId: fullUpdate.id,
        type: fullUpdate.type,
      });
    } catch (error: unknown) {
      logger.error('發送實時UpdateFailed:', error);
      throw error;
    }
  }

  /**
   * 廣播實時Update
   */
  public async broadcastUpdate(
    update: Partial<RealtimeUpdate>,
    options?: {
      room?: string;
      userIds?: string[];
      excludeUserIds?: string[];
    }
  ): Promise<void> {
    const fullUpdate: RealtimeUpdate = {
      id: update.id || this.generateUpdateId(),
      type: update.type || 'system',
      action: update.action || 'update',
      entityId: update.entityId || '',
      data: update.data || {},
      timestamp: update.timestamp || new Date(),
      version: update.version || 1,
      checksum: update.checksum,
      metadata: update.metadata,
    };

    try {
      const message: Partial<WebSocketMessage> = {
        type: 'user_update',
        data: fullUpdate,
        priority: 'normal',
      };

      await websocketService.broadcast(message, options);
      this.updateStats(fullUpdate);
      logger.debug('實時Update廣播Success:', {
        updateId: fullUpdate.id,
        type: fullUpdate.type,
      });
    } catch (error: unknown) {
      logger.error('廣播實時UpdateFailed:', error);
      throw error;
    }
  }

  /**
   * Handle卡片Update
   */
  public async handleCardUpdate(
    cardId: string,
    action: 'create' | 'update' | 'delete',
    data: unknown
  ): Promise<void> {
    const update: Partial<RealtimeUpdate> = {
      type: 'card',
      action,
      entityId: cardId,
      data,
      metadata: {
        source: 'card_update',
        timestamp: new Date(),
      },
    };

    await this.sendUpdate(update);
  }

  /**
   * HandleUserStatusUpdate
   */
  public async handleUserStatusUpdate(
    userId: string,
    status: PresenceInfo['status'],
    data?: unknown
  ): Promise<void> {
    const update: Partial<RealtimeUpdate> = {
      type: 'user',
      action: 'update',
      entityId: userId,
      data: {
        status,
        lastSeen: new Date(),
        ...data,
      },
      metadata: {
        source: 'user_status',
        timestamp: new Date(),
      },
    };

    await this.broadcastUpdate(update);
  }

  /**
   * Handle系統Notification
   */
  public async handleSystemNotification(notification: unknown): Promise<void> {
    const update: Partial<RealtimeUpdate> = {
      type: 'system',
      action: 'create',
      entityId: 'system',
      data: notification,
      metadata: {
        source: 'system_notification',
        timestamp: new Date(),
      },
    };

    await this.broadcastUpdate(update);
  }

  /**
   * GetUpdateStatistics
   */
  public getStats(): UpdateStats {
    return { ...this.stats };
  }

  /**
   * Clear統Count據
   */
  public clearStats(): void {
    this.stats = this.getDefaultStats();
    logger.debug('清除實時更新統計數據');
  }

  /**
   * Handle WebSocket Message
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    try {
      if (message.type === 'user_update' && message.data) {
        const _update = message.data as RealtimeUpdate;
        this.processUpdate(update);
      }
    } catch (error: unknown) {
      logger.error('Handle WebSocket 消息Failed:', error);
    }
  }

  /**
   * Handle WebSocket Connect
   */
  private handleWebSocketConnect(): void {
    logger.info('WebSocket Connect建立，實時UpdateService已就緒');
  }

  /**
   * Handle WebSocket Disconnect
   */
  private handleWebSocketDisconnect(): void {
    logger.warn('WebSocket ConnectDisconnect，實時UpdateService暫停');
  }

  /**
   * Handle實時Update
   */
  private processUpdate(update: RealtimeUpdate): void {
    try {
      // Add到Queue
      this.updateQueue.push(update);

      // 如果沒有在HandleQueue，BeginHandle
      if (!this.processingQueue) {
        this.processQueue();
      }

      logger.debug('實時更新已加入處理隊列:', {
        updateId: update.id,
        type: update.type,
      });
    } catch (error: unknown) {
      logger.error('Handle實時UpdateFailed:', error);
    }
  }

  /**
   * HandleUpdateQueue
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.updateQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    try {
      while (this.updateQueue.length > 0) {
        const _update = this.updateQueue.shift()!;
        await this.executeUpdate(update);
      }
    } catch (error: unknown) {
      logger.error('HandleUpdate隊列Failed:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * 執RowUpdate
   */
  private async executeUpdate(update: RealtimeUpdate): Promise<void> {
    try {
      // 找到匹配的Handle器
      const _handlers = Array.from(this.updateHandlers.values())
        .filter(
          handler =>
            handler.type === update.type ||
            handler.type === '*' ||
            update.type === handler.type
        )
        .sort((a, b) => b.priority - a.priority);

      // 執RowHandle器
      for (const handler of handlers) {
        try {
          handler.handler(update);
          logger.debug('UpdateHandle器執行Success:', {
            handlerId: handler.id,
            updateId: update.id,
            type: update.type,
          });
        } catch (error: unknown) {
          logger.error('UpdateHandle器執行Failed:', {
            handlerId: handler.id,
            error: error.message,
          });
        }
      }

      this.updateStats(update);
    } catch (error: unknown) {
      logger.error('執行UpdateFailed:', error);
      this.stats.errorCount++;
    }
  }

  /**
   * Update統Count據
   */
  private updateStats(update: RealtimeUpdate): void {
    this.stats.totalUpdates++;
    this.stats.lastUpdate = new Date();

    // 按Class型Statistics
    this.stats.updatesByType[update.type] =
      (this.stats.updatesByType[update.type] || 0) + 1;

    // 按動作Statistics
    this.stats.updatesByAction[update.action] =
      (this.stats.updatesByAction[update.action] || 0) + 1;
  }

  /**
   * 生成Update ID
   */
  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * GetDefault統Count據
   */
  private getDefaultStats(): UpdateStats {
    return {
      totalUpdates: 0,
      updatesByType: {},
      updatesByAction: {},
      lastUpdate: null,
      averageLatency: 0,
      errorCount: 0,
    };
  }
}

export const _realtimeUpdateService = RealtimeUpdateService.getInstance();

// ReExportClass型
export type { RealtimeUpdate } from '../types/websocket';
