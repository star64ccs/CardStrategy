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
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Loading, Skeleton, Modal } from '../common';
import { theme } from '../../config/theme';
import { auditLogService } from '../../services/auditLogService';
import {
  AuditEvent,
  AuditEventType,
  AuditSeverity,
  AuditEventStatus,
  AuditLogQuery,
  AuditLogStatistics,
  AuditLogReport,
  AuditLogAlert,
} from '../../types/audit';
import { logger } from '../../utils/logger';

const { width } = Dimensions.get('window');

interface AuditLogDashboardProps {
  onEventPress?: (event: AuditEvent) => void;
  onAlertPress?: (alert: AuditLogAlert) => void;
  onReportPress?: (report: AuditLogReport) => void;
}

export const AuditLogDashboard: React.FC<AuditLogDashboardProps> = ({
  onEventPress,
  onAlertPress,
  onReportPress,
}) => {
  const { t } = useTranslation();
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [alerts, setAlerts] = useState<AuditLogAlert[]>([]);
  const [reports, setReports] = useState<AuditLogReport[]>([]);
  const [statistics, setStatistics] = useState<AuditLogStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState<
    'overview' | 'events' | 'alerts' | 'reports'
  >('overview');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Partial<AuditLogQuery>>({
    page: 1,
    limit: 20,
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });

  useEffect(() => {
    loadData();
    return () => {
      // 清理
      auditLogService.stop();
    };
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // 初始化審計日誌服務
      await auditLogService.initialize();

      // 加載數據
      await refreshData();
    } catch (error) {
      logger.error('加載審計日誌儀表板失敗:', error);
      Alert.alert('錯誤', '加載數據失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const [statsData, eventsData] = await Promise.all([
        auditLogService.getStatistics(),
        auditLogService.queryEvents(filters as AuditLogQuery),
      ]);

      setStatistics(statsData);
      setEvents(eventsData.events);
    } catch (error) {
      logger.error('刷新數據失敗:', error);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const newFilters = {
        ...filters,
        searchText: searchQuery.trim(),
        page: 1,
      };
      setFilters(newFilters);

      try {
        const searchResult = await auditLogService.queryEvents(
          newFilters as AuditLogQuery
        );
        setEvents(searchResult.events);
      } catch (error) {
        logger.error('搜索失敗:', error);
      }
    } else {
      // 清除搜索
      const newFilters = { ...filters };
      delete newFilters.searchText;
      setFilters(newFilters);
      await refreshData();
    }
  };

  const handleCreateTestEvent = async () => {
    try {
      Alert.alert(
        '創建測試事件',
        '這將創建一個測試審計事件，用於驗證審計日誌系統。確定要繼續嗎？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '確定',
            onPress: async () => {
              await auditLogService.logEvent({
                eventType: 'user_login',
                severity: 'medium',
                status: 'success',
                result: 'success',
                title: '測試用戶登錄',
                description: '這是一個測試審計事件，用於驗證審計日誌系統的功能',
                userId: 'test-user-123',
                userEmail: 'test@example.com',
                userRole: 'user',
                ipAddress: '192.168.1.100',
                location: 'Taipei, Taiwan',
                resourceType: 'user_account',
                resourceId: 'user-123',
                resourceName: 'Test User Account',
                sessionId: 'session-123',
                requestId: 'request-123',
                traceId: 'trace-123',
                complianceTags: ['gdpr', 'ccpa'],
                regulatoryRequirements: ['data_protection'],
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

  const handleGenerateReport = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30天前

      const report = await auditLogService.generateReport({
        type: 'summary',
        startDate,
        endDate,
        format: 'json',
      });

      setReports((prev) => [report, ...prev]);
      Alert.alert('成功', '審計報告已生成');
    } catch (error) {
      logger.error('生成報告失敗:', error);
      Alert.alert('錯誤', '生成報告失敗');
    }
  };

  const handleExportLogs = async () => {
    try {
      Alert.alert('導出審計日誌', '選擇導出格式', [
        { text: '取消', style: 'cancel' },
        { text: 'JSON', onPress: () => exportLogs('json') },
        { text: 'CSV', onPress: () => exportLogs('csv') },
        { text: 'XML', onPress: () => exportLogs('xml') },
      ]);
    } catch (error) {
      logger.error('導出日誌失敗:', error);
    }
  };

  const exportLogs = async (format: 'json' | 'csv' | 'xml') => {
    try {
      const fileName = await auditLogService.exportLogs({
        format,
        compression: false,
        encryption: false,
        includeDetails: true,
        includeMetadata: true,
        includeStackTrace: false,
        filters: filters as AuditLogQuery,
        batchSize: 1000,
        maxRecords: 10000,
      });

      Alert.alert('成功', `日誌已導出為 ${fileName}`);
    } catch (error) {
      logger.error('導出日誌失敗:', error);
      Alert.alert('錯誤', '導出日誌失敗');
    }
  };

  const getSeverityColor = (severity: AuditSeverity): string => {
    switch (severity) {
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

  const getSeverityIcon = (severity: AuditSeverity): string => {
    switch (severity) {
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

  const getStatusColor = (status: AuditEventStatus): string => {
    switch (status) {
      case 'success':
        return theme.colors.success;
      case 'failure':
        return theme.colors.error;
      case 'pending':
        return theme.colors.warning;
      case 'cancelled':
        return theme.colors.textSecondary;
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

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>審計日誌儀表板</Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleCreateTestEvent}
        >
          <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleGenerateReport}
        >
          <Ionicons
            name="document-text"
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={handleExportLogs}
        >
          <Ionicons name="download" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="搜索審計事件..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch}
        returnKeyType="search"
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Ionicons name="search" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {[
        { key: 'overview', label: '概覽', icon: 'stats-chart' },
        { key: 'events', label: '事件', icon: 'list' },
        { key: 'alerts', label: '警報', icon: 'warning' },
        { key: 'reports', label: '報告', icon: 'document-text' },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tab, currentTab === tab.key && styles.activeTab]}
          onPress={() => setCurrentTab(tab.key as any)}
        >
          <Ionicons
            name={tab.icon as any}
            size={20}
            color={
              currentTab === tab.key
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabText,
              currentTab === tab.key && styles.activeTabText,
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderOverview = () => {
    if (!statistics) return null;

    return (
      <ScrollView style={styles.content}>
        {/* 統計卡片 */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="list" size={24} color={theme.colors.primary} />
              <Text style={styles.statNumber}>{statistics.totalEvents}</Text>
              <Text style={styles.statLabel}>總事件數</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons name="warning" size={24} color={theme.colors.warning} />
              <Text style={styles.statNumber}>{statistics.securityEvents}</Text>
              <Text style={styles.statLabel}>安全事件</Text>
            </View>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statContent}>
              <Ionicons
                name="alert-circle"
                size={24}
                color={theme.colors.error}
              />
              <Text style={styles.statNumber}>
                {statistics.failedLoginAttempts}
              </Text>
              <Text style={styles.statLabel}>登錄失敗</Text>
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
                {statistics.complianceEvents}
              </Text>
              <Text style={styles.statLabel}>合規事件</Text>
            </View>
          </Card>
        </View>

        {/* 嚴重性分佈 */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>事件嚴重性分佈</Text>
          <View style={styles.severityChart}>
            {Object.entries(statistics.eventsBySeverity).map(
              ([severity, count]) => (
                <View key={severity} style={styles.severityBar}>
                  <View style={styles.severityBarContainer}>
                    <View
                      style={[
                        styles.severityBarFill,
                        {
                          backgroundColor: getSeverityColor(
                            severity as AuditSeverity
                          ),
                          width: `${(count / statistics.totalEvents) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.severityLabel}>
                    {severity.toUpperCase()}
                  </Text>
                  <Text style={styles.severityCount}>{count}</Text>
                </View>
              )
            )}
          </View>
        </Card>

        {/* 最近事件 */}
        <Card style={styles.recentEventsCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>最近事件</Text>
            <TouchableOpacity onPress={() => setCurrentTab('events')}>
              <Text style={styles.viewAllText}>查看全部</Text>
            </TouchableOpacity>
          </View>
          {events.slice(0, 5).map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventItem}
              onPress={() => onEventPress?.(event)}
            >
              <View style={styles.eventHeader}>
                <Ionicons
                  name={getSeverityIcon(event.severity)}
                  size={16}
                  color={getSeverityColor(event.severity)}
                />
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(event.status) },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{event.status}</Text>
                </View>
              </View>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>
              <Text style={styles.eventTime}>
                {formatDate(event.timestamp)}
              </Text>
            </TouchableOpacity>
          ))}
        </Card>
      </ScrollView>
    );
  };

  const renderEvents = () => (
    <ScrollView style={styles.content}>
      {events.length === 0 ? (
        <Card style={styles.emptyCard}>
          <View style={styles.emptyContent}>
            <Ionicons
              name="list"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>沒有審計事件</Text>
            <Text style={styles.emptySubtitle}>
              系統運行正常，未記錄審計事件
            </Text>
          </View>
        </Card>
      ) : (
        events.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => onEventPress?.(event)}
          >
            <View style={styles.eventHeader}>
              <View style={styles.eventTitleContainer}>
                <Ionicons
                  name={getSeverityIcon(event.severity)}
                  size={20}
                  color={getSeverityColor(event.severity)}
                />
                <Text style={styles.eventTitle} numberOfLines={1}>
                  {event.title}
                </Text>
              </View>
              <View style={styles.eventBadges}>
                <View
                  style={[
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(event.severity) },
                  ]}
                >
                  <Text style={styles.severityBadgeText}>
                    {event.severity.toUpperCase()}
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
              {event.userEmail && (
                <View style={styles.eventDetail}>
                  <Ionicons
                    name="person"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.eventDetailText}>{event.userEmail}</Text>
                </View>
              )}
              {event.ipAddress && (
                <View style={styles.eventDetail}>
                  <Ionicons
                    name="globe"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                  <Text style={styles.eventDetailText}>{event.ipAddress}</Text>
                </View>
              )}
              <View style={styles.eventDetail}>
                <Ionicons
                  name="time"
                  size={16}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.eventDetailText}>
                  {formatDate(event.timestamp)}
                </Text>
              </View>
            </View>

            <View style={styles.eventFooter}>
              <Text style={styles.eventType}>{event.eventType}</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={theme.colors.textSecondary}
              />
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );

  const renderAlerts = () => (
    <ScrollView style={styles.content}>
      <Card style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          <Ionicons name="warning" size={48} color={theme.colors.success} />
          <Text style={styles.emptyTitle}>沒有警報</Text>
          <Text style={styles.emptySubtitle}>
            系統運行正常，未檢測到需要警報的事件
          </Text>
        </View>
      </Card>
    </ScrollView>
  );

  const renderReports = () => (
    <ScrollView style={styles.content}>
      <Card style={styles.emptyCard}>
        <View style={styles.emptyContent}>
          <Ionicons
            name="document-text"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>沒有報告</Text>
          <Text style={styles.emptySubtitle}>點擊右上角按鈕生成審計報告</Text>
        </View>
      </Card>
    </ScrollView>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton height={60} />
        <Skeleton height={50} style={{ marginTop: 16 }} />
        <Skeleton height={100} style={{ marginTop: 16 }} />
        <Skeleton height={200} style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      {renderTabs()}

      <ScrollView
        style={styles.mainContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {currentTab === 'overview' && renderOverview()}
        {currentTab === 'events' && renderEvents()}
        {currentTab === 'alerts' && renderAlerts()}
        {currentTab === 'reports' && renderReports()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
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
  chartCard: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 16,
  },
  severityChart: {
    gap: 12,
  },
  severityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  severityBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  severityBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  severityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 60,
  },
  severityCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    minWidth: 30,
    textAlign: 'right',
  },
  recentEventsCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  eventItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  eventTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.onPrimary,
  },
  eventDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 10,
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
  eventTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  eventBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityBadgeText: {
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
  eventType: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});
