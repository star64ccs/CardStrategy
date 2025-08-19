import { apiService } from './apiService';
import { AppSettings } from '@/types';
import { validateInput, validateApiResponse } from '../utils/validationService';
import {
  AppSettingsSchema,
  ThemeSettingsSchema,
  LanguageSettingsSchema,
  PerformanceSettingsSchema,
  DisplaySettingsSchema,
  SecuritySettingsSchema
} from '../utils/validationSchemas';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

class SettingsService {
  // 獲取用戶設置
  async getSettings(): Promise<AppSettings> {
    try {
      const response = await apiService.get<AppSettings>('/settings');
      const validationResult = validateApiResponse(AppSettingsSchema, response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '設置數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 更新設置
  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    try {
      const response = await apiService.put<AppSettings>('/settings', settings);
      const validationResult = validateApiResponse(AppSettingsSchema, response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '設置數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 更新主題設置
  async updateThemeSettings(themeSettings: any): Promise<AppSettings> {
    try {
      const validationResult = validateInput(ThemeSettingsSchema, themeSettings);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '主題設置驗證失敗');
      }
      const response = await apiService.patch<AppSettings>('/settings/theme', validationResult.data);
      const responseValidation = validateApiResponse(AppSettingsSchema, response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '設置數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 更新語言設置
  async updateLanguageSettings(languageSettings: any): Promise<AppSettings> {
    try {
      const validationResult = validateInput(LanguageSettingsSchema, languageSettings);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '語言設置驗證失敗');
      }
      const response = await apiService.patch<AppSettings>('/settings/language', validationResult.data);
      const responseValidation = validateApiResponse(AppSettingsSchema, response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '設置數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 更新通知設置
  async updateNotificationSettings(notificationSettings: any): Promise<AppSettings> {
    try {
      const validationResult = validateInput(z.object({
        pushEnabled: z.boolean(),
        emailEnabled: z.boolean(),
        smsEnabled: z.boolean(),
        marketAlerts: z.boolean(),
        priceAlerts: z.boolean(),
        newsAlerts: z.boolean(),
        socialAlerts: z.boolean()
      }), notificationSettings);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '通知設置驗證失敗');
      }
      const response = await apiService.patch<AppSettings>(
        '/settings/notifications',
        validationResult.data
      );
      const responseValidation = validateApiResponse(AppSettingsSchema, response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '設置數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 更新隱私設置
  async updatePrivacySettings(privacySettings: any): Promise<AppSettings> {
    try {
      const validationResult = validateInput(z.object({
        profileVisibility: z.enum(['public', 'private', 'friends']),
        collectionVisibility: z.enum(['public', 'private', 'friends']),
        activityVisibility: z.enum(['public', 'private', 'friends']),
        dataSharing: z.boolean(),
        analyticsEnabled: z.boolean()
      }), privacySettings);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '隱私設置驗證失敗');
      }
      const response = await apiService.patch<AppSettings>('/settings/privacy', validationResult.data);
      const responseValidation = validateApiResponse(AppSettingsSchema, response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '設置數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 更新性能設置
  async updatePerformanceSettings(performanceSettings: any): Promise<AppSettings> {
    try {
      const validationResult = validateInput(PerformanceSettingsSchema, performanceSettings);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '性能設置驗證失敗');
      }
      const response = await apiService.patch<AppSettings>(
        '/settings/performance',
        validationResult.data
      );
      const responseValidation = validateApiResponse(AppSettingsSchema, response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '設置數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 重置設置為默認
  async resetSettings(): Promise<AppSettings> {
    try {
      const response = await apiService.post<AppSettings>('/settings/reset');
      const validationResult = validateApiResponse(AppSettingsSchema, response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '設置數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 導出設置
  async exportSettings(): Promise<string> {
    try {
      const response = await apiService.get('/settings/export');
      const validationResult = validateApiResponse(z.string(), response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '導出數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 導入設置
  async importSettings(settingsData: string): Promise<AppSettings> {
    try {
      const validationResult = validateInput(z.object({
        data: z.string().min(1, '設置數據不能為空')
      }), { data: settingsData });
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '設置數據驗證失敗');
      }
      const response = await apiService.post<AppSettings>('/settings/import', {
        data: validationResult.data!.data
      });
      const responseValidation = validateApiResponse(AppSettingsSchema, response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '設置數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
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
    try {
      const response = await apiService.get('/settings/themes');
      const validationResult = validateApiResponse(z.object({
        themes: z.array(z.object({
          id: z.string(),
          name: z.string(),
          description: z.string(),
          preview: z.string().url()
        }))
      }), response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '主題數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
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
    try {
      const response = await apiService.get('/settings/languages');
      const validationResult = validateApiResponse(z.object({
        languages: z.array(z.object({
          code: z.string().length(2),
          name: z.string(),
          nativeName: z.string(),
          flag: z.string()
        }))
      }), response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '語言數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取設置統計
  async getSettingsStatistics(): Promise<{
    lastUpdated: string;
    version: string;
    totalSettings: number;
    customizedSettings: number;
  }> {
    try {
      const response = await apiService.get('/settings/statistics');
      const validationResult = validateApiResponse(z.object({
        lastUpdated: z.string(),
        version: z.string(),
        totalSettings: z.number().int().min(0),
        customizedSettings: z.number().int().min(0)
      }), response.data);
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '設置統計數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;
