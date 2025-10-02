import { api } from '../../core/utils/api';
import { logger } from '../../core/utils/logger';

/**
 * FileService
 * HandleFileUploadDownload相Off功能
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
   * UploadFile
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
        throw new Error('文件上傳Failed');
      }
    } catch (error) {
      logger.error('文件上傳Failed:', { error });
      throw error;
    }
  }
}

// Export單例Instance
export const _fileService = FileService.getInstance();
