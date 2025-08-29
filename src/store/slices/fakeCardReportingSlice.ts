import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { FakeCardReportingService } from '../../features/counterfeit/services/reportingService';
import type {
  BlacklistEntry,
  BlacklistType,
  CommunityWarning,
  EvidenceItem,
  ReportQueryParams,
  ReportRecord,
  ReportSeverity,
  ReportStats,
  ReportStatus,
  ReportType,
  Warning,
  WarningType,
} from '../../features/counterfeit/types/reporting';

// 初始狀態
interface FakeCardReportingState {
  // 服務狀態
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // 舉報數據
  reports: ReportRecord[];
  currentReport: ReportRecord | null;
  reportStats: ReportStats | null;

  // 警告數據
  warnings: Warning[];
  userWarnings: Warning[];

  // 黑名單數據
  blacklist: BlacklistEntry[];
  isUserBlacklisted: boolean;

  // 社區警告
  communityWarnings: CommunityWarning[];

  // 查詢參數
  queryParams: ReportQueryParams;

  // 分頁信息
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const initialState: FakeCardReportingState = {
  isInitialized: false,
  isLoading: false,
  error: null,
  reports: [],
  currentReport: null,
  reportStats: null,
  warnings: [],
  userWarnings: [],
  blacklist: [],
  isUserBlacklisted: false,
  communityWarnings: [],
  queryParams: {
    limit: 20,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
  },
};

// 異步 Action Creators

/**
 * 初始化假卡回報服務
 */
export const _initializeReportingService = createAsyncThunk(
  'fakeCardReporting/initialize',
  async (config?: unknown) => {
    const _service = FakeCardReportingService.getInstance();
    await service.initialize(config);
    return true;
  }
);

/**
 * 創建假卡舉報
 */
export const _createReport = createAsyncThunk(
  'fakeCardReporting/createReport',
  async (reportData: {
    reporterId: string;
    reportedUserId?: string;
    cardId?: string;
    reportType: ReportType;
    severity: ReportSeverity;
    title: string;
    description: string;
    evidence: EvidenceItem[];
    isAnonymous: boolean;
    contactInfo?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  }) => {
    const _service = FakeCardReportingService.getInstance();
    const _result = await service.createReport(reportData);

    if (!result.success) {
      throw new Error(result.error || '創建舉報失敗');
    }

    // 如果成功，獲取完整的舉報記錄
    if (result.reportId) {
      const _report = await service.getReport(result.reportId);
      return report;
    }

    throw new Error('創建舉報成功但無法獲取記錄');
  }
);

/**
 * 獲取舉報記錄
 */
export const _getReport = createAsyncThunk<ReportRecord, string>(
  'fakeCardReporting/getReport',
  async (reportId: string) => {
    const _service = FakeCardReportingService.getInstance();
    const _report = await service.getReport(reportId);
    if (!report) {
      throw new Error('舉報記錄不存在');
    }
    return report;
  }
);

/**
 * 更新舉報狀態
 */
export const _updateReportStatus = createAsyncThunk(
  'fakeCardReporting/updateReportStatus',
  async (params: {
    reportId: string;
    status: ReportStatus;
    userId: string;
    notes?: string;
    actionTaken?: string;
  }) => {
    const _service = FakeCardReportingService.getInstance();
    const _result = await service.updateReportStatus(
      params.reportId,
      params.status,
      params.userId,
      params.notes,
      params.actionTaken
    );

    if (!result.success) {
      throw new Error(result.error || '更新舉報狀態失敗');
    }

    // 如果成功，獲取更新後的舉報記錄
    const _report = await service.getReport(params.reportId);
    if (!report) {
      throw new Error('無法獲取更新後的舉報記錄');
    }
    return report;
  }
);

/**
 * 創建警告
 */
export const _createWarning = createAsyncThunk(
  'fakeCardReporting/createWarning',
  async (warningData: {
    type: WarningType;
    targetId: string;
    targetType: 'USER' | 'SELLER' | 'BUYER' | 'CARD' | 'LISTING';
    title: string;
    message: string;
    severity: ReportSeverity;
    isActive: boolean;
    expiresAt?: Date;
    createdBy: string;
  }) => {
    const _service = FakeCardReportingService.getInstance();
    const _result = await service.createWarning(warningData);

    if (!result.success) {
      throw new Error(result.error || '創建警告失敗');
    }

    // 如果成功，創建一個警告對象返回
    if (result.warningId) {
      const warning: Warning = {
        id: result.warningId,
        type: warningData.type,
        targetId: warningData.targetId,
        targetType: warningData.targetType,
        title: warningData.title,
        message: warningData.message,
        severity: warningData.severity,
        isActive: warningData.isActive,
        expiresAt: warningData.expiresAt,
        createdAt: new Date(),
        createdBy: warningData.createdBy,
      };
      return warning;
    }

    throw new Error('創建警告成功但無法獲取警告ID');
  }
);

/**
 * 添加到黑名單
 */
export const _addToBlacklist = createAsyncThunk(
  'fakeCardReporting/addToBlacklist',
  async (blacklistData: {
    type: BlacklistType;
    targetId: string;
    targetValue: string;
    reason: string;
    severity: ReportSeverity;
    isActive: boolean;
    expiresAt?: Date;
    createdBy: string;
  }) => {
    const _service = FakeCardReportingService.getInstance();
    const _result = await service.addToBlacklist(blacklistData);

    if (!result.success) {
      throw new Error(result.error || '添加到黑名單失敗');
    }

    // 如果成功，創建一個黑名單條目對象返回
    if (result.blacklistId) {
      const blacklistEntry: BlacklistEntry = {
        id: result.blacklistId,
        type: blacklistData.type,
        targetId: blacklistData.targetId,
        targetValue: blacklistData.targetValue,
        reason: blacklistData.reason,
        severity: blacklistData.severity,
        isActive: blacklistData.isActive,
        expiresAt: blacklistData.expiresAt,
        createdAt: new Date(),
        createdBy: blacklistData.createdBy,
      };
      return blacklistEntry;
    }

    throw new Error('添加到黑名單成功但無法獲取黑名單ID');
  }
);

/**
 * 創建社區警告
 */
export const _createCommunityWarning = createAsyncThunk(
  'fakeCardReporting/createCommunityWarning',
  async (warningData: {
    title: string;
    message: string;
    severity: ReportSeverity;
    targetAudience: 'ALL' | 'SELLERS' | 'BUYERS' | 'SPECIFIC_GROUP';
    targetGroupIds?: string[];
    isActive: boolean;
    displayFrom: Date;
    displayUntil?: Date;
    createdBy: string;
  }) => {
    const _service = FakeCardReportingService.getInstance();
    const _result = await service.createCommunityWarning(warningData);

    if (!result.success) {
      throw new Error(result.error || '創建社區警告失敗');
    }

    // 如果成功，創建一個社區警告對象返回
    if (result.warningId) {
      const communityWarning: CommunityWarning = {
        id: result.warningId,
        title: warningData.title,
        message: warningData.message,
        severity: warningData.severity,
        targetAudience: warningData.targetAudience,
        targetGroupIds: warningData.targetGroupIds,
        isActive: warningData.isActive,
        displayFrom: warningData.displayFrom,
        displayUntil: warningData.displayUntil,
        createdAt: new Date(),
        createdBy: warningData.createdBy,
        acknowledgedCount: 0,
        dismissedCount: 0,
      };
      return communityWarning;
    }

    throw new Error('創建社區警告成功但無法獲取警告ID');
  }
);

/**
 * 獲取舉報統計
 */
export const _getReportStats = createAsyncThunk(
  'fakeCardReporting/getReportStats',
  async () => {
    const _service = FakeCardReportingService.getInstance();
    const _stats = await service.getReportStats();
    return stats;
  }
);

/**
 * 查詢舉報記錄
 */
export const _queryReports = createAsyncThunk(
  'fakeCardReporting/queryReports',
  async (params: ReportQueryParams) => {
    const _service = FakeCardReportingService.getInstance();
    const _result = await service.queryReports(params);

    if (!result.success) {
      throw new Error(result.error || '查詢舉報失敗');
    }

    return result.reports || [];
  }
);

/**
 * 獲取用戶警告
 */
export const _getUserWarnings = createAsyncThunk(
  'fakeCardReporting/getUserWarnings',
  async (userId: string) => {
    const _service = FakeCardReportingService.getInstance();
    const _warnings = await service.getUserWarnings(userId);
    return warnings;
  }
);

/**
 * 檢查用戶黑名單狀態
 */
export const _checkUserBlacklistStatus = createAsyncThunk(
  'fakeCardReporting/checkUserBlacklistStatus',
  async (userId: string) => {
    const _service = FakeCardReportingService.getInstance();
    const _isBlacklisted = await service.isUserBlacklisted(userId);
    return isBlacklisted;
  }
);

/**
 * 獲取活躍社區警告
 */
export const _getActiveCommunityWarnings = createAsyncThunk(
  'fakeCardReporting/getActiveCommunityWarnings',
  async () => {
    const _service = FakeCardReportingService.getInstance();
    const _warnings = await service.getActiveCommunityWarnings();
    return warnings;
  }
);

/**
 * 銷毀服務
 */
export const _destroyReportingService = createAsyncThunk(
  'fakeCardReporting/destroy',
  async () => {
    const _service = FakeCardReportingService.getInstance();
    await service.destroy();
    return true;
  }
);

// Slice
const _fakeCardReportingSlice = createSlice({
  name: 'fakeCardReporting',
  initialState,
  reducers: {
    // 重置狀態
    resetState: state => {
      state.isInitialized = false;
      state.isLoading = false;
      state.error = null;
      state.reports = [];
      state.currentReport = null;
      state.reportStats = null;
      state.warnings = [];
      state.userWarnings = [];
      state.blacklist = [];
      state.isUserBlacklisted = false;
      state.communityWarnings = [];
    },

    // 設置當前舉報
    setCurrentReport: (state, action: PayloadAction<ReportRecord | null>) => {
      state.currentReport = action.payload;
    },

    // 更新查詢參數
    updateQueryParams: (
      state,
      action: PayloadAction<Partial<ReportQueryParams>>
    ) => {
      state.queryParams = { ...state.queryParams, ...action.payload };
    },

    // 設置分頁信息
    setPagination: (
      state,
      action: PayloadAction<{
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
      }>
    ) => {
      state.pagination = action.payload;
    },

    // 清除錯誤
    clearError: state => {
      state.error = null;
    },

    // 添加舉報到列表
    addReportToList: (state, action: PayloadAction<ReportRecord>) => {
      state.reports.unshift(action.payload);
    },

    // 更新列表中的舉報
    updateReportInList: (state, action: PayloadAction<ReportRecord>) => {
      const _index = state.reports.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },

    // 從列表中移除舉報
    removeReportFromList: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(r => r.id !== action.payload);
    },

    // 添加警告到列表
    addWarningToList: (state, action: PayloadAction<Warning>) => {
      state.warnings.unshift(action.payload);
    },

    // 更新列表中的警告
    updateWarningInList: (state, action: PayloadAction<Warning>) => {
      const _index = state.warnings.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.warnings[index] = action.payload;
      }
    },

    // 添加黑名單條目到列表
    addBlacklistEntryToList: (state, action: PayloadAction<BlacklistEntry>) => {
      state.blacklist.unshift(action.payload);
    },

    // 更新列表中的黑名單條目
    updateBlacklistEntryInList: (
      state,
      action: PayloadAction<BlacklistEntry>
    ) => {
      const _index = state.blacklist.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.blacklist[index] = action.payload;
      }
    },

