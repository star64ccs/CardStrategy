import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Image,
  ImageProps,
  View,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { ImageOptimizer, SmartCache } from '@/utils/performanceOptimizer';

interface OptimizedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  width?: number;
  height?: number;
  quality?: number;
  placeholder?: string;
  fallback?: string;
  lazy?: boolean;
  cache?: boolean;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: any) => void;
  showLoadingIndicator?: boolean;
  loadingIndicatorColor?: string;
  loadingIndicatorSize?: 'small' | 'large';
}

const { width: screenWidth } = Dimensions.get('window');

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  uri,
  width,
  height,
  quality = 0.8,
  placeholder,
  fallback,
  lazy = true,
  cache = true,
  onLoadStart,
  onLoadEnd,
  onError,
  showLoadingIndicator = true,
  loadingIndicatorColor = '#999',
  loadingIndicatorSize = 'small',
  style,
  ...props
}) => {
  const [imageUri, setImageUri] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imageRef = useRef<Image>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 優化圖片 URL
  const getOptimizedUri = useCallback((originalUri: string): string => {
    if (!originalUri) return '';

    // 檢查緩存
    if (cache) {
      const cachedUri = SmartCache.getInstance().get(`image_${originalUri}`);
      if (cachedUri) return cachedUri;
    }

    // 優化圖片 URL
    const optimizedUri = ImageOptimizer.optimizeUrl(
      originalUri,
      width,
      height,
      quality
    );

    // 緩存優化後的 URL
    if (cache) {
      SmartCache.getInstance().set(`image_${originalUri}`, optimizedUri, 24 * 60 * 60 * 1000); // 24小時
    }

    return optimizedUri;
  }, [uri, width, height, quality, cache]);

  // 懶加載觀察器
  useEffect(() => {
    if (!lazy || Platform.OS !== 'web') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observerRef.current = observer;

    if (imageRef.current) {
      observer.observe(imageRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy]);

  // 載入圖片
  useEffect(() => {
    if (!isInView || !uri) return;

    const loadImage = async () => {
      setIsLoading(true);
      setHasError(false);
      onLoadStart?.();

      try {
        const optimizedUri = getOptimizedUri(uri);
        setImageUri(optimizedUri);
      } catch (error) {
        console.error('圖片優化失敗:', error);
        setImageUri(uri); // 使用原始 URL
      }
    };

    loadImage();
  }, [isInView, uri, getOptimizedUri, onLoadStart]);

  // 處理載入完成
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoadEnd?.();
  }, [onLoadEnd]);

  // 處理載入錯誤
  const handleError = useCallback((error: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);

    // 嘗試使用備用圖片
    if (fallback && imageUri !== fallback) {
      setImageUri(fallback);
    }
  }, [fallback, imageUri, onError]);

  // 渲染載入指示器
  const renderLoadingIndicator = () => {
    if (!showLoadingIndicator || !isLoading) return null;

    return (
      <View style={[styles.loadingContainer, { width, height }]}>
        <ActivityIndicator
          size={loadingIndicatorSize}
          color={loadingIndicatorColor}
        />
      </View>
    );
  };

  // 渲染佔位符
  const renderPlaceholder = () => {
    if (!placeholder || !isLoading) return null;

    return (
      <Image
        source={{ uri: placeholder }}
        style={[styles.placeholder, { width, height }, style]}
        resizeMode="cover"
      />
    );
  };

  // 渲染錯誤狀態
  const renderError = () => {
    if (!hasError || !fallback) return null;

    return (
      <Image
        source={{ uri: fallback }}
        style={[styles.errorImage, { width, height }, style]}
        resizeMode="cover"
        {...props}
      />
    );
  };

  // 如果還沒進入視窗且啟用了懶加載，顯示佔位符
  if (!isInView && lazy) {
    return (
      <View style={[styles.container, { width, height }, style]}>
        {renderPlaceholder()}
      </View>
    );
  }

  // 如果沒有 URI，顯示佔位符
  if (!imageUri) {
    return (
      <View style={[styles.container, { width, height }, style]}>
        {renderPlaceholder()}
        {renderLoadingIndicator()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { width, height }, style]}>
      <Image
        ref={imageRef}
        source={{ uri: imageUri }}
        style={[styles.image, { width, height }]}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      {renderLoadingIndicator()}
      {renderError()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden'
  },
  image: {
    width: '100%',
    height: '100%'
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  errorImage: {
    position: 'absolute',
    top: 0,
    left: 0
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  }
});

// 預加載圖片工具
export const preloadImages = (uris: string[]): Promise<void[]> => {
  return Promise.all(
    uris.map((uri) => {
      return new Promise<void>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(`Failed to load image: ${uri}`));
        image.src = uri;
      });
    })
  );
};

// 批量預加載圖片
export const batchPreloadImages = async (
  uris: string[],
  batchSize: number = 5
): Promise<void> => {
  for (let i = 0; i < uris.length; i += batchSize) {
    const batch = uris.slice(i, i + batchSize);
    await preloadImages(batch);
  }
};

// 清理圖片緩存
export const clearImageCache = (): void => {
  SmartCache.getInstance().clear();
};

// 獲取圖片尺寸
export const getImageDimensions = (uri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight
      });
    };
    image.onerror = () => reject(new Error(`Failed to get dimensions for: ${uri}`));
    image.src = uri;
  });
};
