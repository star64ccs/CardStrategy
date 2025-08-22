const { performanceMonitor } = require('./performance-monitor');
const { sequelize, testConnection } = require('../config/database-optimized');
const { healthCheck: redisHealthCheck } = require('../config/redis-optimized');
const { logger } = require('./unified-logger');

// 增強版健康檢查
const enhancedHealthCheck = async (req, res) => {
  const startTime = Date.now();

  try {
    // 檢查數據庫連接
    const dbStatus = await testConnection();

    // 檢查 Redis 連接
    const redisStatus = await redisHealthCheck();

    // 獲取性能指標
    const metrics = performanceMonitor.getMetrics();

    // 計算健康檢查響應時間
// eslint-disable-next-line no-unused-vars
    const responseTime = Date.now() - startTime;

    // 確定整體健康狀態
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

    // 記錄健康檢查結果
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

// 格式化運行時間
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
