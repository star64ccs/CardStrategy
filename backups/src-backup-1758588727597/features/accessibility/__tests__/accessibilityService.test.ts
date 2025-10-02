import AccessibilityService from '../services/accessibilityService';
import type { AccessibilityConfig } from '../types/accessibility';
import { AccessibilityMode, AccessibilityEvent } from '../types/accessibility';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock logger
jest.mock('../../../core/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('AccessibilityService', () => {
  let accessibilityService: AccessibilityService;

  beforeEach(() => {
    // 不需要重置實例，直接獲取
    accessibilityService = AccessibilityService.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('應該返回相同的實例', () => {
      const instance1 = AccessibilityService.getInstance();
      const instance2 = AccessibilityService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('初始化', () => {
    it('應該成功初始化', async () => {
      await expect(accessibilityService.initialize()).resolves.not.toThrow();
    });

    it('應該處理初始化錯誤', async () => {
      // Mock AsyncStorage to throw error
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      await expect(accessibilityService.initialize()).rejects.toThrow();
    });
  });

  describe('無障礙模式管理', () => {
    beforeEach(async () => {
      await accessibilityService.initialize();
    });

    it('應該獲取當前配置文件', () => {
      const profile = accessibilityService.getCurrentProfile();
      expect(profile).toBeDefined();
      expect(profile.id).toBeDefined();
    });

    it('應該切換配置文件', async () => {
      const profiles = accessibilityService.getAvailableProfiles();
      if (profiles.length > 1) {
        const newProfileId = profiles[1].id;
        await accessibilityService.switchProfile(newProfileId);
        expect(accessibilityService.getCurrentProfile().id).toBe(newProfileId);
      }
    });

    it('應該獲取可用配置文件列表', () => {
      const profiles = accessibilityService.getAvailableProfiles();
      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles.length).toBeGreaterThan(0);
    });
  });

  describe('配置管理', () => {
    beforeEach(async () => {
      await accessibilityService.initialize();
    });

    it('應該獲取當前配置', () => {
      const config = accessibilityService.getConfig();
      expect(config).toBeDefined();
      expect(typeof config).toBe('object');
    });

    it('應該更新配置', async () => {
      const newConfig: Partial<AccessibilityConfig> = {
        highContrast: true,
        largeText: true,
      };
      await accessibilityService.updateConfig(newConfig);

      const updatedConfig = accessibilityService.getConfig();
      expect(updatedConfig.highContrast).toBe(true);
      expect(updatedConfig.largeText).toBe(true);
    });

    it('應該重置配置', async () => {
      await accessibilityService.resetConfig();
      const config = accessibilityService.getConfig();
      expect(config.highContrast).toBe(false);
      expect(config.largeText).toBe(false);
    });
  });

  describe('工具功能', () => {
    beforeEach(async () => {
      await accessibilityService.initialize();
    });

    it('應該計算顏色對比度', () => {
      const contrast = accessibilityService.calculateContrastRatio(
        '#000000',
        '#FFFFFF'
      );
      expect(typeof contrast).toBe('number');
      expect(contrast).toBeGreaterThan(0);
    });

    it('應該檢查顏色對比度是否足夠', () => {
      const isSufficient = accessibilityService.isHighContrast(
        '#000000',
        '#FFFFFF'
      );
      expect(typeof isSufficient).toBe('boolean');
    });

    it('應該檢查功能是否啟用', () => {
      const isEnabled = accessibilityService.isFeatureEnabled('highContrast');
      expect(typeof isEnabled).toBe('boolean');
    });
  });

  describe('事件系統', () => {
    beforeEach(async () => {
      await accessibilityService.initialize();
    });

    it('應該註冊和觸發事件', async () => {
      const mockCallback = jest.fn();
      accessibilityService.addEventListener(mockCallback);

      // 觸發事件
      await accessibilityService.updateConfig({ highContrast: true });
      expect(mockCallback).toHaveBeenCalled();
    });

    it('應該移除事件監聽器', () => {
      const mockCallback = jest.fn();
      accessibilityService.addEventListener(mockCallback);
      accessibilityService.removeEventListener(mockCallback);

      // 觸發事件
      accessibilityService.updateConfig({ highContrast: true });
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('錯誤處理', () => {
    it('應該處理存儲錯誤', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(
        accessibilityService.updateConfig({ highContrast: true })
      ).rejects.toThrow();
    });

    it('應該處理事件監聽器錯誤', () => {
      const mockCallback = jest.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });

      accessibilityService.addEventListener(mockCallback);
      expect(() => {
        accessibilityService.updateConfig({ highContrast: true });
      }).not.toThrow();
    });
  });

  describe('性能測試', () => {
    beforeEach(async () => {
      await accessibilityService.initialize();
    });

    it('應該快速切換配置', async () => {
      const startTime = Date.now();
      await accessibilityService.updateConfig({ highContrast: true });
      await accessibilityService.updateConfig({ largeText: true });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });

    it('應該快速獲取配置', () => {
      const startTime = Date.now();
      accessibilityService.getConfig();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('邊界條件', () => {
    beforeEach(async () => {
      await accessibilityService.initialize();
    });

    it('應該處理無效的配置文件', async () => {
      await expect(
        accessibilityService.switchProfile('INVALID_PROFILE')
      ).rejects.toThrow();
    });

    it('應該處理無效的存儲數據', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue('invalid json');

      await accessibilityService.initialize();
      expect(accessibilityService.getCurrentProfile()).toBeDefined();
    });

    it('應該處理部分無效的存儲數據', async () => {
      const AsyncStorage = require('@react-native-async-storage/async-storage');
      AsyncStorage.getItem.mockResolvedValue(
        '{"currentProfile": "visual", "invalid": "data"}'
      );

      await accessibilityService.initialize();
      expect(accessibilityService.getCurrentProfile().id).toBe('visual');
    });
  });
});
