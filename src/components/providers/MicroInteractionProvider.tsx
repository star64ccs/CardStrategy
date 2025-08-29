// 微交互 Provider 組件
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';

import { microInteractionService } from '../../services/microInteractionService';
import {
  addEvent,
  initializeMicroInteractionService,
  registerMicroInteraction,
  resetAllMicroInteractions,
  resetMicroInteraction,
  selectMicroInteractionConfig,
  selectMicroInteractionError,
  selectMicroInteractionInitialized,
  selectMicroInteractionLoading,
  selectMicroInteractionStats,
  stopAllMicroInteractions,
  stopMicroInteraction,
  triggerMicroInteraction,
  triggerMultipleMicroInteractions,
  unregisterMicroInteraction,
  updateMicroInteractionConfig,
  updateMicroInteractionStats,
  enablePerformanceMonitoring,
} from '../../store/slices/microInteractionSlice';
import type {
  MicroInteractionConfig,
  MicroInteractionManagerConfig,
  MicroInteractionServiceInterface,
  MicroInteractionStats,
} from '../../types/microInteractions';

// Context 接口
interface MicroInteractionContextType {
  // 服務實例
  service: MicroInteractionServiceInterface;

  // 狀態
  initialized: boolean;
  loading: boolean;
  error: string | null;
  config: MicroInteractionManagerConfig;
  stats: MicroInteractionStats;

  // 核心方法
  register: (config: MicroInteractionConfig) => string;
  unregister: (id: string) => void;
  trigger: (id: string, data?: Record<string, any>) => Promise<void>;
  stop: (id: string) => void;
  reset: (id: string) => void;

  // 批量操作
  triggerMultiple: (ids: string[], data?: Record<string, any>) => Promise<void>;
  stopAll: () => void;
  resetAll: () => void;

  // 配置管理
  updateConfig: (id: string, config: Partial<MicroInteractionConfig>) => void;
  enablePerformanceMonitoring: (enabled: boolean) => void;

  // 統計更新
  updateStats: () => void;
}

// 創建 Context
const _MicroInteractionContext =
  createContext<MicroInteractionContextType | null>(null);

// Provider Props
interface MicroInteractionProviderProps {
  children: ReactNode;
  config?: Partial<MicroInteractionManagerConfig>;
  autoInitialize?: boolean;
  enablePerformanceMonitoring?: boolean;
  debugMode?: boolean;
}

// Provider 組件
export const MicroInteractionProvider: React.FC<
  MicroInteractionProviderProps
