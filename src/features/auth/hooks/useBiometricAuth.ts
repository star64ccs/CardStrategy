import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import type {
  BiometricCapability,
  BiometricAuthRequest,
  BiometricAuthResult,
  BiometricSettings,
  BiometricEnrollmentStatus,
  BiometricSecurityInfo,
  BiometricType,
} from '../../../core/types';
import { logger } from '../../../core/utils/logger';
import { useAppDispatch } from '../../../store/hooks';
import {
  detectBiometricCapabilities,
  authenticateWithBiometric,
  createBiometricKeys,
  checkBiometricKeys,
  deleteBiometricKeys,
  createBiometricSignature,
  getBiometricSettings,
  updateBiometricSettings,
  getEnrollmentStatus,
  getSecurityInfo,
  checkBiometricAvailability,
  clearAuthResult,
  clearAuthError,
  clearCapabilityError,
  clearSettingsError,
  clearEnrollmentError,
  clearSecurityError,
  resetBiometricAuth,
  setAuthenticating,
  updateLocalSettings,
  selectBiometricAuth,
  selectCapabilities,
  selectIsCapabilityLoading,
  selectCapabilityError,
  selectIsAuthenticating,
  selectAuthResult,
  selectAuthError,
  selectBiometricSettings,
  selectIsSettingsLoading,
  selectSettingsError,
  selectEnrollmentStatus,
  selectIsEnrollmentLoading,
  selectEnrollmentError,
  selectSecurityInfo,
  selectIsSecurityLoading,
  selectSecurityError,
} from '../../../store/slices/biometricAuthSlice';

interface UseBiometricAuthOptions {
  onAuthSuccess?: (result: BiometricAuthResult) => void;
  onAuthError?: (error: string) => void;
  onCapabilityDetected?: (capabilities: BiometricCapability[]) => void;
  onSettingsChanged?: (settings: BiometricSettings) => void;
  autoDetectCapabilities?: boolean;
  autoLoadSettings?: boolean;
}

interface UseBiometricAuthReturn {
  // Status
  capabilities: BiometricCapability[];
  isCapabilityLoading: boolean;
  capabilityError: string | null;
  isAuthenticating: boolean;
  authResult: BiometricAuthResult | null;
  authError: string | null;
  settings: BiometricSettings;
  isSettingsLoading: boolean;
  settingsError: string | null;
  enrollmentStatus: BiometricEnrollmentStatus | null;
  isEnrollmentLoading: boolean;
  enrollmentError: string | null;
  securityInfo: BiometricSecurityInfo | null;
  isSecurityLoading: boolean;
  securityError: string | null;

  // OperationMethod
  detectCapabilities: () => Promise<BiometricCapability[]>;
  authenticate: (
    request?: BiometricAuthRequest
  ) => Promise<BiometricAuthResult>;
  createKeys: () => Promise<boolean>;
  checkKeys: () => Promise<boolean>;
  deleteKeys: () => Promise<boolean>;
  createSignature: (payload: string, promptMessage?: string) => Promise<string>;
  loadSettings: () => Promise<BiometricSettings>;
  saveSettings: (
    settings: Partial<BiometricSettings>
  ) => Promise<BiometricSettings>;
  loadEnrollmentStatus: () => Promise<BiometricEnrollmentStatus>;
  loadSecurityInfo: () => Promise<BiometricSecurityInfo>;
  checkAvailability: () => Promise<boolean>;

  // ClearMethod
  clearResult: () => void;
  clearError: () => void;
  clearCapabilityError: () => void;
  clearSettingsError: () => void;
  clearEnrollmentError: () => void;
  clearSecurityError: () => void;
  reset: () => void;

  // ToolMethod
  isAvailable: () => boolean;
  isEnabled: () => boolean;
  getAvailableTypes: () => BiometricType[];
  getEnabledTypes: () => BiometricType[];
  isTypeAvailable: (type: BiometricType) => boolean;
  isTypeEnabled: (type: BiometricType) => boolean;
  canAuthenticate: () => boolean;
}

