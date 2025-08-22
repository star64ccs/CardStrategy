import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';
import { z } from 'zod';

// AI聊天助手配置
export interface AIChatAssistantConfig {
  // 自然語言處理配置
  nlp: {
    enabled: boolean;
    language: 'zh-TW' | 'en-US' | 'ja-JP';
    confidenceThreshold: number;
    contextWindow: number;
  };

  // 知識庫配置
  knowledgeBase: {
    enabled: boolean;
    autoUpdate: boolean;
    sources: string[];
    updateInterval: number; // 小時
  };

  // 智能推薦配置
  recommendation: {
    enabled: boolean;
    personalization: boolean;
    learningRate: number;
    maxRecommendations: number;
  };
}

// 聊天消息
export interface ChatMessage {
  messageId: string;
  timestamp: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  intent?: string;
  confidence?: number;
  entities?: {
    type: string;
    value: string;
    confidence: number;
  }[];
  context?: Record<string, any>;
  metadata?: {
    sessionId: string;
    userId: string;
    platform: string;
  };
}

// 對話會話
export interface ChatSession {
  sessionId: string;
  userId: string;
  startTime: string;
  lastActivity: string;
  messages: ChatMessage[];
  context: {
    currentTopic: string;
    userPreferences: Record<string, any>;
    conversationHistory: string[];
  };
  status: 'active' | 'paused' | 'ended';
}

// 知識庫項目
export interface KnowledgeItem {
  itemId: string;
  category: 'card_info' | 'market_data' | 'trading_tips' | 'faq' | 'news';
  title: string;
  content: string;
  keywords: string[];
  confidence: number;
  lastUpdated: string;
  source: string;
  language: string;
  metadata?: Record<string, any>;
}

// 智能推薦
export interface Recommendation {
  recommendationId: string;
  type:
    | 'card_suggestion'
    | 'investment_advice'
    | 'market_analysis'
    | 'trading_strategy';
  title: string;
  description: string;
  confidence: number;
  reasoning: string;
  actions: {
    action: string;
    description: string;
    url?: string;
  }[];
  priority: 'high' | 'medium' | 'low';
  expiresAt?: string;
}

// 意圖識別結果
export interface IntentRecognition {
  intent: string;
  confidence: number;
  entities: {
    type: string;
    value: string;
    confidence: number;
  }[];
  context: Record<string, any>;
  suggestedActions: string[];
}

// AI聊天助手服務類
class AIChatAssistantService {
  private config: AIChatAssistantConfig = {
    nlp: {
      enabled: true,
      language: 'zh-TW',
      confidenceThreshold: 0.7,
      contextWindow: 10,
    },
    knowledgeBase: {
      enabled: true,
      autoUpdate: true,
      sources: ['card_database', 'market_data', 'user_manual'],
      updateInterval: 24,
    },
    recommendation: {
      enabled: true,
      personalization: true,
      learningRate: 0.1,
      maxRecommendations: 5,
    },
  };

  // 獲取當前配置
  getConfig(): AIChatAssistantConfig {
    return this.config;
  }

  // 更新配置
  updateConfig(newConfig: Partial<AIChatAssistantConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('✅ AI聊天助手配置已更新', { config: this.config });
  }

