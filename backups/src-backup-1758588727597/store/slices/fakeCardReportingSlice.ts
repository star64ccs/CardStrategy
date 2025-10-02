/**
 * 假卡回報系統 Redux Slice
 */

import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fakeCardReportingService } from '../../services/fakeCardReportingService';
import {
  BlacklistEntityType,
  BlacklistEntry,
  BlacklistStatus,
  FakeCardFilters,
  FakeCardReport,
  FakeCardReportStatus,
  FakeCardResolution,
  FakeCardSearchResult,
  FakeCardStats,
  FakeCardWarning,
  ResolutionAction,
} from '../../types/fakeCardReporting';

// 狀態接口
export interface FakeCardReportingState {
  // 舉報相關
  reports: FakeCardReport[];
  currentReport: FakeCardReport | null;
  reportSearchResult: FakeCardSearchResult | null;
  reportFilters: FakeCardFilters;

  // 警告相關
  warnings: FakeCardWarning[];
  userWarnings: FakeCardWarning[];

  // 黑名單相關
  blacklistEntries: BlacklistEntry[];
  blacklistCheckResult: boolean | null;

  // 統計數據
  stats: FakeCardStats | null;

  // 狀態管理
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // UI 狀態
  selectedReportId: string | null;
  selectedWarningId: string | null;
  selectedBlacklistEntryId: string | null;
  showCreateReportModal: boolean;
  showCreateWarningModal: boolean;
  showCreateBlacklistModal: boolean;
  showStatsModal: boolean;
}

// 初始狀態
const initialState: FakeCardReportingState = {
  reports: [],
  currentReport: null,
  reportSearchResult: null,
  reportFilters: {},
  warnings: [],
  userWarnings: [],
  blacklistEntries: [],
  blacklistCheckResult: null,
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
  selectedReportId: null,
  selectedWarningId: null,
  selectedBlacklistEntryId: null,
  showCreateReportModal: false,
  showCreateWarningModal: false,
  showCreateBlacklistModal: false,
  showStatsModal: false,
};

// 異步 Thunks

// 創建舉報
export const createReport = createAsyncThunk(
  'fakeCardReporting/createReport',
  async (
    request: Parameters<typeof fakeCardReportingService.createReport>[0],
    { rejectWithValue }
  ) => {
    try {
      const report = await fakeCardReportingService.createReport(request);
      return report;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '創建舉報失敗'
      );
    }
  }
);

// 獲取舉報
export const getReport = createAsyncThunk(
  'fakeCardReporting/getReport',
  async (reportId: string, { rejectWithValue }) => {
    try {
      const report = await fakeCardReportingService.getReport(reportId);
      return report;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取舉報失敗'
      );
    }
  }
);

// 更新舉報
export const updateReport = createAsyncThunk(
  'fakeCardReporting/updateReport',
  async (
    request: Parameters<typeof fakeCardReportingService.updateReport>[0],
    { rejectWithValue }
  ) => {
    try {
      const report = await fakeCardReportingService.updateReport(request);
      return report;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '更新舉報失敗'
      );
    }
  }
);

// 搜索舉報
export const searchReports = createAsyncThunk(
  'fakeCardReporting/searchReports',
  async (
    params: { filters: FakeCardFilters; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const result = await fakeCardReportingService.searchReports(
        params.filters,
        params.page,
        params.limit
      );
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '搜索舉報失敗'
      );
    }
  }
);

// 解決舉報
export const resolveReport = createAsyncThunk(
  'fakeCardReporting/resolveReport',
  async (
    params: {
      reportId: string;
      resolution: FakeCardResolution;
      resolvedBy: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const report = await fakeCardReportingService.resolveReport(
        params.reportId,
        params.resolution,
        params.resolvedBy
      );
      return report;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '解決舉報失敗'
      );
    }
  }
);

