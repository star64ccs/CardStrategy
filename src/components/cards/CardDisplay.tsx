import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '@/config/ThemeProvider';
import { Card } from '@/types';

interface CardDisplayProps {
  card: Card;
  onPress?: () => void;
  showPrice?: boolean;
  showCondition?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'detailed';
}

const { width } = Dimensions.get('window');

export const CardDisplay: React.FC<CardDisplayProps> = ({
  card,
  onPress,
  showPrice = true,
  showCondition = false,
  size = 'medium',
  variant = 'default',
}) => {
  const { theme } = useTheme();

  const getCardSize = () => {
    switch (size) {
      case 'small':
        return { width: width * 0.4, height: width * 0.56 };
      case 'large':
        return { width: width * 0.8, height: width * 1.12 };
      default:
        return { width: width * 0.6, height: width * 0.84 };
    }
  };

  const cardSize = getCardSize();

  const renderCardImage = () => (
    <Image
      source={{ uri: card.imageUrl }}
      style={[styles.cardImage, cardSize]}
      resizeMode="cover"
    />
  );

  const renderCardInfo = () => {
    if (variant === 'compact') {
      return (
        <View style={styles.compactInfo}>
          <Text
            style={[styles.cardName, { color: theme.colors.textPrimary }]}
            numberOfLines={2}
          >
            {card.name}
          </Text>
          {showPrice && (
            <Text style={[styles.cardPrice, { color: theme.colors.secondary }]}>
              ${card.currentPrice?.toFixed(2) || 'N/A'}
            </Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.cardInfo}>
        <Text
          style={[styles.cardName, { color: theme.colors.textPrimary }]}
          numberOfLines={2}
        >
          {card.name}
        </Text>
        <Text
          style={[styles.cardSet, { color: theme.colors.textSecondary }]}
          numberOfLines={1}
        >
          {card.set}
        </Text>
        {showPrice && (
          <View style={styles.priceContainer}>
            <Text style={[styles.cardPrice, { color: theme.colors.secondary }]}>
              ${card.currentPrice?.toFixed(2) || 'N/A'}
            </Text>
            {card.priceChange && (
              <Text
                style={[
                  styles.priceChange,
                  {
                    color:
                      card.priceChange > 0
                        ? theme.colors.success
                        : theme.colors.error,
                  },
                ]}
              >
                {card.priceChange > 0 ? '+' : ''}
                {card.priceChange.toFixed(2)}%
              </Text>
            )}
          </View>
        )}
        {showCondition && card.condition && (
          <View style={styles.conditionContainer}>
            <Text
              style={[
                styles.conditionLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              狀況:
            </Text>
            <Text
              style={[
                styles.conditionValue,
                { color: theme.colors.textPrimary },
              ]}
            >
              {card.condition}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const cardContent = (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.backgroundPaper },
      ]}
    >
      {renderCardImage()}
      {renderCardInfo()}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  touchable: {
    borderRadius: 12,
  },
  cardImage: {
    borderRadius: 8,
    margin: 8,
  },
  cardInfo: {
    padding: 12,
  },
  compactInfo: {
    padding: 8,
    alignItems: 'center',
  },
  cardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSet: {
    fontSize: 12,
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceChange: {
    fontSize: 12,
    fontWeight: '500',
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  conditionLabel: {
    fontSize: 12,
    marginRight: 4,
  },
  conditionValue: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CardDisplay;