  // 發送消息並獲取回應
  async sendMessage(message: {
    content: string;
    sessionId: string;
    userId: string;
    context?: Record<string, any>;
  }): Promise<ChatMessage> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          '/ai-chat/send-message',
          message
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 創建新的聊天會話
  async createSession(
    userId: string,
    initialContext?: Record<string, any>
  ): Promise<ChatSession> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post('/ai-chat/sessions', {
          userId,
          initialContext,
        });
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 獲取聊天會話
  async getSession(sessionId: string): Promise<ChatSession> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(`/ai-chat/sessions/${sessionId}`);
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 獲取用戶的所有會話
  async getUserSessions(userId: string): Promise<ChatSession[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          `/ai-chat/sessions?userId=${userId}`
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 結束聊天會話
  async endSession(sessionId: string): Promise<{
    success: boolean;
    message: string;
    summary?: {
      totalMessages: number;
      duration: number;
      topics: string[];
    };
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.put(
          `/ai-chat/sessions/${sessionId}/end`
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 意圖識別
  async recognizeIntent(
    text: string,
    context?: Record<string, any>
  ): Promise<IntentRecognition> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post('/ai-chat/recognize-intent', {
          text,
          context,
        });
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 搜索知識庫
  async searchKnowledgeBase(
    query: string,
    category?: string,
    limit?: number
  ): Promise<KnowledgeItem[]> {
    return withErrorHandling(
      async () => {
        const params = new URLSearchParams();
        params.append('query', query);
        if (category) params.append('category', category);
        if (limit) params.append('limit', limit.toString());

        const response = await apiService.get(
          `/ai-chat/knowledge/search?${params}`
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 添加知識庫項目
  async addKnowledgeItem(
    item: Omit<KnowledgeItem, 'itemId' | 'lastUpdated'>
  ): Promise<{
    success: boolean;
    itemId: string;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          '/ai-chat/knowledge/items',
          item
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 更新知識庫項目
  async updateKnowledgeItem(
    itemId: string,
    updates: Partial<KnowledgeItem>
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.put(
          `/ai-chat/knowledge/items/${itemId}`,
          updates
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 刪除知識庫項目
  async deleteKnowledgeItem(itemId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.delete(
          `/ai-chat/knowledge/items/${itemId}`
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 獲取智能推薦
  async getRecommendations(
    userId: string,
    context?: Record<string, any>
  ): Promise<Recommendation[]> {
    return withErrorHandling(
      async () => {
        const params = new URLSearchParams();
        params.append('userId', userId);
        if (context) {
          params.append('context', JSON.stringify(context));
        }

        const response = await apiService.get(
          `/ai-chat/recommendations?${params}`
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 提供推薦反饋
  async provideRecommendationFeedback(
    recommendationId: string,
    feedback: {
      rating: number; // 1-5
      helpful: boolean;
      comments?: string;
      actionTaken?: string;
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          `/ai-chat/recommendations/${recommendationId}/feedback`,
          feedback
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 訓練AI模型
  async trainModel(trainingData: {
    conversations: ChatSession[];
    feedback: Array<{
      messageId: string;
      rating: number;
      helpful: boolean;
    }>;
  }): Promise<{
    success: boolean;
    message: string;
    modelAccuracy: number;
    trainingTime: number;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          '/ai-chat/train-model',
          trainingData
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 獲取對話分析
  async getConversationAnalytics(sessionId: string): Promise<{
    sessionId: string;
    totalMessages: number;
    averageResponseTime: number;
    userSatisfaction: number;
    topics: {
      topic: string;
      frequency: number;
      sentiment: 'positive' | 'neutral' | 'negative';
    }[];
    intents: {
      intent: string;
      count: number;
      successRate: number;
    }[];
    recommendations: {
      type: string;
      count: number;
      acceptanceRate: number;
    }[];
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          `/ai-chat/analytics/sessions/${sessionId}`
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 獲取用戶分析
  async getUserAnalytics(
    userId: string,
    timeRange: '7d' | '30d' | '90d'
  ): Promise<{
    userId: string;
    totalSessions: number;
    totalMessages: number;
    averageSessionDuration: number;
    favoriteTopics: string[];
    satisfactionTrend: {
      date: string;
      satisfaction: number;
    }[];
    recommendationPerformance: {
      type: string;
      shown: number;
      accepted: number;
      conversionRate: number;
    }[];
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          `/ai-chat/analytics/users/${userId}?timeRange=${timeRange}`
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 設置用戶偏好
  async setUserPreferences(
    userId: string,
    preferences: {
      language?: string;
      topics?: string[];
      notificationSettings?: {
        email: boolean;
        push: boolean;
        frequency: 'immediate' | 'daily' | 'weekly';
      };
      privacySettings?: {
        dataCollection: boolean;
        personalization: boolean;
        analytics: boolean;
      };
    }
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.put(
          `/ai-chat/users/${userId}/preferences`,
          preferences
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 獲取用戶偏好
  async getUserPreferences(userId: string): Promise<{
    language: string;
    topics: string[];
    notificationSettings: {
      email: boolean;
      push: boolean;
      frequency: string;
    };
    privacySettings: {
      dataCollection: boolean;
      personalization: boolean;
      analytics: boolean;
    };
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get(
          `/ai-chat/users/${userId}/preferences`
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 導出對話記錄
  async exportConversation(
    sessionId: string,
    format: 'json' | 'csv' | 'pdf'
  ): Promise<{
    success: boolean;
    downloadUrl: string;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          `/ai-chat/sessions/${sessionId}/export`,
          {
            format,
          }
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 批量處理消息
  async processBatchMessages(
    messages: Array<{
      content: string;
      sessionId: string;
      userId: string;
    }>
  ): Promise<ChatMessage[]> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post('/ai-chat/batch-process', {
          messages,
        });
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 獲取系統狀態
  async getSystemStatus(): Promise<{
    nlpService: {
      status: 'online' | 'offline' | 'degraded';
      responseTime: number;
      accuracy: number;
    };
    knowledgeBase: {
      status: 'online' | 'offline' | 'syncing';
      totalItems: number;
      lastUpdated: string;
    };
    recommendationEngine: {
      status: 'online' | 'offline' | 'training';
      activeUsers: number;
      recommendationsGenerated: number;
    };
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.get('/ai-chat/system/status');
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 重置用戶學習數據
  async resetUserLearning(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post(
          `/ai-chat/users/${userId}/reset-learning`
        );
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 獲取熱門問題
  async getFrequentlyAskedQuestions(limit?: number): Promise<
    Array<{
      question: string;
      answer: string;
      frequency: number;
      category: string;
    }>
  > {
    return withErrorHandling(
      async () => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());

        const response = await apiService.get(`/ai-chat/faq?${params}`);
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }

  // 添加FAQ
  async addFAQ(faq: {
    question: string;
    answer: string;
    category: string;
    keywords?: string[];
  }): Promise<{
    success: boolean;
    faqId: string;
    message: string;
  }> {
    return withErrorHandling(
      async () => {
        const response = await apiService.post('/ai-chat/faq', faq);
        return response.data;
      },
      { service: 'AIChatAssistantService' }
    )();
  }
}

// 創建單例實例
export { AIChatAssistantService };
export const aiChatAssistantService = new AIChatAssistantService();
