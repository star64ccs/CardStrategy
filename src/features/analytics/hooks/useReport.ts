import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  clearError,
  createReport,
  createTemplate,
  exportReport,
  getAnalytics,
  getReport,
  getTemplate,
  initializeReportService,
  resetState,
  selectActiveTemplates,
  selectAnalytics,
  selectCompletedExports,
  selectCompletedReports,
  selectCurrentExport,
  selectCurrentReport,
  selectCurrentTemplate,
  selectError,
  selectExportCount,
  selectExports,
  selectFilterOptions,
  selectIsLoading,
  selectPagination,
  selectReportCount,
  selectReports,
  selectSelectedReportId,
  selectSelectedTemplateId,
  selectStatus,
  selectTemplateCount,
  selectTemplates,
  setCurrentExport,
  setCurrentReport,
  setCurrentTemplate,
  setError,
  setFilterOptions,
  setLoading,
  setPagination,
  setSelectedReportId,
  setSelectedTemplateId,
} from '../../../store/slices/reportSlice';
import type {
  CreateReportRequest,
  CreateTemplateRequest,
  ExportReportRequest,
  ReportExport,
  ReportInstance,
  ReportTemplate,
  ReportType,
} from '../types/report';
import { ExportFormat, ReportCategory, ReportStatus } from '../types/report';

