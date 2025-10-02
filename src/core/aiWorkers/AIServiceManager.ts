import type { AIProvider, AIWorkerCostConfig } from './AIWorkerConfig';
import { AI_PROVIDERS, DEFAULT_COST_CONFIG } from './AIWorkerConfig';

export interface AIRequest {
  prompt: string;
  model?: string;
  provider?: string;
  maxTokens?: number;
  temperature?: number;
  priority?: 'low' | 'normal' | 'high';
  useCache?: boolean;
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  latency: number;
  success: boolean;
  error?: string;
}

export interface AIServiceStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  successRate: number;
  averageLatency: number;
  providerUsage: Record<
    string,
    {
      requests: number;
      tokens: number;
      cost: number;
      successRate: number;
    }
  >;
}

export class AIServiceManager {
  private static instance: AIServiceManager;
  private config: AIWorkerCostConfig;
  private stats: AIServiceStats;
  private readonly cache: Map<string, AIResponse> = new Map();
  private readonly activeProviders: Map<string, AIProvider> = new Map();

  private constructor() {
    this.config = DEFAULT_COST_CONFIG;
    this.stats = this.initializeStats();
    this.initializeProviders();
  }

  public static getInstance(): AIServiceManager {
    if (!AIServiceManager.instance) {
      AIServiceManager.instance = new AIServiceManager();
    }
    return AIServiceManager.instance;
  }

