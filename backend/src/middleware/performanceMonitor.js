let newrelic;
try {
  newrelic = require('newrelic');
} catch (error) {
  // New Relic 未Install，使用EmptyObject
  newrelic = {
    addCustomAttribute: () => {},
    noticeError: () => {},
  };
}
const logger = require('../utils/logger');

/**
 * 性能Monitor中間件
 * Monitor API Request的ResponseTime和性能指標
 */
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  const requestId = generateRequestId();

  // RecordRequestBegin
  logger.info('Request started', {
    requestId,
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // AddRequest ID 到Response頭
  res.setHeader('X-Request-ID', requestId);

  // Record到 New Relic
  if (newrelic) {
    newrelic.addCustomAttribute('request_id', requestId);
    newrelic.addCustomAttribute('request_path', req.path);
    newrelic.addCustomAttribute('request_method', req.method);
    newrelic.addCustomAttribute('user_agent', req.get('User-Agent'));
    newrelic.addCustomAttribute('client_ip', req.ip);
  }

  // MonitorResponseTime
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    // RecordResponseComplete
    logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.path,
      statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    // Record到 New Relic
    if (newrelic) {
      newrelic.addCustomAttribute('response_time', duration);
      newrelic.addCustomAttribute('status_code', statusCode);
      newrelic.addCustomAttribute(
        'response_size',
        res.get('Content-Length') || 0
      );
    }

    // Record慢Query
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        requestId,
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
        statusCode,
      });

      if (newrelic) {
        newrelic.noticeError(
          new Error(
            `Slow request: ${req.method} ${req.path} took ${duration}ms`
          )
        );
      }
    }

    // RecordErrorRequest
    if (statusCode >= 400) {
      logger.error('Request error', {
        requestId,
        method: req.method,
        path: req.path,
        statusCode,
        duration: `${duration}ms`,
      });
    }
  });

  // MonitorError
  res.on('error', (error) => {
    const duration = Date.now() - start;

    logger.error('Request error', {
      requestId,
      method: req.method,
      path: req.path,
      error: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    });

    if (newrelic) {
      newrelic.noticeError(error);
    }
  });

  next();
};

/**
 * 生成Unique的Request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * DatabaseQuery性能Monitor
 */
const queryMonitor = (query, params = []) => {
  const start = Date.now();
  const queryId = generateQueryId();

  logger.debug('Database query started', {
    queryId,
    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    params: params.length,
    timestamp: new Date().toISOString(),
  });

  return {
    queryId,
    query,
    params,
    start,
    end: null,
    duration: null,
  };
};

/**
 * EndQueryMonitor
 */
const endQueryMonitor = (queryInfo) => {
  queryInfo.end = Date.now();
  queryInfo.duration = queryInfo.end - queryInfo.start;

  logger.debug('Database query completed', {
    queryId: queryInfo.queryId,
    duration: `${queryInfo.duration}ms`,
    timestamp: new Date().toISOString(),
  });

  // Record慢Query
  if (queryInfo.duration > 100) {
    logger.warn('Slow query detected', {
      queryId: queryInfo.queryId,
      query:
        queryInfo.query.substring(0, 200) +
        (queryInfo.query.length > 200 ? '...' : ''),
      params: queryInfo.params,
      duration: `${queryInfo.duration}ms`,
    });

    if (newrelic) {
      newrelic.addCustomAttribute('slow_query', true);
      newrelic.addCustomAttribute('query_duration', queryInfo.duration);
    }
  }

  return queryInfo;
};

/**
 * 生成Unique的Query ID
 */
function generateQueryId() {
  return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Memory使用Monitor
 */
const memoryMonitor = () => {
  const memUsage = process.memoryUsage();

  logger.debug('Memory usage', {
    rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
    external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    timestamp: new Date().toISOString(),
  });

  // CheckMemory使用YesNo過高
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  if (heapUsedMB > 500) {
    // 500MB 閾Value
    logger.warn('High memory usage detected', {
      heapUsed: `${Math.round(heapUsedMB)}MB`,
      threshold: '500MB',
    });

    if (newrelic) {
      newrelic.addCustomAttribute('high_memory_usage', true);
      newrelic.addCustomAttribute('heap_used_mb', Math.round(heapUsedMB));
    }
  }

  return memUsage;
};

/**
 * CPU 使用Monitor
 */
const cpuMonitor = () => {
  const startUsage = process.cpuUsage();

  setTimeout(() => {
    const endUsage = process.cpuUsage(startUsage);
    const cpuPercent = (endUsage.user + endUsage.system) / 1000000; // Convert為Second

    logger.debug('CPU usage', {
      user: `${Math.round(endUsage.user / 1000)}ms`,
      system: `${Math.round(endUsage.system / 1000)}ms`,
      total: `${Math.round(cpuPercent * 100) / 100}s`,
      timestamp: new Date().toISOString(),
    });

    // Check CPU 使用YesNo過高
    if (cpuPercent > 1) {
      // 1Second閾Value
      logger.warn('High CPU usage detected', {
        cpuTime: `${Math.round(cpuPercent * 100) / 100}s`,
        threshold: '1s',
      });

      if (newrelic) {
        newrelic.addCustomAttribute('high_cpu_usage', true);
        newrelic.addCustomAttribute(
          'cpu_time_seconds',
          Math.round(cpuPercent * 100) / 100
        );
      }
    }
  }, 1000);
};

module.exports = {
  performanceMonitor,
  queryMonitor,
  endQueryMonitor,
  memoryMonitor,
  cpuMonitor,
};
