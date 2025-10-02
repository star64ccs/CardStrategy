/* global jest, describe, it, expect, beforeEach, afterEach */
import { apiService } from '../../../services/apiService';
import { settingsService } from '../../../services/settingsService';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/validationService');
jest.mock('../../../utils/validationSchemas');

const _mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('SettingsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSettings', () => {
    const _mockSettings = {
      theme: {
        mode: 'dark' as const,
        primaryColor: '#007AFF',
        accentColor: '#FF3B30',
      },
      language: {
        code: 'zh-TW',
        name: '繁體中文',
        nativeName: '繁體中文',
      },
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false,
      },
      privacy: {
        profileVisibility: 'public' as const,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false,
      },
      performance: {
        imageQuality: 'high' as const,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false,
      },
      display: {
        cardViewMode: 'grid' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true,
      },
    };

    it('應該SuccessGet用戶Settings', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockSettings,
        message: 'SettingsGetSuccess',
      });

      const _result = await settingsService.getSettings();

      expect(result).toEqual(mockSettings);
      expect(mockApiService.get).toHaveBeenCalledWith('/settings');
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('API Error'));

      await expect(settingsService.getSettings()).rejects.toThrow('API Error');
    });
  });

  describe('updateSettings', () => {
    const _mockSettings = {
      theme: {
        mode: 'light' as const,
        primaryColor: '#007AFF',
      },
    };

    const _mockUpdatedSettings = {
      theme: {
        mode: 'light' as const,
        primaryColor: '#007AFF',
        accentColor: '#FF3B30',
      },
      language: {
        code: 'zh-TW',
        name: '繁體中文',
        nativeName: '繁體中文',
      },
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false,
      },
      privacy: {
        profileVisibility: 'public' as const,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false,
      },
      performance: {
        imageQuality: 'high' as const,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false,
      },
      display: {
        cardViewMode: 'grid' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true,
      },
    };

    it('應該SuccessUpdateSettings', async () => {
      mockApiService.put.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: 'SettingsUpdateSuccess',
      });

      const _result = await settingsService.updateSettings(mockSettings);

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.put).toHaveBeenCalledWith(
        '/settings',
        mockSettings
      );
    });

    it('應該Handle API Error', async () => {
      mockApiService.put.mockRejectedValue(new Error('UpdateFailed'));

      await expect(
        settingsService.updateSettings(mockSettings)
      ).rejects.toThrow('UpdateFailed');
    });
  });

  describe('updateThemeSettings', () => {
    const _mockThemeSettings = {
      mode: 'dark' as const,
      primaryColor: '#007AFF',
      accentColor: '#FF3B30',
    };

    const _mockUpdatedSettings = {
      theme: mockThemeSettings,
      language: { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false,
      },
      privacy: {
        profileVisibility: 'public' as const,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false,
      },
      performance: {
        imageQuality: 'high' as const,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false,
      },
      display: {
        cardViewMode: 'grid' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true,
      },
    };

    it('應該SuccessUpdate主題Settings', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '主題SettingsUpdateSuccess',
      });

      const _result =
        await settingsService.updateThemeSettings(mockThemeSettings);

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.patch).toHaveBeenCalledWith(
        '/settings/theme',
        mockThemeSettings
      );
    });

    it('應該處理無效的主題設置', async () => {
      const _invalidThemeSettings = {
        mode: 'invalid' as any,
        primaryColor: 'invalid-color',
      };

      await expect(
        settingsService.updateThemeSettings(invalidThemeSettings)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.patch.mockRejectedValue(new Error('主題UpdateFailed'));

      await expect(
        settingsService.updateThemeSettings(mockThemeSettings)
      ).rejects.toThrow('主題UpdateFailed');
    });
  });

  describe('updateLanguageSettings', () => {
    const _mockLanguageSettings = {
      code: 'en-US',
      name: 'English',
      nativeName: 'English',
    };

    const _mockUpdatedSettings = {
      theme: {
        mode: 'dark' as const,
        primaryColor: '#007AFF',
        accentColor: '#FF3B30',
      },
      language: mockLanguageSettings,
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false,
      },
      privacy: {
        profileVisibility: 'public' as const,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false,
      },
      performance: {
        imageQuality: 'high' as const,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false,
      },
      display: {
        cardViewMode: 'grid' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true,
      },
    };

    it('應該SuccessUpdate語言Settings', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '語言SettingsUpdateSuccess',
      });

      const _result =
        await settingsService.updateLanguageSettings(mockLanguageSettings);

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.patch).toHaveBeenCalledWith(
        '/settings/language',
        mockLanguageSettings
      );
    });

    it('應該處理無效的語言設置', async () => {
      const _invalidLanguageSettings = {
        code: 'invalid',
        name: '',
        nativeName: '',
      };

      await expect(
        settingsService.updateLanguageSettings(invalidLanguageSettings)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.patch.mockRejectedValue(new Error('語言UpdateFailed'));

      await expect(
        settingsService.updateLanguageSettings(mockLanguageSettings)
      ).rejects.toThrow('語言UpdateFailed');
    });
  });

  describe('updateNotificationSettings', () => {
    const _mockNotificationSettings = {
      pushEnabled: true,
      emailEnabled: false,
      smsEnabled: false,
      marketAlerts: true,
      priceAlerts: true,
      newsAlerts: false,
      socialAlerts: false,
    };

    const _mockUpdatedSettings = {
      theme: {
        mode: 'dark' as const,
        primaryColor: '#007AFF',
        accentColor: '#FF3B30',
      },
      language: { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      notifications: mockNotificationSettings,
      privacy: {
        profileVisibility: 'public' as const,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false,
      },
      performance: {
        imageQuality: 'high' as const,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false,
      },
      display: {
        cardViewMode: 'grid' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true,
      },
    };

    it('應該SuccessUpdate通知Settings', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '通知SettingsUpdateSuccess',
      });

      const _result = await settingsService.updateNotificationSettings(
        mockNotificationSettings
      );

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.patch).toHaveBeenCalledWith(
        '/settings/notifications',
        mockNotificationSettings
      );
    });

    it('應該處理無效的通知設置', async () => {
      const _invalidNotificationSettings = {
        pushEnabled: 'invalid' as any,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false,
      };

      await expect(
        settingsService.updateNotificationSettings(invalidNotificationSettings)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.patch.mockRejectedValue(new Error('通知UpdateFailed'));

      await expect(
        settingsService.updateNotificationSettings(mockNotificationSettings)
      ).rejects.toThrow('通知UpdateFailed');
    });
  });

  describe('updatePrivacySettings', () => {
    const _mockPrivacySettings = {
      profileVisibility: 'public' as const,
      collectionVisibility: 'friends' as const,
      activityVisibility: 'private' as const,
      dataSharing: true,
      analyticsEnabled: false,
    };

    const _mockUpdatedSettings = {
      theme: {
        mode: 'dark' as const,
        primaryColor: '#007AFF',
        accentColor: '#FF3B30',
      },
      language: { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false,
      },
      privacy: mockPrivacySettings,
      performance: {
        imageQuality: 'high' as const,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false,
      },
      display: {
        cardViewMode: 'grid' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true,
      },
    };

    it('應該SuccessUpdate隱私Settings', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '隱私SettingsUpdateSuccess',
      });

      const _result =
        await settingsService.updatePrivacySettings(mockPrivacySettings);

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.patch).toHaveBeenCalledWith(
        '/settings/privacy',
        mockPrivacySettings
      );
    });

    it('應該處理無效的隱私設置', async () => {
      const _invalidPrivacySettings = {
        profileVisibility: 'invalid' as any,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false,
      };

      await expect(
        settingsService.updatePrivacySettings(invalidPrivacySettings)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.patch.mockRejectedValue(new Error('隱私UpdateFailed'));

      await expect(
        settingsService.updatePrivacySettings(mockPrivacySettings)
      ).rejects.toThrow('隱私UpdateFailed');
    });
  });

  describe('updatePerformanceSettings', () => {
    const _mockPerformanceSettings = {
      imageQuality: 'high' as const,
      cacheEnabled: true,
      autoSync: true,
      backgroundRefresh: false,
    };

    const _mockUpdatedSettings = {
      theme: {
        mode: 'dark' as const,
        primaryColor: '#007AFF',
        accentColor: '#FF3B30',
      },
      language: { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false,
      },
      privacy: {
        profileVisibility: 'public' as const,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false,
      },
      performance: mockPerformanceSettings,
      display: {
        cardViewMode: 'grid' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true,
      },
    };

    it('應該SuccessUpdate性能Settings', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedSettings,
        message: '性能SettingsUpdateSuccess',
      });

      const _result = await settingsService.updatePerformanceSettings(
        mockPerformanceSettings
      );

      expect(result).toEqual(mockUpdatedSettings);
      expect(mockApiService.patch).toHaveBeenCalledWith(
        '/settings/performance',
        mockPerformanceSettings
      );
    });

    it('應該處理無效的性能設置', async () => {
      const _invalidPerformanceSettings = {
        imageQuality: 'invalid' as any,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false,
      };

      await expect(
        settingsService.updatePerformanceSettings(invalidPerformanceSettings)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.patch.mockRejectedValue(new Error('性能UpdateFailed'));

      await expect(
        settingsService.updatePerformanceSettings(mockPerformanceSettings)
      ).rejects.toThrow('性能UpdateFailed');
    });
  });

  describe('resetSettings', () => {
    const _mockDefaultSettings = {
      theme: {
        mode: 'system' as const,
        primaryColor: '#007AFF',
        accentColor: '#FF3B30',
      },
      language: { code: 'en-US', name: 'English', nativeName: 'English' },
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false,
      },
      privacy: {
        profileVisibility: 'public' as const,
        collectionVisibility: 'public' as const,
        activityVisibility: 'public' as const,
        dataSharing: true,
        analyticsEnabled: true,
      },
      performance: {
        imageQuality: 'medium' as const,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: true,
      },
      display: {
        cardViewMode: 'list' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true,
      },
    };

    it('應該Success重置Settings為默認', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockDefaultSettings,
        message: 'Settings重置Success',
      });

      const _result = await settingsService.resetSettings();

      expect(result).toEqual(mockDefaultSettings);
      expect(mockApiService.post).toHaveBeenCalledWith('/settings/reset');
    });

    it('應該Handle API Error', async () => {
      mockApiService.post.mockRejectedValue(new Error('重置Failed'));

      await expect(settingsService.resetSettings()).rejects.toThrow('重置Failed');
    });
  });

  describe('exportSettings', () => {
    const _mockExportedData =
      '{"theme":{"mode":"dark"},"language":{"code":"zh-TW"}}';

    it('應該Success導出Settings', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockExportedData,
        message: 'Settings導出Success',
      });

      const _result = await settingsService.exportSettings();

      expect(result).toBe(mockExportedData);
      expect(mockApiService.get).toHaveBeenCalledWith('/settings/export');
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('導出Failed'));

      await expect(settingsService.exportSettings()).rejects.toThrow(
        '導出Failed'
      );
    });
  });

  describe('importSettings', () => {
    const _mockSettingsData =
      '{"theme":{"mode":"dark"},"language":{"code":"zh-TW"}}';
    const _mockImportedSettings = {
      theme: {
        mode: 'dark' as const,
        primaryColor: '#007AFF',
        accentColor: '#FF3B30',
      },
      language: { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
      notifications: {
        pushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        marketAlerts: true,
        priceAlerts: true,
        newsAlerts: false,
        socialAlerts: false,
      },
      privacy: {
        profileVisibility: 'public' as const,
        collectionVisibility: 'friends' as const,
        activityVisibility: 'private' as const,
        dataSharing: true,
        analyticsEnabled: false,
      },
      performance: {
        imageQuality: 'high' as const,
        cacheEnabled: true,
        autoSync: true,
        backgroundRefresh: false,
      },
      display: {
        cardViewMode: 'grid' as const,
        showPrices: true,
        showRarity: true,
        showCondition: true,
      },
    };

    it('應該Success導入Settings', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockImportedSettings,
        message: 'Settings導入Success',
      });

      const _result = await settingsService.importSettings(mockSettingsData);

      expect(result).toEqual(mockImportedSettings);
      expect(mockApiService.post).toHaveBeenCalledWith('/settings/import', {
        data: mockSettingsData,
      });
    });

    it('應該處理空設置數據', async () => {
      await expect(settingsService.importSettings('')).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.post.mockRejectedValue(new Error('導入Failed'));

      await expect(
        settingsService.importSettings(mockSettingsData)
      ).rejects.toThrow('導入Failed');
    });
  });

  describe('getAvailableThemes', () => {
    const _mockThemes = {
      themes: [
        {
          id: 'dark',
          name: '深色主題',
          description: '適合夜間使用的深色主題',
          preview: 'https://example.com/dark-preview.png',
        },
        {
          id: 'light',
          name: '淺色主題',
          description: '適合日間使用的淺色主題',
          preview: 'https://example.com/light-preview.png',
        },
      ],
    };

    it('應該SuccessGet可用主題', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockThemes,
        message: '主題GetSuccess',
      });

      const _result = await settingsService.getAvailableThemes();

      expect(result).toEqual(mockThemes);
      expect(mockApiService.get).toHaveBeenCalledWith('/settings/themes');
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('主題GetFailed'));

      await expect(settingsService.getAvailableThemes()).rejects.toThrow(
        '主題GetFailed'
      );
    });
  });

  describe('getAvailableLanguages', () => {
    const _mockLanguages = {
      languages: [
        {
          code: 'zh-TW',
          name: 'Traditional Chinese',
          nativeName: '繁體中文',
          flag: '🇹🇼',
        },
        {
          code: 'en-US',
          name: 'English',
          nativeName: 'English',
          flag: '🇺🇸',
        },
        {
          code: 'ja-JP',
          name: 'Japanese',
          nativeName: '日本語',
          flag: '🇯🇵',
        },
      ],
    };

    it('應該SuccessGet可用語言', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockLanguages,
        message: '語言GetSuccess',
      });

      const _result = await settingsService.getAvailableLanguages();

      expect(result).toEqual(mockLanguages);
      expect(mockApiService.get).toHaveBeenCalledWith('/settings/languages');
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('語言GetFailed'));

      await expect(settingsService.getAvailableLanguages()).rejects.toThrow(
        '語言GetFailed'
      );
    });
  });

  describe('getSettingsStatistics', () => {
    const _mockStatistics = {
      lastUpdated: '2024-01-31T00:00:00Z',
      version: '1.0.0',
      totalSettings: 25,
      customizedSettings: 8,
    };

    it('應該SuccessGetSettings統計', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockStatistics,
        message: '統計GetSuccess',
      });

      const _result = await settingsService.getSettingsStatistics();

      expect(result).toEqual(mockStatistics);
      expect(mockApiService.get).toHaveBeenCalledWith('/settings/statistics');
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('統計GetFailed'));

      await expect(settingsService.getSettingsStatistics()).rejects.toThrow(
        '統計GetFailed'
      );
    });
  });
});
