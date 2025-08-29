import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { usePredictiveAnalysis } from '../hooks/usePredictiveAnalysis';
import type {
  PredictionModelConfig,
  PredictionModelType,
  PredictionTarget,
} from '../types/predictiveAnalysis';

/**
 * 預測分析示例組件
 * 展示預測分析功能的完整使用流程
 */
export const PredictiveAnalysisExample: React.FC = () => {
  const {
    // 狀態
    models,
    predictions,
    reports,
    insights,
    recommendations,
    alerts,
    config,
    realTimeMetrics,
    loading,
    error,
    isInitialized,

    // 計算屬性
    activeModels,
    readyModels,
    trainingModels,
    errorModels,
    totalPredictions,
    averageAccuracy,
    activeAlerts,
    criticalAlerts,
    warningAlerts,

    // 操作方法
    initialize,
    getAnalysis,
    createModel,
    generatePrediction,
    generateReport,
    exportData,
    createAlert,
    updateAlert,
    deleteAlert,
    getConfig,
    updateConfig,
    getReports,
    getInsights,
    getRecommendations,
    getAlerts,
    getRealTimeMetrics,
    clearError,
    clearAllErrors,
    reset,
  } = usePredictiveAnalysis();

  // 本地狀態
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'models' | 'predictions' | 'reports' | 'alerts' | 'config'
  >('dashboard');
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelDescription, setNewModelDescription] = useState('');
  const [selectedModelType, setSelectedModelType] =
    useState<PredictionModelType>('random_forest');
  const [selectedTarget, setSelectedTarget] =
    useState<PredictionTarget>('price_movement');

  // 自動加載數據
  useEffect(() => {
    if (isInitialized) {
      getAnalysis();
      getReports();
      getInsights();
      getRecommendations();
      getAlerts();
      getRealTimeMetrics();
    }
  }, [
    isInitialized,
    getAnalysis,
    getReports,
    getInsights,
    getRecommendations,
    getAlerts,
    getRealTimeMetrics,
  ]);

  // 處理創建模型
  const _handleCreateModel = async () => {
    if (!newModelName.trim() || !newModelDescription.trim()) {
      Alert.alert('錯誤', '請填寫模型名稱和描述');
      return;
    }

    try {
      const modelConfig: PredictionModelConfig = {
        modelType: selectedModelType,
        target: selectedTarget,
        features: ['feature1', 'feature2', 'feature3'],
        hyperparameters: { n_estimators: 100, max_depth: 10 },
        trainingConfig: { testSize: 0.2, validationSize: 0.1 },
        evaluationMetrics: ['accuracy', 'precision', 'recall'],
        updateFrequency: 'daily',
        retrainThreshold: 0.8,
      };

      await createModel(newModelName, newModelDescription, modelConfig);
      setNewModelName('');
      setNewModelDescription('');
      Alert.alert('成功', '模型創建成功，正在訓練中...');
    } catch (error) {
      Alert.alert('錯誤', `創建模型失敗: ${error}`);
    }
  };

  // 處理生成預測
  const _handleGeneratePrediction = async () => {
    if (!selectedModelId) {
      Alert.alert('錯誤', '請選擇一個模型');
      return;
    }

    try {
      const _inputFeatures = {
        feature1: Math.random() * 100,
        feature2: Math.random() * 50,
        feature3: Math.random() * 10,
      };

      await generatePrediction(selectedModelId, inputFeatures);
      Alert.alert('成功', '預測生成成功');
    } catch (error) {
      Alert.alert('錯誤', `生成預測失敗: ${error}`);
    }
  };

  // 處理生成報告
  const _handleGenerateReport = async () => {
    if (!selectedModelId) {
      Alert.alert('錯誤', '請選擇一個模型');
      return;
    }

    try {
      const _dateRange = {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
        end: new Date(),
      };

      await generateReport(
        selectedModelId,
        '週度分析報告',
        '過去一週的預測分析報告',
        dateRange
      );
      Alert.alert('成功', '報告生成成功');
    } catch (error) {
      Alert.alert('錯誤', `生成報告失敗: ${error}`);
    }
  };

  // 處理創建警報
  const _handleCreateAlert = async () => {
    if (!selectedModelId) {
      Alert.alert('錯誤', '請選擇一個模型');
      return;
    }

    try {
      await createAlert(
        selectedModelId,
        'accuracy_drop',
        'warning',
        '模型準確率下降警報',
        '模型準確率低於閾值',
        0.8,
        0.75
      );
      Alert.alert('成功', '警報創建成功');
    } catch (error) {
      Alert.alert('錯誤', `創建警報失敗: ${error}`);
    }
  };

  // 處理導出數據
  const _handleExportData = async (format: 'json' | 'csv' | 'excel' | 'pdf') => {
    try {
      const _result = await exportData({
        format,
        includeModels: true,
        includePredictions: true,
        includeReports: true,
      });
      Alert.alert('成功', `${format.toUpperCase()} 數據導出成功`);
    } catch (error) {
      Alert.alert('錯誤', `導出數據失敗: ${error}`);
    }
  };

  // 渲染儀表板
  const _renderDashboard = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📊 預測分析儀表板</Text>

      {realTimeMetrics &&
        typeof realTimeMetrics === 'object' &&
        'activeModels' in realTimeMetrics && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {(realTimeMetrics as any).activeModels || 0}
              </Text>
              <Text style={styles.metricLabel}>活躍模型</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {(realTimeMetrics as any).totalPredictions || 0}
              </Text>
              <Text style={styles.metricLabel}>總預測數</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {(
                  ((realTimeMetrics as any).averageAccuracy || 0) * 100
                ).toFixed(1)}
                %
              </Text>
              <Text style={styles.metricLabel}>平均準確率</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {(realTimeMetrics as any).alertsCount || 0}
              </Text>
              <Text style={styles.metricLabel}>警報數量</Text>
            </View>
          </View>
        )}

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>模型狀態摘要</Text>
        <Text>• 活躍模型: {String(activeModels?.length || 0)}</Text>
        <Text>• 就緒模型: {readyModels?.length || 0}</Text>
        <Text>• 訓練中模型: {trainingModels?.length || 0}</Text>
        <Text>• 錯誤模型: {errorModels?.length || 0}</Text>
        <Text>• 總預測數: {totalPredictions || 0}</Text>
        <Text>• 平均準確率: {((averageAccuracy || 0) * 100).toFixed(1)}%</Text>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>警報摘要</Text>
        <Text>• 活躍警報: {(activeAlerts as any[])?.length || 0}</Text>
        <Text>• 嚴重警報: {(criticalAlerts as any[])?.length || 0}</Text>
        <Text>• 警告警報: {(warningAlerts as any[])?.length || 0}</Text>
      </View>
    </View>
  );

  // 渲染模型管理
  const _renderModels = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🤖 模型管理</Text>

      {/* 創建新模型 */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>創建新模型</Text>
        <TextInput
          style={styles.input}
          placeholder='模型名稱'
          value={newModelName}
          onChangeText={setNewModelName}
        />
        <TextInput
          style={styles.input}
          placeholder='模型描述'
          value={newModelDescription}
          onChangeText={setNewModelDescription}
          multiline
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateModel}
          disabled={(loading as any)?.createModel}
        >
          <Text style={styles.buttonText}>
            {(loading as any)?.createModel ? '創建中...' : '創建模型'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 模型列表 */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>模型列表</Text>
        {(models as any[])?.map((model: unknown) => (
          <View key={model.id} style={styles.modelCard}>
            <Text style={styles.modelName}>{model.name}</Text>
            <Text style={styles.modelDescription}>{model.description}</Text>
            <Text style={styles.modelStatus}>狀態: {model.status}</Text>
            <Text style={styles.modelAccuracy}>
              準確率: {(model.accuracy * 100).toFixed(1)}%
            </Text>
            <Text style={styles.modelPredictions}>
              預測數: {model.totalPredictions}
            </Text>
            <TouchableOpacity
              style={[
                styles.selectButton,
                selectedModelId === model.id && styles.selectedButton,
              ]}
              onPress={() => setSelectedModelId(model.id)}
            >
              <Text style={styles.selectButtonText}>
                {selectedModelId === model.id ? '已選擇' : '選擇'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  // 渲染預測功能
  const _renderPredictions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🔮 預測功能</Text>

      {/* 生成預測 */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>生成預測</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGeneratePrediction}
          disabled={!selectedModelId || (loading as any)?.generatePrediction}
        >
          <Text style={styles.buttonText}>
            {(loading as any)?.generatePrediction ? '生成中...' : '生成預測'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 預測列表 */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>預測結果</Text>
        {(predictions as any[])?.slice(0, 5).map((prediction: unknown) => (
          <View key={prediction.id} style={styles.predictionCard}>
            <Text style={styles.predictionModel}>
              模型: {prediction.modelId}
            </Text>
            <Text style={styles.predictionTarget}>
              目標: {prediction.target}
            </Text>
            <Text style={styles.predictionAccuracy}>
              準確率: {(prediction.accuracy * 100).toFixed(1)}%
            </Text>
            <Text style={styles.predictionTime}>
              時間: {prediction.timestamp.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // 渲染報告
  const _renderReports = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>📋 報告管理</Text>

      {/* 生成報告 */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>生成報告</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleGenerateReport}
          disabled={!selectedModelId || (loading as any)?.generateReport}
        >
          <Text style={styles.buttonText}>
            {(loading as any)?.generateReport ? '生成中...' : '生成報告'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 報告列表 */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>報告列表</Text>
        {(reports as any[])?.slice(0, 5).map((report: unknown) => (
          <View key={report.id} style={styles.reportCard}>
            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportDescription}>{report.description}</Text>
            <Text style={styles.reportMetrics}>
              準確率: {(report.performanceMetrics.accuracy * 100).toFixed(1)}%
            </Text>
            <Text style={styles.reportTime}>
              創建時間: {report.createdAt.toLocaleString()}
            </Text>
          </View>
        ))}
      </View>

      {/* 洞察和建議 */}
      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>洞察</Text>
        {(insights as any[])?.slice(0, 3).map((insight: unknown) => (
          <View key={insight.id} style={styles.insightCard}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </View>
        ))}
      </View>

      <View style={styles.insightsContainer}>
        <Text style={styles.insightsTitle}>建議</Text>
        {(recommendations as any[])?.slice(0, 3).map((recommendation: unknown) => (
          <View key={recommendation.id} style={styles.recommendationCard}>
            <Text style={styles.recommendationTitle}>
              {recommendation.title}
            </Text>
            <Text style={styles.recommendationDescription}>
              {recommendation.description}
            </Text>
            <Text style={styles.recommendationPriority}>
              優先級: {recommendation.priority}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  // 渲染警報
  const _renderAlerts = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>🚨 警報管理</Text>

      {/* 創建警報 */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>創建警報</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleCreateAlert}
          disabled={!selectedModelId || (loading as any)?.createAlert}
        >
          <Text style={styles.buttonText}>
            {(loading as any)?.createAlert ? '創建中...' : '創建警報'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 警報列表 */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>警報列表</Text>
        {(alerts as any[])?.map((alert: unknown) => (
          <View key={alert.id} style={styles.alertCard}>
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <Text style={styles.alertSeverity}>嚴重程度: {alert.severity}</Text>
            <Text style={styles.alertTime}>
              創建時間: {alert.createdAt.toLocaleString()}
            </Text>
            <View style={styles.alertActions}>
              <TouchableOpacity
                style={styles.alertButton}
                onPress={() => updateAlert(alert.id, { isActive: false })}
              >
                <Text style={styles.alertButtonText}>解決</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.alertButton, styles.deleteButton]}
                onPress={() => deleteAlert(alert.id)}
              >
                <Text style={styles.alertButtonText}>刪除</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // 渲染配置
  const _renderConfig = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚙️ 配置管理</Text>

      {config && typeof config === 'object' && (
        <View style={styles.configContainer}>
          <Text style={styles.configTitle}>當前配置</Text>
          <Text>
            • 自動重訓練: {String((config as any).autoRetrain ? '是' : '否')}
          </Text>
          <Text>
            • 重訓練閾值: {String((config as any).retrainThreshold || 'N/A')}
          </Text>
          <Text>
            • 最大模型數: {String((config as any).maxModels || 'N/A')}
          </Text>
          <Text>
            • 默認模型類型: {String((config as any).defaultModelType || 'N/A')}
          </Text>
          <Text>
            • 準確率閾值:{' '}
            {String((config as any).alertSettings?.accuracyThreshold || 'N/A')}
          </Text>
        </View>
      )}

      <View style={styles.exportContainer}>
        <Text style={styles.exportTitle}>數據導出</Text>
        <View style={styles.exportButtons}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExportData('json')}
          >
            <Text style={styles.exportButtonText}>JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExportData('csv')}
          >
            <Text style={styles.exportButtonText}>CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExportData('excel')}
          >
            <Text style={styles.exportButtonText}>Excel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => handleExportData('pdf')}
          >
            <Text style={styles.exportButtonText}>PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>
          {(loading as any)?.initialize
            ? '初始化預測分析服務中...'
            : '正在加載...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 標題 */}
      <Text style={styles.title}>🔮 預測分析系統</Text>

      {/* 標籤欄 */}
      <View style={styles.tabBar}>
        {[
          { key: 'dashboard', label: '儀表板', icon: '📊' },
          { key: 'models', label: '模型', icon: '🤖' },
          { key: 'predictions', label: '預測', icon: '🔮' },
          { key: 'reports', label: '報告', icon: '📋' },
          { key: 'alerts', label: '警報', icon: '🚨' },
          { key: 'config', label: '配置', icon: '⚙️' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {String(tab.icon)} {String(tab.label)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 內容區域 */}
      <ScrollView style={styles.content}>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'models' && renderModels()}
        {activeTab === 'predictions' && renderPredictions()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'alerts' && renderAlerts()}
        {activeTab === 'config' && renderConfig()}
      </ScrollView>

      {/* 錯誤顯示 */}
      {error &&
        typeof error === 'object' &&
        Object.values(error as any).some((err: unknown) => err) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>錯誤信息</Text>
            {
              Object.entries(error as any).map(
                ([key, err]) =>
                  err && (
                    <Text key={key} style={styles.errorText}>
                      {String(err)}
                    </Text>
                  )
              ) as any
            }
            <TouchableOpacity
              style={styles.errorButton}
              onPress={clearAllErrors}
            >
              <Text style={styles.errorButtonText}>清除錯誤</Text>
            </TouchableOpacity>
          </View>
        )}
    </View>
  );
};

// 樣式
const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  summaryContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modelCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  modelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modelDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  modelStatus: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 5,
  },
  modelAccuracy: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 2,
  },
  modelPredictions: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  selectButton: {
    backgroundColor: '#6c757d',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  selectedButton: {
    backgroundColor: '#28a745',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  predictionCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  predictionModel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  predictionTarget: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  predictionAccuracy: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 2,
  },
  predictionTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reportCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reportDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  reportMetrics: {
    fontSize: 12,
    color: '#28a745',
    marginTop: 2,
  },
  reportTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  insightsContainer: {
    marginBottom: 15,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  insightCard: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  insightDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recommendationCard: {
    backgroundColor: '#f3e5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#7b1fa2',
  },
  recommendationDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  recommendationPriority: {
    fontSize: 12,
    color: '#e91e63',
    marginTop: 2,
  },
  alertCard: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
  },
  alertMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  alertSeverity: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  alertActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  alertButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  alertButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  configContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  exportContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 15,
    margin: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#721c24',
    marginBottom: 5,
  },
  errorButton: {
    backgroundColor: '#dc3545',
    padding: 8,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  errorButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
