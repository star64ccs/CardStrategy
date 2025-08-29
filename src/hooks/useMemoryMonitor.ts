import { useEffect, useRef, useCallback } from 'react';

import { logger } from '../core/utils/logger';

// 臨時類型定義
interface MemoryLeakReport {
  growth: number;
  duration: number;
  timestamp: Date;
  componentName: string;
}

// 臨時實現
const _memoryMonitorService = {
  getCurrentMemoryUsage: () => ({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
  }),
  onMemoryLeak: (callback: (report: MemoryLeakReport) => void) => {},
  removeMemoryLeakCallback: (
    callback: (report: MemoryLeakReport) => void
  ) => {},
  getMemoryStats: () => ({ average: 0, peak: 0, current: 0 }),
};

interface UseMemoryMonitorOptions {
  componentName: string;
  enableLeakDetection?: boolean;
  memoryThreshold?: number; // MB
  onMemoryLeak?: (report: MemoryLeakReport) => void;
}

export const _useMemoryMonitor = (options: UseMemoryMonitorOptions) => {
  const {
    componentName,
    enableLeakDetection = true,
    memoryThreshold = 1, // 1MB
    onMemoryLeak,
  } = options;

  const _mountTime = useRef(Date.now());
  const _memoryStart = useRef<number>(0);
  const _memoryLeakCallback = useRef<
    ((report: MemoryLeakReport) => void) | null
  >(null);

  // 記錄組件掛載時的內存使用
  useEffect(() => {
    const _currentMemory = memoryMonitorService.getCurrentMemoryUsage();
    if (currentMemory) {
      memoryStart.current = currentMemory.usedJSHeapSize;
      logger.debug(`${componentName} 組件掛載`, {
        memory: `${Math.round(memoryStart.current / 1024 / 1024)}MB`,
      });
    }

    // 設置內存洩漏檢測回調
    if (enableLeakDetection && onMemoryLeak) {
      memoryLeakCallback.current = (report: MemoryLeakReport) => {
        logger.warn(`${componentName} 檢測到內存洩漏`, {
          growth: `${Math.round(report.growth / 1024 / 1024)}MB`,
          duration: `${Math.round(report.duration / 1000)}秒`,
        });
        onMemoryLeak(report);
      };
      memoryMonitorService.onMemoryLeak(memoryLeakCallback.current);
    }

    return () => {
      // 組件卸載時檢查內存變化
      const _currentMemory = memoryMonitorService.getCurrentMemoryUsage();
      if (currentMemory && memoryStart.current > 0) {
        const _memoryEnd = currentMemory.usedJSHeapSize;
        const _memoryDiff = memoryEnd - memoryStart.current;
        const _duration = Date.now() - mountTime.current;
        const _memoryDiffMB = memoryDiff / 1024 / 1024;

        logger.debug(`${componentName} 組件卸載`, {
          memoryDiff: `${Math.round(memoryDiffMB)}MB`,
          duration: `${Math.round(duration / 1000)}秒`,
          memoryStart: `${Math.round(memoryStart.current / 1024 / 1024)}MB`,
          memoryEnd: `${Math.round(memoryEnd / 1024 / 1024)}MB`,
        });

        // 檢查是否超過閾值
        if (memoryDiffMB > memoryThreshold) {
          logger.warn(`${componentName} 可能存在內存洩漏`, {
            growth: `${Math.round(memoryDiffMB)}MB`,
            threshold: `${memoryThreshold}MB`,
            lifecycle: `${Math.round(duration / 1000)}秒`,
          });
        }
      }

      // 清理內存洩漏回調
      if (memoryLeakCallback.current) {
        memoryMonitorService.removeMemoryLeakCallback(
          memoryLeakCallback.current
        );
        memoryLeakCallback.current = null;
      }
    };
  }, [componentName, enableLeakDetection, memoryThreshold, onMemoryLeak]);

  // 獲取當前內存使用情況
  const _getCurrentMemory = useCallback(() => {
    return memoryMonitorService.getCurrentMemoryUsage();
  }, []);

  // 獲取內存統計信息
  const _getMemoryStats = useCallback(() => {
    return memoryMonitorService.getMemoryStats();
  }, []);

  // 手動檢查內存洩漏
  const _checkMemoryLeak = useCallback(() => {
    const _currentMemory = memoryMonitorService.getCurrentMemoryUsage();
    if (currentMemory && memoryStart.current > 0) {
      const _memoryDiff = currentMemory.usedJSHeapSize - memoryStart.current;
      const _memoryDiffMB = memoryDiff / 1024 / 1024;

      if (memoryDiffMB > memoryThreshold) {
        logger.warn(`${componentName} 手動檢查發現內存洩漏`, {
          growth: `${Math.round(memoryDiffMB)}MB`,
          threshold: `${memoryThreshold}MB`,
        });
        return true;
      }
    }
    return false;
  }, [componentName, memoryThreshold]);

  return {
    getCurrentMemory,
    getMemoryStats,
    checkMemoryLeak,
  };
};