    // 添加社區警告到列表
    addCommunityWarningToList: (
      state,
      action: PayloadAction<CommunityWarning>
    ) => {
      state.communityWarnings.unshift(action.payload);
    },

    // 更新列表中的社區警告
    updateCommunityWarningInList: (
      state,
      action: PayloadAction<CommunityWarning>
    ) => {
      const _index = state.communityWarnings.findIndex(
        w => w.id === action.payload.id
      );
      if (index !== -1) {
        state.communityWarnings[index] = action.payload;
      }
    },
  },
  extraReducers: builder => {
    builder
      // 初始化服務
      .addCase(initializeReportingService.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeReportingService.fulfilled, state => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(initializeReportingService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '初始化失敗';
      })

      // 創建舉報
      .addCase(createReport.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.reports.unshift(action.payload);
          state.currentReport = action.payload;
        }
      })
      .addCase(createReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '創建舉報失敗';
      })

      // 獲取舉報
      .addCase(getReport.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReport.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.currentReport = action.payload;
        }
      })
      .addCase(getReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '獲取舉報失敗';
      })

      // 更新舉報狀態
      .addCase(updateReportStatus.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.currentReport = action.payload;
          // 更新列表中的舉報
          const _index = state.reports.findIndex(
            r => r.id === action.payload.id
          );
          if (index !== -1) {
            state.reports[index] = action.payload;
          }
        }
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '更新舉報狀態失敗';
      })

      // 創建警告
      .addCase(createWarning.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWarning.fulfilled, (state, action) => {
        state.isLoading = false;
        state.warnings.unshift(action.payload);
      })
      .addCase(createWarning.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '創建警告失敗';
      })

      // 添加到黑名單
      .addCase(addToBlacklist.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToBlacklist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blacklist.unshift(action.payload);
      })
      .addCase(addToBlacklist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '添加到黑名單失敗';
      })

      // 創建社區警告
      .addCase(createCommunityWarning.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCommunityWarning.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communityWarnings.unshift(action.payload);
      })
      .addCase(createCommunityWarning.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '創建社區警告失敗';
      })

      // 獲取舉報統計
      .addCase(getReportStats.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReportStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reportStats = action.payload;
      })
      .addCase(getReportStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '獲取統計失敗';
      })

      // 查詢舉報記錄
      .addCase(queryReports.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(queryReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload;
      })
      .addCase(queryReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '查詢舉報失敗';
      })

      // 獲取用戶警告
      .addCase(getUserWarnings.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserWarnings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userWarnings = action.payload;
      })
      .addCase(getUserWarnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '獲取用戶警告失敗';
      })

      // 檢查用戶黑名單狀態
      .addCase(checkUserBlacklistStatus.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkUserBlacklistStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isUserBlacklisted = action.payload;
      })
      .addCase(checkUserBlacklistStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '檢查黑名單狀態失敗';
      })

      // 獲取活躍社區警告
      .addCase(getActiveCommunityWarnings.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getActiveCommunityWarnings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communityWarnings = action.payload;
      })
      .addCase(getActiveCommunityWarnings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '獲取社區警告失敗';
      })

      // 銷毀服務
      .addCase(destroyReportingService.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(destroyReportingService.fulfilled, state => {
        state.isLoading = false;
        state.isInitialized = false;
        state.reports = [];
        state.currentReport = null;
        state.reportStats = null;
        state.warnings = [];
        state.userWarnings = [];
        state.blacklist = [];
        state.isUserBlacklisted = false;
        state.communityWarnings = [];
      })
      .addCase(destroyReportingService.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '銷毀服務失敗';
      });
  },
});

