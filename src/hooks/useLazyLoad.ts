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
 * Component懶加載 Hook
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

  const _isMounted = useRef(true);
  const _loadPromise = useRef<Promise<React.ComponentType<any>> | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (loadPromise.current) {
        lazyLoadService.cancelLoad(id);
      }
    };
  }, [id]);

  const _load = useCallback(async () => {
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
      const _component = await loadPromise.current;

      if (isMounted.current) {
        const _loadEndTime = Date.now();
        const _loadDuration =
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
        const _loadEndTime = Date.now();
        const _loadDuration =
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

  const _cancel = useCallback(() => {
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

  const _retry = useCallback(async () => {
    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.IDLE,
      error: null,
      retryAttempts: 0,
      isCancelled: false,
    }));
    await load();
  }, [load]);

  const _preload = useCallback(async () => {
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

  const _clearCache = useCallback(() => {
    lazyLoadService.clearCache(id);
  }, [id]);

  // Auto加載邏輯
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
 * Graph片懶加載 Hook
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

  const _isMounted = useRef(true);
  const _loadPromise = useRef<Promise<HTMLImageElement> | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (loadPromise.current) {
        lazyLoadService.cancelLoad(id);
      }
    };
  }, [id]);

  const _load = useCallback(async () => {
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
      const _image = await loadPromise.current;

      if (isMounted.current) {
        const _loadEndTime = Date.now();
        const _loadDuration =
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
        const _loadEndTime = Date.now();
        const _loadDuration =
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

  const _cancel = useCallback(() => {
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

  const _retry = useCallback(async () => {
    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.IDLE,
      error: null,
      retryAttempts: 0,
      isCancelled: false,
    }));
    await load();
  }, [load]);

  const _preload = useCallback(async () => {
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

  const _clearCache = useCallback(() => {
    lazyLoadService.clearCache(id);
  }, [id]);

  // Auto加載邏輯
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
 * Data懶加載 Hook
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

  const _isMounted = useRef(true);
  const _loadPromise = useRef<Promise<T> | null>(null);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (loadPromise.current) {
        lazyLoadService.cancelLoad(id);
      }
    };
  }, [id]);

  const _load = useCallback(async () => {
    if (state.status === LazyLoadStatus.LOADING || loadPromise.current) {
      return;
    }

    // CheckCustom加載Condition
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
      const _data = await loadPromise.current;

      if (isMounted.current) {
        const _loadEndTime = Date.now();
        const _loadDuration =
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
        const _loadEndTime = Date.now();
        const _loadDuration =
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

  const _cancel = useCallback(() => {
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

  const _retry = useCallback(async () => {
    setState(prev => ({
      ...prev,
      status: LazyLoadStatus.IDLE,
      error: null,
      retryAttempts: 0,
      isCancelled: false,
    }));
    await load();
  }, [load]);

  const _preload = useCallback(async () => {
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

  const _clearCache = useCallback(() => {
    lazyLoadService.clearCache(id);
  }, [id]);

  // Auto加載邏輯
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
 * Generic懶加載 Hook
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
 * 簡化的Component懶加載 Hook
 */
export function useLazyComponentSimple(
  path: string,
  options?: Partial<ComponentLazyLoadConfig>
): UseLazyLoadReturn<React.ComponentType<any>> {
  const _id = `component_${path.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const config: ComponentLazyLoadConfig = {
    path,
    strategy: LazyLoadStrategy.INTERSECTION_OBSERVER,
    priority: LazyLoadPriority.NORMAL,
    ...options,
  };

  return useLazyComponent(id, config);
}

/**
 * 簡化的Graph片懶加載 Hook
 */
export function useLazyImageSimple(
  src: string,
  options?: Partial<ImageLazyLoadConfig>
): UseLazyLoadReturn<string> {
  const _id = `image_${src.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const config: ImageLazyLoadConfig = {
    src,
    strategy: LazyLoadStrategy.INTERSECTION_OBSERVER,
    priority: LazyLoadPriority.NORMAL,
    ...options,
  };

  return useLazyImage(id, config);
}

/**
 * 簡化的Data懶加載 Hook
 */
export function useLazyDataSimple<T>(
  loader: () => Promise<T>,
  options?: Partial<DataLazyLoadConfig<T>>
): UseLazyLoadReturn<T> {
  const _id = `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const config: DataLazyLoadConfig<T> = {
    loader,
    strategy: LazyLoadStrategy.MANUAL,
    priority: LazyLoadPriority.NORMAL,
    ...options,
  };

  return useLazyData<T>(id, config);
}
