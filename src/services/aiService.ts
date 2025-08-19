import { apiService } from './apiService';
import { logger } from '@/utils/logger';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// AI 服務配置
export interface AIConfig {
  provider: 'openai' | 'gemini' | 'huggingface' | 'cohere' | 'replicate' | 'ollama' | 'local';
  apiKey?: string;
  apiUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

// AI 響應接口
export interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// AI 服務類
class AIService {
  private config: AIConfig;
  private fallbackProviders: AIConfig[] = [];
  private currentProviderIndex = 0;

  constructor(config: AIConfig) {
    this.config = config;
    this.setupFallbackProviders();
  }

  // 設置備用 AI 服務提供商
  private setupFallbackProviders(): void {
    this.fallbackProviders = [
      // 主要配置
      this.config,

      // 備用配置 - Hugging Face (免費)
      {
        provider: 'huggingface',
        apiKey: process.env.HUGGING_FACE_API_KEY,
        apiUrl: 'https://api-inference.huggingface.co/models/',
        model: 'microsoft/DialoGPT-medium',
        maxTokens: 1000,
        temperature: 0.7
      },

      // 備用配置 - Cohere (免費額度)
      {
        provider: 'cohere',
        apiKey: process.env.COHERE_API_KEY,
        apiUrl: 'https://api.cohere.ai/v1/generate',
        model: 'command',
        maxTokens: 1000,
        temperature: 0.7
      },

      // 備用配置 - Replicate (免費額度)
      {
        provider: 'replicate',
        apiKey: process.env.REPLICATE_API_KEY,
        apiUrl: 'https://api.replicate.com/v1/predictions',
        model: 'meta/llama-2-70b-chat',
        maxTokens: 1000,
        temperature: 0.7
      },

      // 本地配置 - Ollama (完全免費)
      {
        provider: 'ollama',
        apiUrl: 'http://localhost:11434/api/generate',
        model: 'llama2',
        maxTokens: 1000,
        temperature: 0.7
      }
    ];
  }

  // 智能卡片推薦
  async recommendCards(userId: string, preferences: any): Promise<AIResponse> {
    const prompt = `基於用戶偏好推薦卡片：
用戶ID: ${userId}
偏好: ${JSON.stringify(preferences)}
請推薦5張最適合的卡片，並說明推薦理由。`;

    return this.callAI(prompt, 'card_recommendation');
  }

  // 市場趨勢預測
  async predictMarketTrends(timeframe: string = '7d'): Promise<AIResponse> {
    const prompt = `分析卡片市場趨勢：
時間範圍: ${timeframe}
請分析當前市場趨勢，預測未來價格變化，並提供投資建議。`;

    return this.callAI(prompt, 'market_prediction');
  }

  // 投資組合優化
  async optimizePortfolio(userId: string, portfolio: any): Promise<AIResponse> {
    const prompt = `優化投資組合：
用戶ID: ${userId}
當前投資組合: ${JSON.stringify(portfolio)}
請提供投資組合優化建議，包括買入、賣出和持有建議。`;

    return this.callAI(prompt, 'portfolio_optimization');
  }

  // 智能搜索
  async intelligentSearch(query: string, filters: any = {}): Promise<AIResponse> {
    const prompt = `智能搜索卡片：
搜索查詢: ${query}
過濾條件: ${JSON.stringify(filters)}
請理解用戶意圖，提供相關的卡片搜索結果。`;

    return this.callAI(prompt, 'intelligent_search');
  }

  // 自然語言處理
  async processNaturalLanguage(text: string, task: string): Promise<AIResponse> {
    const prompt = `自然語言處理任務：
文本: ${text}
任務類型: ${task}
請根據任務類型處理文本。`;

    return this.callAI(prompt, 'nlp_processing');
  }

