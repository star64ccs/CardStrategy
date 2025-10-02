// 懶加載Component
import React, { useEffect, useRef } from 'react';

import {
  useLazyComponent,
  useLazyData,
  useLazyImage,
} from '../../hooks/useLazyLoad';
import type {
  ComponentLazyLoadConfig,
  DataLazyLoadConfig,
  ImageLazyLoadConfig,
  LazyLoadComponentProps,
  LazyLoadDataProps,
  LazyLoadImageProps,
} from '../../types/lazyLoading';
import { LazyLoadPriority, LazyLoadStrategy } from '../../types/lazyLoading';

// Default加載Component
const DefaultLoadingComponent: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '4px',
      minHeight: '100px',
    }}
  >
    <div
      style={{
        width: '20px',
        height: '20px',
        border: '2px solid #ddd',
        borderTop: '2px solid #007bff',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// DefaultErrorComponent
const DefaultErrorComponent: React.FC<{ error: Error; retry: () => void }> = ({
  error,
  retry,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#fff5f5',
      border: '1px solid #fed7d7',
      borderRadius: '4px',
      minHeight: '100px',
      color: '#c53030',
    }}
  >
    <div style={{ marginBottom: '10px' }}>⚠️ 加載失敗</div>
    <div
      style={{ fontSize: '12px', marginBottom: '10px', textAlign: 'center' }}
    >
      {error.message}
    </div>
    <button
      onClick={retry}
      style={{
        padding: '8px 16px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      重試
    </button>
  </div>
);

// Default佔位符Component
const DefaultPlaceholderComponent: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      minHeight: '100px',
      color: '#6c757d',
    }}
  >
    🖼️ 圖片佔位符
  </div>
);

/**
 * Component懶加載Component
 */
export const LazyLoadComponent: React.FC<LazyLoadComponentProps> = ({
  config,
  componentProps = {},
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  errorComponent: ErrorComponent = DefaultErrorComponent,
  fallbackComponent: FallbackComponent,
  onBeforeLoad,
  onLoadSuccess,
  onLoadError,
  onLoadComplete,
}) => {
  const _containerRef = useRef<HTMLDivElement>(null);
  const _id = `component_${config.path.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const { state, load, retry, isLoading, isLoaded, hasError } =
    useLazyComponent(id, config);

  // Settings Intersection Observer
  useEffect(() => {
    if (
      config.strategy === LazyLoadStrategy.INTERSECTION_OBSERVER &&
      containerRef.current
    ) {
      const _observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !isLoaded && !isLoading && !hasError) {
              onBeforeLoad?.();
              load();
            }
          });
        },
        {
          rootMargin: `${config.preloadDistance || 100}px`,
          threshold: 0.1,
        }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }
    return undefined;
  }, [
    config.strategy,
    config.preloadDistance,
    isLoaded,
    isLoading,
    hasError,
    load,
    onBeforeLoad,
  ]);

  // CallbackHandle
  useEffect(() => {
    if (state.status === 'loaded' && 'component' in state && state.component) {
      onLoadSuccess?.(state.component);
      onLoadComplete?.();
    } else if (state.status === 'error' && state.error) {
      onLoadError?.(state.error);
      onLoadComplete?.();
    }
    return undefined;
  }, [state.status, state, onLoadSuccess, onLoadError, onLoadComplete]);

  // 渲染邏輯
  if (isLoading) {
    return (
      <div ref={containerRef}>
        <LoadingComponent />
      </div>
    );
  }

  if (hasError && state.error) {
    return (
      <div ref={containerRef}>
        <ErrorComponent error={state.error} retry={retry} />
      </div>
    );
  }

  if (isLoaded && state.component) {
    const _Component = state.component;
    return (
      <div ref={containerRef}>
        <Component {...componentProps} />
      </div>
    );
  }

  if (FallbackComponent) {
    return (
      <div ref={containerRef}>
        <FallbackComponent />
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <LoadingComponent />
    </div>
  );
};

/**
 * Graph片懶加載Component
 */
export const LazyLoadImage: React.FC<LazyLoadImageProps> = ({
  config,
  style,
  className,
  imgProps = {},
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  errorComponent: ErrorComponent = DefaultErrorComponent,
  placeholderComponent: PlaceholderComponent = DefaultPlaceholderComponent,
  onBeforeLoad,
  onLoadSuccess,
  onLoadError,
  onLoadComplete,
}) => {
  const _containerRef = useRef<HTMLDivElement>(null);
  const _id = `image_${config.src.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const { state, load, retry, isLoading, isLoaded, hasError } = useLazyImage(
    id,
    config
  );

  // Settings Intersection Observer
  useEffect(() => {
    if (
      config.strategy === LazyLoadStrategy.INTERSECTION_OBSERVER &&
      containerRef.current
    ) {
      const _observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !isLoaded && !isLoading && !hasError) {
              onBeforeLoad?.();
              load();
            }
          });
        },
        {
          rootMargin: `${config.preloadDistance || 100}px`,
          threshold: 0.1,
        }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }
    return undefined;
  }, [
    config.strategy,
    config.preloadDistance,
    isLoaded,
    isLoading,
    hasError,
    load,
    onBeforeLoad,
  ]);

  // CallbackHandle
  useEffect(() => {
    if (state.status === 'loaded' && state.image) {
      onLoadSuccess?.(state.image);
      onLoadComplete?.();
    } else if (state.status === 'error' && state.error) {
      onLoadError?.(state.error);
      onLoadComplete?.();
    }
    return undefined;
  }, [
    state.status,
    state.image,
    state.error,
    onLoadSuccess,
    onLoadError,
    onLoadComplete,
  ]);

  // 渲染邏輯
  if (isLoading) {
    return (
      <div ref={containerRef} style={style} className={className}>
        <LoadingComponent />
      </div>
    );
  }

  if (hasError && state.error) {
    return (
      <div ref={containerRef} style={style} className={className}>
        <ErrorComponent error={state.error} retry={retry} />
      </div>
    );
  }

  if (isLoaded && state.currentSrc) {
    return (
      <div ref={containerRef} style={style} className={className}>
        <img
          src={state.currentSrc}
          alt={imgProps.alt || ''}
          {...imgProps}
          style={{
            width: '100%',
            height: 'auto',
            ...imgProps.style,
          }}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} style={style} className={className}>
      <PlaceholderComponent />
    </div>
  );
};

