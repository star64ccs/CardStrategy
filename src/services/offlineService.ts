import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface OfflineData {
  key: string;
  data: any;
  timestamp: number;
  expiresAt?: number;
}

export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retryCount: number;
}

class OfflineService {
  private static instance: OfflineService;
  private isOnline: boolean = true;
  private pendingActions: OfflineAction[] = [];

  static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  async init() {
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline) {
        this.processPendingActions();
      }
    });

    // 載入待處理的操作
    await this.loadPendingActions();
  }

  async saveOfflineData(key: string, data: any, expiresInHours: number = 24) {
    const offlineData: OfflineData = {
      key,
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + expiresInHours * 60 * 60 * 1000,
    };

    await AsyncStorage.setItem(`offline_${key}`, JSON.stringify(offlineData));
  }

  async getOfflineData(key: string): Promise<any | null> {
    try {
      const data = await AsyncStorage.getItem(`offline_${key}`);
      if (!data) return null;

      const offlineData: OfflineData = JSON.parse(data);

      if (offlineData.expiresAt && Date.now() > offlineData.expiresAt) {
        await AsyncStorage.removeItem(`offline_${key}`);
        return null;
      }

      return offlineData.data;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }

  async clearOfflineData(key: string) {
    await AsyncStorage.removeItem(`offline_${key}`);
  }

  async clearAllOfflineData() {
    const keys = await AsyncStorage.getAllKeys();
    const offlineKeys = keys.filter((key) => key.startsWith('offline_'));
    await AsyncStorage.multiRemove(offlineKeys);
  }

  async addPendingAction(type: string, payload: any) {
    const action: OfflineAction = {
      id: Date.now().toString(),
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.pendingActions.push(action);
    await this.savePendingActions();
  }

  async processPendingActions() {
    if (!this.isOnline || this.pendingActions.length === 0) return;

    const actionsToProcess = [...this.pendingActions];
    this.pendingActions = [];

    for (const action of actionsToProcess) {
      try {
        // 這裡可以根據action.type來處理不同的操作
        console.log('Processing pending action:', action);

        // 模擬處理成功
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error('Error processing pending action:', error);
        action.retryCount++;

        if (action.retryCount < 3) {
          this.pendingActions.push(action);
        }
      }
    }

    await this.savePendingActions();
  }

  private async loadPendingActions() {
    try {
      const data = await AsyncStorage.getItem('pending_actions');
      if (data) {
        this.pendingActions = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading pending actions:', error);
    }
  }

  private async savePendingActions() {
    try {
      await AsyncStorage.setItem(
        'pending_actions',
        JSON.stringify(this.pendingActions)
      );
    } catch (error) {
      console.error('Error saving pending actions:', error);
    }
  }

  isConnected(): boolean {
    return this.isOnline;
  }

  getPendingActionsCount(): number {
    return this.pendingActions.length;
  }
}

// 導出服務類和實例
export { OfflineService };
export default OfflineService.getInstance();
