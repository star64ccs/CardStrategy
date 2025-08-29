import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../store';
import { useAppDispatch } from '../../../store/hooks';
import {
  addBlacklistEntryToList,
  addCommunityWarningToList,
  addReportToList,
  addToBlacklist,
  addWarningToList,
  checkUserBlacklistStatus,
  clearError,
  createCommunityWarning,
  createReport,
  createWarning,
  destroyReportingService,
  getActiveCommunityWarnings,
  getReport,
  getReportStats,
  getUserWarnings,
  // Actions
  initializeReportingService,
  queryReports,
  removeReportFromList,
  // Reducers
  resetState,
  selectBlacklist,
  selectCommunityWarnings,
  selectCurrentReport,
  selectError,
  selectIsInitialized,
  selectIsLoading,
  selectIsUserBlacklisted,
  selectPagination,
  selectQueryParams,
  selectReports,
  selectReportStats,
  selectUserWarnings,
  selectWarnings,
  setCurrentReport,
  setPagination,
  updateBlacklistEntryInList,
  updateCommunityWarningInList,
  updateQueryParams,
  updateReportInList,
  updateReportStatus,
  updateWarningInList,
} from '../../../store/slices/fakeCardReportingSlice';
import type {
  BlacklistType,
  EvidenceItem,
  ReportQueryParams,
  ReportSeverity,
  ReportType,
  WarningType,
} from '../types/reporting';
import { ReportStatus } from '../types/reporting';

/**
 * 假卡回報系統自定義 Hook
 * 提供完整的假卡回報功能，包括舉報、警告、黑名單管理
 */
