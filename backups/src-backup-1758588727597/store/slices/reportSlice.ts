import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { ReportService } from '../../features/analytics/services/reportService';
import type {
  CreateReportRequest,
  CreateTemplateRequest,
  ExportReportRequest,
  ReportAnalytics,
  ReportExport,
  ReportInstance,
  ReportTemplate,
} from '../../features/analytics/types/report';
import {
  ExportStatus,
  ReportStatus,
} from '../../features/analytics/types/report';

// 狀態接口
export interface ReportState {
  // 模板相關
  templates: ReportTemplate[];
  currentTemplate: ReportTemplate | null;
  selectedTemplateId: string | null;

  // 報告相關
  reports: ReportInstance[];
  currentReport: ReportInstance | null;
  selectedReportId: string | null;

  // 導出相關
  exports: ReportExport[];
  currentExport: ReportExport | null;

  // 分析相關
  analytics: ReportAnalytics | null;

  // 過濾和分頁
  filterOptions: {
    category?: string;
    type?: string;
    status?: ReportStatus;
    dateRange?: { start: Date; end: Date };
  };
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };

  // 狀態管理
  isLoading: boolean;
  error: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

// 初始狀態
const initialState: ReportState = {
  templates: [],
  currentTemplate: null,
  selectedTemplateId: null,
  reports: [],
  currentReport: null,
  selectedReportId: null,
  exports: [],
  currentExport: null,
  analytics: null,
  filterOptions: {},
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,
  error: null,
  status: 'idle',
};

// 異步 Thunks
export const initializeReportService = createAsyncThunk(
  'report/initializeService',
  async (config?: unknown) => {
    const service = ReportService.getInstance();
    await service.initialize(config);
    return { success: true };
  }
);

export const createTemplate = createAsyncThunk(
  'report/createTemplate',
  async (request: CreateTemplateRequest) => {
    const service = ReportService.getInstance();
    const response = await service.createTemplate(request);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  }
);

export const getTemplate = createAsyncThunk(
  'report/getTemplate',
  async (templateId: string) => {
    const service = ReportService.getInstance();
    const response = await service.getTemplate(templateId);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  }
);

export const createReport = createAsyncThunk(
  'report/createReport',
  async (request: CreateReportRequest) => {
    const service = ReportService.getInstance();
    const response = await service.createReport(request);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  }
);

export const getReport = createAsyncThunk(
  'report/getReport',
  async (reportId: string) => {
    const service = ReportService.getInstance();
    const response = await service.getReport(reportId);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  }
);

export const exportReport = createAsyncThunk(
  'report/exportReport',
  async ({
    reportId,
    request,
  }: {
    reportId: string;
    request: ExportReportRequest;
  }) => {
    const service = ReportService.getInstance();
    const response = await service.exportReport(reportId, request);
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  }
);

export const getAnalytics = createAsyncThunk(
  'report/getAnalytics',
  async () => {
    const service = ReportService.getInstance();
    const response = await service.getAnalytics();
    if (!response.success) {
      throw new Error(response.message);
    }
    return response.data;
  }
);

