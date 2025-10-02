// 優化的上傳服務
class OptimizedUpload {
  constructor() {
    this.config = {
      chunkSize: 1024 * 1024, // 1MB chunks
      maxChunks: 10,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    };
  }

  // 分塊上傳
  async chunkedUpload(file, onProgress) {
    const chunks = this.createChunks(file);
    const uploadId = this.generateUploadId();
    
    try {
      for (let i = 0; i < chunks.length; i++) {
        await this.uploadChunk(uploadId, i, chunks[i], chunks.length);
        onProgress(Math.round(((i + 1) / chunks.length) * 100));
      }

      const result = await this.finalizeUpload(uploadId);
      return {
        success: true,
        data: result
      };
    } catch (error) {
      await this.cancelUpload(uploadId);
      throw error;
    }
  }

  // 創建文件塊
  createChunks(file) {
    const chunks = [];
    const chunkSize = this.config.chunkSize;
    
    for (let offset = 0; offset < file.size; offset += chunkSize) {
      const chunk = file.slice(offset, offset + chunkSize);
      chunks.push(chunk);
    }
    
    return chunks;
  }

  // 上傳單個塊
  async uploadChunk(uploadId, chunkIndex, chunk, totalChunks) {
    const formData = new FormData();
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex);
    formData.append('totalChunks', totalChunks);
    formData.append('chunk', chunk);

    const response = await fetch('/api/upload/chunk', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`塊上傳失敗: ${response.status}`);
    }

    return response.json();
  }

  // 完成上傳
  async finalizeUpload(uploadId) {
    const response = await fetch('/api/upload/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uploadId })
    });

    if (!response.ok) {
      throw new Error(`上傳完成失敗: ${response.status}`);
    }

    return response.json();
  }

  // 取消上傳
  async cancelUpload(uploadId) {
    try {
      await fetch('/api/upload/cancel', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadId })
      });
    } catch (error) {
      console.error('取消上傳失敗:', error);
    }
  }

  // 生成上傳 ID
  generateUploadId() {
    return 'upload_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 重試機制
  async retryUpload(fn, maxRetries = this.config.retryAttempts) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (i < maxRetries - 1) {
          await this.delay(this.config.retryDelay * Math.pow(2, i));
        }
      }
    }
    
    throw lastError;
  }

  // 延遲函數
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 預覽上傳
  async previewUpload(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          filename: file.name,
          size: file.size,
          type: file.type,
          preview: e.target.result
        });
      };
      reader.readAsDataURL(file);
    });
  }

  // 驗證上傳
  validateUpload(file) {
    const errors = [];

    // 檢查文件大小
    if (file.size > 10 * 1024 * 1024) {
      errors.push('文件大小不能超過 10MB');
    }

    // 檢查文件類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('只支持 JPG、PNG、WebP 格式的圖片');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new OptimizedUpload();
