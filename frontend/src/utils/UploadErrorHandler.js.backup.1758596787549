import { uploadConfig } from '../config/upload-config.js';

class UploadErrorHandler {
  constructor() {
    this.errorMessages = uploadConfig.errorMessages;
  }

  /**
   * 處理上傳錯誤
   */
  handleUploadError(error, req, res, next) {
    console.error('上傳錯誤:', error);

    // 文件大小錯誤
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: this.errorMessages.fileTooLarge,
        code: 'FILE_TOO_LARGE'
      });
    }

    // 文件類型錯誤
    if (error.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({
        success: false,
        error: this.errorMessages.invalidType,
        code: 'INVALID_FILE_TYPE'
      });
    }

    // 網絡錯誤
    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNRESET') {
      return res.status(408).json({
        success: false,
        error: this.errorMessages.networkError,
        code: 'NETWORK_ERROR',
        retryable: true
      });
    }

    // 服務器錯誤
    if (error.code === 'SERVER_ERROR' || error.status >= 500) {
      return res.status(500).json({
        success: false,
        error: this.errorMessages.serverError,
        code: 'SERVER_ERROR',
        retryable: true
      });
    }

    // 存儲空間不足
    if (error.code === 'ENOSPC') {
      return res.status(507).json({
        success: false,
        error: '存儲空間不足，請聯繫管理員',
        code: 'INSUFFICIENT_STORAGE'
      });
    }

    // 權限錯誤
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return res.status(403).json({
        success: false,
        error: '沒有權限執行此操作',
        code: 'PERMISSION_DENIED'
      });
    }

    // 默認錯誤
    return res.status(500).json({
      success: false,
      error: this.errorMessages.uploadFailed,
      code: 'UNKNOWN_ERROR',
      retryable: true
    });
  }

  /**
   * 創建重試機制
   */
  createRetryHandler(maxRetries = 3, delay = 1000) {
    return async (fn, ...args) => {
      let lastError;
      
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn(...args);
        } catch (error) {
          lastError = error;
          
          // 如果是不可重試的錯誤，立即拋出
          if (!this.isRetryableError(error)) {
            throw error;
          }
          
          // 最後一次重試，拋出錯誤
          if (i === maxRetries - 1) {
            throw error;
          }
          
          // 等待後重試
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
      
      throw lastError;
    };
  }

  /**
   * 判斷錯誤是否可重試
   */
  isRetryableError(error) {
    const retryableCodes = [
      'NETWORK_ERROR',
      'ECONNRESET',
      'ETIMEDOUT',
      'SERVER_ERROR'
    ];
    
    return retryableCodes.includes(error.code) || error.status >= 500;
  }

  /**
   * 清理臨時文件
   */
  async cleanupTempFiles(filePaths) {
    const fs = await import('fs/promises');
    
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
        console.log(`已清理臨時文件: ${filePath}`);
      } catch (error) {
        console.error(`清理臨時文件失敗: ${filePath}`, error);
      }
    }
  }

  /**
   * 驗證文件完整性
   */
  async validateFileIntegrity(filePath, expectedSize) {
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat(filePath);
      
      if (stats.size !== expectedSize) {
        throw new Error('文件大小不匹配');
      }
      
      if (stats.size === 0) {
        throw new Error('文件為空');
      }
      
      return true;
    } catch (error) {
      throw new Error(`文件驗證失敗: ${error.message}`);
    }
  }

  /**
   * 生成錯誤報告
   */
  generateErrorReport(error, context = {}) {
    return {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      context: {
        userAgent: context.userAgent,
        ip: context.ip,
        fileSize: context.fileSize,
        fileName: context.fileName,
        uploadId: context.uploadId
      },
      retryable: this.isRetryableError(error)
    };
  }
}

export default new UploadErrorHandler();
