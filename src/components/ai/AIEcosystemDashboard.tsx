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
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Loading } from '../common/Loading';
import { Toast } from '../common/Toast';
import { aiEcosystem } from '../../services/aiEcosystem';
import { aiEcosystemMonitor, AIEcosystemDashboard as DashboardData } from '../../services/aiEcosystemMonitor';
import { logger } from '../../utils/logger';

const { width } = Dimensions.get('window');

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  onPress?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  trend,
  color = '#007AFF',
  onPress
}) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress}>
    <Card style={[styles.metricCard, { borderLeftColor: color }]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <View style={styles.metricValueContainer}>
        <Text style={[styles.metricValue, { color }]}>
          {typeof value === 'number' ? value.toFixed(2) : value}
        </Text>
        {unit && <Text style={styles.metricUnit}>{unit}</Text>}
      </View>
      {trend && (
        <View style={styles.trendContainer}>
          <Text style={[
            styles.trendIcon,
            { color: trend === 'up' ? '#34C759' : trend === 'down' ? '#FF3B30' : '#8E8E93' }
          ]}>
            {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
          </Text>
        </View>
      )}
    </Card>
  </TouchableOpacity>
);

interface AlertCardProps {
  alert: any;
  onAcknowledge: (alertId: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onAcknowledge }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#FFCC00';
      case 'low': return '#34C759';
      default: return '#8E8E93';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📝';
    }
  };

  return (
    <Card style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
      <View style={styles.alertHeader}>
        <Text style={styles.alertIcon}>{getSeverityIcon(alert.severity)}</Text>
        <View style={styles.alertInfo}>
          <Text style={styles.alertTitle}>{alert.title}</Text>
          <Text style={styles.alertTimestamp}>
            {new Date(alert.timestamp).toLocaleString()}
          </Text>
        </View>
        {!alert.acknowledged && (
          <TouchableOpacity
            style={styles.acknowledgeButton}
            onPress={() => onAcknowledge(alert.id)}
          >
            <Text style={styles.acknowledgeText}>確認</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.alertMessage}>{alert.message}</Text>
    </Card>
  );
};

interface TaskCardProps {
  task: any;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#34C759';
      case 'processing': return '#007AFF';
      case 'failed': return '#FF3B30';
      case 'pending': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'processing': return '處理中';
      case 'failed': return '失敗';
      case 'pending': return '等待中';
      default: return '未知';
    }
  };

  return (
    <Card style={styles.taskCard}>
      <View style={styles.taskHeader}>
        <Text style={styles.taskType}>{task.type}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(task.status) }]}>
          <Text style={styles.statusText}>{getStatusText(task.status)}</Text>
        </View>
      </View>
      <Text style={styles.taskPrompt} numberOfLines={2}>
        {task.prompt}
      </Text>
      <View style={styles.taskMeta}>
        <Text style={styles.taskMetaText}>
          創建時間: {new Date(task.createdAt).toLocaleString()}
        </Text>
        {task.provider && (
          <Text style={styles.taskMetaText}>提供商: {task.provider}</Text>
        )}
      </View>
    </Card>
  );
};

