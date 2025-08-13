import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, RootState } from '@/store';
import { useTheme } from '@/config/ThemeProvider';
import { CardList } from '@/components/cards/CardList';
import { Loading } from '@/components/common/Loading';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { searchCards, fetchCard } from '@/store/slices/cardSlice';
import { Card, CardFilters, CardSortOptions } from '@/types';
import { logger } from '@/utils/logger';
import { debounce } from '@/utils/helpers';

export const CardsScreen: React.FC = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const { cards, isLoading, error } = useSelector((state: RootState) => state.cards);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<CardFilters>({});
  const [sortOption, setSortOption] = useState<CardSortOptions['field']>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 加載卡片數據
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = useCallback(async () => {
    try {
      await dispatch(searchCards({ query: '', filters: selectedFilters }));
    } catch (error) {
      logger.error('Failed to load cards:', { error });
      Alert.alert('錯誤', '載入卡牌失敗，請稍後再試');
    }
  }, [dispatch, selectedFilters]);

  // 防抖搜索
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      if (query.trim()) {
        dispatch(searchCards({ query, filters: selectedFilters }));
      } else {
        setFilteredCards(cards);
      }
    }, 500),
    [dispatch, selectedFilters, cards]
  );

  // 處理搜索
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  }, [debouncedSearch]);

  // 過濾和排序卡片
  useEffect(() => {
    let result = [...cards];

    // 應用搜索過濾
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card => 
        card.name.toLowerCase().includes(query) ||
        card.description?.toLowerCase().includes(query) ||
        card.rarity.toLowerCase().includes(query) ||
        card.type.toLowerCase().includes(query)
      );
    }

    // 應用排序
    result.sort((a, b) => {
      let aValue: any = a[sortOption];
      let bValue: any = b[sortOption];

      // 處理特殊排序邏輯
      if (sortOption === 'price') {
        aValue = a.currentPrice || 0;
        bValue = b.currentPrice || 0;
      } else if (sortOption === 'rarity') {
        const rarityOrder = { common: 1, uncommon: 2, rare: 3, mythic: 4, special: 5 };
        aValue = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0;
        bValue = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredCards(result);
  }, [cards, searchQuery, sortOption, sortDirection]);

  // 處理卡片點擊
  const handleCardPress = useCallback((card: Card) => {
    logger.info('Card pressed:', { cardId: card.id, cardName: card.name });
    // 導航到卡片詳情頁面
    // navigation.navigate('CardDetail', { cardId: card.id });
  }, []);

  // 處理刷新
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  }, [loadCards]);

  // 處理過濾器變更
  const handleFilterChange = useCallback((filters: CardFilters) => {
    setSelectedFilters(filters);
    setShowFilters(false);
  }, []);

  // 處理排序變更
  const handleSortChange = useCallback((option: CardSortOptions['field']) => {
    if (sortOption === option) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortOption(option);
      setSortDirection('asc');
    }
  }, [sortOption]);

  // 清除搜索
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setFilteredCards(cards);
  }, [cards]);

  // 處理錯誤
  useEffect(() => {
    if (error) {
      Alert.alert('錯誤', error);
    }
  }, [error]);

  // 獲取排序選項
  const sortOptions: { value: CardSortOptions['field']; label: string }[] = [
    { value: 'name', label: '名稱' },
    { value: 'price', label: '價格' },
    { value: 'rarity', label: '稀有度' },
    { value: 'set', label: '系列' },
    { value: 'condition', label: '條件' },
    { value: 'dateAdded', label: '添加時間' }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* 搜索和過濾欄 */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.backgroundPaper }]}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons 
              name="search" 
              size={20} 
              color={theme.colors.textSecondary} 
              style={styles.searchIcon}
            />
            <TextInput
              style={[styles.searchInput, {
                backgroundColor: theme.colors.background,
                color: theme.colors.textPrimary,
                borderColor: theme.colors.borderLight
              }]}
              placeholder="搜索卡片..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearSearch}
              >
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={() => setShowFilters(true)}
          >
            <Ionicons name="filter" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>

        {/* 排序和視圖模式 */}
        <View style={styles.controlsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.sortButton,
                  {
                    backgroundColor: sortOption === option.value 
                      ? theme.colors.primary[100] 
                      : theme.colors.background,
                    borderColor: theme.colors.borderLight
                  }
                ]}
                onPress={() => handleSortChange(option.value)}
              >
                <Text style={[
                  styles.sortButtonText,
                  { color: sortOption === option.value ? theme.colors.primary[500] : theme.colors.textSecondary }
                ]}>
                  {option.label}
                </Text>
                {sortOption === option.value && (
                  <Ionicons 
                    name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
                    size={12} 
                    color={theme.colors.primary[500]} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.viewModeContainer}>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                { backgroundColor: viewMode === 'grid' ? theme.colors.primary[100] : theme.colors.background }
              ]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons 
                name="grid" 
                size={16} 
                color={viewMode === 'grid' ? theme.colors.primary[500] : theme.colors.textSecondary} 
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeButton,
                { backgroundColor: viewMode === 'list' ? theme.colors.primary[100] : theme.colors.background }
              ]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons 
                name="list" 
                size={16} 
                color={viewMode === 'list' ? theme.colors.primary[500] : theme.colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 卡片列表 */}
      <View style={styles.content}>
        {isLoading && cards.length === 0 ? (
          <Loading />
        ) : (
          <ScrollView
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                colors={[theme.colors.primary[500] || '#007AFF']}
              />
            }
          >
            {filteredCards.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={64} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
                  {searchQuery ? '沒有找到匹配的卡片' : '暫無卡片數據'}
                </Text>
                {searchQuery && (
                  <Button
                    title="清除搜索"
                    variant="outline"
                    onPress={handleClearSearch}
                    style={styles.clearSearchButton}
                  />
                )}
              </View>
            ) : (
                             <CardList
                 cards={filteredCards}
                 onCardPress={handleCardPress}
                 variant="default"
                 numColumns={viewMode === 'grid' ? 2 : 1}
               />
            )}
          </ScrollView>
        )}
      </View>

      {/* 過濾器模態框 */}
      <Modal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        title="過濾器"
      >
        <View style={styles.filterContent}>
          <Text style={[styles.filterSectionTitle, { color: theme.colors.textPrimary }]}>
            稀有度
          </Text>
          {/* 這裡可以添加更多過濾器選項 */}
          <Button
            title="應用過濾器"
            onPress={() => handleFilterChange(selectedFilters)}
            fullWidth
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  searchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    flex: 1
  },
  searchIcon: {
    marginRight: 8
  },
  clearButton: {
    padding: 5
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  viewModeContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flex: 1
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16
  },
  clearSearchButton: {
    marginTop: 20,
    width: '100%'
  },
  filterContent: {
    padding: 20
  },
  filterSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  }
});
