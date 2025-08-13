import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/common/Card';
import { theme } from '@/config/theme';
import { Card as CardType } from '@/types';

interface CardItemProps {
  card: CardType;
  onPress?: () => void;
  onFavorite?: () => void;
  showPrice?: boolean;
  showCondition?: boolean;
  variant?: 'compact' | 'detailed';
}

const { width } = Dimensions.get('window');

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onPress,
  onFavorite,
  showPrice = true,
  showCondition = true,
  variant = 'compact'
}) => {
  const isCompact = variant === 'compact';

  const renderPrice = () => {
    if (!showPrice || !card.price) return null;

    return (
      <View style={styles.priceContainer}>
        <Text style={styles.priceLabel}>價格</Text>
        <Text style={styles.price}>${card.price.toLocaleString()}</Text>
      </View>
    );
  };

  const renderCondition = () => {
    if (!showCondition || !card.condition) return null;

    const conditionColors = {
      mint: theme.colors.success,
      'near-mint': theme.colors.success,
      excellent: theme.colors.warning,
      good: theme.colors.warning,
      'light-played': theme.colors.error,
      played: theme.colors.error,
      poor: theme.colors.error
    };

    return (
      <View style={styles.conditionContainer}>
        <View
          style={[
            styles.conditionBadge,
            { backgroundColor: conditionColors[card.condition] }
          ]}
        >
          <Text style={styles.conditionText}>{card.condition}</Text>
        </View>
      </View>
    );
  };

  const renderRarity = () => {
    if (!card.rarity) return null;

    const rarityColors = {
      common: '#9E9E9E',
      uncommon: '#4CAF50',
      rare: '#2196F3',
      mythic: '#FF9800',
      special: '#E91E63',
      promo: '#9C27B0'
    };

    return (
      <View
        style={[
          styles.rarityBadge,
          { backgroundColor: rarityColors[card.rarity] }
        ]}
      >
        <Text style={styles.rarityText}>{card.rarity}</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card
        variant="elevated"
        padding="small"
        margin="small"
        style={[styles.container, ...(isCompact ? [styles.compactContainer] : [])] as any}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {card.name}
            </Text>
            {card.set && (
              <Text style={styles.setName} numberOfLines={1}>
                {card.set}
              </Text>
            )}
          </View>
          {onFavorite && (
            <TouchableOpacity onPress={onFavorite} style={styles.favoriteButton}>
              <Ionicons
                name={card.isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={card.isFavorite ? theme.colors.error : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.imageContainer}>
          {card.imageUrl ? (
            <Image source={{ uri: card.imageUrl }} style={styles.image} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="card" size={40} color={theme.colors.textSecondary} />
              <Text style={styles.placeholderText}>無圖片</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {renderRarity()}
          {renderCondition()}
          {renderPrice()}
        </View>

        {!isCompact && card.description && (
          <Text style={styles.description} numberOfLines={3}>
            {card.description}
          </Text>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width * 0.45,
    minHeight: 200
  },
  compactContainer: {
    width: width * 0.4,
    minHeight: 160
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.small
  },
  titleContainer: {
    flex: 1,
    marginRight: theme.spacing.small
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xsmall
  },
  setName: {
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  favoriteButton: {
    padding: theme.spacing.xsmall
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.small
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.small,
    resizeMode: 'cover'
  },
  placeholderImage: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.small,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xsmall
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  priceContainer: {
    alignItems: 'flex-end'
  },
  priceLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary
  },
  conditionContainer: {
    marginLeft: 'auto'
  },
  conditionBadge: {
    paddingHorizontal: theme.spacing.xsmall,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small
  },
  conditionText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: '500',
    textTransform: 'uppercase'
  },
  rarityBadge: {
    paddingHorizontal: theme.spacing.xsmall,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.small
  },
  rarityText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: '500',
    textTransform: 'uppercase'
  },
  description: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.small,
    lineHeight: 16
  }
});
