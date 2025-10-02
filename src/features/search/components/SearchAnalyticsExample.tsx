import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useSearchAnalytics } from '../hooks/useSearchAnalytics';
import type { SearchAnalyticsAlert } from '../types/searchAnalytics';

const SearchAnalyticsExample: React.FC = () => {
  const {
    analytics,
    isInitialized,
    isLoading,
    error,
    config,
    alerts,
    reports,

    // 計算Property
    statistics,
    popularSearches,
    trendingSearches,
    categoryStats,
    hourlyStats,
    performanceMetrics,
    userBehavior,
    hasCriticalInsights,
    hasHighPriorityRecommendations,
    activeAlerts,
    isPerformanceGood,

    // OperationMethod
    initialize,
    getAnalytics,
    generateAnalyticsReport,
    exportAnalyticsData,
    createAnalyticsAlert,
    updateAnalyticsAlert,
    deleteAnalyticsAlert,
    setAnalyticsFilter,
    clearAnalyticsFilter,
    updateAnalyticsConfig,
    clearAnalyticsError,
    setCurrentAnalyticsReport,
    deleteAnalyticsReport,
    trackSearchEvent,
    updateRealTimeAnalyticsMetrics,
  } = useSearchAnalytics();

  const [selectedTab, setSelectedTab] = useState<
    'dashboard' | 'alerts' | 'reports' | 'config'
  >('dashboard');
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [newAlert, setNewAlert] = useState<Partial<SearchAnalyticsAlert>>({
    name: '',
    description: '',
    threshold: 0,
    operator: 'gt',
    enabled: true,
    notificationChannels: ['email'],
  });

  // Initialize
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // 模擬SearchEvent
  const _simulateSearchEvent = () => {
    trackSearchEvent({
      type: 'search_performed',
      userId: 'user123',
      sessionId: 'session456',
      query: 'Pokemon Charizard',
      results: 45,
      responseTime: Math.floor(Math.random() * 200) + 50,
      filters: { category: 'Pokemon' },
      sortBy: 'relevance',
      page: 1,
      limit: 20,
      category: 'Pokemon',
      success: Math.random() > 0.1,
      userAgent: 'CardStrategy/1.0',
      platform: 'iOS',
    });
  };

  // CreateAlert
  const _handleCreateAlert = async () => {
    if (!newAlert.name || !newAlert.description) {
      Alert.alert('Error', '請填寫警報名稱和描述');
      return;
    }

    const _alertId = await createAnalyticsAlert({
      name: newAlert.name,
      description: newAlert.description,
      condition: {
        metric: 'errorRate',
        timeWindow: 300000,
        aggregation: 'avg',
      },
      threshold: newAlert.threshold || 0,
      operator: newAlert.operator || 'gt',
      enabled: newAlert.enabled || true,
      notificationChannels: newAlert.notificationChannels || ['email'],
    });

    if (alertId) {
      Alert.alert('Success', '警報CreateSuccess');
      setShowCreateAlert(false);
      setNewAlert({
        name: '',
        description: '',
        threshold: 0,
        operator: 'gt',
        enabled: true,
        notificationChannels: ['email'],
      });
    }
  };

  // 生成Report
  const _handleGenerateReport = async () => {
    try {
      const _report = await generateAnalyticsReport(
        '搜索分析報告',
        '包含搜索趨勢、用戶行為和性能指標的綜合報告',
        {
          start: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7天前
          end: Date.now(),
        }
      );

      if (report) {
        Alert.alert('Success', '報告生成Success');
      }
    } catch (error) {
      Alert.alert('Error', '報告生成Failed');
    }
  };

  // ExportData
  const _handleExportData = async () => {
    if (!analytics) {
      Alert.alert('Error', '沒有可導出的數據');
      return;
    }

    const _data = await exportAnalyticsData(analytics, {
      format: 'json',
      includeCharts: true,
      includeInsights: true,
      includeRecommendations: true,
      compression: false,
    });

    if (data) {
      Alert.alert('Success', '數據導出Success');
      console.log('導出數據:', data);
    }
  };

  // 渲染儀Table板
  const _renderDashboard = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>搜索分析儀表板</Text>

      {/* 實時指標 */}
      <View style={styles.realtimeMetrics}>
        <Text style={styles.sectionTitle}>實時指標</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>當前搜索</Text>
            <Text style={styles.metricValue}>--</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>平均響應時間</Text>
            <Text style={styles.metricValue}>--ms</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>錯誤率</Text>
            <Text style={styles.metricValue}>--%</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>吞吐量</Text>
            <Text style={styles.metricValue}>--</Text>
          </View>
        </View>
      </View>

      {/* 統Count據 */}
      {statistics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>統計數據</Text>
          <View style={styles.statsList}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>總搜索次數</Text>
              <Text style={styles.statValue}>
                {statistics.totalSearches.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>唯一用戶</Text>
              <Text style={styles.statValue}>
                {statistics.uniqueUsers.toLocaleString()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>搜索成功率</Text>
              <Text style={styles.statValue}>
                {(statistics.searchSuccessRate * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>轉化率</Text>
              <Text style={styles.statValue}>
                {(statistics.conversionRate * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 熱門Search */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>熱門搜索</Text>
        {popularSearches.map((search, index) => (
          <View key={index} style={styles.searchItem}>
            <Text style={styles.searchQuery}>{search.query}</Text>
            <Text style={styles.searchStats}>
              {search.searches} 次搜索 • {search.uniqueUsers} 用戶 •{' '}
              {search.successRate * 100}% 成功率
            </Text>
          </View>
        ))}
      </View>

      {/* 趨勢Search */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>趨勢搜索</Text>
        {trendingSearches.map((search, index) => (
          <View key={index} style={styles.searchItem}>
            <Text style={styles.searchQuery}>{search.query}</Text>
            <Text style={styles.searchStats}>
              增長 {search.growthRate * 100}% • {search.currentSearches}{' '}
              當前搜索
            </Text>
          </View>
        ))}
      </View>

      {/* Class別Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>類別統計</Text>
        {categoryStats.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <Text style={styles.categoryName}>{category.category}</Text>
            <Text style={styles.categoryStats}>
              {category.searches} 搜索 • {category.marketShare * 100}% 市場份額
            </Text>
          </View>
        ))}
      </View>

      {/* 洞察和建議 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>洞察和建議</Text>
        <Text style={styles.emptyText}>洞察和建議功能暫時不可用</Text>
      </View>

      {/* Operation按鈕 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>操作</Text>
        <TouchableOpacity style={styles.button} onPress={simulateSearchEvent}>
          <Text style={styles.buttonText}>模擬搜索事件</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleGenerateReport}>
          <Text style={styles.buttonText}>生成報告</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <Text style={styles.buttonText}>導出數據</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // 渲染AlertManage
  const _renderAlerts = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>警報管理</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowCreateAlert(true)}
      >
        <Text style={styles.buttonText}>創建新警報</Text>
      </TouchableOpacity>

      {alerts.map((alert, index) => (
        <View key={index} style={styles.alertCard}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertName}>{alert.name}</Text>
            <Switch
              value={alert.enabled}
              onValueChange={async value => {
                await updateAnalyticsAlert(alert.id, { enabled: value });
              }}
            />
          </View>
          <Text style={styles.alertDescription}>{alert.description}</Text>
          <Text style={styles.alertThreshold}>
            閾值: {alert.operator} {alert.threshold}
          </Text>
          <Text style={styles.alertTriggerCount}>
            觸發次數: {alert.triggerCount}
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={() => deleteAnalyticsAlert(alert.id)}
          >
            <Text style={styles.buttonText}>刪除</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* CreateAlert模態框 */}
      {showCreateAlert && (
        <View style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>創建新警報</Text>
            <TextInput
              style={styles.input}
              placeholder='警報名稱'
              value={newAlert.name}
              onChangeText={text => setNewAlert({ ...newAlert, name: text })}
            />
            <TextInput
              style={styles.input}
              placeholder='警報描述'
              value={newAlert.description}
              onChangeText={text =>
                setNewAlert({ ...newAlert, description: text })
              }
            />
            <TextInput
              style={styles.input}
              placeholder='閾值'
              value={newAlert.threshold?.toString()}
              onChangeText={text =>
                setNewAlert({ ...newAlert, threshold: parseFloat(text) || 0 })
              }
              keyboardType='numeric'
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setShowCreateAlert(false)}
              >
                <Text style={styles.buttonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.button}
                onPress={handleCreateAlert}
              >
                <Text style={styles.buttonText}>創建</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );

  // 渲染ReportManage
  const _renderReports = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>報告管理</Text>

      {/* 當前Report */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>當前報告</Text>
        <Text style={styles.emptyText}>當前報告功能暫時不可用</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>歷史報告</Text>
        {reports.map((report, index) => (
          <View key={index} style={styles.reportCard}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportDescription}>{report.description}</Text>
            <Text style={styles.reportDate}>
              生成時間: {new Date(report.generatedAt).toLocaleString()}
            </Text>
            <View style={styles.reportActions}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setCurrentAnalyticsReport(report)}
              >
                <Text style={styles.buttonText}>查看</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.deleteButton]}
                onPress={() => deleteAnalyticsReport(report.id)}
              >
                <Text style={styles.buttonText}>刪除</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // 渲染Configure
  const _renderConfig = () => (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>配置管理</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基本配置</Text>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>啟用分析</Text>
          <Switch
            value={config.enabled}
            onValueChange={value => updateAnalyticsConfig({ enabled: value })}
          />
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>實時追蹤</Text>
          <Switch
            value={config.realTimeTracking}
            onValueChange={value =>
              updateAnalyticsConfig({ realTimeTracking: value })
            }
          />
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>隱私模式</Text>
          <Switch
            value={config.privacyMode}
            onValueChange={value =>
              updateAnalyticsConfig({ privacyMode: value })
            }
          />
        </View>
        <View style={styles.configItem}>
          <Text style={styles.configLabel}>匿名化數據</Text>
          <Switch
            value={config.anonymizeData}
            onValueChange={value =>
              updateAnalyticsConfig({ anonymizeData: value })
            }
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>數據保留</Text>
        <Text style={styles.configValue}>
          保留天數: {config.dataRetentionDays} 天
        </Text>
        <Text style={styles.configValue}>
          追蹤間隔: {config.trackingInterval / 1000} 秒
        </Text>
      </View>
    </ScrollView>
  );

  // Get洞察顏色
  const _getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return '#ff9800';
      case 'critical':
        return '#f44336';
      case 'opportunity':
        return '#4caf50';
      default:
        return '#2196f3';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#007AFF' />
        <Text style={styles.loadingText}>加載中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>錯誤: {error}</Text>
        <TouchableOpacity style={styles.button} onPress={clearAnalyticsError}>
          <Text style={styles.buttonText}>重試</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tag欄 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'dashboard' && styles.activeTab]}
          onPress={() => setSelectedTab('dashboard')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'dashboard' && styles.activeTabText,
            ]}
          >
            儀表板
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'alerts' && styles.activeTab]}
          onPress={() => setSelectedTab('alerts')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'alerts' && styles.activeTabText,
            ]}
          >
            警報
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'reports' && styles.activeTab]}
          onPress={() => setSelectedTab('reports')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'reports' && styles.activeTabText,
            ]}
          >
            報告
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'config' && styles.activeTab]}
          onPress={() => setSelectedTab('config')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'config' && styles.activeTabText,
            ]}
          >
            配置
          </Text>
        </TouchableOpacity>
      </View>

      {/* ContentDistrict域 */}
      {selectedTab === 'dashboard' && renderDashboard()}
      {selectedTab === 'alerts' && renderAlerts()}
      {selectedTab === 'reports' && renderReports()}
      {selectedTab === 'config' && renderConfig()}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  statsList: {
    gap: 10,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  searchItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchQuery: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  categoryItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryStats: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  insightCard: {
    padding: 15,
    borderLeftWidth: 4,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 4,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  insightImpact: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  recommendationCard: {
    padding: 15,
    backgroundColor: '#f0f8ff',
    marginBottom: 10,
    borderRadius: 4,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  recommendationPriority: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  alertCard: {
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  alertName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  alertThreshold: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  alertTriggerCount: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
  },
  modal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  reportCard: {
    padding: 15,
    backgroundColor: '#fff',
    marginVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  configLabel: {
    fontSize: 16,
    color: '#333',
  },
  configValue: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  realtimeMetrics: {
    margin: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default SearchAnalyticsExample;