  private initializeStats(): AIServiceStats {
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      successRate: 0,
      averageLatency: 0,
      providerUsage: {},
    };
  }

  private initializeProviders(): void {
    // Initialize首選提供商
    this.config.preferredProviders.forEach(providerKey => {
      const _provider = AI_PROVIDERS[providerKey];
      if (provider) {
        this.activeProviders.set(providerKey, provider);
      }
    });

    // Initialize備用提供商
    this.config.fallbackProviders.forEach(providerKey => {
      const _provider = AI_PROVIDERS[providerKey];
      if (provider && !this.activeProviders.has(providerKey)) {
        this.activeProviders.set(providerKey, provider);
      }
    });
  }

  /**
   * 智能SelectAI提供商
   */
  private selectProvider(request: AIRequest): string {
    // 如果指定了提供商，直接使用
    if (request.provider && this.activeProviders.has(request.provider)) {
      return request.provider;
    }

    // Root據優先級和成本Select提供商
    const _availableProviders = Array.from(this.activeProviders.keys());

    // 優先使用LocalDeploy（免費）
    const _localProviders = availableProviders.filter(
      key => AI_PROVIDERS[key].type === 'local'
    );
    if (localProviders.length > 0) {
      return localProviders[0];
    }

    // Root據成本和可靠性Select雲端提供商
    const _cloudProviders = availableProviders.filter(
      key => AI_PROVIDERS[key].type === 'cloud'
    );

    if (cloudProviders.length === 0) {
      throw new Error('沒有可用的AI提供商');
    }

    // Select成本最低且可靠性較高的提供商
    return cloudProviders.reduce((best, current) => {
      const _bestProvider = AI_PROVIDERS[best];
      const _currentProvider = AI_PROVIDERS[current];

      const _bestScore =
        bestProvider.reliability /
        (bestProvider.cost.input + bestProvider.cost.output);
      const _currentScore =
        currentProvider.reliability /
        (currentProvider.cost.input + currentProvider.cost.output);

      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * CheckCache
   */
  private checkCache(request: AIRequest): AIResponse | null {
    if (!request.useCache) return null;

    const _cacheKey = this.generateCacheKey(request);
    return this.cache.get(cacheKey) || null;
  }

  /**
   * 生成CacheKey
   */
  private generateCacheKey(request: AIRequest): string {
    return `${request.provider || 'auto'}_${request.model || 'default'}_${request.prompt.length}_${request.maxTokens || 1000}`;
  }

  /**
   * 調用AIService
   */
  public async callAI(request: AIRequest): Promise<AIResponse> {
    const _startTime = Date.now();

    try {
      // CheckCache
      const _cachedResponse = this.checkCache(request);
      if (cachedResponse) {
        return {
          ...cachedResponse,
          latency: Date.now() - startTime,
          cost: 0, // CacheResponse不計費
        };
      }

      // Select提供商
      const _providerKey = this.selectProvider(request);
      const _provider = AI_PROVIDERS[providerKey];

      // Check使用Limit
      this.checkUsageLimits(request);

      // 調用Concrete的AIService
      const _response = await this.callProvider(providerKey, request);

      // 計算成本
      const _cost = this.calculateCost(provider, response.tokens);

      // UpdateStatistics
      this.updateStats(providerKey, response, cost);

      // CacheResponse
      if (request.useCache) {
        const _cacheKey = this.generateCacheKey(request);
        this.cache.set(cacheKey, {
          ...response,
          cost,
          latency: Date.now() - startTime,
        });
      }

      return {
        ...response,
        cost,
        latency: Date.now() - startTime,
      };
    } catch (error) {
      // 如果首選提供商Failed，嘗試備用提供商
      if (request.provider && this.config.fallbackProviders.length > 0) {
        return this.retryWithFallback(request);
      }

      throw error;
    }
  }

  /**
   * 調用Concrete的AI提供商
   */
  private async callProvider(
    providerKey: string,
    request: AIRequest
  ): Promise<Omit<AIResponse, 'cost' | 'latency'>> {
    const _provider = AI_PROVIDERS[providerKey];

    switch (providerKey) {
      case 'ollama':
        return this.callOllama(request);
      case 'baidu':
        return this.callBaidu(request);
      case 'alibaba':
        return this.callAlibaba(request);
      case 'zhipu':
        return this.callZhipu(request);
      case 'azure':
        return this.callAzure(request);
      case 'google':
        return this.callGoogle(request);
      default:
        throw new Error(`不支持的AI提供商: ${providerKey}`);
    }
  }

  /**
   * 調用Ollama（LocalDeploy）
   */
  private async callOllama(
    request: AIRequest
  ): Promise<Omit<AIResponse, 'cost' | 'latency'>> {
    const _model = request.model || 'llama2';
    const _response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: request.prompt,
        stream: false,
        options: {
          temperature: request.temperature || 0.7,
          num_predict: request.maxTokens || 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama APIError: ${response.statusText}`);
    }

    const _data = await response.json();
    const _content = data.response || '';
    const _tokens = this.estimateTokens(request.prompt, content);

    return {
      content,
      provider: 'ollama',
      model,
      tokens,
      success: true,
    };
  }

  /**
   * 調用百度文心一言
   */
  private async callBaidu(
    request: AIRequest
  ): Promise<Omit<AIResponse, 'cost' | 'latency'>> {
    const _model = request.model || 'ernie-bot-turbo';
    const _accessToken = await this.getBaiduAccessToken();

    const _response = await fetch(
      `${AI_PROVIDERS.baidu.endpoint}?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: request.prompt }],
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`百度APIError: ${response.statusText}`);
    }

    const _data = await response.json();
    const _content = data.result || '';
    const _tokens = this.estimateTokens(request.prompt, content);

    return {
      content,
      provider: 'baidu',
      model,
      tokens,
      success: true,
    };
  }

  /**
   * 調用阿里通義千問
   */
  private async callAlibaba(
    request: AIRequest
  ): Promise<Omit<AIResponse, 'cost' | 'latency'>> {
    const _model = request.model || 'qwen-turbo';
    const _apiKey = process.env.ALIBABA_API_KEY;

    if (!apiKey) {
      throw new Error('未配置阿里API密鑰');
    }

    const _response = await fetch(AI_PROVIDERS.alibaba.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: {
          messages: [{ role: 'user', content: request.prompt }],
        },
        parameters: {
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`阿里APIError: ${response.statusText}`);
    }

    const _data = await response.json();
    const _content = data.output?.text || '';
    const _tokens = this.estimateTokens(request.prompt, content);

    return {
      content,
      provider: 'alibaba',
      model,
      tokens,
      success: true,
    };
  }

  /**
   * 調用智譜AI
   */
  private async callZhipu(
    request: AIRequest
  ): Promise<Omit<AIResponse, 'cost' | 'latency'>> {
    const _model = request.model || 'glm-3-turbo';
    const _apiKey = process.env.ZHIPU_API_KEY;

    if (!apiKey) {
      throw new Error('未配置智譜API密鑰');
    }

    const _response = await fetch(AI_PROVIDERS.zhipu.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: request.prompt }],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`智譜APIError: ${response.statusText}`);
    }

    const _data = await response.json();
    const _content = data.choices?.[0]?.message?.content || '';
    const _tokens = this.estimateTokens(request.prompt, content);

    return {
      content,
      provider: 'zhipu',
      model,
      tokens,
      success: true,
    };
  }

  /**
   * 調用Azure OpenAI
   */
  private async callAzure(
    request: AIRequest
  ): Promise<Omit<AIResponse, 'cost' | 'latency'>> {
    const _model = request.model || 'gpt-35-turbo';
    const _endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const _apiKey = process.env.AZURE_OPENAI_API_KEY;
    const _deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT;

    if (!endpoint || !apiKey || !deploymentName) {
      throw new Error('未配置Azure OpenAI參數');
    }

    const _response = await fetch(
      `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: request.prompt }],
          temperature: request.temperature || 0.7,
          max_tokens: request.maxTokens || 1000,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Azure OpenAI APIError: ${response.statusText}`);
    }

    const _data = await response.json();
    const _content = data.choices?.[0]?.message?.content || '';
    const _tokens = {
      input: data.usage?.prompt_tokens || 0,
      output: data.usage?.completion_tokens || 0,
      total: data.usage?.total_tokens || 0,
    };

    return {
      content,
      provider: 'azure',
      model,
      tokens,
      success: true,
    };
  }

  /**
   * 調用Google AI Studio
   */
  private async callGoogle(
    request: AIRequest
  ): Promise<Omit<AIResponse, 'cost' | 'latency'>> {
    const _model = request.model || 'gemini-pro';
    const _apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      throw new Error('未配置Google AI API密鑰');
    }

    const _response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: request.prompt }] }],
          generationConfig: {
            temperature: request.temperature || 0.7,
            maxOutputTokens: request.maxTokens || 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google AI APIError: ${response.statusText}`);
    }

    const _data = await response.json();
    const _content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const _tokens = this.estimateTokens(request.prompt, content);

    return {
      content,
      provider: 'google',
      model,
      tokens,
      success: true,
    };
  }

  /**
   * Get百度訪問令牌
   */
  private async getBaiduAccessToken(): Promise<string> {
    const _apiKey = process.env.BAIDU_API_KEY;
    const _secretKey = process.env.BAIDU_SECRET_KEY;

    if (!apiKey || !secretKey) {
      throw new Error('未配置百度API密鑰');
    }

    const _response = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error('Get百度訪問令牌Failed');
    }

    const _data = await response.json();
    return data.access_token;
  }

  /**
   * 估算token數量
   */
  private estimateTokens(
    input: string,
    output: string
  ): { input: number; output: number; total: number } {
    // 簡單的token估算（實際應該使用tokenizer）
    const _inputTokens = Math.ceil(input.length / 4);
    const _outputTokens = Math.ceil(output.length / 4);

    return {
      input: inputTokens,
      output: outputTokens,
      total: inputTokens + outputTokens,
    };
  }

  /**
   * 計算成本
   */
  private calculateCost(
    provider: AIProvider,
    tokens: { input: number; output: number }
  ): number {
    const _inputCost = (tokens.input / 1000) * provider.cost.input;
    const _outputCost = (tokens.output / 1000) * provider.cost.output;
    return inputCost + outputCost;
  }

  /**
   * Check使用Limit
   */
  private checkUsageLimits(request: AIRequest): void {
    const _today = new Date().toDateString();
    const _monthlyUsage = this.getMonthlyUsage();

    if (this.stats.totalRequests >= this.config.usageLimits.dailyRequests) {
      throw new Error('已達到每日請求限制');
    }

    if (monthlyUsage.tokens >= this.config.usageLimits.monthlyTokens) {
      throw new Error('已達到每月token限制');
    }

    if (monthlyUsage.cost >= this.config.maxMonthlyBudget) {
      throw new Error('已達到每月預算限制');
    }
  }

  /**
   * Get月度使用量
   */
  private getMonthlyUsage(): { tokens: number; cost: number } {
    // 這裡應該從Database或Cache中Get實際的月度使用量
    // 簡化實現，Return當前Statistics
    return {
      tokens: this.stats.totalTokens,
      cost: this.stats.totalCost,
    };
  }

  /**
   * 使用備用提供商Retry
   */
  private async retryWithFallback(request: AIRequest): Promise<AIResponse> {
    for (const fallbackProvider of this.config.fallbackProviders) {
      try {
        const _fallbackRequest = { ...request, provider: fallbackProvider };
        return await this.callAI(fallbackRequest);
      } catch (error) {
        console.warn(`備用提供商 ${fallbackProvider} Failed:`, error);
        continue;
      }
    }

    throw new Error('所有AI提供商都Failed了');
  }

  /**
   * UpdateStatisticsInformation
   */
  private updateStats(
    providerKey: string,
    response: Omit<AIResponse, 'cost' | 'latency'>,
    cost: number
  ): void {
    this.stats.totalRequests++;
    this.stats.totalTokens += response.tokens.total;
    this.stats.totalCost += cost;

    if (!this.stats.providerUsage[providerKey]) {
      this.stats.providerUsage[providerKey] = {
        requests: 0,
        tokens: 0,
        cost: 0,
        successRate: 0,
      };
    }

    const _providerStats = this.stats.providerUsage[providerKey];
    providerStats.requests++;
    providerStats.tokens += response.tokens.total;
    providerStats.cost += cost;
    providerStats.successRate =
      (providerStats.successRate * (providerStats.requests - 1) + 1) /
      providerStats.requests;

    this.stats.successRate =
      (this.stats.successRate * (this.stats.totalRequests - 1) + 1) /
      this.stats.totalRequests;
  }

  /**
   * GetStatisticsInformation
   */
  public getStats(): AIServiceStats {
    return { ...this.stats };
  }

  /**
   * ResetStatisticsInformation
   */
  public resetStats(): void {
    this.stats = this.initializeStats();
  }

  /**
   * UpdateConfigure
   */
  public updateConfig(config: Partial<AIWorkerCostConfig>): void {
    this.config = { ...this.config, ...config };
    this.initializeProviders();
  }

  /**
   * Get當前Configure
   */
  public getConfig(): AIWorkerCostConfig {
    return { ...this.config };
  }
}
