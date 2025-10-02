// 懶加載 React Hook
import { useState, useEffect, useCallback, useRef } from 'react';

import { lazyLoadService } from '../services/lazyLoadService';
import {
  LazyLoadPriority,
  LazyLoadService,
  LazyLoadStatus,
  LazyLoadStrategy,
  type ComponentLazyLoadConfig,
  type ComponentLazyLoadState,
  type DataLazyLoadConfig,
  type DataLazyLoadState,
  type ImageLazyLoadConfig,
  type ImageLazyLoadState,
  type LazyLoadEvent,
  type UseLazyLoadReturn,
} from '../types/lazyLoading';

/**
 * 組件懶加載 Hook
 */
export function useLazyComponent(
  id: string,
  config: ComponentLazyLoadConfig
): UseLazyLoadReturn<React.ComponentType<any>> {
  const [state, setState] = useState<ComponentLazyLoadState>({
    status: LazyLoadStatus.IDLE,
    component: null,
    error: null,
    loadStartTime: null,
    loadEndTime: null,
    loadDuration: null,
    retryAttempts: 0,
    isCancelled: false,
    isPreloaded: false,
  });

  const isMounted = useRef(true);
  const loadPromise = useRef<Promise<React.ComponentType<any>> | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (loadPromise.current) {
        lazyLoadService.cancelLoad(id);
      }
    };
  }, [id]);

  const load = useCallback(async () => {
    if (state.status === LazyLoadStatus.LOADING || loadPromise.current) {
      return;
    }

    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.LOADING,
      loadStartTime: Date.now(),
      error: null,
    }));

    try {
      loadPromise.current = lazyLoadService.loadComponent(id);
      const component = await loadPromise.current;

      if (isMounted.current) {
        const loadEndTime = Date.now();
        const loadDuration =
          loadEndTime - (state.loadStartTime || loadEndTime);

        setState(prev => ({
          ...prev,
          status: LazyLoadStatus.LOADED,
          component,
          loadEndTime,
          loadDuration,
        }));
      }
    } catch (error) {
      if (isMounted.current) {
        const loadEndTime = Date.now();
        const loadDuration =
          loadEndTime - (state.loadStartTime || loadEndTime);

        setState(prev => ({
          ...prev,
          status: LazyLoadStatus.ERROR,
          error: error as Error,
          loadEndTime,
          loadDuration,
          retryAttempts: prev.retryAttempts + 1,
        }));
      }
    } finally {
      loadPromise.current = null;
    }
  }, [id, state.status, state.loadStartTime]);

  const cancel = useCallback(() => {
    if (loadPromise.current) {
      lazyLoadService.cancelLoad(id);
      loadPromise.current = null;
    }

    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.CANCELLED,
      isCancelled: true,
    }));
  }, [id]);

  const retry = useCallback(async () => {
    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.IDLE,
      error: null,
      retryAttempts: 0,
      isCancelled: false,
    }));
    await load();
  }, [load]);

  const preload = useCallback(async () => {
    try {
      await lazyLoadService.preloadComponent(id);
      setState(prev => ({
        ...prev,
        isPreloaded: true,
      }));
    } catch (error) {
      console.warn('Failed to preload component:', error);
    }
  }, [id]);

  const clearCache = useCallback(() => {
    lazyLoadService.clearCache(id);
  }, [id]);

  // 自動加載邏輯
  useEffect(() => {
    if (config.strategy === LazyLoadStrategy.IMMEDIATE) {
      load();
    }
  }, [config.strategy, load]);

  return {
    state,
    load,
    cancel,
    retry,
    preload,
    clearCache,
    isLoading: state.status === LazyLoadStatus.LOADING,
    isLoaded: state.status === LazyLoadStatus.LOADED,
    hasError: state.status === LazyLoadStatus.ERROR,
    isCancelled: state.isCancelled,
  };
}

/**
 * 圖片懶加載 Hook
 */
