import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { colors, typography, spacing, borderRadius, shadows } from '@/config/theme';

interface ErrorMonitorProps {
  showDetails?: boolean;
  onErrorClick?: (errorId: string) => void;
  maxDisplayErrors?: number;
}

export const ErrorMonitor: React.FC<ErrorMonitorProps> = ({
  showDetails = false,
  onErrorClick,
  maxDisplayErrors = 10
}) => {
  const {
    getErrorStats,
    getAllErrors,
    getUnhandledErrors,
    cleanupOldErrors
  } = useErrorHandler();

  const [errorStats, setErrorStats] = useState(getErrorStats());
  const [allErrors, setAllErrors] = useState(getAllErrors());
  const [unhandledErrors, setUnhandledErrors] = useState(getUnhandledErrors());
  const [isExpanded, setIsExpanded] = useState(false);

  // 定期更新錯誤統計
  useEffect(() => {
    const updateStats = () => {
      setErrorStats(getErrorStats());
      setAllErrors(getAllErrors());
      setUnhandledErrors(getUnhandledErrors());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // 每5秒更新一次

    return () => clearInterval(interval);
  }, [getErrorStats, getAllErrors, getUnhandledErrors]);

  // 清理舊錯誤
  const handleCleanup = () => {
    Alert.alert(
      '清理錯誤記錄',
      '確定要清理24小時前的錯誤記錄嗎？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          style: 'destructive',
          onPress: () => {
            cleanupOldErrors(24 * 60 * 60 * 1000); // 24小時
            setErrorStats(getErrorStats());
            setAllErrors(getAllErrors());
            setUnhandledErrors(getUnhandledErrors());
          }
        }
      ]
    );
  };

  // 獲取錯誤嚴重程度顏色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return colors.error;
      case 'high': return colors.warning;
      case 'medium': return colors.info;
      case 'low': return colors.success;
      default: return colors.text;
    }
  };

  // 獲取錯誤類型圖標
  const getErrorTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return '🌐';
      case 'network': return '📡';
      case 'validation': return '✅';
      case 'auth': return '🔐';
      case 'system': return '⚙️';
      default: return '❓';
    }
  };

  // 格式化時間
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return '剛剛';
    if (minutes < 60) return `${minutes}分鐘前`;
    if (hours < 24) return `${hours}小時前`;
    return timestamp.toLocaleDateString();
  };

  // 錯誤摘要組件
  const ErrorSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>總錯誤</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            {errorStats.total}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>未處理</Text>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>
            {errorStats.unhandled}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>可重試</Text>
          <Text style={[styles.summaryValue, { color: colors.info }]}>
            {errorStats.retryable}
          </Text>
        </View>
      </View>
    </View>
  );

  // 錯誤類型統計
  const ErrorTypeStats = () => (
    <View style={styles.typeStatsContainer}>
      <Text style={styles.sectionTitle}>錯誤類型統計</Text>
      {Object.entries(errorStats.byType).map(([type, count]) => (
        <View key={type} style={styles.typeStatRow}>
          <Text style={styles.typeIcon}>{getErrorTypeIcon(type)}</Text>
          <Text style={styles.typeName}>{type}</Text>
          <Text style={styles.typeCount}>{count}</Text>
        </View>
      ))}
    </View>
  );

  // 錯誤嚴重程度統計
  const ErrorSeverityStats = () => (
    <View style={styles.severityStatsContainer}>
      <Text style={styles.sectionTitle}>嚴重程度統計</Text>
      {Object.entries(errorStats.bySeverity).map(([severity, count]) => (
        <View key={severity} style={styles.severityStatRow}>
          <View style={[styles.severityIndicator, { backgroundColor: getSeverityColor(severity) }]} />
          <Text style={styles.severityName}>{severity}</Text>
          <Text style={styles.severityCount}>{count}</Text>
        </View>
      ))}
    </View>
  );

  // 錯誤列表
  const ErrorList = () => {
    const displayErrors = isExpanded ? allErrors : allErrors.slice(0, maxDisplayErrors);

    return (
      <View style={styles.errorListContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>最近錯誤</Text>
          {allErrors.length > maxDisplayErrors && (
            <TouchableOpacity
              onPress={() => setIsExpanded(!isExpanded)}
              style={styles.expandButton}
            >
              <Text style={styles.expandButtonText}>
                {isExpanded ? '收起' : '展開'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {displayErrors.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>🎉 沒有錯誤記錄</Text>
          </View>
        ) : (
          <ScrollView style={styles.errorList} showsVerticalScrollIndicator={false}>
            {displayErrors.map((error) => (
              <TouchableOpacity
                key={error.id}
                style={styles.errorItem}
                onPress={() => onErrorClick?.(error.id)}
              >
                <View style={styles.errorHeader}>
                  <Text style={styles.errorTypeIcon}>{getErrorTypeIcon(error.type)}</Text>
                  <Text style={styles.errorMessage} numberOfLines={2}>
                    {error.message}
                  </Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(error.severity) }]}>
                    <Text style={styles.severityBadgeText}>{error.severity}</Text>
                  </View>
                </View>

                <View style={styles.errorDetails}>
                  <Text style={styles.errorContext}>{error.context}</Text>
                  <Text style={styles.errorTime}>{formatTime(error.timestamp)}</Text>
                </View>

                {error.retryable && (
                  <View style={styles.retryInfo}>
                    <Text style={styles.retryText}>
                      重試: {error.retryCount}/{error.maxRetries}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>錯誤監控</Text>
        <TouchableOpacity onPress={handleCleanup} style={styles.cleanupButton}>
          <Text style={styles.cleanupButtonText}>清理</Text>
        </TouchableOpacity>
      </View>

      <ErrorSummary />

      {showDetails && (
        <>
          <ErrorTypeStats />
          <ErrorSeverityStats />
        </>
      )}

      <ErrorList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.medium
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  title: {
    ...typography.h3,
    color: colors.text
  },
  cleanupButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm
  },
  cleanupButtonText: {
    ...typography.caption,
    color: colors.white
  },
  summaryContainer: {
    marginBottom: spacing.md
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs
  },
  summaryValue: {
    ...typography.h2,
    fontWeight: 'bold'
  },
  typeStatsContainer: {
    marginBottom: spacing.md
  },
  severityStatsContainer: {
    marginBottom: spacing.md
  },
  sectionTitle: {
    ...typography.subtitle1,
    color: colors.text,
    marginBottom: spacing.sm
  },
  typeStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs
  },
  typeIcon: {
    fontSize: 16,
    marginRight: spacing.sm
  },
  typeName: {
    ...typography.body2,
    color: colors.text,
    flex: 1
  },
  typeCount: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: 'bold'
  },
  severityStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm
  },
  severityName: {
    ...typography.body2,
    color: colors.text,
    flex: 1
  },
  severityCount: {
    ...typography.body2,
    color: colors.textSecondary,
    fontWeight: 'bold'
  },
  errorListContainer: {
    flex: 1
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  expandButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm
  },
  expandButtonText: {
    ...typography.caption,
    color: colors.white
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.lg
  },
  emptyStateText: {
    ...typography.body1,
    color: colors.textSecondary
  },
  errorList: {
    maxHeight: 300
  },
  errorItem: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs
  },
  errorTypeIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2
  },
  errorMessage: {
    ...typography.body2,
    color: colors.text,
    flex: 1
  },
  severityBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    marginLeft: spacing.sm
  },
  severityBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10
  },
  errorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  errorContext: {
    ...typography.caption,
    color: colors.textSecondary
  },
  errorTime: {
    ...typography.caption,
    color: colors.textSecondary
  },
  retryInfo: {
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  retryText: {
    ...typography.caption,
    color: colors.info
  }
});