  // 智能通知生成
  async generateSmartNotifications(userId: string, context: any): Promise<AIResponse> {
    const prompt = `生成智能通知：
用戶ID: ${userId}
上下文: ${JSON.stringify(context)}
請生成個性化的智能通知內容。`;

    return this.callAI(prompt, 'notification_generation');
  }

  // 聊天機器人
  async chatBot(message: string, userId: string, context: any = {}): Promise<AIResponse> {
    const prompt = `聊天機器人對話：
用戶消息: ${message}
用戶ID: ${userId}
對話上下文: ${JSON.stringify(context)}
請提供友好、有用的回應。`;

    return this.callAI(prompt, 'chatbot');
  }

  // 核心 AI 調用方法
  private async callAI(prompt: string, taskType: string): Promise<AIResponse> {
    const maxRetries = this.fallbackProviders.length;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const provider = this.fallbackProviders[attempt];

      try {
        logger.info(`嘗試使用 AI 提供商: ${provider.provider}`, { taskType, attempt });

        const response = await this.callProvider(provider, prompt, taskType);

        if (response.success) {
          logger.info('AI 調用成功', { provider: provider.provider, taskType });
          return response;
        }
      } catch (error) {
        logger.warn(`AI 提供商 ${provider.provider} 調用失敗`, { error, taskType, attempt });

        // 如果是最後一次嘗試，記錄錯誤
        if (attempt === maxRetries - 1) {
          logger.error('所有 AI 提供商都失敗了', { error, taskType });
          throw new Error('AI 服務暫時不可用，請稍後再試');
        }
      }
    }

    throw new Error('所有 AI 服務都不可用');
  }

  // 調用具體的 AI 提供商
  private async callProvider(provider: AIConfig, prompt: string, taskType: string): Promise<AIResponse> {
    switch (provider.provider) {
      case 'openai':
        return this.callOpenAI(provider, prompt, taskType);
      case 'gemini':
        return this.callGemini(provider, prompt, taskType);
      case 'huggingface':
        return this.callHuggingFace(provider, prompt, taskType);
      case 'cohere':
        return this.callCohere(provider, prompt, taskType);
      case 'replicate':
        return this.callReplicate(provider, prompt, taskType);
      case 'ollama':
        return this.callOllama(provider, prompt, taskType);
      default:
        throw new Error(`不支援的 AI 提供商: ${provider.provider}`);
    }
  }

  // OpenAI 調用
  private async callOpenAI(provider: AIConfig, prompt: string, taskType: string): Promise<AIResponse> {
    if (!provider.apiKey) {
      throw new Error('OpenAI API 密鑰未配置');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: provider.maxTokens || 1000,
        temperature: provider.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 錯誤: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.choices[0].message.content,
      provider: 'openai',
      model: provider.model || 'gpt-3.5-turbo',
      usage: data.usage
    };
  }

  // Gemini 調用
  private async callGemini(provider: AIConfig, prompt: string, taskType: string): Promise<AIResponse> {
    if (!provider.apiKey) {
      throw new Error('Gemini API 密鑰未配置');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${provider.model || 'gemini-pro'}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: provider.maxTokens || 1000,
          temperature: provider.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API 錯誤: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.candidates[0].content.parts[0].text,
      provider: 'gemini',
      model: provider.model || 'gemini-pro'
    };
  }

