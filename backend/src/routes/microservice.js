const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const logger = require('../utils/logger');
const { validateInput } = require('../middleware/validation');

// 微服務相關模型
const ServiceRegistry = require('../models/ServiceRegistry').getServiceRegistryModel();
const LoadBalancer = require('../models/LoadBalancer').getLoadBalancerModel();
const MessageQueue = require('../models/MessageQueue').getMessageQueueModel();
const Trace = require('../models/Trace').getTraceModel();

// 服務註冊
router.post('/register', protect, async (req, res) => {
  try {
    const { registration, config } = req.body;
    
    logger.info('🔄 註冊微服務', { serviceName: registration.serviceName });

    // 生成服務ID
    const serviceId = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 創建服務註冊記錄
    const serviceRegistry = await ServiceRegistry.create({
      serviceId,
      serviceName: registration.serviceName,
      version: registration.version,
      status: 'starting',
      endpoints: registration.endpoints,
      metadata: registration.metadata,
      config: config || {},
      registeredAt: new Date(),
      lastHeartbeat: new Date()
    });

    // 創建負載均衡器記錄
    await LoadBalancer.create({
      serviceId,
      serviceName: registration.serviceName,
      status: 'healthy',
      requestCount: 0,
      responseTime: 0,
      errorCount: 0,
      weight: 1,
      algorithm: 'round_robin'
    });

    logger.info('✅ 微服務註冊成功', { serviceId, serviceName: registration.serviceName });

    res.status(201).json({
      success: true,
      serviceId,
      message: 'Service registered successfully'
    });
  } catch (error) {
    logger.error('❌ 微服務註冊失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to register service',
      error: error.message
    });
  }
});

// 服務註銷
router.delete('/deregister/:serviceId', protect, async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    logger.info('🔄 註銷微服務', { serviceId });

    // 刪除服務註冊記錄
    await ServiceRegistry.destroy({
      where: { serviceId }
    });

    // 刪除負載均衡器記錄
    await LoadBalancer.destroy({
      where: { serviceId }
    });

    logger.info('✅ 微服務註銷成功', { serviceId });

    res.json({
      success: true,
      message: 'Service deregistered successfully'
    });
  } catch (error) {
    logger.error('❌ 微服務註銷失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to deregister service',
      error: error.message
    });
  }
});

// 獲取服務列表
router.get('/services', protect, async (req, res) => {
  try {
    const services = await ServiceRegistry.findAll({
      include: [{
        model: LoadBalancer,
        as: 'loadBalancer'
      }],
      order: [['registeredAt', 'DESC']]
    });

    const serviceList = services.map(service => ({
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
        successRate: service.loadBalancer ? 
          ((service.loadBalancer.requestCount - service.loadBalancer.errorCount) / service.loadBalancer.requestCount * 100) : 100
      },
      load: {
        cpuUsage: 0, // 需要從監控系統獲取
        memoryUsage: 0,
        activeConnections: 0,
        requestRate: service.loadBalancer?.requestCount || 0
      }
    }));

    res.json(serviceList);
  } catch (error) {
    logger.error('❌ 獲取服務列表失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get service list',
      error: error.message
    });
  }
});

