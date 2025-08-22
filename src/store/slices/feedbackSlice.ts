import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { feedbackService } from '../../services/feedbackService';
import {
  UserFeedback,
  CreateFeedbackRequest,
  UpdateFeedbackRequest,
  CreateFeedbackResponseRequest,
  FeedbackQueryParams,
  FeedbackStats,
  FeedbackAnalysisReport,
  FeedbackTemplate,
  FeedbackTag,
  FeedbackNotificationSettings,
  FeedbackFilter,
  FeedbackSortBy,
  FeedbackSortOrder,
} from '../../types/feedback';

// 反饋狀態接口
interface FeedbackState {
  // 反饋列表
  feedbacks: UserFeedback[];
  currentFeedback: UserFeedback | null;

  // 分頁信息
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };

  // 過濾和排序
  filter: FeedbackFilter;
  sortBy: FeedbackSortBy;
  sortOrder: FeedbackSortOrder;

  // 統計和分析
  stats: FeedbackStats | null;
  analysis: FeedbackAnalysisReport | null;

  // 模板和標籤
  templates: FeedbackTemplate[];
  tags: FeedbackTag[];

  // 通知設置
  notificationSettings: FeedbackNotificationSettings | null;

  // 用戶反饋歷史
  userHistory: UserFeedback[];

  // 搜索
  searchQuery: string;
  searchResults: UserFeedback[];

  // 加載狀態
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isVoting: boolean;
  isSearching: boolean;
  isUploading: boolean;

  // 錯誤狀態
  error: string | null;

  // 選中的反饋
  selectedFeedbackIds: string[];

  // 批量操作
  isBatchMode: boolean;
}

// 初始狀態
const initialState: FeedbackState = {
  feedbacks: [],
  currentFeedback: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
  filter: {},
  sortBy: 'createdAt',
  sortOrder: 'desc',
  stats: null,
  analysis: null,
  templates: [],
  tags: [],
  notificationSettings: null,
  userHistory: [],
  searchQuery: '',
  searchResults: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isVoting: false,
  isSearching: false,
  isUploading: false,
  error: null,
  selectedFeedbackIds: [],
  isBatchMode: false,
};

// 異步 Thunk Actions

// 獲取反饋列表
export const fetchFeedbacks = createAsyncThunk(
  'feedback/fetchFeedbacks',
  async (params?: FeedbackQueryParams) => {
    const response = await feedbackService.getFeedbacks(params);
    return response;
  }
);

// 創建反饋
export const createFeedback = createAsyncThunk(
  'feedback/createFeedback',
  async (data: CreateFeedbackRequest) => {
    const feedback = await feedbackService.createFeedback(data);
    return feedback;
  }
);

// 獲取反饋詳情
export const fetchFeedback = createAsyncThunk(
  'feedback/fetchFeedback',
  async (id: string) => {
    const feedback = await feedbackService.getFeedback(id);
    return feedback;
  }
);

// 更新反饋
export const updateFeedback = createAsyncThunk(
  'feedback/updateFeedback',
  async ({ id, data }: { id: string; data: UpdateFeedbackRequest }) => {
    const feedback = await feedbackService.updateFeedback(id, data);
    return feedback;
  }
);

// 刪除反饋
export const deleteFeedback = createAsyncThunk(
  'feedback/deleteFeedback',
  async (id: string) => {
    await feedbackService.deleteFeedback(id);
    return id;
  }
);

// 為反饋投票
export const voteFeedback = createAsyncThunk(
  'feedback/voteFeedback',
  async ({ id, vote }: { id: string; vote: 1 | -1 }) => {
    await feedbackService.voteFeedback(id, vote);
    return { id, vote };
  }
);

// 創建反饋回應
export const createFeedbackResponse = createAsyncThunk(
  'feedback/createFeedbackResponse',
  async (data: CreateFeedbackResponseRequest) => {
    await feedbackService.createResponse(data);
    return data;
  }
);

// 獲取反饋統計
export const fetchFeedbackStats = createAsyncThunk(
  'feedback/fetchFeedbackStats',
  async () => {
    const stats = await feedbackService.getFeedbackStats();
    return stats;
  }
);