export function useLazyImage(
  id: string,
  config: ImageLazyLoadConfig
): UseLazyLoadReturn<string> {
  const [state, setState] = useState<ImageLazyLoadState>({
    status: LazyLoadStatus.IDLE,
    image: null,
    error: null,
    loadStartTime: null,
    loadEndTime: null,
    loadDuration: null,
    retryAttempts: 0,
    isCancelled: false,
    isPreloaded: false,
    currentSrc: null,
  });

  const isMounted = useRef(true);
  const loadPromise = useRef<Promise<HTMLImageElement> | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (loadPromise.current) {
        lazyLoadService.cancelLoad(id);
      }
    };
  }, [id]);

  const load = useCallback(async () => {
    if (state.status === LazyLoadStatus.LOADING || loadPromise.current) {
      return;
    }

    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.LOADING,
      loadStartTime: Date.now(),
      error: null,
    }));

    try {
      loadPromise.current = lazyLoadService.loadImage(id);
      const image = await loadPromise.current;

      if (isMounted.current) {
        const loadEndTime = Date.now();
        const loadDuration =
          loadEndTime - (state.loadStartTime || loadEndTime);

        setState(prev => ({
          ...prev,
          status: LazyLoadStatus.LOADED,
          image,
          currentSrc: image.src,
          loadEndTime,
          loadDuration,
        }));
      }
    } catch (error) {
      if (isMounted.current) {
        const loadEndTime = Date.now();
        const loadDuration =
          loadEndTime - (state.loadStartTime || loadEndTime);

        setState(prev => ({
          ...prev,
          status: LazyLoadStatus.ERROR,
          error: error as Error,
          loadEndTime,
          loadDuration,
          retryAttempts: prev.retryAttempts + 1,
        }));
      }
    } finally {
      loadPromise.current = null;
    }
  }, [id, state.status, state.loadStartTime]);

  const cancel = useCallback(() => {
    if (loadPromise.current) {
      lazyLoadService.cancelLoad(id);
      loadPromise.current = null;
    }

    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.CANCELLED,
      isCancelled: true,
    }));
  }, [id]);

  const retry = useCallback(async () => {
    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.IDLE,
      error: null,
      retryAttempts: 0,
      isCancelled: false,
    }));
    await load();
  }, [load]);

  const preload = useCallback(async () => {
    try {
      await lazyLoadService.preloadImage(id);
      setState(prev => ({
        ...prev,
        isPreloaded: true,
      }));
    } catch (error) {
      console.warn('Failed to preload image:', error);
    }
  }, [id]);

  const clearCache = useCallback(() => {
    lazyLoadService.clearCache(id);
  }, [id]);

  // 自動加載邏輯
  useEffect(() => {
    if (config.strategy === LazyLoadStrategy.IMMEDIATE) {
      load();
    }
  }, [config.strategy, load]);

  return {
    state,
    load,
    cancel,
    retry,
    preload,
    clearCache,
    isLoading: state.status === LazyLoadStatus.LOADING,
    isLoaded: state.status === LazyLoadStatus.LOADED,
    hasError: state.status === LazyLoadStatus.ERROR,
    isCancelled: state.isCancelled,
  };
}

/**
 * 數據懶加載 Hook
 */
