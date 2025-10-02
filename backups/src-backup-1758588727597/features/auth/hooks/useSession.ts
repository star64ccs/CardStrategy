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

export const useSession = (
  options: UseSessionOptions = {}
): UseSessionReturn => {
  const dispatch = useAppDispatch();
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
  const currentSession = useAppSelector(selectCurrentSession);
  const isSessionLoading = useAppSelector(selectIsSessionLoading);
  const sessionError = useAppSelector(selectSessionError);
  const isSessionValid = useAppSelector(selectIsSessionValid);

  const sessions = useAppSelector(selectSessions);
  const isSessionsLoading = useAppSelector(selectIsSessionsLoading);
  const sessionsError = useAppSelector(selectSessionsError);

  const config = useAppSelector(selectSessionConfig);
  const isConfigLoading = useAppSelector(selectIsConfigLoading);
  const configError = useAppSelector(selectConfigError);

  const activities = useAppSelector(selectSessionActivities);
  const isActivitiesLoading = useAppSelector(selectIsActivitiesLoading);
  const activitiesError = useAppSelector(selectActivitiesError);

  const securityInfo = useAppSelector(selectSessionSecurityInfo);
  const isSecurityLoading = useAppSelector(selectIsSecurityLoading);
  const securityError = useAppSelector(selectSecurityError);

  const analytics = useAppSelector(selectSessionAnalytics);
  const isAnalyticsLoading = useAppSelector(selectIsAnalyticsLoading);
  const analyticsError = useAppSelector(selectAnalyticsError);

  const isRefreshing = useAppSelector(selectIsRefreshing);
  const refreshError = useAppSelector(selectRefreshError);
  const isTerminating = useAppSelector(selectIsTerminating);
  const terminationError = useAppSelector(selectTerminationError);

  // 操作方法
  const initialize = useCallback(async () => {
    try {
      await dispatch(initializeSession()).unwrap();
      logger.info('會話初始化成功');
    } catch (error: unknown) {
      logger.error('會話初始化失敗:', error);
      onSessionError?.(error.message || '會話初始化失敗');
    }
  }, [dispatch, onSessionError]);

  const create = useCallback(
    async (
      userId: string,
      token: string,
      refreshToken: string,
      expiresIn: number
    ): Promise<Session> => {
      try {
        const session = await dispatch(
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

  const refresh = useCallback(
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

  const terminate = useCallback(
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

  const getSessionsList = useCallback(async () => {
    try {
      await dispatch(getSessions()).unwrap();
      logger.info('獲取會話列表成功');
    } catch (error: unknown) {
      logger.error('獲取會話列表失敗:', error);
      onSessionError?.(error.message || '獲取會話列表失敗');
    }
  }, [dispatch, onSessionError]);

  const getConfig = useCallback(async () => {
    try {
      const newConfig = await dispatch(getSessionConfig()).unwrap();
      onConfigUpdated?.(newConfig);
      logger.info('獲取會話配置成功');
    } catch (error: unknown) {
      logger.error('獲取會話配置失敗:', error);
      onSessionError?.(error.message || '獲取會話配置失敗');
    }
  }, [dispatch, onConfigUpdated, onSessionError]);

  const getActivities = useCallback(
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

  const getSecurity = useCallback(async () => {
    try {
      await dispatch(getSessionSecurityInfo()).unwrap();
      logger.info('獲取會話安全信息成功');
    } catch (error: unknown) {
      logger.error('獲取會話安全信息失敗:', error);
      onSessionError?.(error.message || '獲取會話安全信息失敗');
    }
  }, [dispatch, onSessionError]);

  const getAnalytics = useCallback(async () => {
    try {
      await dispatch(getSessionAnalytics()).unwrap();
      logger.info('獲取會話分析成功');
    } catch (error: unknown) {
      logger.error('獲取會話分析失敗:', error);
      onSessionError?.(error.message || '獲取會話分析失敗');
    }
  }, [dispatch, onSessionError]);

  const updateActivity = useCallback(async () => {
    try {
      await dispatch(updateSessionActivity()).unwrap();
      logger.debug('會話活動更新成功');
    } catch (error: unknown) {
      logger.error('會話活動更新失敗:', error);
    }
  }, [dispatch]);

  // 錯誤清除方法
  const clearSessionErrorAction = useCallback(
    () => dispatch(clearSessionError()),
    [dispatch]
  );
  const clearSessionsErrorAction = useCallback(
    () => dispatch(clearSessionsError()),
    [dispatch]
  );
  const clearConfigErrorAction = useCallback(
    () => dispatch(clearConfigError()),
    [dispatch]
  );
  const clearActivitiesErrorAction = useCallback(
    () => dispatch(clearActivitiesError()),
    [dispatch]
  );
  const clearSecurityErrorAction = useCallback(
    () => dispatch(clearSecurityError()),
    [dispatch]
  );
  const clearAnalyticsErrorAction = useCallback(
    () => dispatch(clearAnalyticsError()),
    [dispatch]
  );
  const clearRefreshErrorAction = useCallback(
    () => dispatch(clearRefreshError()),
    [dispatch]
  );
  const clearTerminationErrorAction = useCallback(
    () => dispatch(clearTerminationError()),
    [dispatch]
  );

  // 重置方法
  const reset = useCallback(() => {
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
      const timeUntilRefresh =
        currentSession.expiresAt.getTime() -
        Date.now() -
        config.refreshThreshold * 60 * 1000;

      if (timeUntilRefresh > 0) {
        const timer = setTimeout(() => {
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
      const interval = setInterval(
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