/**
 * Data懶加載Component
 */
export const LazyLoadData: React.FC<LazyLoadDataProps> = ({
  config,
  children,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
  errorComponent: ErrorComponent = DefaultErrorComponent,
  onBeforeLoad,
  onLoadSuccess,
  onLoadError,
  onLoadComplete,
}) => {
  const _containerRef = useRef<HTMLDivElement>(null);
  const _id = `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const { state, load, retry, isLoading, isLoaded, hasError } = useLazyData(
    id,
    config
  );

  // Settings Intersection Observer
  useEffect(() => {
    if (
      config.strategy === LazyLoadStrategy.INTERSECTION_OBSERVER &&
      containerRef.current
    ) {
      const _observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !isLoaded && !isLoading && !hasError) {
              onBeforeLoad?.();
              load();
            }
          });
        },
        {
          rootMargin: `${config.preloadDistance || 100}px`,
          threshold: 0.1,
        }
      );

      observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
      };
    }
    return undefined;
  }, [
    config.strategy,
    config.preloadDistance,
    isLoaded,
    isLoading,
    hasError,
    load,
    onBeforeLoad,
  ]);

  // CallbackHandle
  useEffect(() => {
    if (state.status === 'loaded' && 'data' in state && state.data) {
      onLoadSuccess?.(state.data);
      onLoadComplete?.();
    } else if (state.status === 'error' && state.error) {
      onLoadError?.(state.error);
      onLoadComplete?.();
    }
  }, [state.status, state, onLoadSuccess, onLoadError, onLoadComplete]);

  // 渲染邏輯
  if (isLoading) {
    return (
      <div ref={containerRef}>
        <LoadingComponent />
      </div>
    );
  }

  if (hasError && state.error) {
    return (
      <div ref={containerRef}>
        <ErrorComponent error={state.error} retry={retry} />
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      {children('data' in state ? state.data : null, state as any)}
    </div>
  );
};

/**
 * 簡化的Component懶加載Component
 */
export const LazyComponent: React.FC<{
  path: string;
  componentProps?: Record<string, any>;
  loadingComponent?: React.ComponentType<any>;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  fallbackComponent?: React.ComponentType<any>;
  strategy?: LazyLoadStrategy;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  preloadDistance?: number;
  onBeforeLoad?: () => void;
  onLoadSuccess?: (component: React.ComponentType<any>) => void;
  onLoadError?: (error: Error) => void;
  onLoadComplete?: () => void;
}> = ({
  path,
  componentProps,
  loadingComponent,
  errorComponent,
  fallbackComponent,
  strategy = LazyLoadStrategy.INTERSECTION_OBSERVER,
  priority = 'normal',
  preloadDistance = 100,
  onBeforeLoad,
  onLoadSuccess,
  onLoadError,
  onLoadComplete,
}) => {
  const config: ComponentLazyLoadConfig = {
    path,
    strategy,
    priority: priority as LazyLoadPriority,
    preloadDistance,
    enableCache: true,
    cacheTime: 300000, // 5Minute
  };

  return (
    <LazyLoadComponent
      config={config}
      componentProps={componentProps}
      loadingComponent={loadingComponent}
      errorComponent={errorComponent}
      fallbackComponent={fallbackComponent}
      onBeforeLoad={onBeforeLoad}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      onLoadComplete={onLoadComplete}
    />
  );
};

/**
 * 簡化的Graph片懶加載Component
 */
export const LazyImage: React.FC<{
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
  loadingComponent?: React.ComponentType<any>;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  placeholderComponent?: React.ComponentType<any>;
  strategy?: LazyLoadStrategy;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  preloadDistance?: number;
  quality?: 'low' | 'medium' | 'high';
  onBeforeLoad?: () => void;
  onLoadSuccess?: (image: HTMLImageElement) => void;
  onLoadError?: (error: Error) => void;
  onLoadComplete?: () => void;
}> = ({
  src,
  alt,
  style,
  className,
  imgProps,
  loadingComponent,
  errorComponent,
  placeholderComponent,
  strategy = LazyLoadStrategy.INTERSECTION_OBSERVER,
  priority = 'normal',
  preloadDistance = 100,
  quality = 'medium',
  onBeforeLoad,
  onLoadSuccess,
  onLoadError,
  onLoadComplete,
}) => {
  const config: ImageLazyLoadConfig = {
    src,
    strategy,
    priority: priority as LazyLoadPriority,
    preloadDistance,
    quality,
    enableCache: true,
    cacheTime: 300000, // 5Minute
  };

  return (
    <LazyLoadImage
      config={config}
      style={style}
      className={className}
      imgProps={{ ...imgProps, alt }}
      loadingComponent={loadingComponent}
      errorComponent={errorComponent}
      placeholderComponent={placeholderComponent}
      onBeforeLoad={onBeforeLoad}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      onLoadComplete={onLoadComplete}
    />
  );
};

/**
 * 簡化的Data懶加載Component
 */
export const LazyData: React.FC<{
  loader: () => Promise<any>;
  initialData?: unknown;
  children: (data: unknown, state: unknown) => React.ReactNode;
  loadingComponent?: React.ComponentType<any>;
  errorComponent?: React.ComponentType<{ error: Error; retry: () => void }>;
  strategy?: LazyLoadStrategy;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  preloadDistance?: number;
  onBeforeLoad?: () => void;
  onLoadSuccess?: (data: unknown) => void;
  onLoadError?: (error: Error) => void;
  onLoadComplete?: () => void;
}> = ({
  loader,
  initialData,
  children,
  loadingComponent,
  errorComponent,
  strategy = LazyLoadStrategy.MANUAL,
  priority = 'normal',
  preloadDistance = 100,
  onBeforeLoad,
  onLoadSuccess,
  onLoadError,
  onLoadComplete,
}) => {
  const config: DataLazyLoadConfig = {
    loader,
    initialData,
    strategy,
    priority: priority as LazyLoadPriority,
    preloadDistance,
    enableCache: true,
    cacheTime: 300000, // 5Minute
  };

  return (
    <LazyLoadData
      config={config}
      children={children}
      loadingComponent={loadingComponent}
      errorComponent={errorComponent}
      onBeforeLoad={onBeforeLoad}
      onLoadSuccess={onLoadSuccess}
      onLoadError={onLoadError}
      onLoadComplete={onLoadComplete}
    />
  );
};
