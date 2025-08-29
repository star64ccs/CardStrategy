import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

import type { Warning } from '../types/reporting';
import { ReportSeverity } from '../types/reporting';

interface WarningDisplayProps {
  warning: Warning;
  onAcknowledge?: (warningId: string) => void;
  onDismiss?: (warningId: string) => void;
  showActions?: boolean;
}

export const WarningDisplay: React.FC<WarningDisplayProps> = ({
  warning,
  onAcknowledge,
  onDismiss,
  showActions = true,
}) => {
  const _getSeverityColor = (severity: ReportSeverity) => {
    switch (severity) {
      case ReportSeverity.LOW:
        return '#4CAF50';
      case ReportSeverity.MEDIUM:
        return '#FF9800';
      case ReportSeverity.HIGH:
        return '#F44336';
      case ReportSeverity.CRITICAL:
        return '#9C27B0';
      default:
        return '#FF9800';
    }
  };

  const _getSeverityIcon = (severity: ReportSeverity) => {
    switch (severity) {
      case ReportSeverity.LOW:
        return 'information-circle';
      case ReportSeverity.MEDIUM:
        return 'warning';
      case ReportSeverity.HIGH:
        return 'alert-circle';
      case ReportSeverity.CRITICAL:
        return 'close-circle';
      default:
        return 'warning';
    }
  };

  const _getTypeText = (type: string) => {
    switch (type) {
      case 'COMMUNITY_WARNING':
        return '社區警告';
      case 'SELLER_WARNING':
        return '賣家警告';
      case 'BUYER_WARNING':
        return '買家警告';
      case 'SYSTEM_WARNING':
        return '系統警告';
      case 'ADMIN_WARNING':
        return '管理員警告';
      default:
        return '警告';
    }
  };

  const _handleAcknowledge = () => {
    Alert.alert('確認操作', '您確定要確認此警告嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '確認', onPress: () => onAcknowledge?.(warning.id) },
    ]);
  };

  const _handleDismiss = () => {
    Alert.alert('確認操作', '您確定要忽略此警告嗎？', [
      { text: '取消', style: 'cancel' },
      { text: '忽略', onPress: () => onDismiss?.(warning.id) },
    ]);
  };

  const _formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View
      style={[
        styles.container,
        { borderLeftColor: getSeverityColor(warning.severity) },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons
            name={getSeverityIcon(warning.severity)}
            size={20}
            color={getSeverityColor(warning.severity)}
            style={styles.icon}
          />
          <Text style={styles.title}>{warning.title}</Text>
        </View>
        <View style={styles.badgeContainer}>
          <View
            style={[
              styles.severityBadge,
              { backgroundColor: getSeverityColor(warning.severity) },
            ]}
          >
            <Text style={styles.severityText}>
              {warning.severity === ReportSeverity.LOW && '低'}
              {warning.severity === ReportSeverity.MEDIUM && '中'}
              {warning.severity === ReportSeverity.HIGH && '高'}
              {warning.severity === ReportSeverity.CRITICAL && '嚴重'}
            </Text>
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{getTypeText(warning.type)}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.message}>{warning.message}</Text>

      <View style={styles.metadata}>
        <View style={styles.metadataItem}>
          <Ionicons name='time-outline' size={14} color='#666' />
          <Text style={styles.metadataText}>
            創建時間: {formatDate(warning.createdAt)}
          </Text>
        </View>

        {warning.expiresAt && (
          <View style={styles.metadataItem}>
            <Ionicons name='calendar-outline' size={14} color='#666' />
            <Text style={styles.metadataText}>
              到期時間: {formatDate(warning.expiresAt)}
            </Text>
          </View>
        )}

        {warning.acknowledgedAt && (
          <View style={styles.metadataItem}>
            <Ionicons name='checkmark-circle' size={14} color='#4CAF50' />
            <Text style={styles.metadataText}>
              已確認: {formatDate(warning.acknowledgedAt)}
            </Text>
          </View>
        )}
      </View>

      {showActions && warning.isActive && !warning.acknowledgedAt && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acknowledgeButton]}
            onPress={handleAcknowledge}
          >
            <Ionicons name='checkmark' size={16} color='#fff' />
            <Text style={styles.acknowledgeButtonText}>確認</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.dismissButton]}
            onPress={handleDismiss}
          >
            <Ionicons name='close' size={16} color='#666' />
            <Text style={styles.dismissButtonText}>忽略</Text>
          </TouchableOpacity>
        </View>
      )}

      {!warning.isActive && (
        <View style={styles.inactiveBadge}>
          <Text style={styles.inactiveText}>已失效</Text>
        </View>
      )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  typeText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  acknowledgeButton: {
    backgroundColor: '#4CAF50',
  },
  acknowledgeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  dismissButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dismissButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inactiveBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  inactiveText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
});
