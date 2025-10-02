import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

import { useSimpleIncrementalSync } from '../hooks/useIncrementalSync';
import { useSimpleMultiDeviceSync } from '../hooks/useMultiDeviceSync';
import { useSimpleOfflineSync } from '../hooks/useOfflineSync';

/**
 * SyncStatus指示器Property
 */
export interface SyncStatusIndicatorProps {
  userId: string;
  deviceId: string;
  deviceInfo?: {
    name: string;
    platform: 'ios' | 'android' | 'web';
    version: string;
  };
  showDetails?: boolean;
  onRetry?: () => void;
  onManualSync?: () => void;
  style?: unknown;
}

/**
 * SyncStatus指示器Component
 * Show離線Sync、多設備Sync和增量Sync的Status
 */
export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  userId,
  deviceId,
  deviceInfo = { name: 'Unknown Device', platform: 'web', version: '1.0.0' },
  showDetails = false,
  onRetry,
  onManualSync,
  style,
}) => {
  // 離線SyncStatus
  const {
    isOnline,
    isSyncing: isOfflineSyncing,
    pendingItemsCount: offlinePendingCount,
    error: offlineError,
    triggerSync: triggerOfflineSync,
    clearError: clearOfflineError,
  } = useSimpleOfflineSync(userId);

  // 多設備SyncStatus
  const {
    currentDevice,
    connectedDevices,
    isDiscovering,
    isSyncing: isMultiDeviceSyncing,
    error: multiDeviceError,
    discoverDevices,
  } = useSimpleMultiDeviceSync(userId, deviceInfo);

  // 增量SyncStatus
  const {
    isSyncing: isIncrementalSyncing,
    syncMode,
    pendingItemsCount: incrementalPendingCount,
    error: incrementalError,
    triggerSync: triggerIncrementalSync,
    clearError: clearIncrementalError,
  } = useSimpleIncrementalSync(userId, deviceId);

  // 計算總體Status
  const _isAnySyncing =
    isOfflineSyncing || isMultiDeviceSyncing || isIncrementalSyncing;
  const _totalPendingCount = offlinePendingCount + incrementalPendingCount;
  const _hasAnyError = offlineError || multiDeviceError || incrementalError;
  const _connectedDevicesCount = connectedDevices.length;

  // GetStatus顏色
  const _getStatusColor = () => {
    if (hasAnyError) return '#FF6B6B';
    if (isAnySyncing) return '#4ECDC4';
    if (totalPendingCount > 0) return '#FFE66D';
    if (!isOnline) return '#95A5A6';
    return '#2ECC71';
  };

  // GetStatus文本
  const _getStatusText = () => {
    if (hasAnyError) return '同步Error';
    if (isAnySyncing) return '同步中...';
    if (totalPendingCount > 0) return `${totalPendingCount} 項待同步`;
    if (!isOnline) return '離線模式';
    return '已同步';
  };

  // HandleRetry
  const _handleRetry = () => {
    if (offlineError) {
      clearOfflineError();
      triggerOfflineSync();
    }
    if (incrementalError) {
      clearIncrementalError();
      triggerIncrementalSync();
    }
    if (multiDeviceError) {
      discoverDevices();
    }
    onRetry?.();
  };

  // HandleManualSync
  const _handleManualSync = () => {
    triggerOfflineSync();
    triggerIncrementalSync();
    discoverDevices();
    onManualSync?.();
  };

  return (
    <View style={[styles.container, style]}>
      {/* 主要Status指示器 */}
      <TouchableOpacity
        style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}
        onPress={handleManualSync}
        disabled={isAnySyncing}
      >
        {isAnySyncing ? (
          <ActivityIndicator size='small' color='#FFFFFF' />
        ) : (
          <View style={styles.statusDot} />
        )}
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </TouchableOpacity>

      {/* 詳細Information */}
      {showDetails && (
        <View style={styles.detailsContainer}>
          {/* 離線SyncStatus */}
          <View style={styles.syncSection}>
            <Text style={styles.sectionTitle}>離線同步</Text>
            <View style={styles.syncItem}>
              <Text style={styles.syncLabel}>狀態:</Text>
              <Text
                style={[
                  styles.syncValue,
                  { color: isOnline ? '#2ECC71' : '#95A5A6' },
                ]}
              >
                {isOnline ? '在線' : '離線'}
              </Text>
            </View>
            <View style={styles.syncItem}>
              <Text style={styles.syncLabel}>待同步:</Text>
              <Text style={styles.syncValue}>{offlinePendingCount} 項</Text>
            </View>
            {offlineError && (
              <View style={styles.errorItem}>
                <Text style={styles.errorText}>錯誤: {offlineError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <Text style={styles.retryButtonText}>重試</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 多設備SyncStatus */}
          <View style={styles.syncSection}>
            <Text style={styles.sectionTitle}>多設備同步</Text>
            <View style={styles.syncItem}>
              <Text style={styles.syncLabel}>當前設備:</Text>
              <Text style={styles.syncValue}>
                {currentDevice?.name || '未知'}
              </Text>
            </View>
            <View style={styles.syncItem}>
              <Text style={styles.syncLabel}>連接設備:</Text>
              <Text style={styles.syncValue}>{connectedDevicesCount} 個</Text>
            </View>
            <View style={styles.syncItem}>
              <Text style={styles.syncLabel}>發現狀態:</Text>
              <Text
                style={[
                  styles.syncValue,
                  { color: isDiscovering ? '#4ECDC4' : '#95A5A6' },
                ]}
              >
                {isDiscovering ? '發現中...' : '已停止'}
              </Text>
            </View>
            {multiDeviceError && (
              <View style={styles.errorItem}>
                <Text style={styles.errorText}>錯誤: {multiDeviceError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <Text style={styles.retryButtonText}>重試</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* 增量SyncStatus */}
          <View style={styles.syncSection}>
            <Text style={styles.sectionTitle}>增量同步</Text>
            <View style={styles.syncItem}>
              <Text style={styles.syncLabel}>模式:</Text>
              <Text style={styles.syncValue}>
                {syncMode === 'incremental'
                  ? '增量'
                  : syncMode === 'full'
                    ? '全量'
                    : '閒置'}
              </Text>
            </View>
            <View style={styles.syncItem}>
              <Text style={styles.syncLabel}>待同步:</Text>
              <Text style={styles.syncValue}>{incrementalPendingCount} 項</Text>
            </View>
            {incrementalError && (
              <View style={styles.errorItem}>
                <Text style={styles.errorText}>錯誤: {incrementalError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <Text style={styles.retryButtonText}>重試</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Operation按鈕 */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleManualSync}
              disabled={isAnySyncing}
            >
              <Text style={styles.actionButtonText}>
                {isAnySyncing ? '同步中...' : '手動同步'}
              </Text>
            </TouchableOpacity>
            {hasAnyError && (
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={handleRetry}
              >
                <Text style={styles.secondaryButtonText}>重試</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  syncSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  syncItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  syncLabel: {
    fontSize: 14,
    color: '#6C757D',
  },
  syncValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#495057',
  },
  errorItem: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FEB2B2',
  },
  errorText: {
    fontSize: 12,
    color: '#C53030',
    marginBottom: 4,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#C53030',
    borderRadius: 4,
  },
  retryButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6C757D',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
});

export default SyncStatusIndicator;
