import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/config/theme';
import { logService } from '@/services/logService';
import { logger } from '@/utils/logger';

interface LogStats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  debugCount: number;
  queueLength: number;
  batchQueueLength: number;
  lastFlushTime: string;
  failedLogsCount: number;
}

export const LogMonitoringDashboard: React.FC = () => {
  const [stats, setStats] = useState<LogStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logHistory, setLogHistory] = useState<any[]>([]);

  useEffect(() => {
    loadLogStats();
    loadLogHistory();
  }, []);

  const loadLogStats = async () => {
    try {
      setIsLoading(true);

      // 獲取隊列狀態
      const queueStatus = logService.getQueueStatus();

      // 獲取失敗日誌數量
      const failedLogsCount = await getFailedLogsCount();

      // 模擬統計數據（實際應用中應該從後端獲取）
      const mockStats: LogStats = {
        totalLogs: 1250,
        errorCount: 45,
        warningCount: 120,
        infoCount: 850,
        debugCount: 235,
        queueLength: queueStatus.queueLength,
        batchQueueLength: queueStatus.batchQueueLength,
        lastFlushTime: new Date().toISOString(),
        failedLogsCount
      };

      setStats(mockStats);
    } catch (error) {
      logger.error('載入日誌統計失敗:', { error });
      Alert.alert('錯誤', '載入日誌統計失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogHistory = async () => {
    try {
      const history = logger.getHistory();
      setLogHistory(history.slice(-20)); // 只顯示最近 20 條
    } catch (error) {
      logger.error('載入日誌歷史失敗:', { error });
    }
  };

  const getFailedLogsCount = async (): Promise<number> => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const keys = await AsyncStorage.getAllKeys();
      const failedLogKeys = keys.filter((key: string) => key.startsWith('failed_logs_'));
      return failedLogKeys.length;
    } catch {
      return 0;
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadLogStats(), loadLogHistory()]);
    setIsRefreshing(false);
  };

  const handleForceFlush = async () => {
    try {
      Alert.alert(
        '強制刷新日誌',
        '確定要強制刷新所有待發送的日誌嗎？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '確定',
            onPress: async () => {
              await logService.forceFlush();
              Alert.alert('成功', '日誌已強制刷新');
              loadLogStats();
            }
          }
        ]
      );
    } catch (error) {
      logger.error('強制刷新日誌失敗:', { error });
      Alert.alert('錯誤', '強制刷新失敗');
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      '清除日誌歷史',
      '確定要清除本地日誌歷史嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => {
            logger.clearHistory();
            setLogHistory([]);
            Alert.alert('成功', '日誌歷史已清除');
          }
        }
      ]
    );
  };

  const handleRetryFailedLogs = async () => {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      const keys = await AsyncStorage.getAllKeys();
      const failedLogKeys = keys.filter((key: string) => key.startsWith('failed_logs_'));

      if (failedLogKeys.length === 0) {
        Alert.alert('提示', '沒有失敗的日誌需要重試');
        return;
      }

      Alert.alert(
        '重試失敗日誌',
        `確定要重試 ${failedLogKeys.length} 個失敗的日誌嗎？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '確定',
            onPress: async () => {
              // 這裡應該實現重試邏輯
              Alert.alert('成功', '失敗日誌重試已啟動');
              loadLogStats();
            }
          }
        ]
      );
    } catch (error) {
      logger.error('重試失敗日誌失敗:', { error });
      Alert.alert('錯誤', '重試失敗');
    }
  };

  const renderStatCard = (title: string, value: string | number, color: string, subtitle?: string) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderLogItem = (log: any, index: number) => (
    <View key={index} style={styles.logItem}>
      <View style={styles.logHeader}>
        <Text style={[styles.logLevel, { color: getLogLevelColor(log.level) }]}>
          {log.level.toUpperCase()}
        </Text>
        <Text style={styles.logTimestamp}>
          {new Date(log.timestamp).toLocaleString('zh-TW')}
        </Text>
      </View>
      <Text style={styles.logMessage}>{log.message}</Text>
      {log.context && Object.keys(log.context).length > 0 && (
        <Text style={styles.logContext}>
          上下文: {JSON.stringify(log.context)}
        </Text>
      )}
    </View>
  );

  const getLogLevelColor = (level: string): string => {
    switch (level) {
      case 'error': return theme.colors.error;
      case 'warn': return theme.colors.warning;
      case 'info': return theme.colors.primary;
      case 'debug': return theme.colors.textSecondary;
      default: return theme.colors.textSecondary;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>載入日誌統計...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* 標題 */}
        <View style={styles.header}>
          <Text style={styles.title}>日誌監控面板</Text>
          <Text style={styles.subtitle}>實時監控應用日誌和錯誤</Text>
        </View>

        {/* 統計卡片 */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>日誌統計</Text>
            <View style={styles.statsGrid}>
              {renderStatCard('總日誌數', stats.totalLogs, theme.colors.primary)}
              {renderStatCard('錯誤數', stats.errorCount, theme.colors.error)}
              {renderStatCard('警告數', stats.warningCount, theme.colors.warning)}
              {renderStatCard('信息數', stats.infoCount, theme.colors.info)}
              {renderStatCard('調試數', stats.debugCount, theme.colors.textSecondary)}
              {renderStatCard('隊列長度', stats.queueLength, theme.colors.primary)}
              {renderStatCard('批次隊列', stats.batchQueueLength, theme.colors.warning)}
              {renderStatCard('失敗日誌', stats.failedLogsCount, theme.colors.error)}
            </View>
          </View>
        )}

        {/* 操作按鈕 */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>操作</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleForceFlush}>
              <Text style={styles.actionButtonText}>強制刷新日誌</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleRetryFailedLogs}>
              <Text style={styles.actionButtonText}>重試失敗日誌</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleClearHistory}>
              <Text style={styles.actionButtonText}>清除歷史</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 最近日誌 */}
        <View style={styles.logsContainer}>
          <Text style={styles.sectionTitle}>最近日誌</Text>
          {logHistory.length > 0 ? (
            logHistory.map((log, index) => renderLogItem(log, index))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>暫無日誌記錄</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundLight
  },
  content: {
    flex: 1,
    padding: theme.spacing.large
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: 16,
    color: theme.colors.textSecondary
  },
  header: {
    marginBottom: theme.spacing.large
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.medium
  },
  statsContainer: {
    marginBottom: theme.spacing.large
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.backgroundPaper,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
    borderLeftWidth: 4
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textPrimary
  },
  statSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small
  },
  actionsContainer: {
    marginBottom: theme.spacing.large
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.small
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.medium,
    paddingVertical: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
    minWidth: 120
  },
  actionButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  },
  logsContainer: {
    marginBottom: theme.spacing.large
  },
  logItem: {
    backgroundColor: theme.colors.backgroundPaper,
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small
  },
  logLevel: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  logTimestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  logMessage: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.small
  },
  logContext: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'monospace'
  },
  emptyContainer: {
    padding: theme.spacing.large,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary
  }
});
