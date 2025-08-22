import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@/config/ThemeProvider';
import { cacheManager, CacheStats } from '@/utils/cacheManager';
import { offlineSyncManager, SyncStatus } from '@/utils/offlineSyncManager';
import { apiService } from '@/services/apiService';
import { logger } from '@/utils/logger';
import { CACHE_EXPIRY } from '@/utils/constants';

export const CacheManagementScreen: React.FC = () => {
  const { theme } = useTheme();
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<any[]>([]);

  useEffect(() => {
    loadData();

    // 添加同步狀態監聽器
    const statusListener = (status: SyncStatus) => {
      setSyncStatus(status);
    };

    offlineSyncManager.addStatusListener(statusListener);

    return () => {
      offlineSyncManager.removeStatusListener(statusListener);
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // 並行加載數據
      const [stats, status, queue] = await Promise.all([
        cacheManager.getCacheStats(),
        offlineSyncManager.getSyncStatus(),
        offlineSyncManager.getOfflineQueue(),
      ]);

      setCacheStats(stats);
      setSyncStatus(status);
      setOfflineQueue(queue);
    } catch (error) {
      logger.error('Load cache management data error:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const clearAllCache = () => {
    Alert.alert(
      '清除所有緩存',
      '確定要清除所有緩存數據嗎？這將刪除所有本地存儲的數據，包括圖片、卡片數據和 API 響應緩存。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await cacheManager.clearAllCache();
              await loadData();
              Alert.alert('成功', '所有緩存已清除');
            } catch (error) {
              logger.error('Clear all cache error:', { error });
              Alert.alert('錯誤', '清除緩存時發生錯誤');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const clearExpiredCache = async () => {
    try {
      setIsLoading(true);
      await cacheManager.cleanupExpiredCache();
      await loadData();
      Alert.alert('成功', '過期緩存已清理');
    } catch (error) {
      logger.error('Clear expired cache error:', { error });
      Alert.alert('錯誤', '清理過期緩存時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const syncOfflineOperations = async () => {
    try {
      setIsLoading(true);
      const result = await offlineSyncManager.syncOfflineOperations();
      await loadData();
      Alert.alert(
        '同步完成',
        `成功同步 ${result.success} 個操作，失敗 ${result.failed} 個操作`
      );
    } catch (error) {
      logger.error('Sync offline operations error:', { error });
      Alert.alert('錯誤', '同步離線操作時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const clearOfflineQueue = () => {
    Alert.alert(
      '清除離線隊列',
      '確定要清除所有待同步的操作嗎？這將永久刪除所有離線操作。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await offlineSyncManager.clearOfflineQueue();
              await loadData();
              Alert.alert('成功', '離線隊列已清除');
            } catch (error) {
              logger.error('Clear offline queue error:', { error });
              Alert.alert('錯誤', '清除離線隊列時發生錯誤');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getCacheExpiryText = (expiry: number): string => {
    const now = Date.now();
    const diff = expiry - now;

    if (diff <= 0) return '已過期';

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days} 天`;
    if (hours > 0) return `${hours} 小時`;
    if (minutes > 0) return `${minutes} 分鐘`;
    return '即將過期';
  };

  if (isLoading) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          載入中...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
      }
    >
      {/* 緩存統計 */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          緩存統計
        </Text>

        {cacheStats ? (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                總項目數
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {cacheStats.totalItems}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                總大小
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {formatBytes(cacheStats.totalSize)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                過期項目
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.error }]}>
                {cacheStats.expiredItems}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                最舊項目
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {cacheStats.oldestItem
                  ? formatDate(cacheStats.oldestItem)
                  : '無'}
              </Text>
            </View>
          </View>
        ) : (
          <Text
            style={[styles.noDataText, { color: theme.colors.textSecondary }]}
          >
            無緩存數據
          </Text>
        )}
      </View>

      {/* 同步狀態 */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          同步狀態
        </Text>

        {syncStatus ? (
          <View style={styles.syncStatusContainer}>
            <View style={styles.statusItem}>
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                網絡狀態
              </Text>
              <Text
                style={[
                  styles.statusValue,
                  {
                    color: syncStatus.isOnline
                      ? theme.colors.success
                      : theme.colors.error,
                  },
                ]}
              >
                {syncStatus.isOnline ? '在線' : '離線'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                同步狀態
              </Text>
              <Text
                style={[
                  styles.statusValue,
                  {
                    color: syncStatus.isSyncing
                      ? theme.colors.primary
                      : theme.colors.text,
                  },
                ]}
              >
                {syncStatus.isSyncing ? '同步中' : '閒置'}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                待同步操作
              </Text>
              <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                {syncStatus.pendingOperations}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text
                style={[
                  styles.statusLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                失敗操作
              </Text>
              <Text style={[styles.statusValue, { color: theme.colors.error }]}>
                {syncStatus.failedOperations}
              </Text>
            </View>

            {syncStatus.lastSyncTime && (
              <View style={styles.statusItem}>
                <Text
                  style={[
                    styles.statusLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  最後同步
                </Text>
                <Text
                  style={[styles.statusValue, { color: theme.colors.text }]}
                >
                  {formatDate(syncStatus.lastSyncTime)}
                </Text>
              </View>
            )}
          </View>
        ) : (
          <Text
            style={[styles.noDataText, { color: theme.colors.textSecondary }]}
          >
            無法獲取同步狀態
          </Text>
        )}
      </View>

      {/* 離線操作隊列 */}
      {offlineQueue.length > 0 && (
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            離線操作隊列 ({offlineQueue.length})
          </Text>

          <ScrollView style={styles.queueContainer} nestedScrollEnabled>
            {offlineQueue.map((operation, index) => (
              <View key={operation.id} style={styles.queueItem}>
                <Text
                  style={[styles.queueType, { color: theme.colors.primary }]}
                >
                  {operation.type}
                </Text>
                <Text
                  style={[styles.queueEndpoint, { color: theme.colors.text }]}
                >
                  {operation.endpoint}
                </Text>
                <Text
                  style={[
                    styles.queueTime,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {formatDate(operation.timestamp)}
                </Text>
                {operation.retryCount > 0 && (
                  <Text
                    style={[styles.queueRetry, { color: theme.colors.warning }]}
                  >
                    重試: {operation.retryCount}/{operation.maxRetries}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 操作按鈕 */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          緩存管理
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={clearExpiredCache}
          >
            <Text style={styles.buttonText}>清理過期緩存</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.warning }]}
            onPress={clearAllCache}
          >
            <Text style={styles.buttonText}>清除所有緩存</Text>
          </TouchableOpacity>

          {syncStatus?.pendingOperations > 0 && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.success }]}
              onPress={syncOfflineOperations}
            >
              <Text style={styles.buttonText}>同步離線操作</Text>
            </TouchableOpacity>
          )}

          {offlineQueue.length > 0 && (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.error }]}
              onPress={clearOfflineQueue}
            >
              <Text style={styles.buttonText}>清除離線隊列</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  syncStatusContainer: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  queueContainer: {
    maxHeight: 200,
  },
  queueItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  queueType: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  queueEndpoint: {
    fontSize: 14,
    marginBottom: 2,
  },
  queueTime: {
    fontSize: 12,
  },
  queueRetry: {
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CacheManagementScreen;
