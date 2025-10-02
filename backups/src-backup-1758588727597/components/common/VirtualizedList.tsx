/**
 * 虛擬化列表組件
 * 提供高性能的虛擬滾動功能
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

export interface VirtualizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  itemHeight: number;
  containerHeight?: number;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  loading?: boolean;
  loadingComponent?: React.ReactElement;
  emptyComponent?: React.ReactElement;
  headerComponent?: React.ReactElement;
  footerComponent?: React.ReactElement;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  scrollEventThrottle?: number;
  getItemLayout?: (index: number) => {
    length: number;
    offset: number;
    index: number;
  };
  keyExtractor?: (item: T, index: number) => string;
  windowSize?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  initialNumToRender?: number;
  removeClippedSubviews?: boolean;
  disableVirtualization?: boolean;
}

export interface VirtualizedListRef {
  scrollToIndex: (index: number, animated?: boolean) => void;
  scrollToOffset: (offset: number, animated?: boolean) => void;
  scrollToEnd: (animated?: boolean) => void;
  getScrollOffset: () => number;
  getVisibleRange: () => { start: number; end: number };
}

interface VisibleRange {
  start: number;
  end: number;
}

interface ScrollMetrics {
  contentLength: number;
  visibleLength: number;
  offset: number;
}

function VirtualizedList<T>(
  {
    data,
    renderItem,
    itemHeight,
    containerHeight,
    overscan = 5,
    onScroll,
    onEndReached,
    onEndReachedThreshold = 0.5,
    loading = false,
    loadingComponent,
    emptyComponent,
    headerComponent,
    footerComponent,
    style,
    contentContainerStyle,
    showsVerticalScrollIndicator = true,
    showsHorizontalScrollIndicator = false,
    scrollEventThrottle = 16,
    getItemLayout,
    keyExtractor = (_, index) => index.toString(),
    windowSize = 10,
    maxToRenderPerBatch = 10,
    updateCellsBatchingPeriod = 50,
    initialNumToRender = 10,
    removeClippedSubviews = true,
    disableVirtualization = false,
  }: VirtualizedListProps<T>,
  ref: React.Ref<VirtualizedListRef>
) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const [visibleRange, setVisibleRange] = useState<VisibleRange>({
    start: 0,
    end: 0,
  });
  const [containerSize, setContainerSize] = useState(containerHeight || 0);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const lastScrollTimeRef = useRef(0);
  const totalHeightRef = useRef(0);
  const itemPositionsRef = useRef<number[]>([]);

  // 計算容器高度
  useEffect(() => {
    if (!containerHeight) {
      const { height } = Dimensions.get('window');
      setContainerSize(height * 0.8); // 默認使用屏幕高度的80%
    }
  }, [containerHeight]);

  // 計算項目位置
  useEffect(() => {
    const positions: number[] = [];
    let currentOffset = 0;

    for (let i = 0; i < data.length; i++) {
      positions[i] = currentOffset;
      currentOffset += getItemLayout ? getItemLayout(i).length : itemHeight;
    }

    itemPositionsRef.current = positions;
    totalHeightRef.current = currentOffset;
  }, [data.length, itemHeight, getItemLayout]);

  // 計算可見範圍
  const calculateVisibleRange = useCallback(
    (offset: number): VisibleRange => {
      if (disableVirtualization || data.length === 0) {
        return { start: 0, end: data.length };
      }

      const startIndex = Math.max(
        0,
        Math.floor(offset / itemHeight) - overscan
      );
      const endIndex = Math.min(
        data.length,
        Math.ceil((offset + containerSize) / itemHeight) + overscan
      );

      return { start: startIndex, end: endIndex };
    },
    [data.length, itemHeight, containerSize, overscan, disableVirtualization]
  );

  // 更新可見範圍
  const updateVisibleRange = useCallback(
    (offset: number) => {
      const newRange = calculateVisibleRange(offset);
      setVisibleRange(newRange);
    },
    [calculateVisibleRange]
  );

  // 處理滾動事件
  const handleScroll = useCallback(
    (event: any) => {
      const offset = event.nativeEvent.contentOffset.y;
      const currentTime = Date.now();

      setScrollOffset(offset);
      updateVisibleRange(offset);
      setIsScrolling(true);

      // 觸發 onScroll 回調
      onScroll?.(offset);

      // 檢查是否到達底部
      if (onEndReached && data.length > 0) {
        const contentHeight = totalHeightRef.current;
        const scrollViewHeight = containerSize;
        const threshold = scrollViewHeight * onEndReachedThreshold;

        if (offset + scrollViewHeight >= contentHeight - threshold) {
          onEndReached();
        }
      }

      // 清除之前的定時器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 設置滾動結束檢測
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      lastScrollTimeRef.current = currentTime;
    },
    [
      onScroll,
      onEndReached,
      onEndReachedThreshold,
      data.length,
      containerSize,
      updateVisibleRange,
    ]
  );

  // 計算可見項目
  const visibleItems = useMemo(() => {
    if (disableVirtualization) {
      return data.map((item, index) => ({ item, index }));
    }

    return data
      .slice(visibleRange.start, visibleRange.end)
      .map((item, index) => ({
        item,
        index: visibleRange.start + index,
      }));
  }, [data, visibleRange, disableVirtualization]);

  // 計算內容高度
  const contentHeight = useMemo(() => {
    if (disableVirtualization) {
      return data.length * itemHeight;
    }
    return totalHeightRef.current;
  }, [data.length, itemHeight, disableVirtualization]);

  // 計算偏移量
  const offsetY = useMemo(() => {
    if (disableVirtualization) {
      return 0;
    }
    return itemPositionsRef.current[visibleRange.start] || 0;
  }, [visibleRange.start, disableVirtualization]);

  // 計算上方填充高度
  const topSpacerHeight = useMemo(() => {
    if (disableVirtualization) {
      return 0;
    }
    return offsetY;
  }, [offsetY, disableVirtualization]);

  // 計算下方填充高度
  const bottomSpacerHeight = useMemo(() => {
    if (disableVirtualization) {
      return 0;
    }
    const totalHeight = totalHeightRef.current;
    const visibleHeight =
      visibleRange.end < data.length
        ? itemPositionsRef.current[visibleRange.end] || totalHeight
        : totalHeight;
    return Math.max(0, totalHeight - visibleHeight);
  }, [visibleRange.end, data.length, disableVirtualization]);

  // 暴露給父組件的方法
  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number, animated: boolean = true) => {
        if (index >= 0 && index < data.length) {
          const offset = itemPositionsRef.current[index] || index * itemHeight;
          scrollViewRef.current?.scrollTo({ y: offset, animated });
        }
      },
      scrollToOffset: (offset: number, animated: boolean = true) => {
        scrollViewRef.current?.scrollTo({ y: offset, animated });
      },
      scrollToEnd: (animated: boolean = true) => {
        const maxOffset = Math.max(0, totalHeightRef.current - containerSize);
        scrollViewRef.current?.scrollTo({ y: maxOffset, animated });
      },
      getScrollOffset: () => scrollOffset,
      getVisibleRange: () => visibleRange,
    }),
    [data.length, itemHeight, scrollOffset, visibleRange, containerSize]
  );

  // 清理定時器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 渲染空狀態
  if (data.length === 0 && !loading) {
    return (
      <View style={[styles.container, style]}>
        {headerComponent}
        {emptyComponent || <View style={styles.emptyContainer} />}
        {footerComponent}
      </View>
    );
  }

  // 渲染加載狀態
  if (loading && data.length === 0) {
    return (
      <View style={[styles.container, style]}>
        {headerComponent}
        {loadingComponent || <View style={styles.loadingContainer} />}
        {footerComponent}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        style={[styles.scrollView, { height: containerSize }]}
        contentContainerStyle={[
          styles.contentContainer,
          contentContainerStyle,
          { minHeight: contentHeight },
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        removeClippedSubviews={removeClippedSubviews}
      >
        {headerComponent}

        {/* 上方填充 */}
        {topSpacerHeight > 0 && <View style={{ height: topSpacerHeight }} />}

        {/* 可見項目 */}
        {visibleItems.map(({ item, index }) => (
          <View key={keyExtractor(item, index)} style={{ height: itemHeight }}>
            {renderItem(item, index)}
          </View>
        ))}

        {/* 下方填充 */}
        {bottomSpacerHeight > 0 && (
          <View style={{ height: bottomSpacerHeight }} />
        )}

        {footerComponent}

        {/* 加載更多指示器 */}
        {loading &&
          data.length > 0 &&
          (loadingComponent || <View style={styles.loadingMoreContainer} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingMoreContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default forwardRef(VirtualizedList) as <T>(
  props: VirtualizedListProps<T> & { ref?: React.Ref<VirtualizedListRef> }
) => React.ReactElement;
