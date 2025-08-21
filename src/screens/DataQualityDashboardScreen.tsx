import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Alert,
  TouchableOpacity
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '@/config/ThemeProvider';
import { useTranslation } from '@/i18n';
import { dataQualityService } from '@/services/dataQualityService';
import { Button, Card, Input, Modal, Toast } from '@/components/common';
import { Loading } from '@/components/common/Loading';

const { width: screenWidth } = Dimensions.get('window');

interface DashboardData {
  overallMetrics: {
    averageCompleteness: number;
    averageAccuracy: number;
    averageConsistency: number;
    averageTimeliness: number;
    overallScore: number;
    totalAssessments: number;
  };
  trendData: {
    dateLabels: string[];
    trendData: {
      [key: string]: {
        completeness: number[];
        accuracy: number[];
        consistency: number[];
        timeliness: number[];
        overallScore: number[];
      };
    };
  };
  sourceBreakdown: {
    sourceBreakdown: { source: string; count: number; percentage: number }[];
    qualityBreakdown: { quality: string; count: number; percentage: number }[];
    statusBreakdown: { status: string; count: number; percentage: number }[];
    totalRecords: number;
  };
  qualityDistribution: {
    overallDistribution: {
      excellent: { count: number; percentage: number };
      good: { count: number; percentage: number };
      fair: { count: number; percentage: number };
      poor: { count: number; percentage: number };
    };
    totalAssessments: number;
  };
  annotatorPerformance: {
    annotatorStats: {
      username: string;
      totalAnnotations: number;
      approvedAnnotations: number;
      rejectedAnnotations: number;
      averageConfidence: number;
      averageProcessingTime: number;
      approvalRate: number;
    }[];
    totalAnnotations: number;
  };
  recentIssues: {
    type: string;
    severity: string;
    title: string;
    description: string;
    date: string;
  }[];
  improvementSuggestions: {
    priority: string;
    category: string;
    title: string;
    description: string;
    action: string;
  }[];
  lastUpdated: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

const DataQualityDashboardScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>([
    'training',
    'annotation',
    'validation',
    'market',
    'user_generated'
  ]);

