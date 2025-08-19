import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/designSystem';
import { Card } from '../common/Card';

interface CardItemProps {
  card: {
    id: string;
    name: string;
    setName: string;
    cardNumber: string;
    rarity: string;
    imageUrl: string;
    estimatedValue?: number;
    condition?: string;
  };
  onPress?: () => void;
  showValue?: boolean;
  showCondition?: boolean;
  variant?: 'compact' | 'detailed' | 'premium';
}

const { width } = Dimensions.get('window');

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onPress,
  showValue = true,
  showCondition = true,
  variant = 'detailed'
}) => {
  const getRarityColor = (rarity: string) => {
    const rarityMap: Record<string, string> = {
      common: theme.colors.rarity.common,
      uncommon: theme.colors.rarity.uncommon,
      rare: theme.colors.rarity.rare,
      mythic: theme.colors.rarity.mythic,
      special: theme.colors.rarity.special,
      promo: theme.colors.rarity.promo
    };
    return rarityMap[rarity.toLowerCase()] || theme.colors.rarity.common;
  };

  const getConditionColor = (condition: string) => {
    const conditionMap: Record<string, string> = {
      mint: theme.colors.status.success,
      near_mint: theme.colors.status.success,
      excellent: theme.colors.status.info,
      good: theme.colors.status.warning,
      fair: theme.colors.status.error,
      poor: theme.colors.status.error
    };
    return conditionMap[condition.toLowerCase()] || theme.colors.text.tertiary;
  };

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  const renderCompactCard = () => (
    <Card
      style={styles.compactCard}
      variant="elevated"
      onPress={onPress}
    >
      <Image
        source={{ uri: card.imageUrl }}
        style={styles.compactImage}
        resizeMode="cover"
      />
      <View style={styles.compactInfo}>
        <Text style={styles.compactName} numberOfLines={1}>
          {card.name}
        </Text>
        <Text style={styles.compactSet} numberOfLines={1}>
          {card.setName}
        </Text>
        {showValue && card.estimatedValue && (
          <Text style={styles.compactValue}>
            {formatValue(card.estimatedValue)}
          </Text>
        )}
      </View>
    </Card>
  );

  const renderDetailedCard = () => (
    <Card
      style={styles.detailedCard}
      variant="elevated"
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: card.imageUrl }}
          style={styles.detailedImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(card.rarity) }]}>
            <Text style={styles.rarityText}>{card.rarity.toUpperCase()}</Text>
          </View>
          {showCondition && card.condition && (
            <View style={[styles.conditionBadge, { backgroundColor: getConditionColor(card.condition) }]}>
              <Text style={styles.conditionText}>{card.condition.toUpperCase()}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.detailedInfo}>
        <Text style={styles.detailedName} numberOfLines={2}>
          {card.name}
        </Text>
        <Text style={styles.detailedSet} numberOfLines={1}>
          {card.setName}
        </Text>
        <Text style={styles.cardNumber}>
          #{card.cardNumber}
        </Text>

        <View style={styles.detailedFooter}>
          {showValue && card.estimatedValue && (
            <View style={styles.valueContainer}>
              <Ionicons name="cash-outline" size={16} color={theme.colors.gold.primary} />
              <Text style={styles.detailedValue}>
                {formatValue(card.estimatedValue)}
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderPremiumCard = () => (
    <Card
      style={styles.premiumCard}
      variant="outlined"
      onPress={onPress}
    >
      <View style={styles.premiumImageContainer}>
        <Image
          source={{ uri: card.imageUrl }}
          style={styles.premiumImage}
          resizeMode="cover"
        />
        <View style={styles.premiumOverlay}>
          <View style={styles.premiumBadges}>
            <View style={[styles.premiumRarityBadge, { backgroundColor: getRarityColor(card.rarity) }]}>
              <Text style={styles.premiumRarityText}>{card.rarity.toUpperCase()}</Text>
            </View>
            {showCondition && card.condition && (
              <View style={[styles.premiumConditionBadge, { backgroundColor: getConditionColor(card.condition) }]}>
                <Text style={styles.premiumConditionText}>{card.condition.toUpperCase()}</Text>
              </View>
            )}
          </View>

          {showValue && card.estimatedValue && (
            <View style={styles.premiumValueContainer}>
              <Text style={styles.premiumValueLabel}>預估價值</Text>
              <Text style={styles.premiumValue}>
                {formatValue(card.estimatedValue)}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.premiumInfo}>
        <Text style={styles.premiumName} numberOfLines={2}>
          {card.name}
        </Text>
        <Text style={styles.premiumSet} numberOfLines={1}>
          {card.setName}
        </Text>
        <Text style={styles.premiumNumber}>
          #{card.cardNumber}
        </Text>

        <View style={styles.premiumActions}>
          <TouchableOpacity style={styles.premiumActionButton}>
            <Ionicons name="eye-outline" size={20} color={theme.colors.gold.primary} />
            <Text style={styles.premiumActionText}>查看詳情</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.premiumActionButton}>
            <Ionicons name="heart-outline" size={20} color={theme.colors.gold.primary} />
            <Text style={styles.premiumActionText}>收藏</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  switch (variant) {
    case 'compact':
      return renderCompactCard();
    case 'premium':
      return renderPremiumCard();
    default:
      return renderDetailedCard();
  }
};

const styles = StyleSheet.create({
  // Compact Card Styles
  compactCard: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm
  },
  compactImage: {
    width: 60,
    height: 80,
    borderRadius: theme.borderRadius.md
  },
  compactInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'center'
  },
  compactName: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  compactSet: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  compactValue: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gold.primary
  },

  // Detailed Card Styles
  detailedCard: {
    marginBottom: theme.spacing.md
  },
  imageContainer: {
    position: 'relative',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden'
  },
  detailedImage: {
    width: '100%',
    height: 200
  },
  imageOverlay: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  rarityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm
  },
  rarityText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary
  },
  conditionBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm
  },
  conditionText: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary
  },
  detailedInfo: {
    padding: theme.spacing.md
  },
  detailedName: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs
  },
  detailedSet: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  cardNumber: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md
  },
  detailedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailedValue: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gold.primary,
    marginLeft: theme.spacing.xs
  },
  actionButton: {
    padding: theme.spacing.xs
  },

  // Premium Card Styles
  premiumCard: {
    marginBottom: theme.spacing.lg
  },
  premiumImageContainer: {
    position: 'relative',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden'
  },
  premiumImage: {
    width: '100%',
    height: 250
  },
  premiumOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
    padding: theme.spacing.md
  },
  premiumBadges: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  premiumRarityBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md
  },
  premiumRarityText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary
  },
  premiumConditionBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md
  },
  premiumConditionText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary
  },
  premiumValueContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md
  },
  premiumValueLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  premiumValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.gold.primary
  },
  premiumInfo: {
    padding: theme.spacing.lg
  },
  premiumName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm
  },
  premiumSet: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  },
  premiumNumber: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.lg
  },
  premiumActions: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  premiumActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.secondary
  },
  premiumActionText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.gold.primary,
    fontWeight: theme.typography.weights.medium,
    marginLeft: theme.spacing.xs
  }
});
