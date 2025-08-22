const express = require('express');
const router = express.Router();
const { authenticateToken: protect } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const { validateInput } = require('../middleware/validation');

// å¾®æ??™ç›¸?œæ¨¡??const ServiceRegistry =
  require('../models/ServiceRegistry').getServiceRegistryModel();
const LoadBalancer = require('../models/LoadBalancer').getLoadBalancerModel();
const MessageQueue = require('../models/MessageQueue').getMessageQueueModel();
const Trace = require('../models/Trace').getTraceModel();

// ?å?è¨»å?
router.post('/register', protect, async (req, res) => {
  try {
    const { registration, config } = req.body;

    logger.info('?? è¨»å?å¾®æ???, { serviceName: registration.serviceName });

    // ?Ÿæ??å?ID
// eslint-disable-next-line no-unused-vars
    const serviceId = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ?µå»º?å?è¨»å?è¨˜é?
// eslint-disable-next-line no-unused-vars
    const serviceRegistry = await ServiceRegistry.create({
      serviceId,
      serviceName: registration.serviceName,
      version: registration.version,
      status: 'starting',
      endpoints: registration.endpoints,
      metadata: registration.metadata,
      config: config || {},
      registeredAt: new Date(),
      lastHeartbeat: new Date(),
    });

    // ?µå»ºè² è??‡è¡¡?¨è???    await LoadBalancer.create({
      serviceId,
      serviceName: registration.serviceName,
      status: 'healthy',
      requestCount: 0,
      responseTime: 0,
      errorCount: 0,
      weight: 1,
      algorithm: 'round_robin',
    });

    logger.info('??å¾®æ??™è¨»?Šæ???, {
      serviceId,
      serviceName: registration.serviceName,
    });

    res.status(201).json({
      success: true,
      serviceId,
      message: 'Service registered successfully',
    });
  } catch (error) {
    logger.error('??å¾®æ??™è¨»?Šå¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to register service',
      error: error.message,
    });
  }
});

// ?å?è¨»éŠ·
router.delete('/deregister/:serviceId', protect, async (req, res) => {
  try {
    const { serviceId } = req.params;

    logger.info('?? è¨»éŠ·å¾®æ???, { serviceId });

    // ?ªé™¤?å?è¨»å?è¨˜é?
    await ServiceRegistry.destroy({
      where: { serviceId },
    });

    // ?ªé™¤è² è??‡è¡¡?¨è???    await LoadBalancer.destroy({
      where: { serviceId },
    });

    logger.info('??å¾®æ??™è¨»?·æ???, { serviceId });

    res.json({
      success: true,
      message: 'Service deregistered successfully',
    });
  } catch (error) {
    logger.error('??å¾®æ??™è¨»?·å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to deregister service',
      error: error.message,
    });
  }
});

// ?²å??å??—è¡¨
router.get('/services', protect, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const services = await ServiceRegistry.findAll({
      include: [
        {
          model: LoadBalancer,
          as: 'loadBalancer',
        },
      ],
      order: [['registeredAt', 'DESC']],
    });

// eslint-disable-next-line no-unused-vars
    const serviceList = services.map((service) => ({
      serviceId: service.serviceId,
      serviceName: service.serviceName,
      version: service.version,
      status: service.status,
      endpoints: service.endpoints,
      metadata: service.metadata,
      health: {
        lastCheck: service.lastHeartbeat,
        responseTime: service.loadBalancer?.responseTime || 0,
        errorCount: service.loadBalancer?.errorCount || 0,
        successRate: service.loadBalancer
          ? ((service.loadBalancer.requestCount -
              service.loadBalancer.errorCount) /
              service.loadBalancer.requestCount) *
            100
          : 100,
      },
      load: {
        cpuUsage: 0, // ?€è¦å???Ž§ç³»çµ±?²å?
        memoryUsage: 0,
        activeConnections: 0,
        requestRate: service.loadBalancer?.requestCount || 0,
      },
    }));

    res.json(serviceList);
  } catch (error) {
    logger.error('???²å??å??—è¡¨å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get service list',
      error: error.message,
    });
  }
});

// ?¥åº·æª¢æŸ¥
router.get('/health/:serviceId', protect, async (req, res) => {
  try {
    const { serviceId } = req.params;

// eslint-disable-next-line no-unused-vars
    const service = await ServiceRegistry.findOne({
      where: { serviceId },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
      });
    }

    // ?´æ–°?€å¾Œå?è·³æ???    await service.update({
      lastHeartbeat: new Date(),
    });

    res.json({
      success: true,
      status: 'healthy',
      serviceId,
      lastHeartbeat: service.lastHeartbeat,
    });
  } catch (error) {
    logger.error('???¥åº·æª¢æŸ¥å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message,
    });
  }
});

