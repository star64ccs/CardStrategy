import { useEffect, useRef, useCallback } from 'react';
import { memoryMonitorService, MemoryLeakReport } from '@/services/memoryMonitorService';
import { logger } from '@/utils/logger';

interface UseMemoryMonitorOptions {
  componentName: string;
  enableLeakDetection?: boolean;
  memoryThreshold?: number; // MB
  onMemoryLeak?: (report: MemoryLeakReport) => void;
}

export const useMemoryMonitor = (options: UseMemoryMonitorOptions) => {
  const {
    componentName,
    enableLeakDetection = true,
    memoryThreshold = 1, // 1MB
    onMemoryLeak
  } = options;

  const mountTime = useRef(Date.now());
  const memoryStart = useRef<number>(0);
  const memoryLeakCallback = useRef<((report: MemoryLeakReport) => void) | null>(null);

  // 記錄組件掛載時的內存使用
  useEffect(() => {
    const currentMemory = memoryMonitorService.getCurrentMemoryUsage();
    if (currentMemory) {
      memoryStart.current = currentMemory.usedJSHeapSize;
      logger.debug(`${componentName} 組件掛載`, {
        memory: `${Math.round(memoryStart.current / 1024 / 1024)}MB`
      });
    }

    // 設置內存洩漏檢測回調
    if (enableLeakDetection && onMemoryLeak) {
      memoryLeakCallback.current = (report: MemoryLeakReport) => {
        logger.warn(`${componentName} 檢測到內存洩漏`, {
          growth: `${Math.round(report.growth / 1024 / 1024)}MB`,
          duration: `${Math.round(report.duration / 1000)}秒`
        });
        onMemoryLeak(report);
      };
      memoryMonitorService.onMemoryLeak(memoryLeakCallback.current);
    }

    return () => {
      // 組件卸載時檢查內存變化
      const currentMemory = memoryMonitorService.getCurrentMemoryUsage();
      if (currentMemory && memoryStart.current > 0) {
        const memoryEnd = currentMemory.usedJSHeapSize;
        const memoryDiff = memoryEnd - memoryStart.current;
        const duration = Date.now() - mountTime.current;
        const memoryDiffMB = memoryDiff / 1024 / 1024;

        logger.debug(`${componentName} 組件卸載`, {
          memoryDiff: `${Math.round(memoryDiffMB)}MB`,
          duration: `${Math.round(duration / 1000)}秒`,
          memoryStart: `${Math.round(memoryStart.current / 1024 / 1024)}MB`,
          memoryEnd: `${Math.round(memoryEnd / 1024 / 1024)}MB`
        });

        // 檢查是否超過閾值
        if (memoryDiffMB > memoryThreshold) {
          logger.warn(`${componentName} 可能存在內存洩漏`, {
            growth: `${Math.round(memoryDiffMB)}MB`,
            threshold: `${memoryThreshold}MB`,
            lifecycle: `${Math.round(duration / 1000)}秒`
          });
        }
      }

      // 清理內存洩漏回調
      if (memoryLeakCallback.current) {
        memoryMonitorService.removeMemoryLeakCallback(memoryLeakCallback.current);
        memoryLeakCallback.current = null;
      }
    };
  }, [componentName, enableLeakDetection, memoryThreshold, onMemoryLeak]);

  // 獲取當前內存使用情況
  const getCurrentMemory = useCallback(() => {
    return memoryMonitorService.getCurrentMemoryUsage();
  }, []);

  // 獲取內存統計信息
  const getMemoryStats = useCallback(() => {
    return memoryMonitorService.getMemoryStats();
  }, []);

  // 手動檢查內存洩漏
  const checkMemoryLeak = useCallback(() => {
    const currentMemory = memoryMonitorService.getCurrentMemoryUsage();
    if (currentMemory && memoryStart.current > 0) {
      const memoryDiff = currentMemory.usedJSHeapSize - memoryStart.current;
      const memoryDiffMB = memoryDiff / 1024 / 1024;

      if (memoryDiffMB > memoryThreshold) {
        logger.warn(`${componentName} 手動檢查發現內存洩漏`, {
          growth: `${Math.round(memoryDiffMB)}MB`,
          threshold: `${memoryThreshold}MB`
        });
        return true;
      }
    }
    return false;
  }, [componentName, memoryThreshold]);

  return {
    getCurrentMemory,
    getMemoryStats,
    checkMemoryLeak
  };
};