// 獲取反饋分析
export const fetchFeedbackAnalysis = createAsyncThunk(
  'feedback/fetchFeedbackAnalysis',
  async (period?: { start: string; end: string }) => {
    const analysis = await feedbackService.getFeedbackAnalysis(period);
    return analysis;
  }
);

// 獲取反饋模板
export const fetchFeedbackTemplates = createAsyncThunk(
  'feedback/fetchFeedbackTemplates',
  async () => {
    const templates = await feedbackService.getFeedbackTemplates();
    return templates;
  }
);

// 獲取反饋標籤
export const fetchFeedbackTags = createAsyncThunk(
  'feedback/fetchFeedbackTags',
  async () => {
    const tags = await feedbackService.getFeedbackTags();
    return tags;
  }
);

// 獲取通知設置
export const fetchNotificationSettings = createAsyncThunk(
  'feedback/fetchNotificationSettings',
  async () => {
    const settings = await feedbackService.getNotificationSettings();
    return settings;
  }
);

// 更新通知設置
export const updateNotificationSettings = createAsyncThunk(
  'feedback/updateNotificationSettings',
  async (settings: Partial<FeedbackNotificationSettings>) => {
    await feedbackService.updateNotificationSettings(settings);
    return settings;
  }
);

// 搜索反饋
export const searchFeedbacks = createAsyncThunk(
  'feedback/searchFeedbacks',
  async ({
    query,
    params,
  }: {
    query: string;
    params?: FeedbackQueryParams;
  }) => {
    const response = await feedbackService.searchFeedbacks(query, params);
    return { query, ...response };
  }
);

// 獲取用戶反饋歷史
export const fetchUserFeedbackHistory = createAsyncThunk(
  'feedback/fetchUserFeedbackHistory',
  async () => {
    const history = await feedbackService.getUserFeedbackHistory();
    return history;
  }
);

// 標記反饋為已讀
export const markFeedbackAsRead = createAsyncThunk(
  'feedback/markFeedbackAsRead',
  async (id: string) => {
    await feedbackService.markFeedbackAsRead(id);
    return id;
  }
);

// 上傳附件
export const uploadAttachment = createAsyncThunk(
  'feedback/uploadAttachment',
  async ({ feedbackId, file }: { feedbackId: string; file: File }) => {
    const url = await feedbackService.uploadAttachment(feedbackId, file);
    return { feedbackId, url };
  }
);

