// 反饋系統 Redux Slice
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { FeedbackService } from '../../services/feedbackService';
import type {
  FeedbackAnalytics,
  FeedbackData,
  FeedbackFilter,
  FeedbackFormData,
  FeedbackNotification,
  FeedbackPagination,
  FeedbackReport,
  FeedbackServiceConfig,
  FeedbackSort,
} from '../../types/feedback';

// 反饋狀態接口
interface FeedbackState {
  // 數據
  feedbacks: FeedbackData[];
  analytics: FeedbackAnalytics | null;
  notifications: FeedbackNotification[];
  reports: FeedbackReport[];

  // 查詢狀態
  filters: FeedbackFilter;
  sort: FeedbackSort;
  pagination: FeedbackPagination;

  // 加載狀態
  loading: boolean;
  submitting: boolean;
  syncing: boolean;

  // 錯誤狀態
  error: string | null;

  // 服務狀態
  serviceConfig: FeedbackServiceConfig;
  isInitialized: boolean;
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
}

// 初始狀態
const initialState: FeedbackState = {
  feedbacks: [],
  analytics: null,
  notifications: [],
  reports: [],
  filters: {},
  sort: { field: 'timestamp', direction: 'desc' },
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  loading: false,
  submitting: false,
  syncing: false,
  error: null,
  serviceConfig: {
    apiEndpoint: 'https://api.cardstrategy.com/feedback',
    timeout: 30000,
    retryAttempts: 3,
    batchSize: 50,
    syncInterval: 300000,
    offlineSupport: true,
    encryptionEnabled: true,
    compressionEnabled: true,
  },
  isInitialized: false,
  isOnline: true,
  syncStatus: 'idle',
};

// 異步 Thunk 動作

// 初始化反饋服務
export const _initializeFeedbackService = createAsyncThunk(
  'feedback/initializeService',
  async (config?: Partial<FeedbackServiceConfig>) => {
    const _service = FeedbackService.getInstance(config);
    await service.initialize();
    return service.getStatus();
  }
);

// 提交反饋
export const _submitFeedback = createAsyncThunk(
  'feedback/submitFeedback',
  async (formData: FeedbackFormData) => {
    const _service = FeedbackService.getInstance();
    const _feedback = await service.submitFeedback(formData);
    return feedback;
  }
);

// 更新反饋
export const _updateFeedback = createAsyncThunk(
  'feedback/updateFeedback',
  async ({ id, data }: { id: string; data: Partial<FeedbackData> }) => {
    const _service = FeedbackService.getInstance();
    const _feedback = await service.updateFeedback(id, data);
    return feedback;
  }
);

// 刪除反饋
export const _deleteFeedback = createAsyncThunk(
  'feedback/deleteFeedback',
  async (id: string) => {
    const _service = FeedbackService.getInstance();
    await service.deleteFeedback(id);
    return id;
  }
);

// 獲取反饋
export const _fetchFeedback = createAsyncThunk(
  'feedback/fetchFeedback',
  async (id: string) => {
    const _service = FeedbackService.getInstance();
    const _feedback = await service.getFeedback(id);
    return feedback;
  }
);

// 獲取反饋列表
export const _fetchFeedbacks = createAsyncThunk(
  'feedback/fetchFeedbacks',
  async ({
    filters,
    sort,
    pagination,
  }: {
    filters?: FeedbackFilter;
    sort?: FeedbackSort;
    pagination?: Partial<FeedbackPagination>;
  }) => {
    const _service = FeedbackService.getInstance();
    const _result = await service.getFeedbacks(filters, sort, pagination);
    return result;
  }
);

// 獲取分析數據
export const _fetchAnalytics = createAsyncThunk(
  'feedback/fetchAnalytics',
  async (filters?: FeedbackFilter) => {
    const _service = FeedbackService.getInstance();
    const _analytics = await service.getAnalytics(filters);
    return analytics;
  }
);

