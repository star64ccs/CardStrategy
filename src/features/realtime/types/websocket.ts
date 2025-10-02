/**
 * WebSocket 通信Class型定義
 * 用於實時通信功能的Class型定義
 */

export type WebSocketStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error';

export type MessageType =
  | 'heartbeat'
  | 'user_update'
  | 'card_update'
  | 'notification'
  | 'sync_request'
  | 'system_message'
  | 'error'
  | 'acknowledgment';

export interface WebSocketMessage {
  id: string;
  type: MessageType;
  timestamp: Date;
  data: unknown;
  userId?: string;
  sessionId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  retryCount?: number;
  expiresAt?: Date;
}

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageTimeout?: number;
  enableCompression?: boolean;
  enableEncryption?: boolean;
  binaryType?: 'blob' | 'arraybuffer';
  bufferSize?: number;
  autoConnect?: boolean;
  enableLogging?: boolean;
  messageHistoryLimit?: number;
  notificationLimit?: number;
}

export interface ConnectionState {
  status: WebSocketStatus;
  connectedAt?: Date;
  disconnectedAt?: Date;
  lastHeartbeat?: Date;
  reconnectAttempts: number;
  lastError?: string;
  latency?: number;
  bytesReceived: number;
  bytesSent: number;
  messagesReceived: number;
  messagesSent: number;
}

export interface WebSocketError {
  code: string;
  message: string;
  timestamp: Date;
  reconnect: boolean;
  fatal: boolean;
  details?: unknown;
}

export interface MessageQueue {
  pending: WebSocketMessage[];
  acknowledged: WebSocketMessage[];
  failed: WebSocketMessage[];
  maxSize: number;
  totalSize: number;
}

export interface WebSocketEventHandlers {
  onConnect?: (event: Event) => void;
  onDisconnect?: (event: CloseEvent) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: WebSocketError) => void;
  onReconnect?: (attempt: number) => void;
  onHeartbeat?: (latency: number) => void;
  onStatusChange?: (status: WebSocketStatus) => void;
}

export interface SubscriptionFilter {
  userId?: string;
  messageTypes?: MessageType[];
  priority?: ('low' | 'normal' | 'high' | 'urgent')[];
  tags?: string[];
  excludeUserIds?: string[];
  excludeMessageTypes?: MessageType[];
}

export interface WebSocketStats {
  uptime: number;
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  totalMessagesSent: number;
  totalMessagesReceived: number;
  errorCount: number;
  errorRate: number;
  reliability: number;
  averageLatency: number;
  lastHeartbeat: string | null;
}

export interface WebSocketMetrics {
  connectionTime: number;
  messageLatency: number[];
  heartbeatLatency: number[];
  reconnectFrequency: number;
  messageFailureRate: number;
  dataTransferred: number;
  compressionRatio: number;
}

export interface RealtimeUpdate {
  id: string;
  type: 'card' | 'user' | 'system' | 'notification';
  action: 'create' | 'update' | 'delete' | 'sync';
  entityId: string;
  data: unknown;
  timestamp: Date;
  version: number;
  checksum?: string;
  metadata?: unknown;
}

export interface PresenceInfo {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  device?: string;
  location?: string;
  activity?: string;
  metadata?: unknown;
}

export interface RoomInfo {
  id: string;
  name: string;
  type: 'public' | 'private' | 'system';
  participants: PresenceInfo[];
  created: Date;
  updated: Date;
  settings: {
    maxParticipants: number;
    allowGuests: boolean;
    enableHistory: boolean;
    enableEncryption: boolean;
  };
}

export interface BroadcastOptions {
  room?: string;
  userIds?: string[];
  excludeUserIds?: string[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  reliable?: boolean;
  compress?: boolean;
  encrypt?: boolean;
  ttl?: number;
}
