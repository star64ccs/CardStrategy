/**
 * WebSocket 通信Service
 * 提供實時通信功能，Package括ConnectManage、Message傳輸、重連機制等
 */

import { logger } from '../../../core/utils/logger';
import type {
  BroadcastOptions,
  ConnectionState,
  MessageQueue,
  PresenceInfo,
  SubscriptionFilter,
  WebSocketConfig,
  WebSocketError,
  WebSocketEventHandlers,
  WebSocketMessage,
  WebSocketMetrics,
  WebSocketStats,
  WebSocketStatus,
} from '../types/websocket';

class WebSocketService {
  private static instance: WebSocketService;
  private websocket: WebSocket | null = null;
  private config: WebSocketConfig;
  private readonly connectionState: ConnectionState;
  private readonly messageQueue: MessageQueue;
  private eventHandlers: WebSocketEventHandlers = {};
  private readonly subscriptions: Map<string, SubscriptionFilter> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private readonly metrics: WebSocketMetrics;
  private readonly stats: WebSocketStats;
  private isInitialized = false;

  private constructor() {
    this.config = this.getDefaultConfig();
    this.connectionState = this.getDefaultConnectionState();
    this.messageQueue = this.getDefaultMessageQueue();
    this.metrics = this.getDefaultMetrics();
    this.stats = this.getDefaultStats();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  /**
   * Initialize WebSocket Service
   */
  public async initialize(config?: Partial<WebSocketConfig>): Promise<void> {
    if (this.isInitialized) return;

    try {
      logger.info('Initialize WebSocket Service');

      if (config) {
        this.config = { ...this.config, ...config };
      }

      // VerifyConfigure
      this.validateConfig();

      // InitializeStatistics
      this.initializeStats();

      this.isInitialized = true;
      logger.info('WebSocket ServiceInitialize完成');
    } catch (error: unknown) {
      logger.error('WebSocket ServiceInitializeFailed:', error);
      throw error;
    }
  }

  /**
   * Connect到 WebSocket Server
   */
  public async connect(): Promise<void> {
    if (
      this.connectionState.status === 'connecting' ||
      this.connectionState.status === 'connected'
    ) {
      return;
    }

    try {
      logger.info('開始 WebSocket Connect:', { url: this.config.url });

      this.setConnectionStatus('connecting');

      // Create WebSocket Connect
      this.websocket = new WebSocket(this.config.url, this.config.protocols);
      if (this.config.binaryType) {
        this.websocket.binaryType = this.config.binaryType;
      }

      // SettingsEventHandle器
      this.setupWebSocketEventHandlers();

      // SettingsConnect超時
      const _connectTimeout = setTimeout(() => {
        if (this.connectionState.status === 'connecting') {
          this.handleConnectionError(new Error('Connect超時'));
        }
      }, 10000); // 10Second超時

      // AwaitConnect建立
      await new Promise((resolve, reject) => {
        const _originalOnConnect = this.eventHandlers.onConnect;
        const _originalOnError = this.eventHandlers.onError;

        this.eventHandlers.onConnect = event => {
          clearTimeout(connectTimeout);
          if (originalOnConnect) originalOnConnect(event);
          resolve(event);
        };

        this.eventHandlers.onError = error => {
          clearTimeout(connectTimeout);
          if (originalOnError) originalOnError(error);
          reject(new Error(error.message));
        };
      });
    } catch (error: unknown) {
      logger.error('WebSocket ConnectFailed:', error);
      this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * Disconnect WebSocket Connect
   */
  public disconnect(): void {
    try {
      logger.info('斷開 WebSocket Connect');

      // 清理定時器
      this.clearIntervals();

      // Off閉 WebSocket Connect
      if (this.websocket) {
        this.websocket.close(1000, 'Normal closure');
        this.websocket = null;
      }

      this.setConnectionStatus('disconnected');
      this.connectionState.disconnectedAt = new Date();
    } catch (error: unknown) {
      logger.error('Disconnect WebSocket ConnectFailed:', error);
    }
  }

  /**
   * SendMessage
   */
  public async sendMessage(message: Partial<WebSocketMessage>): Promise<void> {
    const fullMessage: WebSocketMessage = {
      id: message.id || this.generateMessageId(),
      type: message.type || 'system_message',
      timestamp: message.timestamp || new Date(),
      data: message.data,
      userId: message.userId,
      sessionId: message.sessionId,
      priority: message.priority || 'normal',
      retryCount: message.retryCount || 0,
      expiresAt: message.expiresAt,
    };

    try {
      if (this.connectionState.status !== 'connected') {
        // Add到QueueAwaitSend
        this.messageQueue.pending.push(fullMessage);
        logger.debug('消息添加到待發送隊列:', { messageId: fullMessage.id });
        return;
      }

      const _messageString = JSON.stringify(fullMessage);

      if (this.websocket) {
        this.websocket.send(messageString);
        this.stats.totalMessagesSent++;
        this.connectionState.messagesSent++;
        this.connectionState.bytesSent += messageString.length;

        logger.debug('消息發送Success:', {
          messageId: fullMessage.id,
          type: fullMessage.type,
        });
      }
    } catch (error: unknown) {
      logger.error('發送消息Failed:', error);
      this.messageQueue.failed.push(fullMessage);
      throw error;
    }
  }

  /**
   * 廣播Message
   */
  public async broadcast(
    message: Partial<WebSocketMessage>,
    options: BroadcastOptions = {}
  ): Promise<void> {
    const broadcastMessage: WebSocketMessage = {
      ...message,
      id: message.id || this.generateMessageId(),
      type: message.type || 'system_message',
      timestamp: message.timestamp || new Date(),
      priority: options.priority || 'normal',
    } as WebSocketMessage;

    // 模擬廣播邏輯（在實際實現中會通過ServerHandle）
    logger.info('廣播消息:', {
      messageId: broadcastMessage.id,
      type: broadcastMessage.type,
      room: options.room,
      userIds: options.userIds?.length,
      excludeUserIds: options.excludeUserIds?.length,
    });

    await this.sendMessage(broadcastMessage);
  }

  /**
   * 訂閱Message
   */
  public subscribe(
    subscriptionId: string,
    filter: SubscriptionFilter,
    callback: (message: WebSocketMessage) => void
  ): void {
    this.subscriptions.set(subscriptionId, filter);

    logger.info('添加消息訂閱:', {
      subscriptionId,
      messageTypes: filter.messageTypes,
      userId: filter.userId,
    });

    // StorageCallbackFunction（簡化實現）
    const _originalOnMessage = this.eventHandlers.onMessage;
    this.eventHandlers.onMessage = (message: WebSocketMessage) => {
      if (this.matchesFilter(message, filter)) {
        callback(message);
      }
      if (originalOnMessage) {
        originalOnMessage(message);
      }
    };
  }

  /**
   * Cancel訂閱
   */
  public unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
    logger.info('移除消息訂閱:', { subscriptionId });
  }

  /**
   * 加入房間
   */
  public async joinRoom(
    roomId: string,
    userInfo: Partial<PresenceInfo>
  ): Promise<void> {
    const message: Partial<WebSocketMessage> = {
      type: 'system_message',
      data: {
        action: 'join_room',
        roomId,
        userInfo,
      },
    };

    await this.sendMessage(message);
    logger.info('加入房間:', { roomId, userId: userInfo.userId });
  }

  /**
   * 離On房間
   */
  public async leaveRoom(roomId: string): Promise<void> {
    const message: Partial<WebSocketMessage> = {
      type: 'system_message',
      data: {
        action: 'leave_room',
        roomId,
      },
    };

    await this.sendMessage(message);
    logger.info('離開房間:', { roomId });
  }

  /**
   * GetConnectStatus
   */
  public getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  /**
   * GetStatisticsInformation
   */
  public getStats(): WebSocketStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Get指標
   */
  public getMetrics(): WebSocketMetrics {
    return { ...this.metrics };
  }

  /**
   * GetConfigure
   */
  public getConfig(): WebSocketConfig {
    return { ...this.config };
  }

  /**
   * UpdateConfigure
   */
  public updateConfig(updates: Partial<WebSocketConfig>): void {
    this.config = { ...this.config, ...updates };
    logger.info('WebSocket 配置已更新');
  }

  /**
   * SettingsEventHandle器
   */
  public setEventHandlers(handlers: Partial<WebSocketEventHandlers>): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * ReConnect
   */
  public async reconnect(): Promise<void> {
    if (
      this.connectionState.status === 'connecting' ||
      this.connectionState.status === 'reconnecting'
    ) {
      return;
    }

    try {
      logger.info('開始重新Connect');
      this.setConnectionStatus('reconnecting');

      // Disconnect現有Connect
      this.disconnect();

      // Await一段Time後ReConnect
      await new Promise(resolve =>
        setTimeout(resolve, this.config.reconnectInterval)
      );

      // 嘗試ReConnect
      await this.connect();

      // ReSend待Send的Message
      await this.processPendingMessages();
    } catch (error: unknown) {
      logger.error('重新ConnectFailed:', error);
      this.scheduleReconnect();
    }
  }

  // PrivateMethod

  private setupWebSocketEventHandlers(): void {
    if (!this.websocket) return;

    this.websocket.onopen = event => {
      logger.info('WebSocket Connect已建立');
      this.setConnectionStatus('connected');
      this.connectionState.connectedAt = new Date();
      this.connectionState.reconnectAttempts = 0;

      // Begin心跳
      this.startHeartbeat();

      // Handle待SendMessage
      this.processPendingMessages();

      if (this.eventHandlers.onConnect) {
        this.eventHandlers.onConnect(event);
      }
    };

    this.websocket.onclose = event => {
      logger.info('WebSocket Connect已關閉:', {
        code: event.code,
        reason: event.reason,
      });
      this.setConnectionStatus('disconnected');
      this.connectionState.disconnectedAt = new Date();
      this.stats.failedConnections++;

      // 清理定時器
      this.clearIntervals();

      if (this.eventHandlers.onDisconnect) {
        this.eventHandlers.onDisconnect(event);
      }

      // Auto重連（如果不Yes正常Off閉）
      if (event.code !== 1000) {
        this.scheduleReconnect();
      }
    };

    this.websocket.onmessage = event => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error: unknown) {
        logger.error('解析消息Failed:', error);
      }
    };

    this.websocket.onerror = event => {
      logger.error('WebSocket Error:', event as any);
      const error: WebSocketError = {
        code: 'WEBSOCKET_ERROR',
        message: 'WebSocket ConnectError',
        timestamp: new Date(),
        reconnect: true,
        fatal: false,
      };

      this.handleConnectionError(error);
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    this.connectionState.messagesReceived++;
    this.connectionState.bytesReceived += JSON.stringify(message).length;

    // Handle心跳Message
    if (message.type === 'heartbeat') {
      this.handleHeartbeat(message);
      return;
    }

    // HandleConfirmMessage
    if (message.type === 'acknowledgment') {
      this.handleAcknowledgment(message);
      return;
    }

    logger.debug('收到消息:', { messageId: message.id, type: message.type });

    if (this.eventHandlers.onMessage) {
      this.eventHandlers.onMessage(message);
    }
  }

  private handleHeartbeat(message: WebSocketMessage): void {
    this.connectionState.lastHeartbeat = new Date();

    if (message.data?.timestamp) {
      const _latency = Date.now() - new Date(message.data.timestamp).getTime();
      this.connectionState.latency = latency;
      this.metrics.heartbeatLatency.push(latency);

      if (this.eventHandlers.onHeartbeat) {
        this.eventHandlers.onHeartbeat(latency);
      }
    }
  }

  private handleAcknowledgment(message: WebSocketMessage): void {
    if (message.data?.messageId) {
      const _acknowledgedMessageIndex = this.messageQueue.pending.findIndex(
        m => m.id === message.data.messageId
      );

      if (acknowledgedMessageIndex !== -1) {
        const _acknowledgedMessage = this.messageQueue.pending.splice(
          acknowledgedMessageIndex,
          1
        )[0];
        this.messageQueue.acknowledged.push(acknowledgedMessage);
      }
    }
  }

  private handleConnectionError(error: Error | WebSocketError): void {
    this.stats.errorCount++;
    this.connectionState.lastError = error.message;

    if (this.eventHandlers.onError) {
      const wsError: WebSocketError =
        error instanceof Error
          ? {
              code: 'CONNECTION_ERROR',
              message: error.message,
              timestamp: new Date(),
              reconnect: true,
              fatal: false,
            }
          : error;

      this.eventHandlers.onError(wsError);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, this.config.heartbeatInterval);
  }

  private async sendHeartbeat(): Promise<void> {
    try {
      const heartbeatMessage: Partial<WebSocketMessage> = {
        type: 'heartbeat',
        data: {
          timestamp: new Date(),
          clientId: 'cardstrategy_client',
        },
      };

      await this.sendMessage(heartbeatMessage);
    } catch (error: unknown) {
      logger.error('發送心跳Failed:', error);
    }
  }

  private async processPendingMessages(): Promise<void> {
    const _pendingMessages = [...this.messageQueue.pending];
    this.messageQueue.pending = [];

    for (const message of pendingMessages) {
      try {
        await this.sendMessage(message);
      } catch (error: unknown) {
        logger.error('Handle待發送消息Failed:', error);
        this.messageQueue.failed.push(message);
      }
    }
  }

  private scheduleReconnect(): void {
    if (
      this.connectionState.reconnectAttempts >= this.config.maxReconnectAttempts
    ) {
      logger.error('已達到最大重連次數限制');
      return;
    }

    this.connectionState.reconnectAttempts++;
    const _delay =
      this.config.reconnectInterval *
      2 ** (this.connectionState.reconnectAttempts - 1);

    logger.info('計劃重新Connect:', {
      attempt: this.connectionState.reconnectAttempts,
      delay,
    });

    this.reconnectTimeout = setTimeout(
      () => {
        this.reconnect();
      },
      Math.min(delay, 30000)
    ); // 最大延遲30Second
  }

  private clearIntervals(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private setConnectionStatus(status: WebSocketStatus): void {
    const _oldStatus = this.connectionState.status;
    this.connectionState.status = status;

    if (oldStatus !== status && this.eventHandlers.onStatusChange) {
      this.eventHandlers.onStatusChange(status);
    }
  }

  private matchesFilter(
    message: WebSocketMessage,
    filter: SubscriptionFilter
  ): boolean {
    if (filter.userId && message.userId !== filter.userId) {
      return false;
    }

    if (filter.messageTypes && !filter.messageTypes.includes(message.type)) {
      return false;
    }

    if (
      filter.priority &&
      message.priority &&
      !filter.priority.includes(message.priority)
    ) {
      return false;
    }

    if (
      filter.excludeUserIds &&
      message.userId &&
      filter.excludeUserIds.includes(message.userId)
    ) {
      return false;
    }

    if (filter.excludeMessageTypes?.includes(message.type)) {
      return false;
    }

    return true;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateConfig(): void {
    if (!this.config.url) {
      throw new Error('WebSocket URL 不能為空');
    }

    if (this.config.reconnectInterval < 1000) {
      throw new Error('重連間隔不能小於 1000ms');
    }

    if (this.config.maxReconnectAttempts < 1) {
      throw new Error('最大重連次數不能小於 1');
    }
  }

  private initializeStats(): void {
    this.stats.totalConnections = 0;
    this.stats.failedConnections = 0;
    this.stats.totalMessagesSent = 0;
    this.stats.totalMessagesReceived = 0;
    this.stats.errorCount = 0;
  }

  private updateStats(): void {
    const _now = Date.now();
    const _connectTime = this.connectionState.connectedAt
      ? this.connectionState.connectedAt.getTime()
      : now;

    this.stats.uptime = now - connectTime;

    if (this.metrics.heartbeatLatency.length > 0) {
      const _latencies = this.metrics.heartbeatLatency.slice(-100); // 最近100次
      this.stats.averageLatency =
        latencies.reduce((a, b) => a + b, 0) / latencies.length;
      // Remove不存在的Property
    }

    this.stats.errorRate =
      this.stats.totalMessagesSent > 0
        ? (this.stats.errorCount / this.stats.totalMessagesSent) * 100
        : 0;

    this.stats.reliability =
      this.stats.totalConnections > 0
        ? ((this.stats.totalConnections - this.stats.errorCount) /
            this.stats.totalConnections) *
          100
        : 100;
  }

  private getDefaultConfig(): WebSocketConfig {
    return {
      url: 'ws://localhost:8080/ws',
      protocols: [],
      reconnectInterval: 5000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      messageTimeout: 10000,
      enableCompression: true,
      enableEncryption: false,
      binaryType: 'arraybuffer',
      bufferSize: 1024 * 1024, // 1MB
    };
  }

  private getDefaultConnectionState(): ConnectionState {
    return {
      status: 'disconnected',
      reconnectAttempts: 0,
      bytesReceived: 0,
      bytesSent: 0,
      messagesReceived: 0,
      messagesSent: 0,
    };
  }

  private getDefaultMessageQueue(): MessageQueue {
    return {
      pending: [],
      acknowledged: [],
      failed: [],
      maxSize: 1000,
      totalSize: 0,
    };
  }

  private getDefaultMetrics(): WebSocketMetrics {
    return {
      connectionTime: 0,
      messageLatency: [],
      heartbeatLatency: [],
      reconnectFrequency: 0,
      messageFailureRate: 0,
      dataTransferred: 0,
      compressionRatio: 1,
    };
  }

  private getDefaultStats(): WebSocketStats {
    return {
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
    };
  }

  /**
   * GetBatch作業Status
   */
  public getBatchJobStatus(batchId: string): unknown {
    return this.batchJobs?.get(batchId) || null;
  }

  /**
   * Batch作業Map
   */
  private readonly batchJobs: Map<string, any> = new Map();
}

export const _websocketService = WebSocketService.getInstance();
