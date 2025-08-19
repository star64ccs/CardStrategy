import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

import { aiAccuracyEnhancementService } from '../services/aiAccuracyEnhancementService';
import { logger } from '../utils/logger';
import { errorHandler } from '../utils/errorHandler';

const screenWidth = Dimensions.get('window').width;

interface AIAccuracyEnhancementScreenProps {
  navigation: any;
}

const AIAccuracyEnhancementScreen: React.FC<AIAccuracyEnhancementScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trainingDataStats, setTrainingDataStats] = useState<any>(null);
  const [modelPerformance, setModelPerformance] = useState<any>(null);
  const [accuracyProgress, setAccuracyProgress] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [monitoringData, setMonitoringData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTrainingDataStats(),
        loadModelPerformance(),
        loadAccuracyProgress(),
        loadSuggestions(),
        loadMonitoringData()
      ]);
    } catch (error) {
      errorHandler.handleError(error as Error, {
        screen: 'AIAccuracyEnhancementScreen',
        method: 'loadData'
      });
      Alert.alert('錯誤', '載入數據失敗，請稍後重試');
    } finally {
      setLoading(false);
    }
  };

  const loadTrainingDataStats = async () => {
    try {
      const stats = await aiAccuracyEnhancementService.getTrainingDataStats();
      setTrainingDataStats(stats);
    } catch (error) {
      logger.error('載入訓練數據統計失敗:', error);
    }
  };

  const loadModelPerformance = async () => {
    try {
      const performance = await aiAccuracyEnhancementService.getModelPerformanceMetrics();
      setModelPerformance(performance);
    } catch (error) {
      logger.error('載入模型性能失敗:', error);
    }
  };

  const loadAccuracyProgress = async () => {
    try {
      const progress = await aiAccuracyEnhancementService.getAccuracyImprovementProgress();
      setAccuracyProgress(progress);
    } catch (error) {
      logger.error('載入準確率進度失敗:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const suggestionsData = await aiAccuracyEnhancementService.getAccuracyImprovementSuggestions();
      setSuggestions(suggestionsData);
    } catch (error) {
      logger.error('載入建議失敗:', error);
    }
  };

  const loadMonitoringData = async () => {
    try {
      const monitoring = await aiAccuracyEnhancementService.monitorAccuracyChange('30d');
      setMonitoringData(monitoring);
    } catch (error) {
      logger.error('載入監控數據失敗:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCollectTrainingData = async () => {
    try {
      Alert.alert(
        '收集訓練數據',
        '確定要開始收集訓練數據嗎？這可能需要一些時間。',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '確定',
            onPress: async () => {
              setLoading(true);
              try {
                const result = await aiAccuracyEnhancementService.collectTrainingData();
                Alert.alert('成功', `收集了 ${result.dataCollected} 條訓練數據`);
                await loadTrainingDataStats();
              } catch (error) {
                Alert.alert('錯誤', '收集訓練數據失敗');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      errorHandler.handleError(error as Error, {
        screen: 'AIAccuracyEnhancementScreen',
        method: 'handleCollectTrainingData'
      });
    }
  };

  const handleOptimizeModel = async () => {
    try {
      Alert.alert(
        '模型優化',
        '確定要開始模型優化嗎？這可能需要較長時間。',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '確定',
            onPress: async () => {
              setLoading(true);
              try {
                const result = await aiAccuracyEnhancementService.optimizeModel();
                Alert.alert('成功', `模型優化完成，準確率提升 ${(result.improvement * 100).toFixed(2)}%`);
                await loadModelPerformance();
              } catch (error) {
                Alert.alert('錯誤', '模型優化失敗');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      errorHandler.handleError(error as Error, {
        screen: 'AIAccuracyEnhancementScreen',
        method: 'handleOptimizeModel'
      });
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const result = await aiAccuracyEnhancementService.generateAccuracyReport({
        includeTrainingData: true,
        includeModelPerformance: true,
        includeUserFeedback: true,
        includeSuggestions: true,
        format: 'pdf'
      });
      Alert.alert('成功', '準確率報告已生成');
    } catch (error) {
      Alert.alert('錯誤', '生成報告失敗');
    } finally {
      setLoading(false);
    }
  };

  const renderAccuracyProgress = () => {
    if (!accuracyProgress) return null;

    const progressPercentage = accuracyProgress.progress;
    const currentAccuracy = (accuracyProgress.currentAccuracy * 100).toFixed(1);
    const targetAccuracy = (accuracyProgress.targetAccuracy * 100).toFixed(1);

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>準確率提升進度</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {progressPercentage.toFixed(1)}% 完成
          </Text>
        </View>
        <View style={styles.accuracyInfo}>
          <Text style={styles.accuracyText}>
            當前準確率: {currentAccuracy}%
          </Text>
          <Text style={styles.accuracyText}>
            目標準確率: {targetAccuracy}%
          </Text>
        </View>
        <Text style={styles.estimatedCompletion}>
          預計完成時間: {new Date(accuracyProgress.estimatedCompletion).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  const renderModelPerformance = () => {
    if (!modelPerformance) return null;

    const chartData = {
      labels: modelPerformance.performanceHistory.slice(-7).map((item: any) => 
        new Date(item.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        data: modelPerformance.performanceHistory.slice(-7).map((item: any) => 
          parseFloat((item.accuracy * 100).toFixed(1))
        )
      }]
    };

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>模型性能趨勢</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 1,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          bezier
          style={styles.chart}
        />
        <View style={styles.performanceStats}>
          <Text style={styles.statText}>
            當前準確率: {(modelPerformance.currentAccuracy * 100).toFixed(1)}%
          </Text>
          <Text style={styles.statText}>
            目標準確率: {(modelPerformance.targetAccuracy * 100).toFixed(1)}%
          </Text>
          <Text style={styles.statText}>
            需要提升: {(modelPerformance.improvementNeeded * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderTrainingDataStats = () => {
    if (!trainingDataStats) return null;

    const pieData = Object.entries(trainingDataStats.dataDistribution.cardTypes).map(([key, value]) => ({
      name: key,
      population: value as number,
      color: getRandomColor(),
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>訓練數據統計</Text>
        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
        <View style={styles.dataStats}>
          <Text style={styles.statText}>
            總數據點: {trainingDataStats.totalDataPoints.toLocaleString()}
          </Text>
          <Text style={styles.statText}>
            高質量數據: {trainingDataStats.highQualityData.toLocaleString()}
          </Text>
          <Text style={styles.statText}>
            數據質量分數: {(trainingDataStats.dataQualityMetrics.overallScore * 100).toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  const renderSuggestions = () => {
    if (!suggestions.length) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>準確率提升建議</Text>
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <View key={index} style={styles.suggestionItem}>
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <View style={[
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(suggestion.priority) }
              ]}>
                <Text style={styles.priorityText}>{suggestion.priority}</Text>
              </View>
            </View>
            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
            <Text style={styles.suggestionImpact}>
              預期提升: {(suggestion.expectedImpact * 100).toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderActionButtons = () => {
    return (
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleCollectTrainingData}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>收集訓練數據</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleOptimizeModel}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>優化模型</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={handleGenerateReport}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>生成報告</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getRandomColor = () => {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFBB33';
      case 'low': return '#00C851';
      default: return '#33B5E5';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>載入中...</Text>
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
          <Text style={styles.title}>AI 準確率提升</Text>
          <Text style={styles.subtitle}>監控和優化 AI 識別準確率</Text>
        </View>

        {renderAccuracyProgress()}
        {renderModelPerformance()}
        {renderTrainingDataStats()}
        {renderSuggestions()}
        {renderActionButtons()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  scrollView: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD'
  },
  card: {
    backgroundColor: '#FFFFFF',
    margin: 10,
    padding: 15,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  progressContainer: {
    marginBottom: 15
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50'
  },
  progressText: {
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
    color: '#666'
  },
  accuracyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10
  },
  accuracyText: {
    fontSize: 14,
    color: '#333'
  },
  estimatedCompletion: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic'
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  performanceStats: {
    marginTop: 10
  },
  statText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5
  },
  dataStats: {
    marginTop: 10
  },
  suggestionItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 8
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  priorityText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold'
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5
  },
  suggestionImpact: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFFFFF',
    margin: 10,
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
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center'
  }
});

export default AIAccuracyEnhancementScreen;