export function useLazyData<T>(
  id: string,
  config: DataLazyLoadConfig<T>
): UseLazyLoadReturn<T> {
  const [state, setState] = useState<DataLazyLoadState<T>>({
    status: LazyLoadStatus.IDLE,
    data: config.initialData || null,
    error: null,
    loadStartTime: null,
    loadEndTime: null,
    loadDuration: null,
    retryAttempts: 0,
    isCancelled: false,
    isPreloaded: false,
  });

  const isMounted = useRef(true);
  const loadPromise = useRef<Promise<T> | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (loadPromise.current) {
        lazyLoadService.cancelLoad(id);
      }
    };
  }, [id]);

  const load = useCallback(async () => {
    if (state.status === LazyLoadStatus.LOADING || loadPromise.current) {
      return;
    }

    // 檢查自定義加載條件
    if (config.shouldLoad && !config.shouldLoad()) {
      return;
    }

    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.LOADING,
      loadStartTime: Date.now(),
      error: null,
    }));

    try {
      loadPromise.current = lazyLoadService.loadData<T>(id);
      const data = await loadPromise.current;

      if (isMounted.current) {
        const loadEndTime = Date.now();
        const loadDuration =
          loadEndTime - (state.loadStartTime || loadEndTime);

        setState(prev => ({
          ...prev,
          status: LazyLoadStatus.LOADED,
          data,
          loadEndTime,
          loadDuration,
        }));
      }
    } catch (error) {
      if (isMounted.current) {
        const loadEndTime = Date.now();
        const loadDuration =
          loadEndTime - (state.loadStartTime || loadEndTime);

        setState(prev => ({
          ...prev,
          status: LazyLoadStatus.ERROR,
          error: error as Error,
          loadEndTime,
          loadDuration,
          retryAttempts: prev.retryAttempts + 1,
        }));
      }
    } finally {
      loadPromise.current = null;
    }
  }, [id, config.shouldLoad, state.status, state.loadStartTime]);

  const cancel = useCallback(() => {
    if (loadPromise.current) {
      lazyLoadService.cancelLoad(id);
      loadPromise.current = null;
    }

    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.CANCELLED,
      isCancelled: true,
    }));
  }, [id]);

  const retry = useCallback(async () => {
    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.IDLE,
      error: null,
      retryAttempts: 0,
      isCancelled: false,
    }));
    await load();
  }, [load]);

  const preload = useCallback(async () => {
    try {
      await lazyLoadService.preloadData<T>(id);
      setState(prev => ({
        ...prev,
        isPreloaded: true,
      }));
    } catch (error) {
      console.warn('Failed to preload data:', error);
    }
  }, [id]);

  const clearCache = useCallback(() => {
    lazyLoadService.clearCache(id);
  }, [id]);

  // 自動加載邏輯
  useEffect(() => {
    if (config.strategy === LazyLoadStrategy.IMMEDIATE) {
      load();
    }
  }, [config.strategy, load]);

  return {
    state: state as any,
    load,
    cancel,
    retry,
    preload,
    clearCache,
    isLoading: state.status === LazyLoadStatus.LOADING,
    isLoaded: state.status === LazyLoadStatus.LOADED,
    hasError: state.status === LazyLoadStatus.ERROR,
    isCancelled: state.isCancelled,
  };
}

/**
 * 通用懶加載 Hook
 */
export function useLazyLoad<T>(
  id: string,
  type: 'component' | 'image' | 'data',
  config: ComponentLazyLoadConfig | ImageLazyLoadConfig | DataLazyLoadConfig<T>
): UseLazyLoadReturn<T> {
  switch (type) {
    case 'component':
      return useLazyComponent(
        id,
        config as ComponentLazyLoadConfig
      ) as UseLazyLoadReturn<T>;
    case 'image':
      return useLazyImage(
        id,
        config as ImageLazyLoadConfig
      ) as UseLazyLoadReturn<T>;
    case 'data':
      return useLazyData<T>(id, config as DataLazyLoadConfig<T>);
    default:
      throw new Error(`Unsupported lazy load type: ${type}`);
  }
}

/**
 * 簡化的組件懶加載 Hook
 */
export function useLazyComponentSimple(
  path: string,
  options?: Partial<ComponentLazyLoadConfig>
): UseLazyLoadReturn<React.ComponentType<any>> {
  const id = `component_${path.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const config: ComponentLazyLoadConfig = {
    path,
    strategy: LazyLoadStrategy.INTERSECTION_OBSERVER,
    priority: LazyLoadPriority.NORMAL,
    ...options,
  };

  return useLazyComponent(id, config);
}

/**
 * 簡化的圖片懶加載 Hook
 */
export function useLazyImageSimple(
  src: string,
  options?: Partial<ImageLazyLoadConfig>
): UseLazyLoadReturn<string> {
  const id = `image_${src.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const config: ImageLazyLoadConfig = {
    src,
    strategy: LazyLoadStrategy.INTERSECTION_OBSERVER,
    priority: LazyLoadPriority.NORMAL,
    ...options,
  };

  return useLazyImage(id, config);
}

/**
 * 簡化的數據懶加載 Hook
 */
export function useLazyDataSimple<T>(
  loader: () => Promise<T>,
  options?: Partial<DataLazyLoadConfig<T>>
): UseLazyLoadReturn<T> {
  const id = `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const config: DataLazyLoadConfig<T> = {
    loader,
    strategy: LazyLoadStrategy.MANUAL,
    priority: LazyLoadPriority.NORMAL,
    ...options,
  };

  return useLazyData<T>(id, config);
}
