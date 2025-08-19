import React, { useEffect } from 'react';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { performanceMonitorService } from '@/services/performanceMonitorService';
import { logger } from '@/utils/logger';

export const PerformanceMonitorScreen: React.FC = () => {
  useEffect(() => {
    // 初始化性能監控服務
    const initializePerformanceMonitoring = async () => {
      try {
        await performanceMonitorService.initialize();
        logger.info('性能監控頁面已初始化');
      } catch (error) {
        logger.error('性能監控頁面初始化失敗:', { error });
      }
    };

    initializePerformanceMonitoring();

    // 清理函數
    return () => {
      // 注意：這裡不清理 performanceMonitorService，因為它可能被其他組件使用
      logger.info('性能監控頁面已卸載');
    };
  }, []);

  return <PerformanceDashboard />;
};
