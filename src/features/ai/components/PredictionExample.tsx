import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { usePrediction } from '../hooks/usePrediction';

import { PredictionForm } from './PredictionForm';
import { PredictionResult } from './PredictionResult';

export const PredictionExample: React.FC = () => {
  const {
    currentPrediction,
    predictionStats,
    loading,
    getStats,
    clearPrediction,
    resetState,
  } = usePrediction();

  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    getStats();
  }, [getStats]);

  const _handleNewPrediction = () => {
    setShowForm(true);
    setShowStats(false);
  };

  const _handlePredictionComplete = (result: unknown) => {
    setShowForm(false);
    Alert.alert('預測完成', `預測值: ${result.predictedValue.toFixed(2)}`);
  };

  const _handleCancelPrediction = () => {
    setShowForm(false);
  };

  const _handleViewHistory = () => {
    setShowStats(true);
    setShowForm(false);
  };

  const _handleReset = () => {
    Alert.alert('重置確認', '確定要重置所有預測數據嗎？此操作不可撤銷。', [
      { text: '取消', style: 'cancel' },
      {
        text: '確定',
        style: 'destructive',
        onPress: () => {
          resetState();
          setShowForm(false);
          setShowStats(false);
        },
      },
    ]);
  };

  const _formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const _formatNumber = (value: number) => {
    return new Intl.NumberFormat('zh-TW').format(value);
  };

  if (showForm) {
    return (
      <View style={styles.container}>
        <PredictionForm
          onPredictionComplete={handlePredictionComplete}
          onCancel={handleCancelPrediction}
        />
      </View>
    );
  }

  if (showStats) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>預測統計</Text>

        {predictionStats ? (
          <View style={styles.statsContainer}>
            {/* 總體Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>總體統計</Text>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>總預測次數:</Text>
                <Text style={styles.statValue}>
                  {formatNumber(predictionStats.totalPredictions)}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Text style={styles.statLabel}>平均準確率:</Text>
                <Text style={styles.statValue}>
                  {formatPercentage(predictionStats.averageAccuracy)}
                </Text>
              </View>
            </View>

            {/* 按Class型Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>按類型統計</Text>

              {Object.entries(predictionStats.accuracyByType).map(
                ([type, accuracy]) => (
                  <View key={type} style={styles.statRow}>
                    <Text style={styles.statLabel}>{type}:</Text>
                    <Text style={styles.statValue}>
                      {formatPercentage(accuracy)}
                    </Text>
                  </View>
                )
              )}
            </View>

            {/* 按Time範圍Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>按時間範圍統計</Text>

              {Object.entries(predictionStats.accuracyByHorizon).map(
                ([horizon, accuracy]) => (
                  <View key={horizon} style={styles.statRow}>
                    <Text style={styles.statLabel}>{horizon}:</Text>
                    <Text style={styles.statValue}>
                      {formatPercentage(accuracy)}
                    </Text>
                  </View>
                )
              )}
            </View>

            {/* 模型性能 */}
            {predictionStats.modelPerformance && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>模型性能</Text>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>整體準確率:</Text>
                  <Text style={styles.statValue}>
                    {formatPercentage(
                      predictionStats.modelPerformance.overallAccuracy
                    )}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>精確度:</Text>
                  <Text style={styles.statValue}>
                    {formatPercentage(
                      predictionStats.modelPerformance.precision
                    )}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>召回率:</Text>
                  <Text style={styles.statValue}>
                    {formatPercentage(predictionStats.modelPerformance.recall)}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>F1分數:</Text>
                  <Text style={styles.statValue}>
                    {formatPercentage(predictionStats.modelPerformance.f1Score)}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>MAPE:</Text>
                  <Text style={styles.statValue}>
                    {formatPercentage(predictionStats.modelPerformance.mape)}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>RMSE:</Text>
                  <Text style={styles.statValue}>
                    {formatPercentage(predictionStats.modelPerformance.rmse)}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>模型版本:</Text>
                  <Text style={styles.statValue}>
                    {predictionStats.modelPerformance.modelVersion}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>訓練數據量:</Text>
                  <Text style={styles.statValue}>
                    {formatNumber(
                      predictionStats.modelPerformance.trainingDataSize
                    )}
                  </Text>
                </View>

                <View style={styles.statRow}>
                  <Text style={styles.statLabel}>最後更新:</Text>
                  <Text style={styles.statValue}>
                    {new Date(
                      predictionStats.modelPerformance.lastUpdated
                    ).toLocaleDateString('zh-TW')}
                  </Text>
                </View>
              </View>
            )}

            {/* Operation按鈕 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowStats(false)}
              >
                <Text style={styles.buttonText}>返回</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#007AFF' />
            <Text style={styles.loadingText}>載入統計數據...</Text>
          </View>
        )}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI 預測系統</Text>

      <View style={styles.content}>
        <Text style={styles.description}>
          使用先進的機器學習算法，為您的卡牌投資提供專業的價格預測和市場趨勢分析。
        </Text>

        {/* 功能特色 */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>功能特色</Text>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>🎯 多種預測類型</Text>
            <Text style={styles.featureDescription}>
              支持價格預測、趨勢分析、波動性預測、交易量預測、市值預測和綜合預測
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>⏰ 靈活時間範圍</Text>
            <Text style={styles.featureDescription}>
              短期（1-7天）、中期（1-4週）、長期（1-12個月）、超長期（1年以上）
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📊 詳細風險評估</Text>
            <Text style={styles.featureDescription}>
              提供整體風險、市場風險、波動性風險、流動性風險等多維度風險分析
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>🤖 智能建議系統</Text>
            <Text style={styles.featureDescription}>
              基於預測結果和風險評估，提供個性化的投資建議
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📈 歷史追蹤</Text>
            <Text style={styles.featureDescription}>
              記錄所有預測歷史，追蹤預測準確率和投資回報
            </Text>
          </View>
        </View>

        {/* Statistics概覽 */}
        {predictionStats && (
          <View style={styles.statsOverview}>
            <Text style={styles.sectionTitle}>統計概覽</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {formatNumber(predictionStats.totalPredictions)}
                </Text>
                <Text style={styles.statLabel}>總預測次數</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {formatPercentage(predictionStats.averageAccuracy)}
                </Text>
                <Text style={styles.statLabel}>平均準確率</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {predictionStats.modelPerformance?.modelVersion || 'N/A'}
                </Text>
                <Text style={styles.statLabel}>模型版本</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {formatNumber(
                    predictionStats.modelPerformance?.trainingDataSize || 0
                  )}
                </Text>
                <Text style={styles.statLabel}>訓練數據量</Text>
              </View>
            </View>
          </View>
        )}

        {/* Operation按鈕 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleNewPrediction}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color='#fff' />
            ) : (
              <Text style={styles.buttonText}>開始新預測</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleViewHistory}
          >
            <Text style={styles.buttonText}>查看統計</Text>
          </TouchableOpacity>

          {currentPrediction && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setShowStats(false)}
            >
              <Text style={styles.buttonText}>查看結果</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleReset}
          >
            <Text style={styles.buttonText}>重置數據</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Show當前預測結果 */}
      {currentPrediction && !showForm && !showStats && (
        <View style={styles.resultContainer}>
          <PredictionResult
            prediction={currentPrediction}
            onNewPrediction={handleNewPrediction}
            onViewHistory={handleViewHistory}
          />
        </View>
      )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  featuresSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  featureItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsOverview: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabelSmall: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
  },
  statsContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
  },
});
