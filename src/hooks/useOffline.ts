import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

// 臨時實現
const _OfflineService = {
  getPendingActionsCount: () => 0,
  saveOfflineData: async (
    key: string,
    data: unknown,
    expiresInHours?: number
  ) => {},
  getOfflineData: async (key: string) => null,
  addPendingAction: async (type: string, payload: unknown) => {},
};

export const _useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);

  useEffect(() => {
    const _unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    // 定期檢查待處理操作數量
    const _interval = setInterval(() => {
      setPendingActionsCount(OfflineService.getPendingActionsCount());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const _saveOfflineData = async (
    key: string,
    data: unknown,
    expiresInHours?: number
  ) => {
    await OfflineService.saveOfflineData(key, data, expiresInHours);
  };

  const _getOfflineData = async (key: string) => {
    return OfflineService.getOfflineData(key);
  };

  const _addPendingAction = async (type: string, payload: unknown) => {
    await OfflineService.addPendingAction(type, payload);
    setPendingActionsCount(OfflineService.getPendingActionsCount());
  };

  return {
    isOnline,
    pendingActionsCount,
    saveOfflineData,
    getOfflineData,
    addPendingAction,
  };
};