// 導出 actions
export const {
  resetState,
  setCurrentReport,
  updateQueryParams,
  setPagination,
  clearError,
  addReportToList,
  updateReportInList,
  removeReportFromList,
  addWarningToList,
  updateWarningInList,
  addBlacklistEntryToList,
  updateBlacklistEntryInList,
  addCommunityWarningToList,
  updateCommunityWarningInList,
} = fakeCardReportingSlice.actions;

// 導出 selectors
export const _selectFakeCardReporting = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting;
export const _selectIsInitialized = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.isInitialized;
export const _selectIsLoading = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.isLoading;
export const _selectError = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.error;
export const _selectReports = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.reports;
export const _selectCurrentReport = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.currentReport;
export const _selectReportStats = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.reportStats;
export const _selectWarnings = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.warnings;
export const _selectUserWarnings = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.userWarnings;
export const _selectBlacklist = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.blacklist;
export const _selectIsUserBlacklisted = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.isUserBlacklisted;
export const _selectCommunityWarnings = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.communityWarnings;
export const _selectQueryParams = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.queryParams;
export const _selectPagination = (state: {
  fakeCardReporting: FakeCardReportingState;
}) => state.fakeCardReporting.pagination;

// 導出 reducer
export default fakeCardReportingSlice.reducer;
