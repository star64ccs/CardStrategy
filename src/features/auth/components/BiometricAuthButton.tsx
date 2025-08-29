import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';

import type { BiometricAuthRequest, BiometricType } from '../../../core/types';
import { useAppDispatch } from '../../../store/hooks';
import {
  authenticateWithBiometric,
  detectBiometricCapabilities,
  selectCapabilities,
  selectIsAuthenticating,
  selectAuthResult,
  selectAuthError,
  selectIsCapabilityLoading,
  clearAuthError,
  clearAuthResult,
} from '../../../store/slices/biometricAuthSlice';

interface BiometricAuthButtonProps {
  onAuthSuccess?: (result: unknown) => void;
  onAuthError?: (error: string) => void;
  onCapabilityDetected?: (capabilities: unknown[]) => void;
  request?: BiometricAuthRequest;
  style?: unknown;
  buttonStyle?: unknown;
  textStyle?: unknown;
  disabled?: boolean;
  showCapabilityInfo?: boolean;
}

interface BiometricTypeConfig {
  name: string;
  icon: string;
  color: string;
  description: string;
}

const BIOMETRIC_TYPE_CONFIG: Record<BiometricType, BiometricTypeConfig> = {
  fingerprint: {
    name: '指紋',
    icon: '👆',
    color: '#4CAF50',
    description: '使用指紋進行認證',
  },
  faceId: {
    name: 'Face ID',
    icon: '👤',
    color: '#2196F3',
    description: '使用面部識別進行認證',
  },
  touchId: {
    name: 'Touch ID',
    icon: '👆',
    color: '#FF9800',
    description: '使用 Touch ID 進行認證',
  },
  voiceId: {
    name: '聲紋',
    icon: '🎤',
    color: '#9C27B0',
    description: '使用聲紋進行認證',
  },
  iris: {
    name: '虹膜',
    icon: '👁️',
    color: '#607D8B',
    description: '使用虹膜進行認證',
  },
  palm: {
    name: '掌紋',
    icon: '🖐️',
    color: '#795548',
    description: '使用掌紋進行認證',
  },
};

export const BiometricAuthButton: React.FC<BiometricAuthButtonProps> = ({
  onAuthSuccess,
  onAuthError,
  onCapabilityDetected,
  request = {},
  style,
  buttonStyle,
  textStyle,
  disabled = false,
  showCapabilityInfo = true,
}) => {
  const _dispatch = useAppDispatch();
  const _capabilities = useSelector(selectCapabilities);
  const _isAuthenticating = useSelector(selectIsAuthenticating);
  const _authResult = useSelector(selectAuthResult);
  const _authError = useSelector(selectAuthError);
  const _isCapabilityLoading = useSelector(selectIsCapabilityLoading);

  const [availableTypes, setAvailableTypes] = useState<BiometricType[]>([]);

  useEffect(() => {
    // 初始檢測生物識別能力
    dispatch(detectBiometricCapabilities());
  }, [dispatch]);

  useEffect(() => {
    // 處理能力檢測結果
    if (capabilities.length > 0) {
      const _available = capabilities
        .filter(cap => cap.isAvailable && cap.isEnrolled)
        .map(cap => cap.type);

      setAvailableTypes(available);
      onCapabilityDetected?.(capabilities);
    }
  }, [capabilities, onCapabilityDetected]);

  useEffect(() => {
    // 處理認證成功
    if (authResult && authResult.success) {
      onAuthSuccess?.(authResult);
      dispatch(clearAuthResult());
    }
  }, [authResult, onAuthSuccess, dispatch]);

  useEffect(() => {
    // 處理認證錯誤
    if (authError) {
      onAuthError?.(authError);
      Alert.alert('認證失敗', authError);
      dispatch(clearAuthError());
    }
  }, [authError, onAuthError, dispatch]);

  /**
   * 執行生物識別認證
   */
  const _handleAuthenticate = async () => {
    try {
      if (availableTypes.length === 0) {
        Alert.alert('不可用', '沒有可用的生物識別方式');
        return;
      }

      const authRequest: BiometricAuthRequest = {
        promptMessage: '請進行生物識別認證',
        cancelButtonText: '取消',
        fallbackButtonText: '使用密碼',
        disableDeviceFallback: false,
        allowedAuthenticators: availableTypes,
        ...request,
      };

      await dispatch(authenticateWithBiometric(authRequest)).unwrap();
    } catch (error: unknown) {
      console.error('生物識別認證失敗:', error);
    }
  };

  /**
   * 獲取主要生物識別類型
   */
  const _getPrimaryBiometricType = (): BiometricType | null => {
    if (availableTypes.length === 0) return null;

    // 優先級: faceId > touchId > fingerprint > 其他
    const priority: BiometricType[] = [
      'faceId',
      'touchId',
      'fingerprint',
      'iris',
      'voiceId',
      'palm',
    ];

    for (const type of priority) {
      if (availableTypes.includes(type)) {
        return type;
      }
    }

    return availableTypes[0];
  };

  /**
   * 渲染能力信息
   */
  const _renderCapabilityInfo = () => {
    if (!showCapabilityInfo || isCapabilityLoading) return null;

    return (
      <View style={styles.capabilityInfo}>
        <Text style={styles.capabilityTitle}>可用的生物識別方式:</Text>
        {availableTypes.length > 0 ? (
          availableTypes.map(type => {
            const _config = BIOMETRIC_TYPE_CONFIG[type];
            return (
              <View key={type} style={styles.capabilityItem}>
                <Text style={styles.capabilityIcon}>{config.icon}</Text>
                <View style={styles.capabilityText}>
                  <Text style={styles.capabilityName}>{config.name}</Text>
                  <Text style={styles.capabilityDescription}>
                    {config.description}
                  </Text>
                </View>
              </View>
            );
          })
        ) : (
          <Text style={styles.noCapabilityText}>沒有可用的生物識別方式</Text>
        )}
      </View>
    );
  };

  const _primaryType = getPrimaryBiometricType();
  const _config = primaryType ? BIOMETRIC_TYPE_CONFIG[primaryType] : null;
  const _isDisabled =
    disabled || isAuthenticating || availableTypes.length === 0;

  if (isCapabilityLoading) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size='large' color='#4CAF50' />
        <Text style={styles.loadingText}>檢測生物識別能力...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[
          styles.authButton,
          config && { backgroundColor: config.color },
          isDisabled && styles.disabledButton,
          buttonStyle,
        ]}
        onPress={handleAuthenticate}
        disabled={isDisabled}
        activeOpacity={0.8}
      >
        {isAuthenticating ? (
          <ActivityIndicator size='small' color='#FFFFFF' />
        ) : (
          <>
            {config && <Text style={styles.buttonIcon}>{config.icon}</Text>}
            <Text style={[styles.buttonText, textStyle]}>
              {config ? `使用${config.name}認證` : '生物識別認證'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {renderCapabilityInfo()}

      {availableTypes.length === 0 && !isCapabilityLoading && (
        <View style={styles.unavailableContainer}>
          <Text style={styles.unavailableIcon}>🚫</Text>
          <Text style={styles.unavailableText}>生物識別不可用</Text>
          <Text style={styles.unavailableDescription}>
            請確保設備支持生物識別並已設置
          </Text>
        </View>
      )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 200,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  capabilityInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    width: '100%',
  },
  capabilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  capabilityIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30,
    textAlign: 'center',
  },
  capabilityText: {
    flex: 1,
  },
  capabilityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  capabilityDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noCapabilityText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  unavailableContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 16,
  },
  unavailableIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  unavailableText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 8,
  },
  unavailableDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default BiometricAuthButton;