  const dataTypes = [
    { key: 'training', label: '訓練數據' },
    { key: 'annotation', label: '標註數據' },
    { key: 'validation', label: '驗證數據' },
    { key: 'market', label: '市場數據' },
    { key: 'user_generated', label: '用戶生成數據' }
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dataQualityService.getDashboardData({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        dataTypes: selectedDataTypes
      });
      setDashboardData(response.data);
    } catch (error) {
      // logger.info('Failed to fetch dashboard data:', error);
      Toast.show('獲取儀表板數據失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, selectedDataTypes]);

  const getQualityColor = (score: number) => {
    if (score >= 0.9) return theme.colors.success;
    if (score >= 0.7) return theme.colors.warning;
    return theme.colors.error;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.info;
      default:
        return theme.colors.text;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.success;
      default:
        return theme.colors.text;
    }
  };

  const chartConfig = {
    backgroundColor: theme.colors.background,
    backgroundGradientFrom: theme.colors.background,
    backgroundGradientTo: theme.colors.background,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!dashboardData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          無法載入儀表板數據
        </Text>
        <Button title="重試" onPress={fetchDashboardData} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          數據質量監控儀表板
        </Text>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Text style={[styles.filterButtonText, { color: theme.colors.white }]}>
            篩選
          </Text>
        </TouchableOpacity>
      </View>

      {/* Overall Metrics */}
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          整體質量指標
        </Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              完整性
            </Text>
            <Text
              style={[
                styles.metricValue,
                { color: getQualityColor(dashboardData.overallMetrics.averageCompleteness) }
              ]}
            >
              {(dashboardData.overallMetrics.averageCompleteness * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              準確性
            </Text>
            <Text
              style={[
                styles.metricValue,
                { color: getQualityColor(dashboardData.overallMetrics.averageAccuracy) }
              ]}
            >
              {(dashboardData.overallMetrics.averageAccuracy * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              一致性
            </Text>
            <Text
              style={[
                styles.metricValue,
                { color: getQualityColor(dashboardData.overallMetrics.averageConsistency) }
              ]}
            >
              {(dashboardData.overallMetrics.averageConsistency * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>
              時效性
            </Text>
            <Text
              style={[
                styles.metricValue,
                { color: getQualityColor(dashboardData.overallMetrics.averageTimeliness) }
              ]}
            >
              {(dashboardData.overallMetrics.averageTimeliness * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
        <View style={styles.overallScore}>
          <Text style={[styles.overallScoreLabel, { color: theme.colors.textSecondary }]}>
            整體評分
          </Text>
          <Text
            style={[
              styles.overallScoreValue,
              { color: getQualityColor(dashboardData.overallMetrics.overallScore) }
            ]}
          >
            {(dashboardData.overallMetrics.overallScore * 100).toFixed(1)}%
          </Text>
        </View>
      </Card>

      {/* Quality Distribution */}
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          質量分佈
        </Text>
        <View style={styles.distributionContainer}>
          <PieChart
            data={[
              {
                name: '優秀',
                population: dashboardData.qualityDistribution.overallDistribution.excellent.count,
                color: theme.colors.success,
                legendFontColor: theme.colors.text
              },
              {
                name: '良好',
                population: dashboardData.qualityDistribution.overallDistribution.good.count,
                color: theme.colors.warning,
                legendFontColor: theme.colors.text
              },
              {
                name: '一般',
                population: dashboardData.qualityDistribution.overallDistribution.fair.count,
                color: theme.colors.info,
                legendFontColor: theme.colors.text
              },
              {
                name: '較差',
                population: dashboardData.qualityDistribution.overallDistribution.poor.count,
                color: theme.colors.error,
                legendFontColor: theme.colors.text
              }
            ]}
            width={screenWidth - 80}
            height={200}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />
        </View>
      </Card>

      {/* Trend Chart */}
      {dashboardData.trendData.dateLabels.length > 0 && (
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            質量趨勢
          </Text>
          <LineChart
            data={{
              labels: dashboardData.trendData.dateLabels.slice(-7), // Last 7 days
              datasets: [
                {
                  data: Object.values(dashboardData.trendData.trendData)[0]?.overallScore.slice(-7) || [],
                  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
                  strokeWidth: 2
                }
              ]
            }}
            width={screenWidth - 80}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </Card>
      )}

      {/* Source Breakdown */}
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          數據來源分佈
        </Text>
        <BarChart
          data={{
            labels: dashboardData.sourceBreakdown.sourceBreakdown.map(item => item.source),
            datasets: [
              {
                data: dashboardData.sourceBreakdown.sourceBreakdown.map(item => item.count)
              }
            ]
          }}
          width={screenWidth - 80}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </Card>

      {/* Recent Issues */}
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          最近問題
        </Text>
        {dashboardData.recentIssues.slice(0, 5).map((issue, index) => (
          <View key={index} style={styles.issueItem}>
            <View style={styles.issueHeader}>
              <Text
                style={[
                  styles.issueTitle,
                  { color: theme.colors.text }
                ]}
              >
                {issue.title}
              </Text>
              <View
                style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(issue.severity) }
                ]}
              >
                <Text style={styles.severityText}>{issue.severity}</Text>
              </View>
            </View>
            <Text style={[styles.issueDescription, { color: theme.colors.textSecondary }]}>
              {issue.description}
            </Text>
            <Text style={[styles.issueDate, { color: theme.colors.textSecondary }]}>
              {new Date(issue.date).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </Card>

      {/* Improvement Suggestions */}
      <Card style={styles.card}>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          改進建議
        </Text>
        {dashboardData.improvementSuggestions.slice(0, 5).map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <View style={styles.suggestionHeader}>
              <Text
                style={[
                  styles.suggestionTitle,
                  { color: theme.colors.text }
                ]}
              >
                {suggestion.title}
              </Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(suggestion.priority) }
                ]}
              >
                <Text style={styles.priorityText}>{suggestion.priority}</Text>
              </View>
            </View>
            <Text style={[styles.suggestionDescription, { color: theme.colors.textSecondary }]}>
              {suggestion.description}
            </Text>
            <Text style={[styles.suggestionAction, { color: theme.colors.primary }]}>
              建議行動: {suggestion.action}
            </Text>
          </View>
        ))}
      </Card>

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        title="篩選設置"
      >
        <View style={styles.filterContent}>
          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
            日期範圍
          </Text>
          <View style={styles.dateInputs}>
            <Input
              label="開始日期"
              value={dateRange.startDate}
              onChangeText={(text) => setDateRange(prev => ({ ...prev, startDate: text }))}
              placeholder="YYYY-MM-DD"
            />
            <Input
              label="結束日期"
              value={dateRange.endDate}
              onChangeText={(text) => setDateRange(prev => ({ ...prev, endDate: text }))}
              placeholder="YYYY-MM-DD"
            />
          </View>

          <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
            數據類型
          </Text>
          {dataTypes.map((dataType) => (
            <TouchableOpacity
              key={dataType.key}
              style={styles.dataTypeItem}
              onPress={() => {
                if (selectedDataTypes.includes(dataType.key)) {
                  setSelectedDataTypes(prev => prev.filter(type => type !== dataType.key));
                } else {
                  setSelectedDataTypes(prev => [...prev, dataType.key]);
                }
              }}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: selectedDataTypes.includes(dataType.key)
                      ? theme.colors.primary
                      : theme.colors.background,
                    borderColor: theme.colors.border
                  }
                ]}
              />
              <Text style={[styles.dataTypeLabel, { color: theme.colors.text }]}>
                {dataType.label}
              </Text>
            </TouchableOpacity>
          ))}

          <Button
            title="應用篩選"
            onPress={() => {
              setFilterModalVisible(false);
              fetchDashboardData();
            }}
            style={styles.applyButton}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600'
  },
  card: {
    marginBottom: 16,
    padding: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16
  },
  metricLabel: {
    fontSize: 14,
    marginBottom: 4
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  overallScore: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0'
  },
  overallScoreLabel: {
    fontSize: 16,
    marginBottom: 4
  },
  overallScoreValue: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  distributionContainer: {
    alignItems: 'center'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  issueItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  issueDescription: {
    fontSize: 14,
    marginBottom: 4
  },
  issueDate: {
    fontSize: 12
  },
  suggestionItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  suggestionDescription: {
    fontSize: 14,
    marginBottom: 4
  },
  suggestionAction: {
    fontSize: 14,
    fontStyle: 'italic'
  },
  filterContent: {
    padding: 16
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  dateInputs: {
    marginBottom: 16
  },
  dataTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    marginRight: 8
  },
  dataTypeLabel: {
    fontSize: 16
  },
  applyButton: {
    marginTop: 16
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50
  }
});

export default DataQualityDashboardScreen;
