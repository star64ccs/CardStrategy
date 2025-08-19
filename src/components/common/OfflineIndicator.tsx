import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from '@/config/ThemeProvider';
import { offlineSyncManager, SyncStatus } from '@/utils/offlineSyncManager';
import { networkMonitor } from '@/utils/networkMonitor';
import { logger } from '@/utils/logger';

interface OfflineIndicatorProps {
  showDetails?: boolean;
  onSyncPress?: () => void;
  style?: any;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showDetails = false,
  onSyncPress,
  style
}) => {
  const { theme } = useTheme();
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(-50));

  useEffect(() => {
    // 初始化狀態
    updateSyncStatus();

    // 添加狀態監聽器
    const statusListener = (status: SyncStatus) => {
      setSyncStatus(status);
      updateVisibility(status);
    };

    offlineSyncManager.addStatusListener(statusListener);

    // 添加網絡狀態監聽器
    const networkListener = (isOnline: boolean) => {
      updateSyncStatus();
    };

    networkMonitor.addListener(networkListener);

    return () => {
      offlineSyncManager.removeStatusListener(statusListener);
      networkMonitor.removeListener(networkListener);
    };
  }, []);

  const updateSyncStatus = async () => {
    try {
      const status = await offlineSyncManager.getSyncStatus();
      setSyncStatus(status);
      updateVisibility(status);
    } catch (error) {
      logger.error('Update sync status error:', { error });
    }
  };

  const updateVisibility = (status: SyncStatus) => {
    const shouldShow = !status.isOnline ||
                      status.pendingOperations > 0 ||
                      status.failedOperations > 0 ||
                      status.isSyncing;

    if (shouldShow && !isVisible) {
      showIndicator();
    } else if (!shouldShow && isVisible) {
      hideIndicator();
    }
  };

  const showIndicator = () => {
    setIsVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      })
    ]).start();
  };

  const hideIndicator = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true
      })
    ]).start(() => {
      setIsVisible(false);
    });
  };

  const handleSyncPress = async () => {
    if (onSyncPress) {
      onSyncPress();
    } else {
      try {
        await offlineSyncManager.syncOfflineOperations();
      } catch (error) {
        logger.error('Manual sync error:', { error });
      }
    }
  };

  const getStatusText = () => {
    if (!syncStatus) return '';

    if (!syncStatus.isOnline) {
      return '離線模式';
    }

    if (syncStatus.isSyncing) {
      return '同步中...';
    }

    if (syncStatus.failedOperations > 0) {
      return `${syncStatus.failedOperations} 個操作失敗`;
    }

    if (syncStatus.pendingOperations > 0) {
      return `${syncStatus.pendingOperations} 個待同步操作`;
    }

    return '';
  };

  const getStatusColor = () => {
    if (!syncStatus) return theme.colors.warning;

    if (!syncStatus.isOnline) {
      return theme.colors.error;
    }

    if (syncStatus.failedOperations > 0) {
      return theme.colors.error;
    }

    if (syncStatus.isSyncing) {
      return theme.colors.primary;
    }

    if (syncStatus.pendingOperations > 0) {
      return theme.colors.warning;
    }

    return theme.colors.success;
  };

  const getStatusIcon = () => {
    if (!syncStatus) return '⚠️';

    if (!syncStatus.isOnline) {
      return '📡';
    }

    if (syncStatus.isSyncing) {
      return '🔄';
    }

    if (syncStatus.failedOperations > 0) {
      return '❌';
    }

    if (syncStatus.pendingOperations > 0) {
      return '⏳';
    }

    return '✅';
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: getStatusColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        },
        style
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.icon, { color: getStatusColor() }]}>
          {getStatusIcon()}
        </Text>

        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            {getStatusText()}
          </Text>

          {showDetails && syncStatus && (
            <Text style={[styles.detailsText, { color: theme.colors.textSecondary }]}>
              {syncStatus.lastSyncTime && (
                `最後同步: ${new Date(syncStatus.lastSyncTime).toLocaleString()}`
              )}
            </Text>
          )}
        </View>

        {(syncStatus?.pendingOperations > 0 || syncStatus?.failedOperations > 0) && (
          <TouchableOpacity
            style={[styles.syncButton, { backgroundColor: getStatusColor() }]}
            onPress={handleSyncPress}
            disabled={syncStatus?.isSyncing}
          >
            <Text style={styles.syncButtonText}>
              {syncStatus?.isSyncing ? '同步中...' : '同步'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {syncStatus?.isSyncing && (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.colors.primary,
                  width: `${syncStatus.syncProgress}%`
                }
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
            {Math.round(syncStatus.syncProgress)}%
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderBottomWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  icon: {
    fontSize: 20,
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600'
  },
  detailsText: {
    fontSize: 12,
    marginTop: 2
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 2
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 35
  }
});

export default OfflineIndicator;
