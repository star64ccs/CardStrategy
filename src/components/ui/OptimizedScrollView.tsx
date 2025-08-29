import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useResponsive } from '../../hooks/useResponsive';
import { touchService } from '../../services/touchService';
import type {
  OptimizedScrollViewProps,
  ScrollOptimizationConfig,
} from '../../types/touch';

/**
 * 優化滾動組件
 * 提供流暢的滾動體驗、動量滾動、彈跳效果等優化功能
 */
export const OptimizedScrollView: React.FC<OptimizedScrollViewProps> = ({
  children,
  horizontal = false,
  vertical = true,
  optimization = {},
  onScroll,
  onScrollBeginDrag,
  onScrollEndDrag,
  onMomentumScrollBegin,
  onMomentumScrollEnd,
  className = '',
  style = {},
  contentContainerStyle = {},
  showsScrollIndicator = true,
  scrollEnabled = true,
  bounces = true,
  alwaysBounceHorizontal = false,
  alwaysBounceVertical = false,
  automaticallyAdjustContentInsets = true,
  automaticallyAdjustKeyboardInsets = false,
  automaticallyAdjustScrollIndicatorInsets = true,
  contentInsetAdjustmentBehavior = 'automatic',
  directionalLockEnabled = false,
  indicatorStyle = 'default',
  keyboardDismissMode = 'none',
  keyboardShouldPersistTaps = 'always',
  maintainVisibleContentPosition,
  maximumZoomScale = 1,
  minimumZoomScale = 1,
  nestedScrollEnabled = false,
  onContentSizeChange,
  onLayout,
  onScrollToTop,
  pagingEnabled = false,
  refreshControl,
  removeClippedSubviews = false,
  scrollEventThrottle = 16,
  scrollIndicatorInsets,
  scrollPerfTag,
  scrollToOverflowEnabled = false,
  scrollsToTop = true,
  sendMomentumEvents = true,
  snapToInterval = 0,
  snapToOffsets = [],
  snapToStart = true,
  snapToEnd = true,
  zoomScale = 1,
}) => {
  const { currentThemeData } = useDesignSystem();
  const { isMobile, isTablet } = useResponsive();
  const _containerRef = useRef<HTMLDivElement>(null);
  const _contentRef = useRef<HTMLDivElement>(null);
  const _componentId = useRef(`optimized-scroll-${Date.now()}-${Math.random()}`);

  // 狀態管理
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [momentum, setMomentum] = useState({ x: 0, y: 0 });
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [zoomLevel, setZoomLevel] = useState(zoomScale);

  // 默認配置
  const defaultConfig: ScrollOptimizationConfig = {
    enabled: true,
    momentum: true,
    bounce: true,
    deceleration: 0.998,
    snapToInterval: 0,
    snapToAlignment: 'start',
    showsHorizontalScrollIndicator: true,
    showsVerticalScrollIndicator: true,
  };

  const _finalConfig = { ...defaultConfig, ...optimization };

  // 註冊組件到服務
  useEffect(() => {
    if (scrollEnabled) {
      touchService.registerScroll(componentId.current, finalConfig);
    }

    return () => {
      touchService.unregisterScroll(componentId.current);
    };
  }, [scrollEnabled, finalConfig]);

  // 監聽容器大小變化
  useEffect(() => {
    const _updateContainerSize = () => {
      if (containerRef.current) {
        const _rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);

    return () => {
      window.removeEventListener('resize', updateContainerSize);
    };
  }, []);

  // 監聽內容大小變化
  useEffect(() => {
    const _updateContentSize = () => {
      if (contentRef.current) {
        const _rect = contentRef.current.getBoundingClientRect();
        const _newSize = { width: rect.width, height: rect.height };
        setContentSize(newSize);

        if (onContentSizeChange) {
          onContentSizeChange(newSize.width, newSize.height);
        }
      }
    };

    const _resizeObserver = new ResizeObserver(updateContentSize);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [onContentSizeChange]);

  // 工具函數
  const _getScrollPosition = useCallback(() => {
    if (containerRef.current) {
      return {
        x: containerRef.current.scrollLeft,
        y: containerRef.current.scrollTop,
      };
    }
    return { x: 0, y: 0 };
  }, []);

  const _setScrollPositionSmooth = useCallback((x: number, y: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        left: x,
        top: y,
        behavior: 'smooth',
      });
    }
  }, []);

  const _calculateMomentum = useCallback(
    (velocity: number, deceleration = 0.998): number => {
      return velocity * deceleration;
    },
    []
  );

  const _applyMomentum = useCallback(() => {
    if (!finalConfig.momentum || (momentum.x === 0 && momentum.y === 0)) {
      return;
    }

    const _animate = () => {
      if (Math.abs(momentum.x) < 0.1 && Math.abs(momentum.y) < 0.1) {
        setMomentum({ x: 0, y: 0 });
        setIsScrolling(false);
        if (onMomentumScrollEnd) {
          onMomentumScrollEnd();
        }
        return;
      }

      const _newX = calculateMomentum(momentum.x, finalConfig.deceleration);
      const _newY = calculateMomentum(momentum.y, finalConfig.deceleration);

      setMomentum({ x: newX, y: newY });

      const _currentPos = getScrollPosition();
      const _newPos = {
        x: Math.max(
          0,
          Math.min(currentPos.x + newX, contentSize.width - containerSize.width)
        ),
        y: Math.max(
          0,
          Math.min(
            currentPos.y + newY,
            contentSize.height - containerSize.height
          )
        ),
      };

      setScrollPositionSmooth(newPos.x, newPos.y);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [
    momentum,
    finalConfig,
    calculateMomentum,
    getScrollPosition,
    setScrollPositionSmooth,
    contentSize,
    containerSize,
    onMomentumScrollEnd,
  ]);

  // 事件處理器
  const _handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!scrollEnabled) return;

      const _target = event.target as HTMLDivElement;
      const _newPosition = {
        x: target.scrollLeft,
        y: target.scrollTop,
      };

      setScrollPosition(newPosition);
      setIsScrolling(true);

      if (onScroll) {
        onScroll(event);
      }

      // 性能追蹤
      touchService.trackPerformance(componentId.current, {
        scroll: 'scroll',
        position: newPosition,
        timestamp: Date.now(),
      });
    },
    [scrollEnabled, onScroll]
  );

  const _handleScrollBeginDrag = useCallback(() => {
    if (!scrollEnabled) return;

    setIsDragging(true);
    setIsScrolling(false);
    setMomentum({ x: 0, y: 0 });

    if (onScrollBeginDrag) {
      onScrollBeginDrag();
    }
  }, [scrollEnabled, onScrollBeginDrag]);

  const _handleScrollEndDrag = useCallback(() => {
    if (!scrollEnabled) return;

    setIsDragging(false);

    if (onScrollEndDrag) {
      onScrollEndDrag();
    }
  }, [scrollEnabled, onScrollEndDrag]);

  const _handleTouchStart = useCallback(() => {
    if (!scrollEnabled) return;

    setIsScrolling(false);
    setMomentum({ x: 0, y: 0 });
  }, [scrollEnabled]);

  const _handleTouchEnd = useCallback(() => {
    if (!scrollEnabled || !finalConfig.momentum) return;

    // 計算動量
    const _currentPos = getScrollPosition();
    const _velocity = {
      x: (currentPos.x - scrollPosition.x) * 0.1,
      y: (currentPos.y - scrollPosition.y) * 0.1,
    };

    setMomentum(velocity);

    if (onMomentumScrollBegin) {
      onMomentumScrollBegin();
    }

    applyMomentum();
  }, [
    scrollEnabled,
    finalConfig.momentum,
    getScrollPosition,
    scrollPosition,
    onMomentumScrollBegin,
    applyMomentum,
  ]);

  const _handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!scrollEnabled) return;

      event.preventDefault();

      const { deltaX } = event;
      const { deltaY } = event;

      const _currentPos = getScrollPosition();
      const _newPos = {
        x: Math.max(
          0,
          Math.min(
            currentPos.x + deltaX,
            contentSize.width - containerSize.width
          )
        ),
        y: Math.max(
          0,
          Math.min(
            currentPos.y + deltaY,
            contentSize.height - containerSize.height
          )
        ),
      };

      setScrollPositionSmooth(newPos.x, newPos.y);
    },
    [
      scrollEnabled,
      getScrollPosition,
      contentSize,
      containerSize,
      setScrollPositionSmooth,
    ]
  );

  // 樣式計算
  const _containerStyle = useMemo((): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
      touchAction: 'pan-x pan-y',
      ...style,
    };

    // 設置滾動方向
    if (horizontal && vertical) {
      baseStyle.overflow = 'auto';
    } else if (horizontal) {
      baseStyle.overflowX = 'auto';
      baseStyle.overflowY = 'hidden';
    } else if (vertical) {
      baseStyle.overflowX = 'hidden';
      baseStyle.overflowY = 'auto';
    }

    // 滾動指示器樣式
    if (!showsScrollIndicator) {
      baseStyle.scrollbarWidth = 'none';
      baseStyle.msOverflowStyle = 'none';
    }

    // 彈跳效果
    if (finalConfig.bounce && bounces) {
      baseStyle.overscrollBehavior = 'contain';
    }

    return baseStyle;
  }, [
    horizontal,
    vertical,
    showsScrollIndicator,
    finalConfig.bounce,
    bounces,
    style,
  ]);

  const _contentStyle = useMemo((): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      minHeight: '100%',
      ...contentContainerStyle,
    };

    // 縮放支持
    if (zoomLevel !== 1) {
      baseStyle.transform = `scale(${zoomLevel})`;
      baseStyle.transformOrigin = 'top left';
    }

    // 分頁滾動
    if (pagingEnabled) {
      if (horizontal) {
        baseStyle.display = 'flex';
        baseStyle.width = `${contentSize.width}px`;
      } else {
        baseStyle.height = `${contentSize.height}px`;
      }
    }

    return baseStyle;
  }, [
    zoomLevel,
    pagingEnabled,
    horizontal,
    contentSize,
    contentContainerStyle,
  ]);

  // 自定義滾動條樣式
  const _scrollbarStyle = useMemo(() => {
    if (!showsScrollIndicator) return '';

    return `
      .optimized-scroll-view::-webkit-scrollbar {
        width: ${horizontal ? '8px' : 'auto'};
        height: ${vertical ? '8px' : 'auto'};
      }

      .optimized-scroll-view::-webkit-scrollbar-track {
        background: ${currentThemeData?.colors?.background || '#ffffff'};
        border-radius: 4px;
      }

      .optimized-scroll-view::-webkit-scrollbar-thumb {
        background: ${currentThemeData?.colors?.border || '#e0e0e0'};
        border-radius: 4px;
      }

      .optimized-scroll-view::-webkit-scrollbar-thumb:hover {
        background: ${currentThemeData?.colors?.text || '#000000'};
      }
    `;
  }, [showsScrollIndicator, horizontal, vertical, currentThemeData]);

  return (
    <>
      <style>{scrollbarStyle}</style>
      <div
        ref={containerRef}
        className={`optimized-scroll-view ${className}`}
        style={containerStyle}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onMouseDown={handleScrollBeginDrag}
        onMouseUp={handleScrollEndDrag}
        onMouseLeave={handleScrollEndDrag}
      >
        <div
          ref={contentRef}
          className='optimized-scroll-content'
          style={contentStyle}
        >
          {children}
        </div>
        {refreshControl}
      </div>
    </>
  );
};
