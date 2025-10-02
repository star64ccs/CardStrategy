import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';

import type {
  BiometricSettings as BiometricSettingsType,
  BiometricType,
} from '../../../core/types';
import { useAppDispatch } from '../../../store/hooks';
import {
  getBiometricSettings,
  updateBiometricSettings,
  getEnrollmentStatus,
  getSecurityInfo,
  createBiometricKeys,
  deleteBiometricKeys,
  detectBiometricCapabilities,
  selectBiometricSettings,
  selectIsSettingsLoading,
  selectSettingsError,
  selectEnrollmentStatus,
  selectIsEnrollmentLoading,
  selectSecurityInfo,
  selectIsSecurityLoading,
  selectCapabilities,
  clearSettingsError,
  clearEnrollmentError,
  clearSecurityError,
} from '../../../store/slices/biometricAuthSlice';

interface BiometricSettingsProps {
  onSettingsChanged?: (settings: BiometricSettingsType) => void;
  onError?: (error: string) => void;
  style?: unknown;
  showAdvancedSettings?: boolean;
}

interface BiometricTypeInfo {
  name: string;
  icon: string;
  description: string;
}

const BIOMETRIC_TYPE_INFO: Record<BiometricType, BiometricTypeInfo> = {
  fingerprint: {
    name: '指紋識別',
    icon: '👆',
    description: '使用指紋進行快速安全認證',
  },
  faceId: {
    name: 'Face ID',
    icon: '👤',
    description: '使用面部識別進行認證',
  },
  touchId: {
    name: 'Touch ID',
    icon: '👆',
    description: '使用 Touch ID 進行認證',
  },
  voiceId: {
    name: '聲紋識別',
    icon: '🎤',
    description: '使用聲紋進行認證',
  },
  iris: {
    name: '虹膜識別',
    icon: '👁️',
    description: '使用虹膜進行高安全性認證',
  },
  palm: {
    name: '掌紋識別',
    icon: '🖐️',
    description: '使用掌紋進行認證',
  },
};

