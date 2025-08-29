import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import type {
  DetectionResult as DetectionResultType,
  DetectionFeature,
} from '../types/detection';
import { CounterfeitRisk } from '../types/detection';

interface DetectionResultProps {
  result: DetectionResultType | null;
  loading?: boolean;
  onRetest?: () => void;
  onReport?: () => void;
  showDetails?: boolean;
}

export const DetectionResult: React.FC<DetectionResultProps> = ({
  result,
  loading = false,
  onRetest,
  onReport,
  showDetails = true,
}) => {
  const _getRiskColor = (risk: CounterfeitRisk) => {
    switch (risk) {
      case CounterfeitRisk.AUTHENTIC:
        return '#4CAF50';
      case CounterfeitRisk.SUSPICIOUS:
        return '#FF9800';
      case CounterfeitRisk.LIKELY_FAKE:
        return '#F44336';
      case CounterfeitRisk.CONFIRMED_FAKE:
        return '#D32F2F';
      default:
        return '#9E9E9E';
    }
  };

  const _getRiskIcon = (risk: CounterfeitRisk) => {
    switch (risk) {
      case CounterfeitRisk.AUTHENTIC:
        return 'checkmark-circle';
      case CounterfeitRisk.SUSPICIOUS:
        return 'warning';
      case CounterfeitRisk.LIKELY_FAKE:
        return 'close-circle';
      case CounterfeitRisk.CONFIRMED_FAKE:
        return 'ban';
      default:
        return 'help-circle';
    }
  };

  const _getRiskText = (risk: CounterfeitRisk) => {
    switch (risk) {
      case CounterfeitRisk.AUTHENTIC:
        return '真品';
      case CounterfeitRisk.SUSPICIOUS:
        return '可疑';
      case CounterfeitRisk.LIKELY_FAKE:
        return '疑似假卡';
      case CounterfeitRisk.CONFIRMED_FAKE:
        return '確認假卡';
      default:
        return '未知';
    }
  };

  const _formatProcessingTime = (timeMs: number) => {
    if (timeMs < 1000) {
      return `${timeMs.toFixed(0)}ms`;
    }
    return `${(timeMs / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name='sync' size={48} color='#007AFF' />
          <Text style={styles.loadingText}>正在檢測中...</Text>
        </View>
      </View>
    );
  }

  if (!result) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name='scan-outline' size={48} color='#9E9E9E' />
          <Text style={styles.emptyText}>尚未進行檢測</Text>
          <Text style={styles.emptySubtext}>請選擇圖片開始假卡檢測</Text>
        </View>
      </View>
    );
  }

  const _riskColor = getRiskColor(result.overallRisk);
  const _riskIcon = getRiskIcon(result.overallRisk);
  const _riskText = getRiskText(result.overallRisk);

  return (
    <ScrollView style={styles.container}>
      {/* 檢測結果頭部 */}
      <View style={[styles.header, { backgroundColor: riskColor }]}>
        <View style={styles.headerContent}>
          <Ionicons name={riskIcon as any} size={40} color='#FFFFFF' />
          <View style={styles.headerText}>
            <Text style={styles.riskText}>{riskText}</Text>
            <Text style={styles.confidenceText}>
              信心度: {(result.overallConfidence * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>風險分數</Text>
          <Text style={styles.scoreValue}>{result.riskScore.toFixed(1)}</Text>
        </View>
      </View>

      {/* 摘要信息 */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>檢測摘要</Text>
        <Text style={styles.summaryText}>{result.summary}</Text>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>處理時間</Text>
            <Text style={styles.metaValue}>
              {formatProcessingTime(result.processingTime)}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>檢測日期</Text>
            <Text style={styles.metaValue}>
              {new Date(result.analysisDate).toLocaleString('zh-TW')}
            </Text>
          </View>
        </View>
      </View>

      {/* 警告標記 */}
      {(result.flags.requiresManualReview ||
        result.flags.hasHighRiskFeatures) && (
        <View style={styles.warningSection}>
          <Ionicons name='warning' size={24} color='#FF9800' />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>注意事項</Text>
            {result.flags.requiresManualReview && (
              <Text style={styles.warningText}>• 建議進行人工復查</Text>
            )}
            {result.flags.hasHighRiskFeatures && (
              <Text style={styles.warningText}>• 發現高風險特徵</Text>
            )}
            {result.flags.lowImageQuality && (
              <Text style={styles.warningText}>• 圖片質量較低</Text>
            )}
            {result.flags.multipleAnomalies && (
              <Text style={styles.warningText}>• 發現多項異常</Text>
            )}
          </View>
        </View>
      )}

      {/* 特徵分析 */}
      {showDetails && (
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>特徵分析</Text>
          {result.features.map((feature, index) => (
            <FeatureItem key={index} feature={feature} />
          ))}
        </View>
      )}

      {/* 建議 */}
      <View style={styles.recommendationsSection}>
        <Text style={styles.sectionTitle}>專業建議</Text>
        {result.recommendations.map((recommendation, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Ionicons name='checkmark' size={16} color='#4CAF50' />
            <Text style={styles.recommendationText}>{recommendation}</Text>
          </View>
        ))}
      </View>

      {/* 操作按鈕 */}
      <View style={styles.actionButtons}>
        {onRetest && (
          <TouchableOpacity style={styles.retestButton} onPress={onRetest}>
            <Ionicons name='refresh' size={20} color='#007AFF' />
            <Text style={styles.retestButtonText}>重新檢測</Text>
          </TouchableOpacity>
        )}

        {onReport && result.overallRisk !== CounterfeitRisk.AUTHENTIC && (
          <TouchableOpacity style={styles.reportButton} onPress={onReport}>
            <Ionicons name='flag' size={20} color='#F44336' />
            <Text style={styles.reportButtonText}>報告問題</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

interface FeatureItemProps {
  feature: DetectionFeature;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ feature }) => {
  const _statusColor = feature.detected ? '#4CAF50' : '#F44336';
  const _statusIcon = feature.detected ? 'checkmark-circle' : 'close-circle';

  return (
    <View style={styles.featureItem}>
      <View style={styles.featureHeader}>
        <View style={styles.featureTitle}>
          <Ionicons name={statusIcon as any} size={20} color={statusColor} />
          <Text style={styles.featureName}>{feature.name}</Text>
        </View>
        <View style={styles.featureMetrics}>
          <Text style={styles.confidenceValue}>
            {(feature.confidence * 100).toFixed(0)}%
          </Text>
          <View
            style={[styles.importanceBadge, { opacity: feature.importance }]}
          >
            <Text style={styles.importanceText}>重要</Text>
          </View>
        </View>
      </View>

      <Text style={styles.featureCategory}>{feature.category}</Text>
      <Text style={styles.featureDescription}>{feature.description}</Text>

      {feature.analysis && (
        <Text style={styles.featureAnalysis}>{feature.analysis}</Text>
      )}

      {feature.value !== undefined && (
        <View style={styles.featureValues}>
          <Text style={styles.valueLabel}>
            檢測值: <Text style={styles.valueText}>{feature.value}</Text>
          </Text>
          {feature.expectedValue !== undefined && (
            <Text style={styles.valueLabel}>
              期望值:{' '}
              <Text style={styles.valueText}>{feature.expectedValue}</Text>
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const _styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  riskText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confidenceText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  summarySection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  warningSection: {
    backgroundColor: '#FFF3E0',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 4,
  },
  featuresSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  featureMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
  },
  importanceBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  importanceText: {
    fontSize: 10,
    color: '#1976D2',
    fontWeight: '600',
  },
  featureCategory: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  featureAnalysis: {
    fontSize: 14,
    color: '#007AFF',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  featureValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueLabel: {
    fontSize: 12,
    color: '#666666',
  },
  valueText: {
    color: '#000000',
    fontWeight: '500',
  },
  recommendationsSection: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    margin: 16,
    marginBottom: 32,
  },
  retestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retestButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  reportButtonText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
    marginLeft: 8,
  },
});
