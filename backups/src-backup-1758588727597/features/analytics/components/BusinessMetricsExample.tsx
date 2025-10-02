// 業務指標分析示例組件
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useBusinessMetrics } from '../hooks/useBusinessMetrics';
import type { BusinessMetricsExportOptions } from '../types/businessMetrics';

const BusinessMetricsExample: React.FC = () => {
  const {
    isInitialized,
    isLoading,
    error,
    metrics,
    analysis,
    reports,
    insights,
    recommendations,
    alerts,
    config,
    realTimeMetrics,
    lastUpdate,
    activeAlerts,
    criticalAlerts,
    positiveInsights,
    negativeInsights,
    highPriorityRecommendations,
    isHealthy,
    getAnalysis,
    generateReport,
    exportData,
    createAlert,
    updateAlert,
    deleteAlert,
    getConfig,
    updateConfig,
    clearError,
    setFilter,
    clearFilter,
  } = useBusinessMetrics();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'reports' | 'alerts' | 'insights' | 'config'
  >('dashboard');
  const [selectedExportFormat, setSelectedExportFormat] = useState<
    'json' | 'csv' | 'excel' | 'pdf'
  >('json');

  useEffect(() => {
    if (isInitialized) {
      getAnalysis();
    }
  }, [isInitialized, getAnalysis]);

  const _handleGenerateReport = async () => {
    try {
      const _report = await generateReport();
      Alert.alert('成功', `報告已生成: ${report.title}`);
    } catch (error) {
      Alert.alert('錯誤', '生成報告失敗');
    }
  };

  const _handleExportData = async () => {
    if (!analysis) {
      Alert.alert('錯誤', '沒有可導出的數據');
      return;
    }

    try {
      const options: BusinessMetricsExportOptions = {
        format: selectedExportFormat,
        includeMetrics: true,
        includeInsights: true,
        includeRecommendations: true,
        includeAlerts: true,
        includeHistorical: true,
        includeProjections: false,
        includeComparisons: false,
        anonymize: false,
        compress: false,
      };

      if (!exportData || typeof exportData !== 'function') {
        Alert.alert('錯誤', '導出功能不可用');
        return;
      }
      const _exportedData = await (exportData as any)(analysis, options);
      Alert.alert(
        '成功',
        `數據已導出為 ${selectedExportFormat.toUpperCase()} 格式`
      );
      console.log('導出數據:', exportedData);
    } catch (error) {
      Alert.alert('錯誤', '導出數據失敗');
    }
  };

  const _handleCreateAlert = async () => {
    try {
      const _alert = await createAlert({
        type: 'threshold',
        severity: 'medium',
        category: 'revenue',
        title: '測試警報',
        description: '這是一個測試警報',
        metric: 'revenueGrowthRate',
        currentValue: 0.08,
        thresholdValue: 0.1,
        deviation: -0.02,
        trend: 'down',
      });
      Alert.alert('成功', `警報已創建: ${alert.title}`);
    } catch (error) {
      Alert.alert('錯誤', '創建警報失敗');
    }
  };

  const _handleUpdateConfig = async () => {
    try {
      await updateConfig({
        updateInterval: 60000, // 1分鐘
        realTimeUpdates: true,
      });
      Alert.alert('成功', '配置已更新');
    } catch (error) {
      Alert.alert('錯誤', '更新配置失敗');
    }
  };

  const _renderDashboard = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>📊 業務指標儀表板</Text>

      {isLoading && <Text style={styles.loadingText}>載入中...</Text>}
      {error && <Text style={styles.errorText}>錯誤: {error}</Text>}

      {metrics && (
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>總收入</Text>
            <Text style={styles.metricValue}>
              ${metrics.revenue.totalRevenue.toLocaleString()}
            </Text>
            <Text style={styles.metricChange}>
              +{metrics.revenue.revenueGrowthRate * 100}%
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>淨利潤</Text>
            <Text style={styles.metricValue}>
              ${metrics.profit.netProfit.toLocaleString()}
            </Text>
            <Text style={styles.metricChange}>
              +{metrics.profit.profitGrowthRate * 100}%
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>客戶總數</Text>
            <Text style={styles.metricValue}>
              {metrics.customer.totalCustomers.toLocaleString()}
            </Text>
            <Text style={styles.metricChange}>
              +{metrics.growth.userGrowthRate * 100}%
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>客戶滿意度</Text>
            <Text style={styles.metricValue}>
              {metrics.customer.customerSatisfaction * 100}%
            </Text>
            <Text style={styles.metricChange}>穩定</Text>
          </View>
        </View>
      )}

      {analysis && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>
            業務健康度: {analysis.summary.overallHealth}
          </Text>
          <Text style={styles.summaryText}>
            關鍵指標: {analysis.summary.keyMetrics.join(', ')}
          </Text>
          <Text style={styles.summaryText}>
            正面趨勢: {analysis.summary.trends.positive.length} 項
          </Text>
          <Text style={styles.summaryText}>
            負面趨勢: {analysis.summary.trends.negative.length} 項
          </Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.button} onPress={handleGenerateReport}>
          <Text style={styles.buttonText}>生成報告</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleExportData}>
          <Text style={styles.buttonText}>導出數據</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleCreateAlert}>
          <Text style={styles.buttonText}>創建警報</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.exportFormatContainer}>
        <Text style={styles.exportFormatTitle}>導出格式:</Text>
        {(['json', 'csv', 'excel', 'pdf'] as const).map(format => (
          <TouchableOpacity
            key={format}
            style={[
              styles.formatButton,
              selectedExportFormat === format && styles.formatButtonActive,
            ]}
            onPress={() => setSelectedExportFormat(format)}
          >
            <Text
              style={[
                styles.formatButtonText,
                selectedExportFormat === format &&
                  styles.formatButtonTextActive,
              ]}
            >
              {format.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const _renderReports = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>📋 報告列表</Text>

      {reports.length === 0 ? (
        <Text style={styles.emptyText}>暫無報告</Text>
      ) : (
        reports.map(report => (
          <View key={report.id} style={styles.reportCard}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportDescription}>{report.description}</Text>
            <Text style={styles.reportDate}>
              生成時間: {report.generatedAt.toLocaleDateString()}
            </Text>
            <Text style={styles.reportStatus}>狀態: {report.status}</Text>
          </View>
        ))
      )}
    </View>
  );

  const _renderAlerts = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>🚨 警報管理</Text>

      <View style={styles.alertStats}>
        <Text style={styles.alertStat}>總警報: {alerts.length}</Text>
        <Text style={styles.alertStat}>活躍警報: {activeAlerts.length}</Text>
        <Text style={styles.alertStat}>嚴重警報: {criticalAlerts.length}</Text>
      </View>

      {alerts.length === 0 ? (
        <Text style={styles.emptyText}>暫無警報</Text>
      ) : (
        alerts.map(alert => (
          <View
            key={alert.id}
            style={[
              styles.alertCard,
              alert.severity === 'critical' && styles.criticalAlert,
              alert.severity === 'high' && styles.highAlert,
            ]}
          >
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertDescription}>{alert.description}</Text>
            <Text style={styles.alertSeverity}>嚴重程度: {alert.severity}</Text>
            <Text style={styles.alertCategory}>類別: {alert.category}</Text>
            <Text style={styles.alertTime}>
              時間: {alert.timestamp.toLocaleString()}
            </Text>
            {!alert.acknowledged && (
              <TouchableOpacity
                style={styles.acknowledgeButton}
                onPress={() => updateAlert(alert.id, { acknowledged: true })}
              >
                <Text style={styles.acknowledgeButtonText}>確認</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </View>
  );

  const _renderInsights = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>💡 業務洞察</Text>

      <View style={styles.insightStats}>
        <Text style={styles.insightStat}>總洞察: {insights.length}</Text>
        <Text style={styles.insightStat}>
          正面洞察: {positiveInsights.length}
        </Text>
        <Text style={styles.insightStat}>
          負面洞察: {negativeInsights.length}
        </Text>
      </View>

      {insights.length === 0 ? (
        <Text style={styles.emptyText}>暫無洞察</Text>
      ) : (
        insights.map(insight => (
          <View
            key={insight.id}
            style={[
              styles.insightCard,
              insight.type === 'positive' && styles.positiveInsight,
              insight.type === 'negative' && styles.negativeInsight,
            ]}
          >
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
            <Text style={styles.insightType}>類型: {insight.type}</Text>
            <Text style={styles.insightImpact}>影響: {insight.impact}</Text>
            <Text style={styles.insightConfidence}>
              置信度: {insight.confidence * 100}%
            </Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>🎯 建議</Text>

      {recommendations.length === 0 ? (
        <Text style={styles.emptyText}>暫無建議</Text>
      ) : (
        recommendations.map(rec => (
          <View key={rec.id} style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>{rec.title}</Text>
            <Text style={styles.recommendationDescription}>
              {rec.description}
            </Text>
            <Text style={styles.recommendationPriority}>
              優先級: {rec.priority}
            </Text>
            <Text style={styles.recommendationType}>類型: {rec.type}</Text>
            <Text style={styles.recommendationImpact}>
              預期影響: {rec.expectedImpact.improvement * 100}% (
              {rec.expectedImpact.timeframe})
            </Text>
          </View>
        ))
      )}
    </View>
  );

  const _renderConfig = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>⚙️ 配置管理</Text>

      {config && (
        <View style={styles.configContainer}>
          <View style={styles.configItem}>
            <Text style={styles.configLabel}>服務啟用:</Text>
            <Text style={styles.configValue}>
              {config.enabled ? '是' : '否'}
            </Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>更新間隔:</Text>
            <Text style={styles.configValue}>
              {config.updateInterval / 1000} 秒
            </Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>實時更新:</Text>
            <Text style={styles.configValue}>
              {config.realTimeUpdates ? '是' : '否'}
            </Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>歷史數據:</Text>
            <Text style={styles.configValue}>
              {config.historicalData ? '是' : '否'}
            </Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>預測分析:</Text>
            <Text style={styles.configValue}>
              {config.forecasting ? '是' : '否'}
            </Text>
          </View>

          <View style={styles.configItem}>
            <Text style={styles.configLabel}>數據比較:</Text>
            <Text style={styles.configValue}>
              {config.comparisons ? '是' : '否'}
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleUpdateConfig}>
        <Text style={styles.buttonText}>更新配置</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>業務指標分析系統</Text>

      <View style={styles.tabContainer}>
        {(
          ['dashboard', 'reports', 'alerts', 'insights', 'config'] as const
        ).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === 'dashboard' && '📊 儀表板'}
              {tab === 'reports' && '📋 報告'}
              {tab === 'alerts' && '🚨 警報'}
              {tab === 'insights' && '💡 洞察'}
              {tab === 'config' && '⚙️ 配置'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'insights' && renderInsights()}
        {activeTab === 'config' && renderConfig()}
      </ScrollView>

      {lastUpdate && (
        <Text style={styles.lastUpdate}>
          最後更新: {new Date(lastUpdate).toLocaleString()}
        </Text>
      )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  loadingText: {
    textAlign: 'center',
    color: '#007AFF',
    marginVertical: 20,
  },
  errorText: {
    textAlign: 'center',
    color: '#FF3B30',
    marginVertical: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  metricTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricChange: {
    fontSize: 12,
    color: '#28a745',
  },
  summaryContainer: {
    backgroundColor: '#e9ecef',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  exportFormatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  exportFormatTitle: {
    fontSize: 14,
    marginRight: 12,
    color: '#666',
  },
  formatButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  formatButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  formatButtonText: {
    fontSize: 12,
    color: '#666',
  },
  formatButtonTextActive: {
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  reportCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  reportDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  reportDate: {
    fontSize: 12,
    color: '#999',
  },
  reportStatus: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  alertStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  alertStat: {
    fontSize: 14,
    color: '#666',
  },
  alertCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  criticalAlert: {
    backgroundColor: '#f8d7da',
    borderLeftColor: '#dc3545',
  },
  highAlert: {
    backgroundColor: '#fff3cd',
    borderLeftColor: '#ffc107',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  alertDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  alertSeverity: {
    fontSize: 12,
    color: '#dc3545',
    marginBottom: 4,
  },
  alertCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#999',
  },
  acknowledgeButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  acknowledgeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  insightStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  insightStat: {
    fontSize: 14,
    color: '#666',
  },
  insightCard: {
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  positiveInsight: {
    backgroundColor: '#d4edda',
    borderLeftColor: '#28a745',
  },
  negativeInsight: {
    backgroundColor: '#f8d7da',
    borderLeftColor: '#dc3545',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  insightType: {
    fontSize: 12,
    color: '#28a745',
    marginBottom: 4,
  },
  insightImpact: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  insightConfidence: {
    fontSize: 12,
    color: '#999',
  },
  recommendationCard: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recommendationPriority: {
    fontSize: 12,
    color: '#dc3545',
    marginBottom: 4,
  },
  recommendationType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  recommendationImpact: {
    fontSize: 12,
    color: '#28a745',
  },
  configContainer: {
    marginBottom: 20,
  },
  configItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  configLabel: {
    fontSize: 14,
    color: '#666',
  },
  configValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  lastUpdate: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

export default BusinessMetricsExample;
