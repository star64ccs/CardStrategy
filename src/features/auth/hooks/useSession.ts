import { useCallback, useEffect } from 'react';

import type {
  Session,
  SessionConfig,
  SessionActivity,
  SessionSecurityInfo,
  SessionAnalytics,
  SessionRefreshRequest,
  SessionTerminationRequest,
} from '../../../core/types';
import { logger } from '../../../core/utils/logger';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  initializeSession,
  createSession,
  refreshSession,
  terminateSession,
  getSessions,
  getSessionConfig,
  getSessionActivities,
  getSessionSecurityInfo,
  getSessionAnalytics,
  updateSessionActivity,
  selectCurrentSession,
  selectIsSessionLoading,
  selectSessionError,
  selectSessions,
  selectIsSessionsLoading,
  selectSessionsError,
  selectSessionConfig,
  selectIsConfigLoading,
  selectConfigError,
  selectSessionActivities,
  selectIsActivitiesLoading,
  selectActivitiesError,
  selectSessionSecurityInfo,
  selectIsSecurityLoading,
  selectSecurityError,
  selectSessionAnalytics,
  selectIsAnalyticsLoading,
  selectAnalyticsError,
  selectIsRefreshing,
  selectRefreshError,
  selectIsTerminating,
  selectTerminationError,
  selectIsSessionValid,
  clearSessionError,
  clearSessionsError,
  clearConfigError,
  clearActivitiesError,
  clearSecurityError,
  clearAnalyticsError,
  clearRefreshError,
  clearTerminationError,
  resetSession,
  updateCurrentSession,
  setSessionConfig,
} from '../../../store/slices/sessionSlice';

interface UseSessionOptions {
  onSessionCreated?: (session: Session) => void;
  onSessionRefreshed?: (session: Session) => void;
  onSessionTerminated?: () => void;
  onSessionError?: (error: string) => void;
  onConfigUpdated?: (config: SessionConfig) => void;
  autoInitialize?: boolean;
  autoRefresh?: boolean;
}

interface UseSessionReturn {
  // 當前會話
  currentSession: Session | null;
  isSessionLoading: boolean;
  sessionError: string | null;
  isSessionValid: boolean;

  // 會話列表
  sessions: Session[];
  isSessionsLoading: boolean;
  sessionsError: string | null;

  // 會話配置
  config: SessionConfig;
  isConfigLoading: boolean;
  configError: string | null;

  // 會話活動
  activities: SessionActivity[];
  isActivitiesLoading: boolean;
  activitiesError: string | null;

  // 安全信息
  securityInfo: SessionSecurityInfo | null;
  isSecurityLoading: boolean;
  securityError: string | null;

  // 會話分析
  analytics: SessionAnalytics | null;
  isAnalyticsLoading: boolean;
  analyticsError: string | null;

  // 操作狀態
  isRefreshing: boolean;
  refreshError: string | null;
  isTerminating: boolean;
  terminationError: string | null;

  // 操作方法
  initialize: () => Promise<void>;
  create: (
    userId: string,
    token: string,
    refreshToken: string,
    expiresIn: number
  ) => Promise<Session>;
  refresh: (request: SessionRefreshRequest) => Promise<void>;
  terminate: (request?: SessionTerminationRequest) => Promise<void>;
  getSessionsList: () => Promise<void>;
  getConfig: () => Promise<void>;
  getActivities: (sessionId?: string) => Promise<void>;
  getSecurity: () => Promise<void>;
  getAnalytics: () => Promise<void>;
  updateActivity: () => Promise<void>;

  // 錯誤清除方法
  clearSessionError: () => void;
  clearSessionsError: () => void;
  clearConfigError: () => void;
  clearActivitiesError: () => void;
  clearSecurityError: () => void;
  clearAnalyticsError: () => void;
  clearRefreshError: () => void;
  clearTerminationError: () => void;

  // 重置方法
  reset: () => void;
}

