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
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Input, Select, Progress, Badge } from '@/components';
import { fakeCardTrainingService } from '@/services/fakeCardTrainingService';
import { theme } from '@/theme';
import { logger } from '@/utils/logger';

// 訓練模型配置類型
interface TrainingModelConfig {
  modelType: 'authenticity' | 'grading' | 'hybrid';
  algorithm: 'cnn' | 'transformer' | 'ensemble';
  trainingEpochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number;
  dataAugmentation: boolean;
  useTransferLearning: boolean;
  pretrainedModel?: string;
}

// 訓練結果類型
interface TrainingResult {
  modelId: string;
  modelVersion: string;
  trainingMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    loss: number;
    validationAccuracy: number;
  };
  trainingTime: number;
  dataSize: {
    totalSamples: number;
    fakeSamples: number;
    realSamples: number;
    validationSamples: number;
  };
  performance: {
    averageInferenceTime: number;
    memoryUsage: number;
    modelSize: number;
  };
  deploymentStatus: 'training' | 'ready' | 'deployed' | 'failed';
}

const FakeCardTrainingScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  // 狀態管理
  const [isLoading, setIsLoading] = useState(false);
  const [trainingData, setTrainingData] = useState<any[]>([]);
  const [models, setModels] = useState<TrainingResult[]>([]);
  const [trainingStats, setTrainingStats] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<TrainingResult | null>(null);
  const [activeTraining, setActiveTraining] = useState<string | null>(null);

  // 訓練配置狀態
  const [trainingConfig, setTrainingConfig] = useState<TrainingModelConfig>({
    modelType: 'authenticity',
    algorithm: 'cnn',
    trainingEpochs: 100,
    batchSize: 32,
    learningRate: 0.001,
    validationSplit: 0.2,
    dataAugmentation: true,
    useTransferLearning: true,
  });

  // 載入訓練數據
  const loadTrainingData = async () => {
    try {
      setIsLoading(true);
      const response = await fakeCardTrainingService.getTrainingData();
      if (response.success) {
        setTrainingData(response.data || []);
      }
    } catch (error: any) {
      logger.error('載入訓練數據失敗:', error);
      Alert.alert('錯誤', '載入訓練數據失敗: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 載入模型列表
  const loadModels = async () => {
    try {
      setIsLoading(true);
      const response = await fakeCardTrainingService.getModels();
      if (response.success) {
        setModels(response.data || []);
      }
    } catch (error: any) {
      logger.error('載入模型列表失敗:', error);
      Alert.alert('錯誤', '載入模型列表失敗: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 載入訓練統計
  const loadTrainingStats = async () => {
    try {
      const response = await fakeCardTrainingService.getTrainingStats();
      if (response.success) {
        setTrainingStats(response.data);
      }
    } catch (error: any) {
      logger.error('載入訓練統計失敗:', error);
    }
  };

  // 開始訓練
  const startTraining = async () => {
    try {
      setIsLoading(true);
      const response = await fakeCardTrainingService.startTraining(trainingConfig);
      if (response.success) {
        setActiveTraining(response.data.trainingId);
        Alert.alert('成功', '模型訓練已開始');
        loadModels(); // 重新載入模型列表
      }
    } catch (error: any) {
      logger.error('開始訓練失敗:', error);
      Alert.alert('錯誤', '開始訓練失敗: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 評估模型
  const evaluateModel = async (modelId: string) => {
    try {
      setIsLoading(true);
      const response = await fakeCardTrainingService.evaluateModel(modelId);
      if (response.success) {
        Alert.alert('評估完成', `模型準確率: ${(response.data.evaluationMetrics.overallAccuracy * 100).toFixed(2)}%`);
      }
    } catch (error: any) {
      logger.error('模型評估失敗:', error);
      Alert.alert('錯誤', '模型評估失敗: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 部署模型
  const deployModel = async (modelId: string) => {
    try {
      setIsLoading(true);
      const response = await fakeCardTrainingService.deployModel(modelId);
      if (response.success) {
        Alert.alert('成功', '模型部署成功');
        loadModels(); // 重新載入模型列表
      }
    } catch (error: any) {
      logger.error('模型部署失敗:', error);
      Alert.alert('錯誤', '模型部署失敗: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    if (isAuthenticated) {
      loadTrainingData();
      loadModels();
      loadTrainingStats();
    }
  }, [isAuthenticated]);

  // 定期更新訓練進度
  useEffect(() => {
    if (activeTraining) {
      const interval = setInterval(async () => {
        try {
          const response = await fakeCardTrainingService.getTrainingProgress(activeTraining);
          if (response.success && response.data.deploymentStatus === 'ready') {
            setActiveTraining(null);
            loadModels();
            Alert.alert('訓練完成', '模型訓練已完成');
          }
        } catch (error) {
          logger.error('獲取訓練進度失敗:', error);
        }
      }, 5000); // 每5秒檢查一次

      return () => clearInterval(interval);
    }
  }, [activeTraining]);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>請先登入以使用此功能</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>假卡AI訓練管理</Text>
        <Text style={styles.subtitle}>管理AI模型的訓練、評估和部署</Text>
      </View>

      {/* 訓練統計 */}
      {trainingStats && (
        <Card style={styles.statsCard}>
          <Text style={styles.cardTitle}>訓練統計</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trainingStats.totalModels}</Text>
              <Text style={styles.statLabel}>總模型數</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trainingStats.activeTraining}</Text>
              <Text style={styles.statLabel}>訓練中</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{trainingStats.deployedModels}</Text>
              <Text style={styles.statLabel}>已部署</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(trainingStats.averageAccuracy * 100).toFixed(1)}%</Text>
              <Text style={styles.statLabel}>平均準確率</Text>
            </View>
          </View>
        </Card>
      )}

      {/* 訓練配置 */}
      <Card style={styles.configCard}>
        <Text style={styles.cardTitle}>訓練配置</Text>
        <View style={styles.configForm}>
          <View style={styles.formRow}>
            <Text style={styles.label}>模型類型:</Text>
            <Select
              value={trainingConfig.modelType}
              onValueChange={(value) => setTrainingConfig({ ...trainingConfig, modelType: value as any })}
              items={[
                { label: '真偽判斷', value: 'authenticity' },
                { label: '評級分析', value: 'grading' },
                { label: '混合模型', value: 'hybrid' },
              ]}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>算法:</Text>
            <Select
              value={trainingConfig.algorithm}
              onValueChange={(value) => setTrainingConfig({ ...trainingConfig, algorithm: value as any })}
              items={[
                { label: 'CNN', value: 'cnn' },
                { label: 'Transformer', value: 'transformer' },
                { label: 'Ensemble', value: 'ensemble' },
              ]}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>訓練輪數:</Text>
            <Input
              value={trainingConfig.trainingEpochs.toString()}
              onChangeText={(value) => setTrainingConfig({ ...trainingConfig, trainingEpochs: parseInt(value) || 100 })}
              keyboardType="numeric"
              style={styles.numberInput}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>批次大小:</Text>
            <Input
              value={trainingConfig.batchSize.toString()}
              onChangeText={(value) => setTrainingConfig({ ...trainingConfig, batchSize: parseInt(value) || 32 })}
              keyboardType="numeric"
              style={styles.numberInput}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>學習率:</Text>
            <Input
              value={trainingConfig.learningRate.toString()}
              onChangeText={(value) => setTrainingConfig({ ...trainingConfig, learningRate: parseFloat(value) || 0.001 })}
              keyboardType="numeric"
              style={styles.numberInput}
            />
          </View>

          <View style={styles.formRow}>
            <Text style={styles.label}>驗證分割:</Text>
            <Input
              value={trainingConfig.validationSplit.toString()}
              onChangeText={(value) => setTrainingConfig({ ...trainingConfig, validationSplit: parseFloat(value) || 0.2 })}
              keyboardType="numeric"
              style={styles.numberInput}
            />
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setTrainingConfig({ ...trainingConfig, dataAugmentation: !trainingConfig.dataAugmentation })}
            >
              <View style={[styles.checkboxInner, trainingConfig.dataAugmentation && styles.checkboxChecked]} />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>數據增強</Text>
          </View>

          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setTrainingConfig({ ...trainingConfig, useTransferLearning: !trainingConfig.useTransferLearning })}
            >
              <View style={[styles.checkboxInner, trainingConfig.useTransferLearning && styles.checkboxChecked]} />
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>遷移學習</Text>
          </View>
        </View>

        <Button
          title={isLoading ? '開始訓練中...' : '開始訓練'}
          onPress={startTraining}
          disabled={isLoading || activeTraining !== null}
          style={styles.startButton}
        />
      </Card>

      {/* 模型列表 */}
      <Card style={styles.modelsCard}>
        <Text style={styles.cardTitle}>模型列表</Text>
        {models.length === 0 ? (
          <Text style={styles.emptyText}>暫無訓練模型</Text>
        ) : (
          models.map((model) => (
            <View key={model.modelId} style={styles.modelItem}>
              <View style={styles.modelHeader}>
                <Text style={styles.modelId}>{model.modelId}</Text>
                <Badge
                  text={model.deploymentStatus}
                  color={
                    model.deploymentStatus === 'deployed' ? 'green' :
                    model.deploymentStatus === 'ready' ? 'blue' :
                    model.deploymentStatus === 'training' ? 'orange' : 'red'
                  }
                />
              </View>

              <View style={styles.modelMetrics}>
                <Text style={styles.metricText}>
                  準確率: {(model.trainingMetrics.accuracy * 100).toFixed(2)}%
                </Text>
                <Text style={styles.metricText}>
                  精確率: {(model.trainingMetrics.precision * 100).toFixed(2)}%
                </Text>
                <Text style={styles.metricText}>
                  召回率: {(model.trainingMetrics.recall * 100).toFixed(2)}%
                </Text>
              </View>

              <View style={styles.modelActions}>
                {model.deploymentStatus === 'ready' && (
                  <>
                    <Button
                      title="評估"
                      onPress={() => evaluateModel(model.modelId)}
                      style={styles.actionButton}
                      size="small"
                    />
                    <Button
                      title="部署"
                      onPress={() => deployModel(model.modelId)}
                      style={styles.actionButton}
                      size="small"
                    />
                  </>
                )}
                {model.deploymentStatus === 'training' && (
                  <Progress
                    progress={model.trainingMetrics.accuracy}
                    style={styles.progressBar}
                  />
                )}
              </View>
            </View>
          ))
        )}
      </Card>

      {/* 訓練數據統計 */}
      <Card style={styles.dataCard}>
        <Text style={styles.cardTitle}>訓練數據</Text>
        <View style={styles.dataStats}>
          <Text style={styles.dataText}>總數據量: {trainingData.length}</Text>
          <Text style={styles.dataText}>
            假卡數據: {trainingData.filter(item => item.fakeType === 'counterfeit').length}
          </Text>
          <Text style={styles.dataText}>
            重印數據: {trainingData.filter(item => item.fakeType === 'reprint').length}
          </Text>
          <Text style={styles.dataText}>
            自製數據: {trainingData.filter(item => item.fakeType === 'custom').length}
          </Text>
        </View>
      </Card>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>處理中...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.8,
  },
  statsCard: {
    margin: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  configCard: {
    margin: 15,
  },
  configForm: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    width: 100,
    fontSize: 14,
    color: theme.colors.text,
  },
  numberInput: {
    flex: 1,
    marginLeft: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  startButton: {
    marginTop: 10,
  },
  modelsCard: {
    margin: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  modelItem: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 15,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modelId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modelMetrics: {
    marginBottom: 10,
  },
  metricText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  modelActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
  },
  progressBar: {
    flex: 1,
  },
  dataCard: {
    margin: 15,
  },
  dataStats: {
    marginBottom: 10,
  },
  dataText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.white,
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    color: theme.colors.error,
    fontSize: 16,
    marginTop: 50,
  },
});

export default FakeCardTrainingScreen;