// 創建報告
export const _createReport = createAsyncThunk(
  'feedback/createReport',
  async (report: Omit<FeedbackReport, 'id' | 'generatedAt'>) => {
    const _service = FeedbackService.getInstance();
    const _newReport = await service.createReport(report);
    return newReport;
  }
);

// 發送通知
export const _sendNotification = createAsyncThunk(
  'feedback/sendNotification',
  async (notification: Omit<FeedbackNotification, 'id' | 'timestamp'>) => {
    const _service = FeedbackService.getInstance();
    await service.sendNotification(notification);
    return notification;
  }
);

// 標記通知為已讀
export const _markNotificationRead = createAsyncThunk(
  'feedback/markNotificationRead',
  async (notificationId: string) => {
    const _service = FeedbackService.getInstance();
    await service.markNotificationRead(notificationId);
    return notificationId;
  }
);

// 同步數據
export const _syncFeedbackData = createAsyncThunk(
  'feedback/syncData',
  async () => {
    const _service = FeedbackService.getInstance();
    await service.sync();
    return service.getStatus();
  }
);

// 清除緩存
export const _clearFeedbackCache = createAsyncThunk(
  'feedback/clearCache',
  async () => {
    const _service = FeedbackService.getInstance();
    await service.clearCache();
  }
);

