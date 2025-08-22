const path = require('path');

// 環境配置
const env = process.env.NODE_ENV || 'development';

// 基礎配置
const baseConfig = {
  app: {
    name: 'CardStrategy',
    version: '1.0.0',
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
  },

  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME || 'cardstrategy',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    dialect: 'postgres',
    logging: env === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: process.env.REDIS_DB || 0,
    keyPrefix: 'cardstrategy:',
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: env === 'production' ? 'json' : 'simple',
    file: env === 'production' ? 'logs/app.log' : null,
  },

  security: {
    bcryptRounds: 12,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
  },
};

// 環境特定配置
const envConfigs = {
  development: {
    database: {
      logging: console.log,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
    logging: {
      level: 'debug',
    },
  },

  test: {
    database: {
      name: 'cardstrategy_test',
      logging: false,
    },
    redis: {
      db: 1,
    },
  },

  production: {
    database: {
      logging: false,
      pool: {
        max: 20,
        min: 5,
      },
    },
    redis: {
      retryDelayOnFailover: 50,
      maxRetriesPerRequest: 5,
    },
    security: {
      rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 50,
      },
    },
  },
};

// 合併配置
const config = {
  ...baseConfig,
  ...envConfigs[env],
  database: {
    ...baseConfig.database,
    ...envConfigs[env]?.database,
  },
};

// 配置驗證
const validateConfig = () => {
  const required = [
    'database.host',
    'database.name',
    'database.user',
    'jwt.secret',
  ];

  const missing = [];

  for (const key of required) {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`缺少必要配置: ${missing.join(', ')}`);
  }

  return true;
};

module.exports = {
  config,
  validateConfig,
  env,
};
