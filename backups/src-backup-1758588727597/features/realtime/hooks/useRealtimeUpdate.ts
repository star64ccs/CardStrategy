/**
 * 實時更新 Hook
 * 提供實時更新功能的 React Hook
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { RootState } from '../../../store';
import type {
  UpdateHandler,
  RealtimeUpdate,
  UpdateStats,
} from '../services/realtimeUpdateService';
import { realtimeUpdateService } from '../services/realtimeUpdateService';

export interface UseRealtimeUpdateOptions {
  types?: string[];
  entityIds?: string[];
  actions?: string[];
  autoSubscribe?: boolean;
  onUpdate?: (update: RealtimeUpdate) => void;
  onError?: (error: Error) => void;
}

export interface UseRealtimeUpdateReturn {
  // 狀態
  isConnected: boolean;
  isInitialized: boolean;
  stats: UpdateStats;

  // 方法
  subscribe: (options?: UseRealtimeUpdateOptions) => void;
  unsubscribe: () => void;
  sendUpdate: (update: Partial<RealtimeUpdate>) => Promise<void>;
  broadcastUpdate: (
    update: Partial<RealtimeUpdate>,
    options?: unknown
  ) => Promise<void>;

  // 卡片更新方法
  handleCardUpdate: (
    cardId: string,
    action: 'create' | 'update' | 'delete',
    data: unknown
  ) => Promise<void>;
  handleUserStatusUpdate: (
    userId: string,
    status: 'online' | 'away' | 'busy' | 'offline',
    data?: unknown
  ) => Promise<void>;
  handleSystemNotification: (notification: unknown) => Promise<void>;
}

/**
 * 實時更新 Hook
 */
