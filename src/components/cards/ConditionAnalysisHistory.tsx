import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/common/Card';
import { LazyImage } from '@/components/common/LazyImage';
import { theme } from '@/config/theme';
import { CardConditionAnalysisResult } from '@/services/cardService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { logger } from '@/utils/logger';

interface ConditionAnalysisHistoryItem {
  id: string;
  cardId: string;
  cardName: string;
  cardImage?: string;
  analysisResult: CardConditionAnalysisResult;
  createdAt: Date;
  updatedAt: Date;
}

interface ConditionAnalysisHistoryProps {
  onItemPress?: (item: ConditionAnalysisHistoryItem) => void;
  onRefresh?: () => Promise<void>;
}

export const ConditionAnalysisHistory: React.FC<
  ConditionAnalysisHistoryProps
> = ({ onItemPress, onRefresh }) => {
  const [historyItems, setHistoryItems] = useState<
    ConditionAnalysisHistoryItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 模擬加載歷史記錄
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockHistory: ConditionAnalysisHistoryItem[] = [
        {
          id: '1',
          cardId: 'card_001',
          cardName: '青眼白龍',
          cardImage: 'https://example.com/blue-eyes.jpg',
          analysisResult: {
            success: true,
            message: '分析完成',
            data: {
              cardId: 'card_001',
              analysis: {
                overallGrade: 'Near Mint',
                overallScore: 85,
                confidence: 0.92,
                factors: {
                  corners: { score: 90, grade: 'Near Mint', details: [] },
                  edges: { score: 85, grade: 'Near Mint', details: [] },
                  surface: { score: 80, grade: 'Excellent', details: [] },
                  centering: { score: 88, grade: 'Near Mint', details: [] },
                  printQuality: { score: 92, grade: 'Near Mint', details: [] },
                },
                damageAssessment: {
                  scratches: 2,
                  dents: 0,
                  creases: 0,
                  stains: 1,
                  fading: 0,
                  totalDamage: 3,
                },
                marketImpact: {
                  valueMultiplier: 0.85,
                  estimatedValue: 850,
                  valueRange: { min: 800, max: 900 },
                  recommendations: [],
                },
                preservationTips: [],
                restorationSuggestions: [],
              },
              processingTime: 2.5,
              metadata: {
                analysisMethod: 'AI 視覺分析',
                modelVersion: 'v2.1.0',
                imageQuality: '高質量',
                lightingConditions: '良好',
              },
            },
          },
          createdAt: new Date('2024-12-15T10:30:00Z'),
          updatedAt: new Date('2024-12-15T10:30:00Z'),
        },
        {
          id: '2',
          cardId: 'card_002',
          cardName: '黑魔導',
          cardImage: 'https://example.com/dark-magician.jpg',
          analysisResult: {
            success: true,
            message: '分析完成',
            data: {
              cardId: 'card_002',
              analysis: {
                overallGrade: 'Excellent',
                overallScore: 78,
                confidence: 0.88,
                factors: {
                  corners: { score: 75, grade: 'Excellent', details: [] },
                  edges: { score: 80, grade: 'Excellent', details: [] },
                  surface: { score: 75, grade: 'Good', details: [] },
                  centering: { score: 82, grade: 'Excellent', details: [] },
                  printQuality: { score: 85, grade: 'Excellent', details: [] },
                },
                damageAssessment: {
                  scratches: 3,
                  dents: 1,
                  creases: 0,
                  stains: 2,
                  fading: 0,
                  totalDamage: 6,
                },
                marketImpact: {
                  valueMultiplier: 0.78,
                  estimatedValue: 650,
                  valueRange: { min: 600, max: 700 },
                  recommendations: [],
                },
                preservationTips: [],
                restorationSuggestions: [],
              },
              processingTime: 2.8,
              metadata: {
                analysisMethod: 'AI 視覺分析',
                modelVersion: 'v2.1.0',
                imageQuality: '高質量',
                lightingConditions: '良好',
              },
            },
          },
          createdAt: new Date('2024-12-14T15:45:00Z'),
          updatedAt: new Date('2024-12-14T15:45:00Z'),
        },
        {
          id: '3',
          cardId: 'card_003',
          cardName: '真紅眼黑龍',
          cardImage: 'https://example.com/red-eyes.jpg',
          analysisResult: {
            success: true,
            message: '分析完成',
            data: {
              cardId: 'card_003',
              analysis: {
                overallGrade: 'Mint',
                overallScore: 95,
                confidence: 0.96,
                factors: {
                  corners: { score: 98, grade: 'Mint', details: [] },
                  edges: { score: 95, grade: 'Mint', details: [] },
                  surface: { score: 92, grade: 'Near Mint', details: [] },
                  centering: { score: 96, grade: 'Mint', details: [] },
                  printQuality: { score: 98, grade: 'Mint', details: [] },
                },
                damageAssessment: {
                  scratches: 0,
                  dents: 0,
                  creases: 0,
                  stains: 0,
                  fading: 0,
                  totalDamage: 0,
                },
                marketImpact: {
                  valueMultiplier: 0.95,
                  estimatedValue: 1200,
                  valueRange: { min: 1150, max: 1250 },
                  recommendations: [],
                },
                preservationTips: [],
                restorationSuggestions: [],
              },
              processingTime: 2.2,
              metadata: {
                analysisMethod: 'AI 視覺分析',
                modelVersion: 'v2.1.0',
                imageQuality: '高質量',
                lightingConditions: '良好',
              },
            },
          },
          createdAt: new Date('2024-12-13T09:15:00Z'),
          updatedAt: new Date('2024-12-13T09:15:00Z'),
        },
      ];

      setHistoryItems(mockHistory);
      logger.info('✅ Condition analysis history loaded', {
        count: mockHistory.length,
      });
    } catch (error: any) {
      setError(error.message || '加載失敗');
      logger.error('❌ Load condition analysis history failed:', {
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await onRefresh?.();
      await loadHistory();
    } catch (error: any) {
      logger.error('❌ Refresh condition analysis history failed:', {
        error: error.message,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeColors: { [key: string]: string } = {
      Mint: theme.colors.success,
      'Near Mint': theme.colors.success,
      Excellent: theme.colors.warning,
      Good: theme.colors.warning,
      'Light Played': theme.colors.error,
      Played: theme.colors.error,
      Poor: theme.colors.error,
    };
    return gradeColors[grade] || theme.colors.textSecondary;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return theme.colors.success;
    if (score >= 80) return theme.colors.warning;
    return theme.colors.error;
  };

  const renderHistoryItem = ({
    item,
  }: {
    item: ConditionAnalysisHistoryItem;
  }) => {
    const { analysis } = item.analysisResult.data;

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => onItemPress?.(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <View style={styles.cardInfo}>
            <View style={styles.cardImageContainer}>
              {item.cardImage ? (
                <LazyImage
                  uri={item.cardImage}
                  style={styles.cardImage}
                  quality="low"
                  cachePolicy="both"
                />
              ) : (
                <View style={styles.cardPlaceholder}>
                  <Ionicons
                    name="card"
                    size={24}
                    color={theme.colors.textSecondary}
                  />
                </View>
              )}
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.cardName} numberOfLines={1}>
                {item.cardName}
              </Text>
              <Text style={styles.analysisDate}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.analysisSummary}>
            <View style={styles.gradeContainer}>
              <Text
                style={[
                  styles.gradeText,
                  { color: getGradeColor(analysis.overallGrade) },
                ]}
              >
                {analysis.overallGrade}
              </Text>
            </View>
            <Text
              style={[
                styles.scoreText,
                { color: getScoreColor(analysis.overallScore) },
              ]}
            >
              {analysis.overallScore}/100
            </Text>
          </View>
        </View>

        <View style={styles.itemDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>預估價值:</Text>
            <Text style={styles.detailValue}>
              {formatCurrency(analysis.marketImpact.estimatedValue)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>信心度:</Text>
            <Text style={styles.detailValue}>
              {Math.round(analysis.confidence * 100)}%
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>損傷指數:</Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color: getScoreColor(
                    100 - analysis.damageAssessment.totalDamage
                  ),
                },
              ]}
            >
              {analysis.damageAssessment.totalDamage}
            </Text>
          </View>
        </View>

        <View style={styles.itemActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye" size={16} color={theme.colors.primary} />
            <Text style={styles.actionText}>查看詳情</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons
              name="share"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.actionText}>分享</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="analytics" size={64} color={theme.colors.textSecondary} />
      <Text style={styles.emptyTitle}>暫無分析記錄</Text>
      <Text style={styles.emptySubtext}>
        您還沒有進行過卡片條件分析，開始分析您的第一張卡片吧！
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle" size={48} color={theme.colors.error} />
      <Text style={styles.errorTitle}>加載失敗</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
        <Text style={styles.retryButtonText}>重試</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>加載分析記錄...</Text>
      </View>
    );
  }

  if (error) {
    return renderErrorState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>條件分析記錄</Text>
        <Text style={styles.subtitle}>共 {historyItems.length} 條記錄</Text>
      </View>

      <FlatList
        data={historyItems}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  listContainer: {
    padding: theme.spacing.medium,
  },
  historyItem: {
    backgroundColor: theme.colors.backgroundPaper,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    ...theme.shadows.small,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.medium,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardImageContainer: {
    width: 60,
    height: 80,
    borderRadius: theme.borderRadius.small,
    overflow: 'hidden',
    marginRight: theme.spacing.medium,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardDetails: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xsmall,
  },
  analysisDate: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  analysisSummary: {
    alignItems: 'flex-end',
  },
  gradeContainer: {
    marginBottom: theme.spacing.xsmall,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDetails: {
    marginBottom: theme.spacing.medium,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xsmall,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.medium,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.small,
  },
  actionText: {
    fontSize: 12,
    marginLeft: theme.spacing.xsmall,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xlarge,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.large,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xlarge,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.error,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.medium,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.large,
    paddingVertical: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ConditionAnalysisHistory;