// è² è??‡è¡¡?¨ç???router.get('/loadbalancer/status', protect, async (req, res) => {
  try {
    const loadBalancers = await LoadBalancer.findAll({
      include: [
        {
          model: ServiceRegistry,
          as: 'service',
        },
      ],
    });

    const totalServices = loadBalancers.length;
    const healthyServices = loadBalancers.filter(
      (lb) => lb.status === 'healthy'
    ).length;
    const unhealthyServices = totalServices - healthyServices;

    const totalRequests = loadBalancers.reduce(
      (sum, lb) => sum + lb.requestCount,
      0
    );
    const totalResponseTime = loadBalancers.reduce(
      (sum, lb) => sum + lb.responseTime,
      0
    );
    const averageResponseTime =
      totalRequests > 0 ? totalResponseTime / totalRequests : 0;

    const totalErrors = loadBalancers.reduce(
      (sum, lb) => sum + lb.errorCount,
      0
    );
// eslint-disable-next-line no-unused-vars
    const errorRate =
      totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

// eslint-disable-next-line no-unused-vars
    const status = {
      algorithm: 'round_robin', // ?¯é?ç½?      totalServices,
      healthyServices,
      unhealthyServices,
      totalRequests,
      averageResponseTime,
      errorRate,
      services: loadBalancers.map((lb) => ({
        serviceId: lb.serviceId,
        serviceName: lb.serviceName,
        status: lb.status,
        requestCount: lb.requestCount,
        responseTime: lb.responseTime,
        errorCount: lb.errorCount,
        weight: lb.weight,
      })),
    };

    res.json(status);
  } catch (error) {
    logger.error('???²å?è² è??‡è¡¡?¨ç??‹å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get load balancer status',
      error: error.message,
    });
  }
});

// æ¶ˆæ¯?Šå??€??router.get('/messagequeue/status', protect, async (req, res) => {
  try {
    const queues = await MessageQueue.findAll({
      order: [['createdAt', 'DESC']],
    });

    const totalQueues = queues.length;
    const totalMessages = queues.reduce(
      (sum, queue) => sum + queue.messageCount,
      0
    );
    const processedMessages = queues.reduce(
      (sum, queue) => sum + queue.processedCount,
      0
    );
    const failedMessages = queues.reduce(
      (sum, queue) => sum + queue.failedCount,
      0
    );
    const deadLetterMessages = queues.reduce(
      (sum, queue) => sum + queue.deadLetterCount,
      0
    );

// eslint-disable-next-line no-unused-vars
    const status = {
      totalQueues,
      totalMessages,
      processedMessages,
      failedMessages,
      deadLetterMessages,
      queues: queues.map((queue) => ({
        name: queue.queueName,
        messageCount: queue.messageCount,
        consumerCount: queue.consumerCount,
        processingRate: queue.processingRate,
        errorRate: queue.errorRate,
      })),
    };

    res.json(status);
  } catch (error) {
    logger.error('???²å?æ¶ˆæ¯?Šå??€?‹å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get message queue status',
      error: error.message,
    });
  }
});

