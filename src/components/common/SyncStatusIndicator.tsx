import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useIncrementalSync } from '@/hooks/useIncrementalSync';
import { formatDistanceToNow } from '@/utils/dateUtils';

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  onSyncPress?: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showDetails = false,
  onSyncPress
}) => {
  const {
    syncStatus,
    lastSyncTime,
    pendingChangesCount,
    error,
    isOnline,
    forceSync,
    clearError,
    isSyncing,
    hasError,
    isOffline,
    hasPendingChanges
  } = useIncrementalSync();

  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  // 同步動畫效果
  React.useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSyncing, pulseAnim]);

  const getStatusColor = () => {
    if (hasError) return '#ff4444';
    if (isOffline) return '#ff8800';
    if (isSyncing) return '#2196f3';
    if (hasPendingChanges) return '#ff9800';
    return '#4caf50';
  };

  const getStatusText = () => {
    if (hasError) return '同步錯誤';
    if (isOffline) return '離線模式';
    if (isSyncing) return '同步中...';
    if (hasPendingChanges) return `${pendingChangesCount} 個待同步`;
    return '已同步';
  };

  const getStatusIcon = () => {
    if (hasError) return '⚠️';
    if (isOffline) return '📡';
    if (isSyncing) return '🔄';
    if (hasPendingChanges) return '⏳';
    return '✅';
  };

  const handleSyncPress = () => {
    if (onSyncPress) {
      onSyncPress();
    } else if (hasError) {
      clearError();
      forceSync();
    } else if (hasPendingChanges && !isSyncing) {
      forceSync();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.statusButton, { borderColor: getStatusColor() }]}
        onPress={handleSyncPress}
        disabled={isSyncing}
      >
        <Animated.View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: getStatusColor(),
              opacity: pulseAnim
            }
          ]}
        />
        <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.detailsContainer}>
          {lastSyncTime > 0 && (
            <Text style={styles.detailText}>
              上次同步: {formatDistanceToNow(lastSyncTime)}前
            </Text>
          )}

          {hasPendingChanges && (
            <Text style={styles.detailText}>
              待同步項目: {pendingChangesCount}
            </Text>
          )}

          {error && (
            <Text style={[styles.detailText, styles.errorText]}>
              錯誤: {error}
            </Text>
          )}

          <Text style={styles.detailText}>
            網絡狀態: {isOnline ? '在線' : '離線'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600'
  },
  detailsContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 8,
    minWidth: 200
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  errorText: {
    color: '#ff4444',
    fontWeight: '500'
  }
});
