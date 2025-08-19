import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LazyImage } from '@/components/common/LazyImage';
import { theme } from '@/config/theme';
import { enhancedAIService } from '@/services/enhancedAIService';
import {
  EnhancedRecognitionResult,
  EnhancedConditionAnalysisResult,
  EnhancedAuthenticityResult,
  EnhancedPricePredictionResult
} from '@/services/enhancedAIService';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

const { width } = Dimensions.get('window');

interface EnhancedCardAnalysisProps {
  imageUri?: string;
  onAnalysisComplete?: (results: any) => void;
  onClose?: () => void;
}

export const EnhancedCardAnalysis: React.FC<EnhancedCardAnalysisProps> = ({
  imageUri,
  onAnalysisComplete,
  onClose
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'recognition' | 'condition' | 'authenticity' | 'prediction' | 'complete'>('recognition');
  const [results, setResults] = useState<{
    recognition?: EnhancedRecognitionResult;
    conditionAnalysis?: EnhancedConditionAnalysisResult;
    authenticityVerification?: EnhancedAuthenticityResult;
    pricePrediction?: EnhancedPricePredictionResult;
  }>({});
  const [error, setError] = useState<string | null>(null);

  const startComprehensiveAnalysis = async () => {
    if (!imageUri) {
      Alert.alert('錯誤', '請先選擇卡片圖片');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      setCurrentStep('recognition');

      // 轉換圖片為base64
      const base64Image = await convertImageToBase64(imageUri);

      // 執行綜合分析
      const comprehensiveResults = await enhancedAIService.comprehensiveAnalysis(base64Image, {
        recognition: {
          confidenceThreshold: 0.9,
          useMultiModel: true,
          imagePreprocessing: true
        },
        conditionAnalysis: {
          useAdvancedMetrics: true,
          includeUVInspection: true,
          includeMicroscopicAnalysis: true
        },
        authenticityVerification: {
          useBlockchainVerification: true,
          includeHologramAnalysis: true,
          includePrintingAnalysis: true,
          includeMaterialAnalysis: true
        },
        pricePrediction: {
          useEnsembleModels: true,
          includeMarketSentiment: true,
          includeCompetitiveAnalysis: true,
          includeSeasonalFactors: true,
          includeEventImpact: true
        }
      });

      setResults(comprehensiveResults);
      setCurrentStep('complete');

      if (onAnalysisComplete) {
        onAnalysisComplete(comprehensiveResults);
      }

      logger.info('增強版綜合分析完成', {
        recognitionConfidence: comprehensiveResults.recognition.data.confidence,
        conditionScore: comprehensiveResults.conditionAnalysis.data.analysis.overallScore,
        authenticityScore: comprehensiveResults.authenticityVerification.data.authenticity.score,
        predictionConfidence: comprehensiveResults.pricePrediction.data.predictions[0]?.confidence
      });

    } catch (error: any) {
      setError(error.message);
      logger.error('增強版綜合分析失敗:', { error: error.message });
      Alert.alert('分析失敗', error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    // 這裡應該實現圖片轉base64的邏輯
    // 暫時返回模擬數據
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...';
  };

  const renderRecognitionResult = () => {
    if (!results.recognition) return null;

    const { data } = results.recognition;

    return (
      <View style={styles.resultSection}>
        <Text style={styles.sectionTitle}>🎯 智能識別結果</Text>
        <View style={styles.resultCard}>
          <Text style={styles.cardName}>{data.recognizedCard.name}</Text>
          <Text style={styles.confidenceText}>
            識別信心度: {formatPercentage(data.confidence * 100)}
          </Text>

          <View style={styles.featuresContainer}>
            <Text style={styles.featuresTitle}>圖像特徵分析:</Text>
            <Text>• 卡片類型: {data.imageFeatures.cardType}</Text>
            <Text>• 稀有度: {data.imageFeatures.rarity}</Text>
            <Text>• 圖片品質: {data.imageFeatures.qualityScore}/100</Text>
            <Text>• 主要顏色: {data.imageFeatures.dominantColors.join(', ')}</Text>
          </View>

          {data.alternatives.length > 0 && (
            <View style={styles.alternativesContainer}>
              <Text style={styles.alternativesTitle}>其他可能選項:</Text>
              {data.alternatives.slice(0, 3).map((alt, index) => (
                <Text key={index} style={styles.alternativeItem}>
                  {alt.card.name} ({formatPercentage(alt.confidence * 100)})
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderConditionAnalysis = () => {
    if (!results.conditionAnalysis) return null;

    const { data } = results.conditionAnalysis;
    const { analysis } = data;

    return (
      <View style={styles.resultSection}>
        <Text style={styles.sectionTitle}>🔍 條件分析結果</Text>
        <View style={styles.resultCard}>
          <View style={styles.gradeContainer}>
            <Text style={styles.gradeText}>{analysis.overallGrade}</Text>
            <Text style={styles.scoreText}>{analysis.overallScore}/100</Text>
          </View>

          <Text style={styles.confidenceText}>
            分析信心度: {formatPercentage(analysis.confidence * 100)}
          </Text>

          <View style={styles.factorsContainer}>
            <Text style={styles.factorsTitle}>詳細評估:</Text>
            {Object.entries(analysis.factors).map(([key, factor]) => (
              <View key={key} style={styles.factorItem}>
                <Text style={styles.factorName}>{getFactorDisplayName(key)}</Text>
                <Text style={styles.factorScore}>{factor.score}/100 - {factor.grade}</Text>
              </View>
            ))}
          </View>

          {analysis.advancedMetrics && (
            <View style={styles.advancedMetricsContainer}>
              <Text style={styles.advancedMetricsTitle}>高級指標:</Text>
              <Text>• 結構完整性: {analysis.advancedMetrics.structuralIntegrity}/100</Text>
              <Text>• 美觀度: {analysis.advancedMetrics.aestheticAppeal}/100</Text>
              <Text>• 收藏價值: {analysis.advancedMetrics.collectibilityScore}/100</Text>
              <Text>• 投資潛力: {analysis.advancedMetrics.investmentPotential}/100</Text>
            </View>
          )}

          <View style={styles.marketImpactContainer}>
            <Text style={styles.marketImpactTitle}>市場影響:</Text>
            <Text>• 預估價值: {formatCurrency(analysis.marketImpact.estimatedValue)}</Text>
            <Text>• 價值範圍: {formatCurrency(analysis.marketImpact.valueRange.min)} - {formatCurrency(analysis.marketImpact.valueRange.max)}</Text>
            <Text>• 價值倍數: {analysis.marketImpact.valueMultiplier}x</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAuthenticityVerification = () => {
    if (!results.authenticityVerification) return null;

    const { data } = results.authenticityVerification;
    const { authenticity } = data;

    return (
      <View style={styles.resultSection}>
        <Text style={styles.sectionTitle}>🛡️ 真偽驗證結果</Text>
        <View style={styles.resultCard}>
          <View style={styles.authenticityContainer}>
            <Ionicons
              name={authenticity.score > 0.8 ? 'checkmark-circle' : 'close-circle'}
              size={48}
              color={authenticity.score > 0.8 ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.authenticityText, { color: authenticity.score > 0.8 ? theme.colors.success : theme.colors.error }]}>
              {authenticity.score > 0.8 ? '真品' : '疑似仿品'}
            </Text>
          </View>

          <Text style={styles.confidenceText}>
            驗證信心度: {formatPercentage(authenticity.confidence * 100)}
          </Text>

          <View style={styles.verificationMethodsContainer}>
            <Text style={styles.verificationMethodsTitle}>驗證方法:</Text>
            {Object.entries(authenticity.verificationMethods).map(([method, result]) => (
              <View key={method} style={styles.verificationMethodItem}>
                <Text style={styles.verificationMethodName}>{getVerificationMethodDisplayName(method)}</Text>
                <Text style={[styles.verificationMethodResult, { color: result.isAuthentic ? theme.colors.success : theme.colors.error }]}>
                  {result.isAuthentic ? '通過' : '未通過'} ({formatPercentage(result.confidence * 100)})
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.riskFactorsContainer}>
            <Text style={styles.riskFactorsTitle}>風險因素:</Text>
            {authenticity.factors.map((factor, index) => (
              <Text key={index} style={styles.riskFactorItem}>• {factor}</Text>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderPricePrediction = () => {
    if (!results.pricePrediction) return null;

    const { data } = results.pricePrediction;

    return (
      <View style={styles.resultSection}>
        <Text style={styles.sectionTitle}>📈 價格預測結果</Text>
        <View style={styles.resultCard}>
          <View style={styles.predictionsContainer}>
            <Text style={styles.predictionsTitle}>價格預測:</Text>
            {data.predictions.map((prediction, index) => (
              <View key={index} style={styles.predictionItem}>
                <Text style={styles.predictionTimeframe}>{prediction.timeframe}</Text>
                <Text style={styles.predictionPrice}>{formatCurrency(prediction.predictedPrice)}</Text>
                <Text style={[styles.predictionTrend, { color: getTrendColor(prediction.trend) }]}>
                  {getTrendDisplayName(prediction.trend)} ({formatPercentage(prediction.confidence * 100)})
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.marketAnalysisContainer}>
            <Text style={styles.marketAnalysisTitle}>市場分析:</Text>
            <Text>• 市場情緒: {getSentimentDisplayName(data.marketAnalysis.sentiment)}</Text>
            <Text>• 強度: {data.marketAnalysis.strength}</Text>
            <Text>• 關鍵驅動因素: {data.marketAnalysis.keyDrivers.join(', ')}</Text>
          </View>

          {data.ensembleModels && (
            <View style={styles.ensembleModelsContainer}>
              <Text style={styles.ensembleModelsTitle}>集成模型預測:</Text>
              <Text>• 共識預測: {formatCurrency(data.ensembleModels.consensusPrediction)}</Text>
              <Text>• 模型一致性: {formatPercentage(data.ensembleModels.modelAgreement * 100)}</Text>
            </View>
          )}

          <View style={styles.accuracyMetricsContainer}>
            <Text style={styles.accuracyMetricsTitle}>準確度指標:</Text>
            <Text>• 歷史準確度: {formatPercentage(data.metadata.accuracyMetrics.historicalAccuracy * 100)}</Text>
            <Text>• 預測誤差: {formatPercentage(data.metadata.accuracyMetrics.predictionError * 100)}</Text>
            <Text>• 信心校準: {formatPercentage(data.metadata.accuracyMetrics.confidenceCalibration * 100)}</Text>
          </View>
        </View>
      </View>
    );
  };

  const getFactorDisplayName = (key: string): string => {
    const factorNames: Record<string, string> = {
      corners: '四角狀況',
      edges: '邊緣狀況',
      surface: '表面狀況',
      centering: '居中狀況',
      printQuality: '印刷品質'
    };
    return factorNames[key] || key;
  };

  const getVerificationMethodDisplayName = (method: string): string => {
    const methodNames: Record<string, string> = {
      hologramAnalysis: '全息圖分析',
      printingAnalysis: '印刷分析',
      materialAnalysis: '材料分析',
      blockchainVerification: '區塊鏈驗證'
    };
    return methodNames[method] || method;
  };

  const getTrendColor = (trend: string): string => {
    switch (trend) {
      case 'up': return theme.colors.success;
      case 'down': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getTrendDisplayName = (trend: string): string => {
    switch (trend) {
      case 'up': return '上漲';
      case 'down': return '下跌';
      default: return '穩定';
    }
  };

  const getSentimentDisplayName = (sentiment: string): string => {
    switch (sentiment) {
      case 'bullish': return '看漲';
      case 'bearish': return '看跌';
      default: return '中性';
    }
  };

  if (isAnalyzing) {
    return (
      <Card style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>正在進行增強版AI分析...</Text>
          <Text style={styles.stepText}>
            {currentStep === 'recognition' && '🎯 智能識別中...'}
            {currentStep === 'condition' && '🔍 條件分析中...'}
            {currentStep === 'authenticity' && '🛡️ 真偽驗證中...'}
            {currentStep === 'prediction' && '📈 價格預測中...'}
          </Text>
        </View>
      </Card>
    );
  }

  if (error) {
    return (
      <Card style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
          <Text style={styles.errorText}>分析失敗</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button title="重試" onPress={startComprehensiveAnalysis} style={styles.retryButton} />
        </View>
      </Card>
    );
  }

  if (!results.recognition) {
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
          <Text style={styles.startTitle}>增強版AI綜合分析</Text>
          <Text style={styles.startSubtext}>
            使用最先進的AI技術，同時進行卡片識別、條件分析、真偽驗證和價格預測
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>🎯 多模型融合識別</Text>
            <Text style={styles.featureItem}>🔍 高級條件分析</Text>
            <Text style={styles.featureItem}>🛡️ 多重真偽驗證</Text>
            <Text style={styles.featureItem}>📈 集成價格預測</Text>
          </View>
          <Button
            title="開始綜合分析"
            onPress={startComprehensiveAnalysis}
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>增強版AI分析結果</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {renderRecognitionResult()}
        {renderConditionAnalysis()}
        {renderAuthenticityVerification()}
        {renderPricePrediction()}

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>📊 分析總結</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryItem}>
              • 識別準確度: {formatPercentage(results.recognition?.data.confidence * 100 || 0)}
            </Text>
            <Text style={styles.summaryItem}>
              • 條件評級: {results.conditionAnalysis?.data.analysis.overallGrade || 'N/A'}
            </Text>
            <Text style={styles.summaryItem}>
              • 真偽評分: {formatPercentage(results.authenticityVerification?.data.authenticity.score * 100 || 0)}
            </Text>
            <Text style={styles.summaryItem}>
              • 預測信心度: {formatPercentage(results.pricePrediction?.data.predictions[0]?.confidence * 100 || 0)}
            </Text>
          </View>
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
    margin: 16,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text
  },
  closeButton: {
    padding: 8
  },
  startContainer: {
    alignItems: 'center',
    padding: 20
  },
  cardPreview: {
    width: 200,
    height: 280,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: theme.colors.surface
  },
  cardImage: {
    width: '100%',
    height: '100%'
  },
  cardPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface
  },
  cardPlaceholderText: {
    marginTop: 8,
    color: theme.colors.textSecondary
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  startSubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24
  },
  featuresList: {
    marginBottom: 20
  },
  featureItem: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center'
  },
  startButton: {
    width: '100%'
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8
  },
  stepText: {
    fontSize: 16,
    color: theme.colors.textSecondary
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.error,
    marginTop: 16,
    marginBottom: 8
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20
  },
  retryButton: {
    width: 120
  },
  resultSection: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12
  },
  resultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  cardName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8
  },
  confidenceText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 12
  },
  featuresContainer: {
    marginBottom: 12
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  alternativesContainer: {
    marginBottom: 12
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  alternativeItem: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4
  },
  gradeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  gradeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text
  },
  factorsContainer: {
    marginBottom: 12
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  factorName: {
    fontSize: 14,
    color: theme.colors.text
  },
  factorScore: {
    fontSize: 14,
    color: theme.colors.textSecondary
  },
  advancedMetricsContainer: {
    marginBottom: 12
  },
  advancedMetricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  marketImpactContainer: {
    marginBottom: 12
  },
  marketImpactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  authenticityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  authenticityText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12
  },
  verificationMethodsContainer: {
    marginBottom: 12
  },
  verificationMethodsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  verificationMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  verificationMethodName: {
    fontSize: 14,
    color: theme.colors.text
  },
  verificationMethodResult: {
    fontSize: 14,
    fontWeight: '600'
  },
  riskFactorsContainer: {
    marginBottom: 12
  },
  riskFactorsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  riskFactorItem: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4
  },
  predictionsContainer: {
    marginBottom: 12
  },
  predictionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.background,
    borderRadius: 8
  },
  predictionTimeframe: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text
  },
  predictionPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary
  },
  predictionTrend: {
    fontSize: 14,
    fontWeight: '600'
  },
  marketAnalysisContainer: {
    marginBottom: 12
  },
  marketAnalysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  ensembleModelsContainer: {
    marginBottom: 12
  },
  ensembleModelsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  accuracyMetricsContainer: {
    marginBottom: 12
  },
  accuracyMetricsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8
  },
  summaryContainer: {
    marginTop: 20
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 12
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  summaryItem: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 8
  }
});
