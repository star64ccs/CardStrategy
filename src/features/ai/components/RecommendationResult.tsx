import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import { useRecommendation } from '../hooks/useRecommendation';
import type {
  InvestmentRecommendationResult,
  CardRecommendation,
} from '../types/recommendation';
import {
  RecommendationAction,
  RiskLevel,
  Priority,
} from '../types/recommendation';

interface RecommendationResultProps {
  recommendation?: InvestmentRecommendationResult;
  onNewRecommendation?: () => void;
  onViewHistory?: () => void;
}

export const RecommendationResult: React.FC<RecommendationResultProps> = ({
  recommendation,
  onNewRecommendation,
  onViewHistory,
}) => {
  const {
    formatCurrency,
    formatPercentage,
    formatRiskLevel,
    formatRecommendationAction,
    formatPriority,
  } = useRecommendation();

  const _getActionColor = (action: RecommendationAction) => {
    switch (action) {
      case RecommendationAction.STRONG_BUY:
        return '#28a745';
      case RecommendationAction.BUY:
        return '#20c997';
      case RecommendationAction.HOLD:
        return '#ffc107';
      case RecommendationAction.SELL:
        return '#fd7e14';
      case RecommendationAction.STRONG_SELL:
        return '#dc3545';
      case RecommendationAction.AVOID:
        return '#6c757d';
      default:
        return '#666';
    }
  };

  const _getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.VERY_LOW:
        return '#28a745';
      case RiskLevel.LOW:
        return '#20c997';
      case RiskLevel.MEDIUM:
        return '#ffc107';
      case RiskLevel.HIGH:
        return '#fd7e14';
      case RiskLevel.VERY_HIGH:
        return '#dc3545';
      default:
        return '#666';
    }
  };

  const _getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.VERY_HIGH:
        return '#dc3545';
      case Priority.HIGH:
        return '#fd7e14';
      case Priority.MEDIUM:
        return '#ffc107';
      case Priority.LOW:
        return '#20c997';
      case Priority.VERY_LOW:
        return '#6c757d';
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

  const _renderCardRecommendation = ({
    item,
  }: {
    item: CardRecommendation;
  }) => (
    <View style={styles.cardItem}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{item.cardName}</Text>
        <View
          style={[
            styles.actionBadge,
            { backgroundColor: getActionColor(item.recommendedAction) },
          ]}
        >
          <Text style={styles.actionText}>
            {formatRecommendationAction(item.recommendedAction)}
          </Text>
        </View>
      </View>

      <Text style={styles.cardSeries}>{item.series}</Text>

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>當前價格:</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(item.currentPrice)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>目標價格:</Text>
          <Text style={styles.detailValue}>
            {formatCurrency(item.priceTarget.target)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>預期回報:</Text>
          <Text
            style={[
              styles.detailValue,
              { color: item.expectedReturn >= 0 ? '#28a745' : '#dc3545' },
            ]}
          >
            {formatPercentage(item.expectedReturn)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>風險等級:</Text>
          <Text
            style={[
              styles.detailValue,
              { color: getRiskColor(item.riskLevel) },
            ]}
          >
            {formatRiskLevel(item.riskLevel)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>優先級:</Text>
          <Text
            style={[
              styles.detailValue,
              { color: getPriorityColor(item.priority) },
            ]}
          >
            {formatPriority(item.priority)}
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>置信度:</Text>
          <Text style={styles.detailValue}>
            {formatPercentage(item.confidence)}
          </Text>
        </View>
      </View>

      {item.reasoning.length > 0 && (
        <View style={styles.reasoningContainer}>
          <Text style={styles.reasoningTitle}>建議理由:</Text>
          {item.reasoning.map((reason, index) => (
            <Text key={index} style={styles.reasoningItem}>
              • {reason}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  if (!recommendation) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>暫無投資建議</Text>
        <TouchableOpacity style={styles.button} onPress={onNewRecommendation}>
          <Text style={styles.buttonText}>生成新建議</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>投資建議報告</Text>

      {/* 建議摘要 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>建議摘要</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {recommendation.recommendations.length}
            </Text>
            <Text style={styles.summaryLabel}>推薦卡牌</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#28a745' }]}>
              {formatPercentage(recommendation.expectedReturn.realistic)}
            </Text>
            <Text style={styles.summaryLabel}>預期回報</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text
              style={[
                styles.summaryNumber,
                {
                  color: getRiskColor(recommendation.riskAnalysis.overallRisk),
                },
              ]}
            >
              {formatRiskLevel(recommendation.riskAnalysis.overallRisk)}
            </Text>
            <Text style={styles.summaryLabel}>風險等級</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {formatPercentage(recommendation.confidence)}
            </Text>
            <Text style={styles.summaryLabel}>整體置信度</Text>
          </View>
        </View>
      </View>

      {/* 預期回報 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>預期回報分析</Text>

        <View style={styles.returnRow}>
          <Text style={styles.returnLabel}>樂觀情況:</Text>
          <Text style={[styles.returnValue, { color: '#28a745' }]}>
            {formatPercentage(recommendation.expectedReturn.optimistic)}
          </Text>
        </View>

        <View style={styles.returnRow}>
          <Text style={styles.returnLabel}>現實情況:</Text>
          <Text style={styles.returnValue}>
            {formatPercentage(recommendation.expectedReturn.realistic)}
          </Text>
        </View>

        <View style={styles.returnRow}>
          <Text style={styles.returnLabel}>悲觀情況:</Text>
          <Text style={[styles.returnValue, { color: '#dc3545' }]}>
            {formatPercentage(recommendation.expectedReturn.pessimistic)}
          </Text>
        </View>

        <View style={styles.returnRow}>
          <Text style={styles.returnLabel}>年化回報:</Text>
          <Text style={styles.returnValue}>
            {formatPercentage(recommendation.expectedReturn.annualizedReturn)}
          </Text>
        </View>

        <View style={styles.returnRow}>
          <Text style={styles.returnLabel}>風險調整回報:</Text>
          <Text style={styles.returnValue}>
            {formatPercentage(recommendation.expectedReturn.riskAdjustedReturn)}
          </Text>
        </View>
      </View>

      {/* 風險分析 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>風險分析</Text>

        <View style={styles.riskRow}>
          <Text style={styles.riskLabel}>整體風險:</Text>
          <Text
            style={[
              styles.riskValue,
              { color: getRiskColor(recommendation.riskAnalysis.overallRisk) },
            ]}
          >
            {formatRiskLevel(recommendation.riskAnalysis.overallRisk)}
          </Text>
        </View>

        <View style={styles.riskRow}>
          <Text style={styles.riskLabel}>風險評分:</Text>
          <Text style={styles.riskValue}>
            {recommendation.riskAnalysis.riskScore}/100
          </Text>
        </View>

        <View style={styles.riskRow}>
          <Text style={styles.riskLabel}>投資組合風險:</Text>
          <Text
            style={[
              styles.riskValue,
              {
                color: getRiskColor(recommendation.riskAnalysis.portfolioRisk),
              },
            ]}
          >
            {formatRiskLevel(recommendation.riskAnalysis.portfolioRisk)}
          </Text>
        </View>

        <View style={styles.riskRow}>
          <Text style={styles.riskLabel}>市場風險:</Text>
          <Text
            style={[
              styles.riskValue,
              { color: getRiskColor(recommendation.riskAnalysis.marketRisk) },
            ]}
          >
            {formatRiskLevel(recommendation.riskAnalysis.marketRisk)}
          </Text>
        </View>

        <View style={styles.riskRow}>
          <Text style={styles.riskLabel}>流動性風險:</Text>
          <Text
            style={[
              styles.riskValue,
              {
                color: getRiskColor(recommendation.riskAnalysis.liquidityRisk),
              },
            ]}
          >
            {formatRiskLevel(recommendation.riskAnalysis.liquidityRisk)}
          </Text>
        </View>

        <View style={styles.riskRow}>
          <Text style={styles.riskLabel}>波動性估計:</Text>
          <Text style={styles.riskValue}>
            {formatPercentage(recommendation.riskAnalysis.volatilityEstimate)}
          </Text>
        </View>

        {recommendation.riskAnalysis.riskFactors.length > 0 && (
          <View style={styles.riskFactors}>
            <Text style={styles.riskFactorsTitle}>風險因素:</Text>
            {recommendation.riskAnalysis.riskFactors.map((factor, index) => (
              <Text key={index} style={styles.riskFactor}>
                • {factor}
              </Text>
            ))}
          </View>
        )}
      </View>

      {/* 投資組合建議 */}
      {recommendation.portfolioSuggestion && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>投資組合建議</Text>

          <View style={styles.portfolioRow}>
            <Text style={styles.portfolioLabel}>總價值:</Text>
            <Text style={styles.portfolioValue}>
              {formatCurrency(recommendation.portfolioSuggestion.totalValue)}
            </Text>
          </View>

          <View style={styles.portfolioRow}>
            <Text style={styles.portfolioLabel}>現金儲備:</Text>
            <Text style={styles.portfolioValue}>
              {formatCurrency(recommendation.portfolioSuggestion.cashReserve)}
            </Text>
          </View>

          <View style={styles.portfolioRow}>
            <Text style={styles.portfolioLabel}>緊急基金:</Text>
            <Text style={styles.portfolioValue}>
              {formatCurrency(recommendation.portfolioSuggestion.emergencyFund)}
            </Text>
          </View>

          <View style={styles.portfolioRow}>
            <Text style={styles.portfolioLabel}>多樣化分數:</Text>
            <Text style={styles.portfolioValue}>
              {recommendation.portfolioSuggestion.diversification.score}/100
            </Text>
          </View>
        </View>
      )}

      {/* 卡牌建議列表 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          詳細建議 ({recommendation.recommendations.length})
        </Text>

        <FlatList
          data={recommendation.recommendations}
          renderItem={renderCardRecommendation}
          keyExtractor={item => item.cardId}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* 建議有效期 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>建議信息</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>生成時間:</Text>
          <Text style={styles.metaValue}>
            {formatDate(recommendation.createdAt)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>有效期至:</Text>
          <Text style={styles.metaValue}>
            {formatDate(recommendation.validUntil)}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>模型版本:</Text>
          <Text style={styles.metaValue}>
            {recommendation.metadata.modelVersion}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>數據質量:</Text>
          <Text style={styles.metaValue}>
            {formatPercentage(recommendation.metadata.dataQuality)}
          </Text>
        </View>
      </View>

      {/* 操作按鈕 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={onNewRecommendation}>
          <Text style={styles.buttonText}>生成新建議</Text>
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  returnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  returnLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  returnValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  riskValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  riskFactors: {
    marginTop: 10,
  },
  riskFactorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  riskFactor: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    marginTop: 3,
  },
  portfolioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  portfolioLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  portfolioValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardSeries: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  cardDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  reasoningContainer: {
    marginTop: 10,
  },
  reasoningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  reasoningItem: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metaLabel: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  metaValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
