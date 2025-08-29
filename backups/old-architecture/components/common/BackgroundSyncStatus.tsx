import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { ConflictResolutionPanel } from './ConflictResolutionPanel';

interface BackgroundSyncStatusProps {
  showDetails?: boolean;
  onSyncComplete?: () => void;
}

export const BackgroundSyncStatus: React.FC<BackgroundSyncStatusProps> = ({
  showDetails = false,
  onSyncComplete,
}) => {
  const {
    status,
    stats,
    config,
    tasks,
    isLoading,
    error,
    addTask,
    removeTask,
    clearTasks,
    startSync,
    stopAutoSync,
    updateConfig,
    cleanupExpiredTasks,
    getTaskStats,
    addApiTask,
    addDataTask,
  } = useBackgroundSync();

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showConflictResolution, setShowConflictResolution] = useState(false);

  // 格式化時間
  const formatTime = (timestamp?: number): string => {
    if (!timestamp) return '從未';
    return new Date(timestamp).toLocaleString();
  };

  // 格式化持續時間
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    return `${Math.round(ms / 60000)}m`;
  };

  // 獲取優先級顏色
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  // 獲取任務類型圖標
  const getTaskTypeIcon = (type: string): string => {
    switch (type) {
      case 'api':
        return '🌐';
      case 'data':
        return '📊';
      case 'file':
        return '📁';
      case 'notification':
        return '🔔';
      default:
        return '📋';
    }
  };

  // 處理開始同步
  const handleStartSync = async () => {
    try {
      await startSync();
      Alert.alert('成功', '同步已開始');
      onSyncComplete?.();
    } catch (error) {
      Alert.alert('錯誤', `同步失敗: ${error}`);
    }
  };

  // 處理停止自動同步
  const handleStopAutoSync = () => {
    Alert.alert('確認停止', '確定要停止自動同步嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        style: 'destructive',
        onPress: () => {
          stopAutoSync();
          Alert.alert('成功', '自動同步已停止');
        },
      },
    ]);
  };

  // 處理清空任務
  const handleClearTasks = () => {
    Alert.alert('確認清空', '確定要清空所有同步任務嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        style: 'destructive',
        onPress: () => {
          clearTasks();
          Alert.alert('成功', '所有任務已清空');
        },
      },
    ]);
  };

  // 處理清理過期任務
  const handleCleanupExpired = () => {
    const cleanedCount = cleanupExpiredTasks();
    Alert.alert('成功', `已清理 ${cleanedCount} 個過期任務`);
  };

  // 處理添加測試任務
  const handleAddTestTask = () => {
    const taskId = addApiTask(
      '/api/test',
      'POST',
      { test: true, timestamp: Date.now() },
      'medium'
    );
    Alert.alert('成功', `測試任務已添加: ${taskId}`);
  };

  // 處理移除任務
  const handleRemoveTask = (id: string) => {
    Alert.alert('確認移除', '確定要移除這個任務嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        style: 'destructive',
        onPress: () => {
          removeTask(id);
          Alert.alert('成功', '任務已移除');
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>同步中...</Text>
      </View>
    );
  }

  const taskStats = getTaskStats();

  return (
    <ScrollView style={styles.container}>
      {/* 狀態概覽 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>背景同步狀態</Text>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>運行狀態</Text>
            <Text
              style={[
                styles.statusValue,
                status.isRunning ? styles.success : styles.error,
              ]}
            >
              {status.isRunning ? '運行中' : '已停止'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>總任務數</Text>
            <Text style={styles.statusValue}>{status.totalTasks}</Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>待處理</Text>
            <Text style={styles.statusValue}>{status.pendingTasks}</Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>已完成</Text>
            <Text style={styles.statusValue}>{status.completedTasks}</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>錯誤: {error}</Text>
          </View>
        )}
      </View>

      {/* 統計信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>同步統計</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>總同步次數</Text>
            <Text style={styles.statValue}>{stats.totalSyncs}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>成功次數</Text>
            <Text style={styles.statValue}>{stats.successfulSyncs}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>失敗次數</Text>
            <Text style={styles.statValue}>{stats.failedSyncs}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>平均時間</Text>
            <Text style={styles.statValue}>
              {formatDuration(stats.averageSyncTime)}
            </Text>
          </View>
        </View>

        {stats.lastSyncDuration && (
          <View style={styles.lastSyncInfo}>
            <Text style={styles.lastSyncLabel}>上次同步:</Text>
            <Text style={styles.lastSyncValue}>
              {formatTime(status.lastSyncTime)} (
              {formatDuration(stats.lastSyncDuration)})
            </Text>
          </View>
        )}
      </View>

      {/* 任務統計 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>任務統計</Text>

        <View style={styles.taskStatsGrid}>
          <View style={styles.taskStatItem}>
            <Text style={styles.taskStatLabel}>按類型</Text>
            {Object.entries(taskStats.byType).map(([type, count]) => (
              <Text key={type} style={styles.taskStatValue}>
                {getTaskTypeIcon(type)} {type}: {count}
              </Text>
            ))}
          </View>

          <View style={styles.taskStatItem}>
            <Text style={styles.taskStatLabel}>按優先級</Text>
            {Object.entries(taskStats.byPriority).map(([priority, count]) => (
              <Text
                key={priority}
                style={[
                  styles.taskStatValue,
                  { color: getPriorityColor(priority) },
                ]}
              >
                {priority}: {count}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* 任務列表 */}
      {showDetails && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>同步任務 ({tasks.length})</Text>
            <TouchableOpacity
              onPress={() => setShowTaskDetails(!showTaskDetails)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleButtonText}>
                {showTaskDetails ? '隱藏' : '顯示'}詳情
              </Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>暫無同步任務</Text>
          ) : (
            tasks.map(task => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskHeader}>
                  <Text style={styles.taskId}>{task.id}</Text>
                  <TouchableOpacity
                    onPress={() => handleRemoveTask(task.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>移除</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.taskInfo}>
                  <Text style={styles.taskType}>
                    {getTaskTypeIcon(task.type)} {task.type.toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.taskPriority,
                      { color: getPriorityColor(task.priority) },
                    ]}
                  >
                    {task.priority}
                  </Text>
                </View>

                <Text style={styles.taskUrl}>{task.url}</Text>
                <Text style={styles.taskMethod}>{task.method}</Text>

                {showTaskDetails && (
                  <View style={styles.taskDetails}>
                    <Text style={styles.taskDetail}>
                      重試次數: {task.retryCount}/{task.maxRetries}
                    </Text>
                    <Text style={styles.taskDetail}>
                      創建時間: {formatTime(task.createdAt)}
                    </Text>
                    {task.lastAttempt && (
                      <Text style={styles.taskDetail}>
                        最後嘗試: {formatTime(task.lastAttempt)}
                      </Text>
                    )}
                    {task.error && (
                      <Text style={styles.taskError}>錯誤: {task.error}</Text>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}

      {/* 配置信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>同步配置</Text>

        <View style={styles.configGrid}>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>最大並發任務</Text>
            <Text style={styles.configValue}>{config.maxConcurrentTasks}</Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>默認重試次數</Text>
            <Text style={styles.configValue}>{config.defaultRetryCount}</Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>同步間隔</Text>
            <Text style={styles.configValue}>
              {formatDuration(config.syncInterval)}
            </Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>自動同步</Text>
            <Text
              style={[
                styles.configValue,
                config.enableAutoSync ? styles.success : styles.error,
              ]}
            >
              {config.enableAutoSync ? '啟用' : '禁用'}
            </Text>
          </View>
        </View>
      </View>

      {/* 操作按鈕 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>操作</Text>

        <View style={styles.buttonGrid}>
          <TouchableOpacity onPress={handleStartSync} style={styles.button}>
            <Text style={styles.buttonText}>開始同步</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleStopAutoSync} style={styles.button}>
            <Text style={styles.buttonText}>停止自動同步</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAddTestTask} style={styles.button}>
            <Text style={styles.buttonText}>添加測試任務</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCleanupExpired}
            style={styles.button}
          >
            <Text style={styles.buttonText}>清理過期任務</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleClearTasks} style={styles.button}>
            <Text style={styles.buttonText}>清空所有任務</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 高級選項 */}
      <TouchableOpacity
        onPress={() => setShowAdvanced(!showAdvanced)}
        style={styles.advancedToggle}
      >
        <Text style={styles.advancedToggleText}>
          {showAdvanced ? '隱藏' : '顯示'}高級選項
        </Text>
      </TouchableOpacity>

      {showAdvanced && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>高級選項</Text>

          <TouchableOpacity
            onPress={() => updateConfig({ maxConcurrentTasks: 5 })}
            style={styles.button}
          >
            <Text style={styles.buttonText}>增加並發數</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => updateConfig({ syncInterval: 2 * 60 * 1000 })}
            style={styles.button}
          >
            <Text style={styles.buttonText}>縮短同步間隔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              updateConfig({ enableAutoSync: !config.enableAutoSync })
            }
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {config.enableAutoSync ? '禁用' : '啟用'}自動同步
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowConflictResolution(!showConflictResolution)}
            style={styles.button}
          >
            <Text style={styles.buttonText}>
              {showConflictResolution ? '隱藏' : '顯示'}衝突解決面板
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 衝突解決面板 */}
      {showConflictResolution && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>衝突解決管理</Text>
          <ConflictResolutionPanel showDetails={showDetails} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statusItem: {
    width: '48%',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  success: {
    color: '#4CAF50',
  },
  error: {
    color: '#F44336',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lastSyncInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  lastSyncLabel: {
    fontSize: 14,
    color: '#666',
  },
  lastSyncValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  taskStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskStatItem: {
    flex: 1,
  },
  taskStatLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  taskStatValue: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  taskItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskId: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  taskInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  taskPriority: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  taskUrl: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  taskMethod: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
  taskDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  taskDetail: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  taskError: {
    fontSize: 11,
    color: '#F44336',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  configGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  configItem: {
    width: '48%',
    marginBottom: 12,
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  configValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 8,
    width: '48%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  advancedToggle: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  advancedToggleText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
});
