import { serviceConfig } from '../../../core/config/services';
import { errorHandler } from '../../../core/utils/errorHandler';
import { logger } from '../../../core/utils/logger';

/**
 * Gemini 服務配置接口
 */
interface GeminiConfig {
  apiKey: string;
  model: string;
  baseURL: string;
}

/**
 * Gemini 內容部分接口
 */
interface ContentPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

/**
 * Gemini 內容接口
 */
interface Content {
  role: 'user' | 'model';
  parts: ContentPart[];
}

/**
 * Gemini 生成配置接口
 */
interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

/**
 * Gemini 響應接口
 */
interface GeminiResponse {
  candidates: {
    content: Content;
    finishReason: string;
    index: number;
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  }[];
  promptFeedback?: {
    safetyRatings: {
      category: string;
      probability: string;
    }[];
  };
}

/**
 * Google Gemini 服務類
 * 提供與 Google Gemini API 的集成功能
 */
export class GeminiService {
  private static instance: GeminiService;
  private config: GeminiConfig;
  private isInitialized = false;

  private constructor() {
    this.config = {
      apiKey: '',
      model: 'gemini-pro',
      baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    };
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  /**
   * 初始化 Gemini 服務
   */
  async initialize(): Promise<void> {
    try {
      await serviceConfig.initialize();

      const _apiKey = serviceConfig.get('GOOGLE_GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('Google Gemini API Key 未配置');
      }

      this.config = {
        apiKey,
        model: serviceConfig.get('GOOGLE_GEMINI_MODEL') || 'gemini-pro',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
      };

      // 測試 API 連接
      await this.testConnection();

      this.isInitialized = true;
      logger.info('Gemini 服務初始化成功');
    } catch (error) {
      logger.error('Gemini 服務初始化失敗:', { error });
      throw error;
    }
  }

  /**
   * 測試 API 連接
   */
  private async testConnection(): Promise<void> {
    try {
      const _response = await this.makeRequest('/models', 'GET');
      if (!response.models || !Array.isArray(response.models)) {
        throw new Error('API 響應格式無效');
      }
      logger.info('Gemini API 連接測試成功');
    } catch (error) {
      logger.error('Gemini API 連接測試失敗:', { error });
      throw new Error('無法連接到 Gemini API');
    }
  }

  /**
   * 生成內容
   */
  async generateContent(
    prompt: string,
    config?: GenerationConfig
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const contents: Content[] = [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ];

      const _requestBody = {
        contents,
        generationConfig: {
          temperature: config?.temperature || 0.7,
          topK: config?.topK || 40,
          topP: config?.topP || 0.95,
          maxOutputTokens: config?.maxOutputTokens || 2048,
          stopSequences: config?.stopSequences || [],
        },
      };

      logger.info('發送 Gemini 內容生成請求:', {
        model: this.config.model,
        promptLength: prompt.length,
        config: requestBody.generationConfig,
      });

      const _response = await this.makeRequest(
        `/models/${this.config.model}:generateContent`,
        'POST',
        requestBody
      );

      const _generatedText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!generatedText) {
        throw new Error('Gemini API 未返回有效內容');
      }

      logger.info('Gemini 內容生成成功:', {
        responseLength: generatedText.length,
        finishReason: response.candidates[0].finishReason,
      });

      return generatedText;
    } catch (error) {
      const _appError = errorHandler.handleError(
        error as Error,
        'Gemini內容生成'
      );
      throw appError;
    }
  }

  /**
   * 分析圖片內容
   */
  async analyzeImage(
    imageData: string,
    mimeType: string,
    prompt?: string
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const _defaultPrompt = `
      請詳細分析這張卡牌圖片，提供以下信息：
      1. 卡牌名稱和編號
      2. 卡牌類型和系列
      3. 稀有度等級
      4. 卡牌屬性或顏色
      5. 攻擊力、防禦力等數值
      6. 卡牌技能或效果描述
      7. 卡牌狀況評估（磨損、摺痕等）
      8. 真偽判斷要點
      9. 市場價值估計

      請用繁體中文詳細回答。
    `;

    try {
      const contents: Content[] = [
        {
          role: 'user',
          parts: [
            { text: prompt || defaultPrompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: imageData,
              },
            },
          ],
        },
      ];

      const _requestBody = {
        contents,
        generationConfig: {
          temperature: 0.3,
          topK: 32,
          topP: 0.9,
          maxOutputTokens: 2048,
        },
      };

      logger.info('發送 Gemini 圖片分析請求:', {
        model: 'gemini-pro-vision',
        mimeType,
        dataSize: imageData.length,
      });

      const _response = await this.makeRequest(
        '/models/gemini-pro-vision:generateContent',
        'POST',
        requestBody
      );

      const _analysisResult =
        response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!analysisResult) {
        throw new Error('Gemini API 未返回圖片分析結果');
      }

      logger.info('Gemini 圖片分析成功:', {
        resultLength: analysisResult.length,
      });

      return analysisResult;
    } catch (error) {
      const _appError = errorHandler.handleError(
        error as Error,
        'Gemini圖片分析'
      );
      throw appError;
    }
  }

  /**
   * 多模態對話
   */
  async multiModalChat(
    messages: {
      text?: string;
      imageData?: string;
      mimeType?: string;
    }[],
    systemPrompt?: string
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const contents: Content[] = [];

      // 添加系統提示（如果有）
      if (systemPrompt) {
        contents.push({
          role: 'user',
          parts: [{ text: systemPrompt }],
        });
      }

      // 處理用戶消息
      for (const message of messages) {
        const parts: ContentPart[] = [];

        if (message.text) {
          parts.push({ text: message.text });
        }

        if (message.imageData && message.mimeType) {
          parts.push({
            inline_data: {
              mime_type: message.mimeType,
              data: message.imageData,
            },
          });
        }

        if (parts.length > 0) {
          contents.push({
            role: 'user',
            parts,
          });
        }
      }

      const _requestBody = {
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      };

      logger.info('發送 Gemini 多模態對話請求:', {
        messageCount: messages.length,
        hasImages: messages.some(m => m.imageData),
      });

      const _response = await this.makeRequest(
        `/models/gemini-pro-vision:generateContent`,
        'POST',
        requestBody
      );

      const _reply = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) {
        throw new Error('Gemini API 未返回對話回復');
      }

      return reply;
    } catch (error) {
      const _appError = errorHandler.handleError(
        error as Error,
        'Gemini多模態聊天'
      );
      throw appError;
    }
  }

  /**
   * 卡牌真偽鑑定
   */
  async authenticateCard(
    frontImageData: string,
    backImageData: string,
    cardName: string
  ): Promise<{
    isAuthentic: boolean;
    confidence: number;
    reasons: string[];
    recommendation: string;
  }> {
    const _prompt = `
      請作為專業的卡牌鑑定師，分析以下卡牌的真偽：

      卡牌名稱: ${cardName}

      請仔細檢查卡牌的正面和背面圖片，分析以下要點：
      1. 印刷質量和顏色飽和度
      2. 字體和文字清晰度
      3. 卡牌邊緣和切割質量
      4. 全息效果或特殊工藝
      5. 卡牌厚度和材質
      6. 官方標誌和版權信息
      7. 與已知真品的對比

      請提供：
      - 真偽判斷（真品/仿品/疑似）
      - 信心度（0-100%）
      - 判斷理由（至少3個要點）
      - 建議（是否值得收藏或投資）

      請用繁體中文回答，格式清晰。
    `;

    try {
      const _messages = [
        {
          text: prompt,
          imageData: frontImageData,
          mimeType: 'image/jpeg',
        },
        {
          text: '這是卡牌的背面圖片，請一併分析：',
          imageData: backImageData,
          mimeType: 'image/jpeg',
        },
      ];

      const _result = await this.multiModalChat(messages);

      // 解析結果（這裡可以添加更複雜的解析邏輯）
      const _isAuthentic = result.includes('真品') || result.includes('正品');
      const _confidence = this.extractConfidence(result);
      const _reasons = this.extractReasons(result);
      const _recommendation = this.extractRecommendation(result);

      return {
        isAuthentic,
        confidence,
        reasons,
        recommendation,
      };
    } catch (error) {
      logger.error('卡牌真偽鑑定失敗:', { error, cardName });
      throw error;
    }
  }

  /**
   * 發送 HTTP 請求到 Gemini API
   */
  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: unknown
  ): Promise<any> {
    const _url = `${this.config.baseURL}${endpoint}?key=${this.config.apiKey}`;

    const headers: Record<string, string> = {
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
          `Gemini API 錯誤 ${response.status}: ${errorData.error?.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Gemini API 請求失敗');
    }
  }

  /**
   * 提取信心度
   */
  private extractConfidence(text: string): number {
    const _confidenceMatch = text.match(/(\d+)%/);
    return confidenceMatch ? parseInt(confidenceMatch[1]) : 50;
  }

  /**
   * 提取判斷理由
   */
  private extractReasons(text: string): string[] {
    const _lines = text.split('\n');
    const reasons: string[] = [];

    for (const line of lines) {
      if (
        line.match(/^\d+\./) ||
        line.includes('理由') ||
        line.includes('要點')
      ) {
        reasons.push(line.trim());
      }
    }

    return reasons.length > 0 ? reasons : ['分析結果請參考完整報告'];
  }

  /**
   * 提取建議
   */
  private extractRecommendation(text: string): string {
    const _lines = text.split('\n');

    for (const line of lines) {
      if (line.includes('建議') || line.includes('推薦')) {
        return line.trim();
      }
    }

    return '請參考完整分析報告';
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
      return response.models.map((model: unknown) => model.name.split('/').pop());
    } catch (error) {
      logger.error('獲取 Gemini 模型列表失敗:', { error });
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
export const _geminiService = GeminiService.getInstance();

// 導出類型
export type { Content, ContentPart, GeminiResponse, GenerationConfig };
