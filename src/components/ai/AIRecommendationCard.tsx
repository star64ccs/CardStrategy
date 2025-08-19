import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { Avatar } from '../common/Avatar';

interface RecommendationCard {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  currentPrice: number;
  predictedPrice: number;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeHorizon: 'short' | 'medium' | 'long';
  reasoning: string[];
  marketTrend: 'bullish' | 'bearish' | 'neutral';
  lastUpdated: string;
}

interface AIRecommendationCardProps {
  recommendation: RecommendationCard;
  userBudget: number;
  onViewDetails: (card: RecommendationCard) => void;
  onAddToWishlist: (cardId: string) => void;
  onBuyNow: (card: RecommendationCard) => void;
  onDismiss: (cardId: string) => void;
  onShare: (card: RecommendationCard) => void;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  recommendation,
  userBudget,
  onViewDetails,
  onAddToWishlist,
  onBuyNow,
  onDismiss,
  onShare
}) => {
  const [expanded, setExpanded] = useState(false);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    }
    if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    }
    return `$${price.toFixed(2)}`;
  };

  const getRiskColor = (risk: string) => {
    const riskColors = {
      low: theme.colors.status.success,
      medium: theme.colors.status.warning,
      high: theme.colors.status.error
    };
    return riskColors[risk as keyof typeof riskColors];
  };

  const getRiskLabel = (risk: string) => {
    const riskLabels = {
      low: '低風險',
      medium: '中風險',
      high: '高風險'
    };
    return riskLabels[risk as keyof typeof riskLabels];
  };

  const getTimeHorizonLabel = (horizon: string) => {
    const horizonLabels = {
      short: '短期 (1-3個月)',
      medium: '中期 (3-12個月)',
      long: '長期 (1年以上)'
    };
    return horizonLabels[horizon as keyof typeof horizonLabels];
  };

  const getMarketTrendIcon = (trend: string) => {
    const trendIcons = {
      bullish: 'trending-up',
      bearish: 'trending-down',
      neutral: 'remove'
    };
    return trendIcons[trend as keyof typeof trendIcons];
  };

  const getMarketTrendColor = (trend: string) => {
    const trendColors = {
      bullish: theme.colors.status.success,
      bearish: theme.colors.status.error,
      neutral: theme.colors.text.secondary
    };
    return trendColors[trend as keyof typeof trendColors];
  };

  const getMarketTrendLabel = (trend: string) => {
    const trendLabels = {
      bullish: '看漲',
      bearish: '看跌',
      neutral: '持平'
    };
    return trendLabels[trend as keyof typeof trendLabels];
  };

  const priceChange = recommendation.predictedPrice - recommendation.currentPrice;
  const priceChangePercent = (priceChange / recommendation.currentPrice) * 100;
  const isAffordable = recommendation.currentPrice <= userBudget;

  return (
    <Card style={styles.container} variant="elevated">
      {/* 卡片標題和基本信息 */}
      <View style={styles.header}>
        <View style={styles.cardInfo}>
          <Avatar
            source={recommendation.imageUrl}
            size="medium"
            variant="rounded"
          />
          <View style={styles.cardDetails}>
            <Text style={styles.cardName} numberOfLines={2}>
              {recommendation.name}
            </Text>
            <Badge
              text={recommendation.rarity}
              variant="gold"
              size="small"
            />
          </View>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onShare(recommendation)}
          >
            <Ionicons name="share-outline" size={20} color={theme.colors.gold.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDismiss(recommendation.id)}
          >
            <Ionicons name="close" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 價格信息 */}
      <View style={styles.priceSection}>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>當前價格:</Text>
          <Text style={styles.currentPrice}>
            {formatPrice(recommendation.currentPrice)}
          </Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>預測價格:</Text>
          <Text style={[styles.predictedPrice, { color: priceChange >= 0 ? theme.colors.status.success : theme.colors.status.error }]}>
            {formatPrice(recommendation.predictedPrice)}
          </Text>
        </View>
        <View style={styles.priceChange}>
          <Ionicons
            name={priceChange >= 0 ? 'trending-up' : 'trending-down'}
            size={16}
            color={priceChange >= 0 ? theme.colors.status.success : theme.colors.status.error}
          />
          <Text style={[styles.priceChangeText, { color: priceChange >= 0 ? theme.colors.status.success : theme.colors.status.error }]}>
            {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%)
          </Text>
        </View>
      </View>

      {/* AI 信心度和風險評估 */}
      <View style={styles.analysisSection}>
        <View style={styles.analysisRow}>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>AI 信心度</Text>
            <ProgressBar
              progress={recommendation.confidence}
              variant="gold"
              size="small"
              showLabel
            />
          </View>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>風險等級</Text>
            <Badge
              text={getRiskLabel(recommendation.riskLevel)}
              variant="default"
              size="small"
              style={{ backgroundColor: getRiskColor(recommendation.riskLevel) }}
            />
          </View>
        </View>
        <View style={styles.analysisRow}>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>投資時長</Text>
            <Text style={styles.analysisValue}>
              {getTimeHorizonLabel(recommendation.timeHorizon)}
            </Text>
          </View>
          <View style={styles.analysisItem}>
            <Text style={styles.analysisLabel}>市場趨勢</Text>
            <View style={styles.trendContainer}>
              <Ionicons
                name={getMarketTrendIcon(recommendation.marketTrend)}
                size={16}
                color={getMarketTrendColor(recommendation.marketTrend)}
              />
              <Text style={[styles.trendText, { color: getMarketTrendColor(recommendation.marketTrend) }]}>
                {getMarketTrendLabel(recommendation.marketTrend)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 推薦理由 */}
      <TouchableOpacity
        style={styles.reasoningSection}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.reasoningHeader}>
          <Text style={styles.reasoningTitle}>推薦理由</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.colors.gold.primary}
          />
        </View>
        {expanded && (
          <View style={styles.reasoningContent}>
            {recommendation.reasoning.map((reason, index) => (
              <View key={index} style={styles.reasoningItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={theme.colors.status.success}
                />
                <Text style={styles.reasoningText}>{reason}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>

      {/* 操作按鈕 */}
      <View style={styles.actionsSection}>
        <Button
          title="查看詳情"
          onPress={() => onViewDetails(recommendation)}
          variant="secondary"
          size="medium"
          leftIcon="eye-outline"
        />
        <Button
          title="加入願望清單"
          onPress={() => onAddToWishlist(recommendation.id)}
          variant="ghost"
          size="medium"
          leftIcon="heart-outline"
        />
        <Button
          title={isAffordable ? '立即購買' : '超出預算'}
          onPress={() => isAffordable && onBuyNow(recommendation)}
          variant={isAffordable ? 'primary' : 'ghost'}
          size="medium"
          leftIcon={isAffordable ? 'cart-outline' : 'alert-circle-outline'}
          disabled={!isAffordable}
        />
      </View>

      {/* 更新時間 */}
      <Text style={styles.updateTime}>
        最後更新: {new Date(recommendation.lastUpdated).toLocaleString('zh-TW')}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md
  },
  cardInfo: {
    flexDirection: 'row',
    flex: 1
  },
  cardDetails: {
    marginLeft: theme.spacing.sm,
    flex: 1
  },
  cardName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  headerActions: {
    flexDirection: 'row'
  },
  actionButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.background.secondary
  },
  priceSection: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs
  },
  priceLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary
  },
  currentPrice: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary
  },
  predictedPrice: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold
  },
  priceChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs
  },
  priceChangeText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    marginLeft: theme.spacing.xs
  },
  analysisSection: {
    marginBottom: theme.spacing.md
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md
  },
  analysisItem: {
    flex: 1,
    marginHorizontal: theme.spacing.xs
  },
  analysisLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  analysisValue: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.weights.medium
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  trendText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.medium,
    marginLeft: theme.spacing.xs
  },
  reasoningSection: {
    marginBottom: theme.spacing.md
  },
  reasoningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm
  },
  reasoningTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary
  },
  reasoningContent: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md
  },
  reasoningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm
  },
  reasoningText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: theme.typography.lineHeights.normal
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md
  },
  updateTime: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.text.tertiary,
    textAlign: 'center'
  }
});
