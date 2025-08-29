import { serviceConfig } from '../../../core/config/services';
import { errorHandler } from '../../../core/utils/errorHandler';
import { logger } from '../../../core/utils/logger';

/**
 * OpenAI 服務配置接口
 */
interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  baseURL?: string;
}

/**
 * OpenAI 聊天消息接口
 */
interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * OpenAI 聊天完成響應接口
 */
interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI 嵌入響應接口
 */
interface EmbeddingResponse {
  object: string;
  data: {
    object: string;
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenAI 服務類
 * 提供與 OpenAI API 的集成功能
 */
export class OpenAIService {
  private static instance: OpenAIService;
  private config: OpenAIConfig;
  private isInitialized = false;

  private constructor() {
    this.config = {
      apiKey: '',
      model: 'gpt-3.5-turbo',
      maxTokens: 2000,
      temperature: 0.7,
      baseURL: 'https://api.openai.com/v1',
    };
  }

  static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * 初始化 OpenAI 服務
   */
  async initialize(): Promise<void> {
    try {
      await serviceConfig.initialize();

      const _apiKey = serviceConfig.get('OPENAI_API_KEY');
      if (!apiKey) {
        throw new Error('OpenAI API Key 未配置');
      }

      this.config = {
        apiKey,
        model: serviceConfig.get('OPENAI_MODEL') || 'gpt-3.5-turbo',
        maxTokens: serviceConfig.get('OPENAI_MAX_TOKENS') || 2000,
        temperature: serviceConfig.get('OPENAI_TEMPERATURE') || 0.7,
        baseURL: 'https://api.openai.com/v1',
      };

      // 測試 API 連接
      await this.testConnection();

      this.isInitialized = true;
      logger.info('OpenAI 服務初始化成功');
    } catch (error) {
      logger.error('OpenAI 服務初始化失敗:', { error });
      throw error;
    }
  }

  /**
   * 測試 API 連接
   */
  private async testConnection(): Promise<void> {
    try {
      const _response = await this.makeRequest('/models', 'GET');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('API 響應格式無效');
      }
      logger.info('OpenAI API 連接測試成功');
    } catch (error) {
      logger.error('OpenAI API 連接測試失敗:', { error });
      throw new Error('無法連接到 OpenAI API');
    }
  }

  /**
   * 發送聊天完成請求
   */
  async chatCompletion(
    messages: ChatMessage[],
    options?: {
      model?: string;
      maxTokens?: number;
      temperature?: number;
      stream?: boolean;
    }
  ): Promise<ChatCompletionResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const _requestBody = {
        model: options?.model || this.config.model,
        messages,
        max_tokens: options?.maxTokens || this.config.maxTokens,
        temperature: options?.temperature || this.config.temperature,
        stream: options?.stream || false,
      };

      logger.info('發送 OpenAI 聊天完成請求:', {
        model: requestBody.model,
        messageCount: messages.length,
        maxTokens: requestBody.max_tokens,
      });

      const _response = await this.makeRequest(
        '/chat/completions',
        'POST',
        requestBody
      );

      logger.info('OpenAI 聊天完成響應:', {
        id: response.id,
        model: response.model,
        usage: response.usage,
      });

      return response;
    } catch (error) {
      const _appError = errorHandler.handleError(
        error as Error,
        'OpenAI聊天完成'
      );
      throw appError;
    }
  }

  /**
   * 生成文本嵌入
   */
  async createEmbedding(
    input: string | string[],
    model = 'text-embedding-ada-002'
  ): Promise<EmbeddingResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const _requestBody = {
        model,
        input,
      };

      logger.info('發送 OpenAI 嵌入請求:', {
        model,
        inputType: Array.isArray(input) ? 'array' : 'string',
        inputLength: Array.isArray(input) ? input.length : input.length,
      });

      const _response = await this.makeRequest(
        '/embeddings',
        'POST',
        requestBody
      );

      logger.info('OpenAI 嵌入響應:', {
        model: response.model,
        dataCount: response.data.length,
        usage: response.usage,
      });

      return response;
    } catch (error) {
      const _appError = errorHandler.handleError(
        error as Error,
        'OpenAI嵌入創建'
      );
      throw appError;
    }
  }

  /**
   * 分析卡牌圖片
   */
  async analyzeCardImage(imageUrl: string, prompt?: string): Promise<string> {
    const _defaultPrompt = `
      請分析這張卡牌圖片，提供以下信息：
      1. 卡牌名稱
      2. 卡牌類型
      3. 稀有度
      4. 屬性或顏色
      5. 攻擊力/防禦力（如果有）
      6. 卡牌描述或效果
      7. 卡牌狀況評估
      8. 市場價值估計

      請用繁體中文回答，格式清晰。
    `;

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          '你是一個專業的卡牌收藏專家，擅長分析各種卡牌的詳細信息和市場價值。',
      },
      {
        role: 'user',
        content: `${prompt || defaultPrompt}\n\n圖片URL: ${imageUrl}`,
      },
    ];

    try {
      const _response = await this.chatCompletion(messages, {
        maxTokens: 1000,
        temperature: 0.3,
      });

      return response.choices[0]?.message?.content || '無法分析圖片';
    } catch (error) {
      logger.error('卡牌圖片分析失敗:', { error, imageUrl });
      throw error;
    }
  }

  /**
   * 生成卡牌投資建議
   */
  async generateInvestmentAdvice(cardData: {
    name: string;
    rarity: string;
    condition: string;
    currentPrice: number;
    historicalPrices: number[];
  }): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          '你是一個專業的卡牌投資顧問，擅長分析卡牌的投資價值和市場趨勢。',
      },
      {
        role: 'user',
        content: `
          請為以下卡牌提供投資建議：

          卡牌名稱: ${cardData.name}
          稀有度: ${cardData.rarity}
          狀況: ${cardData.condition}
          當前價格: $${cardData.currentPrice}
          歷史價格: ${cardData.historicalPrices.join(', ')}

          請分析：
          1. 投資潛力評估
          2. 風險分析
          3. 建議持有期間
          4. 預期收益率
          5. 市場趨勢分析

          請用繁體中文回答，提供具體的投資建議。
        `,
      },
    ];

    try {
      const _response = await this.chatCompletion(messages, {
        maxTokens: 800,
        temperature: 0.4,
      });

      return response.choices[0]?.message?.content || '無法生成投資建議';
    } catch (error) {
      logger.error('投資建議生成失敗:', { error, cardName: cardData.name });
      throw error;
    }
  }

  /**
   * AI 聊天對話
   */
  async chat(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    context?: string
  ): Promise<string> {
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `
        你是 CardStrategy 應用的 AI 助手，專門幫助用戶進行卡牌收藏和投資。
        你的專長包括：
        1. 卡牌識別和評估
        2. 市場分析和投資建議
        3. 收藏管理建議
        4. 卡牌真偽鑑定
        5. 價格趨勢分析

        請用友好、專業的語調回答用戶問題，使用繁體中文。
        ${context ? `\n\n當前上下文: ${context}` : ''}
      `,
    };

    const messages: ChatMessage[] = [
      systemMessage,
      ...conversationHistory,
      {
        role: 'user',
        content: userMessage,
      },
    ];

    try {
      const _response = await this.chatCompletion(messages, {
        maxTokens: 500,
        temperature: 0.7,
      });

      return (
        response.choices[0]?.message?.content || '抱歉，我無法理解您的問題。'
      );
    } catch (error) {
      logger.error('AI 聊天失敗:', { error, userMessage });
      throw error;
    }
  }

  /**
   * 發送 HTTP 請求到 OpenAI API
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: unknown
  ): Promise<any> {
    const _url = `${this.config.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if (body && method === 'POST') {
      requestOptions.body = JSON.stringify(body);
    }

    try {
      const _response = await fetch(url, requestOptions);

      if (!response.ok) {
        const _errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API 錯誤 ${response.status}: ${errorData.error?.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('OpenAI API 請求失敗');
    }
  }

  /**
   * 獲取可用模型列表
   */
  async getAvailableModels(): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const _response = await this.makeRequest('/models', 'GET');
      return response.data.map((model: unknown) => model.id);
    } catch (error) {
      logger.error('獲取 OpenAI 模型列表失敗:', { error });
      return [];
    }
  }

  /**
   * 檢查服務狀態
   */
  async getServiceStatus(): Promise<{
    isAvailable: boolean;
    model: string;
    lastChecked: Date;
  }> {
    try {
      await this.testConnection();
      return {
        isAvailable: true,
        model: this.config.model,
        lastChecked: new Date(),
      };
    } catch (error) {
      return {
        isAvailable: false,
        model: this.config.model,
        lastChecked: new Date(),
      };
    }
  }
}

// 導出單例實例
export const _openaiService = OpenAIService.getInstance();

// 導出類型
export type { ChatCompletionResponse, ChatMessage, EmbeddingResponse };
