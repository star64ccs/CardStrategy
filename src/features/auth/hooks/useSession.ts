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

  // 會話List
  sessions: Session[];
  isSessionsLoading: boolean;
  sessionsError: string | null;

  // 會話Configure
  config: SessionConfig;
  isConfigLoading: boolean;
  configError: string | null;

  // 會話活動
  activities: SessionActivity[];
  isActivitiesLoading: boolean;
  activitiesError: string | null;

  // 安全Information
  securityInfo: SessionSecurityInfo | null;
  isSecurityLoading: boolean;
  securityError: string | null;

  // 會話Analysis
  analytics: SessionAnalytics | null;
  isAnalyticsLoading: boolean;
  analyticsError: string | null;

  // OperationStatus
  isRefreshing: boolean;
  refreshError: string | null;
  isTerminating: boolean;
  terminationError: string | null;

  // OperationMethod
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

  // ErrorClearMethod
  clearSessionError: () => void;
  clearSessionsError: () => void;
  clearConfigError: () => void;
  clearActivitiesError: () => void;
  clearSecurityError: () => void;
  clearAnalyticsError: () => void;
  clearRefreshError: () => void;
  clearTerminationError: () => void;

  // ResetMethod
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

  // OperationMethod
  const _initialize = useCallback(async () => {
    try {
      await dispatch(initializeSession()).unwrap();
      logger.info('會話InitializeSuccess');
    } catch (error: unknown) {
      logger.error('會話InitializeFailed:', error);
      onSessionError?.(error.message || '會話InitializeFailed');
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
        logger.info('會話CreateSuccess:', { sessionId: session.id });
        return session;
      } catch (error: unknown) {
        logger.error('會話CreateFailed:', error);
        onSessionError?.(error.message || '會話CreateFailed');
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
        logger.info('會話刷新Success');
      } catch (error: unknown) {
        logger.error('會話刷新Failed:', error);
        onSessionError?.(error.message || '會話刷新Failed');
      }
    },
    [dispatch, currentSession, onSessionRefreshed, onSessionError]
  );

  const _terminate = useCallback(
    async (request?: SessionTerminationRequest) => {
      try {
        await dispatch(terminateSession(request || {})).unwrap();
        onSessionTerminated?.();
        logger.info('會話終止Success');
      } catch (error: unknown) {
        logger.error('會話終止Failed:', error);
        onSessionError?.(error.message || '會話終止Failed');
      }
    },
    [dispatch, onSessionTerminated, onSessionError]
  );

  const _getSessionsList = useCallback(async () => {
    try {
      await dispatch(getSessions()).unwrap();
      logger.info('Get會話列表Success');
    } catch (error: unknown) {
      logger.error('Get會話列表Failed:', error);
      onSessionError?.(error.message || 'Get會話列表Failed');
    }
  }, [dispatch, onSessionError]);

  const _getConfig = useCallback(async () => {
    try {
      const _newConfig = await dispatch(getSessionConfig()).unwrap();
      onConfigUpdated?.(newConfig);
      logger.info('Get會話ConfigureSuccess');
    } catch (error: unknown) {
      logger.error('Get會話ConfigureFailed:', error);
      onSessionError?.(error.message || 'Get會話ConfigureFailed');
    }
  }, [dispatch, onConfigUpdated, onSessionError]);

  const _getActivities = useCallback(
    async (sessionId?: string) => {
      try {
        await dispatch(getSessionActivities(sessionId)).unwrap();
        logger.info('Get會話活動Success');
      } catch (error: unknown) {
        logger.error('Get會話活動Failed:', error);
        onSessionError?.(error.message || 'Get會話活動Failed');
      }
    },
    [dispatch, onSessionError]
  );

  const _getSecurity = useCallback(async () => {
    try {
      await dispatch(getSessionSecurityInfo()).unwrap();
      logger.info('Get會話安全信息Success');
    } catch (error: unknown) {
      logger.error('Get會話安全信息Failed:', error);
      onSessionError?.(error.message || 'Get會話安全信息Failed');
    }
  }, [dispatch, onSessionError]);

  const _getAnalytics = useCallback(async () => {
    try {
      await dispatch(getSessionAnalytics()).unwrap();
      logger.info('Get會話分析Success');
    } catch (error: unknown) {
      logger.error('Get會話分析Failed:', error);
      onSessionError?.(error.message || 'Get會話分析Failed');
    }
  }, [dispatch, onSessionError]);

  const _updateActivity = useCallback(async () => {
    try {
      await dispatch(updateSessionActivity()).unwrap();
      logger.debug('會話活動UpdateSuccess');
    } catch (error: unknown) {
      logger.error('會話活動UpdateFailed:', error);
    }
  }, [dispatch]);

  // ErrorClearMethod
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

  // ResetMethod
  const _reset = useCallback(() => {
    dispatch(resetSession());
    logger.info('會話狀態已重置');
  }, [dispatch]);

  // AutoInitialize
  useEffect(() => {
    if (autoInitialize) {
      initialize();
    }
  }, [autoInitialize, initialize]);

  // AutoRefresh
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

  // 定期Update活動
  useEffect(() => {
    if (currentSession && isSessionValid) {
      const _interval = setInterval(
        () => {
          updateActivity();
        },
        5 * 60 * 1000
      ); // 每5MinuteUpdate一次

      return () => clearInterval(interval);
    }
    return undefined;
  }, [currentSession, isSessionValid, updateActivity]);

  return {
    // Status
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

    // OperationMethod
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

    // ErrorClearMethod
    clearSessionError: clearSessionErrorAction,
    clearSessionsError: clearSessionsErrorAction,
    clearConfigError: clearConfigErrorAction,
    clearActivitiesError: clearActivitiesErrorAction,
    clearSecurityError: clearSecurityErrorAction,
    clearAnalyticsError: clearAnalyticsErrorAction,
    clearRefreshError: clearRefreshErrorAction,
    clearTerminationError: clearTerminationErrorAction,

    // ResetMethod
    reset,
  };
};
