import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * 文件服務
 * 處理文件上傳下載相關功能
 */
export class FileService {
  private static instance: FileService;

  private constructor() {}

  static getInstance(): FileService {
    if (!FileService.instance) {
      FileService.instance = new FileService();
    }
    return FileService.instance;
  }

  /**
   * 上傳文件
   */
  async uploadFile(file: File): Promise<string> {
    try {
      const _formData = new FormData();
      formData.append('file', file);

      const _response = await api.post<{ url: string }>('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.success && response.data) {
        return response.data.url;
      } else {
        throw new Error('文件上傳失敗');
      }
    } catch (error) {
      logger.error('文件上傳失敗:', { error });
      throw error;
    }
  }
}

// 導出單例實例
export const _fileService = FileService.getInstance();