export const _useFakeCardReporting = () => {
  const _dispatch = useAppDispatch();
  const _state = useSelector((state: RootState) => state.fakeCardReporting);

  // 狀態選擇器
  const _isInitialized = useSelector(selectIsInitialized);
  const _isLoading = useSelector(selectIsLoading);
  const _error = useSelector(selectError);
  const _reports = useSelector(selectReports);
  const _currentReport = useSelector(selectCurrentReport);
  const _reportStats = useSelector(selectReportStats);
  const _warnings = useSelector(selectWarnings);
  const _userWarnings = useSelector(selectUserWarnings);
  const _blacklist = useSelector(selectBlacklist);
  const _isUserBlacklisted = useSelector(selectIsUserBlacklisted);
  const _communityWarnings = useSelector(selectCommunityWarnings);
  const _queryParams = useSelector(selectQueryParams);
  const _pagination = useSelector(selectPagination);

  // 服務初始化
  const _initializeService = (config?: unknown) => {
    return (dispatch(initializeReportingService(config)) as any).unwrap();
  };

  const _destroyService = () => {
    return (dispatch(destroyReportingService()) as any).unwrap();
  };

  // 舉報管理
  const _submitReport = (reportData: {
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
    return (dispatch(createReport(reportData)) as any).unwrap();
  };

  const _fetchReport = (reportId: string) => {
    return (dispatch(getReport(reportId)) as any).unwrap();
  };

  const _updateStatus = (params: {
    reportId: string;
    status: ReportStatus;
    userId: string;
    notes?: string;
    actionTaken?: string;
  }) => {
    return (dispatch(updateReportStatus(params)) as any).unwrap();
  };

  const _searchReports = (params: ReportQueryParams) => {
    return (dispatch(queryReports(params)) as any).unwrap();
  };

  const _getStats = () => {
    return (dispatch(getReportStats()) as any).unwrap();
  };

  // 警告管理
  const _issueWarning = (warningData: {
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
    return (dispatch(createWarning(warningData)) as any).unwrap();
  };

  const _fetchUserWarnings = (userId: string) => {
    return (dispatch(getUserWarnings(userId)) as any).unwrap();
  };

  // 黑名單管理
  const _blacklistUser = (blacklistData: {
    type: BlacklistType;
    targetId: string;
    targetValue: string;
    reason: string;
    severity: ReportSeverity;
    isActive: boolean;
    expiresAt?: Date;
    createdBy: string;
  }) => {
    return (dispatch(addToBlacklist(blacklistData)) as any).unwrap();
  };

  const _checkBlacklistStatus = (userId: string) => {
    return (dispatch(checkUserBlacklistStatus(userId)) as any).unwrap();
  };

  // 社區警告管理
  const _issueCommunityWarning = (warningData: {
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
    return (dispatch(createCommunityWarning(warningData)) as any).unwrap();
  };

  const _fetchCommunityWarnings = () => {
    return (dispatch(getActiveCommunityWarnings()) as any).unwrap();
  };

  // 狀態管理
  const _setCurrentReportAction = (report: unknown) => {
    dispatch(setCurrentReport(report));
  };

  const _updateQueryParamsAction = (params: Partial<ReportQueryParams>) => {
    dispatch(updateQueryParams(params));
  };

  const _setPaginationAction = (pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  }) => {
    dispatch(setPagination(pagination));
  };

  const _clearErrorAction = () => {
    dispatch(clearError());
  };

  const _resetStateAction = () => {
    dispatch(resetState());
  };

  // 列表管理
  const _addReportToListAction = (report: unknown) => {
    dispatch(addReportToList(report));
  };

  const _updateReportInListAction = (report: unknown) => {
    dispatch(updateReportInList(report));
  };

  const _removeReportFromListAction = (reportId: string) => {
    dispatch(removeReportFromList(reportId));
  };

  const _addWarningToListAction = (warning: unknown) => {
    dispatch(addWarningToList(warning));
  };

  const _updateWarningInListAction = (warning: unknown) => {
    dispatch(updateWarningInList(warning));
  };

  const _addBlacklistEntryToListAction = (entry: unknown) => {
    dispatch(addBlacklistEntryToList(entry));
  };

  const _updateBlacklistEntryInListAction = (entry: unknown) => {
    dispatch(updateBlacklistEntryInList(entry));
  };

  const _addCommunityWarningToListAction = (warning: unknown) => {
    dispatch(addCommunityWarningToList(warning));
  };

  const _updateCommunityWarningInListAction = (warning: unknown) => {
    dispatch(updateCommunityWarningInList(warning));
  };

  // 實用函數
  const _getReportById = (reportId: string) => {
    return reports.find(report => report.id === reportId);
  };

  const _getWarningById = (warningId: string) => {
    return warnings.find(warning => warning.id === warningId);
  };

  const _getBlacklistEntryById = (entryId: string) => {
    return blacklist.find(entry => entry.id === entryId);
  };

  const _getCommunityWarningById = (warningId: string) => {
    return communityWarnings.find(warning => warning.id === warningId);
  };

  const _getReportsByStatus = (status: ReportStatus) => {
    return reports.filter(report => report.response.status === status);
  };

  const _getReportsByType = (type: ReportType) => {
    return reports.filter(report => report.report?.reportType === type);
  };

  const _getReportsBySeverity = (severity: ReportSeverity) => {
    return reports.filter(report => report.report?.severity === severity);
  };

  const _getActiveWarnings = () => {
    return warnings.filter(warning => warning.isActive);
  };

  const _getActiveBlacklistEntries = () => {
    return blacklist.filter(entry => entry.isActive);
  };

  const _getReportsByUser = (userId: string) => {
    return reports.filter(report => report.report.reporterId === userId);
  };

  const _getReportsAgainstUser = (userId: string) => {
    return reports.filter(report => report.report.reportedUserId === userId);
  };

  const _getWarningsByUser = (userId: string) => {
    return warnings.filter(warning => warning.targetId === userId);
  };

  const _getBlacklistEntriesByUser = (userId: string) => {
    return blacklist.filter(entry => entry.targetId === userId);
  };

  const _getPendingReportsCount = () => {
    return reports.filter(
      report => report.response.status === ReportStatus.PENDING
    ).length;
  };

  const _getUnderReviewReportsCount = () => {
    return reports.filter(
      report => report.response.status === ReportStatus.UNDER_REVIEW
    ).length;
  };

  const _getResolvedReportsCount = () => {
    return reports.filter(
      report => report.response.status === ReportStatus.RESOLVED
    ).length;
  };

  const _getRejectedReportsCount = () => {
    return reports.filter(
      report => report.response.status === ReportStatus.REJECTED
    ).length;
  };

  const _getActiveWarningsCount = () => {
    return warnings.filter(warning => warning.isActive).length;
  };

  const _getActiveBlacklistEntriesCount = () => {
    return blacklist.filter(entry => entry.isActive).length;
  };

  const _getActiveCommunityWarningsCount = () => {
    return communityWarnings.filter(warning => warning.isActive).length;
  };

  const _getReportsByDateRange = (startDate: Date, endDate: Date) => {
    return reports.filter(
      report => report.createdAt >= startDate && report.createdAt <= endDate
    );
  };

  const _getWarningsByDateRange = (startDate: Date, endDate: Date) => {
    return warnings.filter(
      warning => warning.createdAt >= startDate && warning.createdAt <= endDate
    );
  };

  const _getBlacklistEntriesByDateRange = (startDate: Date, endDate: Date) => {
    return blacklist.filter(
      entry => entry.createdAt >= startDate && entry.createdAt <= endDate
    );
  };

  const _getCommunityWarningsByDateRange = (startDate: Date, endDate: Date) => {
    return communityWarnings.filter(
      warning => warning.createdAt >= startDate && warning.createdAt <= endDate
    );
  };

  const _getReportsWithEvidence = () => {
    return reports.filter(report => report.report.evidence.length > 0);
  };

  const _getAnonymousReports = () => {
    return reports.filter(report => report.report.isAnonymous);
  };

  const _getNonAnonymousReports = () => {
    return reports.filter(report => !report.report.isAnonymous);
  };

  const _getHighPriorityReports = () => {
    return reports.filter(
      report =>
        report.report.priority === 'HIGH' || report.report.priority === 'URGENT'
    );
  };

  const _getLowPriorityReports = () => {
    return reports.filter(
      report =>
        report.report.priority === 'LOW' || report.report.priority === 'MEDIUM'
    );
  };

  const _getExpiredWarnings = () => {
    const _now = new Date();
    return warnings.filter(
      warning => warning.expiresAt && warning.expiresAt < now
    );
  };

  const _getExpiredBlacklistEntries = () => {
    const _now = new Date();
    return blacklist.filter(entry => entry.expiresAt && entry.expiresAt < now);
  };

  const _getExpiredCommunityWarnings = () => {
    const _now = new Date();
    return communityWarnings.filter(
      warning => warning.displayUntil && warning.displayUntil < now
    );
  };

  return {
    // 狀態
    state,
    isInitialized,
    isLoading,
    error,
    reports,
    currentReport,
    reportStats,
    warnings,
    userWarnings,
    blacklist,
    isUserBlacklisted,
    communityWarnings,
    queryParams,
    pagination,

    // 服務管理
    initializeService,
    destroyService,

    // 舉報管理
    submitReport,
    fetchReport,
    updateStatus,
    searchReports,
    getStats,

    // 警告管理
    issueWarning,
    fetchUserWarnings,

    // 黑名單管理
    blacklistUser,
    checkBlacklistStatus,

    // 社區警告管理
    issueCommunityWarning,
    fetchCommunityWarnings,

    // 狀態管理
    setCurrentReport: setCurrentReportAction,
    updateQueryParams: updateQueryParamsAction,
    setPagination: setPaginationAction,
    clearError: clearErrorAction,
    resetState: resetStateAction,

    // 列表管理
    addReportToList: addReportToListAction,
    updateReportInList: updateReportInListAction,
    removeReportFromList: removeReportFromListAction,
    addWarningToList: addWarningToListAction,
    updateWarningInList: updateWarningInListAction,
    addBlacklistEntryToList: addBlacklistEntryToListAction,
    updateBlacklistEntryInList: updateBlacklistEntryInListAction,
    addCommunityWarningToList: addCommunityWarningToListAction,
    updateCommunityWarningInList: updateCommunityWarningInListAction,

    // 查詢函數
    getReportById,
    getWarningById,
    getBlacklistEntryById,
    getCommunityWarningById,
    getReportsByStatus,
    getReportsByType,
    getReportsBySeverity,
    getActiveWarnings,
    getActiveBlacklistEntries,
    getReportsByUser,
    getReportsAgainstUser,
    getWarningsByUser,
    getBlacklistEntriesByUser,

    // 統計函數
    getPendingReportsCount,
    getUnderReviewReportsCount,
    getResolvedReportsCount,
    getRejectedReportsCount,
    getActiveWarningsCount,
    getActiveBlacklistEntriesCount,
    getActiveCommunityWarningsCount,

    // 日期範圍查詢
    getReportsByDateRange,
    getWarningsByDateRange,
    getBlacklistEntriesByDateRange,
    getCommunityWarningsByDateRange,

    // 特殊查詢
    getReportsWithEvidence,
    getAnonymousReports,
    getNonAnonymousReports,
    getHighPriorityReports,
    getLowPriorityReports,
    getExpiredWarnings,
    getExpiredBlacklistEntries,
    getExpiredCommunityWarnings,
  };
};
