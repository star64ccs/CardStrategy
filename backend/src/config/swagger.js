const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CardStrategy API',
      version: '1.0.0',
      description: 'CardStrategy 卡牌投資策略平台 API 文檔',
      contact: {
        name: 'CardStrategy Team',
        email: 'support@cardstrategy.com',
        url: 'https://cardstrategy.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '開發環境'
      },
      {
        url: 'https://api.cardstrategy.com',
        description: '生產環境'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 認證令牌'
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API 密鑰認證'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin', 'moderator'], example: 'user' },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Card: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Charizard' },
            set_name: { type: 'string', example: 'Base Set' },
            card_number: { type: 'string', example: '4/102' },
            rarity: { type: 'string', example: 'Holo Rare' },
            condition_grade: { type: 'string', example: 'NM' },
            estimated_value: { type: 'number', format: 'float', example: 1500.00 },
            image_url: { type: 'string', example: 'https://example.com/card.jpg' },
            description: { type: 'string', example: '經典的噴火龍卡片' },
            user_id: { type: 'integer', example: 1 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        Investment: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            card_id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            purchase_price: { type: 'number', format: 'float', example: 1200.00 },
            purchase_date: { type: 'string', format: 'date', example: '2023-01-15' },
            current_value: { type: 'number', format: 'float', example: 1500.00 },
            profit_loss: { type: 'number', format: 'float', example: 300.00 },
            notes: { type: 'string', example: '從收藏家手中購入' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        MarketData: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            card_id: { type: 'integer', example: 1 },
            price: { type: 'number', format: 'float', example: 1500.00 },
            volume: { type: 'integer', example: 5 },
            trend: { type: 'string', enum: ['up', 'down', 'stable'], example: 'up' },
            source: { type: 'string', example: 'TCGPlayer' },
            recorded_at: { type: 'string', format: 'date-time' }
          }
        },
        AIPrediction: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            card_id: { type: 'integer', example: 1 },
            predicted_price: { type: 'number', format: 'float', example: 1600.00 },
            confidence_score: { type: 'number', format: 'float', example: 0.85 },
            model_type: { type: 'string', example: 'LSTM' },
            prediction_date: { type: 'string', format: 'date', example: '2023-12-01' },
            actual_price: { type: 'number', format: 'float', example: 1550.00 },
            accuracy: { type: 'number', format: 'float', example: 0.92 },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Alert: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            type: { type: 'string', example: 'cpu_high' },
            severity: { type: 'string', enum: ['info', 'warning', 'critical'], example: 'warning' },
            message: { type: 'string', example: 'CPU 使用率過高: 85.5%' },
            value: { type: 'number', format: 'float', example: 85.5 },
            threshold: { type: 'number', format: 'float', example: 80.0 },
            processed: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: '錯誤描述' },
            code: { type: 'string', example: 'ERROR_CODE' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: '郵箱格式無效' }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: '操作成功' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/models/*.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'CardStrategy API 文檔',
    customfavIcon: '/favicon.ico',
    swaggerOptions: {
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true
    }
  }),
  specs
};
