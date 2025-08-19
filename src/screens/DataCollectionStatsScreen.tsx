import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { dataQualityService } from '../services/dataQualityService';

const { width } = Dimensions.get('window');

interface CollectionStats {
  summary: {
    totalRecords: number;
    dateRange: {
      startDate: string;
      endDate: string;
    };
    collectionPeriod: number;
  };
  sourceDistribution: {
    source: string;
    count: number;
    percentage: string;
    avgConfidence: string;
  }[];
  qualityDistribution: {
    quality: string;
    count: number;
    percentage: string;
  }[];
  statusDistribution: {
    status: string;
    count: number;
    percentage: string;
  }[];
  timeSeries: {
    daily: {
      date: string;
      count: number;
    }[];
    hourly: {
      hour: string;
      count: number;
    }[];
  };
  performance: {
    processingTime: {
      average: string;
      minimum: string;
      maximum: string;
    };
    imageSize: {
      average: string;
      minimum: string;
      maximum: string;
    };
  };
  formatDistribution: {
    format: string;
    count: number;
    percentage: string;
  }[];
  qualityMetrics: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: number;
    overallScore: number;
    assessmentDate: string;
  } | null;
  trends: {
    firstHalfCount: number;
    secondHalfCount: number;
    growthRate: number;
    trend: string;
    averageDailyGrowth: string;
  };
  efficiency: {
    averageDailyCollection: number;
    highQualityRatio: number;
    successRate: number;
    efficiencyScore: string;
  };
  insights: string[];
}

