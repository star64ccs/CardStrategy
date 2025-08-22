const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const { current: config } = require('../config/environments');

class AlertService {
  constructor() {
    this.alerts = [];
    this.alertHistory = [];
    this.maxHistorySize = 1000;
    this.emailTransporter = null;
    this.webhookUrl = process.env.ALERT_WEBHOOK_URL;
    this.slackWebhook = process.env.SLACK_WEBHOOK_URL;
    this.alertThresholds = {
      cpu: parseFloat(process.env.CPU_ALERT_THRESHOLD) || 80,
      memory: parseFloat(process.env.MEMORY_ALERT_THRESHOLD) || 85,
      disk: parseFloat(process.env.DISK_ALERT_THRESHOLD) || 90,
      responseTime:
        parseFloat(process.env.RESPONSE_TIME_ALERT_THRESHOLD) || 2000,
      errorRate: parseFloat(process.env.ERROR_RATE_ALERT_THRESHOLD) || 5,
      databaseConnections:
        parseFloat(process.env.DB_CONNECTION_ALERT_THRESHOLD) || 80,
    };
  }

  /**
   * 初始化警報服務
   */
  async initialize() {
    try {
      // 初始化郵件傳輸器
      if (process.env.SMTP_HOST) {
        this.emailTransporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      }

      logger.info('警報服務初始化完成');
    } catch (error) {
      logger.error('警報服務初始化失敗:', error);
    }
  }

  /**
   * 檢查系統指標並觸發警報
   */
  async checkMetrics(metrics) {
    const alerts = [];

    // 檢查 CPU 使用率
    if (metrics.cpu && metrics.cpu.usage > this.alertThresholds.cpu) {
      alerts.push({
        type: 'cpu_high',
        severity: this.getSeverity(metrics.cpu.usage, this.alertThresholds.cpu),
        message: `CPU 使用率過高: ${metrics.cpu.usage.toFixed(2)}%`,
        value: metrics.cpu.usage,
        threshold: this.alertThresholds.cpu,
        timestamp: new Date().toISOString(),
      });
    }

    // 檢查記憶體使用率
    if (metrics.memory && metrics.memory.usage > this.alertThresholds.memory) {
      alerts.push({
        type: 'memory_high',
        severity: this.getSeverity(
          metrics.memory.usage,
          this.alertThresholds.memory
        ),
        message: `記憶體使用率過高: ${metrics.memory.usage.toFixed(2)}%`,
        value: metrics.memory.usage,
        threshold: this.alertThresholds.memory,
        timestamp: new Date().toISOString(),
      });
    }

    // 檢查磁碟使用率
    if (metrics.disk && metrics.disk.usage > this.alertThresholds.disk) {
      alerts.push({
        type: 'disk_high',
        severity: this.getSeverity(
          metrics.disk.usage,
          this.alertThresholds.disk
        ),
        message: `磁碟使用率過高: ${metrics.disk.usage.toFixed(2)}%`,
        value: metrics.disk.usage,
        threshold: this.alertThresholds.disk,
        timestamp: new Date().toISOString(),
      });
    }

    // 檢查響應時間
    if (
      metrics.responseTime &&
      metrics.responseTime.average > this.alertThresholds.responseTime
    ) {
      alerts.push({
        type: 'response_time_high',
        severity: this.getSeverity(
          metrics.responseTime.average,
          this.alertThresholds.responseTime
        ),
        message: `API 響應時間過高: ${metrics.responseTime.average.toFixed(2)}ms`,
        value: metrics.responseTime.average,
        threshold: this.alertThresholds.responseTime,
        timestamp: new Date().toISOString(),
      });
    }

    // 檢查錯誤率
    if (
      metrics.errorRate &&
      metrics.errorRate.percentage > this.alertThresholds.errorRate
    ) {
      alerts.push({
        type: 'error_rate_high',
        severity: this.getSeverity(
          metrics.errorRate.percentage,
          this.alertThresholds.errorRate
        ),
        message: `錯誤率過高: ${metrics.errorRate.percentage.toFixed(2)}%`,
        value: metrics.errorRate.percentage,
        threshold: this.alertThresholds.errorRate,
        timestamp: new Date().toISOString(),
      });
    }

    // 檢查數據庫連接
    if (
      metrics.database &&
      metrics.database.connectionUsage >
        this.alertThresholds.databaseConnections
    ) {
      alerts.push({
        type: 'database_connections_high',
        severity: this.getSeverity(
          metrics.database.connectionUsage,
          this.alertThresholds.databaseConnections
        ),
        message: `數據庫連接使用率過高: ${metrics.database.connectionUsage.toFixed(2)}%`,
        value: metrics.database.connectionUsage,
        threshold: this.alertThresholds.databaseConnections,
        timestamp: new Date().toISOString(),
      });
    }

    // 處理警報
    for (const alert of alerts) {
      await this.processAlert(alert);
    }

    return alerts;
  }