export const AIEcosystemDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    initializeDashboard();
    return () => {
      // 清理監控
      aiEcosystemMonitor.stopMonitoring();
    };
  }, []);

  const initializeDashboard = async () => {
    try {
      setIsLoading(true);

      // 初始化AI生態系統
      await aiEcosystem.initialize();

      // 啟動監控
      await aiEcosystemMonitor.startMonitoring();
      setIsMonitoring(true);

      // 設置警報處理器
      aiEcosystemMonitor.addAlertHandler((alert) => {
        Toast.show({
          type: alert.type === 'error' ? 'error' : 'info',
          title: alert.title,
          message: alert.message
        });
      });

      // 獲取初始數據
      await refreshDashboard();

    } catch (error) {
      logger.error('初始化儀表板失敗:', error);
      Alert.alert('錯誤', '初始化AI生態系統失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshDashboard = async () => {
    try {
      setIsRefreshing(true);

      // 獲取儀表板數據
      const data = aiEcosystemMonitor.getDashboard();
      setDashboardData(data);

    } catch (error) {
      logger.error('刷新儀表板失敗:', error);
      Alert.alert('錯誤', '刷新數據失敗');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    try {
      aiEcosystemMonitor.acknowledgeAlert(alertId, 'user');
      refreshDashboard();
      Toast.show({
        type: 'success',
        title: '成功',
        message: '警報已確認'
      });
    } catch (error) {
      logger.error('確認警報失敗:', error);
      Alert.alert('錯誤', '確認警報失敗');
    }
  };

  const handleToggleMonitoring = async () => {
    try {
      if (isMonitoring) {
        aiEcosystemMonitor.stopMonitoring();
        setIsMonitoring(false);
        Toast.show({
          type: 'info',
          title: '監控已停止',
          message: 'AI生態系統監控已停止'
        });
      } else {
        await aiEcosystemMonitor.startMonitoring();
        setIsMonitoring(true);
        Toast.show({
          type: 'success',
          title: '監控已啟動',
          message: 'AI生態系統監控已啟動'
        });
      }
    } catch (error) {
      logger.error('切換監控狀態失敗:', error);
      Alert.alert('錯誤', '切換監控狀態失敗');
    }
  };

  const handleGenerateReport = async () => {
    try {
      Alert.alert(
        '生成報告',
        '選擇報告類型',
        [
          { text: '日報', onPress: () => generateReport('daily') },
          { text: '週報', onPress: () => generateReport('weekly') },
          { text: '月報', onPress: () => generateReport('monthly') },
          { text: '取消', style: 'cancel' }
        ]
      );
    } catch (error) {
      logger.error('生成報告失敗:', error);
      Alert.alert('錯誤', '生成報告失敗');
    }
  };

  const generateReport = async (type: 'daily' | 'weekly' | 'monthly') => {
    try {
      const report = await aiEcosystemMonitor.generateReport(type);

      Alert.alert(
        '報告生成成功',
        `已生成${type === 'daily' ? '日' : type === 'weekly' ? '週' : '月'}報`,
        [
          {
            text: '查看建議',
            onPress: () => {
              const recommendations = report.recommendations.join('\n• ');
              Alert.alert('優化建議', `• ${recommendations}`);
            }
          },
          { text: '確定', style: 'default' }
        ]
      );
    } catch (error) {
      logger.error('生成報告失敗:', error);
      Alert.alert('錯誤', '生成報告失敗');
    }
  };

  const handleTestConnection = async () => {
    try {
      const results = await aiEcosystem.testConnection();
      const onlineProviders = Object.entries(results)
        .filter(([_, isOnline]) => isOnline)
        .map(([provider]) => provider);

      Alert.alert(
        '連接測試結果',
        `在線提供商: ${onlineProviders.join(', ') || '無'}`
      );
    } catch (error) {
      logger.error('測試連接失敗:', error);
      Alert.alert('錯誤', '測試連接失敗');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Loading size="large" />
        <Text style={styles.loadingText}>初始化AI生態系統...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>無法載入儀表板數據</Text>
        <Button title="重試" onPress={refreshDashboard} />
      </View>
    );
  }

  const { realTimeMetrics, recentAlerts, activeTasks, systemHealth, performanceTrends } = dashboardData;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshDashboard}
        />
      }
    >
      {/* 標題和控制按鈕 */}
      <View style={styles.header}>
        <Text style={styles.title}>AI生態系統儀表板</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={[styles.monitorButton, { backgroundColor: isMonitoring ? '#34C759' : '#FF3B30' }]}
            onPress={handleToggleMonitoring}
          >
            <Text style={styles.monitorButtonText}>
              {isMonitoring ? '停止監控' : '啟動監控'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 實時指標 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>實時指標</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="請求/秒"
            value={realTimeMetrics.requestsPerSecond}
            unit="req/s"
            color="#007AFF"
          />
          <MetricCard
            title="平均響應時間"
            value={realTimeMetrics.averageResponseTime}
            unit="ms"
            color="#FF9500"
          />
          <MetricCard
            title="成功率"
            value={realTimeMetrics.successRate * 100}
            unit="%"
            color="#34C759"
          />
          <MetricCard
            title="月度成本"
            value={realTimeMetrics.monthlyCost}
            unit="$"
            color="#FF3B30"
          />
          <MetricCard
            title="隊列長度"
            value={realTimeMetrics.queueLength}
            color="#8E8E93"
          />
          <MetricCard
            title="活躍任務"
            value={realTimeMetrics.activeTasks}
            color="#AF52DE"
          />
        </View>
      </View>

      {/* 系統健康狀態 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>系統健康狀態</Text>
        <Card style={styles.healthCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.healthTitle}>整體健康度</Text>
            <View style={[
              styles.healthBadge,
              { backgroundColor: systemHealth.overallHealth === 'excellent' ? '#34C759' :
                systemHealth.overallHealth === 'good' ? '#007AFF' :
                  systemHealth.overallHealth === 'fair' ? '#FF9500' : '#FF3B30' }
            ]}>
              <Text style={styles.healthBadgeText}>
                {systemHealth.overallHealth === 'excellent' ? '優秀' :
                  systemHealth.overallHealth === 'good' ? '良好' :
                    systemHealth.overallHealth === 'fair' ? '一般' : '較差'}
              </Text>
            </View>
          </View>
          <View style={styles.healthMetrics}>
            <Text style={styles.healthMetric}>
              CPU使用率: {systemHealth.system.cpuUsage.toFixed(1)}%
            </Text>
            <Text style={styles.healthMetric}>
              內存使用率: {systemHealth.system.memoryUsage.toFixed(1)}%
            </Text>
            <Text style={styles.healthMetric}>
              網絡延遲: {systemHealth.system.networkLatency.toFixed(0)}ms
            </Text>
          </View>
        </Card>
      </View>

      {/* 最近警報 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>最近警報</Text>
          <TouchableOpacity onPress={handleGenerateReport}>
            <Text style={styles.actionButton}>生成報告</Text>
          </TouchableOpacity>
        </View>
        {recentAlerts.length > 0 ? (
          recentAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={handleAcknowledgeAlert}
            />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>暫無警報</Text>
          </Card>
        )}
      </View>

      {/* 活躍任務 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>活躍任務</Text>
          <TouchableOpacity onPress={handleTestConnection}>
            <Text style={styles.actionButton}>測試連接</Text>
          </TouchableOpacity>
        </View>
        {activeTasks.length > 0 ? (
          activeTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>暫無活躍任務</Text>
          </Card>
        )}
      </View>

      {/* 操作按鈕 */}
      <View style={styles.actions}>
        <Button
          title="刷新數據"
          onPress={refreshDashboard}
          style={styles.actionButton}
        />
        <Button
          title="清除歷史"
          onPress={() => {
            Alert.alert(
              '確認清除',
              '確定要清除所有歷史數據嗎？',
              [
                { text: '取消', style: 'cancel' },
                {
                  text: '確定',
                  style: 'destructive',
                  onPress: () => {
                    aiEcosystemMonitor.clearHistory();
                    refreshDashboard();
                  }
                }
              ]
            );
          }}
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7'
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000'
  },
  headerControls: {
    flexDirection: 'row'
  },
  monitorButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  monitorButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  section: {
    margin: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000'
  },
  actionButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600'
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  metricCard: {
    width: (width - 48) / 2,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4
  },
  metricTitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8
  },
  metricValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  metricUnit: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4
  },
  trendContainer: {
    marginTop: 8
  },
  trendIcon: {
    fontSize: 16
  },
  healthCard: {
    padding: 16
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  healthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000'
  },
  healthBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  healthBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  healthMetrics: {
    gap: 8
  },
  healthMetric: {
    fontSize: 14,
    color: '#000000'
  },
  alertCard: {
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  alertIcon: {
    fontSize: 20,
    marginRight: 8
  },
  alertInfo: {
    flex: 1
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000'
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2
  },
  acknowledgeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  acknowledgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  alertMessage: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20
  },
  taskCard: {
    marginBottom: 12,
    padding: 16
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  taskType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  taskPrompt: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    lineHeight: 20
  },
  taskMeta: {
    gap: 4
  },
  taskMetaText: {
    fontSize: 12,
    color: '#8E8E93'
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    gap: 12
  }
});

export default AIEcosystemDashboard;
