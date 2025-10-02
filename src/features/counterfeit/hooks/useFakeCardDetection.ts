import { useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '../../../store';
import { useAppDispatch } from '../../../store/hooks';
import {
  addEvidenceImage,
  addReference,
  batchDetectFakeCards,
  clearCurrentDetection,
  clearDetectionHistory,
  clearError,
  completeBatchDetection,
  detectFakeCard,
  fetchDetectionHistory,
  fetchDetectionStats,
  fetchFeatureTemplates,
  initializeDetectionService,
  removeEvidenceImage,
  removeReference,
  reportFakeCard,
  resetReportForm,
  selectBatchDetections,
  selectCurrentDetection,
  selectDetectionError,
  selectDetectionHistory,
  selectDetectionLoading,
  selectDetectionStats,
  selectFeatureTemplates,
  selectLastDetectionId,
  selectReportForm,
  selectSelectedCardId,
  selectSelectedMethods,
  setSelectedCardId,
  setSelectedMethods,
  startBatchDetection,
  updateReportForm,
} from '../../../store/slices/fakeCardDetectionSlice';
import type {
  DetectionFeature,
  DetectionRequest,
  ReportRequest,
} from '../types/detection';
import { CounterfeitRisk, DetectionMethod } from '../types/detection';

/**
 * False卡檢測系統Custom Hook
 * 提供False卡檢測、特徵Analysis、ReportManage等功能
 */
export const _useFakeCardDetection = () => {
  const _dispatch = useAppDispatch();

  // Select器
  const _currentDetection = useSelector((state: RootState) =>
    selectCurrentDetection(state)
  );
  const _detectionHistory = useSelector((state: RootState) =>
    selectDetectionHistory(state)
  );
  const _detectionStats = useSelector((state: RootState) =>
    selectDetectionStats(state)
  );
  const _featureTemplates = useSelector((state: RootState) =>
    selectFeatureTemplates(state)
  );
  const _loading = useSelector((state: RootState) =>
    selectDetectionLoading(state)
  );
  const _error = useSelector((state: RootState) => selectDetectionError(state));
  const _lastDetectionId = useSelector((state: RootState) =>
    selectLastDetectionId(state)
  );
  const _selectedCardId = useSelector((state: RootState) =>
    selectSelectedCardId(state)
  );
  const _selectedMethods = useSelector((state: RootState) =>
    selectSelectedMethods(state)
  );
  const _batchDetections = useSelector((state: RootState) =>
    selectBatchDetections(state)
  );
  const _reportForm = useSelector((state: RootState) =>
    selectReportForm(state)
  );

  // InitializeService
  const _initialize = useCallback(
    async (config?: unknown) => {
      try {
        await (dispatch(initializeDetectionService(config)) as any).unwrap();
      } catch (error) {
        console.error('Initialize假卡檢測ServiceFailed:', error);
      }
    },
    [dispatch]
  );

  // 執RowFalse卡檢測
  const _detectCard = useCallback(
    async (request: DetectionRequest) => {
      try {
        await (dispatch(detectFakeCard(request)) as any).unwrap();
      } catch (error) {
        console.error('假卡檢測Failed:', error);
      }
    },
    [dispatch]
  );

  // Batch檢測
  const _batchDetect = useCallback(
    async (requests: DetectionRequest[]) => {
      try {
        dispatch(startBatchDetection(requests.length));
        await (dispatch(batchDetectFakeCards(requests)) as any).unwrap();
        dispatch(completeBatchDetection());
      } catch (error) {
        console.error('批量檢測Failed:', error);
        dispatch(completeBatchDetection());
      }
    },
    [dispatch]
  );

  // Get檢測歷史
  const _getHistory = useCallback(
    async (cardId?: string, userId?: string) => {
      try {
        await (
          dispatch(fetchDetectionHistory({ cardId, userId })) as any
        ).unwrap();
      } catch (error) {
        console.error('Get檢測歷史Failed:', error);
      }
    },
    [dispatch]
  );

  // Get檢測Statistics
  const _getStats = useCallback(async () => {
    try {
      await (dispatch(fetchDetectionStats()) as any).unwrap();
    } catch (error) {
      console.error('Get檢測統計Failed:', error);
    }
  }, [dispatch]);

  // Get特徵模板
  const _getTemplates = useCallback(
    async (cardType?: string) => {
      try {
        await (dispatch(fetchFeatureTemplates(cardType)) as any).unwrap();
      } catch (error) {
        console.error('Get特徵模板Failed:', error);
      }
    },
    [dispatch]
  );

  // ReportFalse卡
  const _reportCard = useCallback(
    async (report: ReportRequest) => {
      try {
        await (dispatch(reportFakeCard(report)) as any).unwrap();
      } catch (error) {
        console.error('報告假卡Failed:', error);
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

  // Settings選中的檢測Method
  const _setMethods = useCallback(
    (methods: DetectionMethod[]) => {
      dispatch(setSelectedMethods(methods));
    },
    [dispatch]
  );

  // UpdateReportTable單
  const _updateForm = useCallback(
    (formData: Partial<typeof reportForm>) => {
      dispatch(updateReportForm(formData));
    },
    [dispatch]
  );

  // ResetReportTable單
  const _resetForm = useCallback(() => {
    dispatch(resetReportForm());
  }, [dispatch]);

  // ClearError
  const _clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear當前檢測結果
  const _clearDetection = useCallback(() => {
    dispatch(clearCurrentDetection());
  }, [dispatch]);

  // Clear檢測歷史
  const _clearHistory = useCallback(() => {
    dispatch(clearDetectionHistory());
  }, [dispatch]);

  // Add證據Graph片
  const _addEvidence = useCallback(
    (type: 'additional' | 'comparison', url: string) => {
      dispatch(addEvidenceImage({ type, url }));
    },
    [dispatch]
  );

  // Remove證據Graph片
  const _removeEvidence = useCallback(
    (type: 'additional' | 'comparison', index: number) => {
      dispatch(removeEvidenceImage({ type, index }));
    },
    [dispatch]
  );

  // Add參考資料
  const _addRef = useCallback(
    (reference: string) => {
      dispatch(addReference(reference));
    },
    [dispatch]
  );

  // Remove參考資料
  const _removeRef = useCallback(
    (index: number) => {
      dispatch(removeReference(index));
    },
    [dispatch]
  );

  // Get風險等級顏色
  const _getRiskColor = useCallback((risk: CounterfeitRisk) => {
    switch (risk) {
      case CounterfeitRisk.AUTHENTIC:
        return '#4CAF50'; // 綠色
      case CounterfeitRisk.SUSPICIOUS:
        return '#FF9800'; // 橙色
      case CounterfeitRisk.LIKELY_FAKE:
        return '#F44336'; // 紅色
      case CounterfeitRisk.CONFIRMED_FAKE:
        return '#D32F2F'; // 深紅色
      default:
        return '#9E9E9E'; // 灰色
    }
  }, []);

  // Get風險等級Graph標
  const _getRiskIcon = useCallback((risk: CounterfeitRisk) => {
    switch (risk) {
      case CounterfeitRisk.AUTHENTIC:
        return 'checkmark-circle';
      case CounterfeitRisk.SUSPICIOUS:
        return 'warning';
      case CounterfeitRisk.LIKELY_FAKE:
        return 'close-circle';
      case CounterfeitRisk.CONFIRMED_FAKE:
        return 'ban';
      default:
        return 'help-circle';
    }
  }, []);

  // Get風險等級文字
  const _getRiskText = useCallback((risk: CounterfeitRisk) => {
    switch (risk) {
      case CounterfeitRisk.AUTHENTIC:
        return '真品';
      case CounterfeitRisk.SUSPICIOUS:
        return '可疑';
      case CounterfeitRisk.LIKELY_FAKE:
        return '疑似假卡';
      case CounterfeitRisk.CONFIRMED_FAKE:
        return '確認假卡';
      default:
        return '未知';
    }
  }, []);

  // Format檢測Method
  const _formatMethod = useCallback((method: DetectionMethod) => {
    switch (method) {
      case DetectionMethod.IMAGE_ANALYSIS:
        return '圖像分析';
      case DetectionMethod.TEXTURE_ANALYSIS:
        return '紋理分析';
      case DetectionMethod.COLOR_ANALYSIS:
        return '顏色分析';
      case DetectionMethod.FONT_ANALYSIS:
        return '字體分析';
      case DetectionMethod.WATERMARK_ANALYSIS:
        return '水印分析';
      case DetectionMethod.HOLOGRAM_ANALYSIS:
        return '全息圖分析';
      case DetectionMethod.BARCODE_ANALYSIS:
        return '條碼分析';
      case DetectionMethod.AI_DETECTION:
        return 'AI檢測';
      default:
        return method;
    }
  }, []);

  // FormatHandleTime
  const _formatProcessingTime = useCallback((timeMs: number) => {
    if (timeMs < 1000) {
      return `${timeMs.toFixed(0)}ms`;
    }
    return `${(timeMs / 1000).toFixed(1)}s`;
  }, []);

  // 計算整體檢測分數
  const _calculateOverallScore = useCallback((features: DetectionFeature[]) => {
    if (!features || features.length === 0) return 0;

    let totalWeight = 0;
    let weightedScore = 0;

    features.forEach(feature => {
      const _score = feature.detected ? feature.confidence * 100 : 0;
      weightedScore += score * feature.importance;
      totalWeight += feature.importance;
    });

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }, []);

  // GetFailed的特徵
  const _getFailedFeatures = useCallback((features: DetectionFeature[]) => {
    return features.filter(feature => !feature.detected);
  }, []);

  // Get高風險特徵
  const _getHighRiskFeatures = useCallback((features: DetectionFeature[]) => {
    return features.filter(
      feature => !feature.detected && feature.importance > 0.8
    );
  }, []);

  // CheckYesNo需要人工復查
  const _needsManualReview = useMemo(() => {
    if (!currentDetection) return false;
    return (
      currentDetection.flags.requiresManualReview ||
      currentDetection.overallConfidence < 0.8 ||
      currentDetection.riskScore > 70
    );
  }, [currentDetection]);

  // CheckYesNo有高風險特徵
  const _hasHighRiskFeatures = useMemo(() => {
    if (!currentDetection) return false;
    return (
      currentDetection.flags.hasHighRiskFeatures ||
      getHighRiskFeatures(currentDetection.features).length > 0
    );
  }, [currentDetection, getHighRiskFeatures]);

  // 計算Batch檢測進度百分比
  const _batchProgress = useMemo(() => {
    if (batchDetections.total === 0) return 0;
    return (batchDetections.progress / batchDetections.total) * 100;
  }, [batchDetections.progress, batchDetections.total]);

  // Get檢測結果摘要
  const _getDetectionSummary = useCallback(() => {
    if (!currentDetection) return null;

    const _failedFeatures = getFailedFeatures(currentDetection.features);
    const _highRiskFeatures = getHighRiskFeatures(currentDetection.features);

    return {
      overallScore: calculateOverallScore(currentDetection.features),
      riskLevel: currentDetection.overallRisk,
      confidence: currentDetection.overallConfidence,
      failedFeatures: failedFeatures.length,
      highRiskFeatures: highRiskFeatures.length,
      needsReview: needsManualReview,
      processingTime: currentDetection.processingTime,
    };
  }, [
    currentDetection,
    getFailedFeatures,
    getHighRiskFeatures,
    calculateOverallScore,
    needsManualReview,
  ]);

  // BatchOperation
  const _batchOperations = {
    // Batch檢測多張卡片
    detectMultiple: useCallback(
      async (cardIds: string[], imageUrls: string[]) => {
        const requests: DetectionRequest[] = cardIds.map((cardId, index) => ({
          cardId,
          imageUrl: imageUrls[index],
          methods: selectedMethods,
        }));

        await batchDetect(requests);
      },
      [batchDetect, selectedMethods]
    ),

    // Export檢測結果
    exportResults: useCallback(() => {
      if (batchDetections.results.length === 0) return null;

      return batchDetections.results.map(result => ({
        cardId: result.cardId,
        risk: result.overallRisk,
        confidence: result.overallConfidence,
        riskScore: result.riskScore,
        summary: result.summary,
        analysisDate: result.analysisDate,
      }));
    }, [batchDetections.results]),

    // 篩選結果
    filterResults: useCallback(
      (risk?: CounterfeitRisk, minConfidence?: number) => {
        let filtered = batchDetections.results;

        if (risk) {
          filtered = filtered.filter(result => result.overallRisk === risk);
        }

        if (minConfidence !== undefined) {
          filtered = filtered.filter(
            result => result.overallConfidence >= minConfidence
          );
        }

        return filtered;
      },
      [batchDetections.results]
    ),
  };

  // 實用ToolFunction
  const _utils = {
    getRiskColor,
    getRiskIcon,
    getRiskText,
    formatMethod,
    formatProcessingTime,
    calculateOverallScore,
    getFailedFeatures,
    getHighRiskFeatures,
    getDetectionSummary,
    needsManualReview,
    hasHighRiskFeatures,
    batchProgress,
  };

  return {
    // Status
    currentDetection,
    detectionHistory,
    detectionStats,
    featureTemplates,
    loading,
    error,
    lastDetectionId,
    selectedCardId,
    selectedMethods,
    batchDetections,
    reportForm,

    // Operation
    initialize,
    detectCard,
    batchDetect,
    getHistory,
    getStats,
    getTemplates,
    reportCard,
    setCardId,
    setMethods,
    updateForm,
    resetForm,
    clearErrorState,
    clearDetection,
    clearHistory,
    addEvidence,
    removeEvidence,
    addRef,
    removeRef,

    // BatchOperation
    batchOperations,

    // ToolFunction
    utils,
  };
};
