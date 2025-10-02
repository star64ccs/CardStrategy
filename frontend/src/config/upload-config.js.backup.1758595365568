// 文件上傳配置
export const uploadConfig = {
  // 文件大小限制
  limits: {
    image: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    },
    document: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['application/pdf', 'text/plain'],
      allowedExtensions: ['.pdf', '.txt']
    }
  },

  // 圖片處理配置
  imageProcessing: {
    compression: {
      quality: 85,
      maxWidth: 1920,
      maxHeight: 1080,
      format: 'webp'
    },
    thumbnail: {
      width: 300,
      height: 300,
      quality: 75
    },
    formats: ['webp', 'jpeg', 'png']
  },

  // 上傳配置
  upload: {
    destination: 'uploads/',
    tempDestination: 'uploads/temp/',
    chunkSize: 1024 * 1024, // 1MB chunks
    maxChunks: 10,
    timeout: 30000 // 30 seconds
  },

  // 錯誤處理配置
  errorMessages: {
    fileTooLarge: '文件大小超過限制，請選擇小於 10MB 的文件',
    invalidType: '不支持的文件類型，請選擇 JPG、PNG、WebP 或 GIF 格式',
    uploadFailed: '文件上傳失敗，請重試',
    networkError: '網絡連接問題，請檢查網絡後重試',
    serverError: '服務器錯誤，請稍後再試'
  }
};

export default uploadConfig;
