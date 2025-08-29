import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { usePrediction } from '../hooks/usePrediction';
import type { PredictionResult as PredictionResultType } from '../types/prediction';
import {
  PredictionType,
  TimeHorizon,
  TrendDirection,
  RiskLevel,
} from '../types/prediction';

interface PredictionResultProps {
  prediction?: PredictionResultType;
  onNewPrediction?: () => void;
  onViewHistory?: () => void;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({
  prediction,
  onNewPrediction,
  onViewHistory,
}) => {
  const {
    predictionStats,
    getStats,
    getModelAccuracy,
    getModelVersion,
    getLastModelUpdate,
  } = usePrediction();

  const _getPredictionTypeLabel = (type: PredictionType) => {
    switch (type) {
      case PredictionType.PRICE:
        return '價格預測';
      case PredictionType.TREND:
        return '趨勢預測';
      case PredictionType.VOLATILITY:
        return '波動性預測';
      case PredictionType.VOLUME:
        return '交易量預測';
      case PredictionType.MARKET_CAP:
        return '市值預測';
      case PredictionType.COMPOSITE:
        return '綜合預測';
      default:
        return type;
    }
  };

  const _getTimeHorizonLabel = (horizon: TimeHorizon) => {
    switch (horizon) {
      case TimeHorizon.SHORT_TERM:
        return '短期 (1-7天)';
      case TimeHorizon.MEDIUM_TERM:
        return '中期 (1-4週)';
      case TimeHorizon.LONG_TERM:
        return '長期 (1-12個月)';
      case TimeHorizon.VERY_LONG_TERM:
        return '超長期 (1年以上)';
      default:
        return horizon;
    }
  };

  const _getTrendLabel = (trend: TrendDirection) => {
    switch (trend) {
      case TrendDirection.BULLISH:
        return '看漲';
      case TrendDirection.BEARISH:
        return '看跌';
      case TrendDirection.SIDEWAYS:
        return '橫盤';
      case TrendDirection.VOLATILE:
        return '波動';
      default:
        return trend;
    }
  };

  const _getTrendColor = (trend: TrendDirection) => {
    switch (trend) {
      case TrendDirection.BULLISH:
        return '#4CAF50';
      case TrendDirection.BEARISH:
        return '#F44336';
      case TrendDirection.SIDEWAYS:
        return '#FF9800';
      case TrendDirection.VOLATILE:
        return '#9C27B0';
      default:
        return '#666';
    }
  };

  const _getRiskLevelLabel = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.VERY_LOW:
        return '極低';
      case RiskLevel.LOW:
        return '低';
      case RiskLevel.MEDIUM:
        return '中等';
      case RiskLevel.HIGH:
        return '高';
      case RiskLevel.VERY_HIGH:
        return '極高';
      default:
        return risk;
    }
  };

  const _getRiskLevelColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.VERY_LOW:
        return '#4CAF50';
      case RiskLevel.LOW:
        return '#8BC34A';
      case RiskLevel.MEDIUM:
        return '#FF9800';
      case RiskLevel.HIGH:
        return '#FF5722';
      case RiskLevel.VERY_HIGH:
        return '#F44336';
      default:
        return '#666';
    }
  };

  const _formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const _formatCurrency = (value: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const _formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (!prediction) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>暫無預測結果</Text>
        <TouchableOpacity style={styles.button} onPress={onNewPrediction}>
          <Text style={styles.buttonText}>開始新預測</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>預測結果</Text>

      {/* 基本信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>基本信息</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>卡牌ID:</Text>
          <Text style={styles.value}>{prediction.cardId}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>預測類型:</Text>
          <Text style={styles.value}>
            {getPredictionTypeLabel(prediction.predictionType)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>時間範圍:</Text>
          <Text style={styles.value}>
            {getTimeHorizonLabel(prediction.timeHorizon)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>預測時間:</Text>
          <Text style={styles.value}>{formatDate(prediction.createdAt)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>有效期至:</Text>
          <Text style={styles.value}>{formatDate(prediction.expiresAt)}</Text>
        </View>
      </View>

      {/* 預測結果 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>預測結果</Text>

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>預測值</Text>
          <Text style={styles.resultValue}>
            {formatCurrency(prediction.predictedValue)}
          </Text>
        </View>

        <View style={styles.confidenceRow}>
          <Text style={styles.label}>置信度:</Text>
          <Text style={styles.value}>
            {formatPercentage(prediction.confidenceLevel)}
          </Text>
        </View>

        <View style={styles.confidenceRow}>
          <Text style={styles.label}>置信區間:</Text>
          <Text style={styles.value}>
            {formatCurrency(prediction.confidenceInterval.lower)} -{' '}
            {formatCurrency(prediction.confidenceInterval.upper)}
          </Text>
        </View>

        <View style={styles.trendRow}>
          <Text style={styles.label}>趨勢:</Text>
          <Text
            style={[
              styles.trendValue,
              { color: getTrendColor(prediction.trend) },
            ]}
          >
            {getTrendLabel(prediction.trend)}
          </Text>
        </View>

        <View style={styles.trendRow}>
          <Text style={styles.label}>趨勢強度:</Text>
          <Text style={styles.value}>
            {formatPercentage(prediction.trendStrength)}
          </Text>
        </View>
      </View>

      {/* 風險評估 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>風險評估</Text>

        <View style={styles.riskRow}>
          <Text style={styles.label}>整體風險:</Text>
          <Text
            style={[
              styles.riskValue,
              {
                color: getRiskLevelColor(prediction.riskAssessment.overallRisk),
              },
            ]}
          >
            {getRiskLevelLabel(prediction.riskAssessment.overallRisk)}
          </Text>
        </View>

        <View style={styles.riskRow}>
          <Text style={styles.label}>風險評分:</Text>
          <Text style={styles.value}>
            {prediction.riskAssessment.riskScore}/100
          </Text>
        </View>

        <View style={styles.riskRow}>
          <Text style={styles.label}>市場風險:</Text>
          <Text
            style={[
              styles.riskValue,
              {
                color: getRiskLevelColor(prediction.riskAssessment.marketRisk),
              },
            ]}
          >
            {getRiskLevelLabel(prediction.riskAssessment.marketRisk)}
          </Text>
        </View>

        <View style={styles.riskRow}>
          <Text style={styles.label}>波動性風險:</Text>
          <Text
            style={[
              styles.riskValue,
              {
                color: getRiskLevelColor(
                  prediction.riskAssessment.volatilityRisk
                ),
              },
            ]}
          >
            {getRiskLevelLabel(prediction.riskAssessment.volatilityRisk)}
          </Text>
        </View>

        <View style={styles.riskRow}>
          <Text style={styles.label}>流動性風險:</Text>
          <Text
            style={[
              styles.riskValue,
              {
                color: getRiskLevelColor(
                  prediction.riskAssessment.liquidityRisk
                ),
              },
            ]}
          >
            {getRiskLevelLabel(prediction.riskAssessment.liquidityRisk)}
          </Text>
        </View>

        {prediction.riskAssessment.riskFactors.length > 0 && (
          <View style={styles.riskFactors}>
            <Text style={styles.label}>風險因素:</Text>
            {prediction.riskAssessment.riskFactors.map((factor, index) => (
              <Text key={index} style={styles.riskFactor}>
                • {factor}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* 影響因素 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>影響因素</Text>

        {prediction.factors.map((factor, index) => (
          <View key={index} style={styles.factorRow}>
            <Text style={styles.factorName}>{factor.name}</Text>
            <View style={styles.factorDetails}>
              <Text style={styles.factorImpact}>
                影響: {factor.impact > 0 ? '+' : ''}
                {formatPercentage(factor.impact)}
              </Text>
              <Text style={styles.factorWeight}>
                權重: {formatPercentage(factor.weight)}
              </Text>
            </View>
            <Text style={styles.factorDescription}>{factor.description}</Text>
            <Text style={styles.factorSource}>數據源: {factor.dataSource}</Text>
          </View>
        ))}
      </View>

      {/* 建議 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>投資建議</Text>

        {prediction.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationRow}>
            <Text style={styles.recommendationText}>• {recommendation}</Text>
          </View>
        ))}
      </View>

      {/* 模型信息 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>模型信息</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>模型版本:</Text>
          <Text style={styles.value}>{getModelVersion()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>模型準確率:</Text>
          <Text style={styles.value}>
            {formatPercentage(getModelAccuracy())}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>最後更新:</Text>
          <Text style={styles.value}>{formatDate(getLastModelUpdate())}</Text>
        </View>
      </View>

      {/* 操作按鈕 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onNewPrediction}>
          <Text style={styles.buttonText}>新預測</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={onViewHistory}>
          <Text style={styles.buttonText}>查看歷史</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#333',
  },
  noDataText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  value: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  resultCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  riskFactors: {
    marginTop: 10,
  },
  riskFactor: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginTop: 5,
  },
  factorRow: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  factorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  factorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  factorImpact: {
    fontSize: 14,
    color: '#007AFF',
  },
  factorWeight: {
    fontSize: 14,
    color: '#666',
  },
  factorDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  factorSource: {
    fontSize: 12,
    color: '#999',
  },
  recommendationRow: {
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