export const useRealtimeUpdate = (
  options: UseRealtimeUpdateOptions = {}
): UseRealtimeUpdateReturn => {
  const dispatch = useDispatch();
  const { isInitialized, status } = useSelector(
    (state: RootState) => state.websocket
  );

  const [stats, setStats] = useState<UpdateStats>({
    totalUpdates: 0,
    updatesByType: {},
    updatesByAction: {},
    lastUpdate: null,
    averageLatency: 0,
    errorCount: 0,
  });

  const handlerRef = useRef<UpdateHandler | null>(null);
  const isSubscribed = useRef(false);

  // 初始化實時更新服務
  useEffect(() => {
    const initializeService = async () => {
      try {
        await realtimeUpdateService.initialize();
      } catch (error) {
        console.error('初始化實時更新服務失敗:', error);
        options.onError?.(error as Error);
      }
    };

    if (!isInitialized) {
      initializeService();
    }
  }, [isInitialized, options.onError]);

  // 更新統計數據
  useEffect(() => {
    const updateStats = () => {
      const currentStats = realtimeUpdateService.getStats();
      setStats(currentStats);
    };

    // 定期更新統計數據
    const interval = setInterval(updateStats, 5000);
    updateStats(); // 立即更新一次

    return () => clearInterval(interval);
  }, []);

  // 自動訂閱
  useEffect(() => {
    if (
      options.autoSubscribe !== false &&
      isInitialized &&
      !isSubscribed.current
    ) {
      subscribe(options);
    }
  }, [isInitialized, options.autoSubscribe]);

  // 清理
  useEffect(() => {
    return () => {
      if (handlerRef.current) {
        realtimeUpdateService.unregisterHandler(handlerRef.current.id);
      }
    };
  }, []);

  /**
   * 訂閱實時更新
   */
  const subscribe = useCallback(
    (subscribeOptions: UseRealtimeUpdateOptions = {}) => {
      if (isSubscribed.current) {
        return;
      }

      const finalOptions = { ...options, ...subscribeOptions };

      // 創建處理器
      const handler: UpdateHandler = {
        id: `realtime_update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: '*', // 處理所有類型
        priority: 1,
        handler: (update: RealtimeUpdate) => {
          // 檢查過濾條件
          if (finalOptions.types && !finalOptions.types.includes(update.type)) {
            return;
          }

          if (
            finalOptions.entityIds &&
            !finalOptions.entityIds.includes(update.entityId)
          ) {
            return;
          }

          if (
            finalOptions.actions &&
            !finalOptions.actions.includes(update.action)
          ) {
            return;
          }

          // 調用回調函數
          finalOptions.onUpdate?.(update);
          options.onUpdate?.(update);
        },
      };

      // 註冊處理器
      realtimeUpdateService.registerHandler(handler);
      handlerRef.current = handler;
      isSubscribed.current = true;
    },
    [options]
  );

  /**
   * 取消訂閱
   */
  const unsubscribe = useCallback(() => {
    if (handlerRef.current) {
      realtimeUpdateService.unregisterHandler(handlerRef.current.id);
      handlerRef.current = null;
      isSubscribed.current = false;
    }
  }, []);

  /**
   * 發送更新
   */
  const sendUpdate = useCallback(
    async (update: Partial<RealtimeUpdate>): Promise<void> => {
      try {
        await realtimeUpdateService.sendUpdate(update);
      } catch (error) {
        console.error('發送實時更新失敗:', error);
        options.onError?.(error as Error);
        throw error;
      }
    },
    [options.onError]
  );

  /**
   * 廣播更新
   */
  const broadcastUpdate = useCallback(
    async (
      update: Partial<RealtimeUpdate>,
      broadcastOptions?: unknown
    ): Promise<void> => {
      try {
        await realtimeUpdateService.broadcastUpdate(update, broadcastOptions);
      } catch (error) {
        console.error('廣播實時更新失敗:', error);
        options.onError?.(error as Error);
        throw error;
      }
    },
    [options.onError]
  );

  /**
   * 處理卡片更新
   */
  const handleCardUpdate = useCallback(
    async (
      cardId: string,
      action: 'create' | 'update' | 'delete',
      data: unknown
    ): Promise<void> => {
      try {
        await realtimeUpdateService.handleCardUpdate(cardId, action, data);
      } catch (error) {
        console.error('處理卡片更新失敗:', error);
        options.onError?.(error as Error);
        throw error;
      }
    },
    [options.onError]
  );

  /**
   * 處理用戶狀態更新
   */
  const handleUserStatusUpdate = useCallback(
    async (
      userId: string,
      status: 'online' | 'away' | 'busy' | 'offline',
      data?: unknown
    ): Promise<void> => {
      try {
        await realtimeUpdateService.handleUserStatusUpdate(
          userId,
          status,
          data
        );
      } catch (error) {
        console.error('處理用戶狀態更新失敗:', error);
        options.onError?.(error as Error);
        throw error;
      }
    },
    [options.onError]
  );

  /**
   * 處理系統通知
   */
  const handleSystemNotification = useCallback(
    async (notification: unknown): Promise<void> => {
      try {
        await realtimeUpdateService.handleSystemNotification(notification);
      } catch (error) {
        console.error('處理系統通知失敗:', error);
        options.onError?.(error as Error);
        throw error;
      }
    },
    [options.onError]
  );

  return {
    // 狀態
    isConnected: status === 'connected',
    isInitialized,
    stats,

    // 方法
    subscribe,
    unsubscribe,
    sendUpdate,
    broadcastUpdate,

    // 卡片更新方法
    handleCardUpdate,
    handleUserStatusUpdate,
    handleSystemNotification,
  };
};

/**
 * 簡化的實時更新 Hook
 */
export const useSimpleRealtimeUpdate = (
  onUpdate?: (update: RealtimeUpdate) => void
) => {
  return useRealtimeUpdate({
    autoSubscribe: true,
    onUpdate,
  });
};

/**
 * 卡片實時更新 Hook
 */
export const useCardRealtimeUpdate = (
  cardIds: string[],
  onUpdate?: (update: RealtimeUpdate) => void
) => {
  return useRealtimeUpdate({
    types: ['card'],
    entityIds: cardIds,
    autoSubscribe: true,
    onUpdate,
  });
};

/**
 * 用戶狀態實時更新 Hook
 */
export const useUserStatusRealtimeUpdate = (
  userIds: string[],
  onUpdate?: (update: RealtimeUpdate) => void
) => {
  return useRealtimeUpdate({
    types: ['user'],
    entityIds: userIds,
    autoSubscribe: true,
    onUpdate,
  });
};
