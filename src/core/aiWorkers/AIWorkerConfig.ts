// AI Worker Configure檔案
export interface AIProvider {
  name: string;
  type: 'cloud' | 'local' | 'hybrid';
  cost: {
    input: number; // 每1K tokensInput成本
    output: number; // 每1K tokensOutput成本
    currency: string;
  };
  models: string[];
  endpoint?: string;
  apiKey?: string;
  features: string[];
  reliability: number; // 0-1
}

export const AI_PROVIDERS: Record<string, AIProvider> = {
  // 國內Service
  baidu: {
    name: '百度文心一言',
    type: 'cloud',
    cost: { input: 0.012, output: 0.012, currency: 'USD' },
    models: ['ernie-bot-turbo', 'ernie-bot', 'ernie-bot-4'],
    endpoint:
      'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions',
    features: ['中文優化', '企業級Service', '穩定可靠'],
    reliability: 0.95,
  },

  alibaba: {
    name: '阿里通義千問',
    type: 'cloud',
    cost: { input: 0.01, output: 0.01, currency: 'USD' },
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
    endpoint:
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    features: ['中文優化', '代碼生成', '多模態'],
    reliability: 0.92,
  },

  zhipu: {
    name: '智譜AI',
    type: 'cloud',
    cost: { input: 0.015, output: 0.015, currency: 'USD' },
    models: ['glm-3-turbo', 'glm-4', 'cogview-3'],
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    features: ['中文優化', '知識庫', '企業級'],
    reliability: 0.9,
  },

  // LocalDeploy
  ollama: {
    name: 'Ollama',
    type: 'local',
    cost: { input: 0, output: 0, currency: 'USD' },
    models: ['llama2', 'mistral', 'codellama', 'qwen', 'gemma'],
    features: ['完全免費', '本地部署', '數據安全', '無限制'],
    reliability: 0.85,
  },

  // 雲端Service
  azure: {
    name: 'Azure OpenAI',
    type: 'cloud',
    cost: { input: 0.0015, output: 0.002, currency: 'USD' },
    models: ['gpt-35-turbo', 'gpt-4'],
    features: ['企業級', '穩定可靠', '全球部署'],
    reliability: 0.98,
  },

  google: {
    name: 'Google AI Studio',
    type: 'cloud',
    cost: { input: 0.0015, output: 0.006, currency: 'USD' },
    models: ['gemini-pro', 'gemini-pro-vision'],
    features: ['多模態', '代碼生成', 'Google生態'],
    reliability: 0.95,
  },
};

// AI Worker 成本優化Configure
export interface AIWorkerCostConfig {
  maxMonthlyBudget: number;
  preferredProviders: string[];
  fallbackProviders: string[];
  costOptimization: {
    enableModelSwitching: boolean;
    enableBatchProcessing: boolean;
    enableCaching: boolean;
    enableCompression: boolean;
  };
  usageLimits: {
    dailyRequests: number;
    monthlyTokens: number;
    maxConcurrentRequests: number;
  };
}

export const DEFAULT_COST_CONFIG: AIWorkerCostConfig = {
  maxMonthlyBudget: 100, // USD
  preferredProviders: ['ollama', 'baidu', 'alibaba'],
  fallbackProviders: ['zhipu', 'azure'],
  costOptimization: {
    enableModelSwitching: true,
    enableBatchProcessing: true,
    enableCaching: true,
    enableCompression: true,
  },
  usageLimits: {
    dailyRequests: 1000,
    monthlyTokens: 1000000,
    maxConcurrentRequests: 10,
  },
};
