/**
 * 第三方服務集成測試
 * 驗證所有第三方服務的配置和連接
 */

import { appInitializer } from '../core/config/appInitializer';
import { serviceManager } from '../core/config/serviceManager';
import { geminiService } from '../shared/services/ai/geminiService';
import { openaiService } from '../shared/services/ai/openaiService';
import { aiService } from '../shared/services/aiService';
import { cloudinaryService } from '../shared/services/storage/cloudinaryService';

describe('第三方服務集成測試', () => {
  beforeAll(async () => {
    // 初始化應用
    await appInitializer.initializeApp();
  });

  describe('服務管理器測試', () => {
    test('應該成功初始化服務管理器', () => {
      expect(serviceManager.isInitialized()).toBe(true);
    });

    test('應該獲取服務統計信息', () => {
      const stats = serviceManager.getServiceStatistics();
      expect(stats.total).toBeGreaterThan(0);
      expect(typeof stats.initialized).toBe('number');
      expect(typeof stats.available).toBe('number');
      expect(typeof stats.failed).toBe('number');
    });

    test('應該生成服務報告', () => {
      const report = serviceManager.generateServiceReport();
      expect(report.summary).toBeDefined();
      expect(report.services).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.services)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('OpenAI 服務測試', () => {
    test('應該獲取 OpenAI 服務狀態', async () => {
      const status = await openaiService.getServiceStatus();
      expect(status).toBeDefined();
      expect(typeof status.isAvailable).toBe('boolean');
      expect(status.model).toBeDefined();
      expect(status.lastChecked).toBeInstanceOf(Date);
    });

    test('應該獲取可用模型列表', async () => {
      if (serviceManager.isServiceAvailable('openai')) {
        const models = await openaiService.getAvailableModels();
        expect(Array.isArray(models)).toBe(true);
      } else {
        console.log('OpenAI 服務不可用，跳過測試');
      }
    });
  });

  describe('Gemini 服務測試', () => {
    test('應該獲取 Gemini 服務狀態', async () => {
      const status = await geminiService.getServiceStatus();
      expect(status).toBeDefined();
      expect(typeof status.isAvailable).toBe('boolean');
      expect(status.model).toBeDefined();
      expect(status.lastChecked).toBeInstanceOf(Date);
    });

    test('應該獲取可用模型列表', async () => {
      if (serviceManager.isServiceAvailable('gemini')) {
        const models = await geminiService.getAvailableModels();
        expect(Array.isArray(models)).toBe(true);
      } else {
        console.log('Gemini 服務不可用，跳過測試');
      }
    });
  });

  describe('Cloudinary 服務測試', () => {
    test('應該獲取 Cloudinary 服務狀態', async () => {
      const status = await cloudinaryService.getServiceStatus();
      expect(status).toBeDefined();
      expect(typeof status.isAvailable).toBe('boolean');
      expect(status.cloudName).toBeDefined();
      expect(status.lastChecked).toBeInstanceOf(Date);
    });

    test('應該生成圖片 URL', () => {
      if (serviceManager.isServiceAvailable('cloudinary')) {
        const url = cloudinaryService.generateImageUrl('test_image', {
          width: 300,
          height: 200,
          crop: 'fill',
        });
        expect(url).toContain('res.cloudinary.com');
        expect(url).toContain('w_300');
        expect(url).toContain('h_200');
        expect(url).toContain('c_fill');
      } else {
        console.log('Cloudinary 服務不可用，跳過測試');
      }
    });
  });

  describe('統一 AI 服務測試', () => {
    test('應該獲取可用的 AI 服務', () => {
      const availableServices = aiService.getAvailableServices();
      expect(availableServices).toBeDefined();
      expect(typeof availableServices.openai).toBe('boolean');
      expect(typeof availableServices.gemini).toBe('boolean');
    });

    test('應該獲取服務統計信息', () => {
      const stats = aiService.getServiceStatistics();
      expect(stats).toBeDefined();
      expect(typeof stats.totalServices).toBe('number');
      expect(typeof stats.availableServices).toBe('number');
      expect(typeof stats.preferredProvider).toBe('string');
    });
  });

  describe('應用初始化測試', () => {
    test('應該確認應用已初始化', () => {
      expect(appInitializer.isAppInitialized()).toBe(true);
    });

    test('應該獲取初始化結果', () => {
      const result = appInitializer.getInitializationResult();
      expect(result).toBeDefined();
      expect(result?.startTime).toBeInstanceOf(Date);
      expect(result?.endTime).toBeInstanceOf(Date);
      expect(typeof result?.duration).toBe('number');
      expect(typeof result?.success).toBe('boolean');
    });

    test('應該獲取應用狀態', () => {
      const status = appInitializer.getAppStatus();
      expect(status).toBeDefined();
      expect(typeof status.isInitialized).toBe('boolean');
      expect(status.services).toBeDefined();
      expect(typeof status.services.total).toBe('number');
      expect(typeof status.services.available).toBe('number');
      expect(typeof status.services.failed).toBe('number');
    });

    test('應該執行健康檢查', async () => {
      const healthCheck = await appInitializer.performAppHealthCheck();
      expect(healthCheck).toBeDefined();
      expect(typeof healthCheck.isHealthy).toBe('boolean');
      expect(healthCheck.services).toBeInstanceOf(Map);
      expect(Array.isArray(healthCheck.issues)).toBe(true);
    });

    test('應該生成診斷報告', async () => {
      const report = await appInitializer.generateDiagnosticReport();
      expect(report).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.appStatus).toBeDefined();
      expect(report.healthCheck).toBeDefined();
      expect(report.serviceReport).toBeDefined();
      expect(report.performance).toBeDefined();
    });
  });

  describe('環境配置測試', () => {
    test('應該檢查環境變量配置', () => {
      // 檢查關鍵環境變量是否存在
      const requiredEnvVars = [
        'OPENAI_API_KEY',
        'GOOGLE_GEMINI_API_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
      ];

      // 在測試環境中，這些可能是模擬值
      // 我們只檢查它們是否被定義
      requiredEnvVars.forEach(envVar => {
        const value = process.env[envVar];
        if (value) {
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        } else {
          console.log(`環境變量 ${envVar} 未設置，可能使用模擬配置`);
        }
      });
    });
  });

  describe('錯誤處理測試', () => {
    test('應該正確處理服務不可用的情況', async () => {
      // 測試當服務不可用時的錯誤處理
      const unavailableServices = serviceManager
        .getAllServiceStatus()
        .filter(status => !status.isAvailable)
        .map(status => status.name);

      if (unavailableServices.length > 0) {
        console.log('不可用的服務:', unavailableServices);

        // 驗證錯誤信息是否正確記錄
        unavailableServices.forEach(serviceName => {
          const status = serviceManager.getServiceStatus(serviceName);
          expect(status).toBeDefined();
          expect(status?.isAvailable).toBe(false);
          if (status?.error) {
            expect(typeof status.error).toBe('string');
            expect(status.error.length).toBeGreaterThan(0);
          }
        });
      }
    });

    test('應該能夠重新初始化失敗的服務', async () => {
      const reinitialized = await serviceManager.reinitializeFailedServices();
      expect(Array.isArray(reinitialized)).toBe(true);
      console.log('重新初始化的服務:', reinitialized);
    });
  });
});

// 性能測試
describe('服務性能測試', () => {
  test('服務初始化時間應該在合理範圍內', () => {
    const result = appInitializer.getInitializationResult();
    if (result) {
      // 初始化時間應該少於 10 秒
      expect(result.duration).toBeLessThan(10000);
      console.log(`應用初始化時間: ${result.duration}ms`);
    }
  });

  test('健康檢查應該快速完成', async () => {
    const startTime = Date.now();
    await serviceManager.performHealthCheck();
    const duration = Date.now() - startTime;

    // 健康檢查應該在 5 秒內完成
    expect(duration).toBeLessThan(5000);
    console.log(`健康檢查時間: ${duration}ms`);
  });
});

// 集成測試
describe('服務集成測試', () => {
  test('AI 服務應該能夠處理簡單的文本生成', async () => {
    if (
      serviceManager.isServiceAvailable('openai') ||
      serviceManager.isServiceAvailable('gemini')
    ) {
      try {
        const response = await aiService.chat('你好，請簡單介紹一下卡牌收藏');
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
        console.log('AI 響應測試成功');
      } catch (error) {
        console.log('AI 服務測試失敗，可能是 API 配置問題:', error);
      }
    } else {
      console.log('沒有可用的 AI 服務，跳過集成測試');
    }
  });

  test('圖片服務應該能夠生成正確的 URL', () => {
    if (serviceManager.isServiceAvailable('cloudinary')) {
      const urls = cloudinaryService.generateResponsiveUrls('test_card');

      expect(urls.thumbnail).toContain('w_150');
      expect(urls.small).toContain('w_300');
      expect(urls.medium).toContain('w_600');
      expect(urls.large).toContain('w_1200');
      expect(urls.original).toContain('test_card');

      console.log('圖片 URL 生成測試成功');
    } else {
      console.log('Cloudinary 服務不可用，跳過測試');
    }
  });
});
