import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { cardService, Card } from '../services/cardService';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} from '../config/theme';
import { logger } from '../utils/logger';
import { errorHandlerService } from '../services/errorHandlerService';
import {
  CardListSkeleton,
  AnimatedView,
  FadeInView,
  SlideUpView,
  AnimatedButton,
  LazyImage,
  VirtualizedCardList,
} from '../components/common';
import { optimizeImage, getThumbnailUrl } from '../utils/imageOptimizer';

const { width } = Dimensions.get('window');

interface CardsScreenProps {
  onCardPress: (card: Card) => void;
}

const CardsScreen: React.FC<CardsScreenProps> = ({ onCardPress }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    filterCards();
  }, [cards, searchQuery, selectedRarity, selectedType]);

  const loadCards = async () => {
    try {
      setIsLoading(true);

      // 使用真實 API 獲取卡片數據
      const cardsResponse = await cardService.getCards({
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      if (cardsResponse.success) {
        setCards(cardsResponse.data.cards);
        setHasMore(cardsResponse.data.totalPages > 1);
      } else {
        // 如果 API 失敗，使用模擬數據作為備用
        logger.warn('API 獲取卡片失敗，使用模擬數據', {
          error: cardsResponse.message,
        });
        const mockCards = cardService.getMockCards();
        setCards(mockCards);
        setHasMore(false);
      }
    } catch (error) {
      // 使用統一的錯誤處理
      await errorHandlerService.handleError(
        error as Error,
        'CardsScreen.loadCards',
        'medium',
        'api'
      );

      // 錯誤時使用模擬數據
      const mockCards = cardService.getMockCards();
      setCards(mockCards);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  };

  const onLoadMore = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);

      // 計算下一頁
      const nextPage = Math.ceil(cards.length / 20) + 1;

      // 使用真實 API 獲取更多卡片
      const moreCardsResponse = await cardService.getCards({
        page: nextPage,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      if (
        moreCardsResponse.success &&
        moreCardsResponse.data.cards.length > 0
      ) {
        setCards((prev) => [...prev, ...moreCardsResponse.data.cards]);
        setHasMore(nextPage < moreCardsResponse.data.totalPages);
      } else {
        // 如果沒有更多數據或 API 失敗
        setHasMore(false);
        if (!moreCardsResponse.success) {
          logger.warn('加載更多卡片 API 失敗', {
            error: moreCardsResponse.message,
          });
        }
      }
    } catch (error) {
      // 使用統一的錯誤處理
      await errorHandlerService.handleError(
        error as Error,
        'CardsScreen.onLoadMore',
        'medium',
        'api'
      );
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const filterCards = () => {
    let filtered = [...cards];

    // 搜索過濾
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (card) =>
          card.name.toLowerCase().includes(query) ||
          card.setName.toLowerCase().includes(query) ||
          card.description?.toLowerCase().includes(query)
      );
    }

    // 稀有度過濾
    if (selectedRarity) {
      filtered = filtered.filter((card) => card.rarity === selectedRarity);
    }

    // 類型過濾
    if (selectedType) {
      filtered = filtered.filter((card) => card.type === selectedType);
    }

    setFilteredCards(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRarity('');
    setSelectedType('');
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const renderCardItem = ({ item, index }: { item: Card; index: number }) => (
    <AnimatedButton
      style={styles.cardItem}
      onPress={() => onCardPress(item)}
      scaleOnPress={true}
      animationDuration={200}
    >
      <FadeInView
        animation="fadeIn"
        duration={300}
        delay={index * 50}
        style={styles.cardContent}
      >
        <View style={styles.cardImageContainer}>
          {item.imageUrl ? (
            <LazyImage
              uri={getThumbnailUrl(item.imageUrl, 150)}
              style={styles.cardImage}
              quality="low"
              cachePolicy="both"
              priority={index < 6 ? 'high' : 'normal'}
            />
          ) : (
            <View style={styles.cardImagePlaceholder}>
              <Text style={styles.cardImagePlaceholderText}>🎴</Text>
            </View>
          )}
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardSetName} numberOfLines={1}>
            {item.setName}
          </Text>
          <View style={styles.cardMeta}>
            <View style={styles.rarityContainer}>
              <Text style={styles.rarityText}>{item.rarity}</Text>
            </View>
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              {formatCurrency(item.price?.current || 0)}
            </Text>
            <Text
              style={[
                styles.changeText,
                {
                  color:
                    (item.price?.change24h || 0) >= 0
                      ? colors.success
                      : colors.error,
                },
              ]}
            >
              {formatPercentage(item.price?.change24h || 0)}
            </Text>
          </View>
        </View>
      </FadeInView>
    </AnimatedButton>
  );

  const renderFilterChip = (
    label: string,
    value: string,
    isSelected: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={[styles.filterChip, isSelected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterChipText,
          isSelected && styles.filterChipTextSelected,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const rarities = ['UR', 'SR', 'R', 'N'];
  const types = ['怪獸卡', '魔法卡', '陷阱卡'];

  return (
    <View style={styles.container}>
      {/* 搜索欄 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索卡片..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* 過濾器 */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            <Text style={styles.filterLabel}>稀有度:</Text>
            {rarities.map((rarity) => (
              <View key={rarity} style={styles.filterChipContainer}>
                {renderFilterChip(
                  rarity,
                  rarity,
                  selectedRarity === rarity,
                  () =>
                    setSelectedRarity(selectedRarity === rarity ? '' : rarity)
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            <Text style={styles.filterLabel}>類型:</Text>
            {types.map((type) => (
              <View key={type} style={styles.filterChipContainer}>
                {renderFilterChip(type, type, selectedType === type, () =>
                  setSelectedType(selectedType === type ? '' : type)
                )}
              </View>
            ))}
          </View>
        </ScrollView>

        {(searchQuery || selectedRarity || selectedType) && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Text style={styles.clearFiltersText}>清除過濾器</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 結果統計 */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          找到 {filteredCards.length} 張卡片
        </Text>
      </View>

      {/* 卡片列表 */}
      {isLoading ? (
        <CardListSkeleton
          count={8}
          variant="grid"
          showImage={true}
          showPrice={true}
        />
      ) : (
        <VirtualizedCardList
          data={filteredCards}
          renderItem={renderCardItem}
          keyExtractor={(item) => item.id}
          onRefresh={onRefresh}
          onLoadMore={onLoadMore}
          refreshing={refreshing}
          loading={isLoading}
          loadingMore={loadingMore}
          hasMore={hasMore}
          initialNumToRender={8}
          maxToRenderPerBatch={4}
          windowSize={10}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 200,
            offset: 200 * index,
            index,
          })}
          ListEmptyComponent={
            <SlideUpView animation="slideUp" duration={500}>
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>沒有找到卡片</Text>
                <Text style={styles.emptySubtext}>
                  嘗試調整搜索條件或過濾器
                </Text>
              </View>
            </SlideUpView>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    backgroundColor: colors.backgroundPaper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.medium,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.medium,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersContainer: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    backgroundColor: colors.backgroundPaper,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.small,
    fontWeight: '500' as const,
  },
  filterChipContainer: {
    marginRight: spacing.small,
  },
  filterChip: {
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: borderRadius.large,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    color: colors.white,
  },
  clearFiltersButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.small,
  },
  clearFiltersText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  resultsContainer: {
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.small,
    backgroundColor: colors.backgroundPaper,
  },
  resultsText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  cardItem: {
    width: (width - spacing.large * 3) / 2,
    backgroundColor: colors.backgroundPaper,
    borderRadius: borderRadius.medium,
    marginBottom: spacing.medium,
    ...shadows.small,
  },
  cardContent: {
    flex: 1,
  },
  cardImageContainer: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.medium,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  cardImagePlaceholderText: {
    fontSize: 32,
    color: colors.textSecondary,
  },
  cardInfo: {
    padding: spacing.medium,
  },
  cardName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
    color: colors.textPrimary,
    marginBottom: spacing.xsmall,
  },
  cardSetName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.small,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  rarityContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.small,
    paddingVertical: 2,
    borderRadius: borderRadius.small,
  },
  rarityText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: '500' as const,
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  changeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default CardsScreen;
