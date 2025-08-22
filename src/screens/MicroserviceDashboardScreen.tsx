import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import { microserviceOrchestrator } from '../services/microserviceOrchestrator';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';

const screenWidth = Dimensions.get('window').width;

interface MicroserviceDashboardScreenProps {
  navigation: any;
}

const MicroserviceDashboardScreen: React.FC<
  MicroserviceDashboardScreenProps
> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [loadBalancerStatus, setLoadBalancerStatus] = useState<any>(null);
  const [messageQueueStatus, setMessageQueueStatus] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [serviceMetrics, setServiceMetrics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadServices(),
        loadLoadBalancerStatus(),
        loadMessageQueueStatus(),
      ]);
    } catch (error) {
      errorHandler.handleError(error as Error, {
        service: 'MicroserviceDashboardScreen',
        method: 'loadData',
      });
      Alert.alert('錯誤', '載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const serviceList = await microserviceOrchestrator.getServiceList();
      setServices(serviceList);
    } catch (error) {
      logger.error('載入服務列表失敗', { error });
    }
  };

  const loadLoadBalancerStatus = async () => {
    try {
      const status = await microserviceOrchestrator.getLoadBalancerStatus();
      setLoadBalancerStatus(status);
    } catch (error) {
      logger.error('載入負載均衡器狀態失敗', { error });
    }
  };

  const loadMessageQueueStatus = async () => {
    try {
      const status = await microserviceOrchestrator.getMessageQueueStatus();
      setMessageQueueStatus(status);
    } catch (error) {
      logger.error('載入消息隊列狀態失敗', { error });
    }
  };

  const loadServiceMetrics = async (serviceId: string) => {
    try {
      const metrics = await microserviceOrchestrator.getServiceMetrics(
        serviceId,
        '24h'
      );
      setServiceMetrics(metrics);
      setSelectedService(serviceId);
    } catch (error) {
      logger.error('載入服務指標失敗', { error, serviceId });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRegisterService = async () => {
    try {
      const registration = {
        serviceName: 'test-service',
        version: '1.0.0',
        endpoints: {
          health: 'http://localhost:3001/health',
          metrics: 'http://localhost:3001/metrics',
          api: 'http://localhost:3001/api',
        },
        metadata: {
          instanceId: `instance_${Date.now()}`,
          host: 'localhost',
          port: 3001,
          region: 'us-east-1',
          environment: 'development',
        },
      };

      const result =
        await microserviceOrchestrator.registerService(registration);
      if (result.success) {
        Alert.alert('成功', '服務註冊成功');
        await loadData();
      }
    } catch (error) {
      errorHandler.handleError(error as Error, {
        service: 'MicroserviceDashboardScreen',
        method: 'handleRegisterService',
      });
      Alert.alert('錯誤', '服務註冊失敗');
    }
  };

  const handleSendMessage = async () => {
    try {
      const message = {
        id: `msg_${Date.now()}`,
        type: 'test',
        data: { test: 'data' },
        timestamp: new Date().toISOString(),
      };

      const result = await microserviceOrchestrator.sendMessage(
        'test-queue',
        message
      );
      if (result.success) {
        Alert.alert('成功', '消息發送成功');
        await loadMessageQueueStatus();
      }
    } catch (error) {
      errorHandler.handleError(error as Error, {
        service: 'MicroserviceDashboardScreen',
        method: 'handleSendMessage',
      });
      Alert.alert('錯誤', '消息發送失敗');
    }
  };

  const renderServiceList = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>服務列表</Text>
      <View style={styles.serviceList}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.serviceId}
            style={[
              styles.serviceItem,
              selectedService === service.serviceId &&
                styles.selectedServiceItem,
            ]}
            onPress={() => loadServiceMetrics(service.serviceId)}
          >
            <View style={styles.serviceHeader}>
              <Text style={styles.serviceName}>{service.serviceName}</Text>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(service.status) },
                ]}
              />
            </View>
            <Text style={styles.serviceVersion}>版本: {service.version}</Text>
            <Text style={styles.serviceStatus}>狀態: {service.status}</Text>
            <Text style={styles.serviceHealth}>
              成功率: {service.health.successRate.toFixed(1)}%
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderLoadBalancerStatus = () => {
    if (!loadBalancerStatus) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>負載均衡器狀態</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>總服務數</Text>
            <Text style={styles.statusValue}>
              {loadBalancerStatus.totalServices}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>健康服務</Text>
            <Text style={[styles.statusValue, { color: '#4CAF50' }]}>
              {loadBalancerStatus.healthyServices}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>不健康服務</Text>
            <Text style={[styles.statusValue, { color: '#F44336' }]}>
              {loadBalancerStatus.unhealthyServices}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>總請求數</Text>
            <Text style={styles.statusValue}>
              {loadBalancerStatus.totalRequests}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>平均響應時間</Text>
            <Text style={styles.statusValue}>
              {loadBalancerStatus.averageResponseTime.toFixed(2)}ms
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>錯誤率</Text>
            <Text style={[styles.statusValue, { color: '#FF9800' }]}>
              {loadBalancerStatus.errorRate.toFixed(2)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderMessageQueueStatus = () => {
    if (!messageQueueStatus) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>消息隊列狀態</Text>
        <View style={styles.statusGrid}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>總隊列數</Text>
            <Text style={styles.statusValue}>
              {messageQueueStatus.totalQueues}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>總消息數</Text>
            <Text style={styles.statusValue}>
              {messageQueueStatus.totalMessages}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>已處理消息</Text>
            <Text style={[styles.statusValue, { color: '#4CAF50' }]}>
              {messageQueueStatus.processedMessages}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>失敗消息</Text>
            <Text style={[styles.statusValue, { color: '#F44336' }]}>
              {messageQueueStatus.failedMessages}
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>死信消息</Text>
            <Text style={[styles.statusValue, { color: '#9C27B0' }]}>
              {messageQueueStatus.deadLetterMessages}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderServiceMetrics = () => {
    if (!serviceMetrics || !selectedService) return null;

    const service = services.find((s) => s.serviceId === selectedService);
    if (!service) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{service.serviceName} 指標</Text>

        <View style={styles.metricsContainer}>
          <View style={styles.metricChart}>
            <Text style={styles.chartTitle}>CPU 使用率</Text>
            <LineChart
              data={{
                labels: serviceMetrics.timestamps.map((t: string) =>
                  new Date(t).toLocaleTimeString('zh-TW', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                ),
                datasets: [
                  {
                    data: serviceMetrics.cpuUsage,
                  },
                ],
              }}
              width={screenWidth - 40}
              height={150}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          <View style={styles.metricChart}>
            <Text style={styles.chartTitle}>記憶體使用率</Text>
            <LineChart
              data={{
                labels: serviceMetrics.timestamps.map((t: string) =>
                  new Date(t).toLocaleTimeString('zh-TW', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                ),
                datasets: [
                  {
                    data: serviceMetrics.memoryUsage,
                  },
                ],
              }}
              width={screenWidth - 40}
              height={150}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          <View style={styles.metricChart}>
            <Text style={styles.chartTitle}>請求率</Text>
            <LineChart
              data={{
                labels: serviceMetrics.timestamps.map((t: string) =>
                  new Date(t).toLocaleTimeString('zh-TW', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                ),
                datasets: [
                  {
                    data: serviceMetrics.requestRate,
                  },
                ],
              }}
              width={screenWidth - 40}
              height={150}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>操作</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleRegisterService}
        >
          <Text style={styles.actionButtonText}>註冊測試服務</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSendMessage}
        >
          <Text style={styles.actionButtonText}>發送測試消息</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#4CAF50';
      case 'unhealthy':
        return '#F44336';
      case 'starting':
        return '#FF9800';
      case 'stopping':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>載入微服務數據...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>微服務儀表板</Text>
          <Text style={styles.subtitle}>監控和管理微服務架構</Text>
        </View>

        {renderServiceList()}
        {renderLoadBalancerStatus()}
        {renderMessageQueueStatus()}
        {renderServiceMetrics()}
        {renderActionButtons()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
  },
  serviceList: {
    gap: 10,
  },
  serviceItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedServiceItem: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  serviceVersion: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  serviceStatus: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  serviceHealth: {
    fontSize: 14,
    color: '#666666',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusItem: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  metricsContainer: {
    gap: 20,
  },
  metricChart: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MicroserviceDashboardScreen;
