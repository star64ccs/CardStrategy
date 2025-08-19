const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

/**
 * 初始化 Sentry 錯誤監控
 * @param {Object} app - Express 應用實例
 */
const initSentry = (app) => {
  // 檢查是否配置了 Sentry DSN
  if (!process.env.SENTRY_DSN) {
    console.warn('Sentry DSN not configured, error monitoring disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.APP_VERSION || '1.0.0',
      debug: process.env.NODE_ENV === 'development',

      // 集成配置
      integrations: [
        // HTTP 請求追蹤
        new Sentry.Integrations.Http({ tracing: true }),

        // Express 應用追蹤
        new Tracing.Integrations.Express({ app }),

        // PostgreSQL 查詢追蹤
        new Tracing.Integrations.Postgres(),

        // 控制台錯誤捕獲
        new Sentry.Integrations.Console(),

        // 未處理的 Promise 拒絕
        new Sentry.Integrations.OnUnhandledRejection(),

        // 未捕獲的異常
        new Sentry.Integrations.OnUncaughtException()
      ],

      // 追蹤配置
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // 錯誤過濾
      beforeSend(event, hint) {
        // 過濾敏感信息
        if (event.request && event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-api-key'];
        }

        // 過濾密碼字段
        if (event.request && event.request.data) {
          const sensitiveFields = ['password', 'token', 'secret', 'key'];
          sensitiveFields.forEach(field => {
            if (event.request.data[field]) {
              event.request.data[field] = '[REDACTED]';
            }
          });
        }

        // 過濾查詢參數中的敏感信息
        if (event.request && event.request.query_string) {
          const sensitiveParams = ['password', 'token', 'secret', 'key'];
          sensitiveParams.forEach(param => {
            if (event.request.query_string.includes(param)) {
              event.request.query_string = event.request.query_string.replace(
                new RegExp(`${param}=[^&]*`, 'g'),
                `${param}=[REDACTED]`
              );
            }
          });
        }

        // 開發環境下記錄所有錯誤
        if (process.env.NODE_ENV === 'development') {
          console.log('Sentry event:', JSON.stringify(event, null, 2));
        }

        return event;
      },

      // 錯誤過濾規則
      beforeBreadcrumb(breadcrumb, hint) {
        // 過濾敏感的面包屑
        if (breadcrumb.category === 'http' && breadcrumb.data) {
          if (breadcrumb.data.url && breadcrumb.data.url.includes('password')) {
            return null;
          }
        }

        return breadcrumb;
      },

      // 性能監控
      attachStacktrace: true,
      includeLocalVariables: process.env.NODE_ENV === 'development',

      // 標籤配置
      defaultTags: {
        service: 'cardstrategy-api',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    });

    console.log('Sentry initialized successfully');

  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
};

/**
 * 設置 Sentry 請求處理器
 * @param {Object} app - Express 應用實例
 */
const setupSentryHandlers = (app) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  // 請求處理器 - 必須在其他中間件之前
  app.use(Sentry.Handlers.requestHandler());

  // 追蹤處理器 - 必須在路由之前
  app.use(Sentry.Handlers.tracingHandler());
};

/**
 * 設置 Sentry 錯誤處理器
 * @param {Object} app - Express 應用實例
 */
const setupSentryErrorHandlers = (app) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  // 錯誤處理器 - 必須在其他錯誤中間件之後
  app.use(Sentry.Handlers.errorHandler());

  // 可選的錯誤處理器，用於捕獲所有未處理的錯誤
  app.use((err, req, res, next) => {
    // 將錯誤發送到 Sentry
    Sentry.captureException(err, {
      extra: {
        requestId: req.headers['x-request-id'],
        userId: req.user?.id,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    });

    // 返回錯誤響應
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  });
};

/**
 * 手動捕獲錯誤
 * @param {Error} error - 錯誤對象
 * @param {Object} context - 上下文信息
 */
const captureException = (error, context = {}) => {
  if (!process.env.SENTRY_DSN) {
    console.error('Error (Sentry not configured):', error);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
    tags: {
      source: 'manual',
      ...context.tags
    }
  });
};

/**
 * 手動捕獲消息
 * @param {string} message - 消息內容
 * @param {string} level - 日誌級別
 * @param {Object} context - 上下文信息
 */
const captureMessage = (message, level = 'info', context = {}) => {
  if (!process.env.SENTRY_DSN) {
    console.log(`Message (Sentry not configured) [${level}]:`, message);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
    tags: {
      source: 'manual',
      ...context.tags
    }
  });
};

/**
 * 設置用戶上下文
 * @param {Object} user - 用戶信息
 */
const setUser = (user) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    ip_address: user.ip
  });
};

/**
 * 清除用戶上下文
 */
const clearUser = () => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setUser(null);
};

/**
 * 添加標籤
 * @param {string} key - 標籤鍵
 * @param {string} value - 標籤值
 */
const addTag = (key, value) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setTag(key, value);
};

/**
 * 添加額外數據
 * @param {string} key - 數據鍵
 * @param {any} value - 數據值
 */
const addExtra = (key, value) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setExtra(key, value);
};

/**
 * 設置上下文
 * @param {string} name - 上下文名稱
 * @param {Object} data - 上下文數據
 */
const setContext = (name, data) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setContext(name, data);
};

/**
 * 創建性能追蹤
 * @param {string} name - 追蹤名稱
 * @param {string} operation - 操作名稱
 */
const startTransaction = (name, operation) => {
  if (!process.env.SENTRY_DSN) {
    return null;
  }

  return Sentry.startTransaction({
    name,
    op: operation
  });
};

/**
 * 健康檢查
 */
const healthCheck = () => {
  return {
    enabled: !!process.env.SENTRY_DSN,
    dsn: process.env.SENTRY_DSN ? 'configured' : 'not configured',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || '1.0.0'
  };
};

module.exports = {
  initSentry,
  setupSentryHandlers,
  setupSentryErrorHandlers,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addTag,
  addExtra,
  setContext,
  startTransaction,
  healthCheck
};
