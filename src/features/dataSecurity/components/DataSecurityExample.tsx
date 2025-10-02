import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useDataSecurity } from '../hooks/useDataSecurity';
import type { BackupConfig } from '../types/security';
import {
  BackupType,
  DataClassification,
  EncryptionAlgorithm,
  HashAlgorithm,
} from '../types/security';

/**
 * Data安全功能示例Component
 */
export const DataSecurityExample: React.FC = () => {
  const {
    state,
    encryptData,
    decryptData,
    generateKey,
    createBackup,
    refreshState,
    refreshMetrics,
  } = useDataSecurity();

  const [textToEncrypt, setTextToEncrypt] = useState<string>('測試加密數據');
  const [encryptedData, setEncryptedData] = useState<string>('');
  const [keyId, setKeyId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Initialize時RefreshStatus
    refreshState();
    refreshMetrics();
  }, [refreshState, refreshMetrics]);

  const _handleGenerateKey = async () => {
    setLoading(true);
    try {
      const _key = await generateKey(EncryptionAlgorithm.AES_256_GCM, {
        purpose: 'demo_key',
        classification: DataClassification.INTERNAL,
        owner: 'demo_user',
      });
      setKeyId(key.id);
      Alert.alert('Success', `密鑰生成Success: ${key.id}`);
    } catch (error) {
      console.error('密鑰生成Failed:', error);
      Alert.alert('Error', '密鑰生成Failed');
    } finally {
      setLoading(false);
    }
  };

  const _handleEncrypt = async () => {
    if (!textToEncrypt.trim()) {
      Alert.alert('Error', '請輸入要加密的文本');
      return;
    }

    setLoading(true);
    try {
      const _result = await encryptData(textToEncrypt, {
        algorithm: EncryptionAlgorithm.AES_256_GCM,
        keyId: keyId || undefined,
        metadata: {
          classification: DataClassification.INTERNAL,
          purpose: 'demo_encryption',
        },
      });
      if (result.success) {
        setEncryptedData(result.encryptedData || '');
        setKeyId(result.keyId || '');
        Alert.alert('Success', '數據加密Success');
      } else {
        Alert.alert('Error', result.error || '加密Failed');
      }
    } catch (error) {
      console.error('加密Failed:', error);
      Alert.alert('Error', '加密Failed');
    } finally {
      setLoading(false);
    }
  };

  const _handleDecrypt = async () => {
    if (!encryptedData || !keyId) {
      Alert.alert('Error', '沒有可解密的數據');
      return;
    }

    setLoading(true);
    try {
      const _result = await decryptData(encryptedData, keyId, {
        algorithm: EncryptionAlgorithm.AES_256_GCM,
      });

      if (result.success) {
        Alert.alert('解密結果', result.decryptedData || '解密Success');
      } else {
        Alert.alert('Error', result.error || '解密Failed');
      }
    } catch (error) {
      console.error('解密Failed:', error);
      Alert.alert('Error', '解密Failed');
    } finally {
      setLoading(false);
    }
  };

  const _handleCreateBackup = async () => {
    setLoading(true);
    try {
      const backupConfig: BackupConfig = {
        id: `backup_${Date.now()}`,
        name: '示例備份',
        type: BackupType.FULL,
        schedule: '',
        retention: 7,
        encryption: {
          enabled: true,
          algorithm: EncryptionAlgorithm.AES_256_GCM,
          keyId: keyId || undefined,
        },
        compression: {
          enabled: true,
          algorithm: 'gzip',
          level: 6,
        },
        destination: {
          type: 'local',
          path: '/demo/backup',
        },
        filters: {
          include: ['**/*'],
          exclude: ['**/temp/**'],
        },
        verification: {
          enabled: true,
          checksumAlgorithm: HashAlgorithm.SHA256,
        },
      };

      const _task = await createBackup(backupConfig);
      Alert.alert('Success', `BackupTask已Create: ${task.id}`);
    } catch (error) {
      console.error('CreateBackupFailed:', error);
      Alert.alert('Error', 'CreateBackupFailed');
    } finally {
      setLoading(false);
    }
  };

  const _handleGetSecurityState = async () => {
    setLoading(true);
    try {
      await refreshState();
      const _stateInfo = [
        `InitializeStatus: ${state.isInitialized ? '已Initialize' : '未Initialize'}`,
        `EncryptStatus: ${state.isEncryptionEnabled ? '已Enable' : '已Disable'}`,
        `BackupStatus: ${state.isBackupEnabled ? '已Enable' : '已Disable'}`,
        `活躍密鑰: ${state.activeKeys.length}`,
        `總Encrypt次數: ${state.statistics.totalEncryptions}`,
        `總Decrypt次數: ${state.statistics.totalDecryptions}`,
        `總Backup次數: ${state.statistics.totalBackups}`,
      ].join('\n');

      Alert.alert('安全Status', stateInfo);
    } catch (error) {
      console.error('Get安全StatusFailed:', error);
      Alert.alert('Error', 'Get安全StatusFailed');
    } finally {
      setLoading(false);
    }
  };

  const _handleGetMetrics = async () => {
    setLoading(true);
    try {
      await refreshMetrics();
      const _metricsInfo = [
        `Encrypt性能: ${state.metrics?.encryptionPerformance?.averageEncryptionTime?.toFixed(2) || '0'}ms`,
        `Decrypt性能: ${state.metrics?.encryptionPerformance?.averageDecryptionTime?.toFixed(2) || '0'}ms`,
        `BackupSuccess率: ${((state.metrics?.backupPerformance?.successRate || 0) * 100).toFixed(1)}%`,
        `系統健康Status: ${state.metrics?.security?.complianceScore?.toFixed(1) || '0'}`,
        `密鑰輪換合規性: ${state.metrics?.keyManagement?.keyRotationCompliance || 0}%`,
      ].join('\n');

      Alert.alert('安全指標', metricsInfo);
    } catch (error) {
      console.error('Get安全指標Failed:', error);
      Alert.alert('Error', 'Get安全指標Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Data安全功能示例</Text>

      {/* StatusInformation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>狀態信息</Text>
        <Text style={styles.statusText}>
          初始化狀態: {state.isInitialized ? '已初始化' : '未初始化'}
        </Text>
        <Text style={styles.statusText}>
          加密狀態: {state.isEncryptionEnabled ? '已啟用' : '已禁用'}
        </Text>
        <Text style={styles.statusText}>
          備份狀態: {state.isBackupEnabled ? '已啟用' : '已禁用'}
        </Text>
        <Text style={styles.statusText}>
          活躍密鑰數量: {state.activeKeys.length}
        </Text>
      </View>

      {/* 密鑰Manage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>密鑰管理</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerateKey}
          disabled={loading}
        >
          <Text style={styles.buttonText}>生成新密鑰</Text>
        </TouchableOpacity>
        {keyId ? (
          <Text style={styles.infoText}>當前密鑰ID: {keyId}</Text>
        ) : null}
      </View>

      {/* DataEncrypt */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>數據加密</Text>
        <TextInput
          style={styles.textInput}
          value={textToEncrypt}
          onChangeText={setTextToEncrypt}
          placeholder='輸入要加密的文本'
          multiline
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleEncrypt}
          disabled={loading}
        >
          <Text style={styles.buttonText}>加密數據</Text>
        </TouchableOpacity>
        {encryptedData ? (
          <>
            <Text style={styles.infoText}>加密結果:</Text>
            <Text style={styles.encryptedText} numberOfLines={3}>
              {encryptedData}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={handleDecrypt}
              disabled={loading}
            >
              <Text style={styles.buttonText}>解密數據</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Backup功能 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>備份功能</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateBackup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>創建備份</Text>
        </TouchableOpacity>
      </View>

      {/* 安全Monitor */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>安全監控</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetSecurityState}
          disabled={loading}
        >
          <Text style={styles.buttonText}>查看安全狀態</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetMetrics}
          disabled={loading}
        >
          <Text style={styles.buttonText}>查看安全指標</Text>
        </TouchableOpacity>
      </View>

      {/* StatisticsInformation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>統計信息</Text>
        <Text style={styles.statusText}>
          總加密次數: {state.statistics.totalEncryptions}
        </Text>
        <Text style={styles.statusText}>
          總解密次數: {state.statistics.totalDecryptions}
        </Text>
        <Text style={styles.statusText}>
          總備份次數: {state.statistics.totalBackups}
        </Text>
        <Text style={styles.statusText}>
          安全違規次數: {state.statistics.securityViolations}
        </Text>
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
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
  encryptedText: {
    fontSize: 12,
    color: '#888',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
    marginBottom: 8,
    fontFamily: 'monospace',
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
