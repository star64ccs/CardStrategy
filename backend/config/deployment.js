module.exports = {
  environments: {
    development: {
      port: 3000,
      database: 'cardstrategy_dev',
      redis: 'localhost:6379',
    },
    staging: {
      port: process.env.PORT || 3000,
      database: process.env.DB_NAME || 'cardstrategy_staging',
      redis: process.env.REDIS_URL || 'localhost:6379',
    },
    production: {
      port: process.env.PORT || 3000,
      database: process.env.DB_NAME || 'cardstrategy_prod',
      redis: process.env.REDIS_URL || 'localhost:6379',
    },
  },
  ci: {
    automated: true,
    testing: true,
    security: true,
  },
  monitoring: {
    healthChecks: true,
    logging: true,
    alerts: true,
  },
};
