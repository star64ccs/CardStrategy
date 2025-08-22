module.exports = {
  performance: {
    enabled: true,
    interval: 30000,
    metrics: ['cpu', 'memory', 'response_time'],
  },
  error: {
    enabled: true,
    maxErrors: 1000,
    alertThreshold: 10,
  },
  health: {
    enabled: true,
    interval: 60000,
    endpoints: ['/health', '/api/health'],
  },
};
