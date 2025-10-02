import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../store';
import { useAppDispatch } from '../../../store/hooks';
import {
  clearCurrentPrice,
  clearError,
  clearMarketAnalysis,
  clearPriceHistory,
  createPriceAlert,
  deletePriceAlert,
  fetchCurrentPrice,
  fetchMarketStats,
  fetchPriceHistory,
  fetchUserAlerts,
  generateMarketAnalysis,
  initializePricingService,
  resetAlertForm,
  selectAlertForm,
  selectCurrentPrice,
  selectLastUpdated,
  selectMarketAnalysis,
  selectMarketStats,
  selectPriceHistory,
  selectPricingError,
  selectPricingLoading,
  selectSelectedCardId,
  selectSelectedPeriod,
  selectUserAlerts,
  setSelectedCardId,
  setSelectedPeriod,
  updateAlertForm,
  updateAlertStatus,
} from '../../../store/slices/pricingSlice';
import type { PriceAlert, PriceRequest } from '../types/pricing';
import { PriceAlertType } from '../types/pricing';

/**
 * 市場價格系統自定義 Hook
 * 提供價格查詢、歷史分析、警報管理等功能
 */
export const usePricing = () => {
  const dispatch = useAppDispatch();

  // 選擇器
  const currentPrice = useSelector((state: RootState) =>
    selectCurrentPrice(state)
  );
  const priceHistory = useSelector((state: RootState) =>
    selectPriceHistory(state)
  );
  const marketAnalysis = useSelector((state: RootState) =>
    selectMarketAnalysis(state)
  );
  const userAlerts = useSelector((state: RootState) =>
    selectUserAlerts(state)
  );
  const marketStats = useSelector((state: RootState) =>
    selectMarketStats(state)
  );
  const loading = useSelector((state: RootState) =>
    selectPricingLoading(state)
  );
  const error = useSelector((state: RootState) => selectPricingError(state));
  const lastUpdated = useSelector((state: RootState) =>
    selectLastUpdated(state)
  );
  const selectedCardId = useSelector((state: RootState) =>
    selectSelectedCardId(state)
  );
  const selectedPeriod = useSelector((state: RootState) =>
    selectSelectedPeriod(state)
  );
  const alertForm = useSelector((state: RootState) => selectAlertForm(state));

  // 初始化服務
  const initialize = useCallback(
    async (config?: unknown) => {
      try {
        await (dispatch(initializePricingService(config)) as any).unwrap();
      } catch (error) {
        console.error('初始化價格服務失敗:', error);
      }
    },
    [dispatch]
  );

  // 獲取當前價格
  const getCurrentPrice = useCallback(
    async (request: PriceRequest) => {
      try {
        await (dispatch(fetchCurrentPrice(request)) as any).unwrap();
      } catch (error) {
        console.error('獲取當前價格失敗:', error);
      }
    },
    [dispatch]
  );

  // 獲取價格歷史
  const getPriceHistory = useCallback(
    async (cardId: string, period = '30d') => {
      try {
        await (dispatch(fetchPriceHistory({ cardId, period })) as any).unwrap();
      } catch (error) {
        console.error('獲取價格歷史失敗:', error);
      }
    },
    [dispatch]
  );

  // 創建價格警報
  const createAlert = useCallback(
    async (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
      try {
        await (dispatch(createPriceAlert(alert)) as any).unwrap();
      } catch (error) {
        console.error('創建價格警報失敗:', error);
      }
    },
    [dispatch]
  );

  // 獲取用戶警報
  const getUserAlerts = useCallback(
    async (cardId?: string) => {
      try {
        await (dispatch(fetchUserAlerts(cardId)) as any).unwrap();
      } catch (error) {
        console.error('獲取用戶警報失敗:', error);
      }
    },
    [dispatch]
  );

  // 更新警報狀態
  const updateAlert = useCallback(
    async (alertId: string, isActive: boolean) => {
      try {
        await (
          dispatch(updateAlertStatus({ alertId, isActive })) as any
        ).unwrap();
      } catch (error) {
        console.error('更新警報狀態失敗:', error);
      }
    },
    [dispatch]
  );

  // 刪除警報
  const deleteAlert = useCallback(
    async (alertId: string) => {
      try {
        await (dispatch(deletePriceAlert(alertId)) as any).unwrap();
      } catch (error) {
        console.error('刪除警報失敗:', error);
      }
    },
    [dispatch]
  );

  // 獲取市場統計
  const getMarketStats = useCallback(async () => {
    try {
      await (dispatch(fetchMarketStats()) as any).unwrap();
    } catch (error) {
      console.error('獲取市場統計失敗:', error);
    }
  }, [dispatch]);

  // 生成市場分析
  const generateAnalysis = useCallback(
    async (cardId: string) => {
      try {
        await (dispatch(generateMarketAnalysis(cardId)) as any).unwrap();
      } catch (error) {
        console.error('生成市場分析失敗:', error);
      }
    },
    [dispatch]
  );

  // 設置選中的卡牌ID
  const setCardId = useCallback(
    (cardId: string) => {
      dispatch(setSelectedCardId(cardId));
    },
    [dispatch]
  );

  // 設置選中的期間
  const setPeriod = useCallback(
    (period: string) => {
      dispatch(setSelectedPeriod(period));
    },
    [dispatch]
  );

  // 更新警報表單
  const updateForm = useCallback(
    (formData: Partial<typeof alertForm>) => {
      dispatch(updateAlertForm(formData));
    },
    [dispatch]
  );

  // 重置警報表單
  const resetForm = useCallback(() => {
    dispatch(resetAlertForm());
  }, [dispatch]);

  // 清除錯誤
  const clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 清除當前價格
  const clearPrice = useCallback(() => {
    dispatch(clearCurrentPrice());
  }, [dispatch]);

  // 清除價格歷史
  const clearHistory = useCallback(() => {
    dispatch(clearPriceHistory());
  }, [dispatch]);

  // 清除市場分析
  const clearAnalysis = useCallback(() => {
    dispatch(clearMarketAnalysis());
  }, [dispatch]);

  // 計算價格變化顏色
  const getPriceChangeColor = useCallback((change: number) => {
    if (change > 0) return '#4CAF50'; // 綠色
    if (change < 0) return '#F44336'; // 紅色
    return '#9E9E9E'; // 灰色
  }, []);

  // 格式化價格
  const formatPrice = useCallback((price: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  }, []);

  // 格式化百分比
  const formatPercentage = useCallback((percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  }, []);

  // 格式化日期
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // 檢查是否有活躍警報
  const hasActiveAlerts = useMemo(() => {
    return userAlerts.some((alert: unknown) => alert.isActive);
  }, [userAlerts]);

  // 獲取特定卡牌的警報
  const getCardAlerts = useCallback(
    (cardId: string) => {
      return userAlerts.filter((alert: unknown) => alert.cardId === cardId);
    },
    [userAlerts]
  );

  // 檢查價格是否在警報範圍內
  const checkPriceAlerts = useCallback(
    (cardId: string, currentPrice: number) => {
      const cardAlerts = getCardAlerts(cardId);
      return cardAlerts.filter((alert: unknown) => {
        if (!alert.isActive) return false;

        switch (alert.type) {
          case PriceAlertType.ABOVE:
            return currentPrice > alert.threshold;
          case PriceAlertType.BELOW:
            return currentPrice < alert.threshold;
          default:
            return false;
        }
      });
    },
    [getCardAlerts]
  );

  // 獲取趨勢圖標
  const getTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'rising':
        return '📈';
      case 'falling':
        return '📉';
      case 'stable':
        return '➡️';
      case 'volatile':
        return '📊';
      default:
        return '❓';
    }
  }, []);

  // 獲取市場狀態顏色
  const getMarketStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#9E9E9E';
      case 'suspended':
        return '#FF9800';
      case 'maintenance':
        return '#2196F3';
      default:
        return '#9E9E9E';
    }
  }, []);

  // 計算價格統計
  const calculatePriceStats = useCallback(() => {
    if (!priceHistory?.data) return null;

    const prices = priceHistory.data.map((d: unknown) => d.price);
    const volumes = priceHistory.data.map((d: unknown) => d.volume);

    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
      average:
        prices.reduce((sum: number, p: number) => sum + p, 0) / prices.length,
      totalVolume: volumes.reduce((sum: number, v: number) => sum + v, 0),
      priceChange: prices[prices.length - 1] - prices[0],
      priceChangePercent:
        ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
    };
  }, [priceHistory]);

  // 獲取推薦操作
  const getRecommendations = useCallback(() => {
    if (!marketAnalysis) return [];

    return marketAnalysis.recommendations.map((rec: string, index: number) => ({
      id: index,
      text: rec,
      priority: index === 0 ? 'high' : 'medium',
    }));
  }, [marketAnalysis]);

  // 檢查數據新鮮度
  const isDataFresh = useCallback(
    (maxAgeMinutes = 5) => {
      if (!lastUpdated) return false;

      const lastUpdate = new Date(lastUpdated);
      const now = new Date();
      const diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

      return diffMinutes <= maxAgeMinutes;
    },
    [lastUpdated]
  );

  // 自動刷新數據
  const autoRefresh = useCallback(
    async (cardId: string, period = '30d') => {
      if (!isDataFresh()) {
        await getCurrentPrice({ cardId, includeHistory: true, period });
      }
    },
    [isDataFresh, getCurrentPrice]
  );

  // 批量操作
  const batchOperations = {
    // 批量創建警報
    createMultipleAlerts: useCallback(
      async (alerts: Omit<PriceAlert, 'id' | 'createdAt'>[]) => {
        const promises = alerts.map(alert => createAlert(alert));
        try {
          await Promise.all(promises);
        } catch (error) {
          console.error('批量創建警報失敗:', error);
        }
      },
      [createAlert]
    ),

    // 批量更新警報狀態
    updateMultipleAlertStatus: useCallback(
      async (alertIds: string[], isActive: boolean) => {
        const promises = alertIds.map(id => updateAlert(id, isActive));
        try {
          await Promise.all(promises);
        } catch (error) {
          console.error('批量更新警報狀態失敗:', error);
        }
      },
      [updateAlert]
    ),

    // 批量刪除警報
    deleteMultipleAlerts: useCallback(
      async (alertIds: string[]) => {
        const promises = alertIds.map(id => deleteAlert(id));
        try {
          await Promise.all(promises);
        } catch (error) {
          console.error('批量刪除警報失敗:', error);
        }
      },
      [deleteAlert]
    ),
  };

  // 實用工具函數
  const utils = {
    getPriceChangeColor,
    formatPrice,
    formatPercentage,
    formatDate,
    getTrendIcon,
    getMarketStatusColor,
    calculatePriceStats,
    getRecommendations,
    isDataFresh,
    autoRefresh,
    hasActiveAlerts,
    getCardAlerts,
    checkPriceAlerts,
  };

  return {
    // 狀態
    currentPrice,
    priceHistory,
    marketAnalysis,
    userAlerts,
    marketStats,
    loading,
    error,
    lastUpdated,
    selectedCardId,
    selectedPeriod,
    alertForm,

    // 操作
    initialize,
    getCurrentPrice,
    getPriceHistory,
    createAlert,
    getUserAlerts,
    updateAlert,
    deleteAlert,
    getMarketStats,
    generateAnalysis,
    setCardId,
    setPeriod,
    updateForm,
    resetForm,
    clearErrorState,
    clearPrice,
    clearHistory,
    clearAnalysis,

    // 批量操作
    batchOperations,

    // 工具函數
    utils,
  };
};
