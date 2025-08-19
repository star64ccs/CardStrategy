import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Loading } from '../common';
import { theme } from '../../config/theme';
import { DataBreachEvent, RiskLevel, dataBreachNotificationService } from '../../services/dataBreachNotificationService';
import { logger } from '../../utils/logger';

const { width } = Dimensions.get('window');

interface DataBreachEventDetailProps {
  event: DataBreachEvent;
  onClose?: () => void;
  onUpdate?: (event: DataBreachEvent) => void;
}

export const DataBreachEventDetail: React.FC<DataBreachEventDetailProps> = ({
  event,
  onClose,
  onUpdate
}) => {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);

  const getRiskLevelColor = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'critical': return theme.colors.error;
      case 'high': return theme.colors.warning;
      case 'medium': return theme.colors.info;
      case 'low': return theme.colors.success;
      default: return theme.colors.text;
    }
  };

  const getRiskLevelIcon = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'critical': return 'alert-circle';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'discovered': return theme.colors.error;
      case 'investigating': return theme.colors.warning;
      case 'contained': return theme.colors.info;
      case 'resolved': return theme.colors.success;
      default: return theme.colors.text;
    }
  };

  const getBreachTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      unauthorized_access: '未授權訪問',
      data_exfiltration: '數據外洩',
      system_compromise: '系統被攻破',
      insider_threat: '內部威脅',
      third_party_breach: '第三方洩露',
      physical_breach: '物理安全洩露',
      accidental_disclosure: '意外披露',
      malware_attack: '惡意軟件攻擊',
      phishing_attack: '釣魚攻擊',
      unknown: '未知類型'
    };
    return typeLabels[type] || type;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleStatusUpdate = async (newStatus: DataBreachEvent['status']) => {
    try {
      setIsUpdating(true);

      await dataBreachNotificationService.updateEventStatus(event.id, newStatus);

      // 更新本地事件狀態
      const updatedEvent = { ...event, status: newStatus };
      if (onUpdate) {
        onUpdate(updatedEvent);
      }

      Alert.alert('成功', `事件狀態已更新為: ${newStatus}`);
    } catch (error) {
      logger.error('更新事件狀態失敗:', error);
      Alert.alert('錯誤', '更新事件狀態失敗');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendNotification = async (type: 'regulatory' | 'user') => {
    try {
      Alert.alert(
        '重新發送通知',
        `確定要重新發送${type === 'regulatory' ? '監管機構' : '用戶'}通知嗎？`,
        [
          { text: '取消', style: 'cancel' },
          {
            text: '確定',
            onPress: async () => {
              // 這裡應該調用重新發送通知的API
              Alert.alert('成功', `${type === 'regulatory' ? '監管機構' : '用戶'}通知已重新發送`);
            }
          }
        ]
      );
    } catch (error) {
      logger.error('重新發送通知失敗:', error);
      Alert.alert('錯誤', '重新發送通知失敗');
    }
  };

  const getTimeRemaining = (): string => {
    const now = new Date();
    const deadline = new Date(event.complianceDeadline);
    const diff = deadline.getTime() - now.getTime();

    if (diff <= 0) {
      return '已過期';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}小時${minutes}分鐘`;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 事件標題 */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <View style={styles.titleContainer}>
              <Ionicons
                name={getRiskLevelIcon(event.riskLevel)}
                size={24}
                color={getRiskLevelColor(event.riskLevel)}
              />
              <Text style={styles.eventTitle}>{event.title}</Text>
            </View>
            <View style={styles.badgesContainer}>
              <View style={[styles.riskBadge, { backgroundColor: getRiskLevelColor(event.riskLevel) }]}>
                <Text style={styles.riskBadgeText}>{event.riskLevel.toUpperCase()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(event.status) }]}>
                <Text style={styles.statusBadgeText}>{event.status}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* 基本信息 */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>基本信息</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>事件ID:</Text>
            <Text style={styles.infoValue}>{event.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>洩露類型:</Text>
            <Text style={styles.infoValue}>{getBreachTypeLabel(event.breachType)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>發現時間:</Text>
            <Text style={styles.infoValue}>{formatDate(event.discoveryDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>合規截止:</Text>
            <Text style={[styles.infoValue, { color: theme.colors.error }]}>
              {formatDate(event.complianceDeadline)} ({getTimeRemaining()})
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>受影響地區:</Text>
            <Text style={styles.infoValue}>{event.affectedRegions.join(', ')}</Text>
          </View>
        </Card>

        {/* 影響範圍 */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>影響範圍</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>受影響用戶:</Text>
            <Text style={styles.infoValue}>{event.affectedData.affectedUsers} 人</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>受影響記錄:</Text>
            <Text style={styles.infoValue}>{event.affectedData.estimatedRecords} 條</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>數據敏感度:</Text>
            <Text style={styles.infoValue}>{event.affectedData.dataSensitivity}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>數據類別:</Text>
            <Text style={styles.infoValue}>{event.affectedData.dataCategories.join(', ')}</Text>
          </View>
        </Card>

        {/* 事件描述 */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>事件描述</Text>
          <Text style={styles.descriptionText}>{event.description}</Text>
        </Card>

        {/* 通知狀態 */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>通知狀態</Text>

          <View style={styles.notificationRow}>
            <View style={styles.notificationItem}>
              <View style={styles.notificationHeader}>
                <Ionicons
                  name={event.regulatoryNotification ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={event.regulatoryNotification ? theme.colors.success : theme.colors.error}
                />
                <Text style={styles.notificationLabel}>監管機構通知</Text>
              </View>
              {event.regulatoryNotification && event.notificationDate && (
                <Text style={styles.notificationTime}>
                  發送時間: {formatDate(event.notificationDate)}
                </Text>
              )}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => handleResendNotification('regulatory')}
              >
                <Text style={styles.resendButtonText}>重新發送</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.notificationItem}>
              <View style={styles.notificationHeader}>
                <Ionicons
                  name={event.userNotification ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={event.userNotification ? theme.colors.success : theme.colors.error}
                />
                <Text style={styles.notificationLabel}>用戶通知</Text>
              </View>
              {event.userNotification && (
                <Text style={styles.notificationTime}>
                  已發送給 {event.affectedData.affectedUsers} 用戶
                </Text>
              )}
              <TouchableOpacity
                style={styles.resendButton}
                onPress={() => handleResendNotification('user')}
              >
                <Text style={styles.resendButtonText}>重新發送</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* 時間線 */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>事件時間線</Text>

          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={styles.timelineDot} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>事件發現</Text>
                <Text style={styles.timelineTime}>{formatDate(event.discoveryDate)}</Text>
              </View>
            </View>

            {event.containmentDate && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>事件控制</Text>
                  <Text style={styles.timelineTime}>{formatDate(event.containmentDate)}</Text>
                </View>
              </View>
            )}

            {event.resolutionDate && (
              <View style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineTitle}>事件解決</Text>
                  <Text style={styles.timelineTime}>{formatDate(event.resolutionDate)}</Text>
                </View>
              </View>
            )}
          </View>
        </Card>

        {/* 狀態更新 */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>狀態管理</Text>

          <View style={styles.statusButtons}>
            {event.status !== 'investigating' && (
              <Button
                title="開始調查"
                onPress={() => handleStatusUpdate('investigating')}
                style={[styles.statusButton, { backgroundColor: theme.colors.warning }]}
                textStyle={styles.statusButtonText}
                disabled={isUpdating}
              />
            )}

            {event.status !== 'contained' && (
              <Button
                title="標記為已控制"
                onPress={() => handleStatusUpdate('contained')}
                style={[styles.statusButton, { backgroundColor: theme.colors.info }]}
                textStyle={styles.statusButtonText}
                disabled={isUpdating}
              />
            )}

            {event.status !== 'resolved' && (
              <Button
                title="標記為已解決"
                onPress={() => handleStatusUpdate('resolved')}
                style={[styles.statusButton, { backgroundColor: theme.colors.success }]}
                textStyle={styles.statusButtonText}
                disabled={isUpdating}
              />
            )}
          </View>
        </Card>

        {/* 補救措施 */}
        {event.remediation && (
          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>補救措施</Text>
            <Text style={styles.descriptionText}>{event.remediation}</Text>
          </Card>
        )}

        {/* 根本原因 */}
        {event.rootCause && (
          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>根本原因</Text>
            <Text style={styles.descriptionText}>{event.rootCause}</Text>
          </Card>
        )}
      </ScrollView>

      {/* 底部操作 */}
      <View style={styles.footer}>
        <Button
          title="關閉"
          onPress={onClose}
          style={styles.closeButton}
          textStyle={styles.closeButtonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scrollView: {
    flex: 1
  },
  headerCard: {
    margin: 16,
    marginBottom: 8
  },
  headerContent: {
    padding: 16
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginLeft: 12,
    flex: 1
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onPrimary
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.onPrimary
  },
  infoCard: {
    margin: 16,
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    flex: 2,
    textAlign: 'right'
  },
  descriptionText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20
  },
  notificationRow: {
    gap: 16
  },
  notificationItem: {
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  notificationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginLeft: 8
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8
  },
  resendButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.colors.primary,
    borderRadius: 4
  },
  resendButtonText: {
    fontSize: 12,
    color: theme.colors.onPrimary,
    fontWeight: '500'
  },
  timeline: {
    gap: 16
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
    marginRight: 12,
    marginTop: 4
  },
  timelineContent: {
    flex: 1
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text
  },
  timelineTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  statusButton: {
    flex: 1,
    minWidth: (width - 80) / 2
  },
  statusButtonText: {
    color: theme.colors.onPrimary,
    fontSize: 12
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface
  },
  closeButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  closeButtonText: {
    color: theme.colors.text
  }
});