// 反饋 Slice
const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    // 清除錯誤
    clearError: (state) => {
      state.error = null;
    },

    // 設置當前反饋
    setCurrentFeedback: (state, action: PayloadAction<UserFeedback | null>) => {
      state.currentFeedback = action.payload;
    },

    // 更新過濾器
    updateFilter: (state, action: PayloadAction<Partial<FeedbackFilter>>) => {
      state.filter = { ...state.filter, ...action.payload };
      state.pagination.page = 1; // 重置到第一頁
    },

    // 清除過濾器
    clearFilter: (state) => {
      state.filter = {};
      state.pagination.page = 1;
    },

    // 設置排序
    setSort: (
      state,
      action: PayloadAction<{
        sortBy: FeedbackSortBy;
        sortOrder: FeedbackSortOrder;
      }>
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      state.pagination.page = 1;
    },

    // 設置搜索查詢
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // 清除搜索結果
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },

    // 選中/取消選中反饋
    toggleFeedbackSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      const index = state.selectedFeedbackIds.indexOf(id);

      if (index > -1) {
        state.selectedFeedbackIds.splice(index, 1);
      } else {
        state.selectedFeedbackIds.push(id);
      }
    },

    // 全選/取消全選
    toggleSelectAll: (state) => {
      if (state.selectedFeedbackIds.length === state.feedbacks.length) {
        state.selectedFeedbackIds = [];
      } else {
        state.selectedFeedbackIds = state.feedbacks.map((f) => f.id);
      }
    },

    // 清除選中
    clearSelection: (state) => {
      state.selectedFeedbackIds = [];
    },

    // 切換批量模式
    toggleBatchMode: (state) => {
      state.isBatchMode = !state.isBatchMode;
      if (!state.isBatchMode) {
        state.selectedFeedbackIds = [];
      }
    },

    // 更新反饋投票數（本地更新）
    updateFeedbackVotes: (
      state,
      action: PayloadAction<{ id: string; vote: 1 | -1 }>
    ) => {
      const { id, vote } = action.payload;
      const feedback = state.feedbacks.find((f) => f.id === id);
      if (feedback) {
        feedback.votes += vote;
      }

      if (state.currentFeedback?.id === id) {
        state.currentFeedback.votes += vote;
      }
    },

    // 添加反饋到列表（用於實時更新）
    addFeedbackToList: (state, action: PayloadAction<UserFeedback>) => {
      state.feedbacks.unshift(action.payload);
      state.pagination.total += 1;
    },

    // 更新列表中的反饋
    updateFeedbackInList: (state, action: PayloadAction<UserFeedback>) => {
      const index = state.feedbacks.findIndex(
        (f) => f.id === action.payload.id
      );
      if (index > -1) {
        state.feedbacks[index] = action.payload;
      }

      if (state.currentFeedback?.id === action.payload.id) {
        state.currentFeedback = action.payload;
      }
    },

    // 從列表中移除反饋
    removeFeedbackFromList: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.feedbacks = state.feedbacks.filter((f) => f.id !== id);
      state.pagination.total = Math.max(0, state.pagination.total - 1);

      if (state.currentFeedback?.id === id) {
        state.currentFeedback = null;
      }
    },

    // 重置狀態
    resetFeedbackState: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    // fetchFeedbacks
    builder
      .addCase(fetchFeedbacks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedbacks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feedbacks = action.payload.feedbacks;
        state.pagination = {
          page: action.payload.page,
          limit: action.payload.limit,
          total: action.payload.total,
          hasMore: action.payload.feedbacks.length === action.payload.limit,
        };
      })
      .addCase(fetchFeedbacks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '獲取反饋列表失敗';
      });

    // createFeedback
    builder
      .addCase(createFeedback.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.isCreating = false;
        state.feedbacks.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createFeedback.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.error.message || '創建反饋失敗';
      });

    // fetchFeedback
    builder
      .addCase(fetchFeedback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFeedback = action.payload;
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '獲取反饋詳情失敗';
      });

    // updateFeedback
    builder
      .addCase(updateFeedback.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateFeedback.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.feedbacks.findIndex(
          (f) => f.id === action.payload.id
        );
        if (index > -1) {
          state.feedbacks[index] = action.payload;
        }
        if (state.currentFeedback?.id === action.payload.id) {
          state.currentFeedback = action.payload;
        }
      })
      .addCase(updateFeedback.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message || '更新反饋失敗';
      });

    // deleteFeedback
    builder
      .addCase(deleteFeedback.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.isDeleting = false;
        const id = action.payload;
        state.feedbacks = state.feedbacks.filter((f) => f.id !== id);
        state.pagination.total = Math.max(0, state.pagination.total - 1);
        if (state.currentFeedback?.id === id) {
          state.currentFeedback = null;
        }
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.error.message || '刪除反饋失敗';
      });

    // voteFeedback
    builder
      .addCase(voteFeedback.pending, (state) => {
        state.isVoting = true;
        state.error = null;
      })
      .addCase(voteFeedback.fulfilled, (state, action) => {
        state.isVoting = false;
        const { id, vote } = action.payload;
        const feedback = state.feedbacks.find((f) => f.id === id);
        if (feedback) {
          feedback.votes += vote;
        }
        if (state.currentFeedback?.id === id) {
          state.currentFeedback.votes += vote;
        }
      })
      .addCase(voteFeedback.rejected, (state, action) => {
        state.isVoting = false;
        state.error = action.error.message || '投票失敗';
      });

    // fetchFeedbackStats
    builder.addCase(fetchFeedbackStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // fetchFeedbackAnalysis
    builder.addCase(fetchFeedbackAnalysis.fulfilled, (state, action) => {
      state.analysis = action.payload;
    });

    // fetchFeedbackTemplates
    builder.addCase(fetchFeedbackTemplates.fulfilled, (state, action) => {
      state.templates = action.payload;
    });

    // fetchFeedbackTags
    builder.addCase(fetchFeedbackTags.fulfilled, (state, action) => {
      state.tags = action.payload;
    });

    // fetchNotificationSettings
    builder.addCase(fetchNotificationSettings.fulfilled, (state, action) => {
      state.notificationSettings = action.payload;
    });

    // searchFeedbacks
    builder
      .addCase(searchFeedbacks.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchFeedbacks.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.feedbacks;
        state.searchQuery = action.payload.query;
      })
      .addCase(searchFeedbacks.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.error.message || '搜索失敗';
      });

    // fetchUserFeedbackHistory
    builder.addCase(fetchUserFeedbackHistory.fulfilled, (state, action) => {
      state.userHistory = action.payload;
    });

    // uploadAttachment
    builder
      .addCase(uploadAttachment.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadAttachment.fulfilled, (state) => {
        state.isUploading = false;
      })
      .addCase(uploadAttachment.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.error.message || '上傳附件失敗';
      });
  },
});