// 反饋 Slice
const _feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    // 直接狀態更新
    setFeedbacks: (state, action: PayloadAction<FeedbackData[]>) => {
      state.feedbacks = action.payload;
    },

    addFeedback: (state, action: PayloadAction<FeedbackData>) => {
      state.feedbacks.unshift(action.payload);
    },

    updateFeedbackInState: (state, action: PayloadAction<FeedbackData>) => {
      const _index = state.feedbacks.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.feedbacks[index] = action.payload;
      }
    },

    removeFeedback: (state, action: PayloadAction<string>) => {
      state.feedbacks = state.feedbacks.filter(f => f.id !== action.payload);
    },

    setAnalytics: (state, action: PayloadAction<FeedbackAnalytics>) => {
      state.analytics = action.payload;
    },

    addNotification: (state, action: PayloadAction<FeedbackNotification>) => {
      state.notifications.unshift(action.payload);
    },

    updateNotification: (
      state,
      action: PayloadAction<FeedbackNotification>
    ) => {
      const _index = state.notifications.findIndex(
        n => n.id === action.payload.id
      );
      if (index !== -1) {
        state.notifications[index] = action.payload;
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        n => n.id !== action.payload
      );
    },

    addReport: (state, action: PayloadAction<FeedbackReport>) => {
      state.reports.unshift(action.payload);
    },

    // 查詢狀態更新
    updateFilters: (state, action: PayloadAction<Partial<FeedbackFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    setFilters: (state, action: PayloadAction<FeedbackFilter>) => {
      state.filters = action.payload;
    },

    updateSort: (state, action: PayloadAction<FeedbackSort>) => {
      state.sort = action.payload;
    },

    updatePagination: (
      state,
      action: PayloadAction<Partial<FeedbackPagination>>
    ) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    setPagination: (state, action: PayloadAction<FeedbackPagination>) => {
      state.pagination = action.payload;
    },

    // 加載狀態更新
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.submitting = action.payload;
    },

    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
    },

    // 錯誤狀態更新
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: state => {
      state.error = null;
    },

    // 服務狀態更新
    updateServiceConfig: (
      state,
      action: PayloadAction<Partial<FeedbackServiceConfig>>
    ) => {
      state.serviceConfig = { ...state.serviceConfig, ...action.payload };
    },

    setServiceStatus: (
      state,
      action: PayloadAction<{
        isInitialized: boolean;
        isOnline: boolean;
        syncStatus: 'idle' | 'syncing' | 'error';
      }>
    ) => {
      state.isInitialized = action.payload.isInitialized;
      state.isOnline = action.payload.isOnline;
      state.syncStatus = action.payload.syncStatus;
    },

    // 重置狀態
    resetFeedbackState: state => {
      state.feedbacks = [];
      state.analytics = null;
      state.notifications = [];
      state.reports = [];
      state.filters = {};
      state.sort = { field: 'timestamp', direction: 'desc' };
      state.pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };
      state.loading = false;
      state.submitting = false;
      state.syncing = false;
      state.error = null;
    },

    // 批量操作
    batchUpdateFeedbacks: (state, action: PayloadAction<FeedbackData[]>) => {
      action.payload.forEach(feedback => {
        const _index = state.feedbacks.findIndex(f => f.id === feedback.id);
        if (index !== -1) {
          state.feedbacks[index] = feedback;
        } else {
          state.feedbacks.push(feedback);
        }
      });
    },

    batchRemoveFeedbacks: (state, action: PayloadAction<string[]>) => {
      state.feedbacks = state.feedbacks.filter(
        f => !action.payload.includes(f.id)
      );
    },
  },

  // 處理異步 Thunk 動作
  extraReducers: builder => {
    // 初始化服務
    builder
      .addCase(initializeFeedbackService.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeFeedbackService.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.isOnline = action.payload.isOnline;
        state.syncStatus = action.payload.syncStatus;
      })
      .addCase(initializeFeedbackService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '初始化失敗';
      });

    // 提交反饋
    builder
      .addCase(submitFeedback.pending, state => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitFeedback.fulfilled, (state, action) => {
        state.submitting = false;
        state.feedbacks.unshift(action.payload);
      })
      .addCase(submitFeedback.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || '提交失敗';
      });

    // 更新反饋
    builder
      .addCase(updateFeedback.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.loading = false;
        const _index = state.feedbacks.findIndex(
          f => f.id === action.payload.id
        );
        if (index !== -1) {
          state.feedbacks[index] = action.payload;
        }
      })
      .addCase(updateFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '更新失敗';
      });

    // 刪除反饋
    builder
      .addCase(deleteFeedback.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = state.feedbacks.filter(f => f.id !== action.payload);
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '刪除失敗';
      });

    // 獲取反饋列表
    builder
      .addCase(fetchFeedbacks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.feedbacks = action.payload.feedbacks;
        state.pagination = action.payload.pagination;
        state.analytics = action.payload.analytics;
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '獲取失敗';
      });

    // 獲取分析數據
    builder
      .addCase(fetchAnalytics.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '獲取分析數據失敗';
      });

    // 創建報告
    builder
      .addCase(createReport.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.unshift(action.payload);
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '創建報告失敗';
      });

    // 發送通知
    builder
      .addCase(sendNotification.pending, state => {
        state.error = null;
      })
      .addCase(sendNotification.fulfilled, (state, action) => {
        // 通知已發送，不需要更新狀態
      })
      .addCase(sendNotification.rejected, (state, action) => {
        state.error = action.error.message || '發送通知失敗';
      });

    // 標記通知為已讀
    builder
      .addCase(markNotificationRead.pending, state => {
        state.error = null;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const _notification = state.notifications.find(
          n => n.id === action.payload
        );
        if (notification) {
          notification.read = true;
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.error = action.error.message || '標記通知失敗';
      });

    // 同步數據
    builder
      .addCase(syncFeedbackData.pending, state => {
        state.syncing = true;
        state.syncStatus = 'syncing';
        state.error = null;
      })
      .addCase(syncFeedbackData.fulfilled, (state, action) => {
        state.syncing = false;
        state.syncStatus = 'idle';
        state.isOnline = action.payload.isOnline;
      })
      .addCase(syncFeedbackData.rejected, (state, action) => {
        state.syncing = false;
        state.syncStatus = 'error';
        state.error = action.error.message || '同步失敗';
      });

    // 清除緩存
    builder
      .addCase(clearFeedbackCache.pending, state => {
        state.error = null;
      })
      .addCase(clearFeedbackCache.fulfilled, state => {
        // 緩存已清除
      })
      .addCase(clearFeedbackCache.rejected, (state, action) => {
        state.error = action.error.message || '清除緩存失敗';
      });
  },
});

