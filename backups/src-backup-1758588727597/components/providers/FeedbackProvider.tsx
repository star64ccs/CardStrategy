// 反饋系統 Provider 組件
import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store';

import { FeedbackService } from '../../services/feedbackService';
import {
  clearFeedbackCache,
  createReport,
  deleteFeedback,
  fetchAnalytics,
  fetchFeedback,
  fetchFeedbacks,
  initializeFeedbackService,
  markNotificationRead,
  selectAnalytics,
  selectError,
  selectFeedbacks,
  selectFilters,
  selectIsInitialized,
  selectIsOnline,
  selectLoading,
  selectNotifications,
  selectPagination,
  selectReports,
  selectServiceConfig,
  selectSort,
  selectSubmitting,
  selectSyncing,
  selectSyncStatus,
  sendNotification,
  submitFeedback,
  syncFeedbackData,
  updateFeedback,
} from '../../store/slices/feedbackSlice';
import type {
  FeedbackAnalytics,
  FeedbackData,
  FeedbackFilter,
  FeedbackFormData,
  FeedbackNotification,
  FeedbackPagination,
  FeedbackQueryResult,
  FeedbackReport,
  FeedbackServiceConfig,
  FeedbackSort,
  UseFeedbackActionsReturn,
  UseFeedbackReturn,
  UseFeedbackServiceReturn,
  UseFeedbackStateReturn,
} from '../../types/feedback';

// 反饋 Context 接口
interface FeedbackContextType {
  // 服務實例
  service: FeedbackService | null;

  // 狀態
  feedbacks: FeedbackData[];
  analytics: FeedbackAnalytics | null;
  notifications: FeedbackNotification[];
  reports: FeedbackReport[];
  filters: FeedbackFilter;
  sort: FeedbackSort;
  pagination: FeedbackPagination;
  loading: boolean;
  submitting: boolean;
  syncing: boolean;
  error: string | null;
  serviceConfig: FeedbackServiceConfig;
  isInitialized: boolean;
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';

  // 操作
  submitFeedback: (data: FeedbackFormData) => Promise<void>;
  updateFeedback: (id: string, data: Partial<FeedbackData>) => Promise<void>;
  deleteFeedback: (id: string) => Promise<void>;
  getFeedback: (id: string) => Promise<FeedbackData | null>;
  getFeedbacks: (
    filters?: FeedbackFilter,
    sort?: FeedbackSort,
    pagination?: Partial<FeedbackPagination>
  ) => Promise<FeedbackQueryResult>;
  getAnalytics: (filters?: FeedbackFilter) => Promise<FeedbackAnalytics>;
  createReport: (
    report: Omit<FeedbackReport, 'id' | 'generatedAt'>
  ) => Promise<FeedbackReport>;
  sendNotification: (
    notification: Omit<FeedbackNotification, 'id' | 'timestamp'>
  ) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  sync: () => Promise<void>;
  clearCache: () => Promise<void>;

  // 狀態選擇器
  getFeedbackById: (id: string) => FeedbackData | undefined;
  getFeedbacksByType: (type: string) => FeedbackData[];
  getFeedbacksByCategory: (category: string) => FeedbackData[];
  getFeedbacksByStatus: (status: string) => FeedbackData[];
  getUnreadNotifications: () => FeedbackNotification[];
  getNotificationsByType: (type: string) => FeedbackNotification[];
  getTotalFeedbacks: () => number;
  getTotalNotifications: () => number;
  getTotalReports: () => number;
}

// 創建 Context
const _FeedbackContext = createContext<FeedbackContextType | undefined>(
  undefined
);

// Provider Props 接口
interface FeedbackProviderProps {
  children: ReactNode;
  config?: Partial<FeedbackServiceConfig>;
  autoInitialize?: boolean;
  autoSync?: boolean;
  syncInterval?: number;
}

