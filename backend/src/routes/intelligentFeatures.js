const express = require('express');
const router = express.Router();
const { authenticateToken: protect } = require('../middleware/auth');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const { validateInput } = require('../middleware/validation');

// ?ºèƒ½?–ç‰¹?§ç›¸?œæ¨¡??const AutomationDecision =
  require('../models/AutomationDecision').getAutomationDecisionModel();
const MaintenancePrediction =
  require('../models/MaintenancePrediction').getMaintenancePredictionModel();
const IntelligentOpsOperation =
  require('../models/IntelligentOpsOperation').getIntelligentOpsOperationModel();
const SystemHealthAssessment =
  require('../models/SystemHealthAssessment').getSystemHealthAssessmentModel();
const AutomationRule =
  require('../models/AutomationRule').getAutomationRuleModel();

// ?ªå??–æ±ºç­–è§¸??router.post('/automation/trigger', protect, async (req, res) => {
  try {
    const { type, metrics, severity } = req.body;

    logger.info('?? è§¸ç™¼?ªå??–æ±ºç­?, { type, severity });

    // ?Ÿæ?æ±ºç?ID
    const decisionId = `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ?¹æ?è§¸ç™¼é¡žå??Ÿæ?æ±ºç?
    let action = '';
    let reason = '';
    let confidence = 0.8;

    switch (type) {
      case 'performance_degradation':
        action = 'scale_up_instances';
        reason = 'æª¢æ¸¬?°æ€§èƒ½ä¸‹é?ï¼Œè‡ª?•æ“´å±•å¯¦ä¾?;
        confidence = 0.85;
        break;
      case 'high_load':
        action = 'enable_load_balancing';
        reason = 'æª¢æ¸¬?°é?è² è?ï¼Œå??¨è?è¼‰å?è¡?;
        confidence = 0.9;
        break;
      case 'error_spike':
        action = 'restart_service';
        reason = 'æª¢æ¸¬?°éŒ¯èª¤æ?å¢žï??å??å?';
        confidence = 0.75;
        break;
      case 'resource_exhaustion':
        action = 'optimize_resources';
        reason = 'æª¢æ¸¬?°è?æºè€—ç›¡ï¼Œå„ª?–è?æºå???;
        confidence = 0.8;
        break;
      default:
        action = 'monitor_closely';
        reason = '?ªçŸ¥è§¸ç™¼é¡žå?ï¼Œå??‡ç›£??;
        confidence = 0.6;
    }

    // ?µå»º?ªå??–æ±ºç­–è???    const decision = await AutomationDecision.create({
      decisionId,
      timestamp: new Date(),
      type: 'scaling',
      action,
      reason,
      confidence,
      impact: severity,
      status: 'pending',
      metrics: {
        before: metrics,
        after: {},
      },
    });

    logger.info('???ªå??–æ±ºç­–å·²?µå»º', { decisionId, action });

    res.status(201).json(decision);
  } catch (error) {
    logger.error('??è§¸ç™¼?ªå??–æ±ºç­–å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to trigger automation decision',
      error: error.message,
    });
  }
});

// ?²å??ªå??–æ±ºç­–æ­·??router.get('/automation/history', protect, async (req, res) => {
  try {
    const { timeRange, type } = req.query;

    const whereClause = {};
    if (type) {
      whereClause.type = type;
    }

    // ?¹æ??‚é?ç¯„å??Žæ¿¾
    if (timeRange) {
// eslint-disable-next-line no-unused-vars
      const now = new Date();
      let startTime;

      switch (timeRange) {
        case '1h':
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '6h':
          startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case '24h':
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      whereClause.timestamp = {
        [require('sequelize').Op.gte]: startTime,
      };
    }

    const decisions = await AutomationDecision.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
    });

    res.json(decisions);
  } catch (error) {
    logger.error('???²å??ªå??–æ±ºç­–æ­·?²å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get automation history',
      error: error.message,
    });
  }
});

// ?·è??ªå??–æ±ºç­?router.post('/automation/:decisionId/execute', protect, async (req, res) => {
  try {
    const { decisionId } = req.params;

    const decision = await AutomationDecision.findOne({
      where: { decisionId },
    });

    if (!decision) {
      return res.status(404).json({
        success: false,
        message: 'Decision not found',
      });
    }

    // ?´æ–°æ±ºç??€??    await decision.update({
      status: 'executing',
      executionTime: Date.now(),
    });

    // æ¨¡æ“¬?·è?æ±ºç?
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 2000)); // æ¨¡æ“¬?·è??‚é?
    const executionTime = Date.now() - startTime;

    // ?´æ–°æ±ºç?çµæ?
// eslint-disable-next-line no-unused-vars
    const result = {
      success: true,
      executionTime,
      details: `Successfully executed ${decision.action}`,
    };

    await decision.update({
      status: 'completed',
      result,
      executionTime,
    });

    logger.info('???ªå??–æ±ºç­–åŸ·è¡Œå???, { decisionId, executionTime });

    res.json({
      success: true,
      message: 'Decision executed successfully',
      result,
    });
  } catch (error) {
    logger.error('???·è??ªå??–æ±ºç­–å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to execute automation decision',
      error: error.message,
    });
  }
});

// ?²å??æ¸¬?§ç¶­è­·é?æ¸?router.get('/maintenance/predictions', protect, async (req, res) => {
  try {
    const { component } = req.query;

    const whereClause = {};
    if (component) {
      whereClause.component = component;
    }

// eslint-disable-next-line no-unused-vars
    const predictions = await MaintenancePrediction.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
    });

    res.json(predictions);
  } catch (error) {
    logger.error('???²å?ç¶­è­·?æ¸¬å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get maintenance predictions',
      error: error.message,
    });
  }
});

// ?Ÿæ?ç¶­è­·?æ¸¬
router.post('/maintenance/generate-prediction', protect, async (req, res) => {
  try {
    const { component, timeRange } = req.body;

    logger.info('?? ?Ÿæ?ç¶­è­·?æ¸¬', { component, timeRange });

    // ?Ÿæ??æ¸¬ID
// eslint-disable-next-line no-unused-vars
    const predictionId = `prediction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // æ¨¡æ“¬?æ¸¬çµæ?
    const issueTypes = [
      'hardware_failure',
      'performance_degradation',
      'capacity_exhaustion',
      'security_vulnerability',
    ];
    const randomIssueType =
      issueTypes[Math.floor(Math.random() * issueTypes.length)];
    const probability = Math.random() * 0.8 + 0.2; // 20%-100%
    const confidence = Math.random() * 0.3 + 0.7; // 70%-100%

    // è¨ˆç??ä¼°?…é??‚é?
// eslint-disable-next-line no-unused-vars
    const now = new Date();
    const estimatedFailureTime = new Date(
      now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000
    ); // 7å¤©å…§

// eslint-disable-next-line no-unused-vars
    const prediction = await MaintenancePrediction.create({
      predictionId,
      timestamp: new Date(),
      component,
      issueType: randomIssueType,
      probability,
      estimatedFailureTime,
      confidence,
      severity:
        probability > 0.7 ? 'critical' : probability > 0.5 ? 'high' : 'medium',
      recommendedActions: [
        {
          action: 'Schedule maintenance',
          priority: 'high',
          estimatedCost: Math.random() * 1000 + 100,
          estimatedDowntime: Math.random() * 4 + 1,
        },
      ],
      historicalData: [],
    });

    logger.info('??ç¶­è­·?æ¸¬å·²ç???, { predictionId, probability });

    res.status(201).json(prediction);
  } catch (error) {
    logger.error('???Ÿæ?ç¶­è­·?æ¸¬å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to generate maintenance prediction',
      error: error.message,
    });
  }
});

