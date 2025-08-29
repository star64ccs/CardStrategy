import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  generateRecommendation,
  getRecommendationHistory,
  getRecommendationStats,
  updateUserProfile,
  getUserProfile,
  analyzePortfolio,
  clearCurrentRecommendation,
  clearError,
  resetRecommendationState,
  setUserProfile,
  updateRecommendationFeedback,
  selectCurrentRecommendation,
  selectRecommendationHistory,
  selectRecommendationStats,
  selectRecommendationLoading,
  selectRecommendationError,
  selectUserProfile,
  selectRecommendationsByAction,
  selectHighPriorityRecommendations,
  selectRecommendationsByRisk,
  selectPortfolioSuggestion,
  selectRiskAnalysis,
  selectExpectedReturn,
  selectRecommendationReasoning,
  selectRecommendationConfidence,
  selectRecommendationValidUntil,
  selectIsRecommendationValid,
  selectRecommendationMetadata,
  selectUserExperience,
  selectUserRiskTolerance,
  selectUserInvestmentCapacity,
  selectUserPreferredGenres,
  selectUserBlacklistedCards,
  selectSuccessRate,
  selectAverageReturn,
  selectUserSatisfaction,
  selectConversionRate,
} from '../../../store/slices/recommendationSlice';
import type {
  InvestmentRecommendationRequest,
  UserProfile,
} from '../types/recommendation';
import {
  CardRecommendation,
  RecommendationAction,
  RiskLevel,
  Priority,
  InvestmentTimeHorizon,
  RiskTolerance,
  InvestmentGoal,
} from '../types/recommendation';

/**
 * 投資建議系統自定義 Hook
 * 提供投資建議生成、用戶配置管理、組合分析等功能
 */
