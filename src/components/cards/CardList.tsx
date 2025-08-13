import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Text
} from 'react-native';
import { useTheme } from '@/config/ThemeProvider';
import { Card } from '@/types';
import { CardDisplay } from './CardDisplay';

interface CardListProps {
  cards: Card[];
  onCardPress?: (card: Card) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  showPrice?: boolean;
  showCondition?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'detailed';
  numColumns?: number;
}

export const CardList: React.FC<CardListProps> = ({
  cards,
  onCardPress,
  onRefresh,
  refreshing = false,
  loading = false,
  emptyMessage = '沒有找到卡片',
  showPrice = true,
  showCondition = false,
  size = 'medium',
  variant = 'default',
  numColumns = 2
}) => {
  const { theme } = useTheme();

  const renderCard = ({ item }: { item: Card }) => (
    <CardDisplay
      card={item}
      onPress={() => onCardPress?.(item)}
      showPrice={showPrice}
      showCondition={showCondition}
      size={size}
      variant={variant}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
        {emptyMessage}
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  };

  if (loading && cards.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      data={cards}
      renderItem={renderCard}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        ) : undefined
      }
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 8
  },
  row: {
    justifyContent: 'space-between'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  }
});

export default CardList;