export const _useBiometricAuth = (
  options: UseBiometricAuthOptions = {}
): UseBiometricAuthReturn => {
  const _dispatch = useAppDispatch();
  const {
    onAuthSuccess,
    onAuthError,
    onCapabilityDetected,
    onSettingsChanged,
    autoDetectCapabilities = true,
    autoLoadSettings = true,
  } = options;

  // 從 Redux GetStatus
  const _capabilities = useSelector(selectCapabilities);
  const _isCapabilityLoading = useSelector(selectIsCapabilityLoading);
  const _capabilityError = useSelector(selectCapabilityError);
  const _isAuthenticating = useSelector(selectIsAuthenticating);
  const _authResult = useSelector(selectAuthResult);
  const _authError = useSelector(selectAuthError);
  const _settings = useSelector(selectBiometricSettings);
  const _isSettingsLoading = useSelector(selectIsSettingsLoading);
  const _settingsError = useSelector(selectSettingsError);
  const _enrollmentStatus = useSelector(selectEnrollmentStatus);
  const _isEnrollmentLoading = useSelector(selectIsEnrollmentLoading);
  const _enrollmentError = useSelector(selectEnrollmentError);
  const _securityInfo = useSelector(selectSecurityInfo);
  const _isSecurityLoading = useSelector(selectIsSecurityLoading);
  const _securityError = useSelector(selectSecurityError);

  // LocalStatus
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize
  useEffect(() => {
    if (!isInitialized) {
      if (autoDetectCapabilities) {
        detectCapabilities();
      }
      if (autoLoadSettings) {
        loadSettings();
        loadEnrollmentStatus();
        loadSecurityInfo();
      }
      setIsInitialized(true);
    }
  }, [isInitialized, autoDetectCapabilities, autoLoadSettings]);

  // HandleAuthenticateSuccess
  useEffect(() => {
    if (authResult && authResult.success && onAuthSuccess) {
      onAuthSuccess(authResult);
    }
  }, [authResult, onAuthSuccess]);

  // HandleAuthenticateError
  useEffect(() => {
    if (authError && onAuthError) {
      onAuthError(authError);
    }
  }, [authError, onAuthError]);

  // Handle能力檢測
  useEffect(() => {
    if (capabilities.length > 0 && onCapabilityDetected) {
      onCapabilityDetected(capabilities);
    }
  }, [capabilities, onCapabilityDetected]);

  // HandleSettings變更
  useEffect(() => {
    if (onSettingsChanged) {
      onSettingsChanged(settings);
    }
  }, [settings, onSettingsChanged]);

  // 檢測生物識別能力
  const _detectCapabilities = useCallback(async (): Promise<
    BiometricCapability[]
  > => {
    try {
      const _caps = await dispatch(detectBiometricCapabilities()).unwrap();
      logger.info('生物識別能力檢測Success:', { capabilities: caps });
      return caps;
    } catch (error: unknown) {
      logger.error('生物識別能力檢測Failed:', { error });
      throw error;
    }
  }, [dispatch]);

  // 執Row生物識別Authenticate
  const _authenticate = useCallback(
    async (
      request: BiometricAuthRequest = {}
    ): Promise<BiometricAuthResult> => {
      try {
        const _result = await dispatch(
          authenticateWithBiometric(request)
        ).unwrap();
        logger.info('生物識別認證Success:', { result });
        return result;
      } catch (error: unknown) {
        logger.error('生物識別認證Failed:', { error });
        throw error;
      }
    },
    [dispatch]
  );

  // Create生物識別密鑰
  const _createKeys = useCallback(async (): Promise<boolean> => {
    try {
      const _result = await dispatch(createBiometricKeys()).unwrap();
      logger.info('生物識別密鑰CreateSuccess');
      return result;
    } catch (error: unknown) {
      logger.error('生物識別密鑰CreateFailed:', { error });
      throw error;
    }
  }, [dispatch]);

  // Check生物識別密鑰
  const _checkKeys = useCallback(async (): Promise<boolean> => {
    try {
      const _exists = await dispatch(checkBiometricKeys()).unwrap();
      logger.info('生物識別密鑰檢查:', { exists });
      return exists;
    } catch (error: unknown) {
      logger.error('生物識別密鑰CheckFailed:', { error });
      throw error;
    }
  }, [dispatch]);

  // Delete生物識別密鑰
  const _deleteKeys = useCallback(async (): Promise<boolean> => {
    try {
      const _result = await dispatch(deleteBiometricKeys()).unwrap();
      logger.info('生物識別密鑰DeleteSuccess');
      return result;
    } catch (error: unknown) {
      logger.error('生物識別密鑰DeleteFailed:', { error });
      throw error;
    }
  }, [dispatch]);

  // Create生物識別Sign
  const _createSignature = useCallback(
    async (payload: string, promptMessage?: string): Promise<string> => {
      try {
        const _signature = await dispatch(
          createBiometricSignature({ payload, promptMessage })
        ).unwrap();
        logger.info('生物識別簽名CreateSuccess');
        return signature;
      } catch (error: unknown) {
        logger.error('生物識別簽名CreateFailed:', { error });
        throw error;
      }
    },
    [dispatch]
  );

  // 加載Settings
  const _loadSettings = useCallback(async (): Promise<BiometricSettings> => {
    try {
      const _settingsData = await dispatch(getBiometricSettings()).unwrap();
      logger.info('生物識別Settings加載Success:', { settings: settingsData });
      return settingsData;
    } catch (error: unknown) {
      logger.error('生物識別Settings加載Failed:', { error });
      throw error;
    }
  }, [dispatch]);

  // SaveSettings
  const _saveSettings = useCallback(
    async (
      newSettings: Partial<BiometricSettings>
    ): Promise<BiometricSettings> => {
      try {
        const _updatedSettings = await dispatch(
          updateBiometricSettings(newSettings)
        ).unwrap();
        logger.info('生物識別Settings保存Success:', { settings: updatedSettings });
        return updatedSettings;
      } catch (error: unknown) {
        logger.error('生物識別Settings保存Failed:', { error });
        throw error;
      }
    },
    [dispatch]
  );

  // 加載RegisterStatus
  const _loadEnrollmentStatus =
    useCallback(async (): Promise<BiometricEnrollmentStatus> => {
      try {
        const _status = await dispatch(getEnrollmentStatus()).unwrap();
        logger.info('生物識別註冊狀態加載Success:', { status });
        return status;
      } catch (error: unknown) {
        logger.error('生物識別註冊狀態加載Failed:', { error });
        throw error;
      }
    }, [dispatch]);

  // 加載安全Information
  const _loadSecurityInfo =
    useCallback(async (): Promise<BiometricSecurityInfo> => {
      try {
        const _info = await dispatch(getSecurityInfo()).unwrap();
        logger.info('生物識別安全信息加載Success:', { info });
        return info;
      } catch (error: unknown) {
        logger.error('生物識別安全信息加載Failed:', { error });
        throw error;
      }
    }, [dispatch]);

  // Check可用性
  const _checkAvailability = useCallback(async (): Promise<boolean> => {
    try {
      const _available = await dispatch(checkBiometricAvailability()).unwrap();
      logger.info('生物識別可用性檢查:', { available });
      return available;
    } catch (error: unknown) {
      logger.error('生物識別可用性CheckFailed:', { error });
      throw error;
    }
  }, [dispatch]);

  // Clear結果
  const _clearResult = useCallback(() => {
    dispatch(clearAuthResult());
  }, [dispatch]);

  // ClearError
  const _clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Clear能力Error
  const _clearCapabilityErrorInternal = useCallback(() => {
    dispatch(clearCapabilityError());
  }, [dispatch]);

  // ClearSettingsError
  const _clearSettingsErrorInternal = useCallback(() => {
    dispatch(clearSettingsError());
  }, [dispatch]);

  // ClearRegisterError
  const _clearEnrollmentErrorInternal = useCallback(() => {
    dispatch(clearEnrollmentError());
  }, [dispatch]);

  // Clear安全Error
  const _clearSecurityErrorInternal = useCallback(() => {
    dispatch(clearSecurityError());
  }, [dispatch]);

  // Reset
  const _reset = useCallback(() => {
    dispatch(resetBiometricAuth());
  }, [dispatch]);

  // CheckYesNo可用
  const _isAvailable = useCallback((): boolean => {
    return capabilities.some(cap => cap.isAvailable && cap.isEnrolled);
  }, [capabilities]);

  // CheckYesNoEnable
  const _isEnabled = useCallback((): boolean => {
    return settings.isEnabled;
  }, [settings]);

  // Get可用Class型
  const _getAvailableTypes = useCallback((): BiometricType[] => {
    return capabilities
      .filter(cap => cap.isAvailable && cap.isEnrolled)
      .map(cap => cap.type);
  }, [capabilities]);

  // GetEnableClass型
  const _getEnabledTypes = useCallback((): BiometricType[] => {
    return settings.enabledTypes;
  }, [settings]);

  // CheckClass型YesNo可用
  const _isTypeAvailable = useCallback(
    (type: BiometricType): boolean => {
      const _capability = capabilities.find(cap => cap.type === type);
      return !!(capability && capability.isAvailable && capability.isEnrolled);
    },
    [capabilities]
  );

  // CheckClass型YesNoEnable
  const _isTypeEnabled = useCallback(
    (type: BiometricType): boolean => {
      return settings.enabledTypes.includes(type);
    },
    [settings]
  );

  // CheckYesNo可以Authenticate
  const _canAuthenticate = useCallback((): boolean => {
    return isEnabled() && isAvailable() && getEnabledTypes().length > 0;
  }, [isEnabled, isAvailable, getEnabledTypes]);

  return {
    // Status
    capabilities,
    isCapabilityLoading,
    capabilityError,
    isAuthenticating,
    authResult,
    authError,
    settings,
    isSettingsLoading,
    settingsError,
    enrollmentStatus,
    isEnrollmentLoading,
    enrollmentError,
    securityInfo,
    isSecurityLoading,
    securityError,

    // OperationMethod
    detectCapabilities,
    authenticate,
    createKeys,
    checkKeys,
    deleteKeys,
    createSignature,
    loadSettings,
    saveSettings,
    loadEnrollmentStatus,
    loadSecurityInfo,
    checkAvailability,

    // ClearMethod
    clearResult,
    clearError,
    clearCapabilityError: clearCapabilityErrorInternal,
    clearSettingsError: clearSettingsErrorInternal,
    clearEnrollmentError: clearEnrollmentErrorInternal,
    clearSecurityError: clearSecurityErrorInternal,
    reset,

    // ToolMethod
    isAvailable,
    isEnabled,
    getAvailableTypes,
    getEnabledTypes,
    isTypeAvailable,
    isTypeEnabled,
    canAuthenticate,
  };
};

export default useBiometricAuth;