  /**
   * 處理單個警報
   */
  async processAlert(alert) {
    try {
      // 檢查是否為重複警報
      const isDuplicate = this.isDuplicateAlert(alert);
      if (isDuplicate) {
        logger.debug(`跳過重複警報: ${alert.message}`);
        return;
      }

      // 記錄警報
      this.alerts.push(alert);
      this.alertHistory.push({
        ...alert,
        processed: true,
        processedAt: new Date().toISOString(),
      });

      // 限制歷史記錄大小
      if (this.alertHistory.length > this.maxHistorySize) {
        this.alertHistory = this.alertHistory.slice(-this.maxHistorySize);
      }

      // 根據嚴重程度發送通知
      if (alert.severity === 'critical') {
        await this.sendCriticalAlert(alert);
      } else if (alert.severity === 'warning') {
        await this.sendWarningAlert(alert);
      }

      logger.warn(`警報觸發: ${alert.message}`, alert);
    } catch (error) {
      logger.error('處理警報失敗:', error);
    }
  }

  /**
   * 發送嚴重警報
   */
  async sendCriticalAlert(alert) {
    try {
      // 發送郵件
      await this.sendEmailAlert(alert, 'critical');

      // 發送 Slack 通知
      await this.sendSlackAlert(alert, 'critical');

      // 發送 Webhook
      await this.sendWebhookAlert(alert, 'critical');

      // 發送 SMS（如果配置了）
      await this.sendSMSAlert(alert, 'critical');
    } catch (error) {
      logger.error('發送嚴重警報失敗:', error);
    }
  }

  /**
   * 發送警告警報
   */
  async sendWarningAlert(alert) {
    try {
      // 發送郵件
      await this.sendEmailAlert(alert, 'warning');

      // 發送 Slack 通知
      await this.sendSlackAlert(alert, 'warning');
    } catch (error) {
      logger.error('發送警告警報失敗:', error);
    }
  }

  /**
   * 發送郵件警報
   */
  async sendEmailAlert(alert, severity) {
    if (!this.emailTransporter || !process.env.ALERT_EMAIL_TO) {
      return;
    }

    try {
      const subject = `[${severity.toUpperCase()}] CardStrategy 系統警報`;
      const html = this.generateEmailContent(alert, severity);

      await this.emailTransporter.sendMail({
        from: process.env.ALERT_EMAIL_FROM || 'alerts@cardstrategy.com',
        to: process.env.ALERT_EMAIL_TO,
        subject,
        html,
      });

      logger.info(`郵件警報已發送: ${alert.message}`);
    } catch (error) {
      logger.error('發送郵件警報失敗:', error);
    }
  }

  /**
   * 發送 Slack 警報
   */
  async sendSlackAlert(alert, severity) {
    if (!this.slackWebhook) {
      return;
    }

    try {
      const payload = {
        text: `🚨 *${severity.toUpperCase()} 警報*`,
        attachments: [
          {
            color: severity === 'critical' ? '#ff0000' : '#ffa500',
            fields: [
              {
                title: '警報類型',
                value: alert.type,
                short: true,
              },
              {
                title: '嚴重程度',
                value: severity,
                short: true,
              },
              {
                title: '消息',
                value: alert.message,
                short: false,
              },
              {
                title: '當前值',
                value: `${alert.value}`,
                short: true,
              },
              {
                title: '閾值',
                value: `${alert.threshold}`,
                short: true,
              },
              {
                title: '時間',
                value: new Date(alert.timestamp).toLocaleString(),
                short: false,
              },
            ],
          },
        ],
      };

      const response = await fetch(this.slackWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        logger.info(`Slack 警報已發送: ${alert.message}`);
      } else {
        logger.error('Slack 警報發送失敗:', response.statusText);
      }
    } catch (error) {
      logger.error('發送 Slack 警報失敗:', error);
    }
  }

