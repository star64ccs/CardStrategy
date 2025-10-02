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
  PWAServiceConfig,
  PWAInstallStatus,
  PWAServiceStatus,
  PWAServiceStats,
} from '../services/pwaService';
import PWAService from '../services/pwaService';

/**
 * PWA 示例Component
 * 展示 PWA Service的所有功能
 */
const PWAExample: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [installStatus, setInstallStatus] = useState<PWAInstallStatus | null>(
    null
  );
  const [serviceStatus, setServiceStatus] = useState<PWAServiceStatus | null>(
    null
  );
  const [serviceStats, setServiceStats] = useState<PWAServiceStats | null>(
    null
  );
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [serviceInfo, setServiceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const _service = PWAService.getInstance();

  // PWA Configure
  const pwaConfig: PWAServiceConfig = {
    appName: 'CardStrategy PWA',
    appShortName: 'CardStrategy',
    appDescription: '卡片策略 PWA 應用',
    appVersion: '1.0.0',
    appThemeColor: '#2196F3',
    appBackgroundColor: '#FFFFFF',
    appDisplay: 'standalone',
    appOrientation: 'portrait',
    appScope: '/',
    appStartUrl: '/',
    appIcons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
    appScreenshots: [
      {
        src: '/screenshot.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
    ],
    appCategories: ['productivity', 'finance'],
    appLang: 'zh-TW',
    appDir: 'ltr',
    appPreferRelatedApplications: false,
    appRelatedApplications: [],
    appShortcuts: [
      {
        name: '新增卡片',
        short_name: '新增',
        description: '快速新增卡片',
        url: '/add-card',
        icons: [
          {
            src: '/shortcut-icon.png',
            sizes: '96x96',
            type: 'image/png',
          },
        ],
      },
    ],
    appProtocolHandlers: [
      {
        protocol: 'cardstrategy',
        url: '/handle-protocol?protocol=%s',
      },
    ],
    appFileHandlers: [
      {
        action: '/handle-file',
        accept: {
          'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
          'text/csv': ['.csv'],
        },
      },
    ],
    appShareTarget: {
      action: '/share',
      method: 'POST',
      enctype: 'application/x-www-form-urlencoded',
      params: {
        title: 'title',
        text: 'text',
        url: 'url',
      },
    },
    appCaptureLinks: 'new-client',
    appHandleLinks: 'preferred',
    appLaunchHandler: {
      client_mode: 'auto',
    },
    appDisplayOverride: ['standalone', 'minimal-ui'],
    appEdgeSidePanel: {
      preferred_width: 400,
    },
    appNoteTaking: {
      new_note_url: '/new-note',
    },
    appWindowControlsOverlay: {
      enabled: true,
    },
    appTabStrip: {
      home_tab: {
        name: '首頁',
        icons: [
          {
            src: '/home-icon.png',
            sizes: '24x24',
            type: 'image/png',
          },
        ],
      },
      new_tab_button: {
        enabled: true,
      },
    },
    appIsla: {
      enabled: false,
    },
    appLaunchQueue: {
      enabled: true,
    },
  };

  useEffect(() => {
    initializePWA();
  }, []);

  /**
   * Initialize PWA
   */
  const _initializePWA = async () => {
    if (Platform.OS !== 'web') {
      Alert.alert('平台不支持', 'PWA 功能僅支持 Web 平台');
      return;
    }

    setLoading(true);
    try {
      const _result = await service.initialize(pwaConfig);

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
      setInstallStatus(service.getInstallStatus());
      setServiceStatus(service.getServiceStatus());
      setServiceStats(service.getServiceStats());
      setServiceInfo(service.getServiceInfo());
    }
  };

  /**
   * Install PWA
   */
  const _installPWA = async () => {
    if (!service.isServiceReady()) {
      Alert.alert('Service未就緒', '請先Initialize PWA Service');
      return;
    }

    setLoading(true);
    try {
      const _result = await service.installPWA();

      if (result.success) {
        Alert.alert('安裝Success', result.data as string);
        updateStatus();
      } else {
        Alert.alert('安裝Failed', result.error || '未知Error');
      }
    } catch (error) {
      Alert.alert(
        '安裝Error',
        error instanceof Error ? error.message : '未知Error'
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update PWA
   */
  const _updatePWA = async () => {
    if (!service.isServiceReady()) {
      Alert.alert('Service未就緒', '請先Initialize PWA Service');
      return;
    }

    setLoading(true);
    try {
      const _result = await service.updatePWA();

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
   * ClearCache
   */
  const _clearCache = async () => {
    if (!service.isServiceReady()) {
      Alert.alert('Service未就緒', '請先Initialize PWA Service');
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
      Alert.alert('Service未就緒', '請先Initialize PWA Service');
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
        <Text style={styles.title}>PWA 服務示例</Text>
        <Text style={styles.subtitle}>Progressive Web App 功能演示</Text>
      </View>

      {/* 平台Check */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>平台支持</Text>
        <View style={styles.platformInfo}>
          <Text style={styles.platformText}>當前平台: {Platform.OS}</Text>
          <Text style={styles.platformText}>
            PWA 支持: {Platform.OS === 'web' ? '✅ 支持' : '❌ 不支持'}
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
          onPress={initializePWA}
          disabled={loading || isInitialized}
        >
          <Text style={styles.buttonText}>
            {loading ? '初始化中...' : '初始化 PWA'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={installPWA}
          disabled={loading || !isInitialized}
        >
          <Text style={styles.buttonText}>
            {loading ? '安裝中...' : '安裝 PWA'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={updatePWA}
          disabled={loading || !isInitialized}
        >
          <Text style={styles.buttonText}>
            {loading ? '更新中...' : '更新 PWA'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.warningButton]}
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

      {/* InstallStatus */}
      {installStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>安裝狀態</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>已安裝:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: installStatus.isInstalled ? '#4CAF50' : '#F44336' },
              ]}
            >
              {installStatus.isInstalled ? '✅ 是' : '❌ 否'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>可安裝:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: installStatus.canInstall ? '#4CAF50' : '#F44336' },
              ]}
            >
              {installStatus.canInstall ? '✅ 是' : '❌ 否'}
            </Text>
          </View>
        </View>
      )}

      {/* ServiceStatus */}
      {serviceStatus && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>服務狀態</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Service Worker:</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color: serviceStatus.isServiceWorkerRegistered
                    ? '#4CAF50'
                    : '#F44336',
                },
              ]}
            >
              {serviceStatus.isServiceWorkerRegistered
                ? '✅ 已註冊'
                : '❌ 未註冊'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>網絡狀態:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: serviceStatus.isOnline ? '#4CAF50' : '#F44336' },
              ]}
            >
              {serviceStatus.isOnline ? '✅ 在線' : '❌ 離線'}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>網絡類型:</Text>
            <Text style={styles.statusValue}>{serviceStatus.networkType}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>下載速度:</Text>
            <Text style={styles.statusValue}>
              {serviceStatus.downlink} Mbps
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>延遲:</Text>
            <Text style={styles.statusValue}>{serviceStatus.rtt} ms</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>節省數據:</Text>
            <Text
              style={[
                styles.statusValue,
                { color: serviceStatus.saveData ? '#FF9800' : '#4CAF50' },
              ]}
            >
              {serviceStatus.saveData ? '✅ 是' : '❌ 否'}
            </Text>
          </View>
        </View>
      )}

      {/* ServiceStatistics */}
      {serviceStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>服務統計</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>總安裝次數:</Text>
            <Text style={styles.statusValue}>
              {serviceStats.totalInstallations}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>總卸載次數:</Text>
            <Text style={styles.statusValue}>
              {serviceStats.totalUninstallations}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>總更新次數:</Text>
            <Text style={styles.statusValue}>{serviceStats.totalUpdates}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>平均安裝時間:</Text>
            <Text style={styles.statusValue}>
              {serviceStats.averageInstallTime.toFixed(2)} ms
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>平均更新時間:</Text>
            <Text style={styles.statusValue}>
              {serviceStats.averageUpdateTime.toFixed(2)} ms
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Service Worker 更新:</Text>
            <Text style={styles.statusValue}>
              {serviceStats.serviceWorkerUpdates}
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
            <Text style={styles.statusLabel}>應用名稱:</Text>
            <Text style={styles.statusValue}>
              {serviceInfo.data.config?.appName}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>應用版本:</Text>
            <Text style={styles.statusValue}>
              {serviceInfo.data.config?.appVersion}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>主題顏色:</Text>
            <Text style={styles.statusValue}>
              {serviceInfo.data.config?.appThemeColor}
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

export default PWAExample;
