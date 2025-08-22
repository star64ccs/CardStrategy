import NetInfo from '@react-native-community/netinfo';
import { logger } from './logger';

// 網絡狀態類型
export interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
  isWifi: boolean;
  isCellular: boolean;
  isEthernet: boolean;
  isUnknown: boolean;
}

// 網絡監控配置
export interface NetworkMonitorConfig {
  checkInterval: number; // 檢查間隔（毫秒）
  timeout: number; // 超時時間（毫秒）
  retryAttempts: number; // 重試次數
}

// 默認配置
const defaultConfig: NetworkMonitorConfig = {
  checkInterval: 5000, // 5秒
  timeout: 10000, // 10秒
  retryAttempts: 3,
};

// 網絡監控類
class NetworkMonitor {
  private config: NetworkMonitorConfig;
  private isMonitoring: boolean = false;
  private checkIntervalId: NodeJS.Timeout | null = null;
  private listeners: Set<(state: NetworkState) => void> = new Set();
  private lastKnownState: NetworkState | null = null;

  constructor(config: Partial<NetworkMonitorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // 開始監控
  start(): void {
    if (this.isMonitoring) {
      logger.warn('網絡監控已經在運行中');
      return;
    }

    this.isMonitoring = true;
    logger.info('開始網絡監控');

    // 立即檢查一次
    this.checkNetworkState();

    // 設置定期檢查
    this.checkIntervalId = setInterval(() => {
      this.checkNetworkState();
    }, this.config.checkInterval);
  }

  // 停止監控
  stop(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    logger.info('停止網絡監控');

    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }

  // 檢查網絡狀態
  private async checkNetworkState(): Promise<void> {
    try {
      const state = await NetInfo.fetch();
      const networkState: NetworkState = {
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        isWifi: state.type === 'wifi',
        isCellular: state.type === 'cellular',
        isEthernet: state.type === 'ethernet',
        isUnknown: state.type === 'unknown',
      };

      // 檢查狀態是否發生變化
      if (this.hasStateChanged(networkState)) {
        this.lastKnownState = networkState;
        this.notifyListeners(networkState);

        if (networkState.isConnected) {
          logger.info('網絡連接已恢復', networkState);
        } else {
          logger.warn('網絡連接已斷開', networkState);
        }
      }
    } catch (error) {
      logger.error('檢查網絡狀態失敗:', error);
    }
  }

  // 檢查狀態是否發生變化
  private hasStateChanged(newState: NetworkState): boolean {
    if (!this.lastKnownState) {
      return true;
    }

    return (
      this.lastKnownState.isConnected !== newState.isConnected ||
      this.lastKnownState.isInternetReachable !==
        newState.isInternetReachable ||
      this.lastKnownState.type !== newState.type
    );
  }

  // 通知監聽器
  private notifyListeners(state: NetworkState): void {
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (error) {
        logger.error('通知網絡狀態監聽器失敗:', error);
      }
    });
  }

  // 添加監聽器
  addListener(listener: (state: NetworkState) => void): void {
    this.listeners.add(listener);
  }

  // 移除監聽器
  removeListener(listener: (state: NetworkState) => void): void {
    this.listeners.delete(listener);
  }

  // 獲取當前網絡狀態
  async getCurrentState(): Promise<NetworkState> {
    const state = await NetInfo.fetch();
    return {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isWifi: state.type === 'wifi',
      isCellular: state.type === 'cellular',
      isEthernet: state.type === 'ethernet',
      isUnknown: state.type === 'unknown',
    };
  }

  // 檢查網絡連接
  async isNetworkAvailable(): Promise<boolean> {
    const state = await this.getCurrentState();
    return state.isConnected && (state.isInternetReachable ?? true);
  }

  // 等待網絡連接
  async waitForConnection(
    timeout: number = this.config.timeout
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.isNetworkAvailable()) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return false;
  }

  // 測試網絡連接
  async testConnection(
    url: string = 'https://www.google.com'
  ): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      logger.error('網絡連接測試失敗:', error);
      return false;
    }
  }

  // 獲取網絡質量評分
  async getNetworkQuality(): Promise<number> {
    try {
      const startTime = Date.now();
      const isConnected = await this.testConnection();
      const responseTime = Date.now() - startTime;

      if (!isConnected) {
        return 0;
      }

      // 基於響應時間評分 (0-100)
      if (responseTime < 500) return 100;
      if (responseTime < 1000) return 80;
      if (responseTime < 2000) return 60;
      if (responseTime < 5000) return 40;
      return 20;
    } catch (error) {
      logger.error('獲取網絡質量評分失敗:', error);
      return 0;
    }
  }
}

// 創建全局網絡監控實例
export const networkMonitor = new NetworkMonitor();

// 導出工具函數
export const getNetworkState = () => networkMonitor.getCurrentState();
export const isNetworkAvailable = () => networkMonitor.isNetworkAvailable();
export const waitForConnection = (timeout?: number) =>
  networkMonitor.waitForConnection(timeout);
export const testConnection = (url?: string) =>
  networkMonitor.testConnection(url);
export const getNetworkQuality = () => networkMonitor.getNetworkQuality();

// 自動啟動網絡監控
networkMonitor.start();
