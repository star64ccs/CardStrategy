import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LazyImage } from '@/components/common/LazyImage';
import { theme } from '@/config/theme';
import { CardConditionAnalysisResult } from '@/services/cardService';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

const { width } = Dimensions.get('window');

interface CardConditionAnalysisProps {
  cardId: string;
  cardName?: string;
  imageUri?: string;
  onAnalysisComplete?: (result: CardConditionAnalysisResult) => void;
  onClose?: () => void;
}

export const CardConditionAnalysis: React.FC<CardConditionAnalysisProps> = ({
  cardId,
  cardName,
  imageUri,
  onAnalysisComplete,
  onClose
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CardConditionAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // 這裡應該調用 cardService.analyzeCondition
      // 暫時使用模擬數據
      await new Promise(resolve => setTimeout(resolve, 3000));

      const mockResult: CardConditionAnalysisResult = {
        success: true,
        message: '條件分析完成',
        data: {
          cardId,
          analysis: {
            overallGrade: 'Near Mint',
            overallScore: 85,
            confidence: 0.92,
            factors: {
              corners: {
                score: 90,
                grade: 'Near Mint',
                details: ['四角完整', '輕微磨損', '無明顯損傷']
              },
              edges: {
                score: 85,
                grade: 'Near Mint',
                details: ['邊緣整齊', '輕微磨損', '無明顯損傷']
              },
              surface: {
                score: 80,
                grade: 'Excellent',
                details: ['表面光滑', '輕微劃痕', '無明顯污漬']
              },
              centering: {
                score: 88,
                grade: 'Near Mint',
                details: ['居中良好', '輕微偏移', '在可接受範圍內']
              },
              printQuality: {
                score: 92,
                grade: 'Near Mint',
                details: ['印刷清晰', '顏色鮮豔', '無明顯缺陷']
              }
            },
            damageAssessment: {
              scratches: 2,
              dents: 0,
              creases: 0,
              stains: 1,
              fading: 0,
              totalDamage: 3
            },
            marketImpact: {
              valueMultiplier: 0.85,
              estimatedValue: 850,
              valueRange: {
                min: 800,
                max: 900
              },
              recommendations: [
                '建議在乾燥環境中保存',
                '避免陽光直射',
                '使用專業保護套',
                '定期檢查保存狀況'
              ]
            },
            preservationTips: [
              '使用無酸保護套',
              '存放在乾燥環境中',
              '避免頻繁觸摸',
              '定期檢查保存狀況'
            ],
            restorationSuggestions: [
              '輕微清潔表面',
              '使用專業清潔劑',
              '避免使用化學清潔劑'
            ]
          },
          processingTime: 2.5,
          metadata: {
            analysisMethod: 'AI 視覺分析',
            modelVersion: 'v2.1.0',
            imageQuality: '高質量',
            lightingConditions: '良好'
          }
        }
      };

      setAnalysisResult(mockResult);
      onAnalysisComplete?.(mockResult);
      logger.info('✅ Card condition analysis completed', { cardId });
    } catch (error: any) {
      setError(error.message || '分析失敗');
      logger.error('❌ Card condition analysis failed:', { error: error.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeColors: { [key: string]: string } = {
      'Mint': theme.colors.success,
      'Near Mint': theme.colors.success,
      'Excellent': theme.colors.warning,
      'Good': theme.colors.warning,
      'Light Played': theme.colors.error,
      'Played': theme.colors.error,
      'Poor': theme.colors.error
    };
    return gradeColors[grade] || theme.colors.textSecondary;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.colors.success;
    if (score >= 80) return theme.colors.warning;
    return theme.colors.error;
  };

  const renderFactorItem = (title: string, factor: any) => (
    <View style={styles.factorItem}>
      <View style={styles.factorHeader}>
        <Text style={styles.factorTitle}>{title}</Text>
        <View style={styles.factorScore}>
          <Text style={[styles.scoreText, { color: getScoreColor(factor.score) }]}>
            {factor.score}
          </Text>
          <Text style={styles.scoreLabel}>分</Text>
        </View>
      </View>
      <View style={styles.gradeBadge}>
        <Text style={[styles.gradeText, { color: getGradeColor(factor.grade) }]}>
          {factor.grade}
        </Text>
      </View>
      <View style={styles.detailsContainer}>
        {factor.details.map((detail: string, index: number) => (
          <Text key={index} style={styles.detailText}>
            • {detail}
          </Text>
        ))}
      </View>
    </View>
  );

  const renderDamageAssessment = () => {
    if (!analysisResult?.data.analysis.damageAssessment) return null;

    const damage = analysisResult.data.analysis.damageAssessment;
    const damageItems = [
      { label: '劃痕', value: damage.scratches, color: theme.colors.warning },
      { label: '凹陷', value: damage.dents, color: theme.colors.error },
      { label: '摺痕', value: damage.creases, color: theme.colors.error },
      { label: '污漬', value: damage.stains, color: theme.colors.warning },
      { label: '褪色', value: damage.fading, color: theme.colors.error }
    ];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>損傷評估</Text>
        <View style={styles.damageGrid}>
          {damageItems.map((item, index) => (
            <View key={index} style={styles.damageItem}>
              <Text style={styles.damageLabel}>{item.label}</Text>
              <Text style={[styles.damageValue, { color: item.color }]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.totalDamage}>
          <Text style={styles.totalDamageLabel}>總損傷指數</Text>
          <Text style={[styles.totalDamageValue, { color: getScoreColor(100 - damage.totalDamage) }]}>
            {damage.totalDamage}
          </Text>
        </View>
      </View>
    );
  };

  const renderMarketImpact = () => {
    if (!analysisResult?.data.analysis.marketImpact) return null;

    const impact = analysisResult.data.analysis.marketImpact;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>市場影響</Text>
        <View style={styles.marketImpactGrid}>
          <View style={styles.marketImpactItem}>
            <Text style={styles.marketImpactLabel}>價值倍數</Text>
            <Text style={styles.marketImpactValue}>
              {formatPercentage(impact.valueMultiplier * 100)}
            </Text>
          </View>
          <View style={styles.marketImpactItem}>
            <Text style={styles.marketImpactLabel}>預估價值</Text>
            <Text style={styles.marketImpactValue}>
              {formatCurrency(impact.estimatedValue)}
            </Text>
          </View>
        </View>
        <View style={styles.valueRange}>
          <Text style={styles.valueRangeLabel}>價值範圍</Text>
          <Text style={styles.valueRangeValue}>
            {formatCurrency(impact.valueRange.min)} - {formatCurrency(impact.valueRange.max)}
          </Text>
        </View>
        <View style={styles.recommendationsContainer}>
          <Text style={styles.recommendationsTitle}>建議</Text>
          {impact.recommendations.map((rec, index) => (
            <Text key={index} style={styles.recommendationText}>
              • {rec}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderPreservationTips = () => {
    if (!analysisResult?.data.analysis.preservationTips) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>保存建議</Text>
        {analysisResult.data.analysis.preservationTips.map((tip, index) => (
          <Text key={index} style={styles.tipText}>
            • {tip}
          </Text>
        ))}
      </View>
    );
  };

  if (isAnalyzing) {
    return (
      <Card style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>正在分析卡片條件...</Text>
          <Text style={styles.loadingSubtext}>這可能需要幾秒鐘時間</Text>
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorTitle}>分析失敗</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title="重試"
            onPress={startAnalysis}
            style={styles.retryButton}
          />
        </View>
      </Card>
    );
  }

  if (!analysisResult) {
    return (
      <Card style={styles.container}>
        <View style={styles.startContainer}>
          <View style={styles.cardPreview}>
            {imageUri ? (
              <LazyImage
                uri={imageUri}
                style={styles.cardImage}
                quality="high"
                cachePolicy="both"
              />
            ) : (
              <View style={styles.cardPlaceholder}>
                <Ionicons name="card" size={48} color={theme.colors.textSecondary} />
                <Text style={styles.cardPlaceholderText}>卡片圖片</Text>
              </View>
            )}
          </View>
          <Text style={styles.startTitle}>卡片條件分析</Text>
          <Text style={styles.startSubtext}>
            使用 AI 技術分析卡片的物理條件，評估其價值和保存狀態
          </Text>
          <Button
            title="開始分析"
            onPress={startAnalysis}
            style={styles.startButton}
            icon="analytics"
          />
        </View>
      </Card>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <Card style={styles.container}>
        {/* 分析結果摘要 */}
        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>分析結果</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.overallGrade}>
            <Text style={styles.overallGradeLabel}>整體評級</Text>
            <Text style={[styles.overallGradeValue, { color: getGradeColor(analysisResult.data.analysis.overallGrade) }]}>
              {analysisResult.data.analysis.overallGrade}
            </Text>
            <Text style={[styles.overallScore, { color: getScoreColor(analysisResult.data.analysis.overallScore) }]}>
              {analysisResult.data.analysis.overallScore}/100
            </Text>
          </View>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>分析信心度</Text>
            <View style={styles.confidenceBar}>
              <View
                style={[
                  styles.confidenceFill,
                  {
                    width: `${analysisResult.data.analysis.confidence * 100}%`,
                    backgroundColor: getScoreColor(analysisResult.data.analysis.confidence * 100)
                  }
                ]}
              />
            </View>
            <Text style={styles.confidenceValue}>
              {Math.round(analysisResult.data.analysis.confidence * 100)}%
            </Text>
          </View>
        </View>

        {/* 詳細因素分析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>詳細分析</Text>
          {renderFactorItem('四角狀況', analysisResult.data.analysis.factors.corners)}
          {renderFactorItem('邊緣狀況', analysisResult.data.analysis.factors.edges)}
          {renderFactorItem('表面狀況', analysisResult.data.analysis.factors.surface)}
          {renderFactorItem('居中狀況', analysisResult.data.analysis.factors.centering)}
          {renderFactorItem('印刷品質', analysisResult.data.analysis.factors.printQuality)}
        </View>

        {/* 損傷評估 */}
        {renderDamageAssessment()}

        {/* 市場影響 */}
        {renderMarketImpact()}

        {/* 保存建議 */}
        {renderPreservationTips()}

        {/* 分析元數據 */}
        <View style={styles.metadataSection}>
          <Text style={styles.metadataTitle}>分析信息</Text>
          <Text style={styles.metadataText}>
            分析方法: {analysisResult.data.metadata.analysisMethod}
          </Text>
          <Text style={styles.metadataText}>
            模型版本: {analysisResult.data.metadata.modelVersion}
          </Text>
          <Text style={styles.metadataText}>
            處理時間: {analysisResult.data.processingTime}秒
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  container: {
    margin: theme.spacing.medium,
    padding: theme.spacing.medium
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xlarge
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.medium
  },
  loadingSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xlarge
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.error,
    marginTop: theme.spacing.medium
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.small,
    marginBottom: theme.spacing.medium
  },
  retryButton: {
    marginTop: theme.spacing.medium
  },
  startContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.large
  },
  cardPreview: {
    width: 120,
    height: 160,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    marginBottom: theme.spacing.medium
  },
  cardImage: {
    width: '100%',
    height: '100%'
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardPlaceholderText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small
  },
  startTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.small
  },
  startSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.large,
    paddingHorizontal: theme.spacing.medium
  },
  startButton: {
    width: 200
  },
  summarySection: {
    marginBottom: theme.spacing.large
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text
  },
  closeButton: {
    padding: theme.spacing.small
  },
  overallGrade: {
    alignItems: 'center',
    marginBottom: theme.spacing.medium
  },
  overallGradeLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small
  },
  overallGradeValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: theme.spacing.small
  },
  overallScore: {
    fontSize: 18,
    fontWeight: '600'
  },
  confidenceContainer: {
    alignItems: 'center'
  },
  confidenceLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.small
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: theme.spacing.small
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text
  },
  section: {
    marginBottom: theme.spacing.large
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.medium
  },
  factorItem: {
    marginBottom: theme.spacing.medium,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.medium
  },
  factorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small
  },
  factorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text
  },
  factorScore: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '700'
  },
  scoreLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 2
  },
  gradeBadge: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.small
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  detailsContainer: {
    marginTop: theme.spacing.small
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2
  },
  damageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.medium
  },
  damageItem: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.small,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.small
  },
  damageLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4
  },
  damageValue: {
    fontSize: 18,
    fontWeight: '700'
  },
  totalDamage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium
  },
  totalDamageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.white
  },
  totalDamageValue: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.white
  },
  marketImpactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.medium
  },
  marketImpactItem: {
    flex: 1,
    alignItems: 'center',
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.medium,
    marginHorizontal: 4
  },
  marketImpactLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4
  },
  marketImpactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text
  },
  valueRange: {
    alignItems: 'center',
    marginBottom: theme.spacing.medium
  },
  valueRangeLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4
  },
  valueRangeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text
  },
  recommendationsContainer: {
    marginTop: theme.spacing.medium
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.small
  },
  recommendationText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4
  },
  tipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4
  },
  metadataSection: {
    marginTop: theme.spacing.large,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.medium
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.small
  },
  metadataText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2
  }
});

export default CardConditionAnalysis;