// 創建警告
export const createWarning = createAsyncThunk(
  'fakeCardReporting/createWarning',
  async (
    request: Parameters<typeof fakeCardReportingService.createWarning>[0],
    { rejectWithValue }
  ) => {
    try {
      const warning = await fakeCardReportingService.createWarning(request);
      return warning;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '創建警告失敗'
      );
    }
  }
);

// 獲取用戶警告
export const getUserWarnings = createAsyncThunk(
  'fakeCardReporting/getUserWarnings',
  async (userId: string, { rejectWithValue }) => {
    try {
      const warnings = await fakeCardReportingService.getUserWarnings(userId);
      return warnings;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取用戶警告失敗'
      );
    }
  }
);

// 確認警告
export const acknowledgeWarning = createAsyncThunk(
  'fakeCardReporting/acknowledgeWarning',
  async (warningId: string, { rejectWithValue }) => {
    try {
      const warning =
        await fakeCardReportingService.acknowledgeWarning(warningId);
      return warning;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '確認警告失敗'
      );
    }
  }
);

// 創建黑名單條目
export const createBlacklistEntry = createAsyncThunk(
  'fakeCardReporting/createBlacklistEntry',
  async (
    request: Parameters<
      typeof fakeCardReportingService.createBlacklistEntry
    >[0],
    { rejectWithValue }
  ) => {
    try {
      const entry =
        await fakeCardReportingService.createBlacklistEntry(request);
      return entry;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '創建黑名單條目失敗'
      );
    }
  }
);

// 獲取黑名單條目
export const getBlacklistEntries = createAsyncThunk(
  'fakeCardReporting/getBlacklistEntries',
  async (
    params?: { entityType?: BlacklistEntityType; status?: BlacklistStatus },
    { rejectWithValue }
  ) => {
    try {
      const entries = await fakeCardReportingService.getBlacklistEntries(
        params?.entityType,
        params?.status
      );
      return entries;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取黑名單條目失敗'
      );
    }
  }
);

// 檢查黑名單
export const checkBlacklist = createAsyncThunk(
  'fakeCardReporting/checkBlacklist',
  async (
    params: { entityId: string; entityType: BlacklistEntityType },
    { rejectWithValue }
  ) => {
    try {
      const isBlacklisted = await fakeCardReportingService.checkBlacklist(
        params.entityId,
        params.entityType
      );
      return {
        entityId: params.entityId,
        entityType: params.entityType,
        isBlacklisted,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '檢查黑名單失敗'
      );
    }
  }
);

// 上訴黑名單條目
export const appealBlacklistEntry = createAsyncThunk(
  'fakeCardReporting/appealBlacklistEntry',
  async (params: { entryId: string; reason: string }, { rejectWithValue }) => {
    try {
      const entry = await fakeCardReportingService.appealBlacklistEntry(
        params.entryId,
        params.reason
      );
      return entry;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '上訴黑名單條目失敗'
      );
    }
  }
);

// 獲取統計數據
export const getStats = createAsyncThunk(
  'fakeCardReporting/getStats',
  async (
    params?: {
      dateRange?: { start: Date; end: Date };
      filters?: Partial<FakeCardFilters>;
    },
    { rejectWithValue }
  ) => {
    try {
      const stats = await fakeCardReportingService.getStats(
        params?.dateRange,
        params?.filters
      );
      return stats;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取統計數據失敗'
      );
    }
  }
);

// 驗證證據
export const verifyEvidence = createAsyncThunk(
  'fakeCardReporting/verifyEvidence',
  async (
    params: {
      evidenceId: string;
      verified: boolean;
      verificationScore?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const evidence = await fakeCardReportingService.verifyEvidence(
        params.evidenceId,
        params.verified,
        params.verificationScore
      );
      return evidence;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '驗證證據失敗'
      );
    }
  }
);

