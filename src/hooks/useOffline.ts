import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import OfflineService from '../services/offlineService';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActionsCount, setPendingActionsCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    // 定期檢查待處理操作數量
    const interval = setInterval(() => {
      setPendingActionsCount(OfflineService.getPendingActionsCount());
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const saveOfflineData = async (
    key: string,
    data: any,
    expiresInHours?: number
  ) => {
    await OfflineService.saveOfflineData(key, data, expiresInHours);
  };

  const getOfflineData = async (key: string) => {
    return await OfflineService.getOfflineData(key);
  };

  const addPendingAction = async (type: string, payload: any) => {
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