export const _useRecommendation = () => {
  const _dispatch = useAppDispatch();

  // 狀態選擇器
  const _currentRecommendation = useAppSelector(selectCurrentRecommendation);
  const _recommendationHistory = useAppSelector(selectRecommendationHistory);
  const _recommendationStats = useAppSelector(selectRecommendationStats);
  const _loading = useAppSelector(selectRecommendationLoading);
  const _error = useAppSelector(selectRecommendationError);
  const _userProfile = useAppSelector(selectUserProfile);
  const _portfolioSuggestion = useAppSelector(selectPortfolioSuggestion);
  const _riskAnalysis = useAppSelector(selectRiskAnalysis);
  const _expectedReturn = useAppSelector(selectExpectedReturn);
  const _reasoning = useAppSelector(selectRecommendationReasoning);
  const _confidence = useAppSelector(selectRecommendationConfidence);
  const _validUntil = useAppSelector(selectRecommendationValidUntil);
  const _isValid = useAppSelector(selectIsRecommendationValid);
  const _metadata = useAppSelector(selectRecommendationMetadata);
  const _userExperience = useAppSelector(selectUserExperience);
  const _userRiskTolerance = useAppSelector(selectUserRiskTolerance);
  const _userInvestmentCapacity = useAppSelector(selectUserInvestmentCapacity);
  const _userPreferredGenres = useAppSelector(selectUserPreferredGenres);
  const _userBlacklistedCards = useAppSelector(selectUserBlacklistedCards);
  const _successRate = useAppSelector(selectSuccessRate);
  const _averageReturn = useAppSelector(selectAverageReturn);
  const _userSatisfaction = useAppSelector(selectUserSatisfaction);
  const _conversionRate = useAppSelector(selectConversionRate);

  // 投資建議操作
  const _generateInvestmentRecommendation = useCallback(
    async (request: InvestmentRecommendationRequest) => {
      try {
        const _result = await dispatch(
          generateRecommendation(request)
        ).unwrap();
        return result;
      } catch (error) {
        console.error('Failed to generate investment recommendation:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取建議歷史
  const _getHistory = useCallback(
    async (userId: string) => {
      try {
        const _history = await dispatch(
          getRecommendationHistory(userId)
        ).unwrap();
        return history;
      } catch (error) {
        console.error('Failed to get recommendation history:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取建議統計
  const _getStats = useCallback(async () => {
    try {
      const _stats = await dispatch(getRecommendationStats()).unwrap();
      return stats;
    } catch (error) {
      console.error('Failed to get recommendation stats:', error);
      throw error;
    }
  }, [dispatch]);

  // 更新用戶配置
  const _updateProfile = useCallback(
    async (userId: string, profile: UserProfile) => {
      try {
        await dispatch(updateUserProfile({ userId, profile })).unwrap();
        return profile;
      } catch (error) {
        console.error('Failed to update user profile:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 獲取用戶配置
  const _getProfile = useCallback(
    async (userId: string) => {
      try {
        const _profile = await dispatch(getUserProfile(userId)).unwrap();
        return profile;
      } catch (error) {
        console.error('Failed to get user profile:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 分析投資組合
  const _analyzeUserPortfolio = useCallback(
    async (userId: string, portfolio: unknown[]) => {
      try {
        const _analysis = await dispatch(
          analyzePortfolio({ userId, portfolio })
        ).unwrap();
        return analysis;
      } catch (error) {
        console.error('Failed to analyze portfolio:', error);
        throw error;
      }
    },
    [dispatch]
  );

  // 清除當前建議
  const _clearRecommendation = useCallback(() => {
    dispatch(clearCurrentRecommendation());
  }, [dispatch]);

  // 清除錯誤
  const _clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // 重置建議狀態
  const _resetState = useCallback(() => {
    dispatch(resetRecommendationState());
  }, [dispatch]);

  // 設置用戶配置
  const _setProfile = useCallback(
    (profile: UserProfile) => {
      dispatch(setUserProfile(profile));
    },
    [dispatch]
  );

  // 更新建議反饋
  const _updateFeedback = useCallback(
    (
      recommendationId: string,
      rating: number,
      helpful: boolean,
      comment?: string,
      actionTaken?: boolean
    ) => {
      dispatch(
        updateRecommendationFeedback({
          recommendationId,
          rating,
          helpful,
          comment,
          actionTaken: actionTaken || false,
        })
      );
    },
    [dispatch]
  );

  // 實用函數 - 根據動作篩選建議
  const _getRecommendationsByAction = useCallback(
    (action: RecommendationAction) => {
      if (!currentRecommendation) return [];
      return currentRecommendation.recommendations.filter(
        rec => rec.recommendedAction === action
      );
    },
    [currentRecommendation]
  );

  // 獲取高優先級建議
  const _getHighPriorityRecommendations = useCallback(() => {
    if (!currentRecommendation) return [];
    return currentRecommendation.recommendations.filter(
      rec =>
        rec.priority === Priority.VERY_HIGH || rec.priority === Priority.HIGH
    );
  }, [currentRecommendation]);

  // 根據風險等級篩選建議
  const _getRecommendationsByRisk = useCallback(
    (riskLevel: RiskLevel) => {
      if (!currentRecommendation) return [];
      return currentRecommendation.recommendations.filter(
        rec => rec.riskLevel === riskLevel
      );
    },
    [currentRecommendation]
  );

  // 獲取強烈購買建議
  const _getStrongBuyRecommendations = useCallback(() => {
    return getRecommendationsByAction(RecommendationAction.STRONG_BUY);
  }, [getRecommendationsByAction]);

  // 獲取購買建議
  const _getBuyRecommendations = useCallback(() => {
    return getRecommendationsByAction(RecommendationAction.BUY);
  }, [getRecommendationsByAction]);

  // 獲取持有建議
  const _getHoldRecommendations = useCallback(() => {
    return getRecommendationsByAction(RecommendationAction.HOLD);
  }, [getRecommendationsByAction]);

  // 獲取賣出建議
  const _getSellRecommendations = useCallback(() => {
    return [
      ...getRecommendationsByAction(RecommendationAction.SELL),
      ...getRecommendationsByAction(RecommendationAction.STRONG_SELL),
    ];
  }, [getRecommendationsByAction]);

  // 獲取低風險建議
  const _getLowRiskRecommendations = useCallback(() => {
    return getRecommendationsByRisk(RiskLevel.LOW);
  }, [getRecommendationsByRisk]);

  // 獲取中等風險建議
  const _getMediumRiskRecommendations = useCallback(() => {
    return getRecommendationsByRisk(RiskLevel.MEDIUM);
  }, [getRecommendationsByRisk]);

  // 獲取高風險建議
  const _getHighRiskRecommendations = useCallback(() => {
    return getRecommendationsByRisk(RiskLevel.HIGH);
  }, [getRecommendationsByRisk]);

  // 根據預期回報排序建議
  const _getRecommendationsByReturn = useCallback(
    (descending = true) => {
      if (!currentRecommendation) return [];
      const _sorted = [...currentRecommendation.recommendations].sort((a, b) =>
        descending
          ? b.expectedReturn - a.expectedReturn
          : a.expectedReturn - b.expectedReturn
      );
      return sorted;
    },
    [currentRecommendation]
  );

  // 根據置信度排序建議
  const _getRecommendationsByConfidence = useCallback(
    (descending = true) => {
      if (!currentRecommendation) return [];
      const _sorted = [...currentRecommendation.recommendations].sort((a, b) =>
        descending ? b.confidence - a.confidence : a.confidence - b.confidence
      );
      return sorted;
    },
    [currentRecommendation]
  );

  // 獲取最佳建議（高回報 + 高置信度）
  const _getBestRecommendations = useCallback(
    (limit = 5) => {
      if (!currentRecommendation) return [];
      const _scored = currentRecommendation.recommendations.map(rec => ({
        ...rec,
        score: rec.expectedReturn * rec.confidence,
      }));
      return scored.sort((a, b) => b.score - a.score).slice(0, limit);
    },
    [currentRecommendation]
  );

  // 獲取適合新手的建議
  const _getBeginnerFriendlyRecommendations = useCallback(() => {
    if (!currentRecommendation) return [];
    return currentRecommendation.recommendations.filter(
      rec =>
        rec.riskLevel === RiskLevel.LOW || rec.riskLevel === RiskLevel.MEDIUM
    );
  }, [currentRecommendation]);

  // 獲取投機性建議
  const _getSpeculativeRecommendations = useCallback(() => {
    if (!currentRecommendation) return [];
    return currentRecommendation.recommendations.filter(
      rec =>
        rec.riskLevel === RiskLevel.HIGH ||
        rec.riskLevel === RiskLevel.VERY_HIGH
    );
  }, [currentRecommendation]);

  // 根據預算篩選建議
  const _getRecommendationsByBudget = useCallback(
    (maxBudget: number) => {
      if (!currentRecommendation) return [];
      return currentRecommendation.recommendations.filter(
        rec => rec.currentPrice <= maxBudget
      );
    },
    [currentRecommendation]
  );

  // 根據時間框架篩選建議
  const _getRecommendationsByTimeFrame = useCallback(
    (timeFrame: string) => {
      if (!currentRecommendation) return [];
      return currentRecommendation.recommendations.filter(
        rec => rec.timeframe === timeFrame
      );
    },
    [currentRecommendation]
  );

  // 計算投資組合多樣化分數
  const _calculateDiversificationScore = useCallback(() => {
    if (!portfolioSuggestion?.diversification) return 0;
    return portfolioSuggestion.diversification.score;
  }, [portfolioSuggestion]);

  // 獲取再平衡建議
  const _getRebalanceRecommendations = useCallback(() => {
    if (!portfolioSuggestion) return [];
    return portfolioSuggestion.rebalanceRecommendations;
  }, [portfolioSuggestion]);

  // 檢查建議是否即將過期
  const _isRecommendationExpiringSoon = useCallback(
    (hours = 24) => {
      if (!validUntil) return false;
      const _expiry = new Date(validUntil);
      const _now = new Date();
      const _hoursUntilExpiry =
        (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
      return hoursUntilExpiry <= hours && hoursUntilExpiry > 0;
    },
    [validUntil]
  );

  // 獲取建議摘要
  const _getRecommendationSummary = useCallback(() => {
    if (!currentRecommendation) return null;

    const _totalRecommendations = currentRecommendation.recommendations.length;
    const _strongBuyCount = getStrongBuyRecommendations().length;
    const _buyCount = getBuyRecommendations().length;
    const _holdCount = getHoldRecommendations().length;
    const _sellCount = getSellRecommendations().length;
    const _avgExpectedReturn =
      currentRecommendation.recommendations.reduce(
        (sum, rec) => sum + rec.expectedReturn,
        0
      ) / totalRecommendations;

    return {
      totalRecommendations,
      strongBuyCount,
      buyCount,
      holdCount,
      sellCount,
      avgExpectedReturn,
      confidence,
      overallRisk: riskAnalysis?.overallRisk,
      isValid,
    };
  }, [
    currentRecommendation,
    getStrongBuyRecommendations,
    getBuyRecommendations,
    getHoldRecommendations,
    getSellRecommendations,
    confidence,
    riskAnalysis,
    isValid,
  ]);

  // 格式化貨幣
  const _formatCurrency = useCallback((amount: number, currency = 'TWD') => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  // 格式化百分比
  const _formatPercentage = useCallback((value: number, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`;
  }, []);

  // 格式化風險等級
  const _formatRiskLevel = useCallback((riskLevel: RiskLevel) => {
    const _riskLabels = {
      [RiskLevel.VERY_LOW]: '極低風險',
      [RiskLevel.LOW]: '低風險',
      [RiskLevel.MEDIUM]: '中等風險',
      [RiskLevel.HIGH]: '高風險',
      [RiskLevel.VERY_HIGH]: '極高風險',
    };
    return riskLabels[riskLevel] || riskLevel;
  }, []);

  // 格式化建議動作
  const _formatRecommendationAction = useCallback(
    (action: RecommendationAction) => {
      const _actionLabels = {
        [RecommendationAction.STRONG_BUY]: '強烈買入',
        [RecommendationAction.BUY]: '買入',
        [RecommendationAction.HOLD]: '持有',
        [RecommendationAction.SELL]: '賣出',
        [RecommendationAction.STRONG_SELL]: '強烈賣出',
        [RecommendationAction.AVOID]: '避免',
      };
      return actionLabels[action] || action;
    },
    []
  );

  // 格式化優先級
  const _formatPriority = useCallback((priority: Priority) => {
    const _priorityLabels = {
      [Priority.VERY_HIGH]: '極高',
      [Priority.HIGH]: '高',
      [Priority.MEDIUM]: '中等',
      [Priority.LOW]: '低',
      [Priority.VERY_LOW]: '極低',
    };
    return priorityLabels[priority] || priority;
  }, []);

  return {
    // 狀態
    currentRecommendation,
    recommendationHistory,
    recommendationStats,
    loading,
    error,
    userProfile,
    portfolioSuggestion,
    riskAnalysis,
    expectedReturn,
    reasoning,
    confidence,
    validUntil,
    isValid,
    metadata,
    userExperience,
    userRiskTolerance,
    userInvestmentCapacity,
    userPreferredGenres,
    userBlacklistedCards,
    successRate,
    averageReturn,
    userSatisfaction,
    conversionRate,

    // 操作
    generateInvestmentRecommendation,
    getHistory,
    getStats,
    updateProfile,
    getProfile,
    analyzeUserPortfolio,
    clearRecommendation,
    clearError: clearErrorState,
    resetState,
    setProfile,
    updateFeedback,

    // 實用函數
    getRecommendationsByAction,
    getHighPriorityRecommendations,
    getRecommendationsByRisk,
    getStrongBuyRecommendations,
    getBuyRecommendations,
    getHoldRecommendations,
    getSellRecommendations,
    getLowRiskRecommendations,
    getMediumRiskRecommendations,
    getHighRiskRecommendations,
    getRecommendationsByReturn,
    getRecommendationsByConfidence,
    getBestRecommendations,
    getBeginnerFriendlyRecommendations,
    getSpeculativeRecommendations,
    getRecommendationsByBudget,
    getRecommendationsByTimeFrame,
    calculateDiversificationScore,
    getRebalanceRecommendations,
    isRecommendationExpiringSoon,
    getRecommendationSummary,

    // 格式化函數
    formatCurrency,
    formatPercentage,
    formatRiskLevel,
    formatRecommendationAction,
    formatPriority,
  };
};
