import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { useAppDispatch } from '../../../store/hooks';
import {
  addWidget,
  clearErrors,
  createAlert,
  createDashboard,
  deleteAlert,
  deleteDashboard,
  exportDashboard,
  getAlerts,
  getAnalytics,
  getConfig,
  getDashboard,
  getDashboardData,
  getDashboards,
  getPerformanceMetrics,
  getTemplates,
  initializeDashboard,
  refreshDashboardData,
  removeWidget,
  selectDashboardState,
  setCurrentDashboard,
  setEditingLayout,
  setFullscreenMode,
  setPreviewMode,
  setSelectedWidget,
  updateAlert,
  updateAnalytics,
  updateConfig,
  updateDashboard,
  updateTheme,
  updateWidget,
} from '../../../store/slices/dashboardSlice';
import type {
  AlertAction,
  AlertCondition,
  DashboardAlert,
  DashboardAnalytics,
  DashboardConfig,
  DashboardCreateRequest,
  DashboardFilterOptions,
  DashboardLayout,
  DashboardTheme,
  DashboardUpdateRequest,
  DashboardWidget,
} from '../types/dashboard';

export const _useDashboard = () => {
  const _dispatch = useAppDispatch();
  const _state = useSelector(selectDashboardState);

  // 初始化
  const _initialize = useCallback(async () => {
    try {
      await (dispatch as any)(initializeDashboard()).unwrap();
    } catch (error) {
      console.error('Dashboard initialization failed:', error);
    }
  }, [dispatch]);

  // 獲取儀表板
  const _fetchDashboard = useCallback(
    async (dashboardId: string) => {
      try {
        const _dashboard = await (dispatch as any)(
          getDashboard(dashboardId)
        ).unwrap();
        return dashboard;
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
        return null;
      }
    },
    [dispatch]
  );

  // 獲取儀表板列表
  const _fetchDashboards = useCallback(
    async (filter?: DashboardFilterOptions) => {
      try {
        const _result = await (dispatch as any)(getDashboards(filter)).unwrap();
        return result;
      } catch (error) {
        console.error('Failed to fetch dashboards:', error);
        return null;
      }
    },
    [dispatch]
  );

  // 創建儀表板
  const _create = useCallback(
    async (request: DashboardCreateRequest) => {
      try {
        const _dashboard = await (dispatch as any)(
          createDashboard(request)
        ).unwrap();
        return dashboard;
      } catch (error) {
        console.error('Failed to create dashboard:', error);
        return null;
      }
    },
    [dispatch]
  );

  // 更新儀表板
  const _update = useCallback(
    async (dashboardId: string, request: DashboardUpdateRequest) => {
      try {
        const _dashboard = await (dispatch as any)(
          updateDashboard({ dashboardId, request })
        ).unwrap();
        return dashboard;
      } catch (error) {
        console.error('Failed to update dashboard:', error);
        return null;
      }
    },
    [dispatch]
  );

  // 刪除儀表板
  const _remove = useCallback(
    async (dashboardId: string) => {
      try {
        await (dispatch as any)(deleteDashboard(dashboardId)).unwrap();
        return true;
      } catch (error) {
        console.error('Failed to delete dashboard:', error);
        return false;
      }
    },
    [dispatch]
  );

  // 獲取儀表板數據
  const _fetchData = useCallback(
    async (dashboardId: string, widgetId?: string) => {
      try {
        const _data = await (dispatch as any)(
          getDashboardData({ dashboardId, widgetId })
        ).unwrap();
        return data;
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        return [];
      }
    },
    [dispatch]
  );

  // 刷新儀表板數據
  const _refreshData = useCallback(
    async (dashboardId: string) => {
      try {
        await (dispatch as any)(refreshDashboardData(dashboardId)).unwrap();
      } catch (error) {
        console.error('Failed to refresh dashboard data:', error);
      }
    },
    [dispatch]
  );

  // 導出儀表板
  const _exportTo = useCallback(
    async (
      dashboardId: string,
      format: 'pdf' | 'png' | 'jpg' | 'svg' | 'html'
    ) => {
      try {
        const _exportResult = await (dispatch as any)(
          exportDashboard({ dashboardId, format })
        ).unwrap();
        return exportResult;
      } catch (error) {
        console.error('Failed to export dashboard:', error);
        return null;
      }
    },
    [dispatch]
  );

  // 創建警報
  const _createAlertHandler = useCallback(
    async (
      dashboardId: string,
      condition: AlertCondition,
      action: AlertAction
    ) => {
      try {
        const _alert = await (dispatch as any)(
          createAlert({ dashboardId, condition, action })
        ).unwrap();
        return alert;
      } catch (error) {
        console.error('Failed to create alert:', error);
        return null;
      }
    },
    [dispatch]
  );

  // 更新警報
  const _updateAlertHandler = useCallback(
    async (alertId: string, updates: Partial<DashboardAlert>) => {
      try {
        const _alert = await (dispatch as any)(
          updateAlert({ alertId, updates })
        ).unwrap();
        return alert;
      } catch (error) {
        console.error('Failed to update alert:', error);
        return null;
      }
    },
    [dispatch]
  );

  // 刪除警報
  const _deleteAlertHandler = useCallback(
    async (alertId: string) => {
      try {
        await (dispatch as any)(deleteAlert(alertId)).unwrap();
        return true;
      } catch (error) {
        console.error('Failed to delete alert:', error);
        return false;
      }
    },
    [dispatch]
  );

  // 獲取警報
  const _fetchAlerts = useCallback(
    async (dashboardId?: string) => {
      try {
        const _alerts = await (dispatch as any)(getAlerts(dashboardId)).unwrap();
        return alerts;
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        return [];
      }
    },
    [dispatch]
  );

  // 獲取模板
  const _fetchTemplates = useCallback(
    async (category?: string) => {
      try {
        const _templates = await (dispatch as any)(
          getTemplates(category)
        ).unwrap();
        return templates;
      } catch (error) {
        console.error('Failed to fetch templates:', error);
        return [];
      }
    },
    [dispatch]
  );

  // 獲取分析
  const _fetchAnalytics = useCallback(
    async (dashboardId: string) => {
      try {
        const _analytics = await (dispatch as any)(
          getAnalytics(dashboardId)
        ).unwrap();
        return analytics;
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return null;
      }
    },
    [dispatch]
  );

  // 更新分析
  const _updateAnalyticsHandler = useCallback(
    async (dashboardId: string, updates: Partial<DashboardAnalytics>) => {
      try {
        const _analytics = await (dispatch as any)(
          updateAnalytics({ dashboardId, updates })
        ).unwrap();
        return analytics;
      } catch (error) {
        console.error('Failed to update analytics:', error);
        return null;
      }
    },
    [dispatch]
  );

  // 獲取性能指標
  const _fetchPerformanceMetrics = useCallback(
    async (dashboardId: string) => {
      try {
        const _metrics = await (dispatch as any)(
          getPerformanceMetrics(dashboardId)
        ).unwrap();
        return metrics;
      } catch (error) {
        console.error('Failed to fetch performance metrics:', error);
        return null;
      }
    },
    [dispatch]
  );

  // 獲取配置
  const _fetchConfig = useCallback(async () => {
    try {
      const _config = await (dispatch as any)(getConfig()).unwrap();
      return config;
    } catch (error) {
      console.error('Failed to fetch config:', error);
      return null;
    }
  }, [dispatch]);

  // 更新配置
  const _updateConfigHandler = useCallback(
    async (config: unknown) => {
      try {
        await (dispatch as any)(updateConfig(config)).unwrap();
        return true;
      } catch (error) {
        console.error('Failed to update config:', error);
        return false;
      }
    },
    [dispatch]
  );

  // UI 操作
  const _setCurrent = useCallback(
    (dashboard: DashboardConfig | null) => {
      dispatch(setCurrentDashboard(dashboard));
    },
    [dispatch]
  );

  const _setSelected = useCallback(
    (widget: DashboardWidget | null) => {
      dispatch(setSelectedWidget(widget));
    },
    [dispatch]
  );

  const _setEditing = useCallback(
    (layout: DashboardLayout | null) => {
      dispatch(setEditingLayout(layout));
    },
    [dispatch]
  );

  const _setPreview = useCallback(
    (mode: boolean) => {
      dispatch(setPreviewMode(mode));
    },
    [dispatch]
  );

  const _setFullscreen = useCallback(
    (mode: boolean) => {
      dispatch(setFullscreenMode(mode));
    },
    [dispatch]
  );

  const _updateWidgetHandler = useCallback(
    (
      dashboardId: string,
      widgetId: string,
      updates: Partial<DashboardWidget>
    ) => {
      dispatch(updateWidget({ dashboardId, widgetId, updates }));
    },
    [dispatch]
  );

  const _addWidgetHandler = useCallback(
    (dashboardId: string, widget: DashboardWidget) => {
      dispatch(addWidget({ dashboardId, widget }));
    },
    [dispatch]
  );

  const _removeWidgetHandler = useCallback(
    (dashboardId: string, widgetId: string) => {
      dispatch(removeWidget({ dashboardId, widgetId }));
    },
    [dispatch]
  );

  const _updateThemeHandler = useCallback(
    (dashboardId: string, theme: Partial<DashboardTheme>) => {
      dispatch(updateTheme({ dashboardId, theme }));
    },
    [dispatch]
  );

  const _clearErrorsHandler = useCallback(() => {
    dispatch(clearErrors());
  }, [dispatch]);

  // 自動初始化
  useEffect(() => {
    if (!state.isInitialized) {
      initialize();
    }
  }, [state.isInitialized, initialize]);

  // 定期刷新數據
  useEffect(() => {
    if (state.currentDashboard && state.isInitialized) {
      const _interval = setInterval(() => {
        refreshData(state.currentDashboard.id);
      }, state.currentDashboard.refreshInterval * 1000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.currentDashboard, state.isInitialized, refreshData]);

  // 計算屬性
  const _dashboardCount = useMemo(
    () => state.dashboards.length,
    [state.dashboards]
  );
  const _activeAlerts = useMemo(
    () => state.alerts.filter(alert => alert.isActive),
    [state.alerts]
  );
  const _recentExports = useMemo(
    () =>
      state.exports
        .filter(exp => exp.status === 'completed')
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [state.exports]
  );

  const _isLoading = useMemo(
    () =>
      state.dashboardsLoading ||
      state.dataLoading ||
      state.exportLoading ||
      state.alertsLoading ||
      state.templatesLoading ||
      state.analyticsLoading ||
      state.performanceLoading ||
      state.configLoading,
    [state]
  );

  const _hasError = useMemo(
    () =>
      state.initializationError ||
      state.dashboardsError ||
      state.dataError ||
      state.exportError ||
      state.alertsError ||
      state.templatesError ||
      state.analyticsError ||
      state.performanceError ||
      state.configError,
    [state]
  );

  return {
    // 狀態
    ...state,
    dashboardCount,
    activeAlerts,
    recentExports,
    isLoading,
    hasError,

    // 操作
    initialize,
    fetchDashboard,
    fetchDashboards,
    create,
    update,
    remove,
    fetchData,
    refreshData,
    exportTo,
    createAlert: createAlertHandler,
    updateAlert: updateAlertHandler,
    deleteAlert: deleteAlertHandler,
    fetchAlerts,
    fetchTemplates,
    fetchAnalytics,
    updateAnalytics: updateAnalyticsHandler,
    fetchPerformanceMetrics,
    fetchConfig,
    updateConfig: updateConfigHandler,

    // UI 操作
    setCurrent,
    setSelected,
    setEditing,
    setPreview,
    setFullscreen,
    updateWidget: updateWidgetHandler,
    addWidget: addWidgetHandler,
    removeWidget: removeWidgetHandler,
    updateTheme: updateThemeHandler,
    clearErrors: clearErrorsHandler,
  };
};
