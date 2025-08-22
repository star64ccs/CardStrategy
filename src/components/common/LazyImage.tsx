import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  ImageStyle,
  ViewStyle,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '@/config/theme';
import { CacheManager } from '@/utils/cacheManager';
import { logger } from '@/utils/logger';

const { width: screenWidth } = Dimensions.get('window');

export interface LazyImageProps {
  uri: string;
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  quality?: 'low' | 'medium' | 'high';
  preload?: boolean;
  onLoad?: () => void;
  onError?: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  cachePolicy?: 'memory' | 'disk' | 'both' | 'none';
  priority?: 'low' | 'normal' | 'high';
  retryCount?: number;
  retryDelay?: number;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  uri,
  style,
  containerStyle,
  placeholder,
  fallback,
  resizeMode = 'cover',
  quality = 'medium',
  preload = false,
  onLoad,
  onError,
  onLoadStart,
  onLoadEnd,
  cachePolicy = 'both',
  priority = 'normal',
  retryCount = 3,
  retryDelay = 1000,
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>(
    'loading'
  );
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [cachedUri, setCachedUri] = useState<string | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (uri) {
      loadImage();
    }
  }, [uri, cachePolicy, quality]);

  const getOptimizedUri = (originalUri: string): string => {
    // 根據質量設置調整圖片參數
    const qualityParams = {
      low: 'w=300&q=60',
      medium: 'w=600&q=80',
      high: 'w=1200&q=90',
    };

    const params = qualityParams[quality];

    // 如果URI已經包含參數，則添加新的參數
    if (originalUri.includes('?')) {
      return `${originalUri}&${params}`;
    }
    return `${originalUri}?${params}`;
  };

  const loadImage = async () => {
    if (!uri) return;

    try {
      setImageState('loading');
      onLoadStart?.();

      const optimizedUri = getOptimizedUri(uri);
      let finalUri = optimizedUri;

      // 檢查緩存
      if (cachePolicy !== 'none') {
        const cached = await CacheManager.getImage(optimizedUri);
        if (cached) {
          finalUri = cached;
          setCachedUri(cached);
        }
      }

      // 預加載圖片
      if (preload) {
        await preloadImage(finalUri);
      }

      if (isMounted.current) {
        setImageState('loaded');
        onLoad?.();

        // 動畫效果
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }

      // 緩存圖片
      if (cachePolicy !== 'none' && !cachedUri) {
        CacheManager.cacheImage(optimizedUri, finalUri);
      }
    } catch (error) {
      logger.error('LazyImage load error:', { error, uri });

      if (isMounted.current) {
        if (retryAttempts < retryCount) {
          setRetryAttempts((prev) => prev + 1);
          setTimeout(
            () => {
              if (isMounted.current) {
                loadImage();
              }
            },
            retryDelay * (retryAttempts + 1)
          );
        } else {
          setImageState('error');
          onError?.(error);
        }
      }
    } finally {
      onLoadEnd?.();
    }
  };

  const preloadImage = (imageUri: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imageUri;
    });
  };

  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }

    return (
      <View style={[styles.placeholder, containerStyle]}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderFallback = () => {
    if (fallback) {
      return fallback;
    }

    return (
      <View style={[styles.fallback, containerStyle]}>
        <View style={styles.fallbackIcon}>
          {/* 使用文字作為圖標 */}
          <span style={styles.fallbackText}>🖼️</span>
        </View>
      </View>
    );
  };

  if (imageState === 'loading') {
    return renderPlaceholder();
  }

  if (imageState === 'error') {
    return renderFallback();
  }

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Image
        source={{
          uri: cachedUri || uri,
          priority: priority === 'high' ? 'high' : 'normal',
        }}
        style={[styles.image, style]}
        resizeMode={resizeMode}
        onLoad={() => {
          setImageState('loaded');
          onLoad?.();
        }}
        onError={(error) => {
          setImageState('error');
          onError?.(error);
        }}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  fallback: {
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  fallbackIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: 24,
  },
});

// 導出便捷組件
export const CardImage: React.FC<
  Omit<LazyImageProps, 'resizeMode' | 'quality'>
> = (props) => (
  <LazyImage
    {...props}
    resizeMode="cover"
    quality="medium"
    cachePolicy="both"
  />
);

export const ThumbnailImage: React.FC<
  Omit<LazyImageProps, 'resizeMode' | 'quality'>
> = (props) => (
  <LazyImage {...props} resizeMode="cover" quality="low" cachePolicy="both" />
);

export const HighQualityImage: React.FC<
  Omit<LazyImageProps, 'resizeMode' | 'quality'>
> = (props) => (
  <LazyImage
    {...props}
    resizeMode="contain"
    quality="high"
    cachePolicy="both"
  />
);