// ?´æ–°?æ¸¬æ¨¡å?
router.post('/maintenance/update-model', protect, async (req, res) => {
  try {
    const { component, trainingData } = req.body;

    logger.info('?? ?´æ–°?æ¸¬æ¨¡å?', {
      component,
      dataSize: trainingData.length,
    });

    // æ¨¡æ“¬æ¨¡å??´æ–°
    await new Promise((resolve) => setTimeout(resolve, 3000)); // æ¨¡æ“¬è¨“ç·´?‚é?

// eslint-disable-next-line no-unused-vars
    const modelAccuracy = Math.random() * 0.2 + 0.8; // 80%-100%

    logger.info('???æ¸¬æ¨¡å?å·²æ›´??, { component, accuracy: modelAccuracy });

    res.json({
      success: true,
      message: 'Model updated successfully',
      modelAccuracy,
    });
  } catch (error) {
    logger.error('???´æ–°?æ¸¬æ¨¡å?å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update prediction model',
      error: error.message,
    });
  }
});

// ?²å??ºèƒ½?‹ç¶­?ä?
router.get('/ops/operations', protect, async (req, res) => {
  try {
    const { status, type } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const operations = await IntelligentOpsOperation.findAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
    });

    res.json(operations);
  } catch (error) {
    logger.error('???²å??ºèƒ½?‹ç¶­?ä?å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get intelligent ops operations',
      error: error.message,
    });
  }
});

