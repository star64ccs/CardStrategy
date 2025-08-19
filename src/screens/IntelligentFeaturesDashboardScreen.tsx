import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import { intelligentFeaturesService } from '../services/intelligentFeaturesService';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';

const screenWidth = Dimensions.get('window').width;

interface IntelligentFeaturesDashboardScreenProps {
  navigation: any;
}

const IntelligentFeaturesDashboardScreen: React.FC<IntelligentFeaturesDashboardScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [automationDecisions, setAutomationDecisions] = useState<any[]>([]);
  const [maintenancePredictions, setMaintenancePredictions] = useState<any[]>([]);
  const [opsOperations, setOpsOperations] = useState<any[]>([]);
  const [healthAssessment, setHealthAssessment] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [automationStats, setAutomationStats] = useState<any>(null);
  const [maintenanceStats, setMaintenanceStats] = useState<any>(null);
  const [opsStats, setOpsStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAutomationDecisions(),
        loadMaintenancePredictions(),
        loadOpsOperations(),
        loadHealthAssessment(),
        loadRecommendations(),
        loadStats()
      ]);
    } catch (error) {
      errorHandler.handleError(error as Error, {
        service: 'IntelligentFeaturesDashboardScreen',
        method: 'loadData'
      });
      Alert.alert('錯誤', '載入數據失敗');
    } finally {
      setLoading(false);
    }
  };

  const loadAutomationDecisions = async () => {
    try {
      const decisions = await intelligentFeaturesService.getAutomationHistory('24h');
      setAutomationDecisions(decisions);
    } catch (error) {
      logger.error('載入自動化決策失敗', { error });
    }
  };

  const loadMaintenancePredictions = async () => {
    try {
      const predictions = await intelligentFeaturesService.getMaintenancePredictions();
      setMaintenancePredictions(predictions);
    } catch (error) {
      logger.error('載入維護預測失敗', { error });
    }
  };

  const loadOpsOperations = async () => {
    try {
      const operations = await intelligentFeaturesService.getIntelligentOpsOperations();
      setOpsOperations(operations);
    } catch (error) {
      logger.error('載入智能運維操作失敗', { error });
    }
  };

  const loadHealthAssessment = async () => {
    try {
      const assessment = await intelligentFeaturesService.getSystemHealthAssessment();
      setHealthAssessment(assessment);
    } catch (error) {
      logger.error('載入健康評估失敗', { error });
    }
  };

  const loadRecommendations = async () => {
    try {
      const recs = await intelligentFeaturesService.getIntelligentRecommendations();
      setRecommendations(recs);
    } catch (error) {
      logger.error('載入智能建議失敗', { error });
    }
  };

  const loadStats = async () => {
    try {
      const [autoStats, maintStats, opsStatsData] = await Promise.all([
        intelligentFeaturesService.getAutomationStats('24h'),
        intelligentFeaturesService.getMaintenanceStats('7d'),
        intelligentFeaturesService.getOpsStats('7d')
      ]);
      setAutomationStats(autoStats);
      setMaintenanceStats(maintStats);
      setOpsStats(opsStatsData);
    } catch (error) {
      logger.error('載入統計數據失敗', { error });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTriggerAutomation = async () => {
    try {
      const trigger = {
        type: 'performance_degradation',
        metrics: {
          cpuUsage: 85,
          memoryUsage: 78,
          responseTime: 1200
        },
        severity: 'high'
      };

      const decision = await intelligentFeaturesService.triggerAutomationDecision(trigger);
      Alert.alert('成功', '自動化決策已觸發');
      await loadAutomationDecisions();
    } catch (error) {
      errorHandler.handleError(error as Error, {
        service: 'IntelligentFeaturesDashboardScreen',
        method: 'handleTriggerAutomation'
      });
      Alert.alert('錯誤', '觸發自動化決策失敗');
    }
  };

  const handleGeneratePrediction = async () => {
    try {
      const prediction = await intelligentFeaturesService.generateMaintenancePrediction('Database Server', '7d');
      Alert.alert('成功', '維護預測已生成');
      await loadMaintenancePredictions();
    } catch (error) {
      errorHandler.handleError(error as Error, {
        service: 'IntelligentFeaturesDashboardScreen',
        method: 'handleGeneratePrediction'
      });
      Alert.alert('錯誤', '生成維護預測失敗');
    }
  };

  const handleTriggerDeployment = async () => {
    try {
      const deployment = {
        service: 'api-service',
        version: 'v2.1.0',
        environment: 'production',
        strategy: 'blue_green',
        autoRollback: true
      };

      const operation = await intelligentFeaturesService.triggerIntelligentDeployment(deployment);
      Alert.alert('成功', '智能部署已觸發');
      await loadOpsOperations();
    } catch (error) {
      errorHandler.handleError(error as Error, {
        service: 'IntelligentFeaturesDashboardScreen',
        method: 'handleTriggerDeployment'
      });
      Alert.alert('錯誤', '觸發智能部署失敗');
    }
  };

  const handleExecuteRecommendation = async (recommendationId: string) => {
    try {
      const result = await intelligentFeaturesService.executeRecommendation(recommendationId, ['action1']);
      Alert.alert('成功', '智能建議執行已開始');
      await loadRecommendations();
    } catch (error) {
      errorHandler.handleError(error as Error, {
        service: 'IntelligentFeaturesDashboardScreen',
        method: 'handleExecuteRecommendation'
      });
      Alert.alert('錯誤', '執行智能建議失敗');
    }
  };

  const renderAutomationDecisions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>自動化決策</Text>
      <View style={styles.decisionList}>
        {automationDecisions.slice(0, 5).map((decision) => (
          <View key={decision.decisionId} style={styles.decisionItem}>
            <View style={styles.decisionHeader}>
              <Text style={styles.decisionType}>{decision.type}</Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(decision.status) }
              ]} />
            </View>
            <Text style={styles.decisionAction}>{decision.action}</Text>
            <Text style={styles.decisionReason}>{decision.reason}</Text>
            <Text style={styles.decisionConfidence}>
              置信度: {(decision.confidence * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderMaintenancePredictions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>預測性維護</Text>
      <View style={styles.predictionList}>
        {maintenancePredictions.slice(0, 3).map((prediction) => (
          <View key={prediction.predictionId} style={styles.predictionItem}>
            <View style={styles.predictionHeader}>
              <Text style={styles.predictionComponent}>{prediction.component}</Text>
              <Text style={[
                styles.severityBadge,
                { backgroundColor: getSeverityColor(prediction.severity) }
              ]}>
                {prediction.severity}
              </Text>
            </View>
            <Text style={styles.predictionIssue}>{prediction.issueType}</Text>
            <Text style={styles.predictionProbability}>
              故障概率: {(prediction.probability * 100).toFixed(1)}%
            </Text>
            <Text style={styles.predictionTime}>
              預估故障時間: {new Date(prediction.estimatedFailureTime).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderOpsOperations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>智能運維操作</Text>
      <View style={styles.operationList}>
        {opsOperations.slice(0, 5).map((operation) => (
          <View key={operation.operationId} style={styles.operationItem}>
            <View style={styles.operationHeader}>
              <Text style={styles.operationType}>{operation.type}</Text>
              <View style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(operation.status) }
              ]} />
            </View>
            <Text style={styles.operationTarget}>{operation.target}</Text>
            <Text style={styles.operationAction}>{operation.action}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${operation.progress}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{operation.progress}%</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderHealthAssessment = () => {
    if (!healthAssessment) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>系統健康評估</Text>
        <View style={styles.healthOverview}>
          <View style={styles.healthScore}>
            <Text style={styles.healthScoreValue}>{healthAssessment.healthScore}</Text>
            <Text style={styles.healthScoreLabel}>健康分數</Text>
          </View>
          <View style={styles.healthStatus}>
            <Text style={[
              styles.healthStatusText,
              { color: getHealthColor(healthAssessment.overallHealth) }
            ]}>
              {healthAssessment.overallHealth.toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={styles.componentList}>
          {healthAssessment.components.map((component: any, index: number) => (
            <View key={index} style={styles.componentItem}>
              <Text style={styles.componentName}>{component.name}</Text>
              <Text style={styles.componentScore}>{component.score}</Text>
              <Text style={[
                styles.componentHealth,
                { color: getHealthColor(component.health) }
              ]}>
                {component.health}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderRecommendations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>智能建議</Text>
      <View style={styles.recommendationList}>
        {recommendations.slice(0, 3).map((recommendation) => (
          <View key={recommendation.recommendationId} style={styles.recommendationItem}>
            <View style={styles.recommendationHeader}>
              <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
              <Text style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(recommendation.priority) }
              ]}>
                {recommendation.priority}
              </Text>
            </View>
            <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
            <Text style={styles.recommendationImpact}>
              預估影響: {recommendation.estimatedImpact}
            </Text>
            <TouchableOpacity
              style={styles.executeButton}
              onPress={() => handleExecuteRecommendation(recommendation.recommendationId)}
            >
              <Text style={styles.executeButtonText}>執行建議</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderStats = () => {
    if (!automationStats || !maintenanceStats || !opsStats) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>統計概覽</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>自動化決策</Text>
            <Text style={styles.statValue}>{automationStats.totalDecisions}</Text>
            <Text style={styles.statSubtitle}>
              成功率: {((automationStats.successfulDecisions / automationStats.totalDecisions) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>維護預測</Text>
            <Text style={styles.statValue}>{maintenanceStats.totalPredictions}</Text>
            <Text style={styles.statSubtitle}>
              準確率: {maintenanceStats.averagePredictionAccuracy.toFixed(1)}%
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>運維操作</Text>
            <Text style={styles.statValue}>{opsStats.totalOperations}</Text>
            <Text style={styles.statSubtitle}>
              成功率: {((opsStats.successfulOperations / opsStats.totalOperations) * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>操作</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={handleTriggerAutomation}>
          <Text style={styles.actionButtonText}>觸發自動化決策</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleGeneratePrediction}>
          <Text style={styles.actionButtonText}>生成維護預測</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleTriggerDeployment}>
          <Text style={styles.actionButtonText}>觸發智能部署</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return '#4CAF50';
      case 'running':
      case 'executing':
        return '#FF9800';
      case 'failed':
        return '#F44336';
      case 'pending':
        return '#9E9E9E';
      default:
        return '#9E9E9E';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#F44336';
      case 'high':
        return '#FF9800';
      case 'medium':
        return '#FFC107';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent':
        return '#4CAF50';
      case 'good':
        return '#8BC34A';
      case 'fair':
        return '#FFC107';
      case 'poor':
        return '#FF9800';
      case 'critical':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return '#F44336';
      case 'medium':
        return '#FF9800';
      case 'low':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>載入智能化數據...</Text>
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
          <Text style={styles.title}>智能化特性儀表板</Text>
          <Text style={styles.subtitle}>自動化決策、預測性維護和智能運維</Text>
        </View>

        {renderHealthAssessment()}
        {renderStats()}
        {renderAutomationDecisions()}
        {renderMaintenancePredictions()}
        {renderOpsOperations()}
        {renderRecommendations()}
        {renderActionButtons()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollView: {
    flex: 1
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#666666'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666'
  },
  section: {
    margin: 15,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15
  },
  healthOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  healthScore: {
    alignItems: 'center'
  },
  healthScoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  healthScoreLabel: {
    fontSize: 14,
    color: '#666666'
  },
  healthStatus: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0'
  },
  healthStatusText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  componentList: {
    gap: 10
  },
  componentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8
  },
  componentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333'
  },
  componentScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  componentHealth: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10
  },
  statCard: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center'
  },
  statTitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666666'
  },
  decisionList: {
    gap: 10
  },
  decisionItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF'
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  decisionType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333'
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  decisionAction: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 5
  },
  decisionReason: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 5
  },
  decisionConfidence: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold'
  },
  predictionList: {
    gap: 10
  },
  predictionItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800'
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  predictionComponent: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333'
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  predictionIssue: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 5
  },
  predictionProbability: {
    fontSize: 12,
    color: '#F44336',
    fontWeight: 'bold',
    marginBottom: 5
  },
  predictionTime: {
    fontSize: 12,
    color: '#666666'
  },
  operationList: {
    gap: 10
  },
  operationItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50'
  },
  operationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  operationType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333'
  },
  operationTarget: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 5
  },
  operationAction: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 10
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginBottom: 5
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right'
  },
  recommendationList: {
    gap: 10
  },
  recommendationItem: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0'
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5
  },
  recommendationImpact: {
    fontSize: 12,
    color: '#007AFF',
    marginBottom: 10
  },
  executeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  executeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold'
  },
  actionButtons: {
    gap: 10
  },
  actionButton: {
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center'
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

export default IntelligentFeaturesDashboardScreen;
