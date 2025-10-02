/**
 * 假卡回報系統自定義 Hook
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  acknowledgeWarning,
  addReportToList,
  appealBlacklistEntry,
  bulkProcessReports,
  checkBlacklist,
  clearError,
  clearSearchResults,
  createBlacklistEntry,
  createReport,
  createWarning,
  getBlacklistEntries,
  getReport,
  getStats,
  getUserReportHistory,
  getUserWarnings,
  removeReportFromList,
  resolveReport,
  searchReports,
  setCurrentReport,
  setReportFilters,
  setSelectedBlacklistEntryId,
  setSelectedReportId,
  setSelectedWarningId,
  setShowCreateBlacklistModal,
  setShowCreateReportModal,
  setShowCreateWarningModal,
  setShowStatsModal,
  updateReport,
  updateReportInList,
  updateReportStatus,
  verifyEvidence,
} from '../store/slices/fakeCardReportingSlice';
import {
  BlacklistEntityType,
  BlacklistStatus,
  FakeCardFilters,
  FakeCardReport,
  FakeCardReportStatus,
  FakeCardReportType,
  FakeCardResolution,
  FakeCardSeverity,
  ResolutionAction,
} from '../types/fakeCardReporting';

export const useFakeCardReporting = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.fakeCardReporting);

  // 舉報相關操作
  const handleCreateReport = useCallback(
    async (request: Parameters<typeof createReport>[0]) => {
      try {
        const result = await dispatch(createReport(request)).unwrap();
        dispatch(setCurrentReport(result));
        dispatch(addReportToList(result));
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleGetReport = useCallback(
    async (reportId: string) => {
      try {
        const result = await dispatch(getReport(reportId)).unwrap();
        dispatch(setCurrentReport(result));
        dispatch(setSelectedReportId(reportId));
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleUpdateReport = useCallback(
    async (request: Parameters<typeof updateReport>[0]) => {
      try {
        const result = await dispatch(updateReport(request)).unwrap();
        dispatch(setCurrentReport(result));
        dispatch(updateReportInList(result));
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleSearchReports = useCallback(
    async (filters: FakeCardFilters, page?: number, limit?: number) => {
      try {
        const result = await dispatch(
          searchReports({ filters, page, limit })
        ).unwrap();
        dispatch(setReportFilters(filters));
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleResolveReport = useCallback(
    async (
      reportId: string,
      resolution: FakeCardResolution,
      resolvedBy: string
    ) => {
      try {
        const result = await dispatch(
          resolveReport({ reportId, resolution, resolvedBy })
        ).unwrap();
        dispatch(setCurrentReport(result));
        dispatch(updateReportInList(result));
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // 警告相關操作
  const handleCreateWarning = useCallback(
    async (request: Parameters<typeof createWarning>[0]) => {
      try {
        const result = await dispatch(createWarning(request)).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleGetUserWarnings = useCallback(
    async (userId: string) => {
      try {
        const result = await dispatch(getUserWarnings(userId)).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleAcknowledgeWarning = useCallback(
    async (warningId: string) => {
      try {
        const result = await dispatch(acknowledgeWarning(warningId)).unwrap();
        dispatch(setSelectedWarningId(null));
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // 黑名單相關操作
  const handleCreateBlacklistEntry = useCallback(
    async (request: Parameters<typeof createBlacklistEntry>[0]) => {
      try {
        const result = await dispatch(createBlacklistEntry(request)).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleGetBlacklistEntries = useCallback(
    async (entityType?: BlacklistEntityType, status?: BlacklistStatus) => {
      try {
        const result = await dispatch(
          getBlacklistEntries({ entityType, status })
        ).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleCheckBlacklist = useCallback(
    async (entityId: string, entityType: BlacklistEntityType) => {
      try {
        const result = await dispatch(
          checkBlacklist({ entityId, entityType })
        ).unwrap();
        return result.isBlacklisted;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  const handleAppealBlacklistEntry = useCallback(
    async (entryId: string, reason: string) => {
      try {
        const result = await dispatch(
          appealBlacklistEntry({ entryId, reason })
        ).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // 統計數據相關操作
  const handleGetStats = useCallback(
    async (
      dateRange?: { start: Date; end: Date },
      filters?: Partial<FakeCardFilters>
    ) => {
      try {
        const result = await dispatch(
          getStats({ dateRange, filters })
        ).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // 證據驗證相關操作
  const handleVerifyEvidence = useCallback(
    async (
      evidenceId: string,
      verified: boolean,
      verificationScore?: number
    ) => {
      try {
        const result = await dispatch(
          verifyEvidence({ evidenceId, verified, verificationScore })
        ).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // 用戶舉報歷史相關操作
  const handleGetUserReportHistory = useCallback(
    async (userId: string, page?: number, limit?: number) => {
      try {
        const result = await dispatch(
          getUserReportHistory({ userId, page, limit })
        ).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // 批量處理相關操作
  const handleBulkProcessReports = useCallback(
    async (
      reportIds: string[],
      action: ResolutionAction,
      reason: string,
      processedBy: string
    ) => {
      try {
        const result = await dispatch(
          bulkProcessReports({ reportIds, action, reason, processedBy })
        ).unwrap();
        return result;
      } catch (error) {
        throw error;
      }
    },
    [dispatch]
  );

  // UI 狀態管理
  const handleSetCurrentReport = useCallback(
    (report: FakeCardReport | null) => {
      dispatch(setCurrentReport(report));
    },
    [dispatch]
  );

  const handleSetSelectedReportId = useCallback(
    (reportId: string | null) => {
      dispatch(setSelectedReportId(reportId));
    },
    [dispatch]
  );

  const handleSetSelectedWarningId = useCallback(
    (warningId: string | null) => {
      dispatch(setSelectedWarningId(warningId));
    },
    [dispatch]
  );

  const handleSetSelectedBlacklistEntryId = useCallback(
    (entryId: string | null) => {
      dispatch(setSelectedBlacklistEntryId(entryId));
    },
    [dispatch]
  );

  const handleSetReportFilters = useCallback(
    (filters: FakeCardFilters) => {
      dispatch(setReportFilters(filters));
    },
    [dispatch]
  );

  const handleClearSearchResults = useCallback(() => {
    dispatch(clearSearchResults());
  }, [dispatch]);

  const handleSetShowCreateReportModal = useCallback(
    (show: boolean) => {
      dispatch(setShowCreateReportModal(show));
    },
    [dispatch]
  );

  const handleSetShowCreateWarningModal = useCallback(
    (show: boolean) => {
      dispatch(setShowCreateWarningModal(show));
    },
    [dispatch]
  );

  const handleSetShowCreateBlacklistModal = useCallback(
    (show: boolean) => {
      dispatch(setShowCreateBlacklistModal(show));
    },
    [dispatch]
  );

  const handleSetShowStatsModal = useCallback(
    (show: boolean) => {
      dispatch(setShowStatsModal(show));
    },
    [dispatch]
  );

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleUpdateReportStatus = useCallback(
    (reportId: string, status: FakeCardReportStatus) => {
      dispatch(updateReportStatus({ reportId, status }));
    },
    [dispatch]
  );

  const handleRemoveReportFromList = useCallback(
    (reportId: string) => {
      dispatch(removeReportFromList(reportId));
    },
    [dispatch]
  );

  // 計算屬性
  const isLoading = state.loading;
  const error = state.error;
  const lastUpdated = state.lastUpdated;

  const currentReport = state.currentReport;
  const selectedReportId = state.selectedReportId;
  const selectedWarningId = state.selectedWarningId;
  const selectedBlacklistEntryId = state.selectedBlacklistEntryId;

  const reports = state.reports;
  const reportSearchResult = state.reportSearchResult;
  const reportFilters = state.reportFilters;

  const warnings = state.warnings;
  const userWarnings = state.userWarnings;

  const blacklistEntries = state.blacklistEntries;
  const blacklistCheckResult = state.blacklistCheckResult;

  const stats = state.stats;

  const showCreateReportModal = state.showCreateReportModal;
  const showCreateWarningModal = state.showCreateWarningModal;
  const showCreateBlacklistModal = state.showCreateBlacklistModal;
  const showStatsModal = state.showStatsModal;

  // 過濾器輔助函數
  const getReportsByStatus = useCallback(
    (status: FakeCardReportStatus) => {
      return reports.filter(report => report.status === status);
    },
    [reports]
  );

  const getReportsBySeverity = useCallback(
    (severity: FakeCardSeverity) => {
      return reports.filter(report => report.severity === severity);
    },
    [reports]
  );

  const getReportsByType = useCallback(
    (type: FakeCardReportType) => {
      return reports.filter(report => report.reportType === type);
    },
    [reports]
  );

  const getActiveWarnings = useCallback(() => {
    const now = new Date();
    return userWarnings.filter(
      warning =>
        !warning.acknowledgedAt &&
        (!warning.expiresAt || warning.expiresAt > now)
    );
  }, [userWarnings]);

  const getActiveBlacklistEntries = useCallback(() => {
    const now = new Date();
    return blacklistEntries.filter(
      entry =>
        entry.status === BlacklistStatus.ACTIVE &&
        (!entry.expiresAt || entry.expiresAt > now)
    );
  }, [blacklistEntries]);

  // 統計輔助函數
  const getReportStats = useCallback(() => {
    if (!stats) return null;

    return {
      totalReports: stats.totalReports,
      pendingReports: stats.reportsByStatus[FakeCardReportStatus.PENDING] || 0,
      resolvedReports:
        stats.reportsByStatus[FakeCardReportStatus.RESOLVED] || 0,
      criticalReports: stats.reportsBySeverity[FakeCardSeverity.CRITICAL] || 0,
      averageResolutionTime: stats.averageResolutionTime,
      verificationRate: stats.verificationRate,
      falsePositiveRate: stats.falsePositiveRate,
    };
  }, [stats]);

  return {
    // 狀態
    isLoading,
    error,
    lastUpdated,
    currentReport,
    selectedReportId,
    selectedWarningId,
    selectedBlacklistEntryId,
    reports,
    reportSearchResult,
    reportFilters,
    warnings,
    userWarnings,
    blacklistEntries,
    blacklistCheckResult,
    stats,
    showCreateReportModal,
    showCreateWarningModal,
    showCreateBlacklistModal,
    showStatsModal,

    // 舉報操作
    createReport: handleCreateReport,
    getReport: handleGetReport,
    updateReport: handleUpdateReport,
    searchReports: handleSearchReports,
    resolveReport: handleResolveReport,

    // 警告操作
    createWarning: handleCreateWarning,
    getUserWarnings: handleGetUserWarnings,
    acknowledgeWarning: handleAcknowledgeWarning,

    // 黑名單操作
    createBlacklistEntry: handleCreateBlacklistEntry,
    getBlacklistEntries: handleGetBlacklistEntries,
    checkBlacklist: handleCheckBlacklist,
    appealBlacklistEntry: handleAppealBlacklistEntry,

    // 統計操作
    getStats: handleGetStats,

    // 證據驗證操作
    verifyEvidence: handleVerifyEvidence,

    // 用戶歷史操作
    getUserReportHistory: handleGetUserReportHistory,

    // 批量處理操作
    bulkProcessReports: handleBulkProcessReports,

    // UI 狀態管理
    setCurrentReport: handleSetCurrentReport,
    setSelectedReportId: handleSetSelectedReportId,
    setSelectedWarningId: handleSetSelectedWarningId,
    setSelectedBlacklistEntryId: handleSetSelectedBlacklistEntryId,
    setReportFilters: handleSetReportFilters,
    clearSearchResults: handleClearSearchResults,
    setShowCreateReportModal: handleSetShowCreateReportModal,
    setShowCreateWarningModal: handleSetShowCreateWarningModal,
    setShowCreateBlacklistModal: handleSetShowCreateBlacklistModal,
    setShowStatsModal: handleSetShowStatsModal,
    clearError: handleClearError,
    updateReportStatus: handleUpdateReportStatus,
    removeReportFromList: handleRemoveReportFromList,

    // 輔助函數
    getReportsByStatus,
    getReportsBySeverity,
    getReportsByType,
    getActiveWarnings,
    getActiveBlacklistEntries,
    getReportStats,
  };
};
