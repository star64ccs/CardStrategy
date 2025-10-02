import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type {
  BiometricAuthRequest,
  BiometricCapability,
} from '../../../core/types';
import { AndroidBiometricService } from '../services/androidBiometricService';

interface AndroidBiometricExampleProps {
  onSuccess?: (result: unknown) => void;
  onError?: (error: unknown) => void;
}

/**
 * Android 生物識別示例組件
 * 展示完整的指紋/面部識別功能
 */
export const AndroidBiometricExample: React.FC<
  AndroidBiometricExampleProps
> = ({ onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [capabilities, setCapabilities] = useState<BiometricCapability[]>([]);
  const [serviceInfo, setServiceInfo] = useState<any>(null);
  const [securityInfo, setSecurityInfo] = useState<any>(null);
  const [lastAuthResult, setLastAuthResult] = useState<any>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('請進行生物識別認證');
  const [disableFallback, setDisableFallback] = useState(false);

  const _biometricService = AndroidBiometricService.getInstance();

  useEffect(() => {
    initializeService();
  }, []);

  /**
   * 初始化服務
   */
  const _initializeService = async () => {
    try {
      setIsLoading(true);

      // 檢查服務狀態
      const _info = biometricService.getServiceInfo();
      setServiceInfo(info);

      // 檢測設備能力
      const _deviceCapabilities = await biometricService.detectCapabilities();
      setCapabilities(deviceCapabilities);

      // 獲取安全信息
      const _secInfo = biometricService.getSecurityInfo();
      setSecurityInfo(secInfo);

      // 檢查是否有可用的生物識別
      const _hasAvailableBiometric = deviceCapabilities.some(
        cap => cap.isAvailable && cap.isEnrolled
      );
      setIsEnabled(hasAvailableBiometric);
    } catch (error) {
      console.error('初始化 Android 生物識別服務失敗:', error);
      Alert.alert('錯誤', '初始化生物識別服務失敗');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 執行生物識別認證
   */
  const _performAuthentication = async () => {
    try {
      setIsLoading(true);

      const request: BiometricAuthRequest = {
        promptMessage: customPrompt,
        cancelButtonText: '取消',
        disableDeviceFallback: false,
      };

      const _result = await biometricService.authenticate(request);
      setLastAuthResult(result);

      if (result.success) {
        Alert.alert(
          '認證成功',
          `使用 ${result.biometricType} 認證成功\n時間: ${result.timestamp.toLocaleString()}`
        );
        onSuccess?.(result);
      } else {
        Alert.alert(
          '認證失敗',
          `錯誤代碼: ${result.errorCode}\n錯誤信息: ${result.errorMessage}`
        );
        onError?.(result);
      }
    } catch (error) {
      console.error('生物識別認證失敗:', error);
      Alert.alert('錯誤', '認證過程發生錯誤');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 創建簽名認證
   */
  const _createSignature = async () => {
    try {
      setIsLoading(true);

      const _payload = `android-signature-${Date.now()}`;
      const _result = await biometricService.createSignature(
        customPrompt,
        payload
      );

      if (result.success) {
        Alert.alert(
          '簽名創建成功',
          `簽名: ${result.signature.substring(0, 20)}...`
        );
        onSuccess?.(result);
      } else {
        Alert.alert('簽名創建失敗', '無法創建生物識別簽名');
        onError?.(result);
      }
    } catch (error) {
      console.error('簽名創建失敗:', error);
      Alert.alert('錯誤', '簽名創建過程發生錯誤');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 使密鑰失效
   */
  const _invalidateKeys = async () => {
    try {
      setIsLoading(true);

      const _result = await biometricService.invalidateKeys();

      if (result) {
        Alert.alert('成功', '生物識別密鑰已失效');
        // 重新獲取安全信息
        const _secInfo = biometricService.getSecurityInfo();
        setSecurityInfo(secInfo);
      } else {
        Alert.alert('失敗', '無法使密鑰失效');
      }
    } catch (error) {
      console.error('使密鑰失效失敗:', error);
      Alert.alert('錯誤', '使密鑰失效過程發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 重新初始化密鑰
   */
  const _reinitializeKeys = async () => {
    try {
      setIsLoading(true);

      const _result = await biometricService.reinitializeKeys();

      if (result) {
        Alert.alert('成功', '生物識別密鑰重新初始化成功');
        // 重新獲取安全信息
        const _secInfo = biometricService.getSecurityInfo();
        setSecurityInfo(secInfo);
      } else {
        Alert.alert('失敗', '無法重新初始化密鑰');
      }
    } catch (error) {
      console.error('重新初始化密鑰失敗:', error);
      Alert.alert('錯誤', '重新初始化密鑰過程發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 刷新服務信息
   */
  const _refreshServiceInfo = () => {
    const _info = biometricService.getServiceInfo();
    setServiceInfo(info);

    const _secInfo = biometricService.getSecurityInfo();
    setSecurityInfo(secInfo);
  };

  /**
   * 渲染設備能力信息
   */
  const _renderCapabilities = () => {
    return capabilities.map((capability, index) => (
      <View key={index} style={styles.capabilityItem}>
        <Text style={styles.capabilityTitle}>
          {capability.type} ({capability.isAvailable ? '可用' : '不可用'})
        </Text>
        <Text style={styles.capabilityDetail}>
          已註冊: {capability.isEnrolled ? '是' : '否'}
        </Text>
        <Text style={styles.capabilityDetail}>
          硬件檢測: {capability.hardwareDetected ? '是' : '否'}
        </Text>
        <Text style={styles.capabilityDetail}>
          安全級別: {capability.securityLevel}
        </Text>
      </View>
    ));
  };

  /**
   * 渲染安全信息
   */
  const _renderSecurityInfo = () => {
    if (!securityInfo) return null;

    return (
      <View style={styles.securityInfo}>
        <Text style={styles.sectionTitle}>安全信息</Text>
        <Text>密鑰別名: {securityInfo.keyAlias}</Text>
        <Text>密鑰已生成: {securityInfo.keyGenerated ? '是' : '否'}</Text>
        <Text>密鑰已失效: {securityInfo.keyInvalidated ? '是' : '否'}</Text>
        <Text>
          生物識別已變更: {securityInfo.biometricChanged ? '是' : '否'}
        </Text>
        <Text>安全級別: {securityInfo.securityLevel}</Text>
        <Text>支持認證: {securityInfo.attestationSupported ? '是' : '否'}</Text>
      </View>
    );
  };

  /**
   * 渲染服務信息
   */
  const _renderServiceInfo = () => {
    if (!serviceInfo) return null;

    return (
      <View style={styles.serviceInfo}>
        <Text style={styles.sectionTitle}>服務信息</Text>
        <Text>平台: {serviceInfo.platform}</Text>
        <Text>已初始化: {serviceInfo.isInitialized ? '是' : '否'}</Text>
        <Text>服務就緒: {serviceInfo.isServiceReady ? '是' : '否'}</Text>
        <Text>能力數量: {serviceInfo.capabilities?.length || 0}</Text>
      </View>
    );
  };

  /**
   * 渲染最後認證結果
   */
  const _renderLastAuthResult = () => {
    if (!lastAuthResult) return null;

    return (
      <View style={styles.authResult}>
        <Text style={styles.sectionTitle}>最後認證結果</Text>
        <Text>成功: {lastAuthResult.success ? '是' : '否'}</Text>
        {lastAuthResult.success ? (
          <>
            <Text>生物識別類型: {lastAuthResult.biometricType}</Text>
            <Text>認證方法: {lastAuthResult.authenticationMethod}</Text>
          </>
        ) : (
          <>
            <Text>錯誤代碼: {lastAuthResult.errorCode}</Text>
            <Text>錯誤信息: {lastAuthResult.errorMessage}</Text>
          </>
        )}
        <Text>時間: {lastAuthResult.timestamp?.toLocaleString()}</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>處理中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Android 生物識別示例</Text>

      {/* 服務信息 */}
      {renderServiceInfo()}

      {/* 安全信息 */}
      {renderSecurityInfo()}

      {/* 設備能力 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>設備能力</Text>
        {renderCapabilities()}
      </View>

      {/* 配置選項 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>配置選項</Text>

        <View style={styles.configItem}>
          <Text>生物識別已啟用:</Text>
          <Switch
            value={isEnabled}
            onValueChange={setIsEnabled}
            disabled={true}
          />
        </View>

        <View style={styles.configItem}>
          <Text>禁用設備回退:</Text>
          <Switch value={disableFallback} onValueChange={setDisableFallback} />
        </View>
      </View>

      {/* 操作按鈕 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>操作</Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={performAuthentication}
          disabled={!isEnabled}
        >
          <Text style={styles.buttonText}>執行生物識別認證</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={createSignature}
          disabled={!isEnabled}
        >
          <Text style={styles.buttonText}>創建簽名認證</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={invalidateKeys}
        >
          <Text style={styles.buttonText}>使密鑰失效</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={reinitializeKeys}
        >
          <Text style={styles.buttonText}>重新初始化密鑰</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={refreshServiceInfo}
        >
          <Text style={styles.buttonText}>刷新服務信息</Text>
        </TouchableOpacity>
      </View>

      {/* 最後認證結果 */}
      {renderLastAuthResult()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
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
    color: '#333',
  },
  serviceInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  securityInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  capabilityItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  capabilityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  capabilityDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  button: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  warningButton: {
    backgroundColor: '#FF9500',
  },
  infoButton: {
    backgroundColor: '#5856D6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authResult: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default AndroidBiometricExample;
