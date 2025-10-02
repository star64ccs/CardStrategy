import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';

import type {
  ServiceWorkerConfig,
  ServiceWorkerStatus,
  ServiceWorkerStats,
} from '../services/serviceWorkerService';
import ServiceWorkerService from '../services/serviceWorkerService';

/**
 * Service Worker 示例Component
 * 展示 Service Worker Service的所有功能
 */
const ServiceWorkerExample: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [swStatus, setSwStatus] = useState<ServiceWorkerStatus | null>(null);
  const [swStats, setSwStats] = useState<ServiceWorkerStats | null>(null);
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [serviceInfo, setServiceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const _service = ServiceWorkerService.getInstance();

  // Service Worker Configure
  const swConfig: ServiceWorkerConfig = {
    swPath: '/sw.js',
    scope: '/',
    updateViaCache: 'all',
    cacheName: 'cardstrategy-sw-cache',
    cacheVersion: 'v1.0.0',
    cacheStrategies: [
      {
        name: 'static-assets',
        pattern: '/static/',
        strategy: 'cache-first',
        options: {
          cacheName: 'static-cache',
          maxAge: 86400,
          maxEntries: 100,
        },
      },
      {
        name: 'api-cache',
        pattern: '/api/',
        strategy: 'network-first',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 3,
        },
      },
      {
        name: 'images-cache',
        pattern: '/images/',
        strategy: 'stale-while-revalidate',
        options: {
          cacheName: 'images-cache',
          maxAge: 604800,
          maxEntries: 50,
        },
      },
    ],
    offlineFallback: '/offline.html',
    backgroundSync: {
      enabled: true,
      syncName: 'cardstrategy-sync',
      maxRetryAttempts: 3,
      retryDelay: 1000,
    },
    pushNotification: {
      enabled: true,
      vapidPublicKey: 'test-public-key',
      vapidPrivateKey: 'test-private-key',
      defaultPayload: {
        title: 'CardStrategy',
        body: '新消息',
        icon: '/icon.png',
        badge: '/badge.png',
        tag: 'cardstrategy-notification',
        data: {},
      },
    },
    periodicSync: {
      enabled: false,
      syncName: 'cardstrategy-periodic',
      minInterval: 86400,
      maxInterval: 604800,
    },
    contentIndex: {
      enabled: false,
      entries: [],
    },
  };

  useEffect(() => {
    initializeServiceWorker();
  }, []);

  /**
   * Initialize Service Worker
   */
  const _initializeServiceWorker = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('平台不支持', 'Service Worker 功能僅支持 Web 平台');
      return;
    }

    setLoading(true);
    try {
      const _result = await service.initialize(swConfig);

      if (result.success) {
        setIsInitialized(true);
        updateStatus();
        Alert.alert('InitializeSuccess', result.data as string);
      } else {
        Alert.alert('InitializeFailed', result.error || '未知Error');
      }
    } catch (error) {
      Alert.alert(
        'InitializeError',
        error instanceof Error ? error.message : '未知Error'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * UpdateStatusInformation
   */
  const _updateStatus = () => {
    if (service.isServiceReady()) {
      setSwStatus(service.getServiceWorkerStatus());
      setSwStats(service.getServiceStats());
      setServiceInfo(service.getServiceInfo());
    }
  };

  /**
   * Update Service Worker
   */
  const _updateServiceWorker = async () => {
    if (!service.isServiceReady()) {
      Alert.alert('Service未就緒', '請先Initialize Service Worker Service');
      return;
    }

    setLoading(true);
    try {
      const _result = await service.updateServiceWorker();

      if (result.success) {
        Alert.alert('UpdateSuccess', result.data as string);
        updateStatus();
      } else {
        Alert.alert('UpdateFailed', result.error || '未知Error');
      }
    } catch (error) {
      Alert.alert(
        'UpdateError',
        error instanceof Error ? error.message : '未知Error'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * SkipAwait
   */
  const _skipWaiting = async () => {
    if (!service.isServiceReady()) {
      Alert.alert('Service未就緒', '請先Initialize Service Worker Service');
      return;
    }

    setLoading(true);
    try {
      const _result = await service.skipWaiting();

      if (result.success) {
        Alert.alert('跳過等待Success', result.data as string);
        updateStatus();
      } else {
        Alert.alert('跳過等待Failed', result.error || '未知Error');
      }
    } catch (error) {
      Alert.alert(
        '跳過等待Error',
        error instanceof Error ? error.message : '未知Error'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cache URL
   */
  const _cacheUrl = async () => {
    if (!service.isServiceReady()) {
      Alert.alert('Service未就緒', '請先Initialize Service Worker Service');
      return;
    }

    setLoading(true);
    try {
      const _result = await service.cacheUrl(
        'https://example.com/test-resource'
      );

      if (result.success) {
        Alert.alert('緩存Success', `Success緩存 ${result.cachedUrls.length} 個資源`);
        getCacheInfo();
      } else {
        Alert.alert('緩存Failed', `Failed: ${result.failedUrls.join(', ')}`);
      }
    } catch (error) {
      Alert.alert(
        '緩存Error',
        error instanceof Error ? error.message : '未知Error'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * BatchCache URL
   */
  const _cacheUrls = async () => {
    if (!service.isServiceReady()) {
      Alert.alert('Service未就緒', '請先Initialize Service Worker Service');
      return;
    }

    setLoading(true);
    try {
      const _urls = [
        'https://example.com/resource1',
        'https://example.com/resource2',
        'https://example.com/resource3',
      ];

      const _result = await service.cacheUrls(urls);

      if (result.success) {
        Alert.alert(
          '批量緩存Success',
          `Success緩存 ${result.cachedUrls.length} 個資源，Failed ${result.failedUrls.length} 個`
        );
        getCacheInfo();
      } else {
        Alert.alert('批量緩存Failed', `Failed: ${result.failedUrls.join(', ')}`);
      }
    } catch (error) {
      Alert.alert(
        '批量緩存Error',
        error instanceof Error ? error.message : '未知Error'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * ClearCache
   */
  const _clearCache = async () => {
    if (!service.isServiceReady()) {
      Alert.alert('Service未就緒', '請先Initialize Service Worker Service');
      return;
    }

    setLoading(true);
    try {
      const _result = await service.clearCache();

      if (result.success) {
        Alert.alert('清除Success', result.data as string);
        getCacheInfo();
      } else {
        Alert.alert('清除Failed', result.error || '未知Error');
      }
    } catch (error) {
      Alert.alert(
        '清除Error',
        error instanceof Error ? error.message : '未知Error'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * GetCacheInformation
   */
  const _getCacheInfo = async () => {
    if (!service.isServiceReady()) {
      Alert.alert('Service未就緒', '請先Initialize Service Worker Service');
      return;
    }

    setLoading(true);
    try {
      const _result = await service.getCacheInfo();

      if (result.success) {
        setCacheInfo(result.data);
      } else {
        Alert.alert('Get緩存信息Failed', result.error || '未知Error');
      }
    } catch (error) {
      Alert.alert(
        'Get緩存信息Error',
        error instanceof Error ? error.message : '未知Error'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * RefreshStatus
   */
  const _refreshStatus = () => {
    updateStatus();
    getCacheInfo();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Service Worker 服務示例</Text>
        <Text style={styles.subtitle}>離線功能和緩存管理演示</Text>
      </View>

      {/* 平台Check */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>平台支持</Text>
        <View style={styles.platformInfo}>
          <Text style={styles.platformText}>當前平台: {Platform.OS}</Text>
          <Text style={styles.platformText}>
            Service Worker 支持:{' '}
            {Platform.OS === 'web' ? '✅ 支持' : '❌ 不支持'}
          </Text>
        </View>
      </View>

      {/* InitializeStatus */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>初始化狀態</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>服務就緒:</Text>
          <Text
            style={[
              styles.statusValue,
              { color: service.isServiceReady() ? '#4CAF50' : '#F44336' },
            ]}
          >
            {service.isServiceReady() ? '✅ 是' : '❌ 否'}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>已初始化:</Text>
          <Text
            style={[
              styles.statusValue,
              { color: isInitialized ? '#4CAF50' : '#F44336' },
            ]}
          >
            {isInitialized ? '✅ 是' : '❌ 否'}
          </Text>
        </View>
      </View>

      {/* Operation按鈕 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>操作</Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={initializeServiceWorker}
          disabled={loading || isInitialized}
        >
          <Text style={styles.buttonText}>
            {loading ? '初始化中...' : '初始化 Service Worker'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={updateServiceWorker}
          disabled={loading || !isInitialized}
        >
          <Text style={styles.buttonText}>
            {loading ? '更新中...' : '更新 Service Worker'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={skipWaiting}
          disabled={loading || !isInitialized}
        >
          <Text style={styles.buttonText}>
            {loading ? '跳過中...' : '跳過等待'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={cacheUrl}
          disabled={loading || !isInitialized}
        >
          <Text style={styles.buttonText}>
            {loading ? '緩存中...' : '緩存單個 URL'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
          onPress={cacheUrls}
          disabled={loading || !isInitialized}
        >
          <Text style={styles.buttonText}>
            {loading ? '緩存中...' : '批量緩存 URL'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={clearCache}
          disabled={loading || !isInitialized}
        >
          <Text style={styles.buttonText}>
            {loading ? '清除中...' : '清除緩存'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={refreshStatus}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '刷新中...' : '刷新狀態'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Service Worker Status */}
      {swStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Worker 狀態</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>已註冊:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: swStatus.isRegistered ? '#4CAF50' : '#F44336' },
              ]}
            >
              {swStatus.isRegistered ? '✅ 是' : '❌ 否'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>活躍:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: swStatus.isActive ? '#4CAF50' : '#F44336' },
              ]}
            >
              {swStatus.isActive ? '✅ 是' : '❌ 否'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>控制中:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: swStatus.isControlling ? '#4CAF50' : '#F44336' },
              ]}
            >
              {swStatus.isControlling ? '✅ 是' : '❌ 否'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>安裝中:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: swStatus.isInstalling ? '#FF9800' : '#4CAF50' },
              ]}
            >
              {swStatus.isInstalling ? '🔄 是' : '❌ 否'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>等待中:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: swStatus.isWaiting ? '#FF9800' : '#4CAF50' },
              ]}
            >
              {swStatus.isWaiting ? '⏳ 是' : '❌ 否'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>腳本 URL:</Text>
            <Text style={styles.statusValue}>{swStatus.scriptURL}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>作用域:</Text>
            <Text style={styles.statusValue}>{swStatus.scope}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>狀態:</Text>
            <Text style={styles.statusValue}>{swStatus.state}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>更新時間:</Text>
            <Text style={styles.statusValue}>
              {swStatus.updateTime > 0
                ? new Date(swStatus.updateTime).toLocaleString()
                : '未更新'}
            </Text>
          </View>
        </View>
      )}

      {/* ServiceStatistics */}
      {swStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>服務統計</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>總註冊次數:</Text>
            <Text style={styles.statusValue}>{swStats.totalRegistrations}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>總更新次數:</Text>
            <Text style={styles.statusValue}>{swStats.totalUpdates}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>總激活次數:</Text>
            <Text style={styles.statusValue}>{swStats.totalActivations}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>總錯誤次數:</Text>
            <Text style={styles.statusValue}>{swStats.totalErrors}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>平均更新時間:</Text>
            <Text style={styles.statusValue}>
              {swStats.averageUpdateTime.toFixed(2)} ms
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>緩存命中率:</Text>
            <Text style={styles.statusValue}>
              {(swStats.cacheHitRate * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>離線使用時間:</Text>
            <Text style={styles.statusValue}>
              {swStats.offlineUsageTime} ms
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>背景同步次數:</Text>
            <Text style={styles.statusValue}>
              {swStats.backgroundSyncCount}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>推送通知次數:</Text>
            <Text style={styles.statusValue}>
              {swStats.pushNotificationCount}
            </Text>
          </View>
        </View>
      )}

      {/* CacheInformation */}
      {cacheInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>緩存信息</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>緩存數量:</Text>
            <Text style={styles.statusValue}>
              {cacheInfo.cacheNames.length}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>總大小:</Text>
            <Text style={styles.statusValue}>
              {(cacheInfo.totalSize / 1024).toFixed(2)} KB
            </Text>
          </View>
          <View style={styles.cacheList}>
            <Text style={styles.cacheListTitle}>緩存列表:</Text>
            {cacheInfo.cacheNames.map((cacheName: string, index: number) => (
              <Text key={index} style={styles.cacheItem}>
                • {cacheName}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* ServiceInformation */}
      {serviceInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>服務信息</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>平台:</Text>
            <Text style={styles.statusValue}>{serviceInfo.data.platform}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Service Worker 路徑:</Text>
            <Text style={styles.statusValue}>
              {serviceInfo.data.config?.swPath}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>作用域:</Text>
            <Text style={styles.statusValue}>
              {serviceInfo.data.config?.scope}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>緩存名稱:</Text>
            <Text style={styles.statusValue}>
              {serviceInfo.data.config?.cacheName}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>緩存版本:</Text>
            <Text style={styles.statusValue}>
              {serviceInfo.data.config?.cacheVersion}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>緩存策略數量:</Text>
            <Text style={styles.statusValue}>
              {serviceInfo.data.config?.cacheStrategies.length}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>背景同步:</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color: serviceInfo.data.config?.backgroundSync.enabled
                    ? '#4CAF50'
                    : '#F44336',
                },
              ]}
            >
              {serviceInfo.data.config?.backgroundSync.enabled
                ? '✅ 啟用'
                : '❌ 禁用'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>推送通知:</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color: serviceInfo.data.config?.pushNotification.enabled
                    ? '#4CAF50'
                    : '#F44336',
                },
              ]}
            >
              {serviceInfo.data.config?.pushNotification.enabled
                ? '✅ 啟用'
                : '❌ 禁用'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  platformInfo: {
    marginBottom: 8,
  },
  platformText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  infoButton: {
    backgroundColor: '#00BCD4',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  secondaryButton: {
    backgroundColor: '#9E9E9E',
  },
  cacheList: {
    marginTop: 8,
  },
  cacheListTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  cacheItem: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginBottom: 2,
  },
});

export default ServiceWorkerExample;