// ?¼é€æ??¯åˆ°?Šå?
router.post('/messagequeue/send', protect, async (req, res) => {
  try {
    const { queueName, message, options } = req.body;

    logger.info('?? ?¼é€æ??¯åˆ°?Šå?', { queueName, messageId: message.id });

    // ?¥æ‰¾?–å‰µå»ºé???    let queue = await MessageQueue.findOne({
      where: { queueName },
    });

    if (!queue) {
      queue = await MessageQueue.create({
        queueName,
        messageCount: 0,
        processedCount: 0,
        failedCount: 0,
        deadLetterCount: 0,
        consumerCount: 0,
        processingRate: 0,
        errorRate: 0,
      });
    }

    // ?´æ–°?Šå?çµ±è?
    await queue.update({
      messageCount: queue.messageCount + 1,
    });

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('??æ¶ˆæ¯?¼é€æ???, { messageId, queueName });

    res.json({
      success: true,
      messageId,
      queueName,
    });
  } catch (error) {
    logger.error('???¼é€æ??¯å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
});

// ?µå»ºè¿½è¹¤
router.post('/tracing/create', protect, async (req, res) => {
  try {
    const { operationName, serviceName } = req.body;

    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const spanId = `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const trace = await Trace.create({
      traceId,
      spanId,
      serviceName,
      operationName,
      startTime: new Date(),
      status: 'success',
      tags: {},
      logs: [],
    });

    logger.info('???µå»ºè¿½è¹¤?å?', { traceId, operationName });

    res.json({
      traceId,
      spanId,
      serviceName,
      operationName,
      startTime: trace.startTime,
      status: 'success',
      tags: {},
      logs: [],
    });
  } catch (error) {
    logger.error('???µå»ºè¿½è¹¤å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to create trace',
      error: error.message,
    });
  }
});

// æ·»å?è¿½è¹¤?¥è?
router.post('/tracing/log', protect, async (req, res) => {
  try {
    const { traceId, level, message, fields, timestamp } = req.body;

    const trace = await Trace.findOne({
      where: { traceId },
    });

    if (!trace) {
      return res.status(404).json({
        success: false,
        message: 'Trace not found',
      });
    }

// eslint-disable-next-line no-unused-vars
    const logs = trace.logs || [];
    logs.push({
      timestamp: timestamp || new Date().toISOString(),
      level,
      message,
      fields: fields || {},
    });

    await trace.update({
      logs,
    });

    logger.info('??è¿½è¹¤?¥è?å·²æ·»??, { traceId, level, message });

    res.json({
      success: true,
      message: 'Log added successfully',
    });
  } catch (error) {
    logger.error('??æ·»å?è¿½è¹¤?¥è?å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to add trace log',
      error: error.message,
    });
  }
});

// å®Œæ?è¿½è¹¤
router.post('/tracing/complete', protect, async (req, res) => {
  try {
    const { traceId, status, endTime } = req.body;

    const trace = await Trace.findOne({
      where: { traceId },
    });

    if (!trace) {
      return res.status(404).json({
        success: false,
        message: 'Trace not found',
      });
    }

    const duration = endTime
      ? new Date(endTime).getTime() - trace.startTime.getTime()
      : null;

    await trace.update({
      status,
      endTime: endTime ? new Date(endTime) : new Date(),
      duration,
    });

    logger.info('??è¿½è¹¤å®Œæ?', { traceId, status, duration });

    res.json({
      success: true,
      message: 'Trace completed successfully',
    });
  } catch (error) {
    logger.error('??å®Œæ?è¿½è¹¤å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to complete trace',
      error: error.message,
    });
  }
});

// ?²å??å??‡æ?
router.get('/metrics/:serviceId', protect, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { timeRange = '24h' } = req.query;

    // ?™è£¡?‰è©²å¾žç›£?§ç³»çµ±ç²?–å¯¦?›æ?æ¨?    // ?®å?è¿”å?æ¨¡æ“¬?¸æ?
// eslint-disable-next-line no-unused-vars
    const now = new Date();
    const timestamps = [];
    const cpuUsage = [];
    const memoryUsage = [];
// eslint-disable-next-line no-unused-vars
    const requestRate = [];
// eslint-disable-next-line no-unused-vars
    const errorRate = [];
// eslint-disable-next-line no-unused-vars
    const responseTime = [];

    // ?Ÿæ??‚é?åºå??¸æ?
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      timestamps.push(time.toISOString());
      cpuUsage.push(Math.random() * 100);
      memoryUsage.push(Math.random() * 100);
      requestRate.push(Math.random() * 1000);
      errorRate.push(Math.random() * 10);
      responseTime.push(Math.random() * 1000);
    }

    res.json({
      cpuUsage,
      memoryUsage,
      requestRate,
      errorRate,
      responseTime,
      timestamps,
    });
  } catch (error) {
    logger.error('???²å??å??‡æ?å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get service metrics',
      error: error.message,
    });
  }
});

// ?´æ–°è² è??‡è¡¡?¨é?ç½?router.put('/loadbalancer/config', protect, async (req, res) => {
  try {
    const { algorithm, weights } = req.body;

    if (weights) {
      for (const [serviceId, weight] of Object.entries(weights)) {
        await LoadBalancer.update({ weight }, { where: { serviceId } });
      }
    }

    logger.info('??è² è??‡è¡¡?¨é?ç½®å·²?´æ–°', { algorithm, weights });

    res.json({
      success: true,
      message: 'Load balancer configuration updated successfully',
    });
  } catch (error) {
    logger.error('???´æ–°è² è??‡è¡¡?¨é?ç½®å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update load balancer configuration',
      error: error.message,
    });
  }
});

// æ¸…ç??Žæ?è¿½è¹¤
router.delete('/tracing/cleanup', protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const deletedCount = await Trace.destroy({
      where: {
        startTime: {
          [require('sequelize').Op.lt]: cutoffDate,
        },
      },
    });

    logger.info('??æ¸…ç??Žæ?è¿½è¹¤å®Œæ?', { deletedCount, days });

    res.json({
      success: true,
      message: 'Trace cleanup completed successfully',
      deletedCount,
    });
  } catch (error) {
    logger.error('??æ¸…ç??Žæ?è¿½è¹¤å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup traces',
      error: error.message,
    });
  }
});

module.exports = router;
