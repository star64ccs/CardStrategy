const { performanceMonitor } = require('./performance-monitor');
const { sequelize, testConnection } = require('../config/database-optimized');
const { healthCheck: redisHealthCheck } = require('../config/redis-optimized');
const { logger } = require('./unified-logger');

// 增強版健康Check
const enhancedHealthCheck = async (req, res) => {
  const startTime = Date.now();

  try {
    // CheckDatabaseConnect
    const dbStatus = await testConnection();

    // Check Redis Connect
    const redisStatus = await redisHealthCheck();

    // Get性能指標
    const metrics = performanceMonitor.getMetrics();

    // 計算健康CheckResponseTime
// eslint-disable-next-line no-unused-vars
    const responseTime = Date.now() - startTime;

    // OK整體健康Status
    const isHealthy = dbStatus && redisStatus && responseTime < 1000;
// eslint-disable-next-line no-unused-vars
    const statusCode = isHealthy ? 200 : 503;

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: dbStatus ? 'connected' : 'disconnected',
          responseTime: 'N/A',
        },
        redis: {
          status: redisStatus ? 'connected' : 'disconnected',
          responseTime: 'N/A',
        },
        api: {
          status: 'running',
          responseTime: `${responseTime}ms`,
        },
      },
      performance: {
        memory: metrics.memory,
        cpu: metrics.cpu,
        uptime: {
          seconds: Math.floor(metrics.uptime.current / 1000),
          formatted: formatUptime(metrics.uptime.current),
        },
      },
      requests: {
        total: metrics.requests.total,
        success: metrics.requests.success,
        error: metrics.requests.error,
        successRate:
          metrics.requests.total > 0
            ? Math.round(
                (metrics.requests.success / metrics.requests.total) * 100
              )
            : 0,
      },
    };

    // Record健康Check結果
    logger.info('Health Check', {
      status: healthData.status,
      responseTime,
      services: healthData.services,
    });

    res.status(statusCode).json({
      success: isHealthy,
      message: isHealthy
        ? 'All services are healthy'
        : 'Some services are unhealthy',
      data: healthData,
    });
  } catch (error) {
    logger.error('Health check failed:', error);

    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// Format運RowTime
const formatUptime = (milliseconds) => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
};

module.exports = {
  enhancedHealthCheck,
};