export const _useReport = () => {
  const _dispatch = useAppDispatch();

  // 選擇器
  const _templates = useSelector(selectTemplates);
  const _currentTemplate = useSelector(selectCurrentTemplate);
  const _selectedTemplateId = useSelector(selectSelectedTemplateId);
  const _reports = useSelector(selectReports);
  const _currentReport = useSelector(selectCurrentReport);
  const _selectedReportId = useSelector(selectSelectedReportId);
  const _exports = useSelector(selectExports);
  const _currentExport = useSelector(selectCurrentExport);
  const _analytics = useSelector(selectAnalytics);
  const _filterOptions = useSelector(selectFilterOptions);
  const _pagination = useSelector(selectPagination);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);
  const _status = useSelector(selectStatus);

  // 計算選擇器
  const _activeTemplates = useSelector(selectActiveTemplates);
  const _completedReports = useSelector(selectCompletedReports);
  const _completedExports = useSelector(selectCompletedExports);
  const _templateCount = useSelector(selectTemplateCount);
  const _reportCount = useSelector(selectReportCount);
  const _exportCount = useSelector(selectExportCount);

  // 初始化服務
  const _initialize = useCallback(
    async (config?: unknown) => {
      try {
        await dispatch(initializeReportService(config)).unwrap();
      } catch (error) {
        console.error('初始化報告服務失敗:', error);
      }
    },
    [dispatch]
  );

  // 模板管理
  const _createNewTemplate = useCallback(
    async (request: CreateTemplateRequest) => {
      try {
        const _template = await dispatch(createTemplate(request)).unwrap();
        return template;
      } catch (error) {
        console.error('創建模板失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _getTemplateById = useCallback(
    async (templateId: string) => {
      try {
        const _template = await dispatch(getTemplate(templateId)).unwrap();
        return template;
      } catch (error) {
        console.error('獲取模板失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _selectTemplate = useCallback(
    (template: ReportTemplate | null) => {
      dispatch(setCurrentTemplate(template));
    },
    [dispatch]
  );

  const _selectTemplateById = useCallback(
    (templateId: string | null) => {
      dispatch(setSelectedTemplateId(templateId));
    },
    [dispatch]
  );

  // 報告管理
  const _createNewReport = useCallback(
    async (request: CreateReportRequest) => {
      try {
        const _report = await dispatch(createReport(request)).unwrap();
        return report;
      } catch (error) {
        console.error('創建報告失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _getReportById = useCallback(
    async (reportId: string) => {
      try {
        const _report = await dispatch(getReport(reportId)).unwrap();
        return report;
      } catch (error) {
        console.error('獲取報告失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _selectReport = useCallback(
    (report: ReportInstance | null) => {
      dispatch(setCurrentReport(report));
    },
    [dispatch]
  );

  const _selectReportById = useCallback(
    (reportId: string | null) => {
      dispatch(setSelectedReportId(reportId));
    },
    [dispatch]
  );

  // 導出管理
  const _exportReportById = useCallback(
    async (reportId: string, request: ExportReportRequest) => {
      try {
        const _exportInstance = await dispatch(
          exportReport({ reportId, request })
        ).unwrap();
        return exportInstance;
      } catch (error) {
        console.error('導出報告失敗:', error);
        throw error;
      }
    },
    [dispatch]
  );

  const _selectExport = useCallback(
    (exportInstance: ReportExport | null) => {
      dispatch(setCurrentExport(exportInstance));
    },
    [dispatch]
  );

  // 分析管理
  const _fetchAnalytics = useCallback(async () => {
    try {
      const _analyticsData = await dispatch(getAnalytics()).unwrap();
      return analyticsData;
    } catch (error) {
      console.error('獲取分析數據失敗:', error);
      throw error;
    }
  }, [dispatch]);

  // 過濾和分頁
  const _updateFilterOptions = useCallback(
    (options: unknown) => {
      dispatch(setFilterOptions(options));
    },
    [dispatch]
  );

  const _updatePagination = useCallback(
    (paginationData: unknown) => {
      dispatch(setPagination(paginationData));
    },
    [dispatch]
  );

  // 狀態管理
  const _setLoadingState = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch]
  );

  const _setErrorMessage = useCallback(
    (message: string | null) => {
      dispatch(setError(message));
    },
    [dispatch]
  );

  const _clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const _resetReportState = useCallback(() => {
    dispatch(resetState());
  }, [dispatch]);

  // 計算屬性
  const _computedValues = useMemo(
    () => ({
      // 模板相關
      hasTemplates: templates.length > 0,
      activeTemplateCount: activeTemplates.length,
      templateCategories: [...new Set(templates.map(t => t.category))],
      templateTypes: [...new Set(templates.map(t => t.type))],

      // 報告相關
      hasReports: reports.length > 0,
      completedReportCount: completedReports.length,
      pendingReportCount: reports.filter(r => r.status === ReportStatus.PENDING)
        .length,
      generatingReportCount: reports.filter(
        r => r.status === ReportStatus.GENERATING
      ).length,
      failedReportCount: reports.filter(r => r.status === ReportStatus.FAILED)
        .length,

      // 導出相關
      hasExports: exports.length > 0,
      completedExportCount: completedExports.length,
      pendingExportCount: exports.filter(e => e.status === 'pending').length,
      processingExportCount: exports.filter(e => e.status === 'processing')
        .length,
      failedExportCount: exports.filter(e => e.status === 'failed').length,

      // 分析相關
      hasAnalytics: analytics !== null,
      analyticsSummary: analytics
        ? {
            totalReports: analytics.totalReports,
            activeTemplates: analytics.activeTemplates,
            deliverySuccess: analytics.deliverySuccess,
            deliveryFailure: analytics.deliveryFailure,
            averageGenerationTime: analytics.averageGenerationTime,
          }
        : null,

      // 狀態相關
      isInitialized: status === 'succeeded',
      isInitializing: status === 'loading',
      hasError: error !== null,
      canCreateTemplate: status === 'succeeded',
      canCreateReport: status === 'succeeded' && templates.length > 0,
      canExportReport: status === 'succeeded' && reports.length > 0,
    }),
    [
      templates,
      activeTemplates,
      reports,
      completedReports,
      exports,
      completedExports,
      analytics,
      status,
      error,
    ]
  );

  // 實用方法
  const _getTemplatesByCategory = useCallback(
    (category: ReportCategory) => {
      return templates.filter(t => t.category === category);
    },
    [templates]
  );

  const _getTemplatesByType = useCallback(
    (type: ReportType) => {
      return templates.filter(t => t.type === type);
    },
    [templates]
  );

  const _getReportsByStatus = useCallback(
    (status: ReportStatus) => {
      return reports.filter(r => r.status === status);
    },
    [reports]
  );

  const _getReportsByTemplate = useCallback(
    (templateId: string) => {
      return reports.filter(r => r.templateId === templateId);
    },
    [reports]
  );

  const _getExportsByFormat = useCallback(
    (format: ExportFormat) => {
      return exports.filter(e => e.format === format);
    },
    [exports]
  );

  const _getExportsByStatus = useCallback(
    (status: string) => {
      return exports.filter(e => e.status === status);
    },
    [exports]
  );

  // 快速創建方法
  const _quickCreateBusinessReport = useCallback(
    async (name: string) => {
      const _businessTemplates = getTemplatesByCategory(ReportCategory.BUSINESS);
      if (businessTemplates.length === 0) {
        throw new Error('沒有可用的業務報告模板');
      }

      const _template = businessTemplates[0];
      return createNewReport({
        templateId: template.id,
        name,
      });
    },
    [getTemplatesByCategory, createNewReport]
  );

  const _quickCreateFinancialReport = useCallback(
    async (name: string) => {
      const _financialTemplates = getTemplatesByCategory(
        ReportCategory.FINANCIAL
      );
      if (financialTemplates.length === 0) {
        throw new Error('沒有可用的財務報告模板');
      }

      const _template = financialTemplates[0];
      return createNewReport({
        templateId: template.id,
        name,
      });
    },
    [getTemplatesByCategory, createNewReport]
  );

  const _quickExportToPDF = useCallback(
    async (reportId: string) => {
      return exportReportById(reportId, {
        format: ExportFormat.PDF,
      });
    },
    [exportReportById]
  );

  const _quickExportToExcel = useCallback(
    async (reportId: string) => {
      return exportReportById(reportId, {
        format: ExportFormat.EXCEL,
      });
    },
    [exportReportById]
  );

  // 自動初始化
  useEffect(() => {
    if (status === 'idle') {
      initialize();
    }
  }, [status, initialize]);

  // 定期更新分析數據
  useEffect(() => {
    if (status === 'succeeded') {
      const _interval = setInterval(() => {
        fetchAnalytics().catch(console.error);
      }, 30000); // 每30秒更新一次

      return () => clearInterval(interval);
    }
    return undefined;
  }, [status, fetchAnalytics]);

  return {
    // 狀態
    templates,
    currentTemplate,
    selectedTemplateId,
    reports,
    currentReport,
    selectedReportId,
    exports,
    currentExport,
    analytics,
    filterOptions,
    pagination,
    isLoading,
    error,
    status,

    // 計算選擇器
    activeTemplates,
    completedReports,
    completedExports,
    templateCount,
    reportCount,
    exportCount,

    // 計算屬性
    ...computedValues,

    // 操作方法
    initialize,
    createNewTemplate,
    getTemplateById,
    selectTemplate,
    selectTemplateById,
    createNewReport,
    getReportById,
    selectReport,
    selectReportById,
    exportReportById,
    selectExport,
    fetchAnalytics,
    updateFilterOptions,
    updatePagination,
    setLoadingState,
    setErrorMessage,
    clearErrorMessage,
    resetReportState,

    // 實用方法
    getTemplatesByCategory,
    getTemplatesByType,
    getReportsByStatus,
    getReportsByTemplate,
    getExportsByFormat,
    getExportsByStatus,

    // 快速創建方法
    quickCreateBusinessReport,
    quickCreateFinancialReport,
    quickExportToPDF,
    quickExportToExcel,
  };
};