// è§¸ç™¼?ºèƒ½?¨ç½²
router.post('/ops/deploy', protect, async (req, res) => {
  try {
    const { service, version, environment, strategy, autoRollback } = req.body;

    logger.info('?? è§¸ç™¼?ºèƒ½?¨ç½²', { service, version, strategy });

    // ?Ÿæ??ä?ID
    const operationId = `ops_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const operation = await IntelligentOpsOperation.create({
      operationId,
      timestamp: new Date(),
      type: 'deployment',
      target: service,
      action: `Deploy ${version} to ${environment} using ${strategy}`,
      status: 'pending',
      progress: 0,
      logs: [],
    });

    // æ¨¡æ“¬?¨ç½²?Žç?
    setTimeout(async () => {
      await operation.update({
        status: 'running',
        progress: 50,
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Deployment started',
          },
        ],
      });

      setTimeout(async () => {
        await operation.update({
          status: 'success',
          progress: 100,
          logs: [
            {
              timestamp: new Date().toISOString(),
              level: 'info',
              message: 'Deployment completed successfully',
            },
          ],
        });
      }, 2000);
    }, 1000);

    logger.info('???ºèƒ½?¨ç½²å·²è§¸??, { operationId });

    res.status(201).json(operation);
  } catch (error) {
    logger.error('??è§¸ç™¼?ºèƒ½?¨ç½²å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to trigger intelligent deployment',
      error: error.message,
    });
  }
});

// è§¸ç™¼?ºèƒ½?žæ»¾
router.post('/ops/:operationId/rollback', protect, async (req, res) => {
  try {
    const { operationId } = req.params;
    const { reason } = req.body;

    const operation = await IntelligentOpsOperation.findOne({
      where: { operationId },
    });

    if (!operation) {
      return res.status(404).json({
        success: false,
        message: 'Operation not found',
      });
    }

    // ?µå»º?žæ»¾?ä?
    const rollbackOperationId = `rollback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const rollbackOperation = await IntelligentOpsOperation.create({
      operationId: rollbackOperationId,
      timestamp: new Date(),
      type: 'rollback',
      target: operation.target,
      action: `Rollback ${operation.target}`,
      status: 'running',
      progress: 0,
      logs: [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Rollback initiated: ${reason}`,
        },
      ],
    });

    // ?´æ–°?Ÿæ?ä½œç???    await operation.update({
      rollbackTriggered: true,
      rollbackReason: reason,
    });

    logger.info('???ºèƒ½?žæ»¾å·²è§¸??, { operationId, rollbackOperationId });

    res.json({
      success: true,
      message: 'Rollback triggered successfully',
      rollbackOperationId,
    });
  } catch (error) {
    logger.error('??è§¸ç™¼?ºèƒ½?žæ»¾å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to trigger intelligent rollback',
      error: error.message,
    });
  }
});

// ?´æ–°?ç½®ç®¡ç?
router.post('/ops/config-update', protect, async (req, res) => {
  try {
    const { service, configType, changes, autoValidate } = req.body;

    logger.info('?? ?´æ–°?ç½®ç®¡ç?', { service, configType });

    // æ¨¡æ“¬?ç½®é©—è?
    const validationResults = [];
    for (const [key, value] of Object.entries(changes)) {
      validationResults.push({
        key,
        valid: Math.random() > 0.1, // 90% ?šé???        message: Math.random() > 0.1 ? 'Valid' : 'Invalid configuration',
      });
    }

    const allValid = validationResults.every((result) => result.valid);

    logger.info('???ç½®ç®¡ç?å·²æ›´??, { service, valid: allValid });

    res.json({
      success: allValid,
      message: allValid
        ? 'Configuration updated successfully'
        : 'Configuration validation failed',
      validationResults,
    });
  } catch (error) {
    logger.error('???´æ–°?ç½®ç®¡ç?å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to update configuration management',
      error: error.message,
    });
  }
});

// ?²å?ç³»çµ±?¥åº·è©•ä¼°
router.get('/health/assessment', protect, async (req, res) => {
  try {
// eslint-disable-next-line no-unused-vars
    const assessmentId = `assessment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // æ¨¡æ“¬?¥åº·è©•ä¼°
    const healthScore = Math.random() * 40 + 60; // 60-100
    let overallHealth;
    if (healthScore >= 90) overallHealth = 'excellent';
    else if (healthScore >= 80) overallHealth = 'good';
    else if (healthScore >= 70) overallHealth = 'fair';
    else if (healthScore >= 60) overallHealth = 'poor';
    else overallHealth = 'critical';

// eslint-disable-next-line no-unused-vars
    const assessment = await SystemHealthAssessment.create({
      assessmentId,
      timestamp: new Date(),
      overallHealth,
      healthScore,
      components: [
        {
          name: 'Database',
          health: 'good',
          score: 85,
          issues: [],
          recommendations: ['Consider adding read replicas'],
        },
        {
          name: 'API Gateway',
          health: 'excellent',
          score: 95,
          issues: [],
          recommendations: [],
        },
        {
          name: 'Cache Layer',
          health: 'fair',
          score: 75,
          issues: ['High memory usage'],
          recommendations: ['Increase cache memory', 'Optimize cache keys'],
        },
      ],
      risks: [
        {
          risk: 'Database connection pool exhaustion',
          probability: 0.3,
          impact: 'high',
          mitigation: 'Increase connection pool size',
        },
      ],
      trends: [
        {
          metric: 'Response Time',
          trend: 'improving',
          change: -15,
        },
      ],
    });

    res.json(assessment);
  } catch (error) {
    logger.error('???²å?ç³»çµ±?¥åº·è©•ä¼°å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get system health assessment',
      error: error.message,
    });
  }
});

// ?Ÿæ??¥åº·?±å?
router.post('/health/report', protect, async (req, res) => {
  try {
    const { timeRange } = req.body;

    logger.info('?? ?Ÿæ??¥åº·?±å?', { timeRange });

    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // æ¨¡æ“¬?±å??Ÿæ?
    await new Promise((resolve) => setTimeout(resolve, 2000));

// eslint-disable-next-line no-unused-vars
    const summary = {
      overallHealth: 'good',
      healthScore: 85,
      totalIssues: 3,
      criticalIssues: 0,
      recommendations: [
        'Optimize database queries',
        'Increase cache memory',
        'Monitor API response times',
      ],
    };

    logger.info('???¥åº·?±å?å·²ç???, { reportId });

    res.json({
      reportId,
      downloadUrl: `/reports/${reportId}.pdf`,
      summary,
    });
  } catch (error) {
    logger.error('???Ÿæ??¥åº·?±å?å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to generate health report',
      error: error.message,
    });
  }
});

// ?²å??ºèƒ½å»ºè­°
router.get('/recommendations', protect, async (req, res) => {
  try {
    const { category } = req.query;

    // æ¨¡æ“¬?ºèƒ½å»ºè­°
// eslint-disable-next-line no-unused-vars
    const recommendations = [
      {
        recommendationId: 'rec_001',
        category: 'performance',
        title: 'Optimize Database Queries',
        description:
          'Several slow queries detected. Consider adding indexes and optimizing query patterns.',
        priority: 'high',
        estimatedImpact: '30% performance improvement',
        estimatedEffort: '2-3 days',
        confidence: 0.9,
        actions: [
          {
            action: 'Add database indexes',
            description: 'Create indexes for frequently queried columns',
            automated: false,
          },
          {
            action: 'Optimize query patterns',
            description: 'Rewrite queries to use more efficient patterns',
            automated: true,
          },
        ],
      },
      {
        recommendationId: 'rec_002',
        category: 'security',
        title: 'Update Security Patches',
        description: 'Security vulnerabilities detected in dependencies.',
        priority: 'critical',
        estimatedImpact: 'Eliminate security risks',
        estimatedEffort: '1 day',
        confidence: 0.95,
        actions: [
          {
            action: 'Update dependencies',
            description: 'Update vulnerable packages to latest versions',
            automated: true,
          },
        ],
      },
    ];

    const filteredRecommendations = category
      ? recommendations.filter((rec) => rec.category === category)
      : recommendations;

    res.json(filteredRecommendations);
  } catch (error) {
    logger.error('???²å??ºèƒ½å»ºè­°å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get intelligent recommendations',
      error: error.message,
    });
  }
});

// ?·è??ºèƒ½å»ºè­°
router.post(
  '/recommendations/:recommendationId/execute',
  protect,
  async (req, res) => {
    try {
      const { recommendationId } = req.params;
      const { actions } = req.body;

      logger.info('?? ?·è??ºèƒ½å»ºè­°', { recommendationId, actions });

      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // æ¨¡æ“¬?·è??Žç?
      setTimeout(async () => {
        logger.info('???ºèƒ½å»ºè­°?·è?å®Œæ?', { recommendationId, executionId });
      }, 3000);

      res.json({
        success: true,
        message: 'Recommendation execution started',
        executionId,
        progress: 0,
      });
    } catch (error) {
      logger.error('???·è??ºèƒ½å»ºè­°å¤±æ?', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to execute recommendation',
        error: error.message,
      });
    }
  }
);