// 反饋 Provider 組件
export const FeedbackProvider: React.FC<FeedbackProviderProps> = ({
  children,
  config = {},
  autoInitialize = true,
  autoSync = true,
  syncInterval = 300000, // 5分鐘
}) => {
  const _dispatch = useDispatch<AppDispatch>();
  const [service, setService] = useState<FeedbackService | null>(null);
  const [syncTimer, setSyncTimer] = useState<NodeJS.Timeout | null>(null);

  // Redux 狀態
  const _feedbacks = useSelector(selectFeedbacks);
  const _analytics = useSelector(selectAnalytics);
  const _notifications = useSelector(selectNotifications);
  const _reports = useSelector(selectReports);
  const _filters = useSelector(selectFilters);
  const _sort = useSelector(selectSort);
  const _pagination = useSelector(selectPagination);
  const _loading = useSelector(selectLoading);
  const _submitting = useSelector(selectSubmitting);
  const _syncing = useSelector(selectSyncing);
  const _error = useSelector(selectError);
  const _serviceConfig = useSelector(selectServiceConfig);
  const _isInitialized = useSelector(selectIsInitialized);
  const _isOnline = useSelector(selectIsOnline);
  const _syncStatus = useSelector(selectSyncStatus);

  // 初始化服務
  useEffect(() => {
    if (autoInitialize && !service) {
      const _feedbackService = FeedbackService.getInstance(config);
      setService(feedbackService);

      // 初始化服務
      dispatch(initializeFeedbackService(config));

      // 設置事件監聽器
      feedbackService.on('feedbackSubmitted', (data: unknown) => {
        // 反饋提交事件已通過 Redux 處理
      });

      feedbackService.on('feedbackUpdated', (data: unknown) => {
        // 反饋更新事件已通過 Redux 處理
      });

      feedbackService.on('feedbackDeleted', (data: unknown) => {
        // 反饋刪除事件已通過 Redux 處理
      });

      feedbackService.on('notificationSent', (data: unknown) => {
        // 通知發送事件已通過 Redux 處理
      });

      feedbackService.on('syncCompleted', (data: unknown) => {
        // 同步完成事件已通過 Redux 處理
      });

      feedbackService.on('error', (data: unknown) => {
        console.error('FeedbackService error:', data.error);
      });
    }
  }, [autoInitialize, service, config, dispatch]);

  // 設置自動同步
  useEffect(() => {
    if (autoSync && service) {
      const _timer = setInterval(() => {
        dispatch(syncFeedbackData());
      }, syncInterval);

      setSyncTimer(timer);

      return () => {
        clearInterval(timer);
      };
    }
    return undefined;
  }, [autoSync, service, syncInterval, dispatch]);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      if (syncTimer) {
        clearInterval(syncTimer);
      }
      if (service) {
        service.destroy();
      }
    };
  }, [syncTimer, service]);

  // 操作函數
  const _handleSubmitFeedback = async (
    data: FeedbackFormData
  ): Promise<void> => {
    await dispatch(submitFeedback(data));
  };

  const _handleUpdateFeedback = async (
    id: string,
    data: Partial<FeedbackData>
  ): Promise<void> => {
    await dispatch(updateFeedback({ id, data }));
  };

  const _handleDeleteFeedback = async (id: string): Promise<void> => {
    await dispatch(deleteFeedback(id));
  };

  const _handleGetFeedback = async (
    id: string
  ): Promise<FeedbackData | null> => {
    const _result = await dispatch(fetchFeedback(id));
    return result.payload as FeedbackData | null;
  };

  const _handleGetFeedbacks = async (
    filters?: FeedbackFilter,
    sort?: FeedbackSort,
    pagination?: Partial<FeedbackPagination>
  ): Promise<FeedbackQueryResult> => {
    const _result = await dispatch(
      fetchFeedbacks({ filters, sort, pagination })
    );
    return result.payload as FeedbackQueryResult;
  };

  const _handleGetAnalytics = async (
    filters?: FeedbackFilter
  ): Promise<FeedbackAnalytics> => {
    const _result = await dispatch(fetchAnalytics(filters));
    return result.payload as FeedbackAnalytics;
  };

  const _handleCreateReport = async (
    report: Omit<FeedbackReport, 'id' | 'generatedAt'>
  ): Promise<FeedbackReport> => {
    const _result = await dispatch(createReport(report));
    return result.payload as FeedbackReport;
  };

  const _handleSendNotification = async (
    notification: Omit<FeedbackNotification, 'id' | 'timestamp'>
  ): Promise<void> => {
    await dispatch(sendNotification(notification));
  };

  const _handleMarkNotificationRead = async (
    notificationId: string
  ): Promise<void> => {
    await dispatch(markNotificationRead(notificationId));
  };

  const _handleSync = async (): Promise<void> => {
    await dispatch(syncFeedbackData());
  };

  const _handleClearCache = async (): Promise<void> => {
    await dispatch(clearFeedbackCache());
  };

  // 狀態選擇器函數
  const _getFeedbackById = (id: string): FeedbackData | undefined => {
    return feedbacks.find(f => f.id === id);
  };

  const _getFeedbacksByType = (type: string): FeedbackData[] => {
    return feedbacks.filter(f => f.type === type);
  };

  const _getFeedbacksByCategory = (category: string): FeedbackData[] => {
    return feedbacks.filter(f => f.category === category);
  };

  const _getFeedbacksByStatus = (status: string): FeedbackData[] => {
    return feedbacks.filter(f => f.status === status);
  };

  const _getUnreadNotifications = (): FeedbackNotification[] => {
    return notifications.filter(n => !n.read);
  };

  const _getNotificationsByType = (type: string): FeedbackNotification[] => {
    return notifications.filter(n => n.type === type);
  };

  const _getTotalFeedbacks = (): number => {
    return feedbacks.length;
  };

  const _getTotalNotifications = (): number => {
    return notifications.length;
  };

  const _getTotalReports = (): number => {
    return reports.length;
  };

  // Context 值
  const contextValue: FeedbackContextType = {
    service,
    feedbacks,
    analytics,
    notifications,
    reports,
    filters,
    sort,
    pagination,
    loading,
    submitting,
    syncing,
    error,
    serviceConfig,
    isInitialized,
    isOnline,
    syncStatus,
    submitFeedback: handleSubmitFeedback,
    updateFeedback: handleUpdateFeedback,
    deleteFeedback: handleDeleteFeedback,
    getFeedback: handleGetFeedback,
    getFeedbacks: handleGetFeedbacks,
    getAnalytics: handleGetAnalytics,
    createReport: handleCreateReport,
    sendNotification: handleSendNotification,
    markNotificationRead: handleMarkNotificationRead,
    sync: handleSync,
    clearCache: handleClearCache,
    getFeedbackById,
    getFeedbacksByType,
    getFeedbacksByCategory,
    getFeedbacksByStatus,
    getUnreadNotifications,
    getNotificationsByType,
    getTotalFeedbacks,
    getTotalNotifications,
    getTotalReports,
  };

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
    </FeedbackContext.Provider>
  );
};

