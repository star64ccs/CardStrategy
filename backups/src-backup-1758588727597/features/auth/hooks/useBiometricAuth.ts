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
  // 狀態
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

  // 操作方法
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

  // 清除方法
  clearResult: () => void;
  clearError: () => void;
  clearCapabilityError: () => void;
  clearSettingsError: () => void;
  clearEnrollmentError: () => void;
  clearSecurityError: () => void;
  reset: () => void;

  // 工具方法
  isAvailable: () => boolean;
  isEnabled: () => boolean;
  getAvailableTypes: () => BiometricType[];
  getEnabledTypes: () => BiometricType[];
  isTypeAvailable: (type: BiometricType) => boolean;
  isTypeEnabled: (type: BiometricType) => boolean;
  canAuthenticate: () => boolean;
}

export const useBiometricAuth = (
  options: UseBiometricAuthOptions = {}
): UseBiometricAuthReturn => {
  const dispatch = useAppDispatch();
  const {
    onAuthSuccess,
    onAuthError,
    onCapabilityDetected,
    onSettingsChanged,
    autoDetectCapabilities = true,
    autoLoadSettings = true,
  } = options;

  // 從 Redux 獲取狀態
  const capabilities = useSelector(selectCapabilities);
  const isCapabilityLoading = useSelector(selectIsCapabilityLoading);
  const capabilityError = useSelector(selectCapabilityError);
  const isAuthenticating = useSelector(selectIsAuthenticating);
  const authResult = useSelector(selectAuthResult);
  const authError = useSelector(selectAuthError);
  const settings = useSelector(selectBiometricSettings);
  const isSettingsLoading = useSelector(selectIsSettingsLoading);
  const settingsError = useSelector(selectSettingsError);
  const enrollmentStatus = useSelector(selectEnrollmentStatus);
  const isEnrollmentLoading = useSelector(selectIsEnrollmentLoading);
  const enrollmentError = useSelector(selectEnrollmentError);
  const securityInfo = useSelector(selectSecurityInfo);
  const isSecurityLoading = useSelector(selectIsSecurityLoading);
  const securityError = useSelector(selectSecurityError);

  // 本地狀態
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化
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

  // 處理認證成功
  useEffect(() => {
    if (authResult && authResult.success && onAuthSuccess) {
      onAuthSuccess(authResult);
    }
  }, [authResult, onAuthSuccess]);

  // 處理認證錯誤
  useEffect(() => {
    if (authError && onAuthError) {
      onAuthError(authError);
    }
  }, [authError, onAuthError]);

  // 處理能力檢測
  useEffect(() => {
    if (capabilities.length > 0 && onCapabilityDetected) {
      onCapabilityDetected(capabilities);
    }
  }, [capabilities, onCapabilityDetected]);

  // 處理設置變更
  useEffect(() => {
    if (onSettingsChanged) {
      onSettingsChanged(settings);
    }
  }, [settings, onSettingsChanged]);

  // 檢測生物識別能力
  const detectCapabilities = useCallback(async (): Promise<
    BiometricCapability[]
  > => {
    try {
      const caps = await dispatch(detectBiometricCapabilities()).unwrap();
      logger.info('生物識別能力檢測成功:', { capabilities: caps });
      return caps;
    } catch (error: unknown) {
      logger.error('生物識別能力檢測失敗:', { error });
      throw error;
    }
  }, [dispatch]);

  // 執行生物識別認證
  const authenticate = useCallback(
    async (
      request: BiometricAuthRequest = {}
    ): Promise<BiometricAuthResult> => {
      try {
        const result = await dispatch(
          authenticateWithBiometric(request)
        ).unwrap();
        logger.info('生物識別認證成功:', { result });
        return result;
      } catch (error: unknown) {
        logger.error('生物識別認證失敗:', { error });
        throw error;
      }
    },
    [dispatch]
  );

  // 創建生物識別密鑰
  const createKeys = useCallback(async (): Promise<boolean> => {
    try {
      const result = await dispatch(createBiometricKeys()).unwrap();
      logger.info('生物識別密鑰創建成功');
      return result;
    } catch (error: unknown) {
      logger.error('生物識別密鑰創建失敗:', { error });
      throw error;
    }
  }, [dispatch]);

  // 檢查生物識別密鑰
  const checkKeys = useCallback(async (): Promise<boolean> => {
    try {
      const exists = await dispatch(checkBiometricKeys()).unwrap();
      logger.info('生物識別密鑰檢查:', { exists });
      return exists;
    } catch (error: unknown) {
      logger.error('生物識別密鑰檢查失敗:', { error });
      throw error;
    }
  }, [dispatch]);

  // 刪除生物識別密鑰
  const deleteKeys = useCallback(async (): Promise<boolean> => {
    try {
      const result = await dispatch(deleteBiometricKeys()).unwrap();
      logger.info('生物識別密鑰刪除成功');
      return result;
    } catch (error: unknown) {
      logger.error('生物識別密鑰刪除失敗:', { error });
      throw error;
    }
  }, [dispatch]);

  // 創建生物識別簽名
  const createSignature = useCallback(
    async (payload: string, promptMessage?: string): Promise<string> => {
      try {
        const signature = await dispatch(
          createBiometricSignature({ payload, promptMessage })
        ).unwrap();
        logger.info('生物識別簽名創建成功');
        return signature;
      } catch (error: unknown) {
        logger.error('生物識別簽名創建失敗:', { error });
        throw error;
      }
    },
    [dispatch]
  );

  // 加載設置
  const loadSettings = useCallback(async (): Promise<BiometricSettings> => {
    try {
      const settingsData = await dispatch(getBiometricSettings()).unwrap();
      logger.info('生物識別設置加載成功:', { settings: settingsData });
      return settingsData;
    } catch (error: unknown) {
      logger.error('生物識別設置加載失敗:', { error });
      throw error;
    }
  }, [dispatch]);

  // 保存設置
  const saveSettings = useCallback(
    async (
      newSettings: Partial<BiometricSettings>
    ): Promise<BiometricSettings> => {
      try {
        const updatedSettings = await dispatch(
          updateBiometricSettings(newSettings)
        ).unwrap();
        logger.info('生物識別設置保存成功:', { settings: updatedSettings });
        return updatedSettings;
      } catch (error: unknown) {
        logger.error('生物識別設置保存失敗:', { error });
        throw error;
      }
    },
    [dispatch]
  );

  // 加載註冊狀態
  const loadEnrollmentStatus =
    useCallback(async (): Promise<BiometricEnrollmentStatus> => {
      try {
        const status = await dispatch(getEnrollmentStatus()).unwrap();
        logger.info('生物識別註冊狀態加載成功:', { status });
        return status;
      } catch (error: unknown) {
        logger.error('生物識別註冊狀態加載失敗:', { error });
        throw error;
      }
    }, [dispatch]);

  // 加載安全信息
  const loadSecurityInfo =
    useCallback(async (): Promise<BiometricSecurityInfo> => {
      try {
        const info = await dispatch(getSecurityInfo()).unwrap();
        logger.info('生物識別安全信息加載成功:', { info });
        return info;
      } catch (error: unknown) {
        logger.error('生物識別安全信息加載失敗:', { error });
        throw error;
      }
    }, [dispatch]);

  // 檢查可用性
  const checkAvailability = useCallback(async (): Promise<boolean> => {
    try {
      const available = await dispatch(checkBiometricAvailability()).unwrap();
      logger.info('生物識別可用性檢查:', { available });
      return available;
    } catch (error: unknown) {
      logger.error('生物識別可用性檢查失敗:', { error });
      throw error;
    }
  }, [dispatch]);

  // 清除結果
  const clearResult = useCallback(() => {
    dispatch(clearAuthResult());
  }, [dispatch]);

  // 清除錯誤
  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // 清除能力錯誤
  const clearCapabilityErrorInternal = useCallback(() => {
    dispatch(clearCapabilityError());
  }, [dispatch]);

  // 清除設置錯誤
  const clearSettingsErrorInternal = useCallback(() => {
    dispatch(clearSettingsError());
  }, [dispatch]);

  // 清除註冊錯誤
  const clearEnrollmentErrorInternal = useCallback(() => {
    dispatch(clearEnrollmentError());
  }, [dispatch]);

  // 清除安全錯誤
  const clearSecurityErrorInternal = useCallback(() => {
    dispatch(clearSecurityError());
  }, [dispatch]);

  // 重置
  const reset = useCallback(() => {
    dispatch(resetBiometricAuth());
  }, [dispatch]);

  // 檢查是否可用
  const isAvailable = useCallback((): boolean => {
    return capabilities.some(cap => cap.isAvailable && cap.isEnrolled);
  }, [capabilities]);

  // 檢查是否啟用
  const isEnabled = useCallback((): boolean => {
    return settings.isEnabled;
  }, [settings]);

  // 獲取可用類型
  const getAvailableTypes = useCallback((): BiometricType[] => {
    return capabilities
      .filter(cap => cap.isAvailable && cap.isEnrolled)
      .map(cap => cap.type);
  }, [capabilities]);

  // 獲取啟用類型
  const getEnabledTypes = useCallback((): BiometricType[] => {
    return settings.enabledTypes;
  }, [settings]);

  // 檢查類型是否可用
  const isTypeAvailable = useCallback(
    (type: BiometricType): boolean => {
      const capability = capabilities.find(cap => cap.type === type);
      return !!(capability && capability.isAvailable && capability.isEnrolled);
    },
    [capabilities]
  );

  // 檢查類型是否啟用
  const isTypeEnabled = useCallback(
    (type: BiometricType): boolean => {
      return settings.enabledTypes.includes(type);
    },
    [settings]
  );

  // 檢查是否可以認證
  const canAuthenticate = useCallback((): boolean => {
    return isEnabled() && isAvailable() && getEnabledTypes().length > 0;
  }, [isEnabled, isAvailable, getEnabledTypes]);

  return {
    // 狀態
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

    // 操作方法
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

    // 清除方法
    clearResult,
    clearError,
    clearCapabilityError: clearCapabilityErrorInternal,
    clearSettingsError: clearSettingsErrorInternal,
    clearEnrollmentError: clearEnrollmentErrorInternal,
    clearSecurityError: clearSecurityErrorInternal,
    reset,

    // 工具方法
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
