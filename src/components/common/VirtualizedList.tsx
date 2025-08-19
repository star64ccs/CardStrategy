import React, { useCallback, useMemo } from 'react';
import { FlatList, FlatListProps, View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/designSystem';

export interface VirtualizedListProps<T> extends Omit<FlatListProps<T>, 'data' | 'renderItem'> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  itemHeight: number;
  emptyComponent?: React.ReactElement;
  loadingComponent?: React.ReactElement;
  errorComponent?: React.ReactElement;
  onLoadMore?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  threshold?: number;
}

export const VirtualizedList = <T extends any>({
  data,
  renderItem,
  keyExtractor,
  itemHeight,
  emptyComponent,
  loadingComponent,
  errorComponent,
  onLoadMore,
  onRefresh,
  isRefreshing = false,
  isLoadingMore = false,
  hasMore = false,
  threshold = 0.5,
  style,
  contentContainerStyle,
  ...props
}: VirtualizedListProps<T>) => {

  // 計算初始渲染數量
  const initialNumToRender = useMemo(() => {
    const screenHeight = 800; // 假設屏幕高度
    return Math.ceil(screenHeight / itemHeight) + 2;
  }, [itemHeight]);

  // 獲取項目佈局
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index
  }), [itemHeight]);

  // 渲染項目
  const renderItemCallback = useCallback(({ item, index }: { item: T; index: number }) => {
    return renderItem(item, index);
  }, [renderItem]);

  // 渲染空狀態
  const renderEmptyComponent = useCallback(() => {
    if (emptyComponent) return emptyComponent;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暫無數據</Text>
      </View>
    );
  }, [emptyComponent]);

  // 渲染加載更多
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    if (loadingComponent) return loadingComponent;

    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>加載中...</Text>
      </View>
    );
  }, [isLoadingMore, loadingComponent]);

  // 處理加載更多
  const handleEndReached = useCallback(() => {
    if (onLoadMore && hasMore && !isLoadingMore) {
      onLoadMore();
    }
  }, [onLoadMore, hasMore, isLoadingMore]);

  // 處理下拉刷新
  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  return (
    <FlatList
      data={data}
      renderItem={renderItemCallback}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={5}
      initialNumToRender={initialNumToRender}
      updateCellsBatchingPeriod={50}
      onEndReachedThreshold={threshold}
      onEndReached={handleEndReached}
      onRefresh={onRefresh ? handleRefresh : undefined}
      refreshing={isRefreshing}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      style={[styles.container, style]}
      contentContainerStyle={[
        styles.contentContainer,
        data.length === 0 && styles.emptyContentContainer,
        contentContainerStyle
      ]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    flexGrow: 1
  },
  emptyContentContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center'
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 14,
    color: theme.colors.text.secondary
  }
});

// 導出便捷的虛擬化列表組件
export const VirtualizedCardList = <T extends any>({
  data,
  renderItem,
  keyExtractor,
  itemHeight = 120,
  ...props
}: Omit<VirtualizedListProps<T>, 'itemHeight'> & { itemHeight?: number }) => {
  return (
    <VirtualizedList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      itemHeight={itemHeight}
      {...props}
    />
  );
};

export const VirtualizedUserList = <T extends any>({
  data,
  renderItem,
  keyExtractor,
  itemHeight = 80,
  ...props
}: Omit<VirtualizedListProps<T>, 'itemHeight'> & { itemHeight?: number }) => {
  return (
    <VirtualizedList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      itemHeight={itemHeight}
      {...props}
    />
  );
};

export const VirtualizedTransactionList = <T extends any>({
  data,
  renderItem,
  keyExtractor,
  itemHeight = 100,
  ...props
}: Omit<VirtualizedListProps<T>, 'itemHeight'> & { itemHeight?: number }) => {
  return (
    <VirtualizedList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      itemHeight={itemHeight}
      {...props}
    />
  );
};