// ?²å??ªå??–çµ±è¨?router.get('/automation/stats', protect, async (req, res) => {
  try {
    const { timeRange } = req.query;

    // æ¨¡æ“¬çµ±è??¸æ?
    const stats = {
      totalDecisions: 45,
      successfulDecisions: 42,
      failedDecisions: 3,
      averageExecutionTime: 2.3,
      decisionTypes: [
        { type: 'scaling', count: 20, successRate: 95 },
        { type: 'healing', count: 15, successRate: 87 },
        { type: 'optimization', count: 10, successRate: 90 },
      ],
      impactMetrics: {
        performanceImprovement: 25,
        costSavings: 15,
        downtimeReduction: 40,
      },
    };

    res.json(stats);
  } catch (error) {
    logger.error('???²å??ªå??–çµ±è¨ˆå¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get automation stats',
      error: error.message,
    });
  }
});

// ?²å??æ¸¬?§ç¶­è­·çµ±è¨?router.get('/maintenance/stats', protect, async (req, res) => {
  try {
    const { timeRange } = req.query;

    // æ¨¡æ“¬çµ±è??¸æ?
    const stats = {
      totalPredictions: 28,
      accuratePredictions: 25,
      falsePositives: 2,
      falseNegatives: 1,
      averagePredictionAccuracy: 89.3,
      components: [
        {
          component: 'Database Server',
          predictions: 12,
          accuracy: 92,
          lastPrediction: new Date().toISOString(),
        },
        {
          component: 'Load Balancer',
          predictions: 8,
          accuracy: 88,
          lastPrediction: new Date().toISOString(),
        },
        {
          component: 'Cache Cluster',
          predictions: 8,
          accuracy: 87,
          lastPrediction: new Date().toISOString(),
        },
      ],
    };

    res.json(stats);
  } catch (error) {
    logger.error('???²å??æ¸¬?§ç¶­è­·çµ±è¨ˆå¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get maintenance stats',
      error: error.message,
    });
  }
});

