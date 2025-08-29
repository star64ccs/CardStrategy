const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');

// ç§»å?ç«¯æ???const mobileService = require('../services/mobileService');

// ==================== ?¢ç??Œæ­¥ ====================

// ?²å??¢ç??¸æ?
router.get('/offline/data', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { lastSyncTime, dataTypes } = req.query;

    const offlineData = await mobileService.getOfflineData({
      userId,
      lastSyncTime: lastSyncTime ? new Date(lastSyncTime) : null,
      dataTypes: dataTypes
        ? dataTypes.split(',')
        : ['cards', 'portfolio', 'market'],
    });

    res.json({
      success: true,
      data: offlineData,
    });
  } catch (error) {
    logger.error('?²å??¢ç??¸æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å??¢ç??¸æ?å¤±æ?',
    });
  }
});

// ?äº¤?¢ç?è®Šæ›´
router.post('/offline/changes', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { changes, syncId } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.submitOfflineChanges({
      userId,
      changes,
      syncId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?äº¤?¢ç?è®Šæ›´å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?äº¤?¢ç?è®Šæ›´å¤±æ?',
    });
  }
});

// ?²å??Œæ­¥?€??router.get('/offline/sync-status', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const syncStatus = await mobileService.getSyncStatus(userId);

    res.json({
      success: true,
      data: syncStatus,
    });
  } catch (error) {
    logger.error('?²å??Œæ­¥?€?‹å¤±??', error);
    res.status(500).json({
      success: false,
      error: '?²å??Œæ­¥?€?‹å¤±??,
    });
  }
});

// ==================== ?¨é€é€šçŸ¥ ====================

// è¨»å??¨é€ä»¤??router.post('/push/register', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { token, platform, deviceId } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.registerPushToken({
      userId,
      token,
      platform,
      deviceId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('è¨»å??¨é€ä»¤?Œå¤±??', error);
    res.status(500).json({
      success: false,
      error: 'è¨»å??¨é€ä»¤?Œå¤±??,
    });
  }
});

// ?¼é€æŽ¨?é€šçŸ¥
router.post('/push/send', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, body, data, targetUsers, notificationType } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.sendPushNotification({
      title,
      body,
      data,
      targetUsers,
      notificationType,
      senderId: userId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?¼é€æŽ¨?é€šçŸ¥å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?¼é€æŽ¨?é€šçŸ¥å¤±æ?',
    });
  }
});

// ?²å??šçŸ¥è¨­ç½®
router.get('/push/settings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const settings = await mobileService.getNotificationSettings(userId);

    res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error('?²å??šçŸ¥è¨­ç½®å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å??šçŸ¥è¨­ç½®å¤±æ?',
    });
  }
});

// ?´æ–°?šçŸ¥è¨­ç½®
router.put('/push/settings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { settings } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.updateNotificationSettings(
      userId,
      settings
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?´æ–°?šçŸ¥è¨­ç½®å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?´æ–°?šçŸ¥è¨­ç½®å¤±æ?',
    });
  }
});

// ==================== è¨­å?ç®¡ç? ====================

// è¨»å?è¨­å?
router.post('/device/register', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceInfo, capabilities } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.registerDevice({
      userId,
      deviceInfo,
      capabilities,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('è¨»å?è¨­å?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: 'è¨»å?è¨­å?å¤±æ?',
    });
  }
});

// ?²å??¨æˆ¶è¨­å??—è¡¨
router.get('/device/list', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const devices = await mobileService.getUserDevices(userId);

    res.json({
      success: true,
      data: devices,
    });
  } catch (error) {
    logger.error('?²å?è¨­å??—è¡¨å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å?è¨­å??—è¡¨å¤±æ?',
    });
  }
});

// è¨»éŠ·è¨­å?
router.delete('/device/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceId } = req.params;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.unregisterDevice(userId, deviceId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('è¨»éŠ·è¨­å?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: 'è¨»éŠ·è¨­å?å¤±æ?',
    });
  }
});

// ==================== ç§»å?ç«¯å???====================

// è¨˜é?ç§»å?ç«¯ä?ä»?router.post('/analytics/event', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { eventType, eventData, deviceInfo, timestamp } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.recordMobileEvent({
      userId,
      eventType,
      eventData,
      deviceInfo,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('è¨˜é?ç§»å?ç«¯ä?ä»¶å¤±??', error);
    res.status(500).json({
      success: false,
      error: 'è¨˜é?ç§»å?ç«¯ä?ä»¶å¤±??,
    });
  }
});

// ?²å?ç§»å?ç«¯å??å ±??router.get('/analytics/report', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { timeframe, metrics } = req.query;

    const report = await mobileService.getMobileAnalyticsReport({
      userId,
      timeframe: timeframe || '7d',
      metrics: metrics
        ? metrics.split(',')
        : ['usage', 'performance', 'engagement'],
    });

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    logger.error('?²å?ç§»å?ç«¯å??å ±?Šå¤±??', error);
    res.status(500).json({
      success: false,
      error: '?²å?ç§»å?ç«¯å??å ±?Šå¤±??,
    });
  }
});