// 健康檢查
router.get('/health/:serviceId', protect, async (req, res) => {
  try {
    const { serviceId } = req.params;
    
    const service = await ServiceRegistry.findOne({
      where: { serviceId }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // 更新最後心跳時間
    await service.update({
      lastHeartbeat: new Date()
    });

    res.json({
      success: true,
      status: 'healthy',
      serviceId,
      lastHeartbeat: service.lastHeartbeat
    });
  } catch (error) {
    logger.error('❌ 健康檢查失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// 負載均衡器狀態
router.get('/loadbalancer/status', protect, async (req, res) => {
  try {
    const loadBalancers = await LoadBalancer.findAll({
      include: [{
        model: ServiceRegistry,
        as: 'service'
      }]
    });

    const totalServices = loadBalancers.length;
    const healthyServices = loadBalancers.filter(lb => lb.status === 'healthy').length;
    const unhealthyServices = totalServices - healthyServices;
    
    const totalRequests = loadBalancers.reduce((sum, lb) => sum + lb.requestCount, 0);
    const totalResponseTime = loadBalancers.reduce((sum, lb) => sum + lb.responseTime, 0);
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    
    const totalErrors = loadBalancers.reduce((sum, lb) => sum + lb.errorCount, 0);
    const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

    const status = {
      algorithm: 'round_robin', // 可配置
      totalServices,
      healthyServices,
      unhealthyServices,
      totalRequests,
      averageResponseTime,
      errorRate,
      services: loadBalancers.map(lb => ({
        serviceId: lb.serviceId,
        serviceName: lb.serviceName,
        status: lb.status,
        requestCount: lb.requestCount,
        responseTime: lb.responseTime,
        errorCount: lb.errorCount,
        weight: lb.weight
      }))
    };

    res.json(status);
  } catch (error) {
    logger.error('❌ 獲取負載均衡器狀態失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get load balancer status',
      error: error.message
    });
  }
});

// 消息隊列狀態
router.get('/messagequeue/status', protect, async (req, res) => {
  try {
    const queues = await MessageQueue.findAll({
      order: [['createdAt', 'DESC']]
    });

    const totalQueues = queues.length;
    const totalMessages = queues.reduce((sum, queue) => sum + queue.messageCount, 0);
    const processedMessages = queues.reduce((sum, queue) => sum + queue.processedCount, 0);
    const failedMessages = queues.reduce((sum, queue) => sum + queue.failedCount, 0);
    const deadLetterMessages = queues.reduce((sum, queue) => sum + queue.deadLetterCount, 0);

    const status = {
      totalQueues,
      totalMessages,
      processedMessages,
      failedMessages,
      deadLetterMessages,
      queues: queues.map(queue => ({
        name: queue.queueName,
        messageCount: queue.messageCount,
        consumerCount: queue.consumerCount,
        processingRate: queue.processingRate,
        errorRate: queue.errorRate
      }))
    };

    res.json(status);
  } catch (error) {
    logger.error('❌ 獲取消息隊列狀態失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get message queue status',
      error: error.message
    });
  }
});

// 發送消息到隊列
router.post('/messagequeue/send', protect, async (req, res) => {
  try {
    const { queueName, message, options } = req.body;
    
    logger.info('🔄 發送消息到隊列', { queueName, messageId: message.id });

    // 查找或創建隊列
    let queue = await MessageQueue.findOne({
      where: { queueName }
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
        errorRate: 0
      });
    }

    // 更新隊列統計
    await queue.update({
      messageCount: queue.messageCount + 1
    });

    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('✅ 消息發送成功', { messageId, queueName });

    res.json({
      success: true,
      messageId,
      queueName
    });
  } catch (error) {
    logger.error('❌ 發送消息失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// 創建追蹤
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
      logs: []
    });

    logger.info('✅ 創建追蹤成功', { traceId, operationName });

    res.json({
      traceId,
      spanId,
      serviceName,
      operationName,
      startTime: trace.startTime,
      status: 'success',
      tags: {},
      logs: []
    });
  } catch (error) {
    logger.error('❌ 創建追蹤失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to create trace',
      error: error.message
    });
  }
});

// 添加追蹤日誌
router.post('/tracing/log', protect, async (req, res) => {
  try {
    const { traceId, level, message, fields, timestamp } = req.body;
    
    const trace = await Trace.findOne({
      where: { traceId }
    });

    if (!trace) {
      return res.status(404).json({
        success: false,
        message: 'Trace not found'
      });
    }

    const logs = trace.logs || [];
    logs.push({
      timestamp: timestamp || new Date().toISOString(),
      level,
      message,
      fields: fields || {}
    });

    await trace.update({
      logs
    });

    logger.info('✅ 追蹤日誌已添加', { traceId, level, message });

    res.json({
      success: true,
      message: 'Log added successfully'
    });
  } catch (error) {
    logger.error('❌ 添加追蹤日誌失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to add trace log',
      error: error.message
    });
  }
});

// 完成追蹤
router.post('/tracing/complete', protect, async (req, res) => {
  try {
    const { traceId, status, endTime } = req.body;
    
    const trace = await Trace.findOne({
      where: { traceId }
    });

    if (!trace) {
      return res.status(404).json({
        success: false,
        message: 'Trace not found'
      });
    }

    const duration = endTime ? new Date(endTime).getTime() - trace.startTime.getTime() : null;

    await trace.update({
      status,
      endTime: endTime ? new Date(endTime) : new Date(),
      duration
    });

    logger.info('✅ 追蹤完成', { traceId, status, duration });

    res.json({
      success: true,
      message: 'Trace completed successfully'
    });
  } catch (error) {
    logger.error('❌ 完成追蹤失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to complete trace',
      error: error.message
    });
  }
});

// 獲取服務指標
router.get('/metrics/:serviceId', protect, async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { timeRange = '24h' } = req.query;
    
    // 這裡應該從監控系統獲取實際指標
    // 目前返回模擬數據
    const now = new Date();
    const timestamps = [];
    const cpuUsage = [];
    const memoryUsage = [];
    const requestRate = [];
    const errorRate = [];
    const responseTime = [];

    // 生成時間序列數據
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
      timestamps
    });
  } catch (error) {
    logger.error('❌ 獲取服務指標失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get service metrics',
      error: error.message
    });
  }
});

// 更新負載均衡器配置
router.put('/loadbalancer/config', protect, async (req, res) => {
  try {
    const { algorithm, weights } = req.body;
    
    if (weights) {
      for (const [serviceId, weight] of Object.entries(weights)) {
        await LoadBalancer.update(
          { weight },
          { where: { serviceId } }
        );
      }
    }

    logger.info('✅ 負載均衡器配置已更新', { algorithm, weights });

    res.json({
      success: true,
      message: 'Load balancer configuration updated successfully'
    });
  } catch (error) {
    logger.error('❌ 更新負載均衡器配置失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update load balancer configuration',
      error: error.message
    });
  }
});

// 清理過期追蹤
router.delete('/tracing/cleanup', protect, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

    const deletedCount = await Trace.destroy({
      where: {
        startTime: {
          [require('sequelize').Op.lt]: cutoffDate
        }
      }
    });

    logger.info('✅ 清理過期追蹤完成', { deletedCount, days });

    res.json({
      success: true,
      message: 'Trace cleanup completed successfully',
      deletedCount
    });
  } catch (error) {
    logger.error('❌ 清理過期追蹤失敗', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup traces',
      error: error.message
    });
  }
});

module.exports = router;
