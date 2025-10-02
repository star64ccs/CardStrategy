#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const path = require('path');

// 顏色Output
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const log = {
  info: (msg) => {
    /* */
  },
  success: (msg) => {
    /* */
  },
  warning: (msg) => {
    /* */
  },
  error: (msg) => {
    /* */
  },
  header: (msg) => {
    /* */
  },
};

class Phase3MonitoringOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.backendDir = path.join(this.projectRoot, 'backend');
  }

  // Create性能Monitor系統
  async createPerformanceMonitoringSystem() {
    log.header('📊 創建性能監控系統');

    const monitoringSystem = `const os = require('os');
const { performance } = require('perf_hooks');
const { logger } = require('./unified-logger');

// 性能指標收集器
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        error: 0,
        avgResponseTime: 0
      },
      memory: {
        used: 0,
        total: 0,
        percentage: 0
      },
      cpu: {
        usage: 0,
        loadAverage: []
      },
      uptime: {
        startTime: Date.now(),
        current: 0
      }
    };

    this.responseTimes = [];
    this.maxResponseTimes = 100; // 保留最近100個ResponseTime

    // 定期Update系統指標
    this.startPeriodicUpdate();
  }

  // Begin定期Update
  startPeriodicUpdate() {
    setInterval(() => {
      this.updateSystemMetrics();
    }, 5000); // 每5SecondUpdate一次

    setInterval(() => {
      this.updateUptime();
    }, 1000); // 每SecondUpdate運RowTime
  }

  // Update系統指標
  updateSystemMetrics() {
    // Memory使用情況
    const memUsage = process.memoryUsage();
    this.metrics.memory.used = Math.round(memUsage.heapUsed / 1024 / 1024);
    this.metrics.memory.total = Math.round(memUsage.heapTotal / 1024 / 1024);
    this.metrics.memory.percentage = Math.round((this.metrics.memory.used / this.metrics.memory.total) * 100);

    // CPU 使用情況
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    this.metrics.cpu.usage = Math.round(100 - (100 * idle / total));

    // 系統負載
    this.metrics.cpu.loadAverage = os.loadavg();

    // Record系統指標
    logger.info('System Metrics Updated', {
      memory: this.metrics.memory,
      cpu: this.metrics.cpu
    });
  }

  // Update運RowTime
  updateUptime() {
    this.metrics.uptime.current = Date.now() - this.metrics.uptime.startTime;
  }

  // RecordRequest
  recordRequest(success = true, responseTime = 0) {
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.error++;
    }

    // RecordResponseTime
    if (responseTime > 0) {
      this.responseTimes.push(responseTime);
      
      // 保持ResponseTimeArray大小
      if (this.responseTimes.length > this.maxResponseTimes) {
        this.responseTimes.shift();
      }

      // 計算平均ResponseTime
      this.metrics.requests.avgResponseTime = Math.round(
        this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
      );
    }
  }

  // Get性能指標
  getMetrics() {
    return {
      ...this.metrics,
      responseTimes: {
        count: this.responseTimes.length,
        average: this.metrics.requests.avgResponseTime,
        min: this.responseTimes.length > 0 ? Math.min(...this.responseTimes) : 0,
        max: this.responseTimes.length > 0 ? Math.max(...this.responseTimes) : 0,
        p95: this.calculatePercentile(95),
        p99: this.calculatePercentile(99)
      }
    };
  }

  // 計算百分位數
  calculatePercentile(percentile) {
    if (this.responseTimes.length === 0) return 0;
    
    const sorted = [...this.responseTimes].sort((a, b) => a - b);
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  // Reset指標
  resetMetrics() {
    this.metrics.requests = {
      total: 0,
      success: 0,
      error: 0,
      avgResponseTime: 0
    };
    this.responseTimes = [];
    logger.info('Performance metrics reset');
  }
}

// CreateGlobalMonitorInstance
const performanceMonitor = new PerformanceMonitor();

// 性能Monitor中間件
const performanceMiddleware = (req, res, next) => {
  const start = performance.now();
  
  // RecordResponseComplete
  res.on('finish', () => {
    const duration = performance.now() - start;
    const success = res.statusCode < 400;
    
    performanceMonitor.recordRequest(success, duration);
    
    // Record慢Request
    if (duration > 1000) {
      logger.warn('Slow Request Detected', {
        method: req.method,
        url: req.url,
        duration: Math.round(duration),
        statusCode: res.statusCode
      });
    }
  });

  next();
};

// 性能指標 API 路由
const getPerformanceMetrics = (req, res) => {
  try {
    const metrics = performanceMonitor.getMetrics();
    
    res.json({
      success: true,
      message: 'Performance metrics retrieved successfully',
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error.message
    });
  }
};

// Reset性能指標 API 路由
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
const resetPerformanceMetrics = (req, res) => {
  try {
    performanceMonitor.resetMetrics();
    
    res.json({
      success: true,
      message: 'Performance metrics reset successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error resetting performance metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset performance metrics',
      error: error.message
    });
  }
};

module.exports = {
  performanceMonitor,
  performanceMiddleware,
  getPerformanceMetrics,
  resetPerformanceMetrics
};
`;

    const monitoringPath = path.join(
      this.backendDir,
      'src/utils/performance-monitor.js'
    );
    fs.writeFileSync(monitoringPath, monitoringSystem);
    log.success('性能監控系統已創建');
  }

  // Create系統健康Check增強版
  async createEnhancedHealthCheck() {
    log.header('🏥 創建增強版健康檢查');

    const healthCheckContent = `const { performanceMonitor } = require('./performance-monitor');
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
// eslint-disable-next-line no-unused-vars
    const responseTime = Date.now() - startTime;
    
    // OK整體健康Status
    const isHealthy = dbStatus && redisStatus && responseTime < 1000;
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
// eslint-disable-next-line no-unused-vars
    const statusCode = isHealthy ? 200 : 503;
    
    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: \`\${responseTime}ms\`,
      services: {
        database: {
          status: dbStatus ? 'connected' : 'disconnected',
          responseTime: 'N/A'
        },
        redis: {
          status: redisStatus ? 'connected' : 'disconnected',
          responseTime: 'N/A'
        },
        api: {
          status: 'running',
          responseTime: \`\${responseTime}ms\`
        }
      },
      performance: {
        memory: metrics.memory,
        cpu: metrics.cpu,
        uptime: {
          seconds: Math.floor(metrics.uptime.current / 1000),
          formatted: formatUptime(metrics.uptime.current)
        }
      },
      requests: {
        total: metrics.requests.total,
        success: metrics.requests.success,
        error: metrics.requests.error,
        successRate: metrics.requests.total > 0 
          ? Math.round((metrics.requests.success / metrics.requests.total) * 100) 
          : 0
      }
    };

    // Record健康Check結果
    logger.info('Health Check', {
      status: healthData.status,
      responseTime,
      services: healthData.services
    });

    res.status(statusCode).json({
      success: isHealthy,
      message: isHealthy ? 'All services are healthy' : 'Some services are unhealthy',
      data: healthData
    });

  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
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
    return \`\${days}d \${hours % 24}h \${minutes % 60}m\`;
  } else if (hours > 0) {
    return \`\${hours}h \${minutes % 60}m\`;
  } else if (minutes > 0) {
    return \`\${minutes}m \${seconds % 60}s\`;
  } else {
    return \`\${seconds}s\`;
  }
};

module.exports = {
  enhancedHealthCheck
};
`;

    const healthCheckPath = path.join(
      this.backendDir,
      'src/utils/enhanced-health-check.js'
    );
    fs.writeFileSync(healthCheckPath, healthCheckContent);
    log.success('增強版健康檢查已創建');
  }

  // Create性能指標 API 路由
  async createPerformanceRoutes() {
    log.header('🔌 創建性能指標 API 路由');

    const routesContent = `const express = require('express');
const { getPerformanceMetrics, resetPerformanceMetrics } = require('../utils/performance-monitor');
const { enhancedHealthCheck } = require('../utils/enhanced-health-check');

const router = express.Router();

// Get性能指標
router.get('/metrics', getPerformanceMetrics);

// Reset性能指標
router.post('/metrics/reset', resetPerformanceMetrics);

// 增強版健康Check
router.get('/health', enhancedHealthCheck);

// 系統Information
router.get('/system', (req, res) => {
  const os = require('os');
  
  res.json({
    success: true,
    message: 'System information retrieved successfully',
    data: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024 / 1024),
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024)
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model
      },
      uptime: {
        system: Math.floor(os.uptime()),
        process: Math.floor(process.uptime())
      }
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
`;

    const routesPath = path.join(this.backendDir, 'src/routes/performance.js');
    fs.writeFileSync(routesPath, routesContent);
    log.success('性能指標 API 路由已創建');
  }

  // 生成MonitorReport
  generateReport() {
    log.header('📊 性能監控系統報告');

    const report = `
# 性能監控系統實現報告

## 🔧 創建的文件

### 1. 性能監控系統
- **文件**: \`src/utils/performance-monitor.js\`
- **功能**:
  - 實時性能指標收集
  - 內存和 CPU 監控
  - 響應時間分析
  - 請求統計
  - 百分位數計算

### 2. 增強版健康檢查
- **文件**: \`src/utils/enhanced-health-check.js\`
- **功能**:
  - 綜合服務健康檢查
  - 性能指標整合
  - 詳細狀態報告
  - 運行時間格式化

### 3. 性能指標 API 路由
- **文件**: \`src/routes/performance.js\`
- **端點**:
  - \`GET /api/performance/metrics\` - 獲取性能指標
  - \`POST /api/performance/metrics/reset\` - 重置指標
  - \`GET /api/performance/health\` - 增強版健康檢查
  - \`GET /api/performance/system\` - 系統信息

## 📈 監控指標

### 請求指標
- 總請求數
- 成功/失敗請求數
- 平均響應時間
- 95th 和 99th 百分位數
- 慢請求檢測 (>1秒)

### 系統指標
- 內存使用情況
- CPU 使用率
- 系統負載
- 運行時間

### 服務指標
- 數據庫連接狀態
- Redis 連接狀態
- API 響應時間

## 🎯 使用方式

### 1. 在服務器中集成
\`\`\`javascript
const { performanceMiddleware } = require('./utils/performance-monitor');
const performanceRoutes = require('./routes/performance');

// Add性能Monitor中間件
app.use(performanceMiddleware);

// Add性能指標路由
app.use('/api/performance', performanceRoutes);
\`\`\`

### 2. 查看性能指標
\`\`\`bash
# 獲取性能指標
curl http://localhost:3000/api/performance/metrics

# 查看健康狀態
curl http://localhost:3000/api/performance/health

# 查看系統信息
curl http://localhost:3000/api/performance/system
\`\`\`

## 📊 預期效果

### 性能提升
- 實時監控系統性能
- 快速識別性能瓶頸
- 自動檢測慢請求
- 系統資源使用優化

### 可觀測性
- 詳細的性能指標
- 歷史數據分析
- 異常情況告警
- 系統健康狀態

### 運維支持
- 快速故障診斷
- 性能基準建立
- 容量規劃支持
- 系統優化指導

## 🔄 下一步

1. **集成到統一服務器**
   - 在 \`server-unified.js\` 中添加監控中間件
   - 配置性能指標路由
   - 測試監控功能

2. **安全中間件實現**
   - 速率限制
   - 輸入驗證
   - 安全頭配置

3. **錯誤處理系統**
   - 統一錯誤處理
   - 自定義錯誤類
   - 優雅關閉機制
`;

    const reportPath = path.join(
      this.projectRoot,
      'PERFORMANCE_MONITORING_REPORT.md'
    );
    fs.writeFileSync(reportPath, report);
    log.success(`監控報告已生成: ${reportPath}`);
  }

  // 執Row所有優化
  async run() {
    log.header('🚀 開始第三階段性能監控優化');

    try {
      await this.createPerformanceMonitoringSystem();
      await this.createEnhancedHealthCheck();
      await this.createPerformanceRoutes();
      this.generateReport();

      log.header('🎉 第三階段性能監控優化完成！');
      log.success('性能監控系統已創建完成');
      log.success('請查看 PERFORMANCE_MONITORING_REPORT.md 了解詳細信息');
    } catch (error) {
      log.error(`優化過程中發生Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// 執Row優化
if (require.main === module) {
  const optimizer = new Phase3MonitoringOptimizer();
  optimizer.run();
}

module.exports = Phase3MonitoringOptimizer;
