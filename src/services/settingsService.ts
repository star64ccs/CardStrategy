import { apiService } from './apiService';
import { AppSettings } from '@/types';

class SettingsService {
  // 獲取用戶設置
  async getSettings(): Promise<AppSettings> {
    const response = await apiService.get<AppSettings>('/settings');
    return response.data!;
  }

  // 更新設置
  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const response = await apiService.put<AppSettings>('/settings', settings);
    return response.data!;
  }

  // 更新主題設置
  async updateThemeSettings(themeSettings: any): Promise<AppSettings> {
    const response = await apiService.patch<AppSettings>('/settings/theme', themeSettings);
    return response.data!;
  }

  // 更新語言設置
  async updateLanguageSettings(languageSettings: any): Promise<AppSettings> {
    const response = await apiService.patch<AppSettings>('/settings/language', languageSettings);
    return response.data!;
  }

  // 更新通知設置
  async updateNotificationSettings(notificationSettings: any): Promise<AppSettings> {
    const response = await apiService.patch<AppSettings>('/settings/notifications', notificationSettings);
    return response.data!;
  }

  // 更新隱私設置
  async updatePrivacySettings(privacySettings: any): Promise<AppSettings> {
    const response = await apiService.patch<AppSettings>('/settings/privacy', privacySettings);
    return response.data!;
  }

  // 更新性能設置
  async updatePerformanceSettings(performanceSettings: any): Promise<AppSettings> {
    const response = await apiService.patch<AppSettings>('/settings/performance', performanceSettings);
    return response.data!;
  }

  // 重置設置為默認
  async resetSettings(): Promise<AppSettings> {
    const response = await apiService.post<AppSettings>('/settings/reset');
    return response.data!;
  }

  // 導出設置
  async exportSettings(): Promise<string> {
    const response = await apiService.get('/settings/export');
    return response.data!;
  }

  // 導入設置
  async importSettings(settingsData: string): Promise<AppSettings> {
    const response = await apiService.post<AppSettings>('/settings/import', { data: settingsData });
    return response.data!;
  }

  // 獲取可用的主題
  async getAvailableThemes(): Promise<{
    themes: {
      id: string;
      name: string;
      description: string;
      preview: string;
    }[];
  }> {
    const response = await apiService.get('/settings/themes');
    return response.data!;
  }

  // 獲取可用的語言
  async getAvailableLanguages(): Promise<{
    languages: {
      code: string;
      name: string;
      nativeName: string;
      flag: string;
    }[];
  }> {
    const response = await apiService.get('/settings/languages');
    return response.data!;
  }

  // 獲取設置統計
  async getSettingsStatistics(): Promise<{
    lastUpdated: string;
    version: string;
    customizations: number;
  }> {
    const response = await apiService.get('/settings/statistics');
    return response.data!;
  }
}

export const settingsService = new SettingsService();
export default settingsService;
