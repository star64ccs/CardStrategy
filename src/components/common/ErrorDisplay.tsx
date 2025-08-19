import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ErrorInfo } from '@/services/errorHandlerService';

interface ErrorDisplayProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onDismiss?: () => void;
  onReport?: () => void;
  showDetails?: boolean;
  variant?: 'inline' | 'modal' | 'toast';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  onReport,
  showDetails = false,
  variant = 'inline'
}) => {
  const getSeverityColor = () => {
    switch (error.severity) {
      case 'critical':
        return '#dc3545';
      case 'high':
        return '#fd7e14';
      case 'medium':
        return '#ffc107';
      case 'low':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚠️';
      case 'low':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getCategoryText = () => {
    switch (error.category) {
      case 'api':
        return 'API 錯誤';
      case 'ui':
        return '界面錯誤';
      case 'validation':
        return '驗證錯誤';
      case 'network':
        return '網絡錯誤';
      case 'auth':
        return '認證錯誤';
      case 'system':
        return '系統錯誤';
      default:
        return '未知錯誤';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-TW');
  };

  if (variant === 'toast') {
    return (
      <View style={[styles.toastContainer, { borderLeftColor: getSeverityColor() }]}>
        <Text style={styles.toastIcon}>{getSeverityIcon()}</Text>
        <View style={styles.toastContent}>
          <Text style={styles.toastMessage} numberOfLines={2}>
            {error.message}
          </Text>
          <Text style={styles.toastCategory}>{getCategoryText()}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.toastDismiss}>
            <Text style={styles.toastDismissText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (variant === 'modal') {
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalIcon}>{getSeverityIcon()}</Text>
            <Text style={styles.modalTitle}>錯誤詳情</Text>
            {onDismiss && (
              <TouchableOpacity onPress={onDismiss} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.errorSection}>
              <Text style={styles.sectionTitle}>錯誤信息</Text>
              <Text style={styles.errorMessage}>{error.message}</Text>
            </View>

            <View style={styles.errorSection}>
              <Text style={styles.sectionTitle}>錯誤詳情</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>類型:</Text>
                <Text style={styles.detailValue}>{getCategoryText()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>嚴重程度:</Text>
                <Text style={styles.detailValue}>{error.severity}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>時間:</Text>
                <Text style={styles.detailValue}>{formatTimestamp(error.timestamp)}</Text>
              </View>
              {error.componentName && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>組件:</Text>
                  <Text style={styles.detailValue}>{error.componentName}</Text>
                </View>
              )}
              {error.action && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>操作:</Text>
                  <Text style={styles.detailValue}>{error.action}</Text>
                </View>
              )}
            </View>

            {showDetails && error.context && (
              <View style={styles.errorSection}>
                <Text style={styles.sectionTitle}>上下文信息</Text>
                <Text style={styles.contextText}>
                  {JSON.stringify(error.context, null, 2)}
                </Text>
              </View>
            )}

            {showDetails && error.stack && (
              <View style={styles.errorSection}>
                <Text style={styles.sectionTitle}>錯誤堆疊</Text>
                <Text style={styles.stackText} numberOfLines={10}>
                  {error.stack}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            {onRetry && (
              <TouchableOpacity style={[styles.actionButton, styles.retryButton]} onPress={onRetry}>
                <Text style={styles.retryButtonText}>重試</Text>
              </TouchableOpacity>
            )}
            {onReport && (
              <TouchableOpacity style={[styles.actionButton, styles.reportButton]} onPress={onReport}>
                <Text style={styles.reportButtonText}>報告錯誤</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  // 默認 inline 樣式
  return (
    <View style={[styles.inlineContainer, { borderLeftColor: getSeverityColor() }]}>
      <View style={styles.inlineHeader}>
        <Text style={styles.inlineIcon}>{getSeverityIcon()}</Text>
        <View style={styles.inlineInfo}>
          <Text style={styles.inlineMessage}>{error.message}</Text>
          <Text style={styles.inlineCategory}>{getCategoryText()}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.inlineDismiss}>
            <Text style={styles.inlineDismissText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDetails && (
        <View style={styles.inlineDetails}>
          <Text style={styles.inlineDetailText}>
            時間: {formatTimestamp(error.timestamp)}
          </Text>
          {error.componentName && (
            <Text style={styles.inlineDetailText}>
              組件: {error.componentName}
            </Text>
          )}
        </View>
      )}

      <View style={styles.inlineActions}>
        {onRetry && (
          <TouchableOpacity style={styles.inlineActionButton} onPress={onRetry}>
            <Text style={styles.inlineActionText}>重試</Text>
          </TouchableOpacity>
        )}
        {onReport && (
          <TouchableOpacity style={styles.inlineActionButton} onPress={onReport}>
            <Text style={styles.inlineActionText}>報告</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Toast 樣式
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  toastIcon: {
    fontSize: 20,
    marginRight: 8
  },
  toastContent: {
    flex: 1
  },
  toastMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529'
  },
  toastCategory: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2
  },
  toastDismiss: {
    padding: 4
  },
  toastDismissText: {
    fontSize: 18,
    color: '#6c757d',
    fontWeight: 'bold'
  },

  // Modal 樣式
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 20,
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  modalIcon: {
    fontSize: 24,
    marginRight: 12
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529'
  },
  modalClose: {
    padding: 4
  },
  modalCloseText: {
    fontSize: 24,
    color: '#6c757d',
    fontWeight: 'bold'
  },
  modalContent: {
    padding: 16
  },
  errorSection: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057',
    marginBottom: 8
  },
  errorMessage: {
    fontSize: 14,
    color: '#212529',
    lineHeight: 20
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4
  },
  detailLabel: {
    fontSize: 14,
    color: '#6c757d',
    width: 80
  },
  detailValue: {
    fontSize: 14,
    color: '#212529',
    flex: 1
  },
  contextText: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace'
  },
  stackText: {
    fontSize: 12,
    color: '#6c757d',
    backgroundColor: '#f8f9fa',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace'
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  retryButton: {
    backgroundColor: '#007bff'
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },
  reportButton: {
    backgroundColor: '#6c757d'
  },
  reportButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600'
  },

  // Inline 樣式
  inlineContainer: {
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  inlineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  inlineIcon: {
    fontSize: 18,
    marginRight: 8,
    marginTop: 2
  },
  inlineInfo: {
    flex: 1
  },
  inlineMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    lineHeight: 18
  },
  inlineCategory: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2
  },
  inlineDismiss: {
    padding: 4,
    marginLeft: 8
  },
  inlineDismissText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: 'bold'
  },
  inlineDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef'
  },
  inlineDetailText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2
  },
  inlineActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8
  },
  inlineActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#f8f9fa'
  },
  inlineActionText: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500'
  }
});
