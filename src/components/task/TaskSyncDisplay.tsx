import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { TaskDependencyManager, SyncStatus, SyncConflict } from '@/utils/taskDependencyManager';

interface TaskSyncDisplayProps {
  taskManager: TaskDependencyManager;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface DeviceSyncInfo {
  deviceId: string;
  deviceName: string;
  lastSyncTime: number;
  isOnline: boolean;
  pendingTasks: number;
}

export const TaskSyncDisplay: React.FC<TaskSyncDisplayProps> = ({
  taskManager,
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 5000
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const manager = taskManager || require('@/utils/taskDependencyManager').taskDependencyManager;

  useEffect(() => {
    loadSyncData();

    if (autoRefresh) {
      const interval = setInterval(loadSyncData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [manager, autoRefresh, refreshInterval]);

  useEffect(() => {
    // 監聽同步狀態變更
    const handleSyncStatusChange = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    // 監聽同步衝突
    const handleSyncConflict = (conflict: SyncConflict) => {
      setSyncConflicts(prev => [...prev, conflict]);
    };

    // 監聽手動衝突解決
    const handleManualConflictResolution = (conflict: SyncConflict) => {
      Alert.alert(
        '同步衝突',
        `檢測到任務 "${conflict.taskId}" 的同步衝突，需要手動解決。`,
        [
          { text: '取消', style: 'cancel' },
          { text: '解決', onPress: () => showConflictResolutionDialog(conflict) }
        ]
      );
    };

    manager.addSyncStatusListener(handleSyncStatusChange);
    manager.on('syncConflict', handleSyncConflict);
    manager.on('manualConflictResolution', handleManualConflictResolution);

    return () => {
      manager.removeSyncStatusListener(handleSyncStatusChange);
      manager.off('syncConflict', handleSyncConflict);
      manager.off('manualConflictResolution', handleManualConflictResolution);
    };
  }, [manager]);

  const loadSyncData = useCallback(async () => {
    try {
      setIsLoading(true);
      const status = await manager.getSyncStatus();
      const conflicts = manager.getSyncConflicts();

      setSyncStatus(status);
      setSyncConflicts(conflicts);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Load sync data error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [manager]);

  const handleManualSync = async () => {
    try {
      setIsLoading(true);
      const result = await manager.manualSync();
      Alert.alert(
        '同步完成',
        `成功同步 ${result.success} 個操作，失敗 ${result.failed} 個操作。`
      );
      await loadSyncData();
    } catch (error) {
      Alert.alert('同步失敗', '手動同步時發生錯誤。');
    } finally {
      setIsLoading(false);
    }
  };

  const showConflictResolutionDialog = (conflict: SyncConflict) => {
    Alert.alert(
      '解決同步衝突',
      `任務 "${conflict.taskId}" 存在版本衝突，請選擇解決方式：`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '使用本地版本',
          onPress: () => resolveConflict(conflict.taskId, 'LOCAL_WINS')
        },
        {
          text: '使用遠程版本',
          onPress: () => resolveConflict(conflict.taskId, 'REMOTE_WINS')
        },
        {
          text: '合併版本',
          onPress: () => resolveConflict(conflict.taskId, 'MERGE')
        }
      ]
    );
  };

  const resolveConflict = async (taskId: string, resolution: SyncConflict['resolution']) => {
    try {
      await manager.resolveSyncConflict(taskId, resolution);
      await loadSyncData();
      Alert.alert('衝突已解決', `已使用 ${resolution} 策略解決衝突。`);
    } catch (error) {
      Alert.alert('解決失敗', '解決同步衝突時發生錯誤。');
    }
  };

  const cleanupSyncData = async () => {
    try {
      await manager.cleanupSyncData();
      await loadSyncData();
      Alert.alert('清理完成', '已清理過期的同步數據。');
    } catch (error) {
      Alert.alert('清理失敗', '清理同步數據時發生錯誤。');
    }
  };

  const formatTime = (timestamp: number | null): string => {
    if (!timestamp) return '從未同步';
    const date = new Date(timestamp);
    return date.toLocaleString('zh-TW');
  };

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}小時${minutes % 60}分鐘`;
    } else if (minutes > 0) {
      return `${minutes}分鐘${seconds % 60}秒`;
    }
    return `${seconds}秒`;

  };

  const renderSyncStatus = () => {
    if (!syncStatus) return null;

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.sectionTitle}>同步狀態</Text>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>網絡狀態</Text>
            <View style={[styles.statusIndicator, syncStatus.isOnline ? styles.online : styles.offline]}>
              <Text style={styles.statusText}>
                {syncStatus.isOnline ? '在線' : '離線'}
              </Text>
            </View>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>同步狀態</Text>
            <View style={[styles.statusIndicator, syncStatus.isSyncing ? styles.syncing : styles.idle]}>
              <Text style={styles.statusText}>
                {syncStatus.isSyncing ? '同步中' : '閒置'}
              </Text>
            </View>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>待同步</Text>
            <Text style={styles.statusValue}>{syncStatus.pendingSyncs}</Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>失敗操作</Text>
            <Text style={styles.statusValue}>{syncStatus.failedSyncs}</Text>
          </View>
        </View>

        <View style={styles.syncInfo}>
          <Text style={styles.syncInfoText}>
            最後同步時間: {formatTime(syncStatus.lastSyncTime)}
          </Text>
          {syncStatus.lastSyncTime && (
            <Text style={styles.syncInfoText}>
              同步進度: {syncStatus.syncProgress.toFixed(1)}%
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderConnectedDevices = () => {
    if (!syncStatus?.connectedDevices.length) return null;

    return (
      <View style={styles.devicesContainer}>
        <Text style={styles.sectionTitle}>已連接設備</Text>

        {syncStatus.connectedDevices.map((device, index) => (
          <View key={device.deviceId} style={styles.deviceItem}>
            <View style={styles.deviceHeader}>
              <Text style={styles.deviceName}>{device.deviceName || device.deviceId}</Text>
              <View style={[styles.deviceStatus, device.isOnline ? styles.online : styles.offline]}>
                <Text style={styles.deviceStatusText}>
                  {device.isOnline ? '在線' : '離線'}
                </Text>
              </View>
            </View>

            <View style={styles.deviceDetails}>
              <Text style={styles.deviceDetail}>平台: {device.platform}</Text>
              <Text style={styles.deviceDetail}>版本: {device.appVersion}</Text>
              <Text style={styles.deviceDetail}>
                最後同步: {formatTime(device.lastSyncTime)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSyncConflicts = () => {
    if (!syncConflicts.length) return null;

    return (
      <View style={styles.conflictsContainer}>
        <Text style={styles.sectionTitle}>同步衝突 ({syncConflicts.length})</Text>

        {syncConflicts.map((conflict, index) => (
          <View key={`${conflict.taskId}_${index}`} style={styles.conflictItem}>
            <View style={styles.conflictHeader}>
              <Text style={styles.conflictTaskId}>任務: {conflict.taskId}</Text>
              <Text style={styles.conflictType}>{conflict.conflictType}</Text>
            </View>

            <View style={styles.conflictDetails}>
              <Text style={styles.conflictDetail}>
                本地版本: v{conflict.localVersion.version} ({formatTime(conflict.localVersion.timestamp)})
              </Text>
              <Text style={styles.conflictDetail}>
                遠程版本: v{conflict.remoteVersion.version} ({formatTime(conflict.remoteVersion.timestamp)})
              </Text>
            </View>

            <View style={styles.conflictActions}>
              <TouchableOpacity
                style={[styles.conflictButton, styles.localButton]}
                onPress={() => resolveConflict(conflict.taskId, 'LOCAL_WINS')}
              >
                <Text style={styles.conflictButtonText}>使用本地</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.conflictButton, styles.remoteButton]}
                onPress={() => resolveConflict(conflict.taskId, 'REMOTE_WINS')}
              >
                <Text style={styles.conflictButtonText}>使用遠程</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.conflictButton, styles.mergeButton]}
                onPress={() => resolveConflict(conflict.taskId, 'MERGE')}
              >
                <Text style={styles.conflictButtonText}>合併</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <Text style={styles.sectionTitle}>操作</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.syncButton]}
          onPress={handleManualSync}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.actionButtonText}>手動同步</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.refreshButton]}
          onPress={loadSyncData}
          disabled={isLoading}
        >
          <Text style={styles.actionButtonText}>刷新</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.cleanupButton]}
          onPress={cleanupSyncData}
        >
          <Text style={styles.actionButtonText}>清理數據</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.lastRefreshText}>
        最後更新: {lastRefresh.toLocaleTimeString('zh-TW')}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderSyncStatus()}
      {renderConnectedDevices()}
      {renderSyncConflicts()}
      {renderActions()}

      {!syncStatus && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>無法獲取同步狀態</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  statusContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statusItem: {
    width: '48%',
    marginBottom: 12
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start'
  },
  online: {
    backgroundColor: '#e8f5e8'
  },
  offline: {
    backgroundColor: '#ffe8e8'
  },
  syncing: {
    backgroundColor: '#e8f0ff'
  },
  idle: {
    backgroundColor: '#f0f0f0'
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  syncInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  syncInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  devicesContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  deviceItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  deviceStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3
  },
  deviceStatusText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  deviceDetails: {
    gap: 4
  },
  deviceDetail: {
    fontSize: 14,
    color: '#666'
  },
  conflictsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  conflictItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 6
  },
  conflictHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  conflictTaskId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404'
  },
  conflictType: {
    fontSize: 12,
    color: '#856404',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3
  },
  conflictDetails: {
    marginBottom: 12
  },
  conflictDetail: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 2
  },
  conflictActions: {
    flexDirection: 'row',
    gap: 8
  },
  conflictButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: 'center'
  },
  localButton: {
    backgroundColor: '#007bff'
  },
  remoteButton: {
    backgroundColor: '#28a745'
  },
  mergeButton: {
    backgroundColor: '#ffc107'
  },
  conflictButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  actionsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center'
  },
  syncButton: {
    backgroundColor: '#007bff'
  },
  refreshButton: {
    backgroundColor: '#6c757d'
  },
  cleanupButton: {
    backgroundColor: '#dc3545'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  lastRefreshText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  }
});
