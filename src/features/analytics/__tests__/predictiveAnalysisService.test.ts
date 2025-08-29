import { PredictiveAnalysisService } from '../services/predictiveAnalysisService';
import type {
  PredictionModelConfig,
  PredictionTarget,
  PredictionModelType,
} from '../types/predictiveAnalysis';

// Mock dataConverters
jest.mock('../utils/dataConverters', () => ({
  convertToJSON: jest.fn(),
  convertToCSV: jest.fn(),
  convertToExcel: jest.fn(),
  convertToPDF: jest.fn(),
}));

const _mockConvertToJSON = require('../utils/dataConverters').convertToJSON;
const _mockConvertToCSV = require('../utils/dataConverters').convertToCSV;
const _mockConvertToExcel = require('../utils/dataConverters').convertToExcel;
const _mockConvertToPDF = require('../utils/dataConverters').convertToPDF;

describe('PredictiveAnalysisService', () => {
  let service: PredictiveAnalysisService;

  beforeEach(() => {
    // 重置單例實例
    (PredictiveAnalysisService as any).instance = undefined;
    service = PredictiveAnalysisService.getInstance();
    jest.clearAllMocks();

    // 重置 mock 函數的返回值
    mockConvertToJSON.mockReturnValue('json_data');
    mockConvertToCSV.mockReturnValue('csv_data');
    mockConvertToExcel.mockReturnValue('excel_data');
    mockConvertToPDF.mockReturnValue('pdf_data');
  });

  describe('單例模式', () => {
    test('應該返回相同的實例', () => {
      const _instance1 = PredictiveAnalysisService.getInstance();
      const _instance2 = PredictiveAnalysisService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    test('應該成功初始化服務', async () => {
      const _result = await service.initialize();
      expect(result).toBe(true);
    });

    test('應該在初始化失敗時返回 false', async () => {
      // 模擬初始化失敗
      jest
        .spyOn(service as any, 'initializeDefaultModels')
        .mockRejectedValue(new Error('初始化失敗'));
      const _result = await service.initialize();
      expect(result).toBe(false);
    });
  });

  describe('預測分析', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取預測分析數據', async () => {
      const _result = await service.getPredictiveAnalysis();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.models).toBeDefined();
      expect(result.data.predictions).toBeDefined();
      expect(result.data.accuracy).toBeGreaterThanOrEqual(0);
      expect(result.data.totalModels).toBeGreaterThanOrEqual(0);
      expect(result.data.activeModels).toBeGreaterThanOrEqual(0);
      expect(result.data.averagePredictionTime).toBeGreaterThanOrEqual(0);
    });

    test('應該使用過濾器獲取預測分析', async () => {
      const _filter = {
        targets: ['price_movement' as PredictionTarget],
        accuracyThreshold: 0.8,
      };
      const _result = await service.getPredictiveAnalysis(filter);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('應該在未初始化時拋出錯誤', async () => {
      // 重置單例實例以創建未初始化的服務
      (PredictiveAnalysisService as any).instance = undefined;
      const _newService = PredictiveAnalysisService.getInstance();
      await expect(newService.getPredictiveAnalysis()).rejects.toThrow(
        'PredictiveAnalysisService not initialized'
      );
    });
  });

  describe('模型管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該創建預測模型', async () => {
      const modelConfig: PredictionModelConfig = {
        modelType: 'random_forest' as PredictionModelType,
        target: 'price_movement' as PredictionTarget,
        features: ['feature1', 'feature2'],
        hyperparameters: { n_estimators: 100 },
        trainingConfig: { testSize: 0.2, validationSize: 0.1 },
        evaluationMetrics: ['accuracy'],
        updateFrequency: 'daily',
        retrainThreshold: 0.8,
      };

      const _model = await service.createModel(
        '測試模型',
        '測試描述',
        modelConfig
      );
      expect(model).toBeDefined();
      expect(model.name).toBe('測試模型');
      expect(model.description).toBe('測試描述');
      expect(model.config).toEqual(modelConfig);
      expect(model.status).toBe('training');
    });
  });

  describe('預測生成', () => {
    let modelId: string;

    beforeEach(async () => {
      await service.initialize();
      const modelConfig: PredictionModelConfig = {
        modelType: 'random_forest' as PredictionModelType,
        target: 'price_movement' as PredictionTarget,
        features: ['feature1', 'feature2'],
        hyperparameters: { n_estimators: 100 },
        trainingConfig: { testSize: 0.2, validationSize: 0.1 },
        evaluationMetrics: ['accuracy'],
        updateFrequency: 'daily',
        retrainThreshold: 0.8,
      };
      const _model = await service.createModel(
        '測試模型',
        '測試描述',
        modelConfig
      );
      modelId = model.id;

      // 等待模型訓練完成
      await new Promise(resolve => setTimeout(resolve, 2500));
    });

    test('應該生成預測', async () => {
      const _inputFeatures = {
        feature1: 100,
        feature2: 50,
      };

      const _prediction = await service.generatePrediction(
        modelId,
        inputFeatures
      );
      expect(prediction).toBeDefined();
      expect(prediction.modelId).toBe(modelId);
      expect(prediction.target).toBe('price_movement');
      expect(prediction.predictions).toBeDefined();
      expect(prediction.predictions.length).toBeGreaterThan(0);
      expect(prediction.accuracy).toBeGreaterThanOrEqual(0);
    });

    test('應該在模型不存在時拋出錯誤', async () => {
      const _inputFeatures = { feature1: 100 };
      await expect(
        service.generatePrediction('不存在的模型ID', inputFeatures)
      ).rejects.toThrow('Model 不存在的模型ID not found');
    });
  });

  describe('報告生成', () => {
    let modelId: string;

    beforeEach(async () => {
      await service.initialize();
      const modelConfig: PredictionModelConfig = {
        modelType: 'random_forest' as PredictionModelType,
        target: 'price_movement' as PredictionTarget,
        features: ['feature1', 'feature2'],
        hyperparameters: { n_estimators: 100 },
        trainingConfig: { testSize: 0.2, validationSize: 0.1 },
        evaluationMetrics: ['accuracy'],
        updateFrequency: 'daily',
        retrainThreshold: 0.8,
      };
      const _model = await service.createModel(
        '測試模型',
        '測試描述',
        modelConfig
      );
      modelId = model.id;

      // 等待模型訓練完成
      await new Promise(resolve => setTimeout(resolve, 2500));
    });

    test('應該生成基本報告', async () => {
      const _dateRange = {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      };

      const _report = await service.generateReport(
        modelId,
        '測試報告',
        '測試報告描述',
        dateRange
      );

      expect(report).toBeDefined();
      expect(report.title).toBe('測試報告');
      expect(report.description).toBe('測試報告描述');
      expect(report.modelId).toBe(modelId);
      expect(report.dateRange).toEqual(dateRange);
      expect(report.summary).toBeDefined();
      expect(report.performanceMetrics).toBeDefined();
      expect(report.predictions).toBeDefined();
      expect(report.insights).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    test('應該使用過濾器生成報告', async () => {
      const _dateRange = {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end: new Date(),
      };

      const _report = await service.generateReport(
        modelId,
        '月度報告',
        '月度報告描述',
        dateRange
      );

      expect(report).toBeDefined();
      expect(report.title).toBe('月度報告');
    });
  });

  describe('數據導出', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該導出 JSON 格式數據', async () => {
      const _options = {
        format: 'json' as const,
        includeModels: true,
        includePredictions: true,
        includeReports: true,
      };

      const _result = await service.exportData(options);
      expect(result).toBeDefined();
      expect(mockConvertToJSON).toHaveBeenCalled();
    });

    test('應該導出 CSV 格式數據', async () => {
      const _options = {
        format: 'csv' as const,
        includeModels: true,
        includePredictions: true,
        includeReports: true,
      };

      const _result = await service.exportData(options);
      expect(result).toBeDefined();
      expect(mockConvertToCSV).toHaveBeenCalled();
    });

    test('應該導出 Excel 格式數據', async () => {
      const _options = {
        format: 'excel' as const,
        includeModels: true,
        includePredictions: true,
        includeReports: true,
      };

      const _result = await service.exportData(options);
      expect(result).toBeDefined();
      expect(mockConvertToExcel).toHaveBeenCalled();
    });

    test('應該導出 PDF 格式數據', async () => {
      const _options = {
        format: 'pdf' as const,
        includeModels: true,
        includePredictions: true,
        includeReports: true,
      };

      const _result = await service.exportData(options);
      expect(result).toBeDefined();
      expect(mockConvertToPDF).toHaveBeenCalled();
    });

    test('應該處理不支持的導出格式', async () => {
      const _options = {
        format: 'unsupported' as any,
        includeModels: true,
        includePredictions: true,
        includeReports: true,
      };

      await expect(service.exportData(options)).rejects.toThrow(
        'Unsupported export format: unsupported'
      );
    });

    test('應該處理導出錯誤', async () => {
      mockConvertToJSON.mockImplementation(() => {
        throw new Error('轉換失敗');
      });

      const _options = {
        format: 'json' as const,
        includeModels: true,
        includePredictions: true,
        includeReports: true,
      };

      await expect(service.exportData(options)).rejects.toThrow(
        'Export failed: 轉換失敗'
      );
    });
  });

  describe('警報管理', () => {
    let modelId: string;

    beforeEach(async () => {
      await service.initialize();
      const modelConfig: PredictionModelConfig = {
        modelType: 'random_forest' as PredictionModelType,
        target: 'price_movement' as PredictionTarget,
        features: ['feature1', 'feature2'],
        hyperparameters: { n_estimators: 100 },
        trainingConfig: { testSize: 0.2, validationSize: 0.1 },
        evaluationMetrics: ['accuracy'],
        updateFrequency: 'daily',
        retrainThreshold: 0.8,
      };
      const _model = await service.createModel(
        '測試模型',
        '測試描述',
        modelConfig
      );
      modelId = model.id;
    });

    test('應該創建警報', async () => {
      const _alert = await service.createAlert(
        modelId,
        'accuracy_drop',
        'warning',
        '測試警報',
        '測試警報描述',
        0.8,
        0.75
      );

      expect(alert).toBeDefined();
      expect(alert.modelId).toBe(modelId);
      expect(alert.type).toBe('accuracy_drop');
      expect(alert.severity).toBe('warning');
      expect(alert.title).toBe('測試警報');
      expect(alert.message).toBe('測試警報描述');
      expect(alert.threshold).toBe(0.8);
      expect(alert.currentValue).toBe(0.75);
      expect(alert.isActive).toBe(true);
    });

    test('應該更新警報', async () => {
      const _alert = await service.createAlert(
        modelId,
        'accuracy_drop',
        'warning',
        '測試警報',
        '測試警報描述',
        0.8,
        0.75
      );

      const _updatedAlert = await service.updateAlert(alert.id, {
        isActive: false,
        message: '更新的警報描述',
      });

      expect(updatedAlert).toBeDefined();
      expect(updatedAlert.isActive).toBe(false);
      expect(updatedAlert.message).toBe('更新的警報描述');
    });

    test('應該刪除警報', async () => {
      const _alert = await service.createAlert(
        modelId,
        'accuracy_drop',
        'warning',
        '測試警報',
        '測試警報描述',
        0.8,
        0.75
      );

      const _result = await service.deleteAlert(alert.id);
      expect(result).toBe(true);
    });

    test('應該獲取所有警報', async () => {
      await service.createAlert(
        modelId,
        'accuracy_drop',
        'warning',
        '測試警報1',
        '測試警報描述1',
        0.8,
        0.75
      );

      await service.createAlert(
        modelId,
        'prediction_error',
        'critical',
        '測試警報2',
        '測試警報描述2',
        0.9,
        0.85
      );

      const _alerts = await service.getAlerts();
      expect(alerts).toBeDefined();
      expect(alerts.length).toBeGreaterThanOrEqual(2);
    });

    test('應該處理不存在的警報', async () => {
      await expect(
        service.updateAlert('不存在的警報ID', { isActive: false })
      ).rejects.toThrow('Alert 不存在的警報ID not found');
    });
  });

  describe('配置管理', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取配置', async () => {
      const _config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.autoRetrain).toBeDefined();
      expect(config.retrainThreshold).toBeDefined();
      expect(config.maxModels).toBeDefined();
      expect(config.defaultModelType).toBeDefined();
      expect(config.alertSettings).toBeDefined();
      expect(config.performanceSettings).toBeDefined();
    });

    test('應該更新配置', async () => {
      const _updates = {
        autoRetrain: false,
        retrainThreshold: 0.9,
        maxModels: 20,
      };

      const _updatedConfig = await service.updateConfig(updates);
      expect(updatedConfig).toBeDefined();
      expect(updatedConfig.autoRetrain).toBe(false);
      expect(updatedConfig.retrainThreshold).toBe(0.9);
      expect(updatedConfig.maxModels).toBe(20);
    });
  });

  describe('事件監聽器', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該添加和移除事件監聽器', () => {
      const _listener = jest.fn();

      service.addEventListener('model_trained', listener);
      service.removeEventListener('model_trained', listener);

      // 驗證監聽器已被移除
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('數據獲取', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該獲取報告', async () => {
      const _reports = await service.getReports();
      expect(reports).toBeDefined();
      expect(Array.isArray(reports)).toBe(true);
    });

    test('應該獲取洞察', async () => {
      const _insights = await service.getInsights();
      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
    });

    test('應該獲取建議', async () => {
      const _recommendations = await service.getRecommendations();
      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    test('應該獲取實時指標', async () => {
      const _metrics = await service.getRealTimeMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.activeModels).toBeGreaterThanOrEqual(0);
      expect(metrics.totalPredictions).toBeGreaterThanOrEqual(0);
      expect(metrics.averageAccuracy).toBeGreaterThanOrEqual(0);
      expect(metrics.alertsCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該快速獲取分析數據', async () => {
      const _startTime = Date.now();
      await service.getPredictiveAnalysis();
      const _endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000); // 應該在1秒內完成
    });
  });

  describe('邊界條件測試', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    test('應該處理空過濾器', async () => {
      const _result = await service.getPredictiveAnalysis({});
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    test('應該處理極端的指標值', async () => {
      const _result = await service.getPredictiveAnalysis();
      expect(result.data.accuracy).toBeGreaterThanOrEqual(0);
      expect(result.data.accuracy).toBeLessThanOrEqual(1);
    });

    test('應該處理無效的配置', async () => {
      const _invalidConfig = {
        autoRetrain: 'invalid' as any,
        retrainThreshold: -1,
        maxModels: 0,
      };

      const _updatedConfig = await service.updateConfig(invalidConfig);
      expect(updatedConfig).toBeDefined();
    });
  });
});
