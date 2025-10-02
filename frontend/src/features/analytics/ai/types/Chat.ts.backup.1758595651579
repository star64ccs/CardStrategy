// AI 聊天助手類型定義

export enum MessageType {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  ERROR = 'error',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum ChatCategory {
  GENERAL = 'general',
  INVESTMENT = 'investment',
  CARD_APPRAISAL = 'card_appraisal',
  MARKET_ANALYSIS = 'market_analysis',
  TECHNICAL_SUPPORT = 'technical_support',
  TRADING = 'trading',
  COLLECTION = 'collection',
  SECURITY = 'security',
}

export enum UserIntent {
  GREETING = 'greeting',
  INVESTMENT_ADVICE = 'investment_advice',
  CARD_APPRAISAL = 'card_appraisal',
  MARKET_QUERY = 'market_query',
  TECHNICAL_HELP = 'technical_help',
  TRADING_GUIDANCE = 'trading_guidance',
  COLLECTION_MANAGEMENT = 'collection_management',
  SECURITY_CONCERN = 'security_concern',
  COMPLAINT = 'complaint',
  FEEDBACK = 'feedback',
  UNKNOWN = 'unknown',
}

export enum ResponseType {
  TEXT = 'text',
  RICH_TEXT = 'rich_text',
  CARD = 'card',
  LIST = 'list',
  CHART = 'chart',
  ACTION = 'action',
  QUICK_REPLY = 'quick_reply',
}

export enum ChatPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  type: MessageType;
  content: string;
  timestamp: string;
  status: MessageStatus;
  category?: ChatCategory;
  intent?: UserIntent;
  responseType?: ResponseType;
  metadata?: {
    cardId?: string;
    price?: number;
    confidence?: number;
    suggestedActions?: string[];
    attachments?: string[];
    [key: string]: unknown;
  };
  userId?: string;
  assistantId?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  category: ChatCategory;
  status: 'active' | 'archived' | 'closed';
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  messageCount: number;
  priority: ChatPriority;
  tags: string[];
  metadata?: {
    userLevel?: string;
    preferredLanguage?: string;
    timezone?: string;
    [key: string]: unknown;
  };
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  userId: string;
  category?: ChatCategory;
  intent?: UserIntent;
  context?: {
    previousMessages?: ChatMessage[];
    userProfile?: unknown;
    currentPage?: string;
    [key: string]: unknown;
  };
  options?: {
    responseType?: ResponseType;
    includeSuggestions?: boolean;
    includeCards?: boolean;
    includeCharts?: boolean;
    [key: string]: unknown;
  };
}

export interface ChatResponse {
  messageId: string;
  sessionId: string;
  content: string;
  responseType: ResponseType;
  timestamp: string;
  confidence: number;
  suggestedActions?: string[];
  quickReplies?: string[];
  cards?: unknown[];
  charts?: unknown[];
  metadata?: {
    processingTime?: number;
    modelUsed?: string;
    tokensUsed?: number;
    [key: string]: unknown;
  };
}

export interface ChatStats {
  totalSessions: number;
  activeSessions: number;
  totalMessages: number;
  averageResponseTime: number;
  userSatisfaction: number;
  categoryDistribution: Record<ChatCategory, number>;
  intentDistribution: Record<UserIntent, number>;
  responseTimeDistribution: {
    under1s: number;
    under2s: number;
    under5s: number;
    over5s: number;
  };
}

export interface ChatHistory {
  sessionId: string;
  messages: ChatMessage[];
  stats: {
    totalMessages: number;
    averageResponseTime: number;
    userSatisfaction: number;
  };
}

export interface ChatConfig {
  maxMessageLength: number;
  maxHistoryLength: number;
  responseTimeout: number;
  enableSuggestions: boolean;
  enableQuickReplies: boolean;
  enableRichResponses: boolean;
  defaultResponseType: ResponseType;
  supportedCategories: ChatCategory[];
  supportedIntents: UserIntent[];
}

export interface ChatServiceConfig {
  apiEndpoint: string;
  apiKey: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retryAttempts: number;
  enableLogging: boolean;
}
