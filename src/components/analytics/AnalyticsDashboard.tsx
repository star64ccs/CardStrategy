import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { analyticsService } from '@/services/analyticsService';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface AnalyticsDashboardProps {
  userId?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeframe, setTimeframe] = useState('30d');
  const [marketTrends, setMarketTrends] = useState<any>(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState<any>(null);
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<any>(null);

  const { handleError } = useErrorHandler();

  const loadData = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [trends, portfolio, predictive] = await Promise.all([
        analyticsService.getMarketTrends({ timeframe }),
        analyticsService.getPortfolioAnalysis(userId, { timeframe }),
        analyticsService.getPredictiveAnalysis({ timeframe: '7d' }),
      ]);

      setMarketTrends(trends);
      setPortfolioAnalysis(portfolio);
      setPredictiveAnalysis(predictive);
    } catch (error) {
      handleError(error, '數據加載失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId, timeframe]);

  const generateReport = async () => {
    try {
      setLoading(true);
      await analyticsService.generateComprehensiveReport({
        reportType: 'monthly',
        includeCharts: true,
        includeRecommendations: true,
      });
      Alert.alert('成功', '綜合報告生成完成');
    } catch (error) {
      handleError(error, '報告生成失敗');
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const exportData = await analyticsService.exportAnalyticsData(
        'market_trends',
        { timeframe }
      );
      Alert.alert('成功', `數據已導出，下載鏈接: ${exportData.downloadUrl}`);
    } catch (error) {
      handleError(error, '數據導出失敗');
    }
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>總交易量</Text>
          <Text style={styles.metricValue}>
            {marketTrends?.summary?.keyMetrics?.totalTransactions?.toLocaleString() ||
              '0'}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>平均價格變化</Text>
          <Text style={styles.metricValue}>
            {marketTrends?.summary?.keyMetrics?.avgPriceChange?.toFixed(2) ||
              '0'}
            %
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>投資組合價值</Text>
          <Text style={styles.metricValue}>
            ${portfolioAnalysis?.portfolio?.totalValue?.toLocaleString() || '0'}
          </Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>預測準確率</Text>
          <Text style={styles.metricValue}>
            {predictiveAnalysis?.accuracy
              ? `${(predictiveAnalysis.accuracy * 100).toFixed(0)}%`
              : 'N/A'}
          </Text>
        </View>
      </View>

      {marketTrends?.insights && (
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>關鍵洞察</Text>
          {marketTrends.insights.map((insight: any, index: number) => (
            <View key={index} style={styles.insightCard}>
              <Text style={styles.insightMessage}>{insight.message}</Text>
              <Text style={styles.insightConfidence}>
                置信度: {(insight.confidence * 100).toFixed(0)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderPortfolioTab = () => (
    <View style={styles.tabContent}>
      {portfolioAnalysis ? (
        <>
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
                <Text style={styles.statValue}>
                  {portfolioAnalysis.portfolio.totalCards}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>多樣化評分</Text>
                <Text style={styles.statValue}>
                  {(
                    portfolioAnalysis.portfolio.diversification.score * 100
                  ).toFixed(0)}
                  %
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>風險等級</Text>
                <Text style={styles.statValue}>
                  {portfolioAnalysis.portfolio.riskMetrics.riskLevel.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {portfolioAnalysis.recommendations && (
            <View style={styles.recommendationsContainer}>
              <Text style={styles.sectionTitle}>投資建議</Text>
              {portfolioAnalysis.recommendations.map(
                (rec: any, index: number) => (
                  <View key={index} style={styles.recommendationCard}>
                    <Text style={styles.recommendationMessage}>
                      {rec.message}
                    </Text>
                    <Text style={styles.recommendationAction}>
                      建議操作: {rec.action}
                    </Text>
                  </View>
                )
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>投資組合數據加載中...</Text>
        </View>
      )}
    </View>
  );

  const renderPredictiveTab = () => (
    <View style={styles.tabContent}>
      {predictiveAnalysis ? (
        <>
          <View style={styles.predictionOverview}>
            <Text style={styles.sectionTitle}>預測分析</Text>
            <View style={styles.predictionStats}>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>預測目標</Text>
                <Text style={styles.predictionValue}>
                  {predictiveAnalysis.target}
                </Text>
              </View>
              <View style={styles.predictionItem}>
                <Text style={styles.predictionLabel}>時間範圍</Text>
                <Text style={styles.predictionValue}>
                  {predictiveAnalysis.timeframe}
                </Text>
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

          {predictiveAnalysis.factors && (
            <View style={styles.factorsContainer}>
              <Text style={styles.sectionTitle}>關鍵影響因素</Text>
              {predictiveAnalysis.factors.map(
                (factor: string, index: number) => (
                  <View key={index} style={styles.factorItem}>
                    <MaterialIcons
                      name="trending-up"
                      size={16}
                      color="#4CAF50"
                    />
                    <Text style={styles.factorText}>{factor}</Text>
                  </View>
                )
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>預測數據加載中...</Text>
        </View>
      )}
    </View>
  );

  const renderReportsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={generateReport}
          disabled={loading}
        >
          <MaterialIcons name="assessment" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>生成綜合報告</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={exportData}>
          <MaterialIcons name="file-download" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>導出數據</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>高級分析儀表板</Text>
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

      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: '概覽', icon: 'dashboard' },
          {
            key: 'portfolio',
            label: '投資組合',
            icon: 'account-balance-wallet',
          },
          { key: 'predictive', label: '預測', icon: 'trending-up' },
          { key: 'reports', label: '報告', icon: 'assessment' },
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

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>加載分析數據...</Text>
          </View>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'portfolio' && renderPortfolioTab()}
            {activeTab === 'predictive' && renderPredictiveTab()}
            {activeTab === 'reports' && renderReportsTab()}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  timeframeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  activeTabLabel: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    elevation: 3,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  insightMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  insightConfidence: {
    fontSize: 12,
    color: '#666',
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
    elevation: 3,
  },
  portfolioStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    elevation: 3,
  },
  recommendationCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  recommendationMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  recommendationAction: {
    fontSize: 12,
    color: '#666',
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
    elevation: 3,
  },
  predictionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  predictionItem: {
    width: '48%',
    marginBottom: 12,
  },
  predictionLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    elevation: 3,
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    width: '48%',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AnalyticsDashboard;