const DataCollectionStatsScreen: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [stats, setStats] = useState<CollectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedQuality, setSelectedQuality] = useState('all');

  useEffect(() => {
    loadStats();
  }, [selectedPeriod, selectedSource, selectedQuality]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(selectedPeriod));

      const options: any = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      if (selectedSource !== 'all') {
        options.source = selectedSource;
      }

      if (selectedQuality !== 'all') {
        options.quality = selectedQuality;
      }

      const response = await dataQualityService.getCollectionStats(options);
      setStats(response.data);
    } catch (error) {
      console.error('加載統計數據失敗:', error);
      Alert.alert('錯誤', '加載統計數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (percentage: string) => {
    return `${parseFloat(percentage).toFixed(1)}%`;
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'low': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated': return '#4CAF50';
      case 'annotated': return '#2196F3';
      case 'processing': return '#FF9800';
      case 'pending': return '#9E9E9E';
      case 'rejected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderSummaryCard = () => {
    if (!stats) return null;

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>統計摘要</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatNumber(stats.summary.totalRecords)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>總記錄數</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {stats.summary.collectionPeriod}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>收集天數</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {stats.efficiency.averageDailyCollection.toFixed(1)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>日均收集</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPercentage(stats.efficiency.efficiencyScore)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.text }]}>效率分數</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSourceDistribution = () => {
    if (!stats || !stats.sourceDistribution.length) return null;

    const chartData = stats.sourceDistribution.map(item => ({
      name: item.source,
      population: item.count,
      color: '#2196F3',
      legendFontColor: colors.text,
      legendFontSize: 12
    }));

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>數據來源分布</Text>
        <PieChart
          data={chartData}
          width={width - 40}
          height={200}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
        <View style={styles.distributionList}>
          {stats.sourceDistribution.map((item, index) => (
            <View key={index} style={styles.distributionItem}>
              <Text style={[styles.distributionLabel, { color: colors.text }]}>
                {item.source}
              </Text>
              <Text style={[styles.distributionValue, { color: colors.text }]}>
                {item.count} ({item.percentage}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderQualityDistribution = () => {
    if (!stats || !stats.qualityDistribution.length) return null;

    const chartData = {
      labels: stats.qualityDistribution.map(item => item.quality),
      datasets: [{
        data: stats.qualityDistribution.map(item => item.count)
      }]
    };

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>數據質量分布</Text>
        <BarChart
          data={chartData}
          width={width - 40}
          height={200}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
          }}
          style={styles.chart}
        />
        <View style={styles.distributionList}>
          {stats.qualityDistribution.map((item, index) => (
            <View key={index} style={styles.distributionItem}>
              <View style={[styles.qualityIndicator, { backgroundColor: getQualityColor(item.quality) }]} />
              <Text style={[styles.distributionLabel, { color: colors.text }]}>
                {item.quality}
              </Text>
              <Text style={[styles.distributionValue, { color: colors.text }]}>
                {item.count} ({item.percentage}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderTimeSeries = () => {
    if (!stats || !stats.timeSeries.daily.length) return null;

    const chartData = {
      labels: stats.timeSeries.daily.slice(-7).map(item =>
        new Date(item.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        data: stats.timeSeries.daily.slice(-7).map(item => item.count)
      }]
    };

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>每日收集趨勢</Text>
        <LineChart
          data={chartData}
          width={width - 40}
          height={200}
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
          }}
          style={styles.chart}
        />
      </View>
    );
  };

  const renderPerformanceMetrics = () => {
    if (!stats) return null;

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>性能指標</Text>
        <View style={styles.performanceGrid}>
          <View style={styles.performanceSection}>
            <Text style={[styles.performanceTitle, { color: colors.text }]}>處理時間 (ms)</Text>
            <Text style={[styles.performanceValue, { color: colors.text }]}>
              平均: {stats.performance.processingTime.average}
            </Text>
            <Text style={[styles.performanceValue, { color: colors.text }]}>
              最小: {stats.performance.processingTime.minimum}
            </Text>
            <Text style={[styles.performanceValue, { color: colors.text }]}>
              最大: {stats.performance.processingTime.maximum}
            </Text>
          </View>
          <View style={styles.performanceSection}>
            <Text style={[styles.performanceTitle, { color: colors.text }]}>圖片大小 (KB)</Text>
            <Text style={[styles.performanceValue, { color: colors.text }]}>
              平均: {stats.performance.imageSize.average}
            </Text>
            <Text style={[styles.performanceValue, { color: colors.text }]}>
              最小: {stats.performance.imageSize.minimum}
            </Text>
            <Text style={[styles.performanceValue, { color: colors.text }]}>
              最大: {stats.performance.imageSize.maximum}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderQualityMetrics = () => {
    if (!stats || !stats.qualityMetrics) return null;

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>數據質量指標</Text>
        <View style={styles.qualityGrid}>
          <View style={styles.qualityItem}>
            <Text style={[styles.qualityLabel, { color: colors.text }]}>完整性</Text>
            <Text style={[styles.qualityValue, { color: colors.text }]}>
              {(stats.qualityMetrics.completeness * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.qualityItem}>
            <Text style={[styles.qualityLabel, { color: colors.text }]}>準確性</Text>
            <Text style={[styles.qualityValue, { color: colors.text }]}>
              {(stats.qualityMetrics.accuracy * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.qualityItem}>
            <Text style={[styles.qualityLabel, { color: colors.text }]}>一致性</Text>
            <Text style={[styles.qualityValue, { color: colors.text }]}>
              {(stats.qualityMetrics.consistency * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.qualityItem}>
            <Text style={[styles.qualityLabel, { color: colors.text }]}>時效性</Text>
            <Text style={[styles.qualityValue, { color: colors.text }]}>
              {(stats.qualityMetrics.timeliness * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
        <View style={styles.overallScore}>
          <Text style={[styles.overallScoreLabel, { color: colors.text }]}>總體分數</Text>
          <Text style={[styles.overallScoreValue, { color: colors.text }]}>
            {(stats.qualityMetrics.overallScore * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderInsights = () => {
    if (!stats || !stats.insights.length) return null;

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>數據洞察</Text>
        {stats.insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={[styles.insightText, { color: colors.text }]}>
              • {insight}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>加載統計數據...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <ActivityIndicator
            size="small"
            color={colors.primary}
            animating={refreshing}
          />
        }
        onRefresh={onRefresh}
      >
        {/* 篩選器 */}
        <View style={[styles.filterContainer, { backgroundColor: colors.card }]}>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>時間範圍:</Text>
            <Picker
              selectedValue={selectedPeriod}
              style={[styles.picker, { color: colors.text }]}
              onValueChange={setSelectedPeriod}
            >
              <Picker.Item label="最近7天" value="7" />
              <Picker.Item label="最近30天" value="30" />
              <Picker.Item label="最近90天" value="90" />
            </Picker>
          </View>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>數據來源:</Text>
            <Picker
              selectedValue={selectedSource}
              style={[styles.picker, { color: colors.text }]}
              onValueChange={setSelectedSource}
            >
              <Picker.Item label="全部" value="all" />
              <Picker.Item label="用戶上傳" value="user_upload" />
              <Picker.Item label="官方API" value="official_api" />
              <Picker.Item label="第三方平台" value="third_party" />
              <Picker.Item label="用戶糾正" value="user_correction" />
              <Picker.Item label="網頁爬蟲" value="web_scraping" />
            </Picker>
          </View>
          <View style={styles.filterRow}>
            <Text style={[styles.filterLabel, { color: colors.text }]}>數據質量:</Text>
            <Picker
              selectedValue={selectedQuality}
              style={[styles.picker, { color: colors.text }]}
              onValueChange={setSelectedQuality}
            >
              <Picker.Item label="全部" value="all" />
              <Picker.Item label="高質量" value="high" />
              <Picker.Item label="中等質量" value="medium" />
              <Picker.Item label="低質量" value="low" />
            </Picker>
          </View>
        </View>

        {renderSummaryCard()}
        {renderSourceDistribution()}
        {renderQualityDistribution()}
        {renderTimeSeries()}
        {renderPerformanceMetrics()}
        {renderQualityMetrics()}
        {renderInsights()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollView: {
    flex: 1,
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center'
  },
  filterContainer: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
    minWidth: 80
  },
  picker: {
    flex: 1,
    height: 40
  },
  card: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5
  },
  summaryLabel: {
    fontSize: 12,
    opacity: 0.7
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  distributionList: {
    marginTop: 15
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  distributionLabel: {
    fontSize: 14,
    flex: 1
  },
  distributionValue: {
    fontSize: 14,
    fontWeight: '600'
  },
  qualityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  performanceSection: {
    flex: 1
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  performanceValue: {
    fontSize: 14,
    marginBottom: 5
  },
  qualityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  qualityItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15
  },
  qualityLabel: {
    fontSize: 14,
    marginBottom: 5
  },
  qualityValue: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  overallScore: {
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  overallScoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5
  },
  overallScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  insightItem: {
    marginBottom: 10
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20
  }
});

export default DataCollectionStatsScreen;
