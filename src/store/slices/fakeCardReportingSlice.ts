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

// 初始Status
interface FakeCardReportingState {
  // ServiceStatus
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // 舉報Data
  reports: ReportRecord[];
  currentReport: ReportRecord | null;
  reportStats: ReportStats | null;

  // WarningData
  warnings: Warning[];
  userWarnings: Warning[];

  // 黑名單Data
  blacklist: BlacklistEntry[];
  isUserBlacklisted: boolean;

  // 社DistrictWarning
  communityWarnings: CommunityWarning[];

  // QueryParameter
  queryParams: ReportQueryParams;

  // PaginateInformation
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

// Async Action Creators

/**
 * InitializeFalse卡回報Service
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
 * CreateFalse卡舉報
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
      throw new Error(result.error || 'Create舉報Failed');
    }

    // 如果Success，Get完整的舉報Record
    if (result.reportId) {
      const _report = await service.getReport(result.reportId);
      return report;
    }

    throw new Error('Create舉報Success但無法Get記錄');
  }
);

/**
 * Get舉報Record
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
 * Update舉報Status
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
      throw new Error(result.error || 'Update舉報狀態Failed');
    }

    // 如果Success，GetUpdate後的舉報Record
    const _report = await service.getReport(params.reportId);
    if (!report) {
      throw new Error('無法獲取更新後的舉報記錄');
    }
    return report;
  }
);

/**
 * CreateWarning
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
      throw new Error(result.error || 'Create警告Failed');
    }

    // 如果Success，Create一個WarningObjectReturn
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

    throw new Error('Create警告Success但無法Get警告ID');
  }
);

/**
 * Add到黑名單
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
      throw new Error(result.error || '添加到黑名單Failed');
    }

    // 如果Success，Create一個黑名單條目ObjectReturn
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

    throw new Error('添加到黑名單Success但無法Get黑名單ID');
  }
);

/**
 * Create社DistrictWarning
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
      throw new Error(result.error || 'Create社區警告Failed');
    }

    // 如果Success，Create一個社DistrictWarningObjectReturn
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

    throw new Error('Create社區警告Success但無法Get警告ID');
  }
);

/**
 * Get舉報Statistics
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
 * Query舉報Record
 */
export const _queryReports = createAsyncThunk(
  'fakeCardReporting/queryReports',
  async (params: ReportQueryParams) => {
    const _service = FakeCardReportingService.getInstance();
    const _result = await service.queryReports(params);

    if (!result.success) {
      throw new Error(result.error || '查詢舉報Failed');
    }

    return result.reports || [];
  }
);

/**
 * GetUserWarning
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
 * CheckUser黑名單Status
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
 * Get活躍社DistrictWarning
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
 * 銷毀Service
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
    // ResetStatus
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

    // Settings當前舉報
    setCurrentReport: (state, action: PayloadAction<ReportRecord | null>) => {
      state.currentReport = action.payload;
    },

    // UpdateQueryParameter
    updateQueryParams: (
      state,
      action: PayloadAction<Partial<ReportQueryParams>>
    ) => {
      state.queryParams = { ...state.queryParams, ...action.payload };
    },

    // SettingsPaginateInformation
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

    // ClearError
    clearError: state => {
      state.error = null;
    },

    // Add舉報到List
    addReportToList: (state, action: PayloadAction<ReportRecord>) => {
      state.reports.unshift(action.payload);
    },

    // UpdateList中的舉報
    updateReportInList: (state, action: PayloadAction<ReportRecord>) => {
      const _index = state.reports.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },

    // 從List中Remove舉報
    removeReportFromList: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(r => r.id !== action.payload);
    },

    // AddWarning到List
    addWarningToList: (state, action: PayloadAction<Warning>) => {
      state.warnings.unshift(action.payload);
    },

    // UpdateList中的Warning
    updateWarningInList: (state, action: PayloadAction<Warning>) => {
      const _index = state.warnings.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.warnings[index] = action.payload;
      }
    },

    // Add黑名單條目到List
    addBlacklistEntryToList: (state, action: PayloadAction<BlacklistEntry>) => {
      state.blacklist.unshift(action.payload);
    },

    // UpdateList中的黑名單條目
    updateBlacklistEntryInList: (
      state,
      action: PayloadAction<BlacklistEntry>
    ) => {
      const _index = state.blacklist.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.blacklist[index] = action.payload;
      }
    },

    // Add社DistrictWarning到List
    addCommunityWarningToList: (
      state,
      action: PayloadAction<CommunityWarning>
    ) => {
      state.communityWarnings.unshift(action.payload);
    },

    // UpdateList中的社DistrictWarning
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
      // InitializeService
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
        state.error = action.error.message || 'InitializeFailed';
      })

      // Create舉報
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
        state.error = action.error.message || 'Create舉報Failed';
      })

      // Get舉報
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
        state.error = action.error.message || 'Get舉報Failed';
      })

      // Update舉報Status
      .addCase(updateReportStatus.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.currentReport = action.payload;
          // UpdateList中的舉報
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
        state.error = action.error.message || 'Update舉報狀態Failed';
      })

      // CreateWarning
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
        state.error = action.error.message || 'Create警告Failed';
      })

      // Add到黑名單
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
        state.error = action.error.message || '添加到黑名單Failed';
      })

      // Create社DistrictWarning
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
        state.error = action.error.message || 'Create社區警告Failed';
      })

      // Get舉報Statistics
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
        state.error = action.error.message || 'Get統計Failed';
      })

      // Query舉報Record
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
        state.error = action.error.message || '查詢舉報Failed';
      })

      // GetUserWarning
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
        state.error = action.error.message || 'Get用戶警告Failed';
      })

      // CheckUser黑名單Status
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
        state.error = action.error.message || 'Check黑名單狀態Failed';
      })

      // Get活躍社DistrictWarning
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
        state.error = action.error.message || 'Get社區警告Failed';
      })

      // 銷毀Service
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
        state.error = action.error.message || '銷毀ServiceFailed';
      });
  },
});

// Export actions
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

// Export selectors
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

// Export reducer
export default fakeCardReportingSlice.reducer;
