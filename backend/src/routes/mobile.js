const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validation');
const logger = require('../utils/logger');

// 移動端服務
const mobileService = require('../services/mobileService');

// ==================== 離線同步 ====================

// 獲取離線數據
router.get('/offline/data', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { lastSyncTime, dataTypes } = req.query;

    const offlineData = await mobileService.getOfflineData({
      userId,
      lastSyncTime: lastSyncTime ? new Date(lastSyncTime) : null,
      dataTypes: dataTypes ? dataTypes.split(',') : ['cards', 'portfolio', 'market']
    });

    res.json({
      success: true,
      data: offlineData
    });
  } catch (error) {
    logger.error('獲取離線數據失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取離線數據失敗'
    });
  }
});

// 提交離線變更
router.post('/offline/changes', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { changes, syncId } = req.body;

    const result = await mobileService.submitOfflineChanges({
      userId,
      changes,
      syncId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('提交離線變更失敗:', error);
    res.status(500).json({
      success: false,
      error: '提交離線變更失敗'
    });
  }
});

// 獲取同步狀態
router.get('/offline/sync-status', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const syncStatus = await mobileService.getSyncStatus(userId);

    res.json({
      success: true,
      data: syncStatus
    });
  } catch (error) {
    logger.error('獲取同步狀態失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取同步狀態失敗'
    });
  }
});

// ==================== 推送通知 ====================

// 註冊推送令牌
router.post('/push/register', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { token, platform, deviceId } = req.body;

    const result = await mobileService.registerPushToken({
      userId,
      token,
      platform,
      deviceId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('註冊推送令牌失敗:', error);
    res.status(500).json({
      success: false,
      error: '註冊推送令牌失敗'
    });
  }
});

// 發送推送通知
router.post('/push/send', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { title, body, data, targetUsers, notificationType } = req.body;

    const result = await mobileService.sendPushNotification({
      title,
      body,
      data,
      targetUsers,
      notificationType,
      senderId: userId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('發送推送通知失敗:', error);
    res.status(500).json({
      success: false,
      error: '發送推送通知失敗'
    });
  }
});

// 獲取通知設置
router.get('/push/settings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const settings = await mobileService.getNotificationSettings(userId);

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    logger.error('獲取通知設置失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取通知設置失敗'
    });
  }
});

// 更新通知設置
router.put('/push/settings', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { settings } = req.body;

    const result = await mobileService.updateNotificationSettings(userId, settings);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('更新通知設置失敗:', error);
    res.status(500).json({
      success: false,
      error: '更新通知設置失敗'
    });
  }
});

// ==================== 設備管理 ====================

// 註冊設備
router.post('/device/register', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceInfo, capabilities } = req.body;

    const result = await mobileService.registerDevice({
      userId,
      deviceInfo,
      capabilities
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('註冊設備失敗:', error);
    res.status(500).json({
      success: false,
      error: '註冊設備失敗'
    });
  }
});

// 獲取用戶設備列表
router.get('/device/list', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;

    const devices = await mobileService.getUserDevices(userId);

    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    logger.error('獲取設備列表失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取設備列表失敗'
    });
  }
});

// 註銷設備
router.delete('/device/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceId } = req.params;

    const result = await mobileService.unregisterDevice(userId, deviceId);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('註銷設備失敗:', error);
    res.status(500).json({
      success: false,
      error: '註銷設備失敗'
    });
  }
});

// ==================== 移動端分析 ====================

// 記錄移動端事件
router.post('/analytics/event', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { eventType, eventData, deviceInfo, timestamp } = req.body;

    const result = await mobileService.recordMobileEvent({
      userId,
      eventType,
      eventData,
      deviceInfo,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('記錄移動端事件失敗:', error);
    res.status(500).json({
      success: false,
      error: '記錄移動端事件失敗'
    });
  }
});

// 獲取移動端分析報告
router.get('/analytics/report', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { timeframe, metrics } = req.query;

    const report = await mobileService.getMobileAnalyticsReport({
      userId,
      timeframe: timeframe || '7d',
      metrics: metrics ? metrics.split(',') : ['usage', 'performance', 'engagement']
    });

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    logger.error('獲取移動端分析報告失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取移動端分析報告失敗'
    });
  }
});

