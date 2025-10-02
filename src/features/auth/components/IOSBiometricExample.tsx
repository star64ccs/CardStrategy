import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import type {
  BiometricAuthRequest,
  BiometricCapability,
} from '../../../core/types';
import { IOSBiometricService } from '../services/iosBiometricService';

/**
 * iOS 生物識別功能示例Component
 */
export const IOSBiometricExample: React.FC = () => {
  const [service] = useState(() => IOSBiometricService.getInstance());
  const [capabilities, setCapabilities] = useState<BiometricCapability[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [serviceInfo, setServiceInfo] = useState<any>(null);

  useEffect(() => {
    initializeService();
  }, []);

  const _initializeService = async () => {
    setLoading(true);
    try {
      // GetServiceInformation
      const _info = service.getServiceInfo();
      setServiceInfo(info);

      // 檢測設備能力
      const _deviceCapabilities = await service.detectCapabilities();
      setCapabilities(deviceCapabilities);

      console.log('iOS 生物識別ServiceInitialize完成', {
        serviceInfo: info,
        capabilities: deviceCapabilities,
      });
    } catch (error) {
      console.error('Initialize iOS 生物識別ServiceFailed:', error);
      Alert.alert('Error', 'InitializeServiceFailed');
    } finally {
      setLoading(false);
    }
  };

  const _handleAuthenticate = async () => {
    setLoading(true);
    try {
      const request: BiometricAuthRequest = {
        promptMessage: '請使用 Face ID 或 Touch ID 登錄',
        cancelButtonText: '取消',
        fallbackButtonText: '使用密碼',
        disableDeviceFallback: false,
      };

      const _result = await service.authenticate(request);

      if (result.success) {
        Alert.alert(
          '認證Success',
          `使用 ${result.biometricType === 'faceId' ? 'Face ID' : 'Touch ID'} 認證Success！`
        );
      } else {
        Alert.alert('認證Failed', result.errorMessage || '認證Failed，請重試');
      }
    } catch (error) {
      console.error('iOS 生物識別認證Failed:', error);
      Alert.alert('Error', '認證過程出現異常');
    } finally {
      setLoading(false);
    }
  };

  const _handleCreateSignature = async () => {
    setLoading(true);
    try {
      const _promptMessage = '請進行生物識別認證以創建簽名';
      const _payload = `signature-payload-${Date.now()}`;

      const _result = await service.createSignature(promptMessage, payload);

      if (result.success) {
        Alert.alert(
          '簽名CreateSuccess',
          `簽名: ${result.signature.substring(0, 20)}...`
        );
      } else {
        Alert.alert('簽名CreateFailed', '無法創建簽名，請重試');
      }
    } catch (error) {
      console.error('Create簽名Failed:', error);
      Alert.alert('Error', '創建簽名過程出現異常');
    } finally {
      setLoading(false);
    }
  };

  const _handleInvalidateKeys = async () => {
    setLoading(true);
    try {
      const _result = await service.invalidateKeys();

      if (result) {
        Alert.alert('Success', '生物識別密鑰已失效');
      } else {
        Alert.alert('Failed', '無法使密鑰失效');
      }
    } catch (error) {
      console.error('使密鑰失效Failed:', error);
      Alert.alert('Error', '使密鑰失效過程出現異常');
    } finally {
      setLoading(false);
    }
  };

  const _handleReinitializeKeys = async () => {
    setLoading(true);
    try {
      const _result = await service.reinitializeKeys();

      if (result) {
        Alert.alert('Success', '生物識別密鑰已重新初始化');
        // ReGetServiceInformation
        setServiceInfo(service.getServiceInfo());
      } else {
        Alert.alert('Failed', '無法重新初始化密鑰');
      }
    } catch (error) {
      console.error('重新Initialize密鑰Failed:', error);
      Alert.alert('Error', '重新初始化密鑰過程出現異常');
    } finally {
      setLoading(false);
    }
  };

  const _handleRefreshCapabilities = async () => {
    setLoading(true);
    try {
      const _deviceCapabilities = await service.detectCapabilities();
      setCapabilities(deviceCapabilities);
      Alert.alert('Success', '設備能力已刷新');
    } catch (error) {
      console.error('刷新設備能力Failed:', error);
      Alert.alert('Error', '刷新設備能力Failed');
    } finally {
      setLoading(false);
    }
  };

  const _getBiometricTypeDisplayName = (type: string) => {
    switch (type) {
      case 'faceId':
        return 'Face ID';
      case 'touchId':
        return 'Touch ID';
      case 'fingerprint':
        return '指紋識別';
      case 'iris':
        return '虹膜識別';
      case 'voiceId':
        return '聲紋識別';
      case 'palm':
        return '掌紋識別';
      default:
        return type;
    }
  };

  const _getSecurityLevelDisplayName = (level: string) => {
    switch (level) {
      case 'weak':
        return '弱';
      case 'strong':
        return '強';
      case 'class3':
        return 'Class 3';
      default:
        return level;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>iOS 生物識別功能示例</Text>

      {/* ServiceStatus */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>服務狀態</Text>
        {serviceInfo ? (
          <>
            <Text style={styles.statusText}>平台: {serviceInfo.platform}</Text>
            <Text style={styles.statusText}>
              初始化狀態: {serviceInfo.isInitialized ? '已初始化' : '未初始化'}
            </Text>
            <Text style={styles.statusText}>
              服務就緒: {serviceInfo.isServiceReady ? '是' : '否'}
            </Text>
            {serviceInfo.securityInfo && (
              <>
                <Text style={styles.statusText}>
                  密鑰已生成:{' '}
                  {serviceInfo.securityInfo.keyGenerated ? '是' : '否'}
                </Text>
                <Text style={styles.statusText}>
                  密鑰已失效:{' '}
                  {serviceInfo.securityInfo.keyInvalidated ? '是' : '否'}
                </Text>
                <Text style={styles.statusText}>
                  安全級別:{' '}
                  {getSecurityLevelDisplayName(
                    serviceInfo.securityInfo.securityLevel
                  )}
                </Text>
                <Text style={styles.statusText}>
                  支持認證:{' '}
                  {serviceInfo.securityInfo.attestationSupported ? '是' : '否'}
                </Text>
              </>
            )}
          </>
        ) : (
          <Text style={styles.statusText}>正在加載服務信息...</Text>
        )}
      </View>

      {/* 設備能力 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>設備能力</Text>
        {capabilities.length > 0 ? (
          capabilities.map((capability, index) => (
            <View key={index} style={styles.capabilityItem}>
              <Text style={styles.capabilityTitle}>
                {getBiometricTypeDisplayName(capability.type)}
              </Text>
              <Text style={styles.capabilityText}>
                可用: {capability.isAvailable ? '是' : '否'}
              </Text>
              <Text style={styles.capabilityText}>
                已設置: {capability.isEnrolled ? '是' : '否'}
              </Text>
              <Text style={styles.capabilityText}>
                支持: {capability.isSupported ? '是' : '否'}
              </Text>
              <Text style={styles.capabilityText}>
                硬件檢測: {capability.hardwareDetected ? '是' : '否'}
              </Text>
              <Text style={styles.capabilityText}>
                安全級別:{' '}
                {getSecurityLevelDisplayName(capability.securityLevel)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.statusText}>正在檢測設備能力...</Text>
        )}
      </View>

      {/* Authenticate功能 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>認證功能</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleAuthenticate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Face ID / Touch ID 認證</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateSignature}
          disabled={loading}
        >
          <Text style={styles.buttonText}>創建生物識別簽名</Text>
        </TouchableOpacity>
      </View>

      {/* 密鑰Manage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>密鑰管理</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleInvalidateKeys}
          disabled={loading}
        >
          <Text style={styles.buttonText}>使密鑰失效</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleReinitializeKeys}
          disabled={loading}
        >
          <Text style={styles.buttonText}>重新初始化密鑰</Text>
        </TouchableOpacity>
      </View>

      {/* Tool功能 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>工具功能</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRefreshCapabilities}
          disabled={loading}
        >
          <Text style={styles.buttonText}>刷新設備能力</Text>
        </TouchableOpacity>
      </View>

      {/* iOS SpecificInformation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>iOS 特定信息</Text>
        <Text style={styles.infoText}>• 此組件專門為 iOS 平台設計</Text>
        <Text style={styles.infoText}>• 支持 Face ID 和 Touch ID 認證</Text>
        <Text style={styles.infoText}>• 提供完整的密鑰管理功能</Text>
        <Text style={styles.infoText}>• 支持生物識別簽名創建</Text>
        <Text style={styles.infoText}>• 實時設備能力檢測</Text>
        <Text style={styles.infoText}>• 安全級別和認證支持檢測</Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
          <Text style={styles.loadingText}>處理中...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  capabilityItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  capabilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  capabilityText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
});
