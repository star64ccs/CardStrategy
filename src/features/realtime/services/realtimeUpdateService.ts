/**
 * 實時更新服務
 * 處理實時數據更新，包括卡片更新、用戶狀態更新、系統通知等
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
   * 初始化實時更新服務
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info('初始化實時更新服務');

      // 設置 WebSocket 消息處理器
      websocketService.setEventHandlers({
        onMessage: this.handleWebSocketMessage.bind(this),
        onConnect: this.handleWebSocketConnect.bind(this),
        onDisconnect: this.handleWebSocketDisconnect.bind(this),
      });

      this.isInitialized = true;
      logger.info('實時更新服務初始化完成');
    } catch (error: unknown) {
      logger.error('實時更新服務初始化失敗:', error);
      throw error;
    }
  }

  /**
   * 註冊更新處理器
   */
  public registerHandler(handler: UpdateHandler): void {
    this.updateHandlers.set(handler.id, handler);
    logger.debug('註冊更新處理器:', {
      handlerId: handler.id,
      type: handler.type,
    });
  }

  /**
   * 取消註冊更新處理器
   */
  public unregisterHandler(handlerId: string): void {
    this.updateHandlers.delete(handlerId);
    logger.debug('取消註冊更新處理器:', { handlerId });
  }

  /**
   * 發送實時更新
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
      logger.debug('實時更新發送成功:', {
        updateId: fullUpdate.id,
        type: fullUpdate.type,
      });
    } catch (error: unknown) {
      logger.error('發送實時更新失敗:', error);
      throw error;
    }
  }

  /**
   * 廣播實時更新
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
      logger.debug('實時更新廣播成功:', {
        updateId: fullUpdate.id,
        type: fullUpdate.type,
      });
    } catch (error: unknown) {
      logger.error('廣播實時更新失敗:', error);
      throw error;
    }
  }

  /**
   * 處理卡片更新
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
   * 處理用戶狀態更新
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
   * 處理系統通知
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
   * 獲取更新統計
   */
  public getStats(): UpdateStats {
    return { ...this.stats };
  }

  /**
   * 清除統計數據
   */
  public clearStats(): void {
    this.stats = this.getDefaultStats();
    logger.debug('清除實時更新統計數據');
  }

  /**
   * 處理 WebSocket 消息
   */
  private handleWebSocketMessage(message: WebSocketMessage): void {
    try {
      if (message.type === 'user_update' && message.data) {
        const _update = message.data as RealtimeUpdate;
        this.processUpdate(update);
      }
    } catch (error: unknown) {
      logger.error('處理 WebSocket 消息失敗:', error);
    }
  }

  /**
   * 處理 WebSocket 連接
   */
  private handleWebSocketConnect(): void {
    logger.info('WebSocket 連接建立，實時更新服務已就緒');
  }

  /**
   * 處理 WebSocket 斷開
   */
  private handleWebSocketDisconnect(): void {
    logger.warn('WebSocket 連接斷開，實時更新服務暫停');
  }

  /**
   * 處理實時更新
   */
  private processUpdate(update: RealtimeUpdate): void {
    try {
      // 添加到隊列
      this.updateQueue.push(update);

      // 如果沒有在處理隊列，開始處理
      if (!this.processingQueue) {
        this.processQueue();
      }

      logger.debug('實時更新已加入處理隊列:', {
        updateId: update.id,
        type: update.type,
      });
    } catch (error: unknown) {
      logger.error('處理實時更新失敗:', error);
    }
  }

  /**
   * 處理更新隊列
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
      logger.error('處理更新隊列失敗:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * 執行更新
   */
  private async executeUpdate(update: RealtimeUpdate): Promise<void> {
    try {
      // 找到匹配的處理器
      const _handlers = Array.from(this.updateHandlers.values())
        .filter(
          handler =>
            handler.type === update.type ||
            handler.type === '*' ||
            update.type === handler.type
        )
        .sort((a, b) => b.priority - a.priority);

      // 執行處理器
      for (const handler of handlers) {
        try {
          handler.handler(update);
          logger.debug('更新處理器執行成功:', {
            handlerId: handler.id,
            updateId: update.id,
            type: update.type,
          });
        } catch (error: unknown) {
          logger.error('更新處理器執行失敗:', {
            handlerId: handler.id,
            error: error.message,
          });
        }
      }

      this.updateStats(update);
    } catch (error: unknown) {
      logger.error('執行更新失敗:', error);
      this.stats.errorCount++;
    }
  }

  /**
   * 更新統計數據
   */
  private updateStats(update: RealtimeUpdate): void {
    this.stats.totalUpdates++;
    this.stats.lastUpdate = new Date();

    // 按類型統計
    this.stats.updatesByType[update.type] =
      (this.stats.updatesByType[update.type] || 0) + 1;

    // 按動作統計
    this.stats.updatesByAction[update.action] =
      (this.stats.updatesByAction[update.action] || 0) + 1;
  }

  /**
   * 生成更新 ID
   */
  private generateUpdateId(): string {
    return `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 獲取默認統計數據
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

// 重新導出類型
export type { RealtimeUpdate } from '../types/websocket';
