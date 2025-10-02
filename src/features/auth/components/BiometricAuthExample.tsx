import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

import type {
  BiometricAuthResult,
  BiometricCapability,
} from '../../../core/types';
import { BiometricSettings as BiometricSettingsType } from '../../../core/types';
import { useBiometricAuth } from '../hooks/useBiometricAuth';

import { BiometricAuthButton } from './BiometricAuthButton';
import { BiometricSettings } from './BiometricSettings';

/**
 * 生物識別Authenticate示例Component
 * 展示如何使用生物識別Authenticate功能
 */
export const BiometricAuthExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'auth' | 'settings'>('auth');
  const [authResult, setAuthResult] = useState<BiometricAuthResult | null>(
    null
  );
  const [capabilities, setCapabilities] = useState<BiometricCapability[]>([]);

  const {
    isAuthenticating,
    authError,
    settings,
    enrollmentStatus,
    securityInfo,
    isAvailable,
    isEnabled,
    getAvailableTypes,
    getEnabledTypes,
    canAuthenticate,
    authenticate,
    createKeys,
    deleteKeys,
    createSignature,
    detectCapabilities,
    loadSettings,
    reset,
  } = useBiometricAuth({
    onAuthSuccess: result => {
      setAuthResult(result);
      Alert.alert('認證Success', `使用 ${result.biometricType} 認證Success！`);
    },
    onAuthError: error => {
      Alert.alert('認證Failed', error);
    },
    onCapabilityDetected: caps => {
      setCapabilities(caps);
    },
    onSettingsChanged: newSettings => {
      console.log('設置已更新:', newSettings);
    },
  });

  const _handleManualAuth = async () => {
    try {
      const _result = await authenticate({
        promptMessage: '請進行生物識別認證',
        cancelButtonText: '取消',
        fallbackButtonText: '使用密碼',
      });
      console.log('手動認證結果:', result);
    } catch (error: unknown) {
      Alert.alert('手動認證Failed', error.message);
    }
  };

  const _handleCreateKeys = async () => {
    try {
      const _success = await createKeys();
      Alert.alert('創建密鑰', success ? '密鑰CreateSuccess' : '密鑰CreateFailed');
    } catch (error: unknown) {
      Alert.alert('Create密鑰Failed', error.message);
    }
  };

  const _handleDeleteKeys = async () => {
    Alert.alert('刪除密鑰', '確定要刪除生物識別密鑰嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          try {
            const _success = await deleteKeys();
            Alert.alert('刪除密鑰', success ? '密鑰DeleteSuccess' : '密鑰DeleteFailed');
          } catch (error: unknown) {
            Alert.alert('Delete密鑰Failed', error.message);
          }
        },
      },
    ]);
  };

  const _handleCreateSignature = async () => {
    try {
      const _payload = `signature-${Date.now()}`;
      const _signature = await createSignature(
        payload,
        '請進行生物識別認證以創建簽名'
      );
      Alert.alert('簽名CreateSuccess', `簽名: ${signature.substring(0, 20)}...`);
    } catch (error: unknown) {
      Alert.alert('Create簽名Failed', error.message);
    }
  };

  const _handleRefreshCapabilities = async () => {
    try {
      const _caps = await detectCapabilities();
      setCapabilities(caps);
      Alert.alert('刷新完成', `檢測到 ${caps.length} 種生物識別能力`);
    } catch (error: unknown) {
      Alert.alert('刷新Failed', error.message);
    }
  };

  const _handleRefreshSettings = async () => {
    try {
      await loadSettings();
      Alert.alert('刷新完成', '設置已更新');
    } catch (error: unknown) {
      Alert.alert('刷新Failed', error.message);
    }
  };

  const _handleReset = () => {
    reset();
    setAuthResult(null);
    setCapabilities([]);
    Alert.alert('重置完成', '生物識別狀態已重置');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>生物識別認證示例</Text>
        <Text style={styles.subtitle}>展示生物識別認證功能的使用方法</Text>
      </View>

      {/* TagSwitch */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'auth' && styles.activeTab]}
          onPress={() => setActiveTab('auth')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'auth' && styles.activeTabText,
            ]}
          >
            認證
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'settings' && styles.activeTabText,
            ]}
          >
            設置
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'auth' ? (
          <View style={styles.authSection}>
            {/* StatusInformation */}
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>當前狀態</Text>
              <Text style={styles.statusText}>
                認證中: {isAuthenticating ? '是' : '否'}
              </Text>
              <Text style={styles.statusText}>
                可用: {isAvailable() ? '是' : '否'}
              </Text>
              <Text style={styles.statusText}>
                已啟用: {isEnabled() ? '是' : '否'}
              </Text>
              <Text style={styles.statusText}>
                可認證: {canAuthenticate() ? '是' : '否'}
              </Text>
              <Text style={styles.statusText}>
                可用類型: {getAvailableTypes().join(', ') || '無'}
              </Text>
              <Text style={styles.statusText}>
                啟用類型: {getEnabledTypes().join(', ') || '無'}
              </Text>
              {authError && (
                <Text style={styles.errorText}>錯誤: {authError}</Text>
              )}
            </View>

            {/* Authenticate結果 */}
            {authResult && (
              <View style={styles.resultSection}>
                <Text style={styles.sectionTitle}>認證結果</Text>
                <Text style={styles.resultText}>
                  成功: {authResult.success ? '是' : '否'}
                </Text>
                {authResult.biometricType && (
                  <Text style={styles.resultText}>
                    類型: {authResult.biometricType}
                  </Text>
                )}
                {authResult.authenticationMethod && (
                  <Text style={styles.resultText}>
                    方法: {authResult.authenticationMethod}
                  </Text>
                )}
                {authResult.errorCode && (
                  <Text style={styles.resultText}>
                    錯誤代碼: {authResult.errorCode}
                  </Text>
                )}
                <Text style={styles.resultText}>
                  時間: {authResult.timestamp.toLocaleString()}
                </Text>
              </View>
            )}

            {/* 生物識別Authenticate按鈕 */}
            <View style={styles.authButtonSection}>
              <Text style={styles.sectionTitle}>生物識別認證</Text>
              <BiometricAuthButton
                onAuthSuccess={result => {
                  setAuthResult(result);
                  Alert.alert(
                    '認證Success',
                    `使用 ${result.biometricType} 認證Success！`
                  );
                }}
                onAuthError={error => {
                  Alert.alert('認證Failed', error);
                }}
                onCapabilityDetected={caps => {
                  setCapabilities(caps);
                }}
                showCapabilityInfo={true}
              />
            </View>

            {/* ManualOperation */}
            <View style={styles.manualSection}>
              <Text style={styles.sectionTitle}>手動操作</Text>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleManualAuth}
              >
                <Text style={styles.manualButtonText}>手動認證</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleCreateKeys}
              >
                <Text style={styles.manualButtonText}>創建密鑰</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleDeleteKeys}
              >
                <Text style={styles.manualButtonText}>刪除密鑰</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleCreateSignature}
              >
                <Text style={styles.manualButtonText}>創建簽名</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleRefreshCapabilities}
              >
                <Text style={styles.manualButtonText}>刷新能力</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.manualButton}
                onPress={handleRefreshSettings}
              >
                <Text style={styles.manualButtonText}>刷新設置</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.manualButton, styles.resetButton]}
                onPress={handleReset}
              >
                <Text style={styles.manualButtonText}>重置狀態</Text>
              </TouchableOpacity>
            </View>

            {/* 能力Information */}
            {capabilities.length > 0 && (
              <View style={styles.capabilitiesSection}>
                <Text style={styles.sectionTitle}>檢測到的能力</Text>
                {capabilities.map((capability, index) => (
                  <View key={index} style={styles.capabilityItem}>
                    <Text style={styles.capabilityType}>{capability.type}</Text>
                    <Text style={styles.capabilityStatus}>
                      可用: {capability.isAvailable ? '是' : '否'} | 已註冊:{' '}
                      {capability.isEnrolled ? '是' : '否'} | 安全級別:{' '}
                      {capability.securityLevel}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* 詳細Information */}
            <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>詳細信息</Text>

              {enrollmentStatus && (
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>註冊狀態:</Text>
                  <Text style={styles.detailValue}>
                    {enrollmentStatus.hasEnrolledBiometrics
                      ? '已註冊'
                      : '未註冊'}
                  </Text>
                </View>
              )}

              {securityInfo && (
                <>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>密鑰狀態:</Text>
                    <Text style={styles.detailValue}>
                      {securityInfo.keyGenerated ? '已生成' : '未生成'}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>安全級別:</Text>
                    <Text style={styles.detailValue}>
                      {securityInfo.securityLevel}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.settingsSection}>
            <BiometricSettings
              onSettingsChanged={newSettings => {
                console.log('設置已更新:', newSettings);
                Alert.alert('設置更新', '生物識別設置已更新');
              }}
              onError={error => {
                Alert.alert('SettingsError', error);
              }}
              showAdvancedSettings={true}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  authSection: {
    padding: 20,
  },
  settingsSection: {
    flex: 1,
  },
  statusSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  resultSection: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    marginTop: 8,
  },
  resultText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  authButtonSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  manualSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  manualButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#F44336',
  },
  manualButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  capabilitiesSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  capabilityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  capabilityType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  capabilityStatus: {
    fontSize: 12,
    color: '#666',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
});

export default BiometricAuthExample;
