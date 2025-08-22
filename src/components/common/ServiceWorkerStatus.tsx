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
import { useServiceWorker } from '@/hooks/useServiceWorker';

interface ServiceWorkerStatusProps {
  showDetails?: boolean;
  onUpdate?: () => void;
}

export const ServiceWorkerStatus: React.FC<ServiceWorkerStatusProps> = ({
  showDetails = false,
  onUpdate,
}) => {
  const {
    status,
    cacheInfo,
    syncQueue,
    performanceMetrics,
    isLoading,
    error,
    initialize,
    updateApp,
    clearCache,
    refreshCacheInfo,
    addToSyncQueue,
    clearSyncQueue,
    registerBackgroundSync,
    sendNotification,
    prefetchResources,
    smartPrefetch,
    refreshPerformanceMetrics,
    getSupportedFeatures,
  } = useServiceWorker();

  const [showAdvanced, setShowAdvanced] = useState(false);

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // 格式化緩存策略
  const formatStrategy = (strategy: string): string => {
    const strategyMap: Record<string, string> = {
      'cache-first': '緩存優先',
      'network-first': '網絡優先',
      'stale-while-revalidate': '陳舊重驗證',
      'cache-only': '僅緩存',
      'network-only': '僅網絡',
    };
    return strategyMap[strategy] || strategy;
  };

  // 處理更新應用
  const handleUpdateApp = async () => {
    try {
      await updateApp();
      Alert.alert('成功', '應用已更新');
      onUpdate?.();
    } catch (error) {
      Alert.alert('錯誤', `更新失敗: ${error}`);
    }
  };

  // 處理清理緩存
  const handleClearCache = async (cacheName?: string) => {
    Alert.alert(
      '確認清理',
      `確定要清理${cacheName ? ` ${cacheName} ` : '所有'}緩存嗎？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCache(cacheName);
              await refreshCacheInfo();
              Alert.alert('成功', '緩存已清理');
            } catch (error) {
              Alert.alert('錯誤', `清理緩存失敗: ${error}`);
            }
          },
        },
      ]
    );
  };

  // 處理發送通知
  const handleSendNotification = async () => {
    try {
      await sendNotification('測試通知', {
        body: '這是一個測試通知',
        tag: 'test-notification',
      });
      Alert.alert('成功', '通知已發送');
    } catch (error) {
      Alert.alert('錯誤', `發送通知失敗: ${error}`);
    }
  };

  // 處理智能預取
  const handleSmartPrefetch = async () => {
    try {
      await smartPrefetch(window.location.pathname);
      Alert.alert('成功', '智能預取已完成');
    } catch (error) {
      Alert.alert('錯誤', `智能預取失敗: ${error}`);
    }
  };

  // 處理預取資源
  const handlePrefetchResources = async () => {
    try {
      await prefetchResources({
        urls: ['/api/cards', '/api/collections', '/static/js/cards.js'],
        priority: 'medium',
        strategy: 'prefetch',
      });
      Alert.alert('成功', '資源預取已完成');
    } catch (error) {
      Alert.alert('錯誤', `資源預取失敗: ${error}`);
    }
  };

  // 處理背景同步
  const handleBackgroundSync = async () => {
    try {
      await registerBackgroundSync('test-sync', { test: true });
      Alert.alert('成功', '背景同步已註冊');
    } catch (error) {
      Alert.alert('錯誤', `註冊背景同步失敗: ${error}`);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* 狀態概覽 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Worker 狀態</Text>

        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>註冊狀態</Text>
            <Text
              style={[
                styles.statusValue,
                status.registered ? styles.success : styles.error,
              ]}
            >
              {status.registered ? '已註冊' : '未註冊'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>激活狀態</Text>
            <Text
              style={[
                styles.statusValue,
                status.active ? styles.success : styles.error,
              ]}
            >
              {status.active ? '已激活' : '未激活'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>網絡狀態</Text>
            <Text
              style={[
                styles.statusValue,
                status.online ? styles.success : styles.error,
              ]}
            >
              {status.online ? '在線' : '離線'}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>更新狀態</Text>
            <Text
              style={[
                styles.statusValue,
                status.waiting ? styles.warning : styles.success,
              ]}
            >
              {status.waiting ? '待更新' : '最新'}
            </Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>錯誤: {error}</Text>
          </View>
        )}
      </View>

      {/* 性能指標 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>性能指標</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>緩存命中</Text>
            <Text style={styles.metricValue}>
              {performanceMetrics.cacheHits}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>緩存未命中</Text>
            <Text style={styles.metricValue}>
              {performanceMetrics.cacheMisses}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>網絡請求</Text>
            <Text style={styles.metricValue}>
              {performanceMetrics.networkRequests}
            </Text>
          </View>

          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>命中率</Text>
            <Text style={styles.metricValue}>
              {((performanceMetrics.hitRate || 0) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* 緩存信息 */}
      {showDetails && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>緩存信息</Text>
            <TouchableOpacity
              onPress={refreshCacheInfo}
              style={styles.refreshButton}
            >
              <Text style={styles.refreshButtonText}>刷新</Text>
            </TouchableOpacity>
          </View>

          {cacheInfo.map((cache, index) => (
            <View key={index} style={styles.cacheItem}>
              <View style={styles.cacheHeader}>
                <Text style={styles.cacheName}>{cache.name}</Text>
                <TouchableOpacity
                  onPress={() => handleClearCache(cache.name)}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>清理</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cacheDetails}>
                <Text style={styles.cacheDetail}>
                  大小: {formatFileSize(cache.size)}
                </Text>
                <Text style={styles.cacheDetail}>項目: {cache.itemCount}</Text>
                <Text style={styles.cacheDetail}>
                  策略: {formatStrategy(cache.strategy)}
                </Text>
                <Text style={styles.cacheDetail}>
                  TTL: {Math.round(cache.ttl / (60 * 1000))}分鐘
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* 同步隊列 */}
      {showDetails && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              同步隊列 ({syncQueue.length})
            </Text>
            <TouchableOpacity
              onPress={clearSyncQueue}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>清空</Text>
            </TouchableOpacity>
          </View>

          {syncQueue.length === 0 ? (
            <Text style={styles.emptyText}>同步隊列為空</Text>
          ) : (
            syncQueue.map((item, index) => (
              <View key={index} style={styles.syncItem}>
                <Text style={styles.syncId}>ID: {item.id}</Text>
                <Text style={styles.syncUrl}>URL: {item.url}</Text>
                <Text style={styles.syncMethod}>方法: {item.method}</Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* 支持的功能 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>支持的功能</Text>
        <View style={styles.featuresList}>
          {getSupportedFeatures().map((feature, index) => (
            <Text key={index} style={styles.featureItem}>
              ✓ {feature}
            </Text>
          ))}
        </View>
      </View>

      {/* 操作按鈕 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>操作</Text>

        <View style={styles.buttonGrid}>
          <TouchableOpacity onPress={handleUpdateApp} style={styles.button}>
            <Text style={styles.buttonText}>更新應用</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleClearCache()}
            style={styles.button}
          >
            <Text style={styles.buttonText}>清理所有緩存</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSendNotification}
            style={styles.button}
          >
            <Text style={styles.buttonText}>發送測試通知</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSmartPrefetch} style={styles.button}>
            <Text style={styles.buttonText}>智能預取</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePrefetchResources}
            style={styles.button}
          >
            <Text style={styles.buttonText}>預取資源</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleBackgroundSync}
            style={styles.button}
          >
            <Text style={styles.buttonText}>背景同步</Text>
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
            onPress={refreshPerformanceMetrics}
            style={styles.button}
          >
            <Text style={styles.buttonText}>刷新性能指標</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={initialize} style={styles.button}>
            <Text style={styles.buttonText}>重新初始化</Text>
          </TouchableOpacity>
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
  warning: {
    color: '#FF9800',
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cacheItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 12,
    marginBottom: 8,
  },
  cacheHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cacheName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cacheDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cacheDetail: {
    fontSize: 12,
    color: '#666',
    marginRight: 16,
    marginBottom: 4,
  },
  syncItem: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  syncId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  syncUrl: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  syncMethod: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    fontSize: 14,
    color: '#4CAF50',
    marginRight: 16,
    marginBottom: 4,
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
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  clearButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
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
