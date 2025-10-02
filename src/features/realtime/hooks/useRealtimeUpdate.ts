/**
 * 實時Update Hook
 * 提供實時Update功能的 React Hook
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
  // Status
  isConnected: boolean;
  isInitialized: boolean;
  stats: UpdateStats;

  // Method
  subscribe: (options?: UseRealtimeUpdateOptions) => void;
  unsubscribe: () => void;
  sendUpdate: (update: Partial<RealtimeUpdate>) => Promise<void>;
  broadcastUpdate: (
    update: Partial<RealtimeUpdate>,
    options?: unknown
  ) => Promise<void>;

  // 卡片UpdateMethod
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
 * 實時Update Hook
 */
export const _useRealtimeUpdate = (
  options: UseRealtimeUpdateOptions = {}
): UseRealtimeUpdateReturn => {
  const _dispatch = useDispatch();
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

  const _handlerRef = useRef<UpdateHandler | null>(null);
  const _isSubscribed = useRef(false);

  // Initialize實時UpdateService
  useEffect(() => {
    const _initializeService = async () => {
      try {
        await realtimeUpdateService.initialize();
      } catch (error) {
        console.error('Initialize實時UpdateServiceFailed:', error);
        options.onError?.(error as Error);
      }
    };

    if (!isInitialized) {
      initializeService();
    }
  }, [isInitialized, options.onError]);

  // Update統Count據
  useEffect(() => {
    const _updateStats = () => {
      const _currentStats = realtimeUpdateService.getStats();
      setStats(currentStats);
    };

    // 定期Update統Count據
    const _interval = setInterval(updateStats, 5000);
    updateStats(); // 立即Update一次

    return () => clearInterval(interval);
  }, []);

  // Auto訂閱
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
   * 訂閱實時Update
   */
  const _subscribe = useCallback(
    (subscribeOptions: UseRealtimeUpdateOptions = {}) => {
      if (isSubscribed.current) {
        return;
      }

      const _finalOptions = { ...options, ...subscribeOptions };

      // CreateHandle器
      const handler: UpdateHandler = {
        id: `realtime_update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: '*', // Handle所有Class型
        priority: 1,
        handler: (update: RealtimeUpdate) => {
          // CheckFilterCondition
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

          // 調用CallbackFunction
          finalOptions.onUpdate?.(update);
          options.onUpdate?.(update);
        },
      };

      // RegisterHandle器
      realtimeUpdateService.registerHandler(handler);
      handlerRef.current = handler;
      isSubscribed.current = true;
    },
    [options]
  );

  /**
   * Cancel訂閱
   */
  const _unsubscribe = useCallback(() => {
    if (handlerRef.current) {
      realtimeUpdateService.unregisterHandler(handlerRef.current.id);
      handlerRef.current = null;
      isSubscribed.current = false;
    }
  }, []);

  /**
   * SendUpdate
   */
  const _sendUpdate = useCallback(
    async (update: Partial<RealtimeUpdate>): Promise<void> => {
      try {
        await realtimeUpdateService.sendUpdate(update);
      } catch (error) {
        console.error('發送實時UpdateFailed:', error);
        options.onError?.(error as Error);
        throw error;
      }
    },
    [options.onError]
  );

  /**
   * 廣播Update
   */
  const _broadcastUpdate = useCallback(
    async (
      update: Partial<RealtimeUpdate>,
      broadcastOptions?: unknown
    ): Promise<void> => {
      try {
        await realtimeUpdateService.broadcastUpdate(update, broadcastOptions);
      } catch (error) {
        console.error('廣播實時UpdateFailed:', error);
        options.onError?.(error as Error);
        throw error;
      }
    },
    [options.onError]
  );

  /**
   * Handle卡片Update
   */
  const _handleCardUpdate = useCallback(
    async (
      cardId: string,
      action: 'create' | 'update' | 'delete',
      data: unknown
    ): Promise<void> => {
      try {
        await realtimeUpdateService.handleCardUpdate(cardId, action, data);
      } catch (error) {
        console.error('Handle卡片UpdateFailed:', error);
        options.onError?.(error as Error);
        throw error;
      }
    },
    [options.onError]
  );

  /**
   * HandleUserStatusUpdate
   */
  const _handleUserStatusUpdate = useCallback(
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
        console.error('Handle用戶狀態UpdateFailed:', error);
        options.onError?.(error as Error);
        throw error;
      }
    },
    [options.onError]
  );

  /**
   * Handle系統Notification
   */
  const _handleSystemNotification = useCallback(
    async (notification: unknown): Promise<void> => {
      try {
        await realtimeUpdateService.handleSystemNotification(notification);
      } catch (error) {
        console.error('Handle系統通知Failed:', error);
        options.onError?.(error as Error);
        throw error;
      }
    },
    [options.onError]
  );

  return {
    // Status
    isConnected: status === 'connected',
    isInitialized,
    stats,

    // Method
    subscribe,
    unsubscribe,
    sendUpdate,
    broadcastUpdate,

    // 卡片UpdateMethod
    handleCardUpdate,
    handleUserStatusUpdate,
    handleSystemNotification,
  };
};

/**
 * 簡化的實時Update Hook
 */
export const _useSimpleRealtimeUpdate = (
  onUpdate?: (update: RealtimeUpdate) => void
) => {
  return useRealtimeUpdate({
    autoSubscribe: true,
    onUpdate,
  });
};

/**
 * 卡片實時Update Hook
 */
export const _useCardRealtimeUpdate = (
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
 * UserStatus實時Update Hook
 */
export const _useUserStatusRealtimeUpdate = (
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