  /**
   * 發送 Webhook 警報
   */
  async sendWebhookAlert(alert, severity) {
    if (!this.webhookUrl) {
      return;
    }

    try {
      const payload = {
        alert,
        severity,
        timestamp: new Date().toISOString(),
        service: 'cardstrategy',
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        logger.info(`Webhook 警報已發送: ${alert.message}`);
      } else {
        logger.error('Webhook 警報發送失敗:', response.statusText);
      }
    } catch (error) {
      logger.error('發送 Webhook 警報失敗:', error);
    }
  }

  /**
   * 發送 SMS 警報
   */
  async sendSMSAlert(alert, severity) {
    // 這裡可以集成 SMS 服務提供商
    // 例如 Twilio、AWS SNS 等
    logger.info(`SMS 警報功能待實現: ${alert.message}`);
  }

  /**
   * 生成郵件內容
   */
  generateEmailContent(alert, severity) {
    const color = severity === 'critical' ? '#ff0000' : '#ffa500';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
          <h1>🚨 ${severity.toUpperCase()} 警報</h1>
        </div>
        
        <div style="padding: 20px; border: 1px solid #ddd;">
          <h2>警報詳情</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">警報類型:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${alert.type}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">嚴重程度:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${severity}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">消息:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${alert.message}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">當前值:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${alert.value}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">閾值:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${alert.threshold}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">時間:</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date(alert.timestamp).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <div style="padding: 20px; background-color: #f9f9f9; text-align: center;">
          <p>請立即檢查系統狀態並採取相應措施。</p>
          <p>此郵件由 CardStrategy 監控系統自動發送。</p>
        </div>
      </div>
    `;
  }

  /**
   * 獲取嚴重程度
   */
  getSeverity(value, threshold) {
    const percentage = (value / threshold) * 100;

    if (percentage >= 120) {
      return 'critical';
    } else if (percentage >= 100) {
      return 'warning';
    }
    return 'info';
  }

  /**
   * 檢查是否為重複警報
   */
  isDuplicateAlert(alert) {
    const recentAlerts = this.alerts.filter(
      (a) =>
        a.type === alert.type &&
        Date.now() - new Date(a.timestamp).getTime() < 5 * 60 * 1000 // 5 分鐘內
    );

    return recentAlerts.length > 0;
  }

  /**
   * 獲取當前警報
   */
  getCurrentAlerts() {
    return this.alerts;
  }

  /**
   * 獲取警報歷史
   */
  getAlertHistory(limit = 100) {
    return this.alertHistory.slice(-limit);
  }

  /**
   * 清除已解決的警報
   */
  clearResolvedAlerts() {
    const now = Date.now();
    this.alerts = this.alerts.filter(
      (alert) => now - new Date(alert.timestamp).getTime() < 24 * 60 * 60 * 1000 // 保留 24 小時
    );
  }

  /**
   * 手動觸發警報
   */
  async triggerManualAlert(type, message, severity = 'warning', data = {}) {
    const alert = {
      type,
      severity,
      message,
      value: data.value || 0,
      threshold: data.threshold || 0,
      timestamp: new Date().toISOString(),
      manual: true,
      ...data,
    };

    await this.processAlert(alert);
    return alert;
  }

  /**
   * 更新警報閾值
   */
  updateThresholds(newThresholds) {
    this.alertThresholds = {
      ...this.alertThresholds,
      ...newThresholds,
    };

    logger.info('警報閾值已更新:', this.alertThresholds);
  }

  /**
   * 獲取警報統計
   */
  getAlertStats() {
    const now = Date.now();
    const last24h = this.alertHistory.filter(
      (alert) => now - new Date(alert.timestamp).getTime() < 24 * 60 * 60 * 1000
    );

    const last7d = this.alertHistory.filter(
      (alert) =>
        now - new Date(alert.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000
    );

    return {
      currentAlerts: this.alerts.length,
      totalAlerts24h: last24h.length,
      totalAlerts7d: last7d.length,
      totalAlerts: this.alertHistory.length,
      alertsByType: this.groupAlertsByType(last24h),
      alertsBySeverity: this.groupAlertsBySeverity(last24h),
    };
  }

  /**
   * 按類型分組警報
   */
  groupAlertsByType(alerts) {
    return alerts.reduce((groups, alert) => {
      groups[alert.type] = (groups[alert.type] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * 按嚴重程度分組警報
   */
  groupAlertsBySeverity(alerts) {
    return alerts.reduce((groups, alert) => {
      groups[alert.severity] = (groups[alert.severity] || 0) + 1;
      return groups;
    }, {});
  }
}

module.exports = new AlertService();