// ==================== ç§»å?ç«¯å„ª??====================

// ?²å?ç§»å?ç«¯é?ç½?router.get('/config', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceInfo } = req.query;

// eslint-disable-next-line no-unused-vars
    const config = await mobileService.getMobileConfig({
      userId,
      deviceInfo: deviceInfo ? JSON.parse(deviceInfo) : null,
    });

    res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    logger.error('?²å?ç§»å?ç«¯é?ç½®å¤±??', error);
    res.status(500).json({
      success: false,
      error: '?²å?ç§»å?ç«¯é?ç½®å¤±??,
    });
  }
});

// ?²å??ªå?å»ºè­°
router.get('/optimization/suggestions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceInfo, performanceData } = req.query;

    const suggestions = await mobileService.getOptimizationSuggestions({
      userId,
      deviceInfo: deviceInfo ? JSON.parse(deviceInfo) : null,
      performanceData: performanceData ? JSON.parse(performanceData) : null,
    });

    res.json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    logger.error('?²å??ªå?å»ºè­°å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å??ªå?å»ºè­°å¤±æ?',
    });
  }
});

// ==================== ?Ÿç‰©è­˜åˆ¥èªè? ====================

// ?Ÿç”¨?Ÿç‰©è­˜åˆ¥èªè?
router.post('/biometric/enable', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { biometricType, deviceId } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.enableBiometricAuth({
      userId,
      biometricType,
      deviceId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?Ÿç”¨?Ÿç‰©è­˜åˆ¥èªè?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?Ÿç”¨?Ÿç‰©è­˜åˆ¥èªè?å¤±æ?',
    });
  }
});

// é©—è??Ÿç‰©è­˜åˆ¥
router.post('/biometric/verify', async (req, res) => {
  try {
    const { biometricData, deviceId, userId } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.verifyBiometricAuth({
      biometricData,
      deviceId,
      userId,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('é©—è??Ÿç‰©è­˜åˆ¥å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: 'é©—è??Ÿç‰©è­˜åˆ¥å¤±æ?',
    });
  }
});

// ==================== èªžéŸ³?½ä»¤ ====================

// ?•ç?èªžéŸ³?½ä»¤
router.post('/voice/command', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { audioData, commandType, language } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.processVoiceCommand({
      userId,
      audioData,
      commandType,
      language,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?•ç?èªžéŸ³?½ä»¤å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?•ç?èªžéŸ³?½ä»¤å¤±æ?',
    });
  }
});

// ?²å?èªžéŸ³?½ä»¤?—è¡¨
router.get('/voice/commands', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { language } = req.query;

    const commands = await mobileService.getVoiceCommands({
      userId,
      language: language || 'zh-TW',
    });

    res.json({
      success: true,
      data: commands,
    });
  } catch (error) {
    logger.error('?²å?èªžéŸ³?½ä»¤?—è¡¨å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å?èªžéŸ³?½ä»¤?—è¡¨å¤±æ?',
    });
  }
});

// ==================== AR ?Ÿèƒ½ ====================

// ?²å? AR ?¡ç??¸æ?
router.get('/ar/card/:cardId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { cardId } = req.params;
    const { arType } = req.query;

    const arData = await mobileService.getARCardData({
      userId,
      cardId,
      arType: arType || '3d-model',
    });

    res.json({
      success: true,
      data: arData,
    });
  } catch (error) {
    logger.error('?²å? AR ?¡ç??¸æ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?²å? AR ?¡ç??¸æ?å¤±æ?',
    });
  }
});

// ?•ç? AR ?ƒæ?
router.post('/ar/scan', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { scanData, scanType, location } = req.body;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.processARScan({
      userId,
      scanData,
      scanType,
      location,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error('?•ç? AR ?ƒæ?å¤±æ?:', error);
    res.status(500).json({
      success: false,
      error: '?•ç? AR ?ƒæ?å¤±æ?',
    });
  }
});

// ==================== ç§»å?ç«¯å¥åº·æª¢??====================

// ç§»å?ç«¯å¥åº·æª¢??router.get('/health', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceInfo } = req.query;

    const health = await mobileService.getMobileHealth({
      userId,
      deviceInfo: deviceInfo ? JSON.parse(deviceInfo) : null,
    });

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error('ç§»å?ç«¯å¥åº·æª¢?¥å¤±??', error);
    res.status(500).json({
      success: false,
      error: 'ç§»å?ç«¯å¥åº·æª¢?¥å¤±??,
    });
  }
});

// ?²å?ç§»å?ç«¯æ?æ¨?router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { timeframe } = req.query;

    const metrics = await mobileService.getMobileMetrics({
      userId,
      timeframe: timeframe || '24h',
    });

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    logger.error('?²å?ç§»å?ç«¯æ?æ¨™å¤±??', error);
    res.status(500).json({
      success: false,
      error: '?²å?ç§»å?ç«¯æ?æ¨™å¤±??,
    });
  }
});

module.exports = router;
