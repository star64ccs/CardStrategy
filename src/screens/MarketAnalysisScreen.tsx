import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, RootState } from '@/store';
import { useTheme } from '@/config/ThemeProvider';
import { Button } from '@/components/common/Button';
import { Loading } from '@/components/common/Loading';
import { Card } from '@/components/common/Card';
import { fetchMarketData, fetchMarketTrends } from '@/store/slices/marketSlice';
import { formatCurrency, formatPercentage, formatNumber } from '@/utils/formatters';
import { logger } from '@/utils/logger';

export const MarketAnalysisScreen: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { marketData, marketTrends, marketInsights, isLoading, error } = useSelector(
    (state: RootState) => state.market
  );
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'insights'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 加載市場數據
  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = useCallback(async () => {
    try {
      await Promise.all([
        dispatch(fetchMarketData('')),
        dispatch(fetchMarketTrends())
      ]);
    } catch (error) {
      logger.error('Failed to load market data:', { error });
      Alert.alert('錯誤', '載入市場數據失敗，請稍後再試');
    }
  }, [dispatch]);

  // 處理錯誤
  useEffect(() => {
    if (error) {
      Alert.alert('錯誤', error);
    }
  }, [error]);

  // 處理刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMarketData();
    setRefreshing(false);
  }, [loadMarketData]);

  // 計算市場統計
  const marketStats = useMemo(() => {
    if (!marketData || marketData.length === 0) {
      return {
        totalVolume: 0,
        averagePrice: 0,
        priceChange: 0,
        volumeChange: 0,
        activeCards: 0
      };
    }

    const totalVolume = marketData.reduce((sum: number, data: any) => sum + (data.volume || 0), 0);
    const averagePrice = marketData.reduce((sum: number, data: any) => sum + (data.price || 0), 0) / marketData.length;
    
    // 計算價格變化
    const sortedData = [...marketData].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstPrice = sortedData[0]?.price || 0;
    const lastPrice = sortedData[sortedData.length - 1]?.price || 0;
    const priceChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

    // 計算交易量變化
    const firstVolume = sortedData[0]?.volume || 0;
    const lastVolume = sortedData[sortedData.length - 1]?.volume || 0;
    const volumeChange = firstVolume > 0 ? ((lastVolume - firstVolume) / firstVolume) * 100 : 0;

    return {
      totalVolume,
      averagePrice,
      priceChange,
      volumeChange,
      activeCards: marketData.length
    };
  }, [marketData]);

  // 獲取趨勢分析
  const trendAnalysis = useMemo(() => {
    if (!marketTrends || marketTrends.length === 0) {
      return {
        risingCards: 0,
        fallingCards: 0,
        stableCards: 0,
        topGainers: [],
        topLosers: []
      };
    }

    const risingCards = marketTrends.filter((trend: any) => trend.trend === 'rising').length;
    const fallingCards = marketTrends.filter((trend: any) => trend.trend === 'falling').length;
    const stableCards = marketTrends.filter((trend: any) => trend.trend === 'stable').length;

    const topGainers = [...marketTrends]
      .filter((trend: any) => trend.change > 0)
      .sort((a: any, b: any) => b.change - a.change)
      .slice(0, 5);

    const topLosers = [...marketTrends]
      .filter((trend: any) => trend.change < 0)
      .sort((a: any, b: any) => a.change - b.change)
      .slice(0, 5);

    return {
      risingCards,
      fallingCards,
      stableCards,
      topGainers,
      topLosers
    };
  }, [marketTrends]);

  // 獲取市場洞察
  const marketInsight = useMemo(() => {
    if (!marketInsights || marketInsights.length === 0) {
      return {
        sentiment: 'neutral',
        recommendation: '觀望',
        keyFactors: [],
        riskLevel: 'medium'
      };
    }

    const latestInsight = marketInsights[0];
    return {
      sentiment: latestInsight.sentiment || 'neutral',
      recommendation: latestInsight.recommendation || '觀望',
      keyFactors: latestInsight.keyFactors || [],
      riskLevel: latestInsight.riskLevel || 'medium'
    };
  }, [marketInsights]);

  // 獲取時間框架標籤
  const getTimeframeLabel = (timeframe: string): string => {
    const labels: Record<string, string> = {
      '24h': '24小時',
      '7d': '7天',
      '30d': '30天'
    };
    return labels[timeframe] || timeframe;
  };

  // 獲取趨勢圖標
  const getTrendIcon = (trend: string): string => {
    const icons: Record<string, string> = {
      'rising': 'trending-up',
      'falling': 'trending-down',
      'stable': 'remove'
    };
    return icons[trend] || 'remove';
  };

  // 獲取趨勢顏色
  const getTrendColor = (trend: string): string => {
    const colors: Record<string, string> = {
      'rising': theme.colors.success,
      'falling': theme.colors.error,
      'stable': theme.colors.textSecondary
    };
    return colors[trend] || theme.colors.textSecondary;
  };

  const renderMarketOverview = () => (
    <View style={[styles.overviewContainer, { backgroundColor: theme.colors.backgroundPaper }]}>
      <Text style={[styles.overviewTitle, { color: theme.colors.textPrimary }]}>
        市場概覽
      </Text>

      {/* 主要統計 */}
      <View style={styles.marketStats}>
        <Card variant="elevated" padding="medium" style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>
            {formatCurrency(marketStats.totalVolume)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            總交易量
          </Text>
          <Text style={[
            styles.statChange,
            { color: marketStats.volumeChange >= 0 ? theme.colors.success : theme.colors.error }
          ]}>
            {marketStats.volumeChange >= 0 ? '+' : ''}{formatPercentage(marketStats.volumeChange)}
          </Text>
        </Card>

        <Card variant="elevated" padding="medium" style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
            {formatCurrency(marketStats.averagePrice)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            平均價格
          </Text>
          <Text style={[
            styles.statChange,
            { color: marketStats.priceChange >= 0 ? theme.colors.success : theme.colors.error }
          ]}>
            {marketStats.priceChange >= 0 ? '+' : ''}{formatPercentage(marketStats.priceChange)}
          </Text>
        </Card>

        <Card variant="elevated" padding="medium" style={styles.statCard}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>
            {marketStats.activeCards}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
            活躍卡片
          </Text>
        </Card>
      </View>

      {/* 趨勢分布 */}
      <Card variant="elevated" padding="medium" style={styles.trendDistribution}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          趨勢分布
        </Text>
        <View style={styles.trendStats}>
          <View style={styles.trendItem}>
            <Ionicons name="trending-up" size={24} color={theme.colors.success} />
            <Text style={[styles.trendNumber, { color: theme.colors.success }]}>
              {trendAnalysis.risingCards}
            </Text>
            <Text style={[styles.trendLabel, { color: theme.colors.textSecondary }]}>
              上漲
            </Text>
          </View>
          <View style={styles.trendItem}>
            <Ionicons name="trending-down" size={24} color={theme.colors.error} />
            <Text style={[styles.trendNumber, { color: theme.colors.error }]}>
              {trendAnalysis.fallingCards}
            </Text>
            <Text style={[styles.trendLabel, { color: theme.colors.textSecondary }]}>
              下跌
            </Text>
          </View>
          <View style={styles.trendItem}>
            <Ionicons name="remove" size={24} color={theme.colors.textSecondary} />
            <Text style={[styles.trendNumber, { color: theme.colors.textSecondary }]}>
              {trendAnalysis.stableCards}
            </Text>
            <Text style={[styles.trendLabel, { color: theme.colors.textSecondary }]}>
              穩定
            </Text>
          </View>
        </View>
      </Card>

      {/* 市場洞察 */}
      <Card variant="elevated" padding="medium" style={styles.marketInsight}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          市場洞察
        </Text>
        <View style={styles.insightContent}>
          <View style={styles.insightRow}>
            <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>
              市場情緒:
            </Text>
            <Text style={[styles.insightValue, { color: theme.colors.textPrimary }]}>
              {marketInsight.sentiment === 'positive' ? '樂觀' : 
               marketInsight.sentiment === 'negative' ? '悲觀' : '中性'}
            </Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>
              投資建議:
            </Text>
            <Text style={[styles.insightValue, { color: theme.colors.primary }]}>
              {marketInsight.recommendation}
            </Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={[styles.insightLabel, { color: theme.colors.textSecondary }]}>
              風險等級:
            </Text>
            <Text style={[
              styles.insightValue,
              { color: marketInsight.riskLevel === 'high' ? theme.colors.error : 
                       marketInsight.riskLevel === 'low' ? theme.colors.success : 
                       theme.colors.warning }
            ]}>
              {marketInsight.riskLevel === 'high' ? '高' : 
               marketInsight.riskLevel === 'low' ? '低' : '中'}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );

  const renderTrendsList = () => (
    <View style={styles.trendsContainer}>
      {/* 時間框架選擇 */}
      <View style={styles.timeframeContainer}>
        {(['24h', '7d', '30d'] as const).map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeButton,
              {
                backgroundColor: selectedTimeframe === timeframe 
                  ? theme.colors.primary[500] 
                  : theme.colors.background,
                borderColor: theme.colors.borderLight
              }
            ]}
            onPress={() => setSelectedTimeframe(timeframe)}
          >
            <Text style={[
              styles.timeframeButtonText,
              { color: selectedTimeframe === timeframe ? theme.colors.white : theme.colors.textSecondary }
            ]}>
              {getTimeframeLabel(timeframe)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 熱門上漲卡片 */}
      <Card variant="elevated" padding="medium" style={styles.trendCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          熱門上漲卡片
        </Text>
        <ScrollView style={styles.trendList}>
          {trendAnalysis.topGainers.map((trend: any, index: number) => (
            <View key={trend.id || index} style={styles.trendItem}>
              <View style={styles.trendInfo}>
                <Text style={[styles.trendName, { color: theme.colors.textPrimary }]}>
                  {trend.cardName || '未知卡片'}
                </Text>
                <Text style={[styles.trendPrice, { color: theme.colors.textSecondary }]}>
                  {formatCurrency(trend.currentPrice || 0)}
                </Text>
              </View>
              <View style={styles.trendChange}>
                <Ionicons name="trending-up" size={16} color={theme.colors.success} />
                <Text style={[styles.trendChangeText, { color: theme.colors.success }]}>
                  +{formatPercentage(trend.change || 0)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Card>

      {/* 熱門下跌卡片 */}
      <Card variant="elevated" padding="medium" style={styles.trendCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          熱門下跌卡片
        </Text>
        <ScrollView style={styles.trendList}>
          {trendAnalysis.topLosers.map((trend: any, index: number) => (
            <View key={trend.id || index} style={styles.trendItem}>
              <View style={styles.trendInfo}>
                <Text style={[styles.trendName, { color: theme.colors.textPrimary }]}>
                  {trend.cardName || '未知卡片'}
                </Text>
                <Text style={[styles.trendPrice, { color: theme.colors.textSecondary }]}>
                  {formatCurrency(trend.currentPrice || 0)}
                </Text>
              </View>
              <View style={styles.trendChange}>
                <Ionicons name="trending-down" size={16} color={theme.colors.error} />
                <Text style={[styles.trendChangeText, { color: theme.colors.error }]}>
                  {formatPercentage(trend.change || 0)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </Card>
    </View>
  );

  const renderInsights = () => (
    <View style={styles.insightsContainer}>
      <Card variant="elevated" padding="medium" style={styles.insightCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          關鍵因素分析
        </Text>
        <View style={styles.factorsList}>
          {marketInsight.keyFactors.map((factor: string, index: number) => (
            <View key={index} style={styles.factorItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
              <Text style={[styles.factorText, { color: theme.colors.textPrimary }]}>
                {factor}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      <Card variant="elevated" padding="medium" style={styles.insightCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
          投資策略建議
        </Text>
        <Text style={[styles.strategyText, { color: theme.colors.textSecondary }]}>
          基於當前市場分析，建議採取{marketInsight.recommendation}策略。
          {marketInsight.riskLevel === 'high' && ' 請注意市場風險較高，建議謹慎投資。'}
          {marketInsight.riskLevel === 'low' && ' 當前市場風險較低，適合穩健投資。'}
        </Text>
      </Card>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.backgroundPaper }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
          市場分析
        </Text>
        <Button
          title="刷新"
          variant="outline"
          size="small"
          onPress={handleRefresh}
        />
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: theme.colors.backgroundPaper }]}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { backgroundColor: selectedTab === 'overview' ? theme.colors.primary[500] : 'transparent' }
          ]}
          onPress={() => setSelectedTab('overview')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'overview' ? theme.colors.white : theme.colors.textSecondary }
          ]}>
            概覽
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { backgroundColor: selectedTab === 'trends' ? theme.colors.primary[500] : 'transparent' }
          ]}
          onPress={() => setSelectedTab('trends')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'trends' ? theme.colors.white : theme.colors.textSecondary }
          ]}>
            趨勢
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            { backgroundColor: selectedTab === 'insights' ? theme.colors.primary[500] : 'transparent' }
          ]}
          onPress={() => setSelectedTab('insights')}
        >
          <Text style={[
            styles.tabButtonText,
            { color: selectedTab === 'insights' ? theme.colors.white : theme.colors.textSecondary }
          ]}>
            洞察
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing || isLoading} 
            onRefresh={handleRefresh}
            colors={[theme.colors.primary[500] || '#007AFF']}
          />
        }
      >
        {selectedTab === 'overview' && renderMarketOverview()}
        {selectedTab === 'trends' && renderTrendsList()}
        {selectedTab === 'insights' && renderInsights()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  content: {
    flex: 1,
    padding: 16
  },
  overviewContainer: {
    margin: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16
  },
  marketStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4
  },
  statChange: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  trendDistribution: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12
  },
  trendStats: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  trendItem: {
    alignItems: 'center'
  },
  trendNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8
  },
  trendLabel: {
    fontSize: 12
  },
  marketInsight: {
    marginBottom: 16
  },
  insightContent: {
    marginTop: 12
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  insightLabel: {
    fontSize: 14
  },
  insightValue: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  timeframeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F3F4F6'
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  trendsContainer: {
    margin: 8
  },
  trendCard: {
    marginBottom: 16
  },
  trendList: {
    maxHeight: 200 // Limit height for scrollable list
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  trendInfo: {
    flex: 1
  },
  trendName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  trendPrice: {
    fontSize: 14
  },
  trendChange: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  trendChangeText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  insightsContainer: {
    marginTop: 16
  },
  insightCard: {
    marginBottom: 16
  },
  factorsList: {
    marginTop: 12
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  factorText: {
    fontSize: 14,
    marginLeft: 8
  },
  strategyText: {
    fontSize: 14,
    lineHeight: 20
  }
});