// 自定義 Hooks

// useFeedback Hook
export const _useFeedback = (): UseFeedbackReturn => {
  const _context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }

  return {
    feedbacks: context.feedbacks,
    loading: context.loading,
    error: context.error,
    analytics: context.analytics,
    submitFeedback: context.submitFeedback,
    updateFeedback: context.updateFeedback,
    deleteFeedback: context.deleteFeedback,
    getFeedback: context.getFeedback,
    getFeedbacks: context.getFeedbacks,
    getAnalytics: context.getAnalytics,
    exportReport: async (format: string, filters?: FeedbackFilter) => {
      // 實現導出報告邏輯
      return `report.${format}`;
    },
    sendNotification: context.sendNotification,
    markNotificationRead: context.markNotificationRead,
  };
};

// useFeedbackService Hook
export const _useFeedbackService = (): UseFeedbackServiceReturn => {
  const _context = useContext(FeedbackContext);
  if (!context) {
    throw new Error(
      'useFeedbackService must be used within a FeedbackProvider'
    );
  }

  return {
    service: context.service,
    config: context.serviceConfig,
    isInitialized: context.isInitialized,
    isOnline: context.isOnline,
    syncStatus: context.syncStatus,
    initialize: async () => {
      // 初始化邏輯已通過 Provider 處理
    },
    sync: context.sync,
    clearCache: context.clearCache,
    updateConfig: (config: Partial<FeedbackServiceConfig>) => {
      // 更新配置邏輯
    },
  };
};

// useFeedbackState Hook
export const _useFeedbackState = (): UseFeedbackStateReturn => {
  const _context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedbackState must be used within a FeedbackProvider');
  }

  return {
    feedbacks: context.feedbacks,
    analytics: context.analytics,
    notifications: context.notifications,
    reports: context.reports,
    filters: context.filters,
    sort: context.sort,
    pagination: context.pagination,
    getFeedbackById: context.getFeedbackById,
    getFeedbacksByType: context.getFeedbacksByType,
    getFeedbacksByCategory: context.getFeedbacksByCategory,
    getFeedbacksByStatus: context.getFeedbacksByStatus,
    getUnreadNotifications: context.getUnreadNotifications,
    getNotificationsByType: context.getNotificationsByType,
  };
};

// useFeedbackActions Hook
export const _useFeedbackActions = (): UseFeedbackActionsReturn => {
  const _context = useContext(FeedbackContext);
  if (!context) {
    throw new Error(
      'useFeedbackActions must be used within a FeedbackProvider'
    );
  }

  return {
    submitFeedback: context.submitFeedback,
    updateFeedback: context.updateFeedback,
    deleteFeedback: context.deleteFeedback,
    fetchFeedbacks: context.getFeedbacks,
    fetchAnalytics: context.getAnalytics,
    createReport: context.createReport,
    sendNotification: context.sendNotification,
    markNotificationRead: context.markNotificationRead,
    updateFilters: (filters: Partial<FeedbackFilter>) => {
      // 更新過濾器邏輯
    },
    updateSort: (sort: FeedbackSort) => {
      // 更新排序邏輯
    },
    updatePagination: (pagination: Partial<FeedbackPagination>) => {
      // 更新分頁邏輯
    },
    clearError: () => {
      // 清除錯誤邏輯
    },
    resetState: () => {
      // 重置狀態邏輯
    },
  };
};

// 導出 Context
export { FeedbackContext };