// 導出 actions
export const {
  clearError,
  setCurrentFeedback,
  updateFilter,
  clearFilter,
  setSort,
  setSearchQuery,
  clearSearchResults,
  toggleFeedbackSelection,
  toggleSelectAll,
  clearSelection,
  toggleBatchMode,
  updateFeedbackVotes,
  addFeedbackToList,
  updateFeedbackInList,
  removeFeedbackFromList,
  resetFeedbackState,
} = feedbackSlice.actions;

// 導出 reducer
export default feedbackSlice.reducer;

// 選擇器
export const selectFeedbacks = (state: { feedback: FeedbackState }) =>
  state.feedback.feedbacks;
export const selectCurrentFeedback = (state: { feedback: FeedbackState }) =>
  state.feedback.currentFeedback;
export const selectFeedbackPagination = (state: { feedback: FeedbackState }) =>
  state.feedback.pagination;
export const selectFeedbackFilter = (state: { feedback: FeedbackState }) =>
  state.feedback.filter;
export const selectFeedbackSort = (state: { feedback: FeedbackState }) => ({
  sortBy: state.feedback.sortBy,
  sortOrder: state.feedback.sortOrder,
});
export const selectFeedbackStats = (state: { feedback: FeedbackState }) =>
  state.feedback.stats;
export const selectFeedbackAnalysis = (state: { feedback: FeedbackState }) =>
  state.feedback.analysis;
export const selectFeedbackTemplates = (state: { feedback: FeedbackState }) =>
  state.feedback.templates;
export const selectFeedbackTags = (state: { feedback: FeedbackState }) =>
  state.feedback.tags;
export const selectNotificationSettings = (state: {
  feedback: FeedbackState;
}) => state.feedback.notificationSettings;
export const selectUserFeedbackHistory = (state: { feedback: FeedbackState }) =>
  state.feedback.userHistory;
export const selectSearchQuery = (state: { feedback: FeedbackState }) =>
  state.feedback.searchQuery;
export const selectSearchResults = (state: { feedback: FeedbackState }) =>
  state.feedback.searchResults;
export const selectSelectedFeedbackIds = (state: { feedback: FeedbackState }) =>
  state.feedback.selectedFeedbackIds;
export const selectIsBatchMode = (state: { feedback: FeedbackState }) =>
  state.feedback.isBatchMode;

// 加載狀態選擇器
export const selectFeedbackLoadingStates = (state: {
  feedback: FeedbackState;
}) => ({
  isLoading: state.feedback.isLoading,
  isCreating: state.feedback.isCreating,
  isUpdating: state.feedback.isUpdating,
  isDeleting: state.feedback.isDeleting,
  isVoting: state.feedback.isVoting,
  isSearching: state.feedback.isSearching,
  isUploading: state.feedback.isUploading,
});

export const selectFeedbackError = (state: { feedback: FeedbackState }) =>
  state.feedback.error;
