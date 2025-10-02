const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

/**
 * Initialize Sentry ErrorMonitor
 * @param {Object} app - Express ApplyInstance
 */
const initSentry = (app) => {
  // CheckYesNoConfigure了 Sentry DSN
  if (!process.env.SENTRY_DSN) {
    // logger.info('Sentry DSN not configured, error monitoring disabled');
    return;
  }

  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.APP_VERSION || '1.0.0',
      debug: process.env.NODE_ENV === 'development',

      // 集成Configure
      integrations: [
        // HTTP RequestTrace
        new Sentry.Integrations.Http({ tracing: true }),

        // Express ApplyTrace
        new Tracing.Integrations.Express({ app }),

        // PostgreSQL QueryTrace
        new Tracing.Integrations.Postgres(),

        // Control台ErrorCatch
        new Sentry.Integrations.Console(),

        // 未Handle的 Promise Reject
        new Sentry.Integrations.OnUnhandledRejection(),

        // 未Catch的異常
        new Sentry.Integrations.OnUncaughtException(),
      ],

      // TraceConfigure
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // ErrorFilter
      beforeSend(event, hint) {
        // Filter敏感Information
        if (event.request && event.request.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-api-key'];
        }

        // FilterPasswordField
        if (event.request && event.request.data) {
          const sensitiveFields = ['password', 'token', 'secret', 'key'];
          sensitiveFields.forEach((field) => {
            if (event.request.data[field]) {
              event.request.data[field] = '[REDACTED]';
            }
          });
        }

        // FilterQueryParameter中的敏感Information
        if (event.request && event.request.query_string) {
          const sensitiveParams = ['password', 'token', 'secret', 'key'];
          sensitiveParams.forEach((param) => {
            if (event.request.query_string.includes(param)) {
              event.request.query_string = event.request.query_string.replace(
                new RegExp(`${param}=[^&]*`, 'g'),
                `${param}=[REDACTED]`
              );
            }
          });
        }

        // On發環境下Record所有Error
        if (process.env.NODE_ENV === 'development') {
          // logger.info('Sentry event:', JSON.stringify(event, null, 2));
        }

        return event;
      },

      // ErrorFilter規則
      beforeBreadcrumb(breadcrumb, hint) {
        // Filter敏感的面Package屑
        if (breadcrumb.category === 'http' && breadcrumb.data) {
          if (breadcrumb.data.url && breadcrumb.data.url.includes('password')) {
            return null;
          }
        }

        return breadcrumb;
      },

      // 性能Monitor
      attachStacktrace: true,
      includeLocalVariables: process.env.NODE_ENV === 'development',

      // TagConfigure
      defaultTags: {
        service: 'cardstrategy-api',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
    });

    // logger.info('Sentry initialized successfully');
  } catch (error) {
    // logger.info('Failed to initialize Sentry:', error);
  }
};

/**
 * Settings Sentry RequestHandle器
 * @param {Object} app - Express ApplyInstance
 */
const setupSentryHandlers = (app) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  // RequestHandle器 - 必須在其他中間件之前
  app.use(Sentry.Handlers.requestHandler());

  // TraceHandle器 - 必須在路由之前
  app.use(Sentry.Handlers.tracingHandler());
};

/**
 * Settings Sentry ErrorHandle器
 * @param {Object} app - Express ApplyInstance
 */
const setupSentryErrorHandlers = (app) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  // ErrorHandle器 - 必須在其他Error中間件之後
  app.use(Sentry.Handlers.errorHandler());

  // Optional的ErrorHandle器，用於Catch所有未Handle的Error
  app.use((err, req, res, next) => { // eslint-disable-next-line no-unused-vars
    // 將ErrorSend到 Sentry
    Sentry.captureException(err, {
      extra: {
        requestId: req.headers['x-request-id'],
        userId: req.user?.id,
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
      },
    });

    // ReturnErrorResponse
    res.status(500).json({
      error: 'Internal Server Error',
      message:
        process.env.NODE_ENV === 'development'
          ? err.message
          : 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });
};

/**
 * ManualCatchError
 * @param {Error} error - ErrorObject
 * @param {Object} context - 上下文Information
 */
const captureException = (error, context = {}) => {
  if (!process.env.SENTRY_DSN) {
    // logger.info('Error (Sentry not configured):', error);
    return;
  }

  Sentry.captureException(error, {
    extra: context,
    tags: {
      source: 'manual',
      ...context.tags,
    },
  });
};

/**
 * ManualCatchMessage
 * @param {string} message - MessageContent
 * @param {string} level - Log級別
 * @param {Object} context - 上下文Information
 */
const captureMessage = (message, level = 'info', context = {}) => {
  if (!process.env.SENTRY_DSN) {
    // logger.info(`Message (Sentry not configured) [${level}]:`, message);
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
    tags: {
      source: 'manual',
      ...context.tags,
    },
  });
};

/**
 * SettingsUser上下文
 * @param {Object} user - UserInformation
 */
const setUser = (user) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    ip_address: user.ip,
  });
};

/**
 * ClearUser上下文
 */
const clearUser = () => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setUser(null);
};

/**
 * AddTag
 * @param {string} key - TagKey
 * @param {string} value - TagValue
 */
const addTag = (key, value) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setTag(key, value);
};

/**
 * Add額外Data
 * @param {string} key - DataKey
 * @param {any} value - DataValue
 */
const addExtra = (key, value) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setExtra(key, value);
};

/**
 * Settings上下文
 * @param {string} name - 上下文名稱
 * @param {Object} data - 上下文Data
 */
const setContext = (name, data) => {
  if (!process.env.SENTRY_DSN) {
    return;
  }

  Sentry.setContext(name, data);
};

/**
 * Create性能Trace
 * @param {string} name - Trace名稱
 * @param {string} operation - Operation名稱
 */
const startTransaction = (name, operation) => {
  if (!process.env.SENTRY_DSN) {
    return null;
  }

  return Sentry.startTransaction({
    name,
    op: operation,
  });
};

/**
 * 健康Check
 */
const healthCheck = () => {
  return {
    enabled: !!process.env.SENTRY_DSN,
    dsn: process.env.SENTRY_DSN ? 'configured' : 'not configured',
    environment: process.env.NODE_ENV || 'development',
    release: process.env.APP_VERSION || '1.0.0',
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
  healthCheck,
};
