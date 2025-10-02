// Response式Graph片Component

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useDesignSystem } from '../../hooks/useDesignSystem';
import { useResponsive } from '../../hooks/useResponsive';
import type { ResponsiveImageProps } from '../../types/responsive';

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes,
  srcSet,
  width,
  height,
  aspectRatio,
  objectFit = 'cover',
  objectPosition = 'center',
  lazy = true,
  placeholder,
  fallback,
  onLoad,
  onError,
  className = '',
  style = {},
  'data-testid': dataTestId,
}) => {
  const { getResponsiveValue } = useResponsive();
  const { currentTheme, currentThemeData } = useDesignSystem();

  const [imageSrc, setImageSrc] = useState<string>(placeholder || src);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isInView, setIsInView] = useState<boolean>(!lazy);

  // Response式ValueHandle
  const _responsiveWidth = useMemo(
    () => getResponsiveValue(width),
    [width, getResponsiveValue]
  );
  const _responsiveHeight = useMemo(
    () => getResponsiveValue(height),
    [height, getResponsiveValue]
  );
  const _responsiveAspectRatio = useMemo(
    () => getResponsiveValue(aspectRatio),
    [aspectRatio, getResponsiveValue]
  );
  const _responsiveSizes = useMemo(
    () => getResponsiveValue(sizes),
    [sizes, getResponsiveValue]
  );
  const _responsiveSrcSet = useMemo(
    () => getResponsiveValue(srcSet),
    [srcSet, getResponsiveValue]
  );
  const _responsiveObjectFit = useMemo(
    () => getResponsiveValue(objectFit),
    [objectFit, getResponsiveValue]
  );
  const _responsiveObjectPosition = useMemo(
    () => getResponsiveValue(objectPosition),
    [objectPosition, getResponsiveValue]
  );

  // 懶加載觀察器
  useEffect(() => {
    if (!lazy) return;

    const _observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    const _imageElement = document.querySelector(
      `[data-testid="${dataTestId}"]`
    );
    if (imageElement) {
      observer.observe(imageElement);
    }

    return () => {
      if (imageElement) {
        observer.unobserve(imageElement);
      }
    };
  }, [lazy, dataTestId]);

  // Graph片加載Handle
  const _handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setImageSrc(src);
    onLoad?.();
  }, [src, onLoad]);

  const _handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);

    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback);
    }

    onError?.();
  }, [fallback, imageSrc, onError]);

  // Dynamic樣式計算
  const _imageStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      objectFit: responsiveObjectFit,
      objectPosition: responsiveObjectPosition,
      transition: 'opacity 0.3s ease-in-out',
      opacity: isLoading ? 0.6 : 1,
      ...style,
    };

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

    if (responsiveAspectRatio) {
      baseStyle.aspectRatio = responsiveAspectRatio;
    }

    return baseStyle;
  }, [
    responsiveObjectFit,
    responsiveObjectPosition,
    responsiveWidth,
    responsiveHeight,
    responsiveAspectRatio,
    isLoading,
    style,
  ]);

  // 容器樣式
  const _containerStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor:
        currentThemeData?.colors?.background?.secondary || '#f8f9fa',
      borderRadius: currentThemeData?.borderRadius?.md || '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

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

    if (responsiveAspectRatio) {
      baseStyle.aspectRatio = responsiveAspectRatio;
    }

    return baseStyle;
  }, [
    responsiveWidth,
    responsiveHeight,
    responsiveAspectRatio,
    currentThemeData?.colors?.background?.secondary || '#f8f9fa',
    currentThemeData?.borderRadius?.md || '8px',
  ]);

  // 佔位符Content
  const _placeholderContent = useMemo(() => {
    if (isLoading) {
      return (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              currentThemeData?.colors?.background?.secondary || '#f8f9fa',
            color: currentThemeData?.colors?.text?.secondary || '#666666',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: `2px solid ${currentThemeData?.colors?.border?.primary || '#dee2e6'}`,
              borderTop: `2px solid ${currentThemeData?.colors?.brand?.primary || '#007bff'}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        </div>
      );
    }

    if (hasError && !fallback) {
      return (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              currentThemeData?.colors?.background?.secondary || '#f8f9fa',
            color: currentThemeData?.colors?.brand?.error || '#dc3545',
            fontSize: '14px',
            textAlign: 'center',
            padding: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
            <div>圖片加載失敗</div>
          </div>
        </div>
      );
    }

    return null;
  }, [isLoading, hasError, fallback, currentThemeData]);

  return (
    <div
      className={`responsive-image-container ${className}`}
      style={containerStyle}
      data-testid={dataTestId}
    >
      {isInView && (
        <img
          src={imageSrc}
          alt={alt}
          sizes={responsiveSizes}
          srcSet={responsiveSrcSet}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding='async'
        />
      )}

      {placeholderContent}

      {/* 無障礙Support */}
      {hasError && (
        <div
          role='img'
          aria-label={`${alt} - 圖片加載Failed`}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

// Add CSS 動畫
const _style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .responsive-image-container img {
    max-width: 100%;
    height: auto;
  }
`;
document.head.appendChild(style);