// 導出 actions
export const {
  setFeedbacks,
  addFeedback,
  updateFeedbackInState,
  removeFeedback,
  setAnalytics,
  addNotification,
  updateNotification,
  removeNotification,
  addReport,
  updateFilters,
  setFilters,
  updateSort,
  updatePagination,
  setPagination,
  setLoading,
  setSubmitting,
  setSyncing,
  setError,
  clearError,
  updateServiceConfig,
  setServiceStatus,
  resetFeedbackState,
  batchUpdateFeedbacks,
  batchRemoveFeedbacks,
} = feedbackSlice.actions;

// 導出 reducer
export default feedbackSlice.reducer;

// 選擇器
export const _selectFeedbacks = (state: { feedback: FeedbackState }) =>
  state.feedback.feedbacks;
export const _selectAnalytics = (state: { feedback: FeedbackState }) =>
  state.feedback.analytics;
export const _selectNotifications = (state: { feedback: FeedbackState }) =>
  state.feedback.notifications;
export const _selectReports = (state: { feedback: FeedbackState }) =>
  state.feedback.reports;
export const _selectFilters = (state: { feedback: FeedbackState }) =>
  state.feedback.filters;
export const _selectSort = (state: { feedback: FeedbackState }) =>
  state.feedback.sort;
export const _selectPagination = (state: { feedback: FeedbackState }) =>
  state.feedback.pagination;
export const _selectLoading = (state: { feedback: FeedbackState }) =>
  state.feedback.loading;
export const _selectSubmitting = (state: { feedback: FeedbackState }) =>
  state.feedback.submitting;
export const _selectSyncing = (state: { feedback: FeedbackState }) =>
  state.feedback.syncing;
export const _selectError = (state: { feedback: FeedbackState }) =>
  state.feedback.error;
export const _selectServiceConfig = (state: { feedback: FeedbackState }) =>
  state.feedback.serviceConfig;
export const _selectIsInitialized = (state: { feedback: FeedbackState }) =>
  state.feedback.isInitialized;
export const _selectIsOnline = (state: { feedback: FeedbackState }) =>
  state.feedback.isOnline;
export const _selectSyncStatus = (state: { feedback: FeedbackState }) =>
  state.feedback.syncStatus;

// 派生選擇器
export const _selectFeedbackById = (
  state: { feedback: FeedbackState },
  id: string
) => state.feedback.feedbacks.find(f => f.id === id);

export const _selectFeedbacksByType = (
  state: { feedback: FeedbackState },
  type: string
) => state.feedback.feedbacks.filter(f => f.type === type);

export const _selectFeedbacksByCategory = (
  state: { feedback: FeedbackState },
  category: string
) => state.feedback.feedbacks.filter(f => f.category === category);

export const _selectFeedbacksByStatus = (
  state: { feedback: FeedbackState },
  status: string
) => state.feedback.feedbacks.filter(f => f.status === status);

export const _selectUnreadNotifications = (state: {
  feedback: FeedbackState;
}) => state.feedback.notifications.filter(n => !n.read);

export const _selectNotificationsByType = (
  state: { feedback: FeedbackState },
  type: string
) => state.feedback.notifications.filter(n => n.type === type);

export const _selectTotalFeedbacks = (state: { feedback: FeedbackState }) =>
  state.feedback.feedbacks.length;
export const _selectTotalNotifications = (state: { feedback: FeedbackState }) =>
  state.feedback.notifications.length;
export const _selectTotalReports = (state: { feedback: FeedbackState }) =>
  state.feedback.reports.length;
