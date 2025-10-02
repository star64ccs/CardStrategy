const axios = require('axios');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

class LocalAIService {
  constructor() {
    this.providers = {
      ollama: {
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        models: ['llama2', 'mistral', 'codellama', 'llama2-uncensored'],
        isAvailable: false,
      },
      huggingface: {
        baseUrl: 'https://api-inference.huggingface.co',
        apiKey: process.env.HUGGING_FACE_API_KEY || '',
        models: [
          'microsoft/DialoGPT-medium',
          'gpt2',
          'distilgpt2',
          'EleutherAI/gpt-neo-125M',
        ],
        isAvailable: false,
      },
      openaiCompatible: {
        baseUrl: process.env.OPENAI_COMPATIBLE_URL || 'http://localhost:8080',
        models: ['llama2', 'mistral'],
        isAvailable: false,
      },
    };

    this.initializeProviders();
  }

  async initializeProviders() {
    // 檢查Ollama可用性
    try {
// eslint-disable-next-line no-unused-vars
      const response = await axios.get(
        `${this.providers.ollama.baseUrl}/api/tags`,
        {
          timeout: 5000,
        }
      );
      this.providers.ollama.isAvailable = true;
      logger.info('Ollama服務可用');
    } catch (error) {
      logger.warn('Ollama服務不可用:', error.message);
    }

    // 檢查Hugging Face可用性
    if (this.providers.huggingface.apiKey) {
      this.providers.huggingface.isAvailable = true;
      logger.info('Hugging Face服務可用');
    }

    // 檢查OpenAI兼容服務可用性
    try {
// eslint-disable-next-line no-unused-vars
      const response = await axios.get(
        `${this.providers.openaiCompatible.baseUrl}/v1/models`,
        {
          timeout: 5000,
        }
      );
      this.providers.openaiCompatible.isAvailable = true;
      logger.info('OpenAI兼容服務可用');
    } catch (error) {
      logger.warn('OpenAI兼容服務不可用:', error.message);
    }
  }

  // 獲取可用的AI提供商
  getAvailableProviders() {
    return Object.entries(this.providers)
      .filter(([name, provider]) => provider.isAvailable)
      .map(([name, provider]) => ({ name, ...provider }));
  }

  // 智能選擇最佳提供商
  selectBestProvider(taskType = 'general') {
    const available = this.getAvailableProviders();

    if (available.length === 0) {
      throw new Error('沒有可用的AI服務');
    }

    // 根據任務類型選擇最佳提供商
    switch (taskType) {
      case 'image_recognition':
        return available.find((p) => p.name === 'huggingface') || available[0];
      case 'text_generation':
        return available.find((p) => p.name === 'ollama') || available[0];
      case 'analysis':
        return (
          available.find((p) => p.name === 'openaiCompatible') || available[0]
        );
      default:
        return available[0];
    }
  }

  // 使用Ollama進行文本生成
  async generateWithOllama(prompt, model = 'llama2', options = {}) {
    try {
// eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        `${this.providers.ollama.baseUrl}/api/generate`,
        {
          model,
          prompt,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
            max_tokens: options.maxTokens || 1000,
            ...options,
          },
        }
      );

