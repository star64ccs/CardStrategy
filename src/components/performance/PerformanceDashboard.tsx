import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../../services/apiService';
import { logger } from '../../utils/logger';

interface PerformanceMetrics {
  timestamp: string;
  database: {
    queryStats: Record<string, any>;
    slowQueries: number;
    totalQueries: number;
  };
  performance: {
    requests: number;
    cacheHits: number;
    cacheMisses: number;
    avgResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
  redis: {
    connected: boolean;
    memory: string;
    keyspace: string;
  };
  system: {
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
      external: number;
      rss: number;
    };
    cpu: {
      user: number;
      system: number;
    };
  };
}

interface OptimizationSuggestion {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: Record<string, string>;
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'database' | 'cache' | 'system'>('overview');

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // 每30秒更新一次
    return () => clearInterval(interval);
  }, []);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      const [metricsData, suggestionsData, healthData] = await Promise.all([
        apiService.get<PerformanceMetrics>('/api/performance/stats'),
        apiService.get<{ data: { suggestions: OptimizationSuggestion[] } }>('/api/performance/optimization/suggestions'),
        apiService.get<HealthStatus>('/api/performance/health')
      ]);

      setMetrics(metricsData.data);
      setSuggestions(suggestionsData.data.suggestions);
      setHealth(healthData.data);
    } catch (error) {
      logger.error('加載性能數據失敗:', error);
      Alert.alert('錯誤', '加載性能數據失敗');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPerformanceData();
  };

  const clearCache = async () => {
    try {
      await apiService.post('/api/performance/cache/clear', { pattern: '*' });
      Alert.alert('成功', '緩存已清理');
      loadPerformanceData();
    } catch (error) {
      logger.error('清理緩存失敗:', error);
      Alert.alert('錯誤', '清理緩存失敗');
    }
  };

  const resetMetrics = async () => {
    try {
      await apiService.post('/api/performance/metrics/reset');
      Alert.alert('成功', '性能指標已重置');
      loadPerformanceData();
    } catch (error) {
      logger.error('重置指標失敗:', error);
      Alert.alert('錯誤', '重置指標失敗');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return '#4CAF50';
      case 'degraded': return '#FF9800';
      case 'unhealthy': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const renderOverview = () => (
    <ScrollView style={styles.container}>
      {/* 健康狀態卡片 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialCommunityIcons name="heart-pulse" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>系統健康狀態</Text>
        </View>
        {health && (
          <View style={styles.healthStatus}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(health.status) }]} />
            <Text style={styles.statusText}>{health.status.toUpperCase()}</Text>
            <Text style={styles.timestamp}>{new Date(health.timestamp).toLocaleString()}</Text>
          </View>
        )}
      </View>

      {/* 性能指標卡片 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="speed" size={24} color="#2196F3" />
          <Text style={styles.cardTitle}>性能指標</Text>
        </View>
        {metrics && (
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>平均響應時間</Text>
              <Text style={styles.metricValue}>{metrics.performance.avgResponseTime.toFixed(2)}ms</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>緩存命中率</Text>
              <Text style={styles.metricValue}>{metrics.performance.cacheHitRate.toFixed(1)}%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>錯誤率</Text>
              <Text style={styles.metricValue}>{metrics.performance.errorRate.toFixed(2)}%</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>總請求數</Text>
              <Text style={styles.metricValue}>{metrics.performance.requests}</Text>
            </View>
          </View>
        )}
      </View>

      {/* 數據庫性能圖表 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="storage" size={24} color="#FF9800" />
          <Text style={styles.cardTitle}>數據庫性能</Text>
        </View>
        {metrics && (
          <View>
            <Text style={styles.chartTitle}>查詢統計</Text>
            <BarChart
              data={{
                labels: ['總查詢', '慢查詢', '緩存命中'],
                datasets: [{
                  data: [
                    metrics.database.totalQueries,
                    metrics.database.slowQueries,
                    metrics.performance.cacheHits
                  ]
                }]
              }}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                style: {
                  borderRadius: 16
                }
              }}
              style={styles.chart}
            />
          </View>
        )}
      </View>

      {/* 系統資源使用 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="memory" size={24} color="#9C27B0" />
          <Text style={styles.cardTitle}>系統資源</Text>
        </View>
        {metrics && (
          <View style={styles.resourceGrid}>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceLabel}>內存使用</Text>
              <Text style={styles.resourceValue}>
                {((metrics.system.memory.heapUsed / metrics.system.memory.heapTotal) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceLabel}>運行時間</Text>
              <Text style={styles.resourceValue}>
                {Math.floor(metrics.system.uptime / 3600)}h {Math.floor((metrics.system.uptime % 3600) / 60)}m
              </Text>
            </View>
            <View style={styles.resourceItem}>
              <Text style={styles.resourceLabel}>Redis狀態</Text>
              <Text style={[styles.resourceValue, { color: metrics.redis.connected ? '#4CAF50' : '#F44336' }]}>
                {metrics.redis.connected ? '連接正常' : '連接異常'}
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderDatabase = () => (
    <ScrollView style={styles.container}>
      {/* 數據庫查詢統計 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="query-stats" size={24} color="#2196F3" />
          <Text style={styles.cardTitle}>查詢統計</Text>
        </View>
        {metrics && (
          <View>
            {Object.entries(metrics.database.queryStats).map(([query, stats]) => (
              <View key={query} style={styles.queryStatsItem}>
                <Text style={styles.queryName}>{query}</Text>
                <View style={styles.queryStatsGrid}>
                  <Text style={styles.queryStat}>查詢次數: {stats.count}</Text>
                  <Text style={styles.queryStat}>平均時間: {stats.avgTime?.toFixed(2) || 0}ms</Text>
                  <Text style={styles.queryStat}>慢查詢: {stats.slowQueries}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderCache = () => (
    <ScrollView style={styles.container}>
      {/* 緩存性能 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="cached" size={24} color="#4CAF50" />
          <Text style={styles.cardTitle}>緩存性能</Text>
        </View>
        {metrics && (
          <View>
            <PieChart
              data={[
                {
                  name: '緩存命中',
                  population: metrics.performance.cacheHits,
                  color: '#4CAF50',
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 12
                },
                {
                  name: '緩存未命中',
                  population: metrics.performance.cacheMisses,
                  color: '#F44336',
                  legendFontColor: '#7F7F7F',
                  legendFontSize: 12
                }
              ]}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        )}
      </View>

      {/* 緩存操作 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="settings" size={24} color="#FF9800" />
          <Text style={styles.cardTitle}>緩存操作</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={clearCache}>
            <MaterialIcons name="clear" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>清理緩存</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={resetMetrics}>
            <MaterialIcons name="refresh" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>重置指標</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderSystem = () => (
    <ScrollView style={styles.container}>
      {/* 優化建議 */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="lightbulb" size={24} color="#FFC107" />
          <Text style={styles.cardTitle}>優化建議</Text>
        </View>
        {suggestions.map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <View style={styles.suggestionHeader}>
              <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(suggestion.priority) }]} />
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            </View>
            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            <Text style={styles.suggestionType}>類型: {suggestion.type}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* 標題欄 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>性能監控儀表板</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <MaterialIcons name="refresh" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {/* 標籤欄 */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: '概覽', icon: 'dashboard' },
          { key: 'database', label: '數據庫', icon: 'storage' },
          { key: 'cache', label: '緩存', icon: 'cached' },
          { key: 'system', label: '系統', icon: 'settings' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <MaterialIcons
              name={tab.icon as any}
              size={20}
              color={selectedTab === tab.key ? '#2196F3' : '#666'}
            />
            <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 內容區域 */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedTab === 'overview' && renderOverview()}
        {selectedTab === 'database' && renderDatabase()}
        {selectedTab === 'cache' && renderCache()}
        {selectedTab === 'system' && renderSystem()}
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  refreshButton: {
    padding: 8
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
    borderBottomColor: '#2196F3'
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666'
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold'
  },
  content: {
    flex: 1
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333'
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8
  },
  timestamp: {
    fontSize: 12,
    color: '#666'
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metricItem: {
    width: '48%',
    marginBottom: 16
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  resourceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  resourceItem: {
    alignItems: 'center'
  },
  resourceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  resourceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  queryStatsItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 4
  },
  queryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  queryStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  queryStat: {
    fontSize: 12,
    color: '#666'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14
  },
  suggestionItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 4
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  priorityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333'
  },
  suggestionDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  suggestionType: {
    fontSize: 10,
    color: '#999'
  }
});

export default PerformanceDashboard;
