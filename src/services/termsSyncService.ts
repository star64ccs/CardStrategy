import { apiService } from './apiService';
import { logger } from '../utils/logger';
import { storage } from '../utils/storage';
import { notificationService } from './notificationService';
import {
  TermsType,
  TermsVersion,
  TermsConfig,
  TermsUpdateNotification
} from '../types/terms';
import { TERMS_CONTENT } from '../data/termsContent';

interface TermsSyncConfig {
  autoSync: boolean;           // 是否自動同步
  syncInterval: number;        // 同步間隔（毫秒）
  checkOnAppStart: boolean;    // 應用啟動時檢查
  notifyOnUpdate: boolean;     // 條款更新時通知
  fallbackToLocal: boolean;    // 服務器不可用時使用本地條款
}

interface TermsSyncStatus {
  lastSyncTime: Date | null;
  lastUpdateTime: Date | null;
  hasUpdates: boolean;
  syncError: string | null;
  pendingTerms: TermsType[];
}

class TermsSyncService {
  private baseUrl = '/terms/sync';
  private config: TermsSyncConfig;
  private syncStatus: TermsSyncStatus;
  private syncIntervalId: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.config = this.getDefaultConfig();
    this.syncStatus = this.getDefaultStatus();
  }

  // 獲取默認配置
  private getDefaultConfig(): TermsSyncConfig {
    return {
      autoSync: true,
      syncInterval: 24 * 60 * 60 * 1000, // 24小時
      checkOnAppStart: true,
      notifyOnUpdate: true,
      fallbackToLocal: true
    };
  }

  // 獲取默認狀態
  private getDefaultStatus(): TermsSyncStatus {
    return {
      lastSyncTime: null,
      lastUpdateTime: null,
      hasUpdates: false,
      syncError: null,
      pendingTerms: []
    };
  }

  // 初始化服務
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 從本地存儲加載配置
      const savedConfig = await storage.getItem('termsSyncConfig');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      // 從本地存儲加載狀態
      const savedStatus = await storage.getItem('termsSyncStatus');
      if (savedStatus) {
        this.syncStatus = { ...this.syncStatus, ...JSON.parse(savedStatus) };
      }

      // 如果配置了自動同步，啟動同步
      if (this.config.autoSync) {
        await this.startAutoSync();
      }

      this.isInitialized = true;
      logger.info('條款同步服務已初始化');
    } catch (error) {
      logger.error('初始化條款同步服務失敗:', error);
      throw error;
    }
  }

  // 啟動自動同步
  async startAutoSync(): Promise<void> {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
    }

    // 立即執行一次同步
    await this.syncTerms();

    // 設置定期同步
    this.syncIntervalId = setInterval(async () => {
      await this.syncTerms();
    }, this.config.syncInterval);

    logger.info('條款自動同步已啟動');
  }

  // 停止自動同步
  stopAutoSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      logger.info('條款自動同步已停止');
    }
  }

  // 同步條款內容
  async syncTerms(): Promise<boolean> {
    try {
      logger.info('開始同步條款內容...');

      // 檢查服務器是否有更新
      const serverTerms = await this.fetchServerTerms();

      if (!serverTerms || serverTerms.length === 0) {
        if (this.config.fallbackToLocal) {
          logger.info('服務器無條款數據，使用本地條款');
          return true;
        }
        throw new Error('服務器無條款數據');
      }

      // 比較本地和服務器條款
      const hasUpdates = await this.compareTerms(serverTerms);

      if (hasUpdates) {
        // 更新本地條款
        await this.updateLocalTerms(serverTerms);

        // 更新同步狀態
        this.syncStatus.lastUpdateTime = new Date();
        this.syncStatus.hasUpdates = true;

        // 通知用戶有條款更新
        if (this.config.notifyOnUpdate) {
          await this.notifyTermsUpdate();
        }

        logger.info('條款內容已更新');
      } else {
        logger.info('條款內容已是最新版本');
      }

      // 更新同步狀態
      this.syncStatus.lastSyncTime = new Date();
      this.syncStatus.syncError = null;
      await this.saveSyncStatus();

      return true;
    } catch (error) {
      logger.error('同步條款失敗:', error);

      this.syncStatus.syncError = error instanceof Error ? error.message : '未知錯誤';
      await this.saveSyncStatus();

      if (this.config.fallbackToLocal) {
        logger.info('使用本地條款作為備用');
        return true;
      }

      return false;
    }
  }

  // 從服務器獲取條款
  private async fetchServerTerms(): Promise<TermsVersion[]> {
    try {
      const response = await apiService.get(`${this.baseUrl}/content`, {
        timeout: 10000 // 10秒超時
      });
      return response.data || [];
    } catch (error) {
      logger.error('獲取服務器條款失敗:', error);
      throw error;
    }
  }

  // 比較本地和服務器條款
  private async compareTerms(serverTerms: TermsVersion[]): Promise<boolean> {
    try {
      // 獲取本地條款版本信息
      const localTerms = Object.values(TERMS_CONTENT);

      for (const serverTerm of serverTerms) {
        const localTerm = localTerms.find(lt => lt.type === serverTerm.type);

        if (!localTerm) {
          // 服務器有新的條款類型
          logger.info(`發現新條款類型: ${serverTerm.type}`);
          return true;
        }

        if (localTerm.version !== serverTerm.version) {
          // 版本不匹配
          logger.info(`條款 ${serverTerm.type} 版本更新: ${localTerm.version} -> ${serverTerm.version}`);
          return true;
        }

        if (localTerm.effectiveDate.getTime() !== new Date(serverTerm.effectiveDate).getTime()) {
          // 生效日期不同
          logger.info(`條款 ${serverTerm.type} 生效日期更新`);
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error('比較條款失敗:', error);
      return false;
    }
  }

  // 更新本地條款
  private async updateLocalTerms(serverTerms: TermsVersion[]): Promise<void> {
    try {
      // 將服務器條款轉換為本地格式
      const updatedTerms: Record<TermsType, any> = { ...TERMS_CONTENT };

      for (const serverTerm of serverTerms) {
        updatedTerms[serverTerm.type] = {
          type: serverTerm.type,
          version: serverTerm.version,
          title: serverTerm.title,
          content: serverTerm.content,
          language: serverTerm.language,
          status: serverTerm.status,
          effectiveDate: new Date(serverTerm.effectiveDate)
        };
      }

      // 保存到本地存儲
      await storage.setItem('termsContent', JSON.stringify(updatedTerms));

      // 更新內存中的條款內容
      Object.assign(TERMS_CONTENT, updatedTerms);

      logger.info('本地條款已更新');
    } catch (error) {
      logger.error('更新本地條款失敗:', error);
      throw error;
    }
  }

  // 通知條款更新
  private async notifyTermsUpdate(): Promise<void> {
    try {
      const notification: TermsUpdateNotification = {
        type: 'terms_update',
        title: '條款已更新',
        message: '應用條款已更新，請查看最新內容',
        timestamp: new Date(),
        requiresAction: true
      };

      await notificationService.sendNotification(notification);
      logger.info('條款更新通知已發送');
    } catch (error) {
      logger.error('發送條款更新通知失敗:', error);
    }
  }

  // 保存同步狀態
  private async saveSyncStatus(): Promise<void> {
    try {
      await storage.setItem('termsSyncStatus', JSON.stringify(this.syncStatus));
    } catch (error) {
      logger.error('保存同步狀態失敗:', error);
    }
  }

  // 獲取同步狀態
  getSyncStatus(): TermsSyncStatus {
    return { ...this.syncStatus };
  }

  // 獲取同步配置
  getSyncConfig(): TermsSyncConfig {
    return { ...this.config };
  }

  // 更新同步配置
  async updateSyncConfig(newConfig: Partial<TermsSyncConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };

    // 保存配置
    await storage.setItem('termsSyncConfig', JSON.stringify(this.config));

    // 如果啟用了自動同步，重新啟動
    if (this.config.autoSync) {
      await this.startAutoSync();
    } else {
      this.stopAutoSync();
    }

    logger.info('同步配置已更新');
  }

  // 強制同步
  async forceSync(): Promise<boolean> {
    logger.info('執行強制同步...');
    return await this.syncTerms();
  }

  // 檢查是否有待處理的條款更新
  async checkPendingUpdates(): Promise<TermsType[]> {
    try {
      const serverTerms = await this.fetchServerTerms();
      const pendingTerms: TermsType[] = [];

      for (const serverTerm of serverTerms) {
        const localTerm = TERMS_CONTENT[serverTerm.type];

        if (!localTerm || localTerm.version !== serverTerm.version) {
          pendingTerms.push(serverTerm.type);
        }
      }

      this.syncStatus.pendingTerms = pendingTerms;
      await this.saveSyncStatus();

      return pendingTerms;
    } catch (error) {
      logger.error('檢查待處理更新失敗:', error);
      return [];
    }
  }

  // 重置同步狀態
  async resetSyncStatus(): Promise<void> {
    this.syncStatus = this.getDefaultStatus();
    await this.saveSyncStatus();
    logger.info('同步狀態已重置');
  }

  // 清理服務
  cleanup(): void {
    this.stopAutoSync();
    this.isInitialized = false;
    logger.info('條款同步服務已清理');
  }
}

export const termsSyncService = new TermsSyncService();