      return {
        success: true,
        data: response.data.response,
        model,
        provider: 'ollama',
        usage: {
          prompt_tokens: prompt.length,
          completion_tokens: response.data.response.length,
          total_tokens: prompt.length + response.data.response.length,
        },
      };
    } catch (error) {
      logger.error('Ollama生成錯誤:', error);
      throw new Error(`Ollama生成失敗: ${error.message}`);
    }
  }

  // 使用Hugging Face進行文本生成
  async generateWithHuggingFace(
    prompt,
    model = 'microsoft/DialoGPT-medium',
    options = {}
  ) {
    try {
// eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        `${this.providers.huggingface.baseUrl}/models/${model}`,
        {
          inputs: prompt,
          parameters: {
            max_length: options.maxTokens || 100,
            temperature: options.temperature || 0.7,
            do_sample: true,
            ...options,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.providers.huggingface.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data[0]?.generated_text || response.data[0]?.text || '',
        model,
        provider: 'huggingface',
        usage: {
          prompt_tokens: prompt.length,
          completion_tokens: response.data[0]?.generated_text?.length || 0,
        },
      };
    } catch (error) {
      logger.error('Hugging Face生成錯誤:', error);
      throw new Error(`Hugging Face生成失敗: ${error.message}`);
    }
  }

  // 使用OpenAI兼容服務
  async generateWithOpenAICompatible(prompt, model = 'llama2', options = {}) {
    try {
// eslint-disable-next-line no-unused-vars
      const response = await axios.post(
        `${this.providers.openaiCompatible.baseUrl}/v1/chat/completions`,
        {
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || 1000,
          temperature: options.temperature || 0.7,
          ...options,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return {
        success: true,
        data: response.data.choices[0]?.message?.content || '',
        model,
        provider: 'openaiCompatible',
        usage: response.data.usage,
      };
    } catch (error) {
      logger.error('OpenAI兼容服務錯誤:', error);
      throw new Error(`OpenAI兼容服務失敗: ${error.message}`);
    }
  }

  // 通用AI生成接口
  async generateText(prompt, taskType = 'general', options = {}) {
    const provider = this.selectBestProvider(taskType);

    try {
      switch (provider.name) {
        case 'ollama':
          return await this.generateWithOllama(
            prompt,
            provider.models[0],
            options
          );
        case 'huggingface':
          return await this.generateWithHuggingFace(
            prompt,
            provider.models[0],
            options
          );
        case 'openaiCompatible':
          return await this.generateWithOpenAICompatible(
            prompt,
            provider.models[0],
            options
          );
        default:
          throw new Error(`不支持的提供商: ${provider.name}`);
      }
    } catch (error) {
      // 如果首選提供商失敗，嘗試其他提供商
      const available = this.getAvailableProviders().filter(
        (p) => p.name !== provider.name
      );

      for (const altProvider of available) {
        try {
          switch (altProvider.name) {
            case 'ollama':
              return await this.generateWithOllama(
                prompt,
                altProvider.models[0],
                options
              );
            case 'huggingface':
              return await this.generateWithHuggingFace(
                prompt,
                altProvider.models[0],
                options
              );
            case 'openaiCompatible':
              return await this.generateWithOpenAICompatible(
                prompt,
                altProvider.models[0],
                options
              );
          }
        } catch (altError) {
          logger.warn(`${altProvider.name}備用服務也失敗:`, altError.message);
          continue;
        }
      }

      throw new Error('所有AI服務都不可用');
    }
  }

  // 卡片分析
  async analyzeCard(cardData, analysisType = 'investment') {
    const prompt = this.buildCardAnalysisPrompt(cardData, analysisType);

    return await this.generateText(prompt, 'analysis', {
      temperature: 0.3,
      maxTokens: 500,
    });
  }

  // 價格預測
  async predictPrice(cardData, timeframe = '1m') {
    const prompt = this.buildPricePredictionPrompt(cardData, timeframe);

    return await this.generateText(prompt, 'prediction', {
      temperature: 0.2,
      maxTokens: 300,
    });
  }

  // 市場分析
  async analyzeMarket(marketData) {
    const prompt = this.buildMarketAnalysisPrompt(marketData);

    return await this.generateText(prompt, 'analysis', {
      temperature: 0.4,
      maxTokens: 600,
    });
  }

  // 構建卡片分析提示
  buildCardAnalysisPrompt(cardData, analysisType) {
    const basePrompt = `請分析以下卡片信息：

卡片名稱: ${cardData.name || '未知'}
稀有度: ${cardData.rarity || '未知'}
類型: ${cardData.type || '未知'}
當前價格: ${cardData.currentPrice || '未知'}
發行年份: ${cardData.releaseYear || '未知'}

請根據${analysisType}的角度進行分析，包括：
1. 投資價值評估
2. 風險分析
3. 市場趨勢
4. 建議操作

請用中文回答，格式要清晰。`;

    return basePrompt;
  }

  // 構建價格預測提示
  buildPricePredictionPrompt(cardData, timeframe) {
    return `基於以下卡片信息預測${timeframe}後的價格：

卡片: ${cardData.name}
當前價格: ${cardData.currentPrice}
歷史價格: ${JSON.stringify(cardData.priceHistory || [])}
市場趨勢: ${cardData.marketTrend || '未知'}

請預測${timeframe}後的價格範圍和置信度，並說明預測依據。`;
  }

  // 構建市場分析提示
  buildMarketAnalysisPrompt(marketData) {
    return `請分析當前卡片市場狀況：

市場數據: ${JSON.stringify(marketData)}
熱門卡片: ${marketData.topCards || []}
市場趨勢: ${marketData.trends || []}

請提供：
1. 整體市場評估
2. 投資機會分析
3. 風險提醒
4. 建議策略`;
  }

  // 健康檢查
  async healthCheck() {
// eslint-disable-next-line no-unused-vars
    const status = {
      ollama: this.providers.ollama.isAvailable,
      huggingface: this.providers.huggingface.isAvailable,
      openaiCompatible: this.providers.openaiCompatible.isAvailable,
      availableProviders: this.getAvailableProviders().length,
    };

    return {
      success: status.availableProviders > 0,
      status,
      message:
        status.availableProviders > 0
          ? `有 ${status.availableProviders} 個AI服務可用`
          : '沒有可用的AI服務',
    };
  }
}

module.exports = new LocalAIService();
