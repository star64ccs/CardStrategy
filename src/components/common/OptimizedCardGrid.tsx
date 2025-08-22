import React, { memo, useMemo, useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { CardDisplay } from '@/components/cards/CardDisplay';
import { useMemoryMonitor } from '@/hooks/useMemoryMonitor';
import { memoryCleanupService } from '@/services/memoryCleanupService';
import { Card } from '@/types';
import { logger } from '@/utils/logger';

interface OptimizedCardGridProps {
  cards: Card[];
  onCardPress?: (card: Card) => void;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  filters?: ((card: Card) => boolean)[];
  showPrice?: boolean;
  showCondition?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'detailed';
}

const ITEMS_PER_PAGE = 20;
const WINDOW_SIZE = 10;
const MAX_TO_RENDER_PER_BATCH = 10;
const UPDATE_INTERVAL = 16; // 60fps

export const OptimizedCardGrid: React.FC<OptimizedCardGridProps> = memo(
  ({
    cards,
    onCardPress,
    onRefresh,
    loading = false,
    filters = [],
    showPrice = true,
    showCondition = false,
    size = 'medium',
    variant = 'default',
  }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // 使用內存監控
    const { getCurrentMemory, getMemoryStats, checkMemoryLeak } =
      useMemoryMonitor({
        componentName: 'OptimizedCardGrid',
        enableLeakDetection: true,
        memoryThreshold: 2, // 2MB
        onMemoryLeak: (report) => {
          logger.warn('OptimizedCardGrid 檢測到內存洩漏', {
            growth: `${Math.round(report.growth / 1024 / 1024)}MB`,
            duration: `${Math.round(report.duration / 1000)}秒`,
          });

          // 觸發清理
          memoryCleanupService.executeTask('image-cache');
        },
      });

    // 使用 useMemo 優化過濾結果
    const filteredCards = useMemo(() => {
      if (filters.length === 0) return cards;

      return cards.filter((card) => {
        return filters.every((filter) => filter(card));
      });
    }, [cards, filters]);

    // 使用 useMemo 優化分頁數據
    const paginatedCards = useMemo(() => {
      const startIndex = 0;
      const endIndex = currentPage * ITEMS_PER_PAGE;
      return filteredCards.slice(startIndex, endIndex);
    }, [filteredCards, currentPage]);

    // 使用 useCallback 優化事件處理函數
    const handleCardPress = useCallback(() => {
      // 這裡需要從事件中獲取卡片數據
      // 由於 CardDisplay 的 onPress 簽名是 () => void，我們需要調整
    }, [onCardPress]);

    const handleRefresh = useCallback(async () => {
      if (!onRefresh) return;

      setRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        logger.error('刷新卡片數據失敗', {
          error: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setRefreshing(false);
      }
    }, [onRefresh]);

    const handleLoadMore = useCallback(() => {
      if (paginatedCards.length < filteredCards.length) {
        setCurrentPage((prev) => prev + 1);
      }
    }, [paginatedCards.length, filteredCards.length]);

    // 使用 useCallback 優化 keyExtractor
    const keyExtractor = useCallback((item: Card) => item.id, []);

    // 使用 useCallback 優化 renderItem
    const renderItem = useCallback(
      ({ item }: { item: Card }) => (
        <CardDisplay
          card={item}
          onPress={handleCardPress}
          showPrice={showPrice}
          showCondition={showCondition}
          size={size}
          variant={variant}
        />
      ),
      [handleCardPress, showPrice, showCondition, size, variant]
    );

    // 使用 useCallback 優化 ListFooterComponent
    const ListFooterComponent = useCallback(() => {
      if (paginatedCards.length >= filteredCards.length) {
        return null;
      }

      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" />
        </View>
      );
    }, [paginatedCards.length, filteredCards.length]);

    // 定期檢查內存使用情況
    useEffect(() => {
      const memoryCheckInterval = setInterval(() => {
        const memory = getCurrentMemory();
        if (memory) {
          const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
          if (usedMB > 100) {
            // 100MB 閾值
            logger.warn('OptimizedCardGrid 內存使用過高', { usedMB });
            checkMemoryLeak();
          }
        }
      }, 30000); // 每30秒檢查一次

      return () => {
        clearInterval(memoryCheckInterval);
      };
    }, [getCurrentMemory, checkMemoryLeak]);

    // 組件卸載時清理資源
    useEffect(() => {
      return () => {
        // 清理圖片緩存
        memoryCleanupService.executeTask('image-cache');

        // 記錄內存統計
        const stats = getMemoryStats();
        logger.info('OptimizedCardGrid 組件卸載', {
          averageMemory: stats.average,
          peakMemory: stats.peak,
          memoryGrowth: stats.growth,
        });
      };
    }, [getMemoryStats]);

    // 渲染空狀態
    if (filteredCards.length === 0 && !loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={paginatedCards}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={size === 'small' ? 3 : size === 'large' ? 1 : 2}
          columnWrapperStyle={size !== 'large' ? styles.row : undefined}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#007AFF"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={ListFooterComponent}
          removeClippedSubviews={true}
          maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
          windowSize={WINDOW_SIZE}
          initialNumToRender={ITEMS_PER_PAGE}
          updateCellsBatchingPeriod={UPDATE_INTERVAL}
          getItemLayout={
            size === 'large'
              ? undefined
              : (data, index) => ({
                  length: size === 'small' ? 120 : 180,
                  offset: (size === 'small' ? 120 : 180) * index,
                  index,
                })
          }
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    );
  }
);

OptimizedCardGrid.displayName = 'OptimizedCardGrid';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
