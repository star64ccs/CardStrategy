const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class AlertService {
  constructor() {
    this.alerts = new Map();
    this.alertRules = new Map();
    this.alertHistory = [];
    this.initializeAlertRules();
  }

  /**
   * 初始化警報規則
   */
  initializeAlertRules() {
    // 價格變動警報規則
    this.alertRules.set('price_change', {
      name: '價格變動警報',
      description: '當卡片價格變動超過指定百分比時觸發',
      conditions: {
        priceChangePercent: 10, // 10% 變動
        timeWindow: 24 * 60 * 60 * 1000 // 24小時
      },
      severity: 'medium',
      enabled: true
    });

    // 系統性能警報規則
    this.alertRules.set('system_performance', {
      name: '系統性能警報',
      description: '當系統性能指標異常時觸發',
      conditions: {
        cpuUsage: 80, // CPU 使用率超過 80%
        memoryUsage: 85, // 內存使用率超過 85%
        responseTime: 5000 // 響應時間超過 5 秒
      },
      severity: 'high',
      enabled: true
    });

    // 數據庫警報規則
    this.alertRules.set('database_health', {
      name: '數據庫健康警報',
      description: '當數據庫連接或查詢出現問題時觸發',
      conditions: {
        connectionErrors: 5, // 連接錯誤次數
        queryTimeout: 10000, // 查詢超時時間
        slowQueries: 10 // 慢查詢數量
      },
      severity: 'critical',
      enabled: true
    });
  }

  /**
   * 創建警報
   */
  async createAlert(type, data, severity = 'medium') {
    try {
      const alert = {
        id: uuidv4(),
        type,
        title: data.title || this.alertRules.get(type)?.name || '未知警報',
        message: data.message || '系統檢測到異常情況',
        severity: severity || this.alertRules.get(type)?.severity || 'medium',
        data,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        acknowledgedAt: null,
        acknowledgedBy: null,
        resolvedAt: null,
        resolvedBy: null
      };

      this.alerts.set(alert.id, alert);
      this.alertHistory.push(alert);

      // 記錄警報
      logger.warn(`警報創建: ${alert.title} - ${alert.message}`, {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity
      });

      // 發送通知
      await this.sendAlertNotification(alert);

      return alert;
    } catch (error) {
      logger.error('創建警報失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取警報列表
   */
  async getAlerts(filters = {}) {
    try {
      let alerts = Array.from(this.alerts.values());

      // 應用過濾器
      if (filters.status) {
        alerts = alerts.filter(alert => alert.status === filters.status);
      }

      if (filters.severity) {
        alerts = alerts.filter(alert => alert.severity === filters.severity);
      }

      if (filters.type) {
        alerts = alerts.filter(alert => alert.type === filters.type);
      }

      if (filters.startDate) {
        alerts = alerts.filter(alert => alert.createdAt >= new Date(filters.startDate));
      }

      if (filters.endDate) {
        alerts = alerts.filter(alert => alert.createdAt <= new Date(filters.endDate));
      }

      // 排序
      alerts.sort((a, b) => b.createdAt - a.createdAt);

      return alerts;
    } catch (error) {
      logger.error('獲取警報列表失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取警報詳情
   */
  async getAlertById(alertId) {
    try {
      const alert = this.alerts.get(alertId);
      if (!alert) {
        throw new Error('警報不存在');
      }
      return alert;
    } catch (error) {
      logger.error('獲取警報詳情失敗:', error);
      throw error;
    }
  }

  /**
   * 更新警報狀態
   */
  async updateAlertStatus(alertId, status, userId = null) {
    try {
      const alert = this.alerts.get(alertId);
      if (!alert) {
        throw new Error('警報不存在');
      }

      alert.status = status;
      alert.updatedAt = new Date();

      if (status === 'acknowledged') {
        alert.acknowledgedAt = new Date();
        alert.acknowledgedBy = userId;
      } else if (status === 'resolved') {
        alert.resolvedAt = new Date();
        alert.resolvedBy = userId;
      }

      this.alerts.set(alertId, alert);

      logger.info(`警報狀態更新: ${alertId} -> ${status}`);
      return alert;
    } catch (error) {
      logger.error('更新警報狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 確認警報
   */
  async acknowledgeAlert(alertId, userId) {
    return await this.updateAlertStatus(alertId, 'acknowledged', userId);
  }

  /**
   * 解決警報
   */
  async resolveAlert(alertId, userId) {
    return await this.updateAlertStatus(alertId, 'resolved', userId);
  }

  /**
   * 批量更新警報狀態
   */
  async bulkUpdateAlertStatus(alertIds, status, userId = null) {
    try {
      const results = [];
      for (const alertId of alertIds) {
        try {
          const result = await this.updateAlertStatus(alertId, status, userId);
          results.push(result);
        } catch (error) {
          logger.error(`批量更新警報失敗 ${alertId}:`, error);
          results.push({ error: error.message });
        }
      }
      return results;
    } catch (error) {
      logger.error('批量更新警報狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 刪除警報
   */
  async deleteAlert(alertId) {
    try {
      const alert = this.alerts.get(alertId);
      if (!alert) {
        throw new Error('警報不存在');
      }

      this.alerts.delete(alertId);
      logger.info(`警報已刪除: ${alertId}`);
      return { success: true };
    } catch (error) {
      logger.error('刪除警報失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取警報統計
   */
  async getAlertStats() {
    try {
      const alerts = Array.from(this.alerts.values());
      const stats = {
        total: alerts.length,
        active: alerts.filter(a => a.status === 'active').length,
        acknowledged: alerts.filter(a => a.status === 'acknowledged').length,
        resolved: alerts.filter(a => a.status === 'resolved').length,
        bySeverity: {
          low: alerts.filter(a => a.severity === 'low').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          high: alerts.filter(a => a.severity === 'high').length,
          critical: alerts.filter(a => a.severity === 'critical').length
        },
        byType: {}
      };

      // 按類型統計
      alerts.forEach(alert => {
        if (!stats.byType[alert.type]) {
          stats.byType[alert.type] = 0;
        }
        stats.byType[alert.type]++;
      });

      return stats;
    } catch (error) {
      logger.error('獲取警報統計失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取活躍警報
   */
  async getActiveAlerts() {
    try {
      return await this.getAlerts({ status: 'active' });
    } catch (error) {
      logger.error('獲取活躍警報失敗:', error);
      throw error;
    }
  }

  /**
   * 發送警報通知
   */
  async sendAlertNotification(alert) {
    try {
      // 這裡可以集成通知服務
      logger.info(`發送警報通知: ${alert.title}`, {
        alertId: alert.id,
        severity: alert.severity
      });

      // 可以發送郵件、推送通知等
      // await notificationService.sendNotification(alert);
    } catch (error) {
      logger.error('發送警報通知失敗:', error);
    }
  }

  /**
   * 檢查警報規則
   */
  async checkAlertRules(data) {
    try {
      const triggeredAlerts = [];

      for (const [ruleType, rule] of this.alertRules) {
        if (!rule.enabled) continue;

        let shouldTrigger = false;

        switch (ruleType) {
          case 'price_change':
            if (data.priceChangePercent >= rule.conditions.priceChangePercent) {
              shouldTrigger = true;
            }
            break;

          case 'system_performance':
            if (data.cpuUsage >= rule.conditions.cpuUsage ||
                data.memoryUsage >= rule.conditions.memoryUsage ||
                data.responseTime >= rule.conditions.responseTime) {
              shouldTrigger = true;
            }
            break;

          case 'database_health':
            if (data.connectionErrors >= rule.conditions.connectionErrors ||
                data.queryTimeout >= rule.conditions.queryTimeout ||
                data.slowQueries >= rule.conditions.slowQueries) {
              shouldTrigger = true;
            }
            break;
        }

        if (shouldTrigger) {
          const alert = await this.createAlert(ruleType, {
            title: rule.name,
            message: rule.description,
            ...data
          }, rule.severity);
          triggeredAlerts.push(alert);
        }
      }

      return triggeredAlerts;
    } catch (error) {
      logger.error('檢查警報規則失敗:', error);
      throw error;
    }
  }

  /**
   * 清理舊警報
   */
  async cleanupOldAlerts(daysToKeep = 30) {
    try {
      const cutoffDate = moment().subtract(daysToKeep, 'days').toDate();
      const alertsToDelete = [];

      for (const [alertId, alert] of this.alerts) {
        if (alert.createdAt < cutoffDate && alert.status === 'resolved') {
          alertsToDelete.push(alertId);
        }
      }

      for (const alertId of alertsToDelete) {
        await this.deleteAlert(alertId);
      }

      logger.info(`清理了 ${alertsToDelete.length} 個舊警報`);
      return alertsToDelete.length;
    } catch (error) {
      logger.error('清理舊警報失敗:', error);
      throw error;
    }
  }
}

module.exports = new AlertService();
