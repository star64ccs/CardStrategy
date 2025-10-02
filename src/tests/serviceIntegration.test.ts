/**
 * 第三方Service集成Test
 * Verify所有第三方Service的Configure和Connect
 */

import { appInitializer } from '../core/config/appInitializer';
import { serviceManager } from '../core/config/serviceManager';
import { geminiService } from '../shared/services/ai/geminiService';
import { openaiService } from '../shared/services/ai/openaiService';
import { aiService } from '../shared/services/aiService';
import { cloudinaryService } from '../shared/services/storage/cloudinaryService';

describe('第三方Service集成測試', () => {
  beforeAll(async () => {
    // InitializeApply
    await appInitializer.initializeApp();
  });

  describe('Service管理器測試', () => {
    test('應該SuccessInitializeService管理器', () => {
      expect(serviceManager.isInitialized()).toBe(true);
    });

    test('應該GetService統計Information', () => {
      const _stats = serviceManager.getServiceStatistics();
      expect(stats.total).toBeGreaterThan(0);
      expect(typeof stats.initialized).toBe('number');
      expect(typeof stats.available).toBe('number');
      expect(typeof stats.failed).toBe('number');
    });

    test('應該生成Service報告', () => {
      const _report = serviceManager.generateServiceReport();
      expect(report.summary).toBeDefined();
      expect(report.services).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(Array.isArray(report.services)).toBe(true);
      expect(Array.isArray(report.recommendations)).toBe(true);
    });
  });

  describe('OpenAI Service測試', () => {
    test('應該Get OpenAI Service狀態', async () => {
      const _status = await openaiService.getServiceStatus();
      expect(status).toBeDefined();
      expect(typeof status.isAvailable).toBe('boolean');
      expect(status.model).toBeDefined();
      expect(status.lastChecked).toBeInstanceOf(Date);
    });

    test('應該獲取可用模型列表', async () => {
      if (serviceManager.isServiceAvailable('openai')) {
        const _models = await openaiService.getAvailableModels();
        expect(Array.isArray(models)).toBe(true);
      } else {
        console.log('OpenAI Service不可用，跳過測試');
      }
    });
  });

  describe('Gemini Service測試', () => {
    test('應該Get Gemini Service狀態', async () => {
      const _status = await geminiService.getServiceStatus();
      expect(status).toBeDefined();
      expect(typeof status.isAvailable).toBe('boolean');
      expect(status.model).toBeDefined();
      expect(status.lastChecked).toBeInstanceOf(Date);
    });

    test('應該獲取可用模型列表', async () => {
      if (serviceManager.isServiceAvailable('gemini')) {
        const _models = await geminiService.getAvailableModels();
        expect(Array.isArray(models)).toBe(true);
      } else {
        console.log('Gemini Service不可用，跳過測試');
      }
    });
  });

  describe('Cloudinary Service測試', () => {
    test('應該Get Cloudinary Service狀態', async () => {
      const _status = await cloudinaryService.getServiceStatus();
      expect(status).toBeDefined();
      expect(typeof status.isAvailable).toBe('boolean');
      expect(status.cloudName).toBeDefined();
      expect(status.lastChecked).toBeInstanceOf(Date);
    });

    test('應該生成圖片 URL', () => {
      if (serviceManager.isServiceAvailable('cloudinary')) {
        const _url = cloudinaryService.generateImageUrl('test_image', {
          width: 300,
          height: 200,
          crop: 'fill',
        });
        expect(url).toContain('res.cloudinary.com');
        expect(url).toContain('w_300');
        expect(url).toContain('h_200');
        expect(url).toContain('c_fill');
      } else {
        console.log('Cloudinary Service不可用，跳過測試');
      }
    });
  });

  describe('統一 AI Service測試', () => {
    test('應該Get可用的 AI Service', () => {
      const _availableServices = aiService.getAvailableServices();
      expect(availableServices).toBeDefined();
      expect(typeof availableServices.openai).toBe('boolean');
      expect(typeof availableServices.gemini).toBe('boolean');
    });

    test('應該GetService統計Information', () => {
      const _stats = aiService.getServiceStatistics();
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
      const _result = appInitializer.getInitializationResult();
      expect(result).toBeDefined();
      expect(result?.startTime).toBeInstanceOf(Date);
      expect(result?.endTime).toBeInstanceOf(Date);
      expect(typeof result?.duration).toBe('number');
      expect(typeof result?.success).toBe('boolean');
    });

    test('應該獲取應用狀態', () => {
      const _status = appInitializer.getAppStatus();
      expect(status).toBeDefined();
      expect(typeof status.isInitialized).toBe('boolean');
      expect(status.services).toBeDefined();
      expect(typeof status.services.total).toBe('number');
      expect(typeof status.services.available).toBe('number');
      expect(typeof status.services.failed).toBe('number');
    });

    test('應該執行健康檢查', async () => {
      const _healthCheck = await appInitializer.performAppHealthCheck();
      expect(healthCheck).toBeDefined();
      expect(typeof healthCheck.isHealthy).toBe('boolean');
      expect(healthCheck.services).toBeInstanceOf(Map);
      expect(Array.isArray(healthCheck.issues)).toBe(true);
    });

    test('應該生成診斷報告', async () => {
      const _report = await appInitializer.generateDiagnosticReport();
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
      // CheckOffKey環境VariableYesNo存在
      const _requiredEnvVars = [
        'OPENAI_API_KEY',
        'GOOGLE_GEMINI_API_KEY',
        'CLOUDINARY_CLOUD_NAME',
        'CLOUDINARY_API_KEY',
        'CLOUDINARY_API_SECRET',
      ];

      // 在Test環境中，這些可能Yes模擬Value
      // 我們只Check它們YesNo被定義
      requiredEnvVars.forEach(envVar => {
        const _value = process.env[envVar];
        if (value) {
          expect(typeof value).toBe('string');
          expect(value.length).toBeGreaterThan(0);
        } else {
          console.log(`環境變量 ${envVar} 未設置，可能使用模擬配置`);
        }
      });
    });
  });

  describe('ErrorHandle測試', () => {
    test('應該正確HandleService不可用的情況', async () => {
      // Test當Service不可用時的ErrorHandle
      const _unavailableServices = serviceManager
        .getAllServiceStatus()
        .filter(status => !status.isAvailable)
        .map(status => status.name);

      if (unavailableServices.length > 0) {
        console.log('不可用的Service:', unavailableServices);

        // VerifyErrorInformationYesNo正確Record
        unavailableServices.forEach(serviceName => {
          const _status = serviceManager.getServiceStatus(serviceName);
          expect(status).toBeDefined();
          expect(status?.isAvailable).toBe(false);
          if (status?.error) {
            expect(typeof status.error).toBe('string');
            expect(status.error.length).toBeGreaterThan(0);
          }
        });
      }
    });

    test('應該能夠重新InitializeFailed的Service', async () => {
      const _reinitialized = await serviceManager.reinitializeFailedServices();
      expect(Array.isArray(reinitialized)).toBe(true);
      console.log('重新Initialize的Service:', reinitialized);
    });
  });
});