> = ({
  children,
  config = {},
  autoInitialize = true,
  enablePerformanceMonitoring = false,
  debugMode = false,
}) => {
  const _dispatch = useDispatch<AppDispatch>();
  const _initialized = useSelector(selectMicroInteractionInitialized);
  const _loading = useSelector(selectMicroInteractionLoading);
  const _error = useSelector(selectMicroInteractionError);
  const _configState = useSelector(selectMicroInteractionConfig);
  const _stats = useSelector(selectMicroInteractionStats);

  const [service] = useState<MicroInteractionServiceInterface>(
    microInteractionService
  );

  // 初始化服務
  useEffect(() => {
    if (autoInitialize && !initialized) {
      const _initConfig = {
        ...config,
        debugMode: debugMode || config.debugMode,
        performanceMode: enablePerformanceMonitoring || config.performanceMode,
      };

      dispatch(initializeMicroInteractionService(initConfig));
    }
  }, [
    autoInitialize,
    initialized,
    config,
    debugMode,
    enablePerformanceMonitoring,
    dispatch,
  ]);

  // 設置事件監聽器
  useEffect(() => {
    if (!initialized) return;

    // 註冊事件監聽器
    const _eventListeners = [
      'registered',
      'unregistered',
      'triggered',
      'completed',
      'error',
      'stopped',
      'reset',
      'stoppedAll',
      'resetAll',
      'configUpdated',
      'performanceMonitoringChanged',
    ];

    eventListeners.forEach(event => {
      service.on(event, (data: unknown) => {
        dispatch(
          addEvent({
            id: data.id || 'system',
            type: event as any,
            trigger: 'auto' as any,
            timestamp: Date.now(),
            data,
          })
        );
      });
    });

    // 定期更新統計
    const _statsInterval = setInterval(() => {
      dispatch(updateMicroInteractionStats());
    }, 5000);

    return () => {
      eventListeners.forEach(event => {
        service.off(event, () => {});
      });
      clearInterval(statsInterval);
    };
  }, [initialized, service, dispatch]);

  // 性能監控設置
  useEffect(() => {
    if (initialized && enablePerformanceMonitoring) {
      // 性能監控已通過 config 啟用
    }
  }, [initialized, enablePerformanceMonitoring]);

  // Context 值
  const contextValue: MicroInteractionContextType = {
    service,
    initialized,
    loading,
    error,
    config: configState,
    stats,

    // 核心方法
    register: (config: MicroInteractionConfig) => {
      const _id = service.register(config);
      dispatch(registerMicroInteraction(config));
      return id;
    },

    unregister: (id: string) => {
      service.unregister(id);
      dispatch(unregisterMicroInteraction(id));
    },

    trigger: async (id: string, data?: Record<string, any>) => {
      await dispatch(triggerMicroInteraction({ id, data })).unwrap();
    },

    stop: (id: string) => {
      service.stop(id);
      dispatch(stopMicroInteraction(id));
    },

    reset: (id: string) => {
      service.reset(id);
      dispatch(resetMicroInteraction(id));
    },

    // 批量操作
    triggerMultiple: async (ids: string[], data?: Record<string, any>) => {
      await dispatch(triggerMultipleMicroInteractions({ ids, data })).unwrap();
    },

    stopAll: () => {
      service.stopAll();
      dispatch(stopAllMicroInteractions());
    },

    resetAll: () => {
      service.resetAll();
      dispatch(resetAllMicroInteractions());
    },

    // 配置管理
    updateConfig: (id: string, config: Partial<MicroInteractionConfig>) => {
      service.updateConfig(id, config);
      dispatch(updateMicroInteractionConfig({ id, config }));
    },

    enablePerformanceMonitoring: (enabled: boolean) => {
      service.enablePerformanceMonitoring(enabled);
      // 性能監控設置已通過服務處理
    },

    // 統計更新
    updateStats: () => {
      dispatch(updateMicroInteractionStats());
    },
  };

  // 渲染加載狀態
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#666',
        }}
      >
        正在初始化微交互系統...
      </div>
    );
  }

  // 渲染錯誤狀態
  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '16px',
          color: '#f44336',
        }}
      >
        微交互系統初始化失敗: {error}
      </div>
    );
  }

  return (
    <MicroInteractionContext.Provider value={contextValue}>
      {children}
    </MicroInteractionContext.Provider>
  );
};

// Hook 使用微交互 Context
export const _useMicroInteraction = (): MicroInteractionContextType => {
  const _context = useContext(MicroInteractionContext);
  if (!context) {
    throw new Error(
      'useMicroInteraction 必須在 MicroInteractionProvider 內使用'
    );
  }
  return context;
};

// Hook 使用微交互服務
export const _useMicroInteractionService =
  (): MicroInteractionServiceInterface => {
    const { service } = useMicroInteraction();
    return service;
  };

// Hook 使用微交互狀態
export const _useMicroInteractionState = () => {
  const { initialized, loading, error, config, stats } = useMicroInteraction();
  return { initialized, loading, error, config, stats };
};

// Hook 使用微交互方法
export const _useMicroInteractionActions = () => {
  const {
    register,
    unregister,
    trigger,
    stop,
    reset,
    triggerMultiple,
    stopAll,
    resetAll,
    updateConfig,
    enablePerformanceMonitoring,
    updateStats,
  } = useMicroInteraction();

  return {
    register,
    unregister,
    trigger,
    stop,
    reset,
    triggerMultiple,
    stopAll,
    resetAll,
    updateConfig,
    enablePerformanceMonitoring,
    updateStats,
  };
};

// 默認導出
export default MicroInteractionProvider;
