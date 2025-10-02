import { logger } from '../../../core/utils/logger';
import type {
  ChatRequest,
  ChatResponse,
  ChatSession,
  ChatMessage,
  ChatStats,
  ChatHistory,
  ChatServiceConfig,
} from '../types/chat';
import {
  ChatConfig,
  MessageType,
  MessageStatus,
  ChatCategory,
  UserIntent,
  ResponseType,
  ChatPriority,
} from '../types/chat';

export class ChatService {
  private static instance: ChatService;
  private config: ChatServiceConfig;
  private readonly sessions: Map<string, ChatSession> = new Map();
  private readonly messageHistory: Map<string, ChatMessage[]> = new Map();
  private readonly stats: ChatStats;

  private constructor() {
    this.config = {
      apiEndpoint: 'https://api.cardstrategy.com/chat',
      apiKey: 'demo-key',
      modelName: 'gpt-4',
      maxTokens: 1000,
      temperature: 0.7,
      timeout: 10000,
      retryAttempts: 3,
      enableLogging: true,
    };

    this.stats = {
      totalSessions: 0,
      activeSessions: 0,
      totalMessages: 0,
      averageResponseTime: 0,
      userSatisfaction: 0,
      categoryDistribution: {} as Record<ChatCategory, number>,
      intentDistribution: {} as Record<UserIntent, number>,
      responseTimeDistribution: {
        under1s: 0,
        under2s: 0,
        under5s: 0,
        over5s: 0,
      },
    };

    this.initializeStats();
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  private initializeStats(): void {
    // Initialize統Count據
    Object.values(ChatCategory).forEach(category => {
      this.stats.categoryDistribution[category] = 0;
    });
    Object.values(UserIntent).forEach(intent => {
      this.stats.intentDistribution[intent] = 0;
    });
  }

  public async initialize(): Promise<void> {
    try {
      logger.info('ChatService: Initialize AI 聊天助手Service');
      // 模擬Initialize過程
      await new Promise(resolve => setTimeout(resolve, 100));
      logger.info('ChatService: 初始化完成');
    } catch (error) {
      logger.error('ChatService: InitializeFailed', error);
      throw error;
    }
  }

  public async createSession(
    userId: string,
    category: ChatCategory = ChatCategory.GENERAL
  ): Promise<ChatSession> {
    try {
      const _sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const session: ChatSession = {
        id: sessionId,
        userId,
        title: `聊天會話 ${new Date().toLocaleString()}`,
        category,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        messageCount: 0,
        priority: ChatPriority.NORMAL,
        tags: [],
        metadata: {
          userLevel: 'standard',
          preferredLanguage: 'zh-TW',
          timezone: 'Asia/Taipei',
        },
      };

      this.sessions.set(sessionId, session);
      this.messageHistory.set(sessionId, []);
      this.stats.totalSessions++;
      this.stats.activeSessions++;
      this.stats.categoryDistribution[category]++;

      logger.info(`ChatService: 創建新會話 ${sessionId} 給用戶 ${userId}`);
      return session;
    } catch (error) {
      logger.error('ChatService: Create會話Failed', error);
      throw error;
    }
  }

  public async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const _startTime = Date.now();

    try {
      logger.info(`ChatService: 處理消息請求，會話: ${request.sessionId}`);

      // Verify會話YesNo存在
      const _session = this.sessions.get(request.sessionId);
      if (!session) {
        throw new Error(`會話 ${request.sessionId} 不存在`);
      }

      // CreateUserMessage
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: request.sessionId,
        type: MessageType.USER,
        content: request.message,
        timestamp: new Date().toISOString(),
        status: MessageStatus.SENT,
        category: request.category,
        intent: request.intent,
        userId: request.userId,
      };

      // SaveUserMessage
      const _messages = this.messageHistory.get(request.sessionId) || [];
      messages.push(userMessage);
      this.messageHistory.set(request.sessionId, messages);

      // Update會話Statistics
      session.messageCount++;
      session.lastMessageAt = new Date().toISOString();
      session.updatedAt = new Date().toISOString();

      // AnalysisUser意Graph
      const _intent = request.intent || this.analyzeIntent(request.message);
      userMessage.intent = intent;
      this.stats.intentDistribution[intent]++;

      // 生成 AI 回應
      const _aiResponse = await this.generateResponse(
        request,
        intent,
        messages
      );

      // Create AI Message
      const aiMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId: request.sessionId,
        type: MessageType.ASSISTANT,
        content: aiResponse.content,
        timestamp: new Date().toISOString(),
        status: MessageStatus.SENT,
        category: request.category,
        intent,
        responseType: aiResponse.responseType,
        metadata: aiResponse.metadata,
        assistantId: 'ai-assistant-001',
      };

