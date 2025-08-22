module.exports = {
  // Ollama配置 (本地運行的大語言模型)
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    models: {
      llama2: {
        name: 'llama2',
        description: 'Meta的Llama 2模型',
        capabilities: ['text-generation', 'analysis', 'translation'],
        maxTokens: 4096,
        temperature: 0.7,
      },
      mistral: {
        name: 'mistral',
        description: 'Mistral AI的高效模型',
        capabilities: ['text-generation', 'analysis', 'reasoning'],
        maxTokens: 8192,
        temperature: 0.7,
      },
      codellama: {
        name: 'codellama',
        description: '專用於代碼生成的Llama模型',
        capabilities: ['code-generation', 'code-analysis'],
        maxTokens: 4096,
        temperature: 0.3,
      },
      llama2_uncensored: {
        name: 'llama2-uncensored',
        description: '無審查版本的Llama 2',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 4096,
        temperature: 0.7,
      },
    },
    defaultModel: 'llama2',
    timeout: 30000,
  },

  // Hugging Face配置 (免費API)
  huggingface: {
    baseUrl: 'https://api-inference.huggingface.co',
    apiKey: process.env.HUGGING_FACE_API_KEY || '',
    models: {
      dialoGPT: {
        name: 'microsoft/DialoGPT-medium',
        description: '對話生成模型',
        capabilities: ['conversation', 'text-generation'],
        maxTokens: 100,
        temperature: 0.7,
      },
      gpt2: {
        name: 'gpt2',
        description: 'OpenAI的GPT-2模型',
        capabilities: ['text-generation'],
        maxTokens: 100,
        temperature: 0.7,
      },
      distilgpt2: {
        name: 'distilgpt2',
        description: 'GPT-2的輕量版本',
        capabilities: ['text-generation'],
        maxTokens: 100,
        temperature: 0.7,
      },
      gpt_neo: {
        name: 'EleutherAI/gpt-neo-125M',
        description: 'EleutherAI的GPT-Neo模型',
        capabilities: ['text-generation'],
        maxTokens: 100,
        temperature: 0.7,
      },
    },
    defaultModel: 'microsoft/DialoGPT-medium',
    timeout: 30000,
    rateLimit: {
      requestsPerMinute: 30,
      requestsPerHour: 1000,
    },
  },

  // OpenAI兼容服務配置 (本地部署)
  openaiCompatible: {
    baseUrl: process.env.OPENAI_COMPATIBLE_URL || 'http://localhost:8080',
    models: {
      llama2: {
        name: 'llama2',
        description: '通過OpenAI API格式訪問的Llama 2',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 4096,
        temperature: 0.7,
      },
      mistral: {
        name: 'mistral',
        description: '通過OpenAI API格式訪問的Mistral',
        capabilities: ['text-generation', 'analysis'],
        maxTokens: 8192,
        temperature: 0.7,
      },
    },
    defaultModel: 'llama2',
    timeout: 30000,
  },

  // 任務類型配置
  taskTypes: {
    card_analysis: {
      description: '卡片分析任務',
      preferredProvider: 'ollama',
      fallbackProviders: ['huggingface', 'openaiCompatible'],
      defaultOptions: {
        temperature: 0.3,
        maxTokens: 500,
      },
    },
    price_prediction: {
      description: '價格預測任務',
      preferredProvider: 'ollama',
      fallbackProviders: ['openaiCompatible', 'huggingface'],
      defaultOptions: {
        temperature: 0.2,
        maxTokens: 300,
      },
    },
    market_analysis: {
      description: '市場分析任務',
      preferredProvider: 'ollama',
      fallbackProviders: ['openaiCompatible', 'huggingface'],
      defaultOptions: {
        temperature: 0.4,
        maxTokens: 600,
      },
    },
    text_generation: {
      description: '通用文本生成',
      preferredProvider: 'huggingface',
      fallbackProviders: ['ollama', 'openaiCompatible'],
      defaultOptions: {
        temperature: 0.7,
        maxTokens: 200,
      },
    },
  },

  // 錯誤處理配置
  errorHandling: {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    timeout: 30000,
  },

  // 緩存配置
  caching: {
    enabled: true,
    ttl: 3600, // 1小時
    maxSize: 1000,
  },

  // 監控配置
  monitoring: {
    enabled: true,
    logRequests: true,
    logResponses: false,
    logErrors: true,
    metrics: {
      requestCount: true,
      responseTime: true,
      errorRate: true,
      successRate: true,
    },
  },
};
