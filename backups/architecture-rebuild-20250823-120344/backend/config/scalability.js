module.exports = {
  multiTenancy: {
    enabled: false,
    isolation: 'database', // database, schema, row
    tenantIdentifier: 'tenant_id',
  },
  horizontalScaling: {
    enabled: true,
    loadBalancing: true,
    autoScaling: true,
    serviceDiscovery: true,
  },
  verticalScaling: {
    enabled: true,
    resourceOptimization: true,
    connectionPooling: true,
  },
  caching: {
    enabled: true,
    strategy: 'multi-tier', // single, multi-tier, distributed
    layers: ['memory', 'redis', 'database'],
  },
  database: {
    readReplicas: true,
    sharding: false,
    partitioning: true,
  },
  performance: {
    compression: true,
    optimization: true,
    monitoring: true,
  },
};