  // Hugging Face 調用 (免費)
  private async callHuggingFace(provider: AIConfig, prompt: string, taskType: string): Promise<AIResponse> {
    const apiUrl = `${provider.apiUrl}${provider.model || 'microsoft/DialoGPT-medium'}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': provider.apiKey ? `Bearer ${provider.apiKey}` : '',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: provider.maxTokens || 1000,
          temperature: provider.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API 錯誤: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: Array.isArray(data) ? data[0].generated_text : data.generated_text,
      provider: 'huggingface',
      model: provider.model || 'microsoft/DialoGPT-medium'
    };
  }

  // Cohere 調用 (免費額度)
  private async callCohere(provider: AIConfig, prompt: string, taskType: string): Promise<AIResponse> {
    if (!provider.apiKey) {
      throw new Error('Cohere API 密鑰未配置');
    }

    const response = await fetch(provider.apiUrl || 'https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model || 'command',
        prompt,
        max_tokens: provider.maxTokens || 1000,
        temperature: provider.temperature || 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Cohere API 錯誤: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.generations[0].text,
      provider: 'cohere',
      model: provider.model || 'command'
    };
  }

  // Replicate 調用 (免費額度)
  private async callReplicate(provider: AIConfig, prompt: string, taskType: string): Promise<AIResponse> {
    if (!provider.apiKey) {
      throw new Error('Replicate API 密鑰未配置');
    }

    const response = await fetch(provider.apiUrl || 'https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: provider.model || 'meta/llama-2-70b-chat',
        input: {
          prompt,
          max_tokens: provider.maxTokens || 1000,
          temperature: provider.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Replicate API 錯誤: ${response.status}`);
    }

    const data = await response.json();

    // Replicate 是異步的，需要輪詢結果
    const result = await this.pollReplicateResult(data.id, provider.apiKey);

    return {
      success: true,
      data: result,
      provider: 'replicate',
      model: provider.model || 'meta/llama-2-70b-chat'
    };
  }

  // 輪詢 Replicate 結果
  private async pollReplicateResult(predictionId: string, apiKey: string): Promise<string> {
    const maxAttempts = 30;
    const delay = 2000; // 2秒

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, delay));

      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Replicate 輪詢錯誤: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'succeeded') {
        return data.output.join('');
      } else if (data.status === 'failed') {
        throw new Error('Replicate 預測失敗');
      }
    }

    throw new Error('Replicate 預測超時');
  }

  // Ollama 調用 (本地，完全免費)
  private async callOllama(provider: AIConfig, prompt: string, taskType: string): Promise<AIResponse> {
    const response = await fetch(provider.apiUrl || 'http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model || 'llama2',
        prompt,
        stream: false,
        options: {
          num_predict: provider.maxTokens || 1000,
          temperature: provider.temperature || 0.7
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API 錯誤: ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.response,
      provider: 'ollama',
      model: provider.model || 'llama2'
    };
  }

  // 獲取 AI 指標
  async getMetrics(): Promise<any> {
    try {
      const response = await apiService.get('/ai/metrics');
      return response.data;
    } catch (error) {
      logger.error('獲取 AI 指標失敗:', error);
      throw new Error('獲取 AI 指標失敗');
    }
  }

  // 健康檢查
  async healthCheck(): Promise<any> {
    try {
      const response = await apiService.get('/ai/health');
      return response.data;
    } catch (error) {
      logger.error('AI 健康檢查失敗:', error);
      throw new Error('AI 健康檢查失敗');
    }
  }

  // 更新配置
  async updateConfig(config: Partial<AIConfig>): Promise<any> {
    try {
      const response = await apiService.put('/ai/config', config);
      return response.data;
    } catch (error) {
      logger.error('更新 AI 配置失敗:', error);
      throw new Error('更新 AI 配置失敗');
    }
  }

  // 獲取配置
  async getConfig(): Promise<AIConfig> {
    try {
      const response = await apiService.get('/ai/config');
      return response.data;
    } catch (error) {
      logger.error('獲取 AI 配置失敗:', error);
      throw new Error('獲取 AI 配置失敗');
    }
  }

  // 批量操作
  async batchOperations(operations: any[]): Promise<any> {
    try {
      const response = await apiService.post('/ai/batch', { operations });
      return response.data;
    } catch (error) {
      logger.error('AI 批量操作失敗:', error);
      throw new Error('AI 批量操作失敗');
    }
  }

  // 獲取模型列表
  async getModels(): Promise<any> {
    try {
      const response = await apiService.get('/ai/models');
      return response.data;
    } catch (error) {
      logger.error('獲取 AI 模型列表失敗:', error);
      throw new Error('獲取 AI 模型列表失敗');
    }
  }

  // 獲取功能列表
  async getFeatures(): Promise<any> {
    try {
      const response = await apiService.get('/ai/features');
      return response.data;
    } catch (error) {
      logger.error('獲取 AI 功能列表失敗:', error);
      throw new Error('獲取 AI 功能列表失敗');
    }
  }

  // 生成智能建議
  async generateSuggestions(lastMessage: string, context: any = {}): Promise<{ suggestions: string[] }> {
    try {
      const prompt = `基於用戶的最後一條消息："${lastMessage}"，請生成3-5個相關的建議問題。這些問題應該與卡片投資、分析、市場趨勢等相關。請返回JSON格式的建議數組。`;

      const response = await this.callAI(prompt, 'suggestion_generation');
      
      // 嘗試解析AI回應中的JSON
      let suggestions: string[] = [];
      try {
        const jsonMatch = response.data.match(/\[.*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        logger.warn('解析AI建議失敗，使用默認建議:', parseError);
      }

      // 如果解析失敗，使用默認建議
      if (!suggestions || suggestions.length === 0) {
        suggestions = [
          '分析這張卡片的投資價值',
          '這張卡片的市場價格如何',
          '給我一些投資建議',
          '最近的市場趨勢怎麼樣',
          '這張卡片值得投資嗎'
        ];
      }

      return { suggestions };
    } catch (error) {
      logger.error('生成建議失敗:', error);
      // 返回默認建議
      return {
        suggestions: [
          '分析這張卡片的投資價值',
          '這張卡片的市場價格如何',
          '給我一些投資建議',
          '最近的市場趨勢怎麼樣',
          '這張卡片值得投資嗎'
        ]
      };
    }
  }

  // 情感分析
  async analyzeEmotion(text: string): Promise<{ emotion: string; confidence: number }> {
    try {
      const prompt = `分析以下文本的情感傾向，返回JSON格式：{"emotion": "情感類型", "confidence": 0.0-1.0}。文本："${text}"`;

      const response = await this.callAI(prompt, 'emotion_analysis');
      
      try {
        const jsonMatch = response.data.match(/\{.*\}/);
        if (jsonMatch) {
          const result = JSON.parse(jsonMatch[0]);
          return {
            emotion: result.emotion || 'neutral',
            confidence: result.confidence || 0.5
          };
        }
      } catch (parseError) {
        logger.warn('解析情感分析結果失敗:', parseError);
      }

      return { emotion: 'neutral', confidence: 0.5 };
    } catch (error) {
      logger.error('情感分析失敗:', error);
      return { emotion: 'neutral', confidence: 0.5 };
    }
  }

  // 翻譯文本
  async translateText(text: string, targetLanguage: string): Promise<string> {
    try {
      const prompt = `將以下文本翻譯成${targetLanguage}：${text}`;
      const response = await this.callAI(prompt, 'translation');
      return response.data;
    } catch (error) {
      logger.error('翻譯失敗:', error);
      return text; // 返回原文
    }
  }

  // 圖片分析
  async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
    try {
      const response = await apiService.post('/ai/analyze-image', {
        image: imageBase64,
        prompt: prompt
      });
      return response.data.analysis;
    } catch (error) {
      logger.error('圖片分析失敗:', error);
      throw new Error('圖片分析失敗');
    }
  }
}

// 創建 AI 服務實例
const aiConfig: AIConfig = {
  provider: 'huggingface', // 默認使用 Hugging Face (免費)
  apiKey: process.env.HUGGING_FACE_API_KEY,
  apiUrl: 'https://api-inference.huggingface.co/models/',
  model: 'microsoft/DialoGPT-medium',
  maxTokens: 1000,
  temperature: 0.7
};

export const aiService = new AIService(aiConfig);

