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
import { useTheme } from '../config/theme';
import { predictionService, Prediction, ModelType, Timeframe, ModelInfo } from '../services/predictionService';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { Toast } from '../components/common/Toast';
import { logger } from '../utils/logger';

interface PredictionScreenProps {
  navigation: any;
  route: any;
}

const PredictionScreen: React.FC<PredictionScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cardId, setCardId] = useState('');
  const [selectedModel, setSelectedModel] = useState<ModelType>('ensemble');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('30d');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [predictionHistory, setPredictionHistory] = useState<Prediction[]>([]);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const timeframes: { value: Timeframe; label: string }[] = [
    { value: '1d', label: '1天' },
    { value: '7d', label: '7天' },
    { value: '30d', label: '30天' },
    { value: '90d', label: '90天' },
    { value: '180d', label: '180天' },
    { value: '365d', label: '365天' }
  ];

  useEffect(() => {
    loadAvailableModels();
    if (route.params?.cardId) {
      setCardId(route.params.cardId.toString());
    }
  }, []);

  const loadAvailableModels = async () => {
    try {
      setLoading(true);
      const response = await predictionService.getAvailableModels();
      if (response.success && response.data) {
        setAvailableModels(response.data);
      }
    } catch (error: any) {
      logger.error('載入可用模型失敗:', error);
      Toast.show('載入模型列表失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async () => {
    if (!cardId.trim()) {
      Alert.alert('錯誤', '請輸入卡牌ID');
      return;
    }

    try {
      setLoading(true);
      const response = await predictionService.predictCardPrice(
        parseInt(cardId),
        selectedTimeframe,
        selectedModel
      );

      if (response.success && response.data) {
        setPrediction(response.data);
        Toast.show('預測完成', 'success');
        loadPredictionHistory();
      }
    } catch (error: any) {
      logger.error('預測失敗:', error);
      Toast.show(error.message || '預測失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPredictionHistory = async () => {
    if (!cardId.trim()) return;

    try {
      const response = await predictionService.getPredictionHistory(parseInt(cardId), 10);
      if (response.success && response.data) {
        setPredictionHistory(response.data.predictions);
      }
    } catch (error: any) {
      logger.error('載入預測歷史失敗:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadAvailableModels(),
      loadPredictionHistory()
    ]);
    setRefreshing(false);
  };

  const handleCalculateAccuracy = async (predictionId: number) => {
    try {
      setLoading(true);
      const response = await predictionService.calculatePredictionAccuracy(predictionId);

      if (response.success && response.data) {
        const accuracy = response.data;
        Alert.alert(
          '預測準確性',
          `實際價格: $${accuracy.actualPrice.toFixed(2)}\n` +
          `預測價格: $${accuracy.predictedPrice.toFixed(2)}\n` +
          `準確性: ${(accuracy.accuracy * 100).toFixed(1)}%\n` +
          `誤差: $${accuracy.error.toFixed(2)}`
        );
      } else {
        Toast.show('目標日期還沒有實際數據', 'info');
      }
    } catch (error: any) {
      logger.error('計算準確性失敗:', error);
      Toast.show(error.message || '計算準確性失敗', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderModelSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>選擇預測模型</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modelScroll}>
        {availableModels.map((model) => (
          <TouchableOpacity
            key={model.id}
            style={[
              styles.modelCard,
              {
                backgroundColor: selectedModel === model.id ? theme.colors.primary : theme.colors.surface,
                borderColor: selectedModel === model.id ? theme.colors.primary : theme.colors.border
              }
            ]}
            onPress={() => setSelectedModel(model.id)}
          >
            <Text style={[
              styles.modelName,
              { color: selectedModel === model.id ? theme.colors.onPrimary : theme.colors.text }
            ]}>
              {model.name}
            </Text>
            <Text style={[
              styles.modelDescription,
              { color: selectedModel === model.id ? theme.colors.onPrimary : theme.colors.textSecondary }
            ]}>
              {model.description}
            </Text>
            <View style={styles.modelStats}>
              <Text style={[
                styles.modelStat,
                { color: selectedModel === model.id ? theme.colors.onPrimary : theme.colors.textSecondary }
              ]}>
                準確性: {model.accuracy}
              </Text>
              <Text style={[
                styles.modelStat,
                { color: selectedModel === model.id ? theme.colors.onPrimary : theme.colors.textSecondary }
              ]}>
                速度: {model.speed}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTimeframeSelector = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>選擇時間框架</Text>
      <View style={styles.timeframeGrid}>
        {timeframes.map((timeframe) => (
          <TouchableOpacity
            key={timeframe.value}
            style={[
              styles.timeframeButton,
              {
                backgroundColor: selectedTimeframe === timeframe.value ? theme.colors.primary : theme.colors.surface,
                borderColor: selectedTimeframe === timeframe.value ? theme.colors.primary : theme.colors.border
              }
            ]}
            onPress={() => setSelectedTimeframe(timeframe.value)}
          >
            <Text style={[
              styles.timeframeText,
              { color: selectedTimeframe === timeframe.value ? theme.colors.onPrimary : theme.colors.text }
            ]}>
              {timeframe.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPredictionResult = () => {
    if (!prediction) return null;

    const formattedPrediction = predictionService.formatPrediction(prediction);

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>預測結果</Text>
        <Card style={[styles.predictionCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.predictionHeader}>
            <Text style={[styles.predictionTitle, { color: theme.colors.text }]}>
              {formattedPrediction.trendIcon} 價格預測
            </Text>
            <View style={[
              styles.riskBadge,
              { backgroundColor: formattedPrediction.riskLevelColor }
            ]}>
              <Text style={styles.riskText}>
                {prediction.riskLevel.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.predictionDetails}>
            <View style={styles.predictionRow}>
              <Text style={[styles.predictionLabel, { color: theme.colors.textSecondary }]}>
                預測價格:
              </Text>
              <Text style={[styles.predictionValue, { color: theme.colors.text }]}>
                {formattedPrediction.predictedPriceFormatted}
              </Text>
            </View>

            <View style={styles.predictionRow}>
              <Text style={[styles.predictionLabel, { color: theme.colors.textSecondary }]}>
                置信度:
              </Text>
              <Text style={[styles.predictionValue, { color: theme.colors.text }]}>
                {formattedPrediction.confidenceFormatted}
              </Text>
            </View>

            <View style={styles.predictionRow}>
              <Text style={[styles.predictionLabel, { color: theme.colors.textSecondary }]}>
                趨勢:
              </Text>
              <Text style={[styles.predictionValue, { color: theme.colors.text }]}>
                {formattedPrediction.trendIcon} {prediction.trend}
              </Text>
            </View>

            <View style={styles.predictionRow}>
              <Text style={[styles.predictionLabel, { color: theme.colors.textSecondary }]}>
                波動性:
              </Text>
              <Text style={[styles.predictionValue, { color: theme.colors.text }]}>
                {formattedPrediction.volatilityFormatted}
              </Text>
            </View>

            <View style={styles.predictionRow}>
              <Text style={[styles.predictionLabel, { color: theme.colors.textSecondary }]}>
                目標日期:
              </Text>
              <Text style={[styles.predictionValue, { color: theme.colors.text }]}>
                {formattedPrediction.targetDateFormatted}
              </Text>
            </View>

            <View style={styles.predictionRow}>
              <Text style={[styles.predictionLabel, { color: theme.colors.textSecondary }]}>
                模型:
              </Text>
              <Text style={[styles.predictionValue, { color: theme.colors.text }]}>
                {predictionService.getModelDisplayName(prediction.modelType)}
              </Text>
            </View>
          </View>

          <View style={styles.predictionActions}>
            <Button
              title="計算準確性"
              onPress={() => handleCalculateAccuracy(prediction.id)}
              style={styles.actionButton}
              disabled={loading}
            />
            <Button
              title="查看歷史"
              onPress={() => setShowHistory(!showHistory)}
              style={styles.actionButton}
              variant="outline"
            />
          </View>
        </Card>
      </View>
    );
  };

  const renderPredictionHistory = () => {
    if (!showHistory || predictionHistory.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>預測歷史</Text>
        <ScrollView style={styles.historyList}>
          {predictionHistory.map((historyPrediction) => {
            const formatted = predictionService.formatPrediction(historyPrediction);
            return (
              <Card key={historyPrediction.id} style={[styles.historyCard, { backgroundColor: theme.colors.surface }]}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyDate, { color: theme.colors.text }]}>
                    {formatted.predictionDateFormatted}
                  </Text>
                  <Text style={[styles.historyModel, { color: theme.colors.textSecondary }]}>
                    {predictionService.getModelDisplayName(historyPrediction.modelType)}
                  </Text>
                </View>

                <View style={styles.historyDetails}>
                  <Text style={[styles.historyPrice, { color: theme.colors.text }]}>
                    {formatted.predictedPriceFormatted}
                  </Text>
                  <Text style={[styles.historyConfidence, { color: theme.colors.textSecondary }]}>
                    置信度: {formatted.confidenceFormatted}
                  </Text>
                  <Text style={[styles.historyTrend, { color: theme.colors.text }]}>
                    {formatted.trendIcon} {historyPrediction.trend}
                  </Text>
                </View>

                {historyPrediction.accuracy !== null && (
                  <View style={styles.accuracyRow}>
                    <Text style={[styles.accuracyLabel, { color: theme.colors.textSecondary }]}>
                      準確性:
                    </Text>
                    <Text style={[styles.accuracyValue, { color: theme.colors.text }]}>
                      {formatted.accuracyFormatted}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  if (loading && !refreshing) {
    return <Loading />;
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>AI 預測模型</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          使用機器學習模型預測卡牌價格趨勢
        </Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>輸入卡牌ID</Text>
        <Input
          placeholder="輸入卡牌ID"
          value={cardId}
          onChangeText={setCardId}
          keyboardType="numeric"
          style={styles.cardIdInput}
        />
        <Button
          title="開始預測"
          onPress={handlePredict}
          disabled={loading || !cardId.trim()}
          style={styles.predictButton}
        />
      </View>

      {renderModelSelector()}
      {renderTimeframeSelector()}
      {renderPredictionResult()}
      {renderPredictionHistory()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24
  },
  inputSection: {
    marginBottom: 24
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16
  },
  cardIdInput: {
    marginBottom: 16
  },
  predictButton: {
    marginTop: 8
  },
  modelScroll: {
    marginBottom: 8
  },
  modelCard: {
    width: 200,
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  modelName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  modelDescription: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16
  },
  modelStats: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  modelStat: {
    fontSize: 10
  },
  timeframeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 60,
    alignItems: 'center'
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: '500'
  },
  predictionCard: {
    padding: 16,
    borderRadius: 12
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  predictionTitle: {
    fontSize: 18,
    fontWeight: '600'
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  riskText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600'
  },
  predictionDetails: {
    marginBottom: 16
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  predictionLabel: {
    fontSize: 14
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: '500'
  },
  predictionActions: {
    flexDirection: 'row',
    gap: 12
  },
  actionButton: {
    flex: 1
  },
  historyList: {
    maxHeight: 300
  },
  historyCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '500'
  },
  historyModel: {
    fontSize: 12
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  historyPrice: {
    fontSize: 16,
    fontWeight: '600'
  },
  historyConfidence: {
    fontSize: 12
  },
  historyTrend: {
    fontSize: 14
  },
  accuracyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0'
  },
  accuracyLabel: {
    fontSize: 12
  },
  accuracyValue: {
    fontSize: 12,
    fontWeight: '500'
  }
});

export default PredictionScreen;
