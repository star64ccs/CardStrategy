import { settingsService } from '../../../services/settingsService';
import { apiService } from '../../../services/apiService';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/validationService');
jest.mock('../../../utils/validationSchemas');

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('SettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    const mockSettings = {
      theme: {
        mode: 'dark' as const,
        primaryColor: '#007AFF',
        accentColor: '#FF3B30'
      },
      language: {
        code: 'zh-TW',
        name: '繁體中文',
        nativeName: '繁體中文'
      },
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false
      },
      privacy: {
        profileVisibility: 'public' as const,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false
      },
      performance: {
        imageQuality: 'high' as const,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false
      },
      display: {
        cardViewMode: 'grid' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true
      }
    };

    it('應該成功獲取用戶設置', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockSettings,
        message: '設置獲取成功'
      });

      const result = await settingsService.getSettings();

      expect(result).toEqual(mockSettings);
      expect(mockApiService.get).toHaveBeenCalledWith('/settings');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('API 錯誤'));

      await expect(settingsService.getSettings()).rejects.toThrow('API 錯誤');
    });
  });

  describe('updateSettings', () => {
    const mockSettings = {
      theme: {
        mode: 'light' as const,
        primaryColor: '#007AFF'
      }
    };

    const mockUpdatedSettings = {
      theme: {
        mode: 'light' as const,
        primaryColor: '#007AFF',
        accentColor: '#FF3B30'
      },
      language: {
        code: 'zh-TW',
        name: '繁體中文',
        nativeName: '繁體中文'
      },
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false
      },
      privacy: {
        profileVisibility: 'public' as const,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false
      },
      performance: {
        imageQuality: 'high' as const,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false
      },
      display: {
        cardViewMode: 'grid' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true
      }
    };

    it('應該成功更新設置', async () => {
      mockApiService.put.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '設置更新成功'
      });

      const result = await settingsService.updateSettings(mockSettings);

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.put).toHaveBeenCalledWith('/settings', mockSettings);
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.put.mockRejectedValue(new Error('更新失敗'));

      await expect(settingsService.updateSettings(mockSettings)).rejects.toThrow('更新失敗');
    });
  });

  describe('updateThemeSettings', () => {
    const mockThemeSettings = {
      mode: 'dark' as const,
      primaryColor: '#007AFF',
      accentColor: '#FF3B30'
    };

    const mockUpdatedSettings = {
      theme: mockThemeSettings,
      language: { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      notifications: { pushEnabled: true, emailEnabled: false, smsEnabled: false, marketAlerts: true, priceAlerts: true, newsAlerts: false, socialAlerts: false },
      privacy: { profileVisibility: 'public' as const, collectionVisibility: 'friends' as const, activityVisibility: 'private' as const, dataSharing: true, analyticsEnabled: false },
      performance: { imageQuality: 'high' as const, cacheEnabled: true, autoSync: true, backgroundRefresh: false },
      display: { cardViewMode: 'grid' as const, showPrices: true, showRarity: true, showCondition: true }
    };

    it('應該成功更新主題設置', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '主題設置更新成功'
      });

      const result = await settingsService.updateThemeSettings(mockThemeSettings);

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.patch).toHaveBeenCalledWith('/settings/theme', mockThemeSettings);
    });

    it('應該處理無效的主題設置', async () => {
      const invalidThemeSettings = {
        mode: 'invalid' as any,
        primaryColor: 'invalid-color'
      };

      await expect(settingsService.updateThemeSettings(invalidThemeSettings)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.patch.mockRejectedValue(new Error('主題更新失敗'));

      await expect(settingsService.updateThemeSettings(mockThemeSettings)).rejects.toThrow('主題更新失敗');
    });
  });

  describe('updateLanguageSettings', () => {
    const mockLanguageSettings = {
      code: 'en-US',
      name: 'English',
      nativeName: 'English'
    };

    const mockUpdatedSettings = {
      theme: { mode: 'dark' as const, primaryColor: '#007AFF', accentColor: '#FF3B30' },
      language: mockLanguageSettings,
      notifications: { pushEnabled: true, emailEnabled: false, smsEnabled: false, marketAlerts: true, priceAlerts: true, newsAlerts: false, socialAlerts: false },
      privacy: { profileVisibility: 'public' as const, collectionVisibility: 'friends' as const, activityVisibility: 'private' as const, dataSharing: true, analyticsEnabled: false },
      performance: { imageQuality: 'high' as const, cacheEnabled: true, autoSync: true, backgroundRefresh: false },
      display: { cardViewMode: 'grid' as const, showPrices: true, showRarity: true, showCondition: true }
    };

    it('應該成功更新語言設置', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '語言設置更新成功'
      });

      const result = await settingsService.updateLanguageSettings(mockLanguageSettings);

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.patch).toHaveBeenCalledWith('/settings/language', mockLanguageSettings);
    });

    it('應該處理無效的語言設置', async () => {
      const invalidLanguageSettings = {
        code: 'invalid',
        name: '',
        nativeName: ''
      };

      await expect(settingsService.updateLanguageSettings(invalidLanguageSettings)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.patch.mockRejectedValue(new Error('語言更新失敗'));

      await expect(settingsService.updateLanguageSettings(mockLanguageSettings)).rejects.toThrow('語言更新失敗');
    });
  });

  describe('updateNotificationSettings', () => {
    const mockNotificationSettings = {
      pushEnabled: true,
      emailEnabled: false,
      smsEnabled: false,
      marketAlerts: true,
      priceAlerts: true,
      newsAlerts: false,
      socialAlerts: false
    };

    const mockUpdatedSettings = {
      theme: { mode: 'dark' as const, primaryColor: '#007AFF', accentColor: '#FF3B30' },
      language: { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      notifications: mockNotificationSettings,
      privacy: { profileVisibility: 'public' as const, collectionVisibility: 'friends' as const, activityVisibility: 'private' as const, dataSharing: true, analyticsEnabled: false },
      performance: { imageQuality: 'high' as const, cacheEnabled: true, autoSync: true, backgroundRefresh: false },
      display: { cardViewMode: 'grid' as const, showPrices: true, showRarity: true, showCondition: true }
    };

    it('應該成功更新通知設置', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '通知設置更新成功'
      });

      const result = await settingsService.updateNotificationSettings(mockNotificationSettings);

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.patch).toHaveBeenCalledWith('/settings/notifications', mockNotificationSettings);
    });

    it('應該處理無效的通知設置', async () => {
      const invalidNotificationSettings = {
        pushEnabled: 'invalid' as any,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false
      };

      await expect(settingsService.updateNotificationSettings(invalidNotificationSettings)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.patch.mockRejectedValue(new Error('通知更新失敗'));

      await expect(settingsService.updateNotificationSettings(mockNotificationSettings)).rejects.toThrow('通知更新失敗');
    });
  });

  describe('updatePrivacySettings', () => {
    const mockPrivacySettings = {
      profileVisibility: 'public' as const,
      collectionVisibility: 'friends' as const,
      activityVisibility: 'private' as const,
      dataSharing: true,
      analyticsEnabled: false
    };

    const mockUpdatedSettings = {
      theme: { mode: 'dark' as const, primaryColor: '#007AFF', accentColor: '#FF3B30' },
      language: { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      notifications: { pushEnabled: true, emailEnabled: false, smsEnabled: false, marketAlerts: true, priceAlerts: true, newsAlerts: false, socialAlerts: false },
      privacy: mockPrivacySettings,
      performance: { imageQuality: 'high' as const, cacheEnabled: true, autoSync: true, backgroundRefresh: false },
      display: { cardViewMode: 'grid' as const, showPrices: true, showRarity: true, showCondition: true }
    };

    it('應該成功更新隱私設置', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '隱私設置更新成功'
      });

      const result = await settingsService.updatePrivacySettings(mockPrivacySettings);

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.patch).toHaveBeenCalledWith('/settings/privacy', mockPrivacySettings);
    });

    it('應該處理無效的隱私設置', async () => {
      const invalidPrivacySettings = {
        profileVisibility: 'invalid' as any,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false
      };

      await expect(settingsService.updatePrivacySettings(invalidPrivacySettings)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.patch.mockRejectedValue(new Error('隱私更新失敗'));

      await expect(settingsService.updatePrivacySettings(mockPrivacySettings)).rejects.toThrow('隱私更新失敗');
    });
  });

  describe('updatePerformanceSettings', () => {
    const mockPerformanceSettings = {
      imageQuality: 'high' as const,
      cacheEnabled: true,
      autoSync: true,
      backgroundRefresh: false
    };

    const mockUpdatedSettings = {
      theme: { mode: 'dark' as const, primaryColor: '#007AFF', accentColor: '#FF3B30' },
      language: { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      notifications: { pushEnabled: true, emailEnabled: false, smsEnabled: false, marketAlerts: true, priceAlerts: true, newsAlerts: false, socialAlerts: false },
      privacy: { profileVisibility: 'public' as const, collectionVisibility: 'friends' as const, activityVisibility: 'private' as const, dataSharing: true, analyticsEnabled: false },
      performance: mockPerformanceSettings,
      display: { cardViewMode: 'grid' as const, showPrices: true, showRarity: true, showCondition: true }
    };

    it('應該成功更新性能設置', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '性能設置更新成功'
      });

      const result = await settingsService.updatePerformanceSettings(mockPerformanceSettings);

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.patch).toHaveBeenCalledWith('/settings/performance', mockPerformanceSettings);
    });

    it('應該處理無效的性能設置', async () => {
      const invalidPerformanceSettings = {
        imageQuality: 'invalid' as any,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false
      };

      await expect(settingsService.updatePerformanceSettings(invalidPerformanceSettings)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.patch.mockRejectedValue(new Error('性能更新失敗'));

      await expect(settingsService.updatePerformanceSettings(mockPerformanceSettings)).rejects.toThrow('性能更新失敗');
    });
  });

  describe('resetSettings', () => {
    const mockDefaultSettings = {
      theme: { mode: 'system' as const, primaryColor: '#007AFF', accentColor: '#FF3B30' },
      language: { code: 'en-US', name: 'English', nativeName: 'English' },
      notifications: { pushEnabled: true, emailEnabled: false, smsEnabled: false, marketAlerts: true, priceAlerts: true, newsAlerts: false, socialAlerts: false },
      privacy: { profileVisibility: 'public' as const, collectionVisibility: 'public' as const, activityVisibility: 'public' as const, dataSharing: true, analyticsEnabled: true },
      performance: { imageQuality: 'medium' as const, cacheEnabled: true, autoSync: true, backgroundRefresh: true },
      display: { cardViewMode: 'list' as const, showPrices: true, showRarity: true, showCondition: true }
    };

    it('應該成功重置設置為默認', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockDefaultSettings,
        message: '設置重置成功'
      });

      const result = await settingsService.resetSettings();

      expect(result).toEqual(mockDefaultSettings);
      expect(mockApiService.post).toHaveBeenCalledWith('/settings/reset');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('重置失敗'));

      await expect(settingsService.resetSettings()).rejects.toThrow('重置失敗');
    });
  });

  describe('exportSettings', () => {
    const mockExportedData = '{"theme":{"mode":"dark"},"language":{"code":"zh-TW"}}';

    it('應該成功導出設置', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockExportedData,
        message: '設置導出成功'
      });

      const result = await settingsService.exportSettings();

      expect(result).toBe(mockExportedData);
      expect(mockApiService.get).toHaveBeenCalledWith('/settings/export');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('導出失敗'));

      await expect(settingsService.exportSettings()).rejects.toThrow('導出失敗');
    });
  });

  describe('importSettings', () => {
    const mockSettingsData = '{"theme":{"mode":"dark"},"language":{"code":"zh-TW"}}';
    const mockImportedSettings = {
      theme: { mode: 'dark' as const, primaryColor: '#007AFF', accentColor: '#FF3B30' },
      language: { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      notifications: { pushEnabled: true, emailEnabled: false, smsEnabled: false, marketAlerts: true, priceAlerts: true, newsAlerts: false, socialAlerts: false },
      privacy: { profileVisibility: 'public' as const, collectionVisibility: 'friends' as const, activityVisibility: 'private' as const, dataSharing: true, analyticsEnabled: false },
      performance: { imageQuality: 'high' as const, cacheEnabled: true, autoSync: true, backgroundRefresh: false },
      display: { cardViewMode: 'grid' as const, showPrices: true, showRarity: true, showCondition: true }
    };

    it('應該成功導入設置', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockImportedSettings,
        message: '設置導入成功'
      });

      const result = await settingsService.importSettings(mockSettingsData);

      expect(result).toEqual(mockImportedSettings);
      expect(mockApiService.post).toHaveBeenCalledWith('/settings/import', { data: mockSettingsData });
    });

    it('應該處理空設置數據', async () => {
      await expect(settingsService.importSettings('')).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('導入失敗'));

      await expect(settingsService.importSettings(mockSettingsData)).rejects.toThrow('導入失敗');
    });
  });

  describe('getAvailableThemes', () => {
    const mockThemes = {
      themes: [
        {
          id: 'dark',
          name: '深色主題',
          description: '適合夜間使用的深色主題',
          preview: 'https://example.com/dark-preview.png'
        },
        {
          id: 'light',
          name: '淺色主題',
          description: '適合日間使用的淺色主題',
          preview: 'https://example.com/light-preview.png'
        }
      ]
    };

    it('應該成功獲取可用主題', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockThemes,
        message: '主題獲取成功'
      });

      const result = await settingsService.getAvailableThemes();

      expect(result).toEqual(mockThemes);
      expect(mockApiService.get).toHaveBeenCalledWith('/settings/themes');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('主題獲取失敗'));

      await expect(settingsService.getAvailableThemes()).rejects.toThrow('主題獲取失敗');
    });
  });

  describe('getAvailableLanguages', () => {
    const mockLanguages = {
      languages: [
        {
          code: 'zh-TW',
          name: 'Traditional Chinese',
          nativeName: '繁體中文',
          flag: '🇹🇼'
        },
        {
          code: 'en-US',
          name: 'English',
          nativeName: 'English',
          flag: '🇺🇸'
        },
        {
          code: 'ja-JP',
          name: 'Japanese',
          nativeName: '日本語',
          flag: '🇯🇵'
        }
      ]
    };

    it('應該成功獲取可用語言', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockLanguages,
        message: '語言獲取成功'
      });

      const result = await settingsService.getAvailableLanguages();

      expect(result).toEqual(mockLanguages);
      expect(mockApiService.get).toHaveBeenCalledWith('/settings/languages');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('語言獲取失敗'));

      await expect(settingsService.getAvailableLanguages()).rejects.toThrow('語言獲取失敗');
    });
  });

  describe('getSettingsStatistics', () => {
    const mockStatistics = {
      lastUpdated: '2024-01-31T00:00:00Z',
      version: '1.0.0',
      totalSettings: 25,
      customizedSettings: 8
    };

    it('應該成功獲取設置統計', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockStatistics,
        message: '統計獲取成功'
      });

      const result = await settingsService.getSettingsStatistics();

      expect(result).toEqual(mockStatistics);
      expect(mockApiService.get).toHaveBeenCalledWith('/settings/statistics');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('統計獲取失敗'));

      await expect(settingsService.getSettingsStatistics()).rejects.toThrow('統計獲取失敗');
    });
  });
});
