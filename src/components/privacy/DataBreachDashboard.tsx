import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Loading, Skeleton } from '../common';
import { theme } from '../../config/theme';
import {
  dataBreachNotificationService,
  DataBreachEvent,
  RiskLevel,
} from '../../services/dataBreachNotificationService';
import { logger } from '../../utils/logger';

const { width } = Dimensions.get('window');

interface DataBreachDashboardProps {
  onEventPress?: (event: DataBreachEvent) => void;
  onCreateEvent?: () => void;
}

export const DataBreachDashboard: React.FC<DataBreachDashboardProps> = ({
  onEventPress,
  onCreateEvent,
}) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<DataBreachEvent[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    loadData();
    return () => {
      // 清理監控
      dataBreachNotificationService.stopMonitoring();
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // 初始化服務
      await dataBreachNotificationService.initialize();
      setIsMonitoring(true);

      // 加載數據
      await refreshData();
    } catch (error) {
      logger.error('加載數據洩露儀表板失敗:', error);
      Alert.alert('錯誤', '加載數據失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const [eventsData, statsData] = await Promise.all([
        dataBreachNotificationService.getBreachEvents(),
        dataBreachNotificationService.getStatistics(),
      ]);

      setEvents(eventsData);
      setStatistics(statsData);
    } catch (error) {
      logger.error('刷新數據失敗:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleCreateTestEvent = async () => {
    try {
      Alert.alert(
        '創建測試事件',
        '這將創建一個測試數據洩露事件，用於驗證通知系統。確定要繼續嗎？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '確定',
            onPress: async () => {
              await dataBreachNotificationService.createManualBreachEvent({
                title: '測試數據洩露事件',
                description: '這是一個測試事件，用於驗證數據洩露通知系統的功能',
                breachType: 'unauthorized_access',
                riskLevel: 'medium',
                affectedData: {
                  dataCategories: ['personal_info', 'contact_info'],
                  affectedUsers: 10,
                  dataSensitivity: 'medium',
                  estimatedRecords: 50,
                },
                affectedRegions: ['TW', 'US'],
              });

              await refreshData();
              Alert.alert('成功', '測試事件已創建');
            },
          },
        ]
      );
    } catch (error) {
      logger.error('創建測試事件失敗:', error);
      Alert.alert('錯誤', '創建測試事件失敗');
    }
  };

  const handleEventPress = (event: DataBreachEvent) => {
    if (onEventPress) {
      onEventPress(event);
    }
  };

  const getRiskLevelColor = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'critical':
        return theme.colors.error;
      case 'high':
        return theme.colors.warning;
      case 'medium':
        return theme.colors.info;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.text;
    }
  };

  const getRiskLevelIcon = (riskLevel: RiskLevel): string => {
    switch (riskLevel) {
      case 'critical':
        return 'alert-circle';
      case 'high':
        return 'warning';
      case 'medium':
        return 'information-circle';
      case 'low':
        return 'checkmark-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'discovered':
        return theme.colors.error;
      case 'investigating':
        return theme.colors.warning;
      case 'contained':
        return theme.colors.info;
      case 'resolved':
        return theme.colors.success;
      default:
        return theme.colors.text;
    }
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton height={200} />
        <Skeleton height={100} style={{ marginTop: 16 }} />
        <Skeleton height={300} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }
    >
      {/* 統計卡片 */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons
              name="alert-circle"
              size={24}
              color={theme.colors.error}
            />
            <Text style={styles.statNumber}>
              {statistics?.totalEvents || 0}
            </Text>
            <Text style={styles.statLabel}>總事件數</Text>
          </View>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="warning" size={24} color={theme.colors.warning} />
            <Text style={styles.statNumber}>
              {statistics?.criticalEvents || 0}
            </Text>
            <Text style={styles.statLabel}>嚴重事件</Text>
          </View>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons name="time" size={24} color={theme.colors.info} />
            <Text style={styles.statNumber}>
              {statistics?.pendingNotifications || 0}
            </Text>
            <Text style={styles.statLabel}>待通知</Text>
          </View>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statContent}>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={theme.colors.success}
            />
            <Text style={styles.statNumber}>
              {Math.round(statistics?.complianceRate || 100)}%
            </Text>
            <Text style={styles.statLabel}>合規率</Text>
          </View>
        </Card>
      </View>

      {/* 監控狀態 */}
      <Card style={styles.monitoringCard}>
        <View style={styles.monitoringHeader}>
          <View style={styles.monitoringStatus}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isMonitoring
                    ? theme.colors.success
                    : theme.colors.error,
                },
              ]}
            />
            <Text style={styles.monitoringText}>
              {isMonitoring ? '監控運行中' : '監控已停止'}
            </Text>
          </View>
          <Text style={styles.monitoringSubtext}>每5分鐘自動掃描安全事件</Text>
        </View>
      </Card>

      {/* 操作按鈕 */}
      <View style={styles.actionsContainer}>
        <Button
          title="創建測試事件"
          onPress={handleCreateTestEvent}
          style={styles.actionButton}
          textStyle={styles.actionButtonText}
        />
        {onCreateEvent && (
          <Button
            title="手動創建事件"
            onPress={onCreateEvent}
            style={[styles.actionButton, styles.primaryButton]}
            textStyle={[styles.actionButtonText, styles.primaryButtonText]}
          />
        )}
      </View>

      {/* 事件列表 */}
      <View style={styles.eventsContainer}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>最近事件</Text>
          <Text style={styles.eventsCount}>{events.length} 個事件</Text>
        </View>

        {events.length === 0 ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons
                name="shield-checkmark"
                size={48}
                color={theme.colors.success}
              />
              <Text style={styles.emptyTitle}>沒有數據洩露事件</Text>
              <Text style={styles.emptySubtitle}>
                系統運行正常，未檢測到安全威脅
              </Text>
            </View>
          </Card>
        ) : (
          events.slice(0, 10).map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => handleEventPress(event)}
            >
              <View style={styles.eventHeader}>
                <View style={styles.eventTitleContainer}>
                  <Ionicons
                    name={getRiskLevelIcon(event.riskLevel)}
                    size={20}
                    color={getRiskLevelColor(event.riskLevel)}
                  />
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.title}
                  </Text>
                </View>
                <View style={styles.eventBadges}>
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: getRiskLevelColor(event.riskLevel) },
                    ]}
                  >
                    <Text style={styles.riskBadgeText}>
                      {event.riskLevel.toUpperCase()}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(event.status) },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>{event.status}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>

              <View style={styles.eventDetails}>
                <View style={styles.eventDetail}>
                  <Ionicons
                    name="people"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.eventDetailText}>
                    {event.affectedData.affectedUsers} 用戶受影響
                  </Text>
                </View>
                <View style={styles.eventDetail}>
                  <Ionicons
                    name="calendar"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.eventDetailText}>
                    {formatDate(event.discoveryDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.eventFooter}>
                <View style={styles.notificationStatus}>
                  {event.regulatoryNotification && (
                    <View style={styles.notificationBadge}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={theme.colors.success}
                      />
                      <Text style={styles.notificationText}>監管通知</Text>
                    </View>
                  )}
                  {event.userNotification && (
                    <View style={styles.notificationBadge}>
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color={theme.colors.success}
                      />
                      <Text style={styles.notificationText}>用戶通知</Text>
                    </View>
                  )}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 48) / 2,
    maxWidth: (width - 48) / 2,
  },
  statContent: {
    alignItems: 'center',
    padding: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  monitoringCard: {
    margin: 16,
    marginTop: 0,
  },
  monitoringHeader: {
    padding: 16,
  },
  monitoringStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  monitoringText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  monitoringSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionButtonText: {
    color: theme.colors.text,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  primaryButtonText: {
    color: theme.colors.onPrimary,
  },
  eventsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  eventsCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: 8,
    flex: 1,
  },
  eventBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  eventDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  eventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventDetailText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationStatus: {
    flexDirection: 'row',
    gap: 8,
  },
  notificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.success}20`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  notificationText: {
    fontSize: 10,
    color: theme.colors.success,
    marginLeft: 2,
  },
});
