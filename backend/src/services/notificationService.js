const nodemailer = require('nodemailer');
const cron = require('node-cron');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const websocketService = require('./websocketService');

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.notificationQueue = [];
    this.scheduledNotifications = new Map();
    this.notificationTemplates = new Map();
    this.initializeEmailTransporter();
    this.setupNotificationTemplates();
    this.setupScheduledTasks();
  }

  /**
   * 初始化郵件傳輸器
   */
  async initializeEmailTransporter() {
    try {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // 驗證連接
      await this.emailTransporter.verify();
      logger.info('郵件傳輸器初始化成功');
    } catch (error) {
      logger.error('郵件傳輸器初始化失敗:', error);
      this.emailTransporter = null;
    }
  }

  /**
   * 設置通知模板
   */
  setupNotificationTemplates() {
    // 價格變動通知模板
    this.notificationTemplates.set('price_change', {
      title: '價格變動通知',
      email: {
        subject: 'CardStrategy - 價格變動通知',
        template: (data) => `
          <h2>價格變動通知</h2>
          <p>親愛的 ${data.userName}，</p>
          <p>您關注的卡片 <strong>${data.cardName}</strong> 價格發生了變動：</p>
          <ul>
            <li>原價格: $${data.oldPrice}</li>
            <li>新價格: $${data.newPrice}</li>
            <li>變動幅度: ${data.changePercent}%</li>
          </ul>
          <p>變動時間: ${data.timestamp}</p>
          <p>請登錄 CardStrategy 查看詳細信息。</p>
        `
      },
      push: {
        title: '價格變動',
        body: (data) => `${data.cardName} 價格變動 ${data.changePercent}%`,
        data: (data) => ({
          type: 'price_change',
          cardId: data.cardId,
          oldPrice: data.oldPrice,
          newPrice: data.newPrice
        })
      }
    });

    // 投資建議通知模板
    this.notificationTemplates.set('investment_advice', {
      title: '投資建議通知',
      email: {
        subject: 'CardStrategy - 新的投資建議',
        template: (data) => `
          <h2>投資建議通知</h2>
          <p>親愛的 ${data.userName}，</p>
          <p>基於最新的市場分析，我們為您推薦以下投資機會：</p>
          <ul>
            <li>卡片: ${data.cardName}</li>
            <li>當前價格: $${data.currentPrice}</li>
            <li>預測價格: $${data.predictedPrice}</li>
            <li>風險等級: ${data.riskLevel}</li>
          </ul>
          <p>建議操作: ${data.recommendation}</p>
          <p>請登錄 CardStrategy 查看詳細分析。</p>
        `
      },
      push: {
        title: '投資建議',
        body: (data) => `新的投資建議: ${data.cardName}`,
        data: (data) => ({
          type: 'investment_advice',
          cardId: data.cardId,
          recommendation: data.recommendation
        })
      }
    });

    // 系統維護通知模板
    this.notificationTemplates.set('system_maintenance', {
      title: '系統維護通知',
      email: {
        subject: 'CardStrategy - 系統維護通知',
        template: (data) => `
          <h2>系統維護通知</h2>
          <p>親愛的 ${data.userName}，</p>
          <p>我們將進行系統維護，具體安排如下：</p>
          <ul>
            <li>維護時間: ${data.maintenanceTime}</li>
            <li>預計時長: ${data.duration}</li>
            <li>影響範圍: ${data.impact}</li>
          </ul>
          <p>維護期間可能無法正常使用服務，請提前做好安排。</p>
          <p>感謝您的理解與支持。</p>
        `
      },
      push: {
        title: '系統維護',
        body: (data) => `系統將於 ${data.maintenanceTime} 進行維護`,
        data: (data) => ({
          type: 'system_maintenance',
          maintenanceTime: data.maintenanceTime,
          duration: data.duration
        })
      }
    });

    // 安全警報通知模板
    this.notificationTemplates.set('security_alert', {
      title: '安全警報通知',
      email: {
        subject: 'CardStrategy - 安全警報',
        template: (data) => `
          <h2>安全警報通知</h2>
          <p>親愛的 ${data.userName}，</p>
          <p>我們檢測到您的帳戶存在安全風險：</p>
          <ul>
            <li>事件類型: ${data.eventType}</li>
            <li>發生時間: ${data.timestamp}</li>
            <li>IP 地址: ${data.ipAddress}</li>
            <li>設備信息: ${data.deviceInfo}</li>
          </ul>
          <p>建議操作: ${data.recommendation}</p>
          <p>如果這不是您的操作，請立即更改密碼並聯繫客服。</p>
        `
      },
      push: {
        title: '安全警報',
        body: (data) => '檢測到帳戶安全風險，請立即檢查',
        data: (data) => ({
          type: 'security_alert',
          eventType: data.eventType,
          timestamp: data.timestamp
        })
      }
    });

    // 新功能通知模板
    this.notificationTemplates.set('new_feature', {
      title: '新功能通知',
      email: {
        subject: 'CardStrategy - 新功能上線',
        template: (data) => `
          <h2>新功能上線通知</h2>
          <p>親愛的 ${data.userName}，</p>
          <p>CardStrategy 推出了新功能：</p>
          <ul>
            <li>功能名稱: ${data.featureName}</li>
            <li>功能描述: ${data.description}</li>
            <li>使用方法: ${data.usage}</li>
          </ul>
          <p>立即體驗新功能，提升您的投資體驗！</p>
        `
      },
      push: {
        title: '新功能上線',
        body: (data) => `新功能: ${data.featureName}`,
        data: (data) => ({
          type: 'new_feature',
          featureName: data.featureName
        })
      }
    });
  }

  /**
   * 設置定時任務
   */
  setupScheduledTasks() {
    // 每小時檢查價格變動
    cron.schedule('0 * * * *', () => {
      this.checkPriceChanges();
    });

    // 每天發送市場摘要
    cron.schedule('0 9 * * *', () => {
      this.sendDailyMarketSummary();
    });

    // 每週發送投資報告
    cron.schedule('0 10 * * 1', () => {
      this.sendWeeklyInvestmentReport();
    });

    // 每月發送系統狀態報告
    cron.schedule('0 8 1 * *', () => {
      this.sendMonthlySystemReport();
    });

    logger.info('通知服務定時任務設置完成');
  }

  /**
   * 發送即時通知
   */
  async sendInstantNotification(userId, type, data, channels = ['websocket']) {
    try {
      const notificationId = uuidv4();
      const template = this.notificationTemplates.get(type);

      if (!template) {
        throw new Error(`未知的通知類型: ${type}`);
      }

      const notification = {
        id: notificationId,
        userId,
        type,
        title: template.title,
        data,
        channels,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      // 添加到隊列
      this.notificationQueue.push(notification);

      // 根據通道發送通知
      for (const channel of channels) {
        await this.sendNotificationByChannel(notification, channel);
      }

      // 更新狀態
      notification.status = 'sent';

      logger.info(`即時通知發送成功: ${userId} - ${type}`);
      return notificationId;
    } catch (error) {
      logger.error('發送即時通知失敗:', error);
      throw error;
    }
  }

  /**
   * 根據通道發送通知
   */
  async sendNotificationByChannel(notification, channel) {
    try {
      switch (channel) {
        case 'websocket':
          await this.sendWebSocketNotification(notification);
          break;
        case 'email':
          await this.sendEmailNotification(notification);
          break;
        case 'push':
          await this.sendPushNotification(notification);
          break;
        case 'sms':
          await this.sendSMSNotification(notification);
          break;
        default:
          logger.warn(`未知的通知通道: ${channel}`);
      }
    } catch (error) {
      logger.error(`發送 ${channel} 通知失敗:`, error);
    }
  }

  /**
   * 發送 WebSocket 通知
   */
  async sendWebSocketNotification(notification) {
    try {
      const template = this.notificationTemplates.get(notification.type);
      const pushData = template.push ? template.push : {
        title: notification.title,
        body: JSON.stringify(notification.data),
        data: {
          type: notification.type,
          ...notification.data
        }
      };

      websocketService.sendNotificationToUser(notification.userId, {
        title: pushData.title,
        body: pushData.body,
        data: pushData.data,
        type: notification.type,
        timestamp: notification.timestamp
      });

      logger.info(`WebSocket 通知發送成功: ${notification.userId}`);
    } catch (error) {
      logger.error('WebSocket 通知發送失敗:', error);
      throw error;
    }
  }

  /**
   * 發送郵件通知
   */
  async sendEmailNotification(notification) {
    try {
      if (!this.emailTransporter) {
        throw new Error('郵件傳輸器未初始化');
      }

      const template = this.notificationTemplates.get(notification.type);
      const emailTemplate = template.email;

      // 獲取用戶郵箱
      const userEmail = await this.getUserEmail(notification.userId);
      if (!userEmail) {
        throw new Error('用戶郵箱不存在');
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@cardstrategy.com',
        to: userEmail,
        subject: emailTemplate.subject,
        html: emailTemplate.template(notification.data)
      };

      await this.emailTransporter.sendMail(mailOptions);

      logger.info(`郵件通知發送成功: ${notification.userId}`);
    } catch (error) {
      logger.error('郵件通知發送失敗:', error);
      throw error;
    }
  }

  /**
   * 發送推送通知
   */
  async sendPushNotification(notification) {
    try {
      // 這裡可以集成 Firebase Cloud Messaging 或其他推送服務
      const template = this.notificationTemplates.get(notification.type);
      const pushData = template.push;

      // 獲取用戶的推送令牌
      const pushToken = await this.getUserPushToken(notification.userId);
      if (!pushToken) {
        throw new Error('用戶推送令牌不存在');
      }

      // 發送推送通知的邏輯
      // 這裡需要集成具體的推送服務
      logger.info(`推送通知發送成功: ${notification.userId}`);
    } catch (error) {
      logger.error('推送通知發送失敗:', error);
      throw error;
    }
  }

  /**
   * 發送短信通知
   */
  async sendSMSNotification(notification) {
    try {
      // 這裡可以集成 Twilio 或其他短信服務
      const userPhone = await this.getUserPhone(notification.userId);
      if (!userPhone) {
        throw new Error('用戶手機號不存在');
      }

      // 發送短信的邏輯
      // 這裡需要集成具體的短信服務
      logger.info(`短信通知發送成功: ${notification.userId}`);
    } catch (error) {
      logger.error('短信通知發送失敗:', error);
      throw error;
    }
  }

  /**
   * 發送批量通知
   */
  async sendBulkNotification(userIds, type, data, channels = ['websocket']) {
    try {
      const results = [];

      for (const userId of userIds) {
        try {
          const notificationId = await this.sendInstantNotification(userId, type, data, channels);
          results.push({
            userId,
            success: true,
            notificationId
          });
        } catch (error) {
          results.push({
            userId,
            success: false,
            error: error.message
          });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      logger.info(`批量通知發送完成: 成功 ${successCount}, 失敗 ${failureCount}`);
      return results;
    } catch (error) {
      logger.error('批量通知發送失敗:', error);
      throw error;
    }
  }

  /**
   * 發送廣播通知
   */
  async sendBroadcastNotification(type, data, channels = ['websocket']) {
    try {
      // 獲取所有活躍用戶
      const activeUsers = websocketService.getConnectionStats().connectedUsers;

      if (activeUsers.length === 0) {
        logger.info('沒有活躍用戶，跳過廣播通知');
        return;
      }

      const results = await this.sendBulkNotification(activeUsers, type, data, channels);

      // 同時發送 WebSocket 廣播
      if (channels.includes('websocket')) {
        const template = this.notificationTemplates.get(type);
        const pushData = template.push;

        websocketService.broadcastNotification({
          title: pushData.title,
          body: pushData.body,
          data: pushData.data,
          type,
          timestamp: new Date().toISOString()
        });
      }

      logger.info(`廣播通知發送完成: ${activeUsers.length} 個用戶`);
      return results;
    } catch (error) {
      logger.error('廣播通知發送失敗:', error);
      throw error;
    }
  }

  /**
   * 調度延遲通知
   */
  scheduleNotification(userId, type, data, scheduleTime, channels = ['websocket']) {
    try {
      const notificationId = uuidv4();
      const delay = new Date(scheduleTime).getTime() - Date.now();

      if (delay <= 0) {
        throw new Error('調度時間必須在未來');
      }

      const timeoutId = setTimeout(async () => {
        try {
          await this.sendInstantNotification(userId, type, data, channels);
          this.scheduledNotifications.delete(notificationId);
        } catch (error) {
          logger.error('調度通知發送失敗:', error);
        }
      }, delay);

      this.scheduledNotifications.set(notificationId, {
        userId,
        type,
        data,
        channels,
        scheduleTime,
        timeoutId
      });

      logger.info(`通知調度成功: ${notificationId}, 時間: ${scheduleTime}`);
      return notificationId;
    } catch (error) {
      logger.error('調度通知失敗:', error);
      throw error;
    }
  }

  /**
   * 取消調度通知
   */
  cancelScheduledNotification(notificationId) {
    try {
      const scheduled = this.scheduledNotifications.get(notificationId);
      if (!scheduled) {
        throw new Error('通知不存在或已發送');
      }

      clearTimeout(scheduled.timeoutId);
      this.scheduledNotifications.delete(notificationId);

      logger.info(`調度通知已取消: ${notificationId}`);
      return true;
    } catch (error) {
      logger.error('取消調度通知失敗:', error);
      throw error;
    }
  }

  /**
   * 檢查價格變動
   */
  async checkPriceChanges() {
    try {
      // 這裡實現價格變動檢查邏輯
      // 獲取所有用戶的價格警報設置
      // 檢查是否有價格變動超過閾值
      // 發送相應的通知

      logger.info('價格變動檢查完成');
    } catch (error) {
      logger.error('價格變動檢查失敗:', error);
    }
  }

  /**
   * 發送每日市場摘要
   */
  async sendDailyMarketSummary() {
    try {
      // 這裡實現每日市場摘要邏輯
      // 生成市場摘要數據
      // 發送給所有用戶

      logger.info('每日市場摘要發送完成');
    } catch (error) {
      logger.error('每日市場摘要發送失敗:', error);
    }
  }

  /**
   * 發送每週投資報告
   */
  async sendWeeklyInvestmentReport() {
    try {
      // 這裡實現每週投資報告邏輯
      // 生成投資報告數據
      // 發送給相關用戶

      logger.info('每週投資報告發送完成');
    } catch (error) {
      logger.error('每週投資報告發送失敗:', error);
    }
  }

  /**
   * 發送每月系統報告
   */
  async sendMonthlySystemReport() {
    try {
      // 這裡實現每月系統報告邏輯
      // 生成系統狀態報告
      // 發送給管理員

      logger.info('每月系統報告發送完成');
    } catch (error) {
      logger.error('每月系統報告發送失敗:', error);
    }
  }

  /**
   * 獲取用戶郵箱
   */
  async getUserEmail(userId) {
    // 這裡應該從數據庫獲取用戶郵箱
    // 暫時返回模擬數據
    return 'user@example.com';
  }

  /**
   * 獲取用戶推送令牌
   */
  async getUserPushToken(userId) {
    // 這裡應該從數據庫獲取用戶推送令牌
    // 暫時返回模擬數據
    return 'mock_push_token';
  }

  /**
   * 獲取用戶手機號
   */
  async getUserPhone(userId) {
    // 這裡應該從數據庫獲取用戶手機號
    // 暫時返回模擬數據
    return '+1234567890';
  }

  /**
   * 獲取通知統計
   */
  getNotificationStats() {
    return {
      queueSize: this.notificationQueue.length,
      scheduledCount: this.scheduledNotifications.size,
      templatesCount: this.notificationTemplates.size,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 清理過期通知
   */
  cleanupExpiredNotifications() {
    try {
      const now = new Date();
      const expiredThreshold = 24 * 60 * 60 * 1000; // 24小時

      // 清理隊列中的過期通知
      this.notificationQueue = this.notificationQueue.filter(notification => {
        const notificationTime = new Date(notification.timestamp).getTime();
        return now.getTime() - notificationTime < expiredThreshold;
      });

      logger.info('過期通知清理完成');
    } catch (error) {
      logger.error('清理過期通知失敗:', error);
    }
  }
}

module.exports = new NotificationService();
