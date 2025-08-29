module.exports = {
  api: {
    versioning: true,
    documentation: true,
    rateLimiting: true,
  },
  authentication: {
    jwt: true,
    oauth: false,
    session: false,
  },
  database: {
    connectionPooling: true,
    queryOptimization: true,
    caching: true,
  },
  monitoring: {
    performance: true,
    errors: true,
    health: true,
  },
};
