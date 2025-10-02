import { serviceManager } from '../../core/config/serviceManager';
import type { AIAnalysis, AnalysisType } from '../../core/types';
import { logger } from '../../core/utils/logger';

import { cohereService } from './ai/cohereService';
import { geminiService } from './ai/geminiService';
import { openaiService } from './ai/openaiService';
import { replicateService } from './ai/replicateService';

/**
 * AI AnalysisOptionsInterface
 */
interface AnalysisOptions {
  provider?: 'openai' | 'gemini' | 'cohere' | 'auto';
  includeMarketAnalysis?: boolean;
  includeAuthenticity?: boolean;
  includeCondition?: boolean;
  language?: 'zh-TW' | 'en-US';
}

/**
 * 卡牌Analysis結果Interface
 */
interface CardAnalysisResult extends AIAnalysis {
  provider: string;
  confidence: number;
  processingTime: number;
}

/**
 * 統一 AI Service
 * 整合Multiple AI 提供商，提供統一的 AI 功能Interface
 */
export class AIService {
  private static instance: AIService;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Initialize AI Service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // 確保ServiceManage器已Initialize
      if (!serviceManager.isInitialized()) {
        await serviceManager.initializeAll();
      }

      this.isInitialized = true;
      logger.info('AI ServiceInitializeSuccess');
    } catch (error) {
      logger.error('AI ServiceInitializeFailed:', { error });
      throw error;
    }
  }

  /**
   * Analysis卡牌Graph片
   */
  async analyzeCardImage(
    imageUrl: string,
    options: AnalysisOptions = {}
  ): Promise<CardAnalysisResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const _startTime = Date.now();
    const _provider = await this.selectProvider(options.provider);

    try {
      logger.info('開始 AI 卡牌圖片分析:', { provider, imageUrl });

      let analysisResult: string;

      if (
        provider === 'gemini' &&
        serviceManager.isServiceAvailable('gemini')
      ) {
        // 使用 Gemini 進RowGraph片Analysis
        const _imageData = await this.fetchImageAsBase64(imageUrl);
        analysisResult = await geminiService.analyzeImage(
          imageData,
          'image/jpeg',
          this.buildAnalysisPrompt(options)
        );
      } else if (
        provider === 'openai' &&
        serviceManager.isServiceAvailable('openai')
      ) {
        // 使用 OpenAI 進RowGraph片Analysis
        analysisResult = await openaiService.analyzeCardImage(
          imageUrl,
          this.buildAnalysisPrompt(options)
        );
      } else if (
        provider === 'cohere' &&
        serviceManager.isServiceAvailable('cohere')
      ) {
        // 使用 Cohere 進Row文本Analysis（需要先將Graph片Convert為文本Description）
        const _imageDescription = await this.getImageDescription(imageUrl);
        const _response = await cohereService.generateText(
          `${this.buildAnalysisPrompt(options)}\n\n圖片描述: ${imageDescription}`,
          500,
          0.7
        );
        analysisResult =
          response.success && response.data ? response.data : '分析Failed';
      } else if (provider === 'replicate' && replicateService.isAvailable()) {
        // 使用 Replicate 進RowGraph片Analysis
        const _response = await replicateService.createPrediction({
          version:
            'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
          input: {
            prompt: this.buildAnalysisPrompt(options),
            image: imageUrl,
          },
        });

        if (response.success && response.data) {
          // Await預測Complete
          const _finalResult = await replicateService.waitForPrediction(
            response.data.id
          );
          if (finalResult.success && finalResult.data) {
            analysisResult = `Replicate 分析結果: ${JSON.stringify(finalResult.data.output)}`;
          } else {
            analysisResult = 'Replicate 分析Failed';
          }
        } else {
          analysisResult = 'Replicate 分析Failed';
        }
      } else {
        throw new Error('沒有可用的 AI Service提供商');
      }

      const _processingTime = Date.now() - startTime;

      // ParseAnalysis結果
      const _parsedResult = this.parseAnalysisResult(analysisResult);

      const result: CardAnalysisResult = {
        ...parsedResult,
        provider,
        confidence: this.calculateConfidence(analysisResult),
        processingTime,
      };

      logger.info('AI 卡牌圖片分析完成:', {
        provider,
        processingTime,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      logger.error('AI 卡牌圖片分析Failed:', { error, provider, imageUrl });
      throw error;
    }
  }

  /**
   * 生成投資建議
   */
  async generateInvestmentAdvice(
    cardData: {
      name: string;
      rarity: string;
      condition: string;
      currentPrice: number;
      historicalPrices: number[];
    },
    options: AnalysisOptions = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const _provider = await this.selectProvider(options.provider);

    try {
      logger.info('開始生成投資建議:', { provider, cardName: cardData.name });

      if (
        provider === 'openai' &&
        serviceManager.isServiceAvailable('openai')
      ) {
        return await openaiService.generateInvestmentAdvice(cardData);
      } else if (
        provider === 'gemini' &&
        serviceManager.isServiceAvailable('gemini')
      ) {
        const _prompt = this.buildInvestmentPrompt(cardData);
        return await geminiService.generateContent(prompt);
      } else if (
        provider === 'cohere' &&
        serviceManager.isServiceAvailable('cohere')
      ) {
        const _prompt = this.buildInvestmentPrompt(cardData);
        const _response = await cohereService.generateText(prompt, 300, 0.7);
        return response.success && response.data
          ? response.data
          : '無法生成投資建議';
      } else if (provider === 'replicate' && replicateService.isAvailable()) {
        const _prompt = this.buildInvestmentPrompt(cardData);
        const _response = await replicateService.createPrediction({
          version:
            'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
          input: {
            prompt,
          },
        });

        if (response.success && response.data) {
          const _finalResult = await replicateService.waitForPrediction(
            response.data.id
          );
          if (finalResult.success && finalResult.data) {
            return finalResult.data.output || '無法生成投資建議';
          }
        }
        return '無法生成投資建議';
      } else {
        throw new Error('沒有可用的 AI Service提供商');
      }
    } catch (error) {
      logger.error('生成投資建議Failed:', {
        error,
        provider,
        cardName: cardData.name,
      });
      throw error;
    }
  }

  /**
   * AI 聊天對話
   */
  async chat(
    message: string,
    conversationHistory: { role: string; content: string }[] = [],
    context?: string,
    options: AnalysisOptions = {}
  ): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const _provider = await this.selectProvider(options.provider);

    try {
      logger.info('開始 AI 聊天對話:', {
        provider,
        messageLength: message.length,
      });

      if (
        provider === 'openai' &&
        serviceManager.isServiceAvailable('openai')
      ) {
        return await openaiService.chat(
          message,
          conversationHistory as {
            role: 'system' | 'user' | 'assistant';
            content: string;
          }[],
          context
        );
      } else if (
        provider === 'gemini' &&
        serviceManager.isServiceAvailable('gemini')
      ) {
        const _prompt = this.buildChatPrompt(
          message,
          conversationHistory,
          context
        );
        return await geminiService.generateContent(prompt);
      } else if (
        provider === 'cohere' &&
        serviceManager.isServiceAvailable('cohere')
      ) {
        const _prompt = this.buildChatPrompt(
          message,
          conversationHistory,
          context
        );
        const _response = await cohereService.generateText(prompt, 200, 0.7);
        return response.success && response.data
          ? response.data
          : '無法生成回應';
      } else if (provider === 'replicate' && replicateService.isAvailable()) {
        const _prompt = this.buildChatPrompt(
          message,
          conversationHistory,
          context
        );
        const _response = await replicateService.createPrediction({
          version:
            'meta/llama-2-70b-chat:02e509c789964a7ea8736978a43525956ef40397be9033abf9fd2badfe68c9e3',
          input: {
            prompt,
          },
        });

        if (response.success && response.data) {
          const _finalResult = await replicateService.waitForPrediction(
            response.data.id
          );
          if (finalResult.success && finalResult.data) {
            return finalResult.data.output || '無法生成回應';
          }
        }
        return '無法生成回應';
      } else {
        throw new Error('沒有可用的 AI Service提供商');
      }
    } catch (error) {
      logger.error('AI 聊天對話Failed:', { error, provider });
      throw error;
    }
  }

  /**
   * 卡牌True偽鑑定
   */
  async authenticateCard(
    frontImageUrl: string,
    backImageUrl: string,
    cardName: string,
    options: AnalysisOptions = {}
  ): Promise<{
    isAuthentic: boolean;
    confidence: number;
    reasons: string[];
    recommendation: string;
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      logger.info('開始卡牌真偽鑑定:', { cardName });

      // 優先使用 Gemini 進RowGraph片Analysis
      if (serviceManager.isServiceAvailable('gemini')) {
        const _frontImageData = await this.fetchImageAsBase64(frontImageUrl);
        const _backImageData = await this.fetchImageAsBase64(backImageUrl);

        return await geminiService.authenticateCard(
          frontImageData,
          backImageData,
          cardName
        );
      } else {
        throw new Error('卡牌真偽鑑定需要 Gemini Service支持');
      }
    } catch (error) {
      logger.error('卡牌真偽鑑定Failed:', { error, cardName });
      throw error;
    }
  }

  /**
   * Select AI 提供商
   */
  private async selectProvider(
    preferredProvider?: string
  ): Promise<'openai' | 'gemini' | 'cohere' | 'replicate'> {
    if (
      preferredProvider === 'openai' &&
      serviceManager.isServiceAvailable('openai')
    ) {
      return 'openai';
    }

    if (
      preferredProvider === 'gemini' &&
      serviceManager.isServiceAvailable('gemini')
    ) {
      return 'gemini';
    }

    if (
      preferredProvider === 'cohere' &&
      serviceManager.isServiceAvailable('cohere')
    ) {
      return 'cohere';
    }

    if (preferredProvider === 'replicate' && replicateService.isAvailable()) {
      return 'replicate';
    }

    // AutoSelect可用的提供商
    if (serviceManager.isServiceAvailable('gemini')) {
      return 'gemini';
    }

    if (serviceManager.isServiceAvailable('openai')) {
      return 'openai';
    }

    if (serviceManager.isServiceAvailable('cohere')) {
      return 'cohere';
    }

    if (replicateService.isAvailable()) {
      return 'replicate';
    }

    throw new Error('沒有可用的 AI Service提供商');
  }

  /**
   * BuildAnalysis提示詞
   */
  private buildAnalysisPrompt(options: AnalysisOptions): string {
    const _language = options.language || 'zh-TW';
    const sections: string[] = [];

    sections.push('請分析這張卡牌圖片，提供以下信息：');
    sections.push('1. 卡牌名稱和編號');
    sections.push('2. 卡牌類型和系列');
    sections.push('3. 稀有度等級');
    sections.push('4. 卡牌屬性或顏色');
    sections.push('5. 攻擊力、防禦力等數值');
    sections.push('6. 卡牌技能或效果描述');

    if (options.includeCondition) {
      sections.push('7. 卡牌狀況評估（磨損、摺痕等）');
    }

    if (options.includeAuthenticity) {
      sections.push('8. 真偽判斷要點');
    }

    if (options.includeMarketAnalysis) {
      sections.push('9. 市場價值估計');
      sections.push('10. 投資潛力分析');
    }

    sections.push(
      `\n請用${language === 'zh-TW' ? '繁體中文' : '英文'}詳細回答。`
    );

    return sections.join('\n');
  }

  /**
   * Build投資建議提示詞
   */
  private buildInvestmentPrompt(cardData: {
    name: string;
    rarity: string;
    condition: string;
    currentPrice: number;
    historicalPrices: number[];
  }): string {
    return `
      請為以下卡牌提供專業的投資建議：
      
      卡牌名稱: ${cardData.name}
      稀有度: ${cardData.rarity}
      狀況: ${cardData.condition}
      當前價格: $${cardData.currentPrice}
      歷史價格: ${cardData.historicalPrices.join(', ')}
      
      請分析：
      1. 投資潛力評估（1-10分）
      2. 風險分析（高/中/低風險）
      3. 建議持有期間
      4. 預期收益率
      5. 市場趨勢分析
      6. 具體投資建議
      
      請用繁體中文回答，提供具體且實用的投資建議。
    `;
  }

  /**
   * Build聊天提示詞
   */
  private buildChatPrompt(
    message: string,
    conversationHistory: { role: string; content: string }[],
    context?: string
  ): string {
    let prompt = `
      你是 CardStrategy 應用的專業 AI 助手，專門幫助用戶進行卡牌收藏和投資。
      你的專長包括：
      1. 卡牌識別和評估
      2. 市場分析和投資建議
      3. 收藏管理建議
      4. 卡牌真偽鑑定
      5. 價格趨勢分析
      
      請用友好、專業的語調回答用戶問題，使用繁體中文。
    `;

    if (context) {
      prompt += `\n\n當前上下文: ${context}`;
    }

    if (conversationHistory.length > 0) {
      prompt += '\n\n對話歷史:';
      conversationHistory.forEach((msg, index) => {
        prompt += `\n${msg.role}: ${msg.content}`;
      });
    }

    prompt += `\n\n用戶問題: ${message}`;

    return prompt;
  }

  /**
   * ParseAnalysis結果
   */
  private parseAnalysisResult(analysisText: string): AIAnalysis {
    // 這裡可以實現更複雜的Parse邏輯
    // 目前Return基本結構
    return {
      id: `analysis_${Date.now()}`,
      cardId: 'unknown',
      analysisType: 'card_recognition' as AnalysisType,
      confidence: this.calculateConfidence(analysisText),
      results: [analysisText],
      recommendations: [],
      metadata: {
        modelVersion: 'v1.0',
        processingTime: 0,
        imageQuality: 100,
        analysisDate: new Date(),
      },
      processingTime: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * 計算信心度
   */
  private calculateConfidence(analysisText: string): number {
    // 基於Analysis文本的長度和OffKey詞來估算信心度
    let confidence = 0.5; // 基礎信心度

    // 文本長度因子
    if (analysisText.length > 500) confidence += 0.2;
    if (analysisText.length > 1000) confidence += 0.1;

    // OffKey詞因子
    const _keywords = ['卡牌', '稀有', '價格', '狀況', '投資', '市場'];
    const _keywordCount = keywords.filter(keyword =>
      analysisText.includes(keyword)
    ).length;

    confidence += (keywordCount / keywords.length) * 0.3;

    return Math.min(confidence, 1.0);
  }

  /**
   * GetGraph片的 Base64 Data
   */
  private async fetchImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const _response = await fetch(imageUrl);
      const _blob = await response.blob();

      return new Promise((resolve, reject) => {
        const _reader = new FileReader();
        reader.onload = () => {
          const _base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      logger.error('Get圖片 Base64 數據Failed:', { error, imageUrl });
      throw new Error('無法獲取圖片數據');
    }
  }

  /**
   * GetGraph片Description（用於 Cohere Service）
   */
  private async getImageDescription(imageUrl: string): Promise<string> {
    try {
      // 優先使用 Gemini 進RowGraph片Description
      if (serviceManager.isServiceAvailable('gemini')) {
        const _imageData = await this.fetchImageAsBase64(imageUrl);
        return await geminiService.analyzeImage(
          imageData,
          'image/jpeg',
          '請簡要描述這張卡牌圖片的主要特徵，包括卡牌名稱、類型、顏色等基本信息。'
        );
      }

      // 如果 Gemini 不可用，Return基本Description
      return '卡牌圖片，需要進一步分析';
    } catch (error) {
      logger.error('Get圖片描述Failed:', { error, imageUrl });
      return '無法獲取圖片描述';
    }
  }

  /**
   * Get可用的 AI ServiceStatus
   */
  getAvailableServices(): {
    openai: boolean;
    gemini: boolean;
    cohere: boolean;
    replicate: boolean;
  } {
    return {
      openai: serviceManager.isServiceAvailable('openai'),
      gemini: serviceManager.isServiceAvailable('gemini'),
      cohere: serviceManager.isServiceAvailable('cohere'),
      replicate: replicateService.isAvailable(),
    };
  }

  /**
   * GetServiceStatisticsInformation
   */
  getServiceStatistics(): {
    totalServices: number;
    availableServices: number;
    preferredProvider: string;
  } {
    const _available = this.getAvailableServices();
    const _availableCount = Object.values(available).filter(Boolean).length;

    let preferredProvider = 'none';
    if (available.gemini) preferredProvider = 'gemini';
    else if (available.openai) preferredProvider = 'openai';
    else if (available.cohere) preferredProvider = 'cohere';
    else if (available.replicate) preferredProvider = 'replicate';

    return {
      totalServices: 4,
      availableServices: availableCount,
      preferredProvider,
    };
  }

  /**
   * Analysis卡牌（存RootMethod）
   */
  async analyzeCard(cardId: string): Promise<any> {
    logger.info('分析卡牌（存根方法）:', { cardId });
    return {
      success: true,
      data: {
        cardId,
        analysis: '卡牌分析功能正在開發中',
        confidence: 0.8,
        processingTime: 1000,
      },
      message: '分析完成',
      timestamp: new Date(),
    };
  }

  /**
   * 預測價格（存RootMethod）
   */
  async predictPrice(cardId: string, timeframe: string): Promise<any> {
    logger.info('預測價格（存根方法）:', { cardId, timeframe });
    return {
      success: true,
      data: {
        cardId,
        timeframe,
        predictedPrice: 100,
        confidence: 0.7,
        factors: ['市場趨勢', '歷史數據'],
      },
      message: '價格預測完成',
      timestamp: new Date(),
    };
  }

  /**
   * Send聊天Message（存RootMethod）
   */
  async sendMessage(message: string): Promise<any> {
    logger.info('發送聊天消息（存根方法）:', { message });
    return {
      success: true,
      data: {
        message,
        response: '聊天功能正在開發中',
        timestamp: new Date(),
      },
      message: '消息發送Success',
      timestamp: new Date(),
    };
  }

  /**
   * Get市場洞察（存RootMethod）
   */
  async getMarketInsights(): Promise<any> {
    logger.info('獲取市場洞察（存根方法）');
    return {
      success: true,
      data: {
        insights: ['市場趨勢分析', '投資建議'],
        timestamp: new Date(),
      },
      message: '市場洞察GetSuccess',
      timestamp: new Date(),
    };
  }

  /**
   * 生成投資Report（存RootMethod）
   */
  async generateInvestmentReport(cardIds: string[]): Promise<any> {
    logger.info('生成投資報告（存根方法）:', { cardIds });
    return {
      success: true,
      data: {
        cardIds,
        report: '投資報告正在生成中',
        timestamp: new Date(),
      },
      message: '投資報告生成Success',
      timestamp: new Date(),
    };
  }
}

// Export單例Instance
export const _aiService = AIService.getInstance();

// ExportClass型
export type { AnalysisOptions, CardAnalysisResult };