// Slice
const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    // 模板相關
    setCurrentTemplate: (
      state,
      action: PayloadAction<ReportTemplate | null>
    ) => {
      state.currentTemplate = action.payload;
      state.selectedTemplateId = action.payload?.id || null;
    },
    setSelectedTemplateId: (state, action: PayloadAction<string | null>) => {
      state.selectedTemplateId = action.payload;
      state.currentTemplate =
        state.templates.find(t => t.id === action.payload) || null;
    },
    addTemplate: (state, action: PayloadAction<ReportTemplate>) => {
      state.templates.push(action.payload);
    },
    updateTemplate: (state, action: PayloadAction<ReportTemplate>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
      if (state.currentTemplate?.id === action.payload.id) {
        state.currentTemplate = action.payload;
      }
    },
    removeTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload);
      if (state.selectedTemplateId === action.payload) {
        state.selectedTemplateId = null;
        state.currentTemplate = null;
      }
    },

    // 報告相關
    setCurrentReport: (state, action: PayloadAction<ReportInstance | null>) => {
      state.currentReport = action.payload;
      state.selectedReportId = action.payload?.id || null;
    },
    setSelectedReportId: (state, action: PayloadAction<string | null>) => {
      state.selectedReportId = action.payload;
      state.currentReport =
        state.reports.find(r => r.id === action.payload) || null;
    },
    addReport: (state, action: PayloadAction<ReportInstance>) => {
      state.reports.push(action.payload);
    },
    updateReport: (state, action: PayloadAction<ReportInstance>) => {
      const index = state.reports.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
      if (state.currentReport?.id === action.payload.id) {
        state.currentReport = action.payload;
      }
    },
    removeReport: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(r => r.id !== action.payload);
      if (state.selectedReportId === action.payload) {
        state.selectedReportId = null;
        state.currentReport = null;
      }
    },

    // 導出相關
    setCurrentExport: (state, action: PayloadAction<ReportExport | null>) => {
      state.currentExport = action.payload;
    },
    addExport: (state, action: PayloadAction<ReportExport>) => {
      state.exports.push(action.payload);
    },
    updateExport: (state, action: PayloadAction<ReportExport>) => {
      const index = state.exports.findIndex(e => e.id === action.payload.id);
      if (index !== -1) {
        state.exports[index] = action.payload;
      }
      if (state.currentExport?.id === action.payload.id) {
        state.currentExport = action.payload;
      }
    },

    // 分析相關
    setAnalytics: (state, action: PayloadAction<ReportAnalytics>) => {
      state.analytics = action.payload;
    },

    // 過濾和分頁
    setFilterOptions: (state, action: PayloadAction<any>) => {
      state.filterOptions = { ...state.filterOptions, ...action.payload };
      state.pagination.page = 1; // 重置到第一頁
    },
    setPagination: (state, action: PayloadAction<any>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },

    // 狀態管理
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    resetState: state => {
      return { ...initialState };
    },
  },
  extraReducers: builder => {
    builder
      // 初始化服務
      .addCase(initializeReportService.pending, state => {
        state.status = 'loading';
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeReportService.fulfilled, state => {
        state.status = 'succeeded';
        state.isLoading = false;
      })
      .addCase(initializeReportService.rejected, (state, action) => {
        state.status = 'failed';
        state.isLoading = false;
        state.error = action.error.message || '初始化失敗';
      })

      // 創建模板
      .addCase(createTemplate.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates.push(action.payload);
        state.currentTemplate = action.payload;
        state.selectedTemplateId = action.payload.id;
      })
      .addCase(createTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '創建模板失敗';
      })

      // 獲取模板
      .addCase(getTemplate.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTemplate = action.payload;
        state.selectedTemplateId = action.payload.id;
      })
      .addCase(getTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '獲取模板失敗';
      })

      // 創建報告
      .addCase(createReport.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports.push(action.payload);
        state.currentReport = action.payload;
        state.selectedReportId = action.payload.id;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '創建報告失敗';
      })

      // 獲取報告
      .addCase(getReport.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentReport = action.payload;
        state.selectedReportId = action.payload.id;
      })
      .addCase(getReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '獲取報告失敗';
      })

      // 導出報告
      .addCase(exportReport.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exportReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.exports.push(action.payload);
        state.currentExport = action.payload;
      })
      .addCase(exportReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '導出報告失敗';
      })

      // 獲取分析
      .addCase(getAnalytics.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || '獲取分析失敗';
      });
  },
});

// 導出 actions
export const {
  setCurrentTemplate,
  setSelectedTemplateId,
  addTemplate,
  updateTemplate,
  removeTemplate,
  setCurrentReport,
  setSelectedReportId,
  addReport,
  updateReport,
  removeReport,
  setCurrentExport,
  addExport,
  updateExport,
  setAnalytics,
  setFilterOptions,
  setPagination,
  setLoading,
  setError,
  clearError,
  resetState,
} = reportSlice.actions;

// 選擇器
export const selectTemplates = (state: { report: ReportState }) =>
  state.report.templates;
export const selectCurrentTemplate = (state: { report: ReportState }) =>
  state.report.currentTemplate;
export const selectSelectedTemplateId = (state: { report: ReportState }) =>
  state.report.selectedTemplateId;
export const selectReports = (state: { report: ReportState }) =>
  state.report.reports;
export const selectCurrentReport = (state: { report: ReportState }) =>
  state.report.currentReport;
export const selectSelectedReportId = (state: { report: ReportState }) =>
  state.report.selectedReportId;
export const selectExports = (state: { report: ReportState }) =>
  state.report.exports;
export const selectCurrentExport = (state: { report: ReportState }) =>
  state.report.currentExport;
export const selectAnalytics = (state: { report: ReportState }) =>
  state.report.analytics;
export const selectFilterOptions = (state: { report: ReportState }) =>
  state.report.filterOptions;
export const selectPagination = (state: { report: ReportState }) =>
  state.report.pagination;
export const selectIsLoading = (state: { report: ReportState }) =>
  state.report.isLoading;
export const selectError = (state: { report: ReportState }) =>
  state.report.error;
export const selectStatus = (state: { report: ReportState }) =>
  state.report.status;

// 計算選擇器
export const selectActiveTemplates = (state: { report: ReportState }) =>
  state.report.templates.filter(t => t.isActive);

export const selectCompletedReports = (state: { report: ReportState }) =>
  state.report.reports.filter(r => r.status === ReportStatus.COMPLETED);

export const selectCompletedExports = (state: { report: ReportState }) =>
  state.report.exports.filter(e => e.status === ExportStatus.COMPLETED);

export const selectTemplateCount = (state: { report: ReportState }) =>
  state.report.templates.length;

export const selectReportCount = (state: { report: ReportState }) =>
  state.report.reports.length;

export const selectExportCount = (state: { report: ReportState }) =>
  state.report.exports.length;

export default reportSlice.reducer;