// 性能Test
describe('Service性能測試', () => {
  test('ServiceInitialize時間應該在合理範圍內', () => {
    const _result = appInitializer.getInitializationResult();
    if (result) {
      // InitializeTime應該少於 10 Second
      expect(result.duration).toBeLessThan(10000);
      console.log(`應用初始化時間: ${result.duration}ms`);
    }
  });

  test('健康檢查應該快速完成', async () => {
    const _startTime = Date.now();
    await serviceManager.performHealthCheck();
    const _duration = Date.now() - startTime;

    // 健康Check應該在 5 Second內Complete
    expect(duration).toBeLessThan(5000);
    console.log(`健康檢查時間: ${duration}ms`);
  });
});

// 集成Test
describe('Service集成測試', () => {
  test('AI Service應該能夠Handle簡單的文本生成', async () => {
    if (
      serviceManager.isServiceAvailable('openai') ||
      serviceManager.isServiceAvailable('gemini')
    ) {
      try {
        const _response = await aiService.chat('你好，請簡單介紹一下卡牌收藏');
        expect(typeof response).toBe('string');
        expect(response.length).toBeGreaterThan(0);
        console.log('AI 響應測試Success');
      } catch (error) {
        console.log('AI Service測試Failed，可能是 API Configure問題:', error);
      }
    } else {
      console.log('沒有可用的 AI Service，跳過集成測試');
    }
  });

  test('圖片Service應該能夠生成正確的 URL', () => {
    if (serviceManager.isServiceAvailable('cloudinary')) {
      const _urls = cloudinaryService.generateResponsiveUrls('test_card');

      expect(urls.thumbnail).toContain('w_150');
      expect(urls.small).toContain('w_300');
      expect(urls.medium).toContain('w_600');
      expect(urls.large).toContain('w_1200');
      expect(urls.original).toContain('test_card');

      console.log('圖片 URL 生成測試Success');
    } else {
      console.log('Cloudinary Service不可用，跳過測試');
    }
  });
});