// ==================== 移動端優化 ====================

// 獲取移動端配置
router.get('/config', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceInfo } = req.query;

    const config = await mobileService.getMobileConfig({
      userId,
      deviceInfo: deviceInfo ? JSON.parse(deviceInfo) : null
    });

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    logger.error('獲取移動端配置失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取移動端配置失敗'
    });
  }
});

// 獲取優化建議
router.get('/optimization/suggestions', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceInfo, performanceData } = req.query;

    const suggestions = await mobileService.getOptimizationSuggestions({
      userId,
      deviceInfo: deviceInfo ? JSON.parse(deviceInfo) : null,
      performanceData: performanceData ? JSON.parse(performanceData) : null
    });

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    logger.error('獲取優化建議失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取優化建議失敗'
    });
  }
});

// ==================== 生物識別認證 ====================

// 啟用生物識別認證
router.post('/biometric/enable', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { biometricType, deviceId } = req.body;

    const result = await mobileService.enableBiometricAuth({
      userId,
      biometricType,
      deviceId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('啟用生物識別認證失敗:', error);
    res.status(500).json({
      success: false,
      error: '啟用生物識別認證失敗'
    });
  }
});

// 驗證生物識別
router.post('/biometric/verify', async (req, res) => {
  try {
    const { biometricData, deviceId, userId } = req.body;

    const result = await mobileService.verifyBiometricAuth({
      biometricData,
      deviceId,
      userId
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('驗證生物識別失敗:', error);
    res.status(500).json({
      success: false,
      error: '驗證生物識別失敗'
    });
  }
});

// ==================== 語音命令 ====================

// 處理語音命令
router.post('/voice/command', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { audioData, commandType, language } = req.body;

    const result = await mobileService.processVoiceCommand({
      userId,
      audioData,
      commandType,
      language
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('處理語音命令失敗:', error);
    res.status(500).json({
      success: false,
      error: '處理語音命令失敗'
    });
  }
});

// 獲取語音命令列表
router.get('/voice/commands', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { language } = req.query;

    const commands = await mobileService.getVoiceCommands({
      userId,
      language: language || 'zh-TW'
    });

    res.json({
      success: true,
      data: commands
    });
  } catch (error) {
    logger.error('獲取語音命令列表失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取語音命令列表失敗'
    });
  }
});

// ==================== AR 功能 ====================

// 獲取 AR 卡片數據
router.get('/ar/card/:cardId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { cardId } = req.params;
    const { arType } = req.query;

    const arData = await mobileService.getARCardData({
      userId,
      cardId,
      arType: arType || '3d-model'
    });

    res.json({
      success: true,
      data: arData
    });
  } catch (error) {
    logger.error('獲取 AR 卡片數據失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取 AR 卡片數據失敗'
    });
  }
});

// 處理 AR 掃描
router.post('/ar/scan', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { scanData, scanType, location } = req.body;

    const result = await mobileService.processARScan({
      userId,
      scanData,
      scanType,
      location
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('處理 AR 掃描失敗:', error);
    res.status(500).json({
      success: false,
      error: '處理 AR 掃描失敗'
    });
  }
});

// ==================== 移動端健康檢查 ====================

// 移動端健康檢查
router.get('/health', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { deviceInfo } = req.query;

    const health = await mobileService.getMobileHealth({
      userId,
      deviceInfo: deviceInfo ? JSON.parse(deviceInfo) : null
    });

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('移動端健康檢查失敗:', error);
    res.status(500).json({
      success: false,
      error: '移動端健康檢查失敗'
    });
  }
});

// 獲取移動端指標
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { timeframe } = req.query;

    const metrics = await mobileService.getMobileMetrics({
      userId,
      timeframe: timeframe || '24h'
    });

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('獲取移動端指標失敗:', error);
    res.status(500).json({
      success: false,
      error: '獲取移動端指標失敗'
    });
  }
});

module.exports = router;
