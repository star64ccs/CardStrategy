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
 * 市場價格系統Custom Hook
 * 提供價格Query、歷史Analysis、AlertManage等功能
 */
export const _usePricing = () => {
  const _dispatch = useAppDispatch();

  // Select器
  const _currentPrice = useSelector((state: RootState) =>
    selectCurrentPrice(state)
  );
  const _priceHistory = useSelector((state: RootState) =>
    selectPriceHistory(state)
  );
  const _marketAnalysis = useSelector((state: RootState) =>
    selectMarketAnalysis(state)
  );
  const _userAlerts = useSelector((state: RootState) =>
    selectUserAlerts(state)
  );
  const _marketStats = useSelector((state: RootState) =>
    selectMarketStats(state)
  );
  const _loading = useSelector((state: RootState) =>
    selectPricingLoading(state)
  );
  const _error = useSelector((state: RootState) => selectPricingError(state));
  const _lastUpdated = useSelector((state: RootState) =>
    selectLastUpdated(state)
  );
  const _selectedCardId = useSelector((state: RootState) =>
    selectSelectedCardId(state)
  );
  const _selectedPeriod = useSelector((state: RootState) =>
    selectSelectedPeriod(state)
  );
  const _alertForm = useSelector((state: RootState) => selectAlertForm(state));

  // InitializeService
  const _initialize = useCallback(
    async (config?: unknown) => {
      try {
        await (dispatch(initializePricingService(config)) as any).unwrap();
      } catch (error) {
        console.error('Initialize價格ServiceFailed:', error);
      }
    },
    [dispatch]
  );

  // Get當前價格
  const _getCurrentPrice = useCallback(
    async (request: PriceRequest) => {
      try {
        await (dispatch(fetchCurrentPrice(request)) as any).unwrap();
      } catch (error) {
        console.error('Get當前價格Failed:', error);
      }
    },
    [dispatch]
  );

  // Get價格歷史
  const _getPriceHistory = useCallback(
    async (cardId: string, period = '30d') => {
      try {
        await (dispatch(fetchPriceHistory({ cardId, period })) as any).unwrap();
      } catch (error) {
        console.error('Get價格歷史Failed:', error);
      }
    },
    [dispatch]
  );

  // Create價格Alert
  const _createAlert = useCallback(
    async (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => {
      try {
        await (dispatch(createPriceAlert(alert)) as any).unwrap();
      } catch (error) {
        console.error('Create價格警報Failed:', error);
      }
    },
    [dispatch]
  );

  // GetUserAlert
  const _getUserAlerts = useCallback(
    async (cardId?: string) => {
      try {
        await (dispatch(fetchUserAlerts(cardId)) as any).unwrap();
      } catch (error) {
        console.error('Get用戶警報Failed:', error);
      }
    },
    [dispatch]
  );

  // UpdateAlertStatus
  const _updateAlert = useCallback(
    async (alertId: string, isActive: boolean) => {
      try {
        await (
          dispatch(updateAlertStatus({ alertId, isActive })) as any
        ).unwrap();
      } catch (error) {
        console.error('Update警報狀態Failed:', error);
      }
    },
    [dispatch]
  );

  // DeleteAlert
  const _deleteAlert = useCallback(
    async (alertId: string) => {
      try {
        await (dispatch(deletePriceAlert(alertId)) as any).unwrap();
      } catch (error) {
        console.error('Delete警報Failed:', error);
      }
    },
    [dispatch]
  );

  // Get市場Statistics
  const _getMarketStats = useCallback(async () => {
    try {
      await (dispatch(fetchMarketStats()) as any).unwrap();
    } catch (error) {
      console.error('Get市場統計Failed:', error);
    }
  }, [dispatch]);

  // 生成市場Analysis
  const _generateAnalysis = useCallback(
    async (cardId: string) => {
      try {
        await (dispatch(generateMarketAnalysis(cardId)) as any).unwrap();
      } catch (error) {
        console.error('生成市場分析Failed:', error);
      }
    },
    [dispatch]
  );

  // Settings選中的卡牌ID
  const _setCardId = useCallback(
    (cardId: string) => {
      dispatch(setSelectedCardId(cardId));
    },
    [dispatch]
  );

  // Settings選中的期間
  const _setPeriod = useCallback(
    (period: string) => {
      dispatch(setSelectedPeriod(period));
    },
    [dispatch]
  );

  // UpdateAlertTable單
  const _updateForm = useCallback(
    (formData: Partial<typeof alertForm>) => {
      dispatch(updateAlertForm(formData));
    },
    [dispatch]
  );

  // ResetAlertTable單
  const _resetForm = useCallback(() => {
    dispatch(resetAlertForm());
  }, [dispatch]);

  // ClearError
  const _clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear當前價格
  const _clearPrice = useCallback(() => {
    dispatch(clearCurrentPrice());
  }, [dispatch]);

  // Clear價格歷史
  const _clearHistory = useCallback(() => {
    dispatch(clearPriceHistory());
  }, [dispatch]);

  // Clear市場Analysis
  const _clearAnalysis = useCallback(() => {
    dispatch(clearMarketAnalysis());
  }, [dispatch]);

  // 計算價格變化顏色
  const _getPriceChangeColor = useCallback((change: number) => {
    if (change > 0) return '#4CAF50'; // 綠色
    if (change < 0) return '#F44336'; // 紅色
    return '#9E9E9E'; // 灰色
  }, []);

  // Format價格
  const _formatPrice = useCallback((price: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  }, []);

  // Format百分比
  const _formatPercentage = useCallback((percent: number) => {
    const _sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  }, []);

  // FormatDay
  const _formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // CheckYesNo有活躍Alert
  const _hasActiveAlerts = useMemo(() => {
    return userAlerts.some((alert: unknown) => alert.isActive);
  }, [userAlerts]);

  // GetSpecific卡牌的Alert
  const _getCardAlerts = useCallback(
    (cardId: string) => {
      return userAlerts.filter((alert: unknown) => alert.cardId === cardId);
    },
    [userAlerts]
  );

  // Check價格YesNo在Alert範圍內
  const _checkPriceAlerts = useCallback(
    (cardId: string, currentPrice: number) => {
      const _cardAlerts = getCardAlerts(cardId);
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

  // Get趨勢Graph標
  const _getTrendIcon = useCallback((trend: string) => {
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

  // Get市場Status顏色
  const _getMarketStatusColor = useCallback((status: string) => {
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

  // 計算價格Statistics
  const _calculatePriceStats = useCallback(() => {
    if (!priceHistory?.data) return null;

    const _prices = priceHistory.data.map((d: unknown) => d.price);
    const _volumes = priceHistory.data.map((d: unknown) => d.volume);

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

  // Get推薦Operation
  const _getRecommendations = useCallback(() => {
    if (!marketAnalysis) return [];

    return marketAnalysis.recommendations.map((rec: string, index: number) => ({
      id: index,
      text: rec,
      priority: index === 0 ? 'high' : 'medium',
    }));
  }, [marketAnalysis]);

  // CheckData新鮮度
  const _isDataFresh = useCallback(
    (maxAgeMinutes = 5) => {
      if (!lastUpdated) return false;

      const _lastUpdate = new Date(lastUpdated);
      const _now = new Date();
      const _diffMinutes = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);

      return diffMinutes <= maxAgeMinutes;
    },
    [lastUpdated]
  );

  // AutoRefreshData
  const _autoRefresh = useCallback(
    async (cardId: string, period = '30d') => {
      if (!isDataFresh()) {
        await getCurrentPrice({ cardId, includeHistory: true, period });
      }
    },
    [isDataFresh, getCurrentPrice]
  );

  // BatchOperation
  const _batchOperations = {
    // BatchCreateAlert
    createMultipleAlerts: useCallback(
      async (alerts: Omit<PriceAlert, 'id' | 'createdAt'>[]) => {
        const _promises = alerts.map(alert => createAlert(alert));
        try {
          await Promise.all(promises);
        } catch (error) {
          console.error('批量Create警報Failed:', error);
        }
      },
      [createAlert]
    ),

    // BatchUpdateAlertStatus
    updateMultipleAlertStatus: useCallback(
      async (alertIds: string[], isActive: boolean) => {
        const _promises = alertIds.map(id => updateAlert(id, isActive));
        try {
          await Promise.all(promises);
        } catch (error) {
          console.error('批量Update警報狀態Failed:', error);
        }
      },
      [updateAlert]
    ),

    // BatchDeleteAlert
    deleteMultipleAlerts: useCallback(
      async (alertIds: string[]) => {
        const _promises = alertIds.map(id => deleteAlert(id));
        try {
          await Promise.all(promises);
        } catch (error) {
          console.error('批量Delete警報Failed:', error);
        }
      },
      [deleteAlert]
    ),
  };

  // 實用ToolFunction
  const _utils = {
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
    // Status
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

    // Operation
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

    // BatchOperation
    batchOperations,

    // ToolFunction
    utils,
  };
};
