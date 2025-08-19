import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { analyticsService, MarketTrends, PortfolioAnalysis, UserBehaviorAnalysis, PredictiveAnalysis, AnomalyDetection, CorrelationAnalysis, SegmentationAnalysis, AnalyticsMetrics, ComprehensiveReport, ReportTemplate } from '@/services/analyticsService';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logger } from '@/utils/logger';

const { width } = Dimensions.get('window');

interface AdvancedAnalyticsDashboardProps {
  userId?: string;
  onNavigate?: (screen: string, params?: any) => void;
}

const AdvancedAnalyticsDashboard: React.FC<AdvancedAnalyticsDashboardProps> = ({
  userId,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState('30d');
  const [selectedAnalysis, setSelectedAnalysis] = useState<string | null>(null);

  // 數據狀態
  const [marketTrends, setMarketTrends] = useState<MarketTrends | null>(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<PortfolioAnalysis | null>(null);
  const [userBehavior, setUserBehavior] = useState<UserBehaviorAnalysis | null>(null);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis | null>(null);
  const [anomalyDetection, setAnomalyDetection] = useState<AnomalyDetection | null>(null);
  const [correlationAnalysis, setCorrelationAnalysis] = useState<CorrelationAnalysis | null>(null);
  const [segmentationAnalysis, setSegmentationAnalysis] = useState<SegmentationAnalysis | null>(null);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetrics | null>(null);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [comprehensiveReport, setComprehensiveReport] = useState<ComprehensiveReport | null>(null);

  const { handleError } = useErrorHandler();

  // 加載數據
  const loadData = useCallback(async (useCache = true) => {
    if (!userId) return;

    setLoading(true);
    try {
      const promises = [
        analyticsService.getMarketTrends({ timeframe, useCache }),
        analyticsService.getPortfolioAnalysis(userId, { timeframe, useCache }),
        analyticsService.getUserBehaviorAnalysis(userId, { timeframe, useCache }),
        analyticsService.getPredictiveAnalysis({ timeframe: '7d', useCache }),
        analyticsService.getAnomalyDetection({ timeframe: '24h', useCache }),
        analyticsService.getCorrelationAnalysis({ timeframe, useCache }),
        analyticsService.getSegmentationAnalysis({ useCache }),
        analyticsService.getAnalyticsMetrics({ timeframe, useCache }),
        analyticsService.getReportTemplates()
      ];

      const results = await Promise.allSettled(promises);

      if (results[0].status === 'fulfilled') setMarketTrends(results[0].value);
      if (results[1].status === 'fulfilled') setPortfolioAnalysis(results[1].value);
      if (results[2].status === 'fulfilled') setUserBehavior(results[2].value);
      if (results[3].status === 'fulfilled') setPredictiveAnalysis(results[3].value);
      if (results[4].status === 'fulfilled') setAnomalyDetection(results[4].value);
      if (results[5].status === 'fulfilled') setCorrelationAnalysis(results[5].value);
      if (results[6].status === 'fulfilled') setSegmentationAnalysis(results[6].value);
      if (results[7].status === 'fulfilled') setAnalyticsMetrics(results[7].value);
      if (results[8].status === 'fulfilled') setReportTemplates(results[8].value);

    } catch (error) {
      handleError(error, '數據加載失敗');
    } finally {
      setLoading(false);
    }
  }, [userId, timeframe, handleError]);

  // 刷新數據
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(false);
    setRefreshing(false);
  }, [loadData]);

  // 生成綜合報告
  const generateComprehensiveReport = async () => {
    try {
      setLoading(true);
      const report = await analyticsService.generateComprehensiveReport({
        reportType: 'monthly',
        includeCharts: true,
        includeRecommendations: true
      });
      setComprehensiveReport(report);
      Alert.alert('成功', '綜合報告生成完成');
    } catch (error) {
      handleError(error, '報告生成失敗');
    } finally {
      setLoading(false);
    }
  };

  // 導出數據
  const exportData = async (type: string) => {
    try {
      const exportData = await analyticsService.exportAnalyticsData(type, { timeframe });
      Alert.alert('成功', `數據已導出，下載鏈接: ${exportData.downloadUrl}`);
    } catch (error) {
      handleError(error, '數據導出失敗');
    }
  };

  // 清理緩存
  const clearCache = async () => {
    try {
      const result = await analyticsService.clearAnalyticsCache();
      Alert.alert('成功', `已清理 ${result.cleared} 個緩存項`);
      await loadData(false);
    } catch (error) {
      handleError(error, '緩存清理失敗');
    }
  };

  // 健康檢查
  const performHealthCheck = async () => {
    try {
      const health = await analyticsService.healthCheck();
      Alert.alert('健康檢查', `狀態: ${health.status}\n時間: ${health.timestamp.toLocaleString()}`);
    } catch (error) {
      handleError(error, '健康檢查失敗');
    }
  };

  // 初始化
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 渲染概覽標籤頁
  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* 關鍵指標卡片 */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>總交易量</Text>
          <Text style={styles.metricValue}>
            {marketTrends?.summary.keyMetrics.totalTransactions?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.metricChange}>
            {marketTrends?.trends.volume.direction === 'up' ? '+' : ''}
            {marketTrends?.trends.volume.change.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>平均價格變化</Text>
          <Text style={styles.metricValue}>
            {marketTrends?.summary.keyMetrics.avgPriceChange?.toFixed(2) || '0'}%
          </Text>
          <Text style={styles.metricChange}>
            {marketTrends?.trends.price.direction === 'up' ? '+' : ''}
            {marketTrends?.trends.price.change.toFixed(1)}%
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>投資組合價值</Text>
          <Text style={styles.metricValue}>
            ${portfolioAnalysis?.portfolio.totalValue?.toLocaleString() || '0'}
          </Text>
          <Text style={styles.metricChange}>
            {portfolioAnalysis?.performance?.totalReturn ?
              `${(portfolioAnalysis.performance.totalReturn * 100).toFixed(1)}%` : 'N/A'}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>異常檢測</Text>
          <Text style={styles.metricValue}>
            {anomalyDetection?.totalDetected || '0'}
          </Text>
          <Text style={styles.metricChange}>
            嚴重程度: {anomalyDetection?.severity || 'N/A'}
          </Text>
        </View>
      </View>

      {/* 市場趨勢圖表 */}
      {marketTrends && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>市場趨勢分析</Text>
          <LineChart
            data={{
              labels: ['1週前', '6天前', '5天前', '4天前', '3天前', '2天前', '今天'],
              datasets: [{
                data: [20, 45, 28, 80, 99, 43, 50]
              }]
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#1cc910',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      )}

      {/* 洞察和建議 */}
      {marketTrends?.insights && marketTrends.insights.length > 0 && (
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>關鍵洞察</Text>
          {marketTrends.insights.map((insight, index) => (
            <View key={index} style={[styles.insightCard, { borderLeftColor: getSeverityColor(insight.severity) }]}>
              <Text style={styles.insightMessage}>{insight.message}</Text>
              <Text style={styles.insightConfidence}>置信度: {(insight.confidence * 100).toFixed(0)}%</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );

  // 渲染投資組合標籤頁
  const renderPortfolioTab = () => (
    <ScrollView style={styles.tabContent}>
      {portfolioAnalysis ? (
        <>
          {/* 投資組合概覽 */}
          <View style={styles.portfolioOverview}>
            <Text style={styles.sectionTitle}>投資組合概覽</Text>
            <View style={styles.portfolioStats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>總價值</Text>
                <Text style={styles.statValue}>
                  ${portfolioAnalysis.portfolio.totalValue.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>卡片數量</Text>
                <Text style={styles.statValue}>{portfolioAnalysis.portfolio.totalCards}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>多樣化評分</Text>
                <Text style={styles.statValue}>
                  {(portfolioAnalysis.portfolio.diversification.score * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>風險等級</Text>
                <Text style={[styles.statValue, { color: getRiskColor(portfolioAnalysis.portfolio.riskMetrics.riskLevel) }]}>
                  {portfolioAnalysis.portfolio.riskMetrics.riskLevel.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* 性能指標 */}
          {portfolioAnalysis.performance && (
            <View style={styles.performanceContainer}>
              <Text style={styles.sectionTitle}>性能指標</Text>
              <View style={styles.performanceGrid}>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>總回報</Text>
                  <Text style={[styles.performanceValue, { color: portfolioAnalysis.performance.totalReturn >= 0 ? '#4CAF50' : '#F44336' }]}>
                    {(portfolioAnalysis.performance.totalReturn * 100).toFixed(2)}%
                  </Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>年化回報</Text>
                  <Text style={[styles.performanceValue, { color: portfolioAnalysis.performance.annualizedReturn >= 0 ? '#4CAF50' : '#F44336' }]}>
                    {(portfolioAnalysis.performance.annualizedReturn * 100).toFixed(2)}%
                  </Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>夏普比率</Text>
                  <Text style={styles.performanceValue}>
                    {portfolioAnalysis.performance.sharpeRatio.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>最大回撤</Text>
                  <Text style={[styles.performanceValue, { color: '#F44336' }]}>
                    {(portfolioAnalysis.performance.maxDrawdown * 100).toFixed(2)}%
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* 多樣化分析 */}
          <View style={styles.diversificationContainer}>
            <Text style={styles.sectionTitle}>多樣化分析</Text>
            <PieChart
              data={portfolioAnalysis.portfolio.diversification.categories.map((category, index) => ({
                name: category,
                population: portfolioAnalysis.portfolio.diversification.distribution[category] || 0,
                color: getCategoryColor(index),
                legendFontColor: '#7F7F7F',
                legendFontSize: 12
              }))}
              width={width - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>

          {/* 建議 */}
          {portfolioAnalysis.recommendations && portfolioAnalysis.recommendations.length > 0 && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.sectionTitle}>投資建議</Text>
              {portfolioAnalysis.recommendations.map((rec, index) => (
                <View key={index} style={[styles.recommendationCard, { borderLeftColor: getPriorityColor(rec.priority) }]}>
                  <Text style={styles.recommendationMessage}>{rec.message}</Text>
                  <Text style={styles.recommendationAction}>建議操作: {rec.action}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>投資組合數據加載中...</Text>
        </View>
      )}
    </ScrollView>
  );

  // 渲染預測標籤頁
  const renderPredictiveTab = () => (
    <ScrollView style={styles.tabContent}>
      {predictiveAnalysis ? (
        <>
          {/* 預測概覽 */}
          <View style={styles.predictionOverview}>
            <Text style={styles.sectionTitle}>預測分析</Text>
            <View style={styles.predictionStats}>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>預測目標</Text>
                <Text style={styles.predictionValue}>{predictiveAnalysis.target}</Text>
              </View>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>時間範圍</Text>
                <Text style={styles.predictionValue}>{predictiveAnalysis.timeframe}</Text>
              </View>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>置信度</Text>
                <Text style={styles.predictionValue}>
                  {(predictiveAnalysis.confidence * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>準確率</Text>
                <Text style={styles.predictionValue}>
                  {(predictiveAnalysis.accuracy * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>

          {/* 預測圖表 */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>價格預測趨勢</Text>
            <LineChart
              data={{
                labels: predictiveAnalysis.predictions.map(p =>
                  new Date(p.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
                ),
                datasets: [{
                  data: predictiveAnalysis.predictions.map(p => p.value)
                }]
              }}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#e26a00',
                backgroundGradientFrom: '#fb8c00',
                backgroundGradientTo: '#ffa726',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>

          {/* 關鍵因素 */}
          {predictiveAnalysis.factors && predictiveAnalysis.factors.length > 0 && (
            <View style={styles.factorsContainer}>
              <Text style={styles.sectionTitle}>關鍵影響因素</Text>
              {predictiveAnalysis.factors.map((factor, index) => (
                <View key={index} style={styles.factorItem}>
                  <MaterialIcons name="trending-up" size={16} color="#4CAF50" />
                  <Text style={styles.factorText}>{factor}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>預測數據加載中...</Text>
        </View>
      )}
    </ScrollView>
  );

  // 渲染異常檢測標籤頁
  const renderAnomalyTab = () => (
    <ScrollView style={styles.tabContent}>
      {anomalyDetection ? (
        <>
          {/* 異常概覽 */}
          <View style={styles.anomalyOverview}>
            <Text style={styles.sectionTitle}>異常檢測</Text>
            <View style={styles.anomalyStats}>
              <View style={styles.anomalyItem}>
                <Text style={styles.anomalyLabel}>檢測類型</Text>
                <Text style={styles.anomalyValue}>{anomalyDetection.type}</Text>
              </View>
              <View style={styles.anomalyItem}>
                <Text style={styles.anomalyLabel}>敏感度</Text>
                <Text style={styles.anomalyValue}>{anomalyDetection.sensitivity}</Text>
              </View>
              <View style={styles.anomalyItem}>
                <Text style={styles.anomalyLabel}>檢測數量</Text>
                <Text style={styles.anomalyValue}>{anomalyDetection.totalDetected}</Text>
              </View>
              <View style={styles.anomalyItem}>
                <Text style={styles.anomalyLabel}>嚴重程度</Text>
                <Text style={[styles.anomalyValue, { color: getSeverityColor(anomalyDetection.severity) }]}>
                  {anomalyDetection.severity.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* 異常列表 */}
          {anomalyDetection.anomalies && anomalyDetection.anomalies.length > 0 && (
            <View style={styles.anomaliesContainer}>
              <Text style={styles.sectionTitle}>檢測到的異常</Text>
              {anomalyDetection.anomalies.map((anomaly, index) => (
                <View key={index} style={[styles.anomalyCard, { borderLeftColor: getSeverityColor(anomaly.severity) }]}>
                  <View style={styles.anomalyHeader}>
                    <Text style={styles.anomalyType}>{anomaly.type}</Text>
                    <Text style={[styles.anomalySeverity, { color: getSeverityColor(anomaly.severity) }]}>
                      {anomaly.severity.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.anomalyDetails}>
                    卡片ID: {anomaly.cardId} | 實際值: {anomaly.value} | 預期值: {anomaly.expected}
                  </Text>
                  <Text style={styles.anomalyTime}>
                    {new Date(anomaly.timestamp).toLocaleString('zh-CN')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>異常檢測數據加載中...</Text>
        </View>
      )}
    </ScrollView>
  );

  // 渲染報告標籤頁
  const renderReportsTab = () => (
    <ScrollView style={styles.tabContent}>
      {/* 報告模板 */}
      <View style={styles.reportsContainer}>
        <Text style={styles.sectionTitle}>報告模板</Text>
        {reportTemplates.map((template) => (
          <TouchableOpacity
            key={template.id}
            style={styles.reportTemplateCard}
            onPress={() => setSelectedAnalysis(template.id)}
          >
            <View style={styles.reportTemplateHeader}>
              <Text style={styles.reportTemplateName}>{template.name}</Text>
              <MaterialIcons name="description" size={20} color="#666" />
            </View>
            <Text style={styles.reportTemplateDescription}>{template.description}</Text>
            <Text style={styles.reportTemplateType}>類型: {template.type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 操作按鈕 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={generateComprehensiveReport}
          disabled={loading}
        >
          <MaterialIcons name="assessment" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>生成綜合報告</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => exportData('market_trends')}
        >
          <MaterialIcons name="file-download" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>導出數據</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={clearCache}
        >
          <MaterialIcons name="clear" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>清理緩存</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={performHealthCheck}
        >
          <MaterialIcons name="health-and-safety" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>健康檢查</Text>
        </TouchableOpacity>
      </View>

      {/* 綜合報告 */}
      {comprehensiveReport && (
        <View style={styles.comprehensiveReportContainer}>
          <Text style={styles.sectionTitle}>最新綜合報告</Text>
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>
              報告類型: {comprehensiveReport.metadata.reportType}
            </Text>
            <Text style={styles.reportDate}>
              生成時間: {new Date(comprehensiveReport.metadata.generatedAt).toLocaleString('zh-CN')}
            </Text>
            <Text style={styles.reportVersion}>
              版本: {comprehensiveReport.metadata.version}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  // 輔助函數
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getCategoryColor = (index: number) => {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
    return colors[index % colors.length];
  };

  return (
    <View style={styles.container}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <Text style={styles.title}>高級分析儀表板</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.timeframeButton}
            onPress={() => {
              const timeframes = ['1d', '7d', '30d', '90d', '1y'];
              const currentIndex = timeframes.indexOf(timeframe);
              const nextIndex = (currentIndex + 1) % timeframes.length;
              setTimeframe(timeframes[nextIndex]);
            }}
          >
            <Text style={styles.timeframeText}>{timeframe}</Text>
            <MaterialIcons name="schedule" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 標籤欄 */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: '概覽', icon: 'dashboard' },
          { key: 'portfolio', label: '投資組合', icon: 'account-balance-wallet' },
          { key: 'predictive', label: '預測', icon: 'trending-up' },
          { key: 'anomaly', label: '異常', icon: 'warning' },
          { key: 'reports', label: '報告', icon: 'assessment' }
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#007AFF' : '#666'}
            />
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 內容區域 */}
      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>加載分析數據...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'portfolio' && renderPortfolioTab()}
            {activeTab === 'predictive' && renderPredictiveTab()}
            {activeTab === 'anomaly' && renderAnomalyTab()}
            {activeTab === 'reports' && renderReportsTab()}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeframeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 4
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF'
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  tabContent: {
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: '#666'
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  metricChange: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600'
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  insightsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4
  },
  insightMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  insightConfidence: {
    fontSize: 12,
    color: '#666'
  },
  portfolioOverview: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  portfolioStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statItem: {
    width: '48%',
    marginBottom: 12
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  performanceContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  performanceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  performanceItem: {
    width: '48%',
    marginBottom: 12
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  performanceValue: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  diversificationContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  recommendationsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  recommendationCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4
  },
  recommendationMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4
  },
  recommendationAction: {
    fontSize: 12,
    color: '#666'
  },
  predictionOverview: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  predictionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  predictionItem: {
    width: '48%',
    marginBottom: 12
  },
  predictionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  factorsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  factorText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8
  },
  anomalyOverview: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  anomalyStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  anomalyItem: {
    width: '48%',
    marginBottom: 12
  },
  anomalyLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  anomalyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  anomaliesContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  anomalyCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 4
  },
  anomalyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  anomalyType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  anomalySeverity: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  anomalyDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  anomalyTime: {
    fontSize: 10,
    color: '#999'
  },
  reportsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  reportTemplateCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8
  },
  reportTemplateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  reportTemplateName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  reportTemplateDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  reportTemplateType: {
    fontSize: 10,
    color: '#999'
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
    width: '48%'
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4
  },
  comprehensiveReportContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  reportCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  reportVersion: {
    fontSize: 10,
    color: '#999'
  }
});

export default AdvancedAnalyticsDashboard;