// 獲取用戶舉報歷史
export const getUserReportHistory = createAsyncThunk(
  'fakeCardReporting/getUserReportHistory',
  async (
    params: { userId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const result = await fakeCardReportingService.getUserReportHistory(
        params.userId,
        params.page,
        params.limit
      );
      return result;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '獲取用戶舉報歷史失敗'
      );
    }
  }
);

// 批量處理舉報
export const bulkProcessReports = createAsyncThunk(
  'fakeCardReporting/bulkProcessReports',
  async (
    params: {
      reportIds: string[];
      action: ResolutionAction;
      reason: string;
      processedBy: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const reports = await fakeCardReportingService.bulkProcessReports(
        params.reportIds,
        params.action,
        params.reason,
        params.processedBy
      );
      return reports;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : '批量處理舉報失敗'
      );
    }
  }
);

// Slice
const fakeCardReportingSlice = createSlice({
  name: 'fakeCardReporting',
  initialState,
  reducers: {
    // 清除錯誤
    clearError: state => {
      state.error = null;
    },

    // 設置當前舉報
    setCurrentReport: (state, action: PayloadAction<FakeCardReport | null>) => {
      state.currentReport = action.payload;
      state.selectedReportId = action.payload?.id || null;
    },

    // 設置選中的舉報ID
    setSelectedReportId: (state, action: PayloadAction<string | null>) => {
      state.selectedReportId = action.payload;
    },

    // 設置選中的警告ID
    setSelectedWarningId: (state, action: PayloadAction<string | null>) => {
      state.selectedWarningId = action.payload;
    },

    // 設置選中的黑名單條目ID
    setSelectedBlacklistEntryId: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.selectedBlacklistEntryId = action.payload;
    },

    // 設置搜索過濾器
    setReportFilters: (state, action: PayloadAction<FakeCardFilters>) => {
      state.reportFilters = action.payload;
    },

    // 清除搜索結果
    clearSearchResults: state => {
      state.reportSearchResult = null;
    },

    // 顯示/隱藏模態框
    setShowCreateReportModal: (state, action: PayloadAction<boolean>) => {
      state.showCreateReportModal = action.payload;
    },

    setShowCreateWarningModal: (state, action: PayloadAction<boolean>) => {
      state.showCreateWarningModal = action.payload;
    },

    setShowCreateBlacklistModal: (state, action: PayloadAction<boolean>) => {
      state.showCreateBlacklistModal = action.payload;
    },

    setShowStatsModal: (state, action: PayloadAction<boolean>) => {
      state.showStatsModal = action.payload;
    },

    // 重置狀態
    resetState: () => initialState,

    // 更新舉報狀態（本地更新）
    updateReportStatus: (
      state,
      action: PayloadAction<{ reportId: string; status: FakeCardReportStatus }>
    ) => {
      const report = state.reports.find(r => r.id === action.payload.reportId);
      if (report) {
        report.status = action.payload.status;
        report.updatedAt = new Date();
      }

      if (state.currentReport?.id === action.payload.reportId) {
        state.currentReport.status = action.payload.status;
        state.currentReport.updatedAt = new Date();
      }
    },

    // 添加新舉報到列表
    addReportToList: (state, action: PayloadAction<FakeCardReport>) => {
      state.reports.unshift(action.payload);
    },

    // 更新列表中的舉報
    updateReportInList: (state, action: PayloadAction<FakeCardReport>) => {
      const index = state.reports.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },

    // 從列表中移除舉報
    removeReportFromList: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(r => r.id !== action.payload);
    },
  },
  extraReducers: builder => {
    builder
      // 創建舉報
      .addCase(createReport.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.unshift(action.payload);
        state.currentReport = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(createReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 獲取舉報
      .addCase(getReport.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReport.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReport = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(getReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 更新舉報
      .addCase(updateReport.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reports.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload;
        }
        state.lastUpdated = new Date();
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 搜索舉報
      .addCase(searchReports.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reportSearchResult = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(searchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 解決舉報
      .addCase(resolveReport.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveReport.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.reports.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reports[index] = action.payload;
        }
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload;
        }
        state.lastUpdated = new Date();
      })
      .addCase(resolveReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 創建警告
      .addCase(createWarning.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWarning.fulfilled, (state, action) => {
        state.loading = false;
        state.warnings.push(action.payload);
        state.lastUpdated = new Date();
      })
      .addCase(createWarning.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 獲取用戶警告
      .addCase(getUserWarnings.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserWarnings.fulfilled, (state, action) => {
        state.loading = false;
        state.userWarnings = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(getUserWarnings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 確認警告
      .addCase(acknowledgeWarning.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acknowledgeWarning.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.warnings.findIndex(w => w.id === action.payload.id);
        if (index !== -1) {
          state.warnings[index] = action.payload;
        }
        const userIndex = state.userWarnings.findIndex(
          w => w.id === action.payload.id
        );
        if (userIndex !== -1) {
          state.userWarnings[userIndex] = action.payload;
        }
        state.lastUpdated = new Date();
      })
      .addCase(acknowledgeWarning.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 創建黑名單條目
      .addCase(createBlacklistEntry.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlacklistEntry.fulfilled, (state, action) => {
        state.loading = false;
        state.blacklistEntries.push(action.payload);
        state.lastUpdated = new Date();
      })
      .addCase(createBlacklistEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 獲取黑名單條目
      .addCase(getBlacklistEntries.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBlacklistEntries.fulfilled, (state, action) => {
        state.loading = false;
        state.blacklistEntries = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(getBlacklistEntries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 檢查黑名單
      .addCase(checkBlacklist.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkBlacklist.fulfilled, (state, action) => {
        state.loading = false;
        state.blacklistCheckResult = action.payload.isBlacklisted;
        state.lastUpdated = new Date();
      })
      .addCase(checkBlacklist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 上訴黑名單條目
      .addCase(appealBlacklistEntry.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(appealBlacklistEntry.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.blacklistEntries.findIndex(
          e => e.id === action.payload.id
        );
        if (index !== -1) {
          state.blacklistEntries[index] = action.payload;
        }
        state.lastUpdated = new Date();
      })
      .addCase(appealBlacklistEntry.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 獲取統計數據
      .addCase(getStats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(getStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 驗證證據
      .addCase(verifyEvidence.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEvidence.fulfilled, (state, action) => {
        state.loading = false;
        // 更新當前舉報中的證據
        if (state.currentReport) {
          const evidenceIndex = state.currentReport.evidence.findIndex(
            e => e.id === action.payload.id
          );
          if (evidenceIndex !== -1) {
            state.currentReport.evidence[evidenceIndex] = action.payload;
          }
        }
        state.lastUpdated = new Date();
      })
      .addCase(verifyEvidence.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 獲取用戶舉報歷史
      .addCase(getUserReportHistory.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserReportHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.reportSearchResult = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(getUserReportHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // 批量處理舉報
      .addCase(bulkProcessReports.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bulkProcessReports.fulfilled, (state, action) => {
        state.loading = false;
        // 更新處理後的舉報
        action.payload.forEach(updatedReport => {
          const index = state.reports.findIndex(r => r.id === updatedReport.id);
          if (index !== -1) {
            state.reports[index] = updatedReport;
          }
        });
        state.lastUpdated = new Date();
      })
      .addCase(bulkProcessReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentReport,
  setSelectedReportId,
  setSelectedWarningId,
  setSelectedBlacklistEntryId,
  setReportFilters,
  clearSearchResults,
  setShowCreateReportModal,
  setShowCreateWarningModal,
  setShowCreateBlacklistModal,
  setShowStatsModal,
  resetState,
  updateReportStatus,
  addReportToList,
  updateReportInList,
  removeReportFromList,
} = fakeCardReportingSlice.actions;

export default fakeCardReportingSlice.reducer;
