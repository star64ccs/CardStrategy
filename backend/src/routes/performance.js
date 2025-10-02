const express = require('express');
const {
  getPerformanceMetrics,
  resetPerformanceMetrics,
} = require('../utils/performance-monitor');
const { enhancedHealthCheck } = require('../utils/enhanced-health-check');

const router = express.Router();

// ?��??�能?��?
router.get('/metrics', getPerformanceMetrics);

// ?�置?�能?��?
router.post('/metrics/reset', resetPerformanceMetrics);

// 增強?�健康檢??router.get('/health', enhancedHealthCheck);

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
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024),
      },
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0].model,
      },
      uptime: {
        system: Math.floor(os.uptime()),
        process: Math.floor(process.uptime()),
      },
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
