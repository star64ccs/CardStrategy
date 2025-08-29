import { useCallback, useRef, useEffect } from 'react';

/**
 * 性能優化工具類
 * 提供各種性能優化輔助功能
 */
export class PerformanceOptimizationUtils {
  /**
   * 防抖函數
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number,
    maxWait?: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    let lastCallTime = 0;
    
    return (...args: Parameters<T>) => {
      const currentTime = Date.now();
      
      if (currentTime - lastCallTime > (maxWait || delay)) {
        func(...args);
        lastCallTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func(...args);
          lastCallTime = Date.now();
        }, delay);
      }
    };
  }
  
  /**
   * 節流函數
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastCallTime = 0;
    
    return (...args: Parameters<T>) => {
      const currentTime = Date.now();
      
      if (currentTime - lastCallTime >= delay) {
        func(...args);
        lastCallTime = currentTime;
      }
    };
  }
  
  /**
   * 異步加載組件
   */
  static asyncLoadComponent(importFunc: () => Promise<any>) {
    return importFunc().then(module => module.default);
  }
  
  /**
   * 內存使用監控
   */
  static getMemoryUsage(): any {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  }
  
  /**
   * 性能測量
   */
  static measurePerformance(name: string, fn: () => any): any {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`Performance [${name}]: ${(end - start).toFixed(2)}ms`);
    
    return {
      result,
      duration: end - start,
    };
  }
  
  /**
   * 異步性能測量
   */
  static async measureAsyncPerformance<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`Async Performance [${name}]: ${(end - start).toFixed(2)}ms`);
    
    return {
      result,
      duration: end - start,
    };
  }
}

/**
 * React Hook: 防抖
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
}

/**
 * React Hook: 節流
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCallRef = useRef(0);
  
  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        callback(...args);
        lastCallRef.current = now;
      }
    },
    [callback, delay]
  ) as T;
}

/**
 * React Hook: 異步加載
 */
export function useAsyncLoad<T>(
  loadFn: () => Promise<T>,
  deps: any[] = []
): { data: T | null; loading: boolean; error: Error | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await loadFn();
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      mounted = false;
    };
  }, deps);
  
  return { data, loading, error };
}

/**
 * React Hook: 性能監控
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(performance.now());
  
  useEffect(() => {
    renderCountRef.current += 1;
    const currentTime = performance.now();
    const renderTime = currentTime - lastRenderTimeRef.current;
    
    console.log(`[${componentName}] Render #${renderCountRef.current}: ${renderTime.toFixed(2)}ms`);
    
    lastRenderTimeRef.current = currentTime;
  });
  
  return {
    renderCount: renderCountRef.current,
  };
}

export default PerformanceOptimizationUtils;