export const _useSession = (
  options: UseSessionOptions = {}
): UseSessionReturn => {
  const _dispatch = useAppDispatch();
  const {
    onSessionCreated,
    onSessionRefreshed,
    onSessionTerminated,
    onSessionError,
    onConfigUpdated,
    autoInitialize = true,
    autoRefresh = true,
  } = options;

  // Selectors
  const _currentSession = useAppSelector(selectCurrentSession);
  const _isSessionLoading = useAppSelector(selectIsSessionLoading);
  const _sessionError = useAppSelector(selectSessionError);
  const _isSessionValid = useAppSelector(selectIsSessionValid);

  const _sessions = useAppSelector(selectSessions);
  const _isSessionsLoading = useAppSelector(selectIsSessionsLoading);
  const _sessionsError = useAppSelector(selectSessionsError);

  const _config = useAppSelector(selectSessionConfig);
  const _isConfigLoading = useAppSelector(selectIsConfigLoading);
  const _configError = useAppSelector(selectConfigError);

  const _activities = useAppSelector(selectSessionActivities);
  const _isActivitiesLoading = useAppSelector(selectIsActivitiesLoading);
  const _activitiesError = useAppSelector(selectActivitiesError);

  const _securityInfo = useAppSelector(selectSessionSecurityInfo);
  const _isSecurityLoading = useAppSelector(selectIsSecurityLoading);
  const _securityError = useAppSelector(selectSecurityError);

  const _analytics = useAppSelector(selectSessionAnalytics);
  const _isAnalyticsLoading = useAppSelector(selectIsAnalyticsLoading);
  const _analyticsError = useAppSelector(selectAnalyticsError);

  const _isRefreshing = useAppSelector(selectIsRefreshing);
  const _refreshError = useAppSelector(selectRefreshError);
  const _isTerminating = useAppSelector(selectIsTerminating);
  const _terminationError = useAppSelector(selectTerminationError);

  // 操作方法
  const _initialize = useCallback(async () => {
    try {
      await dispatch(initializeSession()).unwrap();
      logger.info('會話初始化成功');
    } catch (error: unknown) {
      logger.error('會話初始化失敗:', error);
      onSessionError?.(error.message || '會話初始化失敗');
    }
  }, [dispatch, onSessionError]);

  const _create = useCallback(
    async (
      userId: string,
      token: string,
      refreshToken: string,
      expiresIn: number
    ): Promise<Session> => {
      try {
        const _session = await dispatch(
          createSession({ userId, token, refreshToken, expiresIn })
        ).unwrap();
        onSessionCreated?.(session);
        logger.info('會話創建成功:', { sessionId: session.id });
        return session;
      } catch (error: unknown) {
        logger.error('會話創建失敗:', error);
        onSessionError?.(error.message || '會話創建失敗');
        throw error;
      }
    },
    [dispatch, onSessionCreated, onSessionError]
  );

  const _refresh = useCallback(
    async (request: SessionRefreshRequest) => {
      try {
        await dispatch(refreshSession(request)).unwrap();
        if (currentSession) {
          onSessionRefreshed?.(currentSession);
        }
        logger.info('會話刷新成功');
      } catch (error: unknown) {
        logger.error('會話刷新失敗:', error);
        onSessionError?.(error.message || '會話刷新失敗');
      }
    },
    [dispatch, currentSession, onSessionRefreshed, onSessionError]
  );

  const _terminate = useCallback(
    async (request?: SessionTerminationRequest) => {
      try {
        await dispatch(terminateSession(request || {})).unwrap();
        onSessionTerminated?.();
        logger.info('會話終止成功');
      } catch (error: unknown) {
        logger.error('會話終止失敗:', error);
        onSessionError?.(error.message || '會話終止失敗');
      }
    },
    [dispatch, onSessionTerminated, onSessionError]
  );

  const _getSessionsList = useCallback(async () => {
    try {
      await dispatch(getSessions()).unwrap();
      logger.info('獲取會話列表成功');
    } catch (error: unknown) {
      logger.error('獲取會話列表失敗:', error);
      onSessionError?.(error.message || '獲取會話列表失敗');
    }
  }, [dispatch, onSessionError]);

  const _getConfig = useCallback(async () => {
    try {
      const _newConfig = await dispatch(getSessionConfig()).unwrap();
      onConfigUpdated?.(newConfig);
      logger.info('獲取會話配置成功');
    } catch (error: unknown) {
      logger.error('獲取會話配置失敗:', error);
      onSessionError?.(error.message || '獲取會話配置失敗');
    }
  }, [dispatch, onConfigUpdated, onSessionError]);

  const _getActivities = useCallback(
    async (sessionId?: string) => {
      try {
        await dispatch(getSessionActivities(sessionId)).unwrap();
        logger.info('獲取會話活動成功');
      } catch (error: unknown) {
        logger.error('獲取會話活動失敗:', error);
        onSessionError?.(error.message || '獲取會話活動失敗');
      }
    },
    [dispatch, onSessionError]
  );

  const _getSecurity = useCallback(async () => {
    try {
      await dispatch(getSessionSecurityInfo()).unwrap();
      logger.info('獲取會話安全信息成功');
    } catch (error: unknown) {
      logger.error('獲取會話安全信息失敗:', error);
      onSessionError?.(error.message || '獲取會話安全信息失敗');
    }
  }, [dispatch, onSessionError]);

  const _getAnalytics = useCallback(async () => {
    try {
      await dispatch(getSessionAnalytics()).unwrap();
      logger.info('獲取會話分析成功');
    } catch (error: unknown) {
      logger.error('獲取會話分析失敗:', error);
      onSessionError?.(error.message || '獲取會話分析失敗');
    }
  }, [dispatch, onSessionError]);

  const _updateActivity = useCallback(async () => {
    try {
      await dispatch(updateSessionActivity()).unwrap();
      logger.debug('會話活動更新成功');
    } catch (error: unknown) {
      logger.error('會話活動更新失敗:', error);
    }
  }, [dispatch]);

  // 錯誤清除方法
  const _clearSessionErrorAction = useCallback(
    () => dispatch(clearSessionError()),
    [dispatch]
  );
  const _clearSessionsErrorAction = useCallback(
    () => dispatch(clearSessionsError()),
    [dispatch]
  );
  const _clearConfigErrorAction = useCallback(
    () => dispatch(clearConfigError()),
    [dispatch]
  );
  const _clearActivitiesErrorAction = useCallback(
    () => dispatch(clearActivitiesError()),
    [dispatch]
  );
  const _clearSecurityErrorAction = useCallback(
    () => dispatch(clearSecurityError()),
    [dispatch]
  );
  const _clearAnalyticsErrorAction = useCallback(
    () => dispatch(clearAnalyticsError()),
    [dispatch]
  );
  const _clearRefreshErrorAction = useCallback(
    () => dispatch(clearRefreshError()),
    [dispatch]
  );
  const _clearTerminationErrorAction = useCallback(
    () => dispatch(clearTerminationError()),
    [dispatch]
  );

  // 重置方法
  const _reset = useCallback(() => {
    dispatch(resetSession());
    logger.info('會話狀態已重置');
  }, [dispatch]);

  // 自動初始化
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize, initialize]);

  // 自動刷新
  useEffect(() => {
    if (autoRefresh && currentSession && isSessionValid) {
      const _timeUntilRefresh =
        currentSession.expiresAt.getTime() -
        Date.now() -
        config.refreshThreshold * 60 * 1000;

      if (timeUntilRefresh > 0) {
        const _timer = setTimeout(() => {
          refresh({
            refreshToken: currentSession.refreshToken,
            deviceId: currentSession.deviceInfo.deviceId,
          });
        }, timeUntilRefresh);

        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [
    autoRefresh,
    currentSession,
    isSessionValid,
    config.refreshThreshold,
    refresh,
  ]);

  // 定期更新活動
  useEffect(() => {
    if (currentSession && isSessionValid) {
      const _interval = setInterval(
        () => {
          updateActivity();
        },
        5 * 60 * 1000
      ); // 每5分鐘更新一次

      return () => clearInterval(interval);
    }
    return undefined;
  }, [currentSession, isSessionValid, updateActivity]);

  return {
    // 狀態
    currentSession,
    isSessionLoading,
    sessionError,
    isSessionValid,
    sessions,
    isSessionsLoading,
    sessionsError,
    config,
    isConfigLoading,
    configError,
    activities,
    isActivitiesLoading,
    activitiesError,
    securityInfo,
    isSecurityLoading,
    securityError,
    analytics,
    isAnalyticsLoading,
    analyticsError,
    isRefreshing,
    refreshError,
    isTerminating,
    terminationError,

    // 操作方法
    initialize,
    create,
    refresh,
    terminate,
    getSessionsList,
    getConfig,
    getActivities,
    getSecurity,
    getAnalytics,
    updateActivity,

    // 錯誤清除方法
    clearSessionError: clearSessionErrorAction,
    clearSessionsError: clearSessionsErrorAction,
    clearConfigError: clearConfigErrorAction,
    clearActivitiesError: clearActivitiesErrorAction,
    clearSecurityError: clearSecurityErrorAction,
    clearAnalyticsError: clearAnalyticsErrorAction,
    clearRefreshError: clearRefreshErrorAction,
    clearTerminationError: clearTerminationErrorAction,

    // 重置方法
    reset,
  };
};
