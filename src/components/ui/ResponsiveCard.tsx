// 響應式卡片組件

import React, { useCallback, useMemo, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useResponsive } from '../../hooks/useResponsive';
import type { ResponsiveCardProps } from '../../types/responsive';

import { Button } from './Button';

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  title,
  extra,
  children,
  layout = 'vertical',
  imagePosition = 'top',
  imageRatio = '16/9',
  size = 'default',
  width,
  height,
  minWidth,
  maxWidth,
  padding,
  margin,
  gap,
  showHeader = true,
  showImage = true,
  showActions = true,
  showFooter = true,
  contentCollapse = false,
  contentMaxHeight,
  showExpandButton = false,
  hoverable = false,
  bordered = true,
  loading = false,
  className = '',
  style = {},
  'data-testid': dataTestId,
}) => {
  const { getResponsiveValue } = useResponsive();
  const { currentTheme, currentThemeData } = useDesignSystem();

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // 響應式值處理
  const _responsiveLayout = useMemo(
    () => getResponsiveValue(layout),
    [layout, getResponsiveValue]
  );

  const _responsiveImagePosition = useMemo(
    () => getResponsiveValue(imagePosition),
    [imagePosition, getResponsiveValue]
  );

  const _responsiveImageRatio = useMemo(
    () => getResponsiveValue(imageRatio),
    [imageRatio, getResponsiveValue]
  );

  const _responsiveSize = useMemo(
    () => getResponsiveValue(size),
    [size, getResponsiveValue]
  );

  const _responsiveWidth = useMemo(
    () => getResponsiveValue(width),
    [width, getResponsiveValue]
  );

  const _responsiveHeight = useMemo(
    () => getResponsiveValue(height),
    [height, getResponsiveValue]
  );

  const _responsiveMinWidth = useMemo(
    () => getResponsiveValue(minWidth),
    [minWidth, getResponsiveValue]
  );

  const _responsiveMaxWidth = useMemo(
    () => getResponsiveValue(maxWidth),
    [maxWidth, getResponsiveValue]
  );

  const _responsivePadding = useMemo(
    () => getResponsiveValue(padding),
    [padding, getResponsiveValue]
  );

  const _responsiveMargin = useMemo(
    () => getResponsiveValue(margin),
    [margin, getResponsiveValue]
  );

  const _responsiveGap = useMemo(
    () => getResponsiveValue(gap),
    [gap, getResponsiveValue]
  );

  const _responsiveShowHeader = useMemo(
    () => getResponsiveValue(showHeader),
    [showHeader, getResponsiveValue]
  );

  const _responsiveShowImage = useMemo(
    () => getResponsiveValue(showImage),
    [showImage, getResponsiveValue]
  );

  const _responsiveShowActions = useMemo(
    () => getResponsiveValue(showActions),
    [showActions, getResponsiveValue]
  );

  const _responsiveShowFooter = useMemo(
    () => getResponsiveValue(showFooter),
    [showFooter, getResponsiveValue]
  );

  const _responsiveContentCollapse = useMemo(
    () => getResponsiveValue(contentCollapse),
    [contentCollapse, getResponsiveValue]
  );

  const _responsiveContentMaxHeight = useMemo(
    () => getResponsiveValue(contentMaxHeight),
    [contentMaxHeight, getResponsiveValue]
  );

  const _responsiveShowExpandButton = useMemo(
    () => getResponsiveValue(showExpandButton),
    [showExpandButton, getResponsiveValue]
  );

  // 展開/收起處理
  const _handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // 卡片樣式
  const _cardStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      backgroundColor: currentThemeData?.colors?.background?.primary,
      borderRadius: currentThemeData?.borderRadius?.md,
      boxShadow: currentThemeData?.shadow?.sm || '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      overflow: 'hidden',
      ...style,
    };

    // 響應式尺寸
    if (responsiveWidth) {
      baseStyle.width =
        typeof responsiveWidth === 'number'
          ? `${responsiveWidth}px`
          : responsiveWidth;
    }

    if (responsiveHeight) {
      baseStyle.height =
        typeof responsiveHeight === 'number'
          ? `${responsiveHeight}px`
          : responsiveHeight;
    }

    if (responsiveMinWidth) {
      baseStyle.minWidth =
        typeof responsiveMinWidth === 'number'
          ? `${responsiveMinWidth}px`
          : responsiveMinWidth;
    }

    if (responsiveMaxWidth) {
      baseStyle.maxWidth =
        typeof responsiveMaxWidth === 'number'
          ? `${responsiveMaxWidth}px`
          : responsiveMaxWidth;
    }

    // 響應式間距
    if (responsivePadding) {
      baseStyle.padding =
        typeof responsivePadding === 'number'
          ? `${responsivePadding}px`
          : responsivePadding;
    }

    if (responsiveMargin) {
      baseStyle.margin =
        typeof responsiveMargin === 'number'
          ? `${responsiveMargin}px`
          : responsiveMargin;
    }

    // 邊框
    if (bordered) {
      baseStyle.border = `1px solid ${currentThemeData?.colors?.border?.primary}`;
    }

    // 懸停效果
    if (hoverable) {
      baseStyle.cursor = 'pointer';
      if (isHovered) {
        baseStyle.transform = 'translateY(-4px)';
        baseStyle.boxShadow =
          currentThemeData?.shadow?.lg || '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      }
    }

    return baseStyle;
  }, [
    responsiveWidth,
    responsiveHeight,
    responsiveMinWidth,
    responsiveMaxWidth,
    responsivePadding,
    responsiveMargin,
    bordered,
    hoverable,
    isHovered,
    currentThemeData,
    style,
  ]);

  // 內容容器樣式
  const _contentContainerStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: responsiveLayout === 'horizontal' ? 'row' : 'column',
      gap: responsiveGap
        ? typeof responsiveGap === 'number'
          ? `${responsiveGap}px`
          : responsiveGap
        : '16px',
      height: '100%',
    };

    // 水平佈局時調整圖片位置
    if (responsiveLayout === 'horizontal') {
      if (responsiveImagePosition === 'left') {
        baseStyle.flexDirection = 'row';
      } else if (responsiveImagePosition === 'right') {
        baseStyle.flexDirection = 'row-reverse';
      }
    }

    return baseStyle;
  }, [responsiveLayout, responsiveImagePosition, responsiveGap]);

  // 圖片容器樣式
  const _imageContainerStyle = useMemo(() => {
    if (!responsiveShowImage) return { display: 'none' };

    const baseStyle: React.CSSProperties = {
      flexShrink: 0,
      overflow: 'hidden',
      borderRadius: currentThemeData?.borderRadius?.sm,
    };

    // 圖片比例
    if (responsiveImageRatio) {
      baseStyle.aspectRatio = responsiveImageRatio;
    }

    // 水平佈局時的圖片寬度
    if (responsiveLayout === 'horizontal') {
      baseStyle.width = '40%';
      baseStyle.minWidth = '120px';
    }

    return baseStyle;
  }, [
    responsiveShowImage,
    responsiveLayout,
    responsiveImageRatio,
    currentThemeData,
  ]);

  // 內容區域樣式
  const _contentStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minWidth: 0,
    };

    // 內容折疊
    if (responsiveContentCollapse && !isExpanded) {
      baseStyle.overflow = 'hidden';
      if (responsiveContentMaxHeight) {
        baseStyle.maxHeight =
          typeof responsiveContentMaxHeight === 'number'
            ? `${responsiveContentMaxHeight}px`
            : responsiveContentMaxHeight;
      } else {
        baseStyle.maxHeight = '100px';
      }
    }

    return baseStyle;
  }, [responsiveContentCollapse, isExpanded, responsiveContentMaxHeight]);

  // 渲染標題
  const _renderTitle = () => {
    if (!responsiveShowHeader || !title) return null;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 16px 0 16px',
          borderBottom: '1px solid transparent',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: currentThemeData?.typography?.sizes?.lg || '18px',
            fontWeight: currentThemeData?.typography?.weights?.bold || 'bold',
            color: currentThemeData?.colors?.text?.primary || '#000000',
            lineHeight:
              currentThemeData?.typography?.lineHeights?.tight || '1.2',
          }}
        >
          {title}
        </h3>
        {extra && <div style={{ marginLeft: '16px' }}>{extra}</div>}
      </div>
    );
  };

  // 渲染圖片
  const _renderImage = () => {
    if (!responsiveShowImage) return null;

    return (
      <div style={imageContainerStyle}>
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor:
              currentThemeData?.colors?.background?.secondary || '#f8f9fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: currentThemeData?.colors?.text?.secondary || '#666666',
            fontSize: '48px',
          }}
        >
          📷
        </div>
      </div>
    );
  };

  // 渲染內容
  const _renderContent = () => {
    return (
      <div style={contentStyle}>
        {children}

        {/* 展開按鈕 */}
        {responsiveContentCollapse && responsiveShowExpandButton && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '8px 0',
              borderTop: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
              marginTop: 'auto',
            }}
          >
            <Button variant='ghost' size='small' onClick={handleToggleExpand}>
              {isExpanded ? '收起' : '展開'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // 渲染操作區域
  const _renderActions = () => {
    if (!responsiveShowActions) return null;

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '8px',
          padding: '16px',
          borderTop: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
          backgroundColor:
            currentThemeData?.colors?.background?.secondary || '#f8f9fa',
        }}
      >
        <Button variant='outline' size='small'>
          操作1
        </Button>
        <Button variant='primary' size='small'>
          操作2
        </Button>
      </div>
    );
  };

  // 渲染頁腳
  const _renderFooter = () => {
    if (!responsiveShowFooter) return null;

    return (
      <div
        style={{
          padding: '16px',
          borderTop: `1px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
          backgroundColor:
            currentThemeData?.colors?.background?.secondary || '#f8f9fa',
          color: currentThemeData?.colors?.text?.secondary || '#666666',
          fontSize: currentThemeData?.typography?.sizes?.xs || '12px',
        }}
      >
        頁腳內容
      </div>
    );
  };

  // 加載狀態
  if (loading) {
    return (
      <div
        className={`responsive-card responsive-card-loading ${className}`}
        style={cardStyle}
        data-testid={dataTestId}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: currentThemeData?.colors?.text?.secondary,
          }}
        >
          載入中...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`responsive-card responsive-card-${responsiveLayout} ${className}`}
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={dataTestId}
    >
      {renderTitle()}

      <div style={contentContainerStyle}>
        {renderImage()}
        {renderContent()}
      </div>

      {renderActions()}
      {renderFooter()}
    </div>
  );
};
