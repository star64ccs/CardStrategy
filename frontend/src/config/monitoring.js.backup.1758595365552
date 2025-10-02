const prometheus = require('prom-client');

// 創建默認註冊表
const register = new prometheus.Registry();

// 添加默認指標
prometheus.collectDefaultMetrics({ register });

// 自定義指標
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

const databaseConnections = new prometheus.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections'
});

const cacheHitRate = new prometheus.Gauge({
  name: 'cache_hit_rate',
  help: 'Cache hit rate percentage'
});

const errorRate = new prometheus.Counter({
  name: 'errors_total',
  help: 'Total number of errors',
  labelNames: ['type', 'severity']
});

// 註冊自定義指標
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(activeConnections);
register.registerMetric(databaseConnections);
register.registerMetric(cacheHitRate);
register.registerMetric(errorRate);

// 中間件函數
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const labels = {
      method: req.method,
      route: req.route ? req.route.path : req.path,
      status_code: res.statusCode
    };
    
    httpRequestDuration.observe(labels, duration);
    httpRequestTotal.inc(labels);
  });
  
  next();
};

// 健康檢查指標
const healthCheck = new prometheus.Gauge({
  name: 'health_check',
  help: 'Health check status (1 = healthy, 0 = unhealthy)'
});

register.registerMetric(healthCheck);

module.exports = {
  register,
  httpRequestDuration,
  httpRequestTotal,
  activeConnections,
  databaseConnections,
  cacheHitRate,
  errorRate,
  healthCheck,
  metricsMiddleware
};