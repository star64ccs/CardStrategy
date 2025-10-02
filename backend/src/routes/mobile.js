const express = require('express');'
const router = express.Router();''
const { authenticateToken } = require('../middleware/auth');''
const { validateRequest } = require('../middleware/validation');'
// eslint-disable-next-line no-unused-vars''
const logger = require('../utils/logger');''
// 移�?端�???const mobileService = require('../services/mobileService');

// ==================== ?��??�步 ===================='
// ?��??��??��?''
router.get('/offline/data', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { lastSyncTime, dataTypes } = req.query;

    const offlineData = await mobileService.getOfflineData({
      userId,
      lastSyncTime: lastSyncTime ? new Date(lastSyncTime) : null,'
      dataTypes: dataTypes''
        ? dataTypes.split(',')''
        : ['cards', 'portfolio', 'market'],
    });

    res.json({
      success: true,
      data: offlineData,
    });'
  } catch (error) {''
    logger.error('?��??��??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��??��??��?失�?',
    });
  }
});'
// ?�交?��?變更''
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
    });'
  } catch (error) {''
    logger.error('?�交?��?變更失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�交?��?變更失�?',
    });'
  }
});''
// ?��??�步?�??router.get('/offline/sync-status', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const syncStatus = await mobileService.getSyncStatus(userId);

    res.json({
      success: true,
      data: syncStatus,
    });'
  } catch (error) {''
    logger.error('?��??�步?�?�失??', error);
    res.status(500).json({'
      success: false,''
      error: '?��??�步?�?�失??,
    });
  }
});'
// ==================== ?�送Notification ====================''
// 註�??�送令??router.post('/push/register', authenticateToken, async (req, res) => {
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
    });'
  } catch (error) {''
    logger.error('註�??�送令?�失??', error);
    res.status(500).json({'
      success: false,''
      error: '註�??�送令?�失??,
    });
  }
});'
// ?�送推?�Notification''
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
    });'
  } catch (error) {''
    logger.error('?�送推?�通知失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�送推?�通知失�?',
    });
  }
});'
// ?��??�知Settings''
router.get('/push/settings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const settings = await mobileService.getNotificationSettings(userId);

    res.json({
      success: true,
      data: settings,
    });'
  } catch (error) {''
    logger.error('?��??�知設置失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��??�知設置失�?',
    });
  }
});'
// ?�新?�知Settings''
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
    });'
  } catch (error) {''
    logger.error('?�新?�知設置失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�新?�知設置失�?',
    });
  }
});

// ==================== 設�?管�? ===================='
// 註�?設�?''
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
    });'
  } catch (error) {''
    logger.error('註�?設�?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '註�?設�?失�?',
    });
  }
});'
// ?��??�戶設�??�Table''
router.get('/device/list', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const devices = await mobileService.getUserDevices(userId);

    res.json({
      success: true,
      data: devices,
    });'
  } catch (error) {''
    logger.error('?��?設�??�表失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��?設�??�表失�?',
    });
  }
});'
// Logout設�?''
router.delete('/device/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceId } = req.params;

// eslint-disable-next-line no-unused-vars
    const result = await mobileService.unregisterDevice(userId, deviceId);

    res.json({
      success: true,
      data: result,
    });'
  } catch (error) {''
    logger.error('註銷設�?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '註銷設�?失�?',
    });
  }
});'
// ==================== 移�?端�???====================''
// 記�?移�?端�?�?router.post('/analytics/event', authenticateToken, async (req, res) => {
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
    });'
  } catch (error) {''
    logger.error('記�?移�?端�?件失??', error);
    res.status(500).json({'
      success: false,''
      error: '記�?移�?端�?件失??,
    });'
  }
});''
// ?��?移�?端�??�報??router.get('/analytics/report', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { timeframe, metrics } = req.query;

    const report = await mobileService.getMobileAnalyticsReport({'
      userId,''
      timeframe: timeframe || '7d','
      metrics: metrics''
        ? metrics.split(',')''
        : ['usage', 'performance', 'engagement'],
    });

    res.json({
      success: true,
      data: report,
    });'
  } catch (error) {''
    logger.error('?��?移�?端�??�報?�失??', error);
    res.status(500).json({'
      success: false,''
      error: '?��?移�?端�??�報?�失??,
    });
  }
});'
// ==================== 移�?端優??====================''
// ?��?移�?端�?�?router.get('/config', authenticateToken, async (req, res) => {
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
    });'
  } catch (error) {''
    logger.error('?��?移�?端�?置失??', error);
    res.status(500).json({'
      success: false,''
      error: '?��?移�?端�?置失??,
    });
  }
});'
// ?��??��?建議''
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
    });'
  } catch (error) {''
    logger.error('?��??��?建議失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��??��?建議失�?',
    });
  }
});

// ==================== ?�物識別認�? ===================='
// ?�用?�物識別認�?''
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
    });'
  } catch (error) {''
    logger.error('?�用?�物識別認�?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?�用?�物識別認�?失�?',
    });
  }
});'
// 驗�??�物識別''
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
    });'
  } catch (error) {''
    logger.error('驗�??�物識別失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '驗�??�物識別失�?',
    });
  }
});

// ==================== 語音?�令 ===================='
// ?��?語音?�令''
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
    });'
  } catch (error) {''
    logger.error('?��?語音?�令失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��?語音?�令失�?',
    });
  }
});'
// ?��?語音?�令?�Table''
router.get('/voice/commands', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { language } = req.query;

    const commands = await mobileService.getVoiceCommands({'
      userId,''
      language: language || 'zh-TW',
    });

    res.json({
      success: true,
      data: commands,
    });'
  } catch (error) {''
    logger.error('?��?語音?�令?�表失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��?語音?�令?�表失�?',
    });
  }
});

// ==================== AR ?�能 ===================='
// ?��? AR ?��??��?''
router.get('/ar/card/:cardId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { cardId } = req.params;
    const { arType } = req.query;

    const arData = await mobileService.getARCardData({
      userId,'
      cardId,''
      arType: arType || '3d-model',
    });

    res.json({
      success: true,
      data: arData,
    });'
  } catch (error) {''
    logger.error('?��? AR ?��??��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��? AR ?��??��?失�?',
    });
  }
});'
// ?��? AR ?��?''
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
    });'
  } catch (error) {''
    logger.error('?��? AR ?��?失�?:', error);
    res.status(500).json({'
      success: false,''
      error: '?��? AR ?��?失�?',
    });
  }
});'
// ==================== 移�?端健康檢??====================''
// 移�?端健康檢??router.get('/health', authenticateToken, async (req, res) => {
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
    });'
  } catch (error) {''
    logger.error('移�?端健康檢?�失??', error);
    res.status(500).json({'
      success: false,''
      error: '移�?端健康檢?�失??,
    });'
  }
});''
// ?��?移�?端�?�?router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { timeframe } = req.query;

    const metrics = await mobileService.getMobileMetrics({'
      userId,''
      timeframe: timeframe || '24h',
    });

    res.json({
      success: true,
      data: metrics,
    });'
  } catch (error) {''
    logger.error('?��?移�?端�?標失??', error);
    res.status(500).json({'
      success: false,''
      error: '?��?移�?端�?標失??,
    });
  }
});'
module.exports = router;''