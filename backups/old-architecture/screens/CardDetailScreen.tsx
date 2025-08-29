import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { cardService, Card } from '../services/cardService';
import { portfolioService } from '../services/portfolioService';
import { aiService } from '../services/aiService';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../config/theme';
import { logger } from '../utils/logger';

const { width } = Dimensions.get('window');

interface CardDetailScreenProps {
  cardId: string;
  onClose: () => void;
  onAddToPortfolio: (card: Card) => void;
}

const CardDetailScreen: React.FC<CardDetailScreenProps> = ({
  cardId,
  onClose,
  onAddToPortfolio,
}) => {
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadCardDetail();
  }, [cardId]);

  const loadCardDetail = async () => {
    try {
      setIsLoading(true);
      const response = await cardService.getCardDetail(cardId);

      if (response.success && response.data.card) {
        setCard(response.data.card);
        // 自動獲取 AI 分析
        getAIAnalysis(response.data.card);
      } else {
        Alert.alert('錯誤', '無法載入卡片詳情');
      }
    } catch (error) {
      logger.error('載入卡片詳情失敗:', { error });
      Alert.alert('錯誤', '載入卡片詳情時發生錯誤');
    } finally {
      setIsLoading(false);
    }
  };

  const getAIAnalysis = async (cardData: Card) => {
    try {
      setIsAnalyzing(true);
      const response = await aiService.analyzeCard(cardData.id);

      if (response.success) {
        setAiAnalysis(response.data.analysis);
      }
    } catch (error) {
      logger.error('AI 分析失敗:', { error });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToPortfolio = () => {
    if (!card) return;

    Alert.prompt(
      '加入投資組合',
      '請輸入購買數量和價格',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '確定',
          onPress: (quantity, price) => {
            if (quantity && price) {
              const qty = parseInt(quantity);
              const prc = parseFloat(price);

              if (isNaN(qty) || isNaN(prc)) {
                Alert.alert('錯誤', '請輸入有效的數量和價格');
                return;
              }

              portfolioService.addToPortfolio(
                card,
                qty,
                prc,
                '從卡片詳情頁面添加'
              );
              onAddToPortfolio(card);
              Alert.alert('成功', '已加入投資組合！');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>載入中...</Text>
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>卡片不存在</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>關閉</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 頂部導航 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>卡片詳情</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>分享</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 卡片圖片 */}
        <View style={styles.cardImageContainer}>
          <View style={styles.cardImage}>
            <Text style={styles.cardImagePlaceholder}>🎴</Text>
          </View>
        </View>

        {/* 卡片基本信息 */}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{card.name}</Text>
          <Text style={styles.cardSetName}>{card.setName}</Text>
          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>稀有度</Text>
              <Text style={styles.metaValue}>{card.rarity}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>類型</Text>
              <Text style={styles.metaValue}>{card.type}</Text>
            </View>
          </View>
        </View>

        {/* 價格信息 */}
        <View style={styles.priceSection}>
          <Text style={styles.sectionTitle}>💰 價格信息</Text>
          <View style={styles.priceCard}>
            <View style={styles.currentPrice}>
              <Text style={styles.priceLabel}>當前價格</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(card.price.current)}
              </Text>
            </View>
            <View style={styles.priceChanges}>
              <View style={styles.priceChange}>
                <Text style={styles.changeLabel}>24小時</Text>
                <Text
                  style={[
                    styles.changeValue,
                    {
                      color:
                        card.price.change24h >= 0
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {formatPercentage(card.price.change24h)}
                </Text>
              </View>
              <View style={styles.priceChange}>
                <Text style={styles.changeLabel}>7天</Text>
                <Text
                  style={[
                    styles.changeValue,
                    {
                      color:
                        card.price.change7d >= 0
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {formatPercentage(card.price.change7d)}
                </Text>
              </View>
              <View style={styles.priceChange}>
                <Text style={styles.changeLabel}>30天</Text>
                <Text
                  style={[
                    styles.changeValue,
                    {
                      color:
                        card.price.change30d >= 0
                          ? colors.success
                          : colors.error,
                    },
                  ]}
                >
                  {formatPercentage(card.price.change30d)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 市場數據 */}
        <View style={styles.marketSection}>
          <Text style={styles.sectionTitle}>📊 市場數據</Text>
          <View style={styles.marketCard}>
            <View style={styles.marketItem}>
              <Text style={styles.marketLabel}>24小時交易量</Text>
              <Text style={styles.marketValue}>
                {formatCurrency(card.marketData.volume24h)}
              </Text>
            </View>
            <View style={styles.marketItem}>
              <Text style={styles.marketLabel}>總供應量</Text>
              <Text style={styles.marketValue}>
                {card.marketData.totalSupply.toLocaleString()}
              </Text>
            </View>
            <View style={styles.marketItem}>
              <Text style={styles.marketLabel}>流通供應量</Text>
              <Text style={styles.marketValue}>
                {card.marketData.circulatingSupply.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* 卡片統計 */}
        {card.stats && (card.stats.attack || card.stats.defense) && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>⚔️ 卡片統計</Text>
            <View style={styles.statsCard}>
              {card.stats.attack && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>攻擊力</Text>
                  <Text style={styles.statValue}>{card.stats.attack}</Text>
                </View>
              )}
              {card.stats.defense && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>防禦力</Text>
                  <Text style={styles.statValue}>{card.stats.defense}</Text>
                </View>
              )}
              {card.stats.health && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>生命值</Text>
                  <Text style={styles.statValue}>{card.stats.health}</Text>
                </View>
              )}
              {card.stats.mana && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>法力值</Text>
                  <Text style={styles.statValue}>{card.stats.mana}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 卡片描述 */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>📝 卡片描述</Text>
          <View style={styles.descriptionCard}>
            <Text style={styles.descriptionText}>{card.description}</Text>
          </View>
        </View>

        {/* 標籤 */}
        {card.tags && card.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionTitle}>🏷️ 標籤</Text>
            <View style={styles.tagsContainer}>
              {card.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI 分析 */}
        <View style={styles.aiSection}>
          <Text style={styles.sectionTitle}>🤖 AI 分析</Text>
          <View style={styles.aiCard}>
            {isAnalyzing ? (
              <Text style={styles.analyzingText}>AI 正在分析中...</Text>
            ) : aiAnalysis ? (
              <Text style={styles.aiAnalysisText}>{aiAnalysis}</Text>
            ) : (
              <Text style={styles.noAnalysisText}>暫無 AI 分析</Text>
            )}
          </View>
        </View>

        {/* 底部間距 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 底部操作按鈕 */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.addToPortfolioButton}
          onPress={handleAddToPortfolio}
        >
          <Text style={styles.addToPortfolioButtonText}>💎 加入投資組合</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginBottom: spacing.large,
  },
  closeButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: borderRadius.medium,
  },
  closeButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    backgroundColor: colors.backgroundPaper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.small,
  },
  backButtonText: {
    color: colors.accent,
    fontSize: typography.fontSize.base,
    fontWeight: '500' as const,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  shareButton: {
    padding: spacing.small,
  },
  shareButtonText: {
    color: colors.accent,
    fontSize: typography.fontSize.base,
    fontWeight: '500' as const,
  },
  content: {
    flex: 1,
  },
  cardImageContainer: {
    alignItems: 'center',
    paddingVertical: spacing.large,
  },
  cardImage: {
    width: width * 0.8,
    height: width * 1.2,
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  cardImagePlaceholder: {
    fontSize: 80,
  },
  cardInfo: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  cardName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700' as const,
    color: colors.textPrimary,
    marginBottom: spacing.small,
  },
  cardSetName: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.medium,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: spacing.large,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xsmall,
  },
  metaValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  priceSection: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.medium,
  },
  priceCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    ...shadows.base,
  },
  currentPrice: {
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  priceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
  priceValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  priceChanges: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceChange: {
    alignItems: 'center',
  },
  changeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xsmall,
  },
  changeValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
  },
  marketSection: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  marketCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    ...shadows.base,
  },
  marketItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  marketLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  marketValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  statsSection: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  statsCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    ...shadows.base,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  descriptionSection: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  descriptionCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    ...shadows.base,
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  tagsSection: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  tag: {
    backgroundColor: `${colors.accent}20`,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.medium,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    color: colors.accent,
    fontWeight: '500' as const,
  },
  aiSection: {
    paddingHorizontal: spacing.large,
    marginBottom: spacing.xlarge,
  },
  aiCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.large,
    padding: spacing.large,
    ...shadows.base,
  },
  analyzingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  aiAnalysisText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  noAnalysisText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: spacing.xlarge,
  },
  bottomActions: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addToPortfolioButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.medium,
    paddingVertical: spacing.medium,
    alignItems: 'center',
    ...shadows.sm,
  },
  addToPortfolioButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
  },
});

export default CardDetailScreen;
