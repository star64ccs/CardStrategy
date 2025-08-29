import { apiService } from './apiService';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { notificationService } from './notificationService';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 數據洩露事件類型
export type DataBreachType =
  | 'unauthorized_access' // 未授權訪問
  | 'data_exfiltration' // 數據外洩
  | 'system_compromise' // 系統被攻破
  | 'insider_threat' // 內部威脅
  | 'third_party_breach' // 第三方洩露
  | 'physical_breach' // 物理安全洩露
  | 'accidental_disclosure' // 意外披露
  | 'malware_attack' // 惡意軟件攻擊
  | 'phishing_attack' // 釣魚攻擊
  | 'unknown'; // 未知類型

// 風險等級
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

// 影響範圍
export interface AffectedData {
  dataCategories: string[];
  affectedUsers: number;
  dataSensitivity: 'low' | 'medium' | 'high' | 'critical';
  estimatedRecords: number;
}

// 數據洩露事件
export interface DataBreachEvent {
  id: string;
  title: string;
  description: string;
  breachType: DataBreachType;
  riskLevel: RiskLevel;
  affectedData: AffectedData;
  discoveryDate: Date;
  notificationDate?: Date;
  containmentDate?: Date;
  resolutionDate?: Date;
  status: 'discovered' | 'investigating' | 'contained' | 'resolved';
  rootCause?: string;
  remediation?: string;
  regulatoryNotification: boolean;
  userNotification: boolean;
  affectedRegions: string[];
  complianceDeadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 通知配置
export interface NotificationConfig {
  enableAutoNotification: boolean;
  notificationDelay: number; // 小時
  regulatoryDeadline: number; // 小時 (通常72小時)
  userNotificationTemplate: string;
  regulatoryNotificationTemplate: string;
  notificationChannels: ('email' | 'sms' | 'push' | 'in_app')[];
  escalationContacts: string[];
}

// 檢測規則
export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    eventType: string;
    threshold: number;
    timeWindow: number; // 分鐘
    severity: RiskLevel;
  };
  enabled: boolean;
  createdAt: Date;
}

// 通知狀態
export interface NotificationStatus {
  eventId: string;
  regulatoryNotificationSent: boolean;
  regulatoryNotificationDate?: Date;
  userNotificationSent: boolean;
  userNotificationDate?: Date;
  notificationCount: number;
  lastNotificationDate?: Date;
  nextNotificationDate?: Date;
}

class DataBreachNotificationService {
  private config: NotificationConfig;
  private detectionRules: DetectionRule[];
  private isMonitoring: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;

  constructor() {
    this.config = {
      enableAutoNotification: true,
      notificationDelay: 1, // 1小時延遲
      regulatoryDeadline: 72, // 72小時
      userNotificationTemplate: 'default',
      regulatoryNotificationTemplate: 'regulatory',
      notificationChannels: ['email', 'push'],
      escalationContacts: [],
    };

    this.detectionRules = this.getDefaultDetectionRules();
  }

  /**
   * 初始化服務
   */
  async initialize(): Promise<void> {
    try {
      logger.info('初始化數據洩露通知服務');

      // 加載配置
      await this.loadConfiguration();

      // 加載檢測規則
      await this.loadDetectionRules();

      // 啟動監控
      await this.startMonitoring();

      logger.info('數據洩露通知服務初始化完成');
    } catch (error) {
      logger.error('初始化數據洩露通知服務失敗:', error);
      throw error;
    }
  }

  /**
   * 加載配置
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const config = await storage.get('dataBreachNotificationConfig');
      if (config) {
        this.config = { ...this.config, ...config };
      }
    } catch (error) {
      logger.warn('無法加載數據洩露通知配置，使用默認配置:', error);
    }
  }

  /**
   * 加載檢測規則
   */
  private async loadDetectionRules(): Promise<void> {
    try {
      const rules = await storage.get('dataBreachDetectionRules');
      if (rules) {
        this.detectionRules = rules;
      }
    } catch (error) {
      logger.warn('無法加載檢測規則，使用默認規則:', error);
    }
  }

