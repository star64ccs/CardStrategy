import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { mobileService } from '@/services/mobileService';
import {
  mobileOptimizer,
  getDeviceInfo,
  getResponsiveValue,
} from '@/utils/mobileOptimizer';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface MobileDashboardProps {
  userId?: string;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [mobileHealth, setMobileHealth] = useState<any>(null);
  const [mobileMetrics, setMobileMetrics] = useState<any>(null);
  const [analyticsReport, setAnalyticsReport] = useState<any>(null);
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<any[]>(
    []
  );
  const [notificationSettings, setNotificationSettings] = useState<any>(null);

  const { handleError } = useErrorHandler();

  const loadData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const device = getDeviceInfo();
      setDeviceInfo(device);

      const [health, metrics, analytics, suggestions, settings] =
        await Promise.all([
          mobileService.getMobileHealth(device),
          mobileService.getMobileMetrics('24h'),
          mobileService.getMobileAnalyticsReport({ timeframe: '7d' }),
          mobileService.getOptimizationSuggestions({ deviceInfo: device }),
          mobileService.getNotificationSettings(),
        ]);

      setMobileHealth(health);
      setMobileMetrics(metrics);
      setAnalyticsReport(analytics);
      setOptimizationSuggestions(suggestions);
      setNotificationSettings(settings);
    } catch (error) {
      handleError(error, '數據加載失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const handleOptimizationAction = async (suggestion: any) => {
    try {
      setLoading(true);
      // 執行優化建議
      Alert.alert('成功', `已執行優化建議: ${suggestion.title}`);
      await loadData(); // 重新加載數據
    } catch (error) {
      handleError(error, '執行優化建議失敗');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotificationSetting = async (setting: string) => {
    try {
      const newSettings = {
        ...notificationSettings,
        [setting]: !notificationSettings[setting],
      };

      await mobileService.updateNotificationSettings(newSettings);
      setNotificationSettings(newSettings);
      Alert.alert('成功', '通知設置已更新');
    } catch (error) {
      handleError(error, '更新通知設置失敗');
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* 設備信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>設備信息</Text>
        <View style={styles.deviceInfoGrid}>
          <View style={styles.deviceInfoCard}>
            <Text style={styles.deviceInfoLabel}>平台</Text>
            <Text style={styles.deviceInfoValue}>
              {deviceInfo?.platform || 'N/A'}
            </Text>
          </View>
          <View style={styles.deviceInfoCard}>
            <Text style={styles.deviceInfoLabel}>版本</Text>
            <Text style={styles.deviceInfoValue}>
              {deviceInfo?.version || 'N/A'}
            </Text>
          </View>
          <View style={styles.deviceInfoCard}>
            <Text style={styles.deviceInfoLabel}>設備類型</Text>
            <Text style={styles.deviceInfoValue}>
              {deviceInfo?.isTablet
                ? '平板'
                : deviceInfo?.isMobile
                  ? '手機'
                  : '桌面'}
            </Text>
          </View>
          <View style={styles.deviceInfoCard}>
            <Text style={styles.deviceInfoLabel}>屏幕尺寸</Text>
            <Text style={styles.deviceInfoValue}>
              {deviceInfo?.dimensions?.width} x {deviceInfo?.dimensions?.height}
            </Text>
          </View>
        </View>
      </View>

      {/* 健康狀態 */}
      {mobileHealth && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>健康狀態</Text>
          <View
            style={[styles.healthCard, styles[`health${mobileHealth.status}`]]}
          >
            <View style={styles.healthHeader}>
              <MaterialIcons
                name={
                  mobileHealth.status === 'healthy' ? 'check-circle' : 'warning'
                }
                size={24}
                color={
                  mobileHealth.status === 'healthy' ? '#4CAF50' : '#FF9800'
                }
              />
              <Text style={styles.healthStatus}>
                {mobileHealth.status === 'healthy' ? '健康' : '警告'}
              </Text>
            </View>
            <View style={styles.healthChecks}>
              {Object.entries(mobileHealth.checks).map(([check, status]) => (
                <View key={check} style={styles.healthCheck}>
                  <MaterialIcons
                    name={status ? 'check' : 'close'}
                    size={16}
                    color={status ? '#4CAF50' : '#F44336'}
                  />
                  <Text style={styles.healthCheckText}>
                    {check === 'network'
                      ? '網絡'
                      : check === 'storage'
                        ? '存儲'
                        : check === 'performance'
                          ? '性能'
                          : '電池'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* 性能指標 */}
      {mobileMetrics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>性能指標</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>加載時間</Text>
              <Text style={styles.metricValue}>
                {mobileMetrics.performance?.loadTime?.toFixed(2) || '0'}ms
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>渲染時間</Text>
              <Text style={styles.metricValue}>
                {mobileMetrics.performance?.renderTime?.toFixed(2) || '0'}ms
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>內存使用</Text>
              <Text style={styles.metricValue}>
                {mobileMetrics.performance?.memoryUsage?.toFixed(1) || '0'}MB
              </Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>會話數</Text>
              <Text style={styles.metricValue}>
                {mobileMetrics.usage?.sessionCount || '0'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderOptimizationTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>優化建議</Text>

      {optimizationSuggestions.length > 0 ? (
        optimizationSuggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <MaterialIcons
                name={
                  suggestion.type === 'performance'
                    ? 'speed'
                    : suggestion.type === 'battery'
                      ? 'battery-full'
                      : suggestion.type === 'storage'
                        ? 'storage'
                        : 'wifi'
                }
                size={20}
                color="#2196F3"
              />
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <View
                style={[
                  styles.priorityBadge,
                  styles[`priority${suggestion.priority}`],
                ]}
              >
                <Text style={styles.priorityText}>
                  {suggestion.priority === 'high'
                    ? '高'
                    : suggestion.priority === 'medium'
                      ? '中'
                      : '低'}
                </Text>
              </View>
            </View>
            <Text style={styles.suggestionDescription}>
              {suggestion.description}
            </Text>
            <View style={styles.suggestionFooter}>
              <Text style={styles.impactText}>影響: {suggestion.impact}%</Text>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleOptimizationAction(suggestion)}
              >
                <Text style={styles.actionButtonText}>{suggestion.action}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="check-circle" size={48} color="#4CAF50" />
          <Text style={styles.emptyStateText}>沒有優化建議</Text>
          <Text style={styles.emptyStateSubtext}>您的設備運行良好</Text>
        </View>
      )}
    </View>
  );

  const renderNotificationsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>通知設置</Text>

      {notificationSettings && (
        <View style={styles.notificationSettings}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>價格提醒</Text>
              <Text style={styles.settingDescription}>卡片價格變動通知</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                notificationSettings.priceAlerts && styles.toggleActive,
              ]}
              onPress={() => toggleNotificationSetting('priceAlerts')}
            >
              <View
                style={[
                  styles.toggleThumb,
                  notificationSettings.priceAlerts && styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>市場更新</Text>
              <Text style={styles.settingDescription}>市場趨勢和新聞</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                notificationSettings.marketUpdates && styles.toggleActive,
              ]}
              onPress={() => toggleNotificationSetting('marketUpdates')}
            >
              <View
                style={[
                  styles.toggleThumb,
                  notificationSettings.marketUpdates &&
                    styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>投資組合變更</Text>
              <Text style={styles.settingDescription}>投資組合相關通知</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                notificationSettings.portfolioChanges && styles.toggleActive,
              ]}
              onPress={() => toggleNotificationSetting('portfolioChanges')}
            >
              <View
                style={[
                  styles.toggleThumb,
                  notificationSettings.portfolioChanges &&
                    styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>系統通知</Text>
              <Text style={styles.settingDescription}>應用系統通知</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.toggle,
                notificationSettings.systemNotifications && styles.toggleActive,
              ]}
              onPress={() => toggleNotificationSetting('systemNotifications')}
            >
              <View
                style={[
                  styles.toggleThumb,
                  notificationSettings.systemNotifications &&
                    styles.toggleThumbActive,
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 靜音時段設置 */}
      {notificationSettings?.quietHours && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>靜音時段</Text>
          <View style={styles.quietHoursCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>啟用靜音時段</Text>
                <Text style={styles.settingDescription}>
                  {notificationSettings.quietHours.startTime} -{' '}
                  {notificationSettings.quietHours.endTime}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.toggle,
                  notificationSettings.quietHours.enabled &&
                    styles.toggleActive,
                ]}
                onPress={() => toggleNotificationSetting('quietHours.enabled')}
              >
                <View
                  style={[
                    styles.toggleThumb,
                    notificationSettings.quietHours.enabled &&
                      styles.toggleThumbActive,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderAnalyticsTab = () => (
    <View style={styles.tabContent}>
      {analyticsReport && (
        <>
          {/* 使用情況 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>使用情況</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>會話數</Text>
                <Text style={styles.analyticsValue}>
                  {analyticsReport.usage?.sessionCount?.toLocaleString() || '0'}
                </Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>總使用時間</Text>
                <Text style={styles.analyticsValue}>
                  {Math.round((analyticsReport.usage?.totalTime || 0) / 60)}分鐘
                </Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>平均會話</Text>
                <Text style={styles.analyticsValue}>
                  {Math.round(analyticsReport.usage?.averageSessionTime || 0)}
                  分鐘
                </Text>
              </View>
            </View>
          </View>

          {/* 性能分析 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>性能分析</Text>
            <View style={styles.analyticsGrid}>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>平均加載時間</Text>
                <Text style={styles.analyticsValue}>
                  {analyticsReport.performance?.averageLoadTime?.toFixed(2) ||
                    '0'}
                  ms
                </Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>崩潰率</Text>
                <Text style={styles.analyticsValue}>
                  {(analyticsReport.performance?.crashRate * 100 || 0).toFixed(
                    2
                  )}
                  %
                </Text>
              </View>
              <View style={styles.analyticsCard}>
                <Text style={styles.analyticsLabel}>內存使用</Text>
                <Text style={styles.analyticsValue}>
                  {analyticsReport.performance?.memoryUsage?.toFixed(1) || '0'}
                  MB
                </Text>
              </View>
            </View>
          </View>

          {/* 最常用功能 */}
          {analyticsReport.usage?.mostUsedFeatures && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>最常用功能</Text>
              <View style={styles.featuresList}>
                {analyticsReport.usage.mostUsedFeatures.map(
                  (feature: string, index: number) => (
                    <View key={index} style={styles.featureItem}>
                      <Text style={styles.featureRank}>#{index + 1}</Text>
                      <Text style={styles.featureName}>{feature}</Text>
                    </View>
                  )
                )}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'optimization':
        return renderOptimizationTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return renderOverviewTab();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>加載中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 標題 */}
      <View style={styles.header}>
        <Text style={styles.title}>移動端儀表板</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <MaterialIcons name="refresh" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* 標籤欄 */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: '概覽', icon: 'dashboard' },
          { key: 'optimization', label: '優化', icon: 'speed' },
          { key: 'notifications', label: '通知', icon: 'notifications' },
          { key: 'analytics', label: '分析', icon: 'analytics' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tabButton,
              activeTab === tab.key && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#2196F3' : '#666'}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 內容區域 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');
const responsivePadding = getResponsiveValue({
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsivePadding,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  tabLabel: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  activeTabLabel: {
    color: '#2196F3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: responsivePadding,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  deviceInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  deviceInfoCard: {
    width: (width - responsivePadding * 2 - 12) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  deviceInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  healthCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  healthhealthy: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  healthwarning: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  healtherror: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  healthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthStatus: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  healthChecks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  healthCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  healthCheckText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: (width - responsivePadding * 2 - 12) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  suggestionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  priorityhigh: {
    backgroundColor: '#F44336',
  },
  prioritymedium: {
    backgroundColor: '#FF9800',
  },
  prioritylow: {
    backgroundColor: '#4CAF50',
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactText: {
    fontSize: 12,
    color: '#666',
  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  notificationSettings: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#2196F3',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  quietHoursCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticsCard: {
    width: (width - responsivePadding * 2 - 12) / 2,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  analyticsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  featuresList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginRight: 12,
  },
  featureName: {
    fontSize: 16,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default MobileDashboard;
