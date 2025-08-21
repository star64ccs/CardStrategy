import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { TaskDependencyManager, TaskEncryptionConfig, EncryptionStats } from '@/utils/taskDependencyManager';
import { encryptionManager, KeyInfo } from '@/utils/encryption';

interface TaskEncryptionDisplayProps {
  taskManager?: TaskDependencyManager;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const TaskEncryptionDisplay: React.FC<TaskEncryptionDisplayProps> = ({
  taskManager,
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [encryptionConfig, setEncryptionConfig] = useState<TaskEncryptionConfig | null>(null);
  const [encryptionStats, setEncryptionStats] = useState<EncryptionStats | null>(null);
  const [encryptionManagerStats, setEncryptionManagerStats] = useState<any>(null);
  const [keys, setKeys] = useState<KeyInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const manager = taskManager || require('@/utils/taskDependencyManager').taskDependencyManager;

  useEffect(() => {
    loadEncryptionData();

    if (autoRefresh) {
      const interval = setInterval(loadEncryptionData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [manager, autoRefresh, refreshInterval]);

  const loadEncryptionData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 獲取加密配置
      const config = manager.getEncryptionConfig();
      setEncryptionConfig(config);

      // 獲取加密統計
      const stats = manager.getEncryptionStats();
      setEncryptionStats(stats);

      // 獲取加密管理器統計
      const managerStats = encryptionManager.getStats();
      setEncryptionManagerStats(managerStats);

      // 獲取密鑰列表
      const keyList = await encryptionManager.getKeys();
      setKeys(keyList);

      setLastRefresh(new Date());
    } catch (error) {
      // logger.info('Failed to load encryption data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  const handleToggleEncryption = async (enabled: boolean) => {
    try {
      manager.updateEncryptionConfig({ enabled });
      await loadEncryptionData();
      Alert.alert('成功', `加密功能已${enabled ? '啟用' : '禁用'}`);
    } catch (error) {
      Alert.alert('錯誤', '更新加密配置失敗');
    }
  };

  const handleToggleTaskEncryption = async (enabled: boolean) => {
    try {
      manager.updateEncryptionConfig({ encryptTaskData: enabled });
      await loadEncryptionData();
      Alert.alert('成功', `任務數據加密已${enabled ? '啟用' : '禁用'}`);
    } catch (error) {
      Alert.alert('錯誤', '更新任務加密配置失敗');
    }
  };

  const handleToggleSyncEncryption = async (enabled: boolean) => {
    try {
      manager.updateEncryptionConfig({ encryptSyncData: enabled });
      await loadEncryptionData();
      Alert.alert('成功', `同步數據加密已${enabled ? '啟用' : '禁用'}`);
    } catch (error) {
      Alert.alert('錯誤', '更新同步加密配置失敗');
    }
  };

  const handleToggleKeyRotation = async (enabled: boolean) => {
    try {
      manager.updateEncryptionConfig({ keyRotationEnabled: enabled });
      await loadEncryptionData();
      Alert.alert('成功', `密鑰輪換已${enabled ? '啟用' : '禁用'}`);
    } catch (error) {
      Alert.alert('錯誤', '更新密鑰輪換配置失敗');
    }
  };

  const handleTestEncryption = async () => {
    try {
      setIsLoading(true);
      const result = await manager.testEncryption();

      if (result.success) {
        Alert.alert('測試成功', '加密功能正常工作');
      } else {
        Alert.alert('測試失敗', result.error || '未知錯誤');
      }
    } catch (error) {
      Alert.alert('錯誤', '加密測試失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateKey = async () => {
    try {
      setIsLoading(true);
      const keyName = `key_${Date.now()}`;
      await encryptionManager.generateKey(keyName);
      await loadEncryptionData();
      Alert.alert('成功', '新密鑰已生成');
    } catch (error) {
      Alert.alert('錯誤', '生成密鑰失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    Alert.alert(
      '確認刪除',
      '確定要刪除此密鑰嗎？此操作不可撤銷。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '刪除',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const success = await encryptionManager.deleteKey(keyId);
              if (success) {
                await loadEncryptionData();
                Alert.alert('成功', '密鑰已刪除');
              } else {
                Alert.alert('錯誤', '刪除密鑰失敗');
              }
            } catch (error) {
              Alert.alert('錯誤', '刪除密鑰失敗');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleResetStats = () => {
    Alert.alert(
      '確認重置',
      '確定要重置加密統計嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '重置',
          style: 'destructive',
          onPress: () => {
            manager.resetEncryptionStats();
            encryptionManager.resetStats();
            loadEncryptionData();
            Alert.alert('成功', '統計已重置');
          }
        }
      ]
    );
  };

  const handleCleanupData = async () => {
    try {
      setIsLoading(true);
      const cleanedCount = await manager.cleanupEncryptedData();
      Alert.alert('清理完成', `已清理 ${cleanedCount} 項過期數據`);
    } catch (error) {
      Alert.alert('錯誤', '清理數據失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number | null): string => {
    if (!timestamp) return '從未';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-TW');
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const renderEncryptionConfig = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>加密配置</Text>
      <View style={styles.configItem}>
        <Text style={styles.configLabel}>啟用加密</Text>
        <Switch
          value={encryptionConfig?.enabled || false}
          onValueChange={handleToggleEncryption}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={encryptionConfig?.enabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
      <View style={styles.configItem}>
        <Text style={styles.configLabel}>任務數據加密</Text>
        <Switch
          value={encryptionConfig?.encryptTaskData || false}
          onValueChange={handleToggleTaskEncryption}
          disabled={!encryptionConfig?.enabled}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={encryptionConfig?.encryptTaskData ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
      <View style={styles.configItem}>
        <Text style={styles.configLabel}>同步數據加密</Text>
        <Switch
          value={encryptionConfig?.encryptSyncData || false}
          onValueChange={handleToggleSyncEncryption}
          disabled={!encryptionConfig?.enabled}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={encryptionConfig?.encryptSyncData ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
      <View style={styles.configItem}>
        <Text style={styles.configLabel}>密鑰輪換</Text>
        <Switch
          value={encryptionConfig?.keyRotationEnabled || false}
          onValueChange={handleToggleKeyRotation}
          disabled={!encryptionConfig?.enabled}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={encryptionConfig?.keyRotationEnabled ? '#f5dd4b' : '#f4f3f4'}
        />
      </View>
      {encryptionConfig && (
        <View style={styles.configDetails}>
          <Text style={styles.configDetail}>算法: {encryptionConfig.algorithm}</Text>
          <Text style={styles.configDetail}>輪換間隔: {formatDuration(encryptionConfig.keyRotationInterval)}</Text>
        </View>
      )}
    </View>
  );

  const renderEncryptionStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>加密統計</Text>
      {encryptionStats && (
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>加密任務</Text>
            <Text style={styles.statValue}>{encryptionStats.encryptedTasks}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>加密同步</Text>
            <Text style={styles.statValue}>{encryptionStats.encryptedSyncs}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>加密錯誤</Text>
            <Text style={styles.statValue}>{encryptionStats.encryptionErrors}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>解密錯誤</Text>
            <Text style={styles.statValue}>{encryptionStats.decryptionErrors}</Text>
          </View>
        </View>
      )}
      {encryptionManagerStats && (
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>總加密次數</Text>
            <Text style={styles.statValue}>{encryptionManagerStats.totalEncryptions}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>總解密次數</Text>
            <Text style={styles.statValue}>{encryptionManagerStats.totalDecryptions}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>平均加密時間</Text>
            <Text style={styles.statValue}>{formatDuration(encryptionManagerStats.averageEncryptionTime)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>平均解密時間</Text>
            <Text style={styles.statValue}>{formatDuration(encryptionManagerStats.averageDecryptionTime)}</Text>
          </View>
        </View>
      )}
      {encryptionStats && (
        <View style={styles.timeInfo}>
          <Text style={styles.timeLabel}>最後加密: {formatTime(encryptionStats.lastEncryptionTime)}</Text>
          <Text style={styles.timeLabel}>最後解密: {formatTime(encryptionStats.lastDecryptionTime)}</Text>
        </View>
      )}
    </View>
  );

  const renderKeys = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>加密密鑰 ({keys.length})</Text>
      {keys.map((key) => (
        <View key={key.id} style={styles.keyItem}>
          <View style={styles.keyInfo}>
            <Text style={styles.keyName}>{key.name}</Text>
            <Text style={styles.keyDetails}>
              {key.algorithm} • {key.keySize}位 • {key.isActive ? '活躍' : '非活躍'}
            </Text>
            <Text style={styles.keyTime}>
              創建: {formatTime(key.createdAt)} • 使用: {formatTime(key.lastUsed)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteKey(key.id)}
          >
            <Text style={styles.deleteButtonText}>刪除</Text>
          </TouchableOpacity>
        </View>
      ))}
      {keys.length === 0 && (
        <Text style={styles.emptyText}>暫無密鑰</Text>
      )}
    </View>
  );

  const renderActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>操作</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleTestEncryption}>
          <Text style={styles.actionButtonText}>測試加密</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleGenerateKey}>
          <Text style={styles.actionButtonText}>生成密鑰</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleResetStats}>
          <Text style={styles.actionButtonText}>重置統計</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleCleanupData}>
          <Text style={styles.actionButtonText}>清理數據</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>加密管理</Text>
        <Text style={styles.subtitle}>管理任務依賴系統的加密功能</Text>
        <Text style={styles.lastRefresh}>最後更新: {lastRefresh.toLocaleTimeString()}</Text>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      )}

      {renderEncryptionConfig()}
      {renderEncryptionStats()}
      {showDetails && renderKeys()}
      {renderActions()}

      {!encryptionConfig && !isLoading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>無法獲取加密配置</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 8
  },
  lastRefresh: {
    fontSize: 12,
    color: '#adb5bd'
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6c757d'
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4'
  },
  configLabel: {
    fontSize: 16,
    color: '#495057'
  },
  configDetails: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6
  },
  configDetail: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  statItem: {
    width: '50%',
    paddingVertical: 8
  },
  statLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529'
  },
  timeInfo: {
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6
  },
  timeLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 4
  },
  keyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4'
  },
  keyInfo: {
    flex: 1
  },
  keyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4
  },
  keyDetails: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2
  },
  keyTime: {
    fontSize: 12,
    color: '#adb5bd'
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  emptyText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    fontStyle: 'italic'
  },
  emptyState: {
    padding: 40,
    alignItems: 'center'
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center'
  }
});