      // Save AI Message
      messages.push(aiMessage);
      this.messageHistory.set(request.sessionId, messages);

      // Update會話Statistics（AI Message）
      session.messageCount++;
      session.lastMessageAt = new Date().toISOString();
      session.updatedAt = new Date().toISOString();

      // UpdateStatistics
      this.stats.totalMessages += 2;
      const _responseTime = Date.now() - startTime;
      this.updateResponseTimeStats(responseTime);

      logger.info(`ChatService: 消息處理完成，響應時間: ${responseTime}ms`);

      return {
        messageId: aiMessage.id,
        sessionId: request.sessionId,
        content: aiResponse.content,
        responseType: aiResponse.responseType,
        timestamp: aiMessage.timestamp,
        confidence: aiResponse.confidence,
        suggestedActions: aiResponse.suggestedActions,
        quickReplies: aiResponse.quickReplies,
        cards: aiResponse.cards,
        charts: aiResponse.charts,
        metadata: {
          processingTime: responseTime,
          modelUsed: this.config.modelName,
          tokensUsed:
            Math.floor(request.message.length / 4) +
            Math.floor(aiResponse.content.length / 4),
        },
      };
    } catch (error) {
      logger.error('ChatService: 發送消息Failed', error);
      throw error;
    }
  }

  private analyzeIntent(message: string): UserIntent {
    const _lowerMessage = message.toLowerCase();

    // 簡單的OffKey詞匹配來Analysis意Graph
    if (
      lowerMessage.includes('你好') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hello')
    ) {
      return UserIntent.GREETING;
    }
    if (
      lowerMessage.includes('投資') ||
      lowerMessage.includes('買') ||
      lowerMessage.includes('賣')
    ) {
      return UserIntent.INVESTMENT_ADVICE;
    }
    if (
      lowerMessage.includes('鑑定') ||
      lowerMessage.includes('評分') ||
      lowerMessage.includes('等級')
    ) {
      return UserIntent.CARD_APPRAISAL;
    }
    if (
      lowerMessage.includes('價格') ||
      lowerMessage.includes('市場') ||
      lowerMessage.includes('趨勢')
    ) {
      return UserIntent.MARKET_QUERY;
    }
    if (
      lowerMessage.includes('幫助') ||
      lowerMessage.includes('問題') ||
      lowerMessage.includes('故障')
    ) {
      return UserIntent.TECHNICAL_HELP;
    }
    if (lowerMessage.includes('交易') || lowerMessage.includes('買賣')) {
      return UserIntent.TRADING_GUIDANCE;
    }
    if (lowerMessage.includes('收藏') || lowerMessage.includes('卡組')) {
      return UserIntent.COLLECTION_MANAGEMENT;
    }
    if (
      lowerMessage.includes('安全') ||
      lowerMessage.includes('假卡') ||
      lowerMessage.includes('詐騙')
    ) {
      return UserIntent.SECURITY_CONCERN;
    }
    if (lowerMessage.includes('投訴') || lowerMessage.includes('不滿')) {
      return UserIntent.COMPLAINT;
    }
    if (lowerMessage.includes('反饋') || lowerMessage.includes('建議')) {
      return UserIntent.FEEDBACK;
    }

    return UserIntent.UNKNOWN;
  }

  private async generateResponse(
    request: ChatRequest,
    intent: UserIntent,
    messages: ChatMessage[]
  ): Promise<{
    content: string;
    responseType: ResponseType;
    confidence: number;
    suggestedActions?: string[];
    quickReplies?: string[];
    cards?: unknown[];
    charts?: unknown[];
    metadata?: unknown;
  }> {
    // 模擬 AI 回應生成
    const _responses = {
      [UserIntent.GREETING]: {
        content:
          '您好！我是 CardStrategy 的 AI 助手，很高興為您Service。我可以幫助您進行卡牌投資諮詢、市場分析、卡牌鑑定等Service。請問有什麼我可以幫助您的嗎？',
        responseType: ResponseType.TEXT,
        confidence: 0.95,
        quickReplies: ['投資建議', '卡牌鑑定', '市場分析', '技術支援'],
      },
      [UserIntent.INVESTMENT_ADVICE]: {
        content:
          '關於投資建議，我需要了解您的投資目標、風險承受度和預算。建議您使用我們的投資建議系統，它會根據您的個人情況提供個性化的投資建議。您也可以告訴我您感興趣的卡牌類型，我可以提供一些一般性的投資指導。',
        responseType: ResponseType.RICH_TEXT,
        confidence: 0.88,
        suggestedActions: [
          '使用投資建議系統',
          '查看熱門投資卡牌',
          '了解風險評估',
        ],
        quickReplies: ['設定投資目標', '查看投資組合', '風險評估'],
      },
      [UserIntent.CARD_APPRAISAL]: {
        content:
          '卡牌鑑定Service可以幫助您評估卡牌的價值和狀況。您可以上傳卡牌照片，我們的 AI 系統會分析卡牌的品相、稀有度和市場價值。建議您使用我們的專業鑑定系統獲得最準確的評估結果。',
        responseType: ResponseType.RICH_TEXT,
        confidence: 0.92,
        suggestedActions: ['開始卡牌鑑定', '查看鑑定標準', '了解評分系統'],
        quickReplies: ['上傳卡牌照片', '查看鑑定歷史', '了解評分標準'],
      },
      [UserIntent.MARKET_QUERY]: {
        content:
          '市場查詢功能可以為您提供實時的卡牌價格、市場趨勢和交易數據。您可以查詢特定卡牌的價格歷史、市場波動情況，以及相關的投資建議。',
        responseType: ResponseType.RICH_TEXT,
        confidence: 0.9,
        suggestedActions: ['查看市場價格', '分析市場趨勢', '查看交易數據'],
        quickReplies: ['查詢卡牌價格', '查看市場趨勢', '分析交易數據'],
      },
      [UserIntent.TECHNICAL_HELP]: {
        content:
          '技術支援Service可以幫助您解決使用平台時遇到的問題。請描述您遇到的具體問題，我會盡力為您提供解決方案。如果是複雜問題，我們會轉接給專業的技術支援團隊。',
        responseType: ResponseType.TEXT,
        confidence: 0.85,
        suggestedActions: ['聯繫技術支援', '查看常見問題', '提交問題報告'],
        quickReplies: ['常見問題', '聯繫客服', '提交報告'],
      },
      [UserIntent.TRADING_GUIDANCE]: {
        content:
          '交易指導Service可以幫助您了解卡牌交易的流程、注意事項和最佳實踐。我們提供安全的交易平台，支持買賣雙方進行公平交易。建議您先了解交易規則和安全措施。',
        responseType: ResponseType.RICH_TEXT,
        confidence: 0.87,
        suggestedActions: ['查看交易規則', '了解安全措施', '開始交易'],
        quickReplies: ['交易規則', '安全指南', '開始交易'],
      },
      [UserIntent.COLLECTION_MANAGEMENT]: {
        content:
          '收藏管理功能可以幫助您整理和管理您的卡牌收藏。您可以創建收藏清單、追蹤收藏價值、設定收藏目標等。這有助於您更好地管理投資組合。',
        responseType: ResponseType.RICH_TEXT,
        confidence: 0.89,
        suggestedActions: ['管理收藏', '查看收藏統計', '設定收藏目標'],
        quickReplies: ['查看收藏', '添加卡牌', '收藏統計'],
      },
      [UserIntent.SECURITY_CONCERN]: {
        content:
          '安全問題是我們非常重視的。我們有完善的假卡檢測系統和舉報機制來保護用戶權益。如果您發現可疑的假卡或詐騙行為，請立即舉報。我們會認真處理每個安全問題。',
        responseType: ResponseType.TEXT,
        confidence: 0.94,
        suggestedActions: ['舉報假卡', '查看安全指南', '聯繫安全團隊'],
        quickReplies: ['舉報假卡', '安全指南', '聯繫客服'],
      },
      [UserIntent.COMPLAINT]: {
        content:
          '非常抱歉您遇到了不愉快的體驗。請詳細描述您的問題，我會認真記錄並轉交給相關部門處理。我們會盡快給您滿意的答覆。',
        responseType: ResponseType.TEXT,
        confidence: 0.8,
        suggestedActions: ['提交投訴', '查看處理進度', '聯繫客服'],
        quickReplies: ['提交投訴', '查看進度', '聯繫客服'],
      },
      [UserIntent.FEEDBACK]: {
        content:
          '感謝您的反饋！您的意見對我們改進Service非常重要。請告訴我們您的建議或意見，我們會認真考慮並努力改進。',
        responseType: ResponseType.TEXT,
        confidence: 0.85,
        suggestedActions: ['提交反饋', '查看改進計劃', '參與用戶調查'],
        quickReplies: ['提交反饋', '查看改進', '參與調查'],
      },
      [UserIntent.UNKNOWN]: {
        content:
          '抱歉，我沒有完全理解您的問題。請您重新描述一下，或者選擇以下常見問題之一，我會為您提供幫助。',
        responseType: ResponseType.TEXT,
        confidence: 0.6,
        quickReplies: ['投資建議', '卡牌鑑定', '市場查詢', '技術支援'],
      },
    };

    const _response = responses[intent] || responses[UserIntent.UNKNOWN];

    // 模擬HandleTime
    await new Promise(resolve =>
      setTimeout(resolve, Math.random() * 1000 + 500)
    );

    return response;
  }

  private updateResponseTimeStats(responseTime: number): void {
    const _totalResponses =
      this.stats.responseTimeDistribution.under1s +
      this.stats.responseTimeDistribution.under2s +
      this.stats.responseTimeDistribution.under5s +
      this.stats.responseTimeDistribution.over5s;

    if (responseTime < 1000) {
      this.stats.responseTimeDistribution.under1s++;
    } else if (responseTime < 2000) {
      this.stats.responseTimeDistribution.under2s++;
    } else if (responseTime < 5000) {
      this.stats.responseTimeDistribution.under5s++;
    } else {
      this.stats.responseTimeDistribution.over5s++;
    }

    // Update平均ResponseTime
    this.stats.averageResponseTime =
      (this.stats.averageResponseTime * totalResponses + responseTime) /
      (totalResponses + 1);
  }

  public async getSession(sessionId: string): Promise<ChatSession | null> {
    return this.sessions.get(sessionId) || null;
  }

  public async getUserSessions(userId: string): Promise<ChatSession[]> {
    return Array.from(this.sessions.values()).filter(
      session => session.userId === userId
    );
  }

  public async getSessionHistory(
    sessionId: string
  ): Promise<ChatHistory | null> {
    const _session = this.sessions.get(sessionId);
    const _messages = this.messageHistory.get(sessionId);

    if (!session || !messages) {
      return null;
    }

    const _totalMessages = messages.length;
    const { averageResponseTime } = this.stats;
    const _userSatisfaction = 4.2; // 模擬User滿意度

    return {
      sessionId,
      messages,
      stats: {
        totalMessages,
        averageResponseTime,
        userSatisfaction,
      },
    };
  }

  public async getStats(): Promise<ChatStats> {
    return { ...this.stats };
  }

  public async closeSession(sessionId: string): Promise<void> {
    const _session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'closed';
      session.updatedAt = new Date().toISOString();
      this.stats.activeSessions--;
      logger.info(`ChatService: 關閉會話 ${sessionId}`);
    }
  }

  public async archiveSession(sessionId: string): Promise<void> {
    const _session = this.sessions.get(sessionId);
    if (session) {
      session.status = 'archived';
      session.updatedAt = new Date().toISOString();
      logger.info(`ChatService: 歸檔會話 ${sessionId}`);
    }
  }

  public async updateSessionPriority(
    sessionId: string,
    priority: ChatPriority
  ): Promise<void> {
    const _session = this.sessions.get(sessionId);
    if (session) {
      session.priority = priority;
      session.updatedAt = new Date().toISOString();
      logger.info(`ChatService: 更新會話 ${sessionId} 優先級為 ${priority}`);
    }
  }

  public async addSessionTag(sessionId: string, tag: string): Promise<void> {
    const _session = this.sessions.get(sessionId);
    if (session && !session.tags.includes(tag)) {
      session.tags.push(tag);
      session.updatedAt = new Date().toISOString();
      logger.info(`ChatService: 為會話 ${sessionId} 添加標籤 ${tag}`);
    }
  }

  public async removeSessionTag(sessionId: string, tag: string): Promise<void> {
    const _session = this.sessions.get(sessionId);
    if (session) {
      session.tags = session.tags.filter(t => t !== tag);
      session.updatedAt = new Date().toISOString();
      logger.info(`ChatService: 從會話 ${sessionId} 移除標籤 ${tag}`);
    }
  }

  public async updateConfig(config: Partial<ChatServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    logger.info('ChatService: 更新配置', config);
  }

  public async getConfig(): Promise<ChatServiceConfig> {
    return { ...this.config };
  }
}