// ?²å??ºèƒ½?‹ç¶­çµ±è?
router.get('/ops/stats', protect, async (req, res) => {
  try {
    const { timeRange } = req.query;

    // æ¨¡æ“¬çµ±è??¸æ?
    const stats = {
      totalOperations: 156,
      successfulOperations: 152,
      failedOperations: 4,
      rollbackRate: 2.6,
      averageDeploymentTime: 3.2,
      operationTypes: [
        {
          type: 'deployment',
          count: 89,
          successRate: 96,
          averageTime: 2.8,
        },
        {
          type: 'rollback',
          count: 4,
          successRate: 100,
          averageTime: 1.5,
        },
        {
          type: 'config_update',
          count: 63,
          successRate: 98,
          averageTime: 0.8,
        },
      ],
    };

    res.json(stats);
  } catch (error) {
    logger.error('???²å??ºèƒ½?‹ç¶­çµ±è?å¤±æ?', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get ops stats',
      error: error.message,
    });
  }
});

// è¨­ç½®?ªå??–è???router.post('/automation/rules', protect, async (req, res) => {
  try {
    const { name, description, trigger, action, enabled } = req.body;

    logger.info('?? è¨­ç½®?ªå??–è???, { name });

    const ruleId = `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const rule = await AutomationRule.create({
      ruleId,
      name,
      description,
      trigger,
      action,
      enabled,
      createdAt: new Date(),
    });

    logger.info('???ªå??–è??‡å·²è¨­ç½®', { ruleId });

    res.status(201).json({
      success: true,
      ruleId,
      message: 'Automation rule created successfully',
    });
  } catch (error) {
    logger.error('??è¨­ç½®?ªå??–è??‡å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to set automation rule',
      error: error.message,
    });
  }
});

// ?²å??ªå??–è??‡å?è¡?router.get('/automation/rules', protect, async (req, res) => {
  try {
    const rules = await AutomationRule.findAll({
      order: [['createdAt', 'DESC']],
    });

    res.json(rules);
  } catch (error) {
    logger.error('???²å??ªå??–è??‡å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to get automation rules',
      error: error.message,
    });
  }
});

// ?Ÿç”¨/ç¦ç”¨?ªå??–è???router.put('/automation/rules/:ruleId/toggle', protect, async (req, res) => {
  try {
    const { ruleId } = req.params;
    const { enabled } = req.body;

    const rule = await AutomationRule.findOne({
      where: { ruleId },
    });

    if (!rule) {
      return res.status(404).json({
        success: false,
        message: 'Rule not found',
      });
    }

    await rule.update({ enabled });

    logger.info('???ªå??–è??‡ç??‹å·²?´æ–°', { ruleId, enabled });

    res.json({
      success: true,
      message: 'Automation rule toggled successfully',
    });
  } catch (error) {
    logger.error('???‡æ??ªå??–è??‡å¤±??, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to toggle automation rule',
      error: error.message,
    });
  }
});

module.exports = router;