  /**
   * 獲取默認檢測規則
   */
  private getDefaultDetectionRules(): DetectionRule[] {
    return [
      {
        id: 'unauthorized_access_detection',
        name: '未授權訪問檢測',
        description: '檢測異常的數據訪問模式',
        conditions: {
          eventType: 'data_access',
          threshold: 10,
          timeWindow: 60,
          severity: 'high',
        },
        enabled: true,
        createdAt: new Date(),
      },
      {
        id: 'data_exfiltration_detection',
        name: '數據外洩檢測',
        description: '檢測大規模數據下載或傳輸',
        conditions: {
          eventType: 'data_transfer',
          threshold: 1000,
          timeWindow: 30,
          severity: 'critical',
        },
        enabled: true,
        createdAt: new Date(),
      },
      {
        id: 'failed_login_detection',
        name: '登錄失敗檢測',
        description: '檢測異常的登錄失敗模式',
        conditions: {
          eventType: 'login_failure',
          threshold: 5,
          timeWindow: 15,
          severity: 'medium',
        },
        enabled: true,
        createdAt: new Date(),
      },
    ];
  }

  /**
   * 啟動監控
   */
  async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      logger.warn('數據洩露監控已在運行中');
      return;
    }

    try {
      this.isMonitoring = true;

      // 每5分鐘檢查一次
      this.monitoringInterval = setInterval(
        () => {
          this.performSecurityScan();
        },
        5 * 60 * 1000
      );

      logger.info('數據洩露監控已啟動');
    } catch (error) {
      this.isMonitoring = false;
      logger.error('啟動數據洩露監控失敗:', error);
      throw error;
    }
  }

  /**
   * 停止監控
   */
  async stopMonitoring(): Promise<void> {
    if (!this.isMonitoring) {
      return;
    }

    try {
      this.isMonitoring = false;

      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
        this.monitoringInterval = undefined;
      }

      logger.info('數據洩露監控已停止');
    } catch (error) {
      logger.error('停止數據洩露監控失敗:', error);
      throw error;
    }
  }

  /**
   * 執行安全掃描
   */
  private async performSecurityScan(): Promise<void> {
    try {
      // 檢查異常訪問模式
      await this.checkUnauthorizedAccess();

      // 檢查數據外洩
      await this.checkDataExfiltration();

      // 檢查系統完整性
      await this.checkSystemIntegrity();

      // 檢查第三方風險
      await this.checkThirdPartyRisks();
    } catch (error) {
      logger.error('安全掃描失敗:', error);
    }
  }

  /**
   * 檢查未授權訪問
   */
  private async checkUnauthorizedAccess(): Promise<void> {
    try {
      // 這裡應該調用實際的安全日誌分析
      // 目前使用模擬數據
      const suspiciousActivities = await this.getSuspiciousActivities();

      for (const activity of suspiciousActivities) {
        if (this.shouldTriggerBreachAlert(activity)) {
          await this.createBreachEvent({
            title: '檢測到未授權訪問',
            description: `檢測到來自 ${activity.source} 的異常訪問模式`,
            breachType: 'unauthorized_access',
            riskLevel: activity.severity,
            affectedData: {
              dataCategories: activity.dataCategories,
              affectedUsers: activity.affectedUsers,
              dataSensitivity: activity.dataSensitivity,
              estimatedRecords: activity.estimatedRecords,
            },
            affectedRegions: activity.affectedRegions,
          });
        }
      }
    } catch (error) {
      logger.error('檢查未授權訪問失敗:', error);
    }
  }

  /**
   * 檢查數據外洩
   */
  private async checkDataExfiltration(): Promise<void> {
    try {
      // 檢查大規模數據傳輸
      const largeTransfers = await this.getLargeDataTransfers();

      for (const transfer of largeTransfers) {
        if (transfer.size > 1000 && transfer.isSuspicious) {
          await this.createBreachEvent({
            title: '檢測到數據外洩',
            description: `檢測到可疑的大規模數據傳輸: ${transfer.size} 條記錄`,
            breachType: 'data_exfiltration',
            riskLevel: 'critical',
            affectedData: {
              dataCategories: transfer.dataCategories,
              affectedUsers: transfer.affectedUsers,
              dataSensitivity: transfer.dataSensitivity,
              estimatedRecords: transfer.size,
            },
            affectedRegions: transfer.affectedRegions,
          });
        }
      }
    } catch (error) {
      logger.error('檢查數據外洩失敗:', error);
    }
  }

  /**
   * 檢查系統完整性
   */
  private async checkSystemIntegrity(): Promise<void> {
    try {
      // 檢查系統文件完整性
      const integrityIssues = await this.getSystemIntegrityIssues();

      for (const issue of integrityIssues) {
        if (issue.severity === 'high' || issue.severity === 'critical') {
          await this.createBreachEvent({
            title: '系統完整性問題',
            description: `檢測到系統完整性問題: ${issue.description}`,
            breachType: 'system_compromise',
            riskLevel: issue.severity,
            affectedData: {
              dataCategories: ['system_data'],
              affectedUsers: 0,
              dataSensitivity: 'high',
              estimatedRecords: 1,
            },
            affectedRegions: ['all'],
          });
        }
      }
    } catch (error) {
      logger.error('檢查系統完整性失敗:', error);
    }
  }

  /**
   * 檢查第三方風險
   */
  private async checkThirdPartyRisks(): Promise<void> {
    try {
      // 檢查第三方安全狀態
      const thirdPartyRisks = await this.getThirdPartyRisks();

      for (const risk of thirdPartyRisks) {
        if (risk.riskLevel === 'high' || risk.riskLevel === 'critical') {
          await this.createBreachEvent({
            title: '第三方安全風險',
            description: `檢測到第三方 ${risk.provider} 的安全風險`,
            breachType: 'third_party_breach',
            riskLevel: risk.riskLevel,
            affectedData: {
              dataCategories: risk.dataCategories,
              affectedUsers: risk.affectedUsers,
              dataSensitivity: risk.dataSensitivity,
              estimatedRecords: risk.estimatedRecords,
            },
            affectedRegions: risk.affectedRegions,
          });
        }
      }
    } catch (error) {
      logger.error('檢查第三方風險失敗:', error);
    }
  }

  /**
   * 創建數據洩露事件
   */
  async createBreachEvent(
    eventData: Partial<DataBreachEvent>
  ): Promise<DataBreachEvent> {
    try {
      const event: DataBreachEvent = {
        id: this.generateEventId(),
        title: eventData.title || '數據洩露事件',
        description: eventData.description || '檢測到數據洩露事件',
        breachType: eventData.breachType || 'unknown',
        riskLevel: eventData.riskLevel || 'medium',
        affectedData: eventData.affectedData || {
          dataCategories: [],
          affectedUsers: 0,
          dataSensitivity: 'low',
          estimatedRecords: 0,
        },
        discoveryDate: new Date(),
        status: 'discovered',
        regulatoryNotification: false,
        userNotification: false,
        affectedRegions: eventData.affectedRegions || ['all'],
        complianceDeadline: new Date(
          Date.now() + this.config.regulatoryDeadline * 60 * 60 * 1000
        ),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // 保存事件
      await this.saveBreachEvent(event);

      // 觸發通知
      await this.triggerNotifications(event);

      logger.warn('數據洩露事件已創建:', event.id);
      return event;
    } catch (error) {
      logger.error('創建數據洩露事件失敗:', error);
      throw error;
    }
  }

  /**
   * 觸發通知
   */
  private async triggerNotifications(event: DataBreachEvent): Promise<void> {
    try {
      if (!this.config.enableAutoNotification) {
        logger.info('自動通知已禁用，跳過通知發送');
        return;
      }

      // 檢查是否需要立即通知
      const shouldNotifyImmediately =
        event.riskLevel === 'critical' || event.riskLevel === 'high';

      if (shouldNotifyImmediately) {
        // 立即通知監管機構
        await this.notifyRegulatoryAuthorities(event);

        // 立即通知受影響用戶
        await this.notifyAffectedUsers(event);
      } else {
        // 延遲通知
        setTimeout(
          async () => {
            await this.notifyRegulatoryAuthorities(event);
            await this.notifyAffectedUsers(event);
          },
          this.config.notificationDelay * 60 * 60 * 1000
        );
      }

      // 通知內部團隊
      await this.notifyInternalTeam(event);
    } catch (error) {
      logger.error('觸發通知失敗:', error);
    }
  }

  /**
   * 通知監管機構
   */
  private async notifyRegulatoryAuthorities(
    event: DataBreachEvent
  ): Promise<void> {
    try {
      const notification = {
        type: 'regulatory_breach_notification',
        title: '數據洩露通知',
        message: this.generateRegulatoryNotification(event),
        priority: 'high',
        recipients: this.getRegulatoryContacts(event.affectedRegions),
        metadata: {
          eventId: event.id,
          breachType: event.breachType,
          riskLevel: event.riskLevel,
          affectedUsers: event.affectedData.affectedUsers,
        },
      };

      await notificationService.sendNotification(notification);

      // 更新事件狀態
      event.regulatoryNotification = true;
      event.notificationDate = new Date();
      await this.updateBreachEvent(event);

      logger.info('監管機構通知已發送:', event.id);
    } catch (error) {
      logger.error('通知監管機構失敗:', error);
    }
  }

  /**
   * 通知受影響用戶
   */
  private async notifyAffectedUsers(event: DataBreachEvent): Promise<void> {
    try {
      if (event.affectedData.affectedUsers === 0) {
        logger.info('沒有受影響用戶，跳過用戶通知');
        return;
      }

      const notification = {
        type: 'user_breach_notification',
        title: '重要安全通知',
        message: this.generateUserNotification(event),
        priority: 'high',
        recipients: 'affected_users',
        metadata: {
          eventId: event.id,
          breachType: event.breachType,
          riskLevel: event.riskLevel,
          dataCategories: event.affectedData.dataCategories,
        },
      };

      await notificationService.sendNotification(notification);

      // 更新事件狀態
      event.userNotification = true;
      await this.updateBreachEvent(event);

      logger.info('用戶通知已發送:', event.id);
    } catch (error) {
      logger.error('通知受影響用戶失敗:', error);
    }
  }

  /**
   * 通知內部團隊
   */
  private async notifyInternalTeam(event: DataBreachEvent): Promise<void> {
    try {
      const notification = {
        type: 'internal_breach_alert',
        title: '數據洩露警報',
        message: this.generateInternalNotification(event),
        priority: 'critical',
        recipients: this.config.escalationContacts,
        metadata: {
          eventId: event.id,
          breachType: event.breachType,
          riskLevel: event.riskLevel,
          complianceDeadline: event.complianceDeadline,
        },
      };

      await notificationService.sendNotification(notification);

      logger.info('內部團隊通知已發送:', event.id);
    } catch (error) {
      logger.error('通知內部團隊失敗:', error);
    }
  }

  /**
   * 生成監管機構通知
   */
  private generateRegulatoryNotification(event: DataBreachEvent): string {
    return `
數據洩露通知

事件ID: ${event.id}
發現時間: ${event.discoveryDate.toISOString()}
洩露類型: ${event.breachType}
風險等級: ${event.riskLevel}
受影響用戶: ${event.affectedData.affectedUsers}
受影響記錄: ${event.affectedData.estimatedRecords}
數據類別: ${event.affectedData.dataCategories.join(', ')}
受影響地區: ${event.affectedRegions.join(', ')}

事件描述: ${event.description}

合規截止時間: ${event.complianceDeadline.toISOString()}
    `.trim();
  }

  /**
   * 生成用戶通知
   */
  private generateUserNotification(event: DataBreachEvent): string {
    return `
重要安全通知

我們檢測到可能影響您數據安全的事件。我們正在積極調查並採取措施保護您的信息。

事件詳情:
- 事件類型: ${event.breachType}
- 風險等級: ${event.riskLevel}
- 受影響數據: ${event.affectedData.dataCategories.join(', ')}

我們建議您:
1. 更改密碼
2. 啟用雙因素認證
3. 監控賬戶活動
4. 檢查可疑活動

如需幫助，請聯繫我們的客戶支持團隊。
    `.trim();
  }

  /**
   * 生成內部通知
   */
  private generateInternalNotification(event: DataBreachEvent): string {
    return `
🚨 數據洩露警報 🚨

事件ID: ${event.id}
類型: ${event.breachType}
風險等級: ${event.riskLevel}
受影響用戶: ${event.affectedData.affectedUsers}

描述: ${event.description}

合規截止時間: ${event.complianceDeadline.toISOString()}

需要立即行動！
    `.trim();
  }

  /**
   * 獲取監管機構聯繫方式
   */
  private getRegulatoryContacts(regions: string[]): string[] {
    const contacts: string[] = [];

    for (const region of regions) {
      switch (region) {
        case 'TW':
          contacts.push('dpo@cardstrategy.com');
          break;
        case 'EU':
          contacts.push('gdpr@cardstrategy.com');
          break;
        case 'US':
          contacts.push('privacy@cardstrategy.com');
          break;
        default:
          contacts.push('compliance@cardstrategy.com');
      }
    }

    return contacts;
  }

  /**
   * 檢查是否應該觸發警報
   */
  private shouldTriggerBreachAlert(activity: any): boolean {
    const rule = this.detectionRules.find(
      r => r.conditions.eventType === activity.type && r.enabled
    );

    if (!rule) return false;

    return (
      activity.count >= rule.conditions.threshold &&
      activity.severity === rule.conditions.severity
    );
  }

  /**
   * 生成事件ID
   */
  private generateEventId(): string {
    return `breach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 保存洩露事件
   */
  private async saveBreachEvent(event: DataBreachEvent): Promise<void> {
    try {
      const events = await this.getBreachEvents();
      events.push(event);
      await storage.set('dataBreachEvents', events);
    } catch (error) {
      logger.error('保存洩露事件失敗:', error);
      throw error;
    }
  }

  /**
   * 更新洩露事件
   */
  private async updateBreachEvent(event: DataBreachEvent): Promise<void> {
    try {
      const events = await this.getBreachEvents();
      const index = events.findIndex(e => e.id === event.id);

      if (index !== -1) {
        events[index] = { ...event, updatedAt: new Date() };
        await storage.set('dataBreachEvents', events);
      }
    } catch (error) {
      logger.error('更新洩露事件失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取所有洩露事件
   */
  async getBreachEvents(): Promise<DataBreachEvent[]> {
    try {
      const events = await storage.get<DataBreachEvent[]>('dataBreachEvents');
      return events || [];
    } catch (error) {
      logger.error('獲取洩露事件失敗:', error);
      return [];
    }
  }

  /**
   * 獲取可疑活動 (模擬數據)
   */
  private async getSuspiciousActivities(): Promise<any[]> {
    // 這裡應該調用實際的安全日誌分析API
    return [];
  }

  /**
   * 獲取大規模數據傳輸 (模擬數據)
   */
  private async getLargeDataTransfers(): Promise<any[]> {
    // 這裡應該調用實際的數據傳輸監控API
    return [];
  }

  /**
   * 獲取系統完整性問題 (模擬數據)
   */
  private async getSystemIntegrityIssues(): Promise<any[]> {
    // 這裡應該調用實際的系統完整性檢查API
    return [];
  }

  /**
   * 獲取第三方風險 (模擬數據)
   */
  private async getThirdPartyRisks(): Promise<any[]> {
    // 這裡應該調用實際的第三方風險評估API
    return [];
  }

  /**
   * 手動創建洩露事件
   */
  async createManualBreachEvent(
    eventData: Partial<DataBreachEvent>
  ): Promise<DataBreachEvent> {
    return this.createBreachEvent(eventData);
  }

  /**
   * 更新事件狀態
   */
  async updateEventStatus(
    eventId: string,
    status: DataBreachEvent['status']
  ): Promise<void> {
    try {
      const events = await this.getBreachEvents();
      const event = events.find(e => e.id === eventId);

      if (event) {
        event.status = status;
        event.updatedAt = new Date();

        if (status === 'contained') {
          event.containmentDate = new Date();
        } else if (status === 'resolved') {
          event.resolutionDate = new Date();
        }

        await this.updateBreachEvent(event);
        logger.info(`事件狀態已更新: ${eventId} -> ${status}`);
      }
    } catch (error) {
      logger.error('更新事件狀態失敗:', error);
      throw error;
    }
  }

  /**
   * 獲取統計信息
   */
  async getStatistics(): Promise<any> {
    try {
      const events = await this.getBreachEvents();
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentEvents = events.filter(e => e.createdAt >= thirtyDaysAgo);

      return {
        totalEvents: events.length,
        recentEvents: recentEvents.length,
        criticalEvents: events.filter(e => e.riskLevel === 'critical').length,
        highRiskEvents: events.filter(e => e.riskLevel === 'high').length,
        pendingNotifications: events.filter(
          e => !e.regulatoryNotification || !e.userNotification
        ).length,
        averageResponseTime: this.calculateAverageResponseTime(events),
        complianceRate: this.calculateComplianceRate(events),
      };
    } catch (error) {
      logger.error('獲取統計信息失敗:', error);
      return {};
    }
  }

  /**
   * 計算平均響應時間
   */
  private calculateAverageResponseTime(events: DataBreachEvent[]): number {
    const resolvedEvents = events.filter(e => e.resolutionDate);

    if (resolvedEvents.length === 0) return 0;

    const totalTime = resolvedEvents.reduce((sum, event) => {
      return (
        sum + (event.resolutionDate!.getTime() - event.discoveryDate.getTime())
      );
    }, 0);

    return totalTime / resolvedEvents.length / (1000 * 60 * 60); // 小時
  }

  /**
   * 計算合規率
   */
  private calculateComplianceRate(events: DataBreachEvent[]): number {
    if (events.length === 0) return 100;

    const compliantEvents = events.filter(
      e => e.regulatoryNotification && e.userNotification
    );

    return (compliantEvents.length / events.length) * 100;
  }
}

// 導出服務類和實例
export { DataBreachNotificationService };
export const dataBreachNotificationService =
  new DataBreachNotificationService();