export const BiometricSettings: React.FC<BiometricSettingsProps> = ({
  onSettingsChanged,
  onError,
  style,
  showAdvancedSettings = true,
}) => {
  const _dispatch = useAppDispatch();
  const _settings = useSelector(selectBiometricSettings);
  const _isSettingsLoading = useSelector(selectIsSettingsLoading);
  const _settingsError = useSelector(selectSettingsError);
  const _enrollmentStatus = useSelector(selectEnrollmentStatus);
  const _isEnrollmentLoading = useSelector(selectIsEnrollmentLoading);
  const _securityInfo = useSelector(selectSecurityInfo);
  const _isSecurityLoading = useSelector(selectIsSecurityLoading);
  const _capabilities = useSelector(selectCapabilities);

  const [localSettings, setLocalSettings] =
    useState<BiometricSettingsType>(settings);

  useEffect(() => {
    // 初始化加載數據
    dispatch(getBiometricSettings());
    dispatch(getEnrollmentStatus());
    dispatch(getSecurityInfo());
    dispatch(detectBiometricCapabilities());
  }, [dispatch]);

  useEffect(() => {
    // 同步設置
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    // 處理設置錯誤
    if (settingsError) {
      onError?.(settingsError);
      dispatch(clearSettingsError());
    }
  }, [settingsError, onError, dispatch]);

  /**
   * 更新設置
   */
  const _handleUpdateSettings = async (
    newSettings: Partial<BiometricSettingsType>
  ) => {
    try {
      const _updatedSettings = { ...localSettings, ...newSettings };
      setLocalSettings(updatedSettings);

      const _result = await dispatch(
        updateBiometricSettings(newSettings)
      ).unwrap();
      onSettingsChanged?.(result);
    } catch (error: unknown) {
      Alert.alert('更新失敗', error.message || '更新生物識別設置失敗');
      // 恢復原設置
      setLocalSettings(settings);
    }
  };

  /**
   * 切換生物識別開關
   */
  const _handleToggleBiometric = async (enabled: boolean) => {
    if (enabled && !securityInfo?.keyGenerated) {
      // 需要先創建密鑰
      Alert.alert(
        '創建安全密鑰',
        '首次啟用生物識別需要創建安全密鑰，是否繼續？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '繼續',
            onPress: async () => {
              try {
                await dispatch(createBiometricKeys()).unwrap();
                await handleUpdateSettings({ isEnabled: true });
              } catch (error: unknown) {
                Alert.alert('創建密鑰失敗', error.message);
              }
            },
          },
        ]
      );
    } else if (!enabled) {
      // 禁用生物識別
      Alert.alert(
        '禁用生物識別',
        '禁用生物識別將刪除相關的安全密鑰，是否繼續？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '確定',
            style: 'destructive',
            onPress: async () => {
              try {
                await dispatch(deleteBiometricKeys()).unwrap();
                await handleUpdateSettings({ isEnabled: false });
              } catch (error: unknown) {
                Alert.alert('禁用失敗', error.message);
              }
            },
          },
        ]
      );
    } else {
      await handleUpdateSettings({ isEnabled: enabled });
    }
  };

  /**
   * 切換生物識別類型
   */
  const _handleToggleBiometricType = async (
    type: BiometricType,
    enabled: boolean
  ) => {
    const _newEnabledTypes = enabled
      ? [...localSettings.enabledTypes, type]
      : localSettings.enabledTypes.filter(t => t !== type);

    await handleUpdateSettings({ enabledTypes: newEnabledTypes });
  };

  /**
   * 渲染生物識別類型設置
   */
  const _renderBiometricTypes = () => {
    const _availableCapabilities = capabilities.filter(cap => cap.isAvailable);

    if (availableCapabilities.length === 0) {
      return (
        <View style={styles.noTypesContainer}>
          <Text style={styles.noTypesText}>沒有可用的生物識別類型</Text>
        </View>
      );
    }

    return (
      <View style={styles.typesContainer}>
        <Text style={styles.sectionTitle}>可用的生物識別類型</Text>
        {availableCapabilities.map(capability => {
          const _typeInfo = BIOMETRIC_TYPE_INFO[capability.type];
          const _isEnabled = localSettings.enabledTypes.includes(
            capability.type
          );

          return (
            <View key={capability.type} style={styles.typeItem}>
              <View style={styles.typeInfo}>
                <Text style={styles.typeIcon}>{typeInfo.icon}</Text>
                <View style={styles.typeText}>
                  <Text style={styles.typeName}>{typeInfo.name}</Text>
                  <Text style={styles.typeDescription}>
                    {typeInfo.description}
                  </Text>
                  <Text style={styles.typeStatus}>
                    {capability.isEnrolled ? '已註冊' : '未註冊'} • 安全級別:{' '}
                    {capability.securityLevel}
                  </Text>
                </View>
              </View>
              <Switch
                value={isEnabled}
                onValueChange={value =>
                  handleToggleBiometricType(capability.type, value)
                }
                disabled={!localSettings.isEnabled || !capability.isEnrolled}
              />
            </View>
          );
        })}
      </View>
    );
  };

  /**
   * 渲染高級設置
   */
  const _renderAdvancedSettings = () => {
    if (!showAdvancedSettings) return null;

    return (
      <View style={styles.advancedContainer}>
        <Text style={styles.sectionTitle}>高級設置</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>設備憑證回退</Text>
            <Text style={styles.settingDescription}>
              當生物識別失敗時，允許使用設備密碼或圖案
            </Text>
          </View>
          <Switch
            value={localSettings.fallbackToDeviceCredential}
            onValueChange={value =>
              handleUpdateSettings({ fallbackToDeviceCredential: value })
            }
            disabled={!localSettings.isEnabled}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>需要確認</Text>
            <Text style={styles.settingDescription}>
              認證成功後需要用戶確認操作
            </Text>
          </View>
          <Switch
            value={localSettings.requireConfirmation}
            onValueChange={value =>
              handleUpdateSettings({ requireConfirmation: value })
            }
            disabled={!localSettings.isEnabled}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingName}>註冊變更時失效</Text>
            <Text style={styles.settingDescription}>
              當生物識別註冊發生變更時，自動失效現有密鑰
            </Text>
          </View>
          <Switch
            value={localSettings.invalidateOnEnrollment}
            onValueChange={value =>
              handleUpdateSettings({ invalidateOnEnrollment: value })
            }
            disabled={!localSettings.isEnabled}
          />
        </View>

        <View style={styles.numberSettingItem}>
          <Text style={styles.settingName}>最大重試次數</Text>
          <Text style={styles.numberValue}>
            {localSettings.maxRetryAttempts}
          </Text>
        </View>

        <View style={styles.numberSettingItem}>
          <Text style={styles.settingName}>鎖定時間 (秒)</Text>
          <Text style={styles.numberValue}>
            {localSettings.lockoutDuration}
          </Text>
        </View>
      </View>
    );
  };

  /**
   * 渲染狀態信息
   */
  const _renderStatusInfo = () => {
    return (
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>狀態信息</Text>

        {enrollmentStatus && (
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>註冊狀態:</Text>
            <Text style={styles.statusValue}>
              {enrollmentStatus.hasEnrolledBiometrics ? '已註冊' : '未註冊'}
            </Text>
          </View>
        )}

        {securityInfo && (
          <>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>安全密鑰:</Text>
              <Text style={styles.statusValue}>
                {securityInfo.keyGenerated ? '已生成' : '未生成'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>安全級別:</Text>
              <Text style={styles.statusValue}>
                {securityInfo.securityLevel}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  if (isSettingsLoading || isEnrollmentLoading || isSecurityLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]}>
        <ActivityIndicator size='large' color='#4CAF50' />
        <Text style={styles.loadingText}>加載生物識別設置...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, style]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>生物識別設置</Text>
        <Text style={styles.subtitle}>配置您的生物識別認證選項</Text>
      </View>

      {/* 主開關 */}
      <View style={styles.mainSwitchContainer}>
        <View style={styles.mainSwitchInfo}>
          <Text style={styles.mainSwitchTitle}>啟用生物識別</Text>
          <Text style={styles.mainSwitchDescription}>
            使用生物識別進行快速安全認證
          </Text>
        </View>
        <Switch
          value={localSettings.isEnabled}
          onValueChange={handleToggleBiometric}
          disabled={isSettingsLoading}
        />
      </View>

      {/* 生物識別類型 */}
      {localSettings.isEnabled && renderBiometricTypes()}

      {/* 高級設置 */}
      {localSettings.isEnabled && renderAdvancedSettings()}

      {/* 狀態信息 */}
      {renderStatusInfo()}
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  mainSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    marginTop: 1,
  },
  mainSwitchInfo: {
    flex: 1,
    marginRight: 16,
  },
  mainSwitchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  mainSwitchDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  typesContainer: {
    padding: 20,
  },
  noTypesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noTypesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  typeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  typeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  typeText: {
    flex: 1,
  },
  typeName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  typeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  typeStatus: {
    fontSize: 12,
    color: '#999',
  },
  advancedContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  numberSettingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  numberValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
  },
  statusContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default BiometricSettings;
