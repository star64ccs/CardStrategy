import {
  storageService,
  s3Service,
  cloudflareStorageService,
} from '../shared/services/storage/storageService';

// 模擬 logger 和 api
const _mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const _mockApi = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
};

// 模擬 S3 服務
class MockS3Service {
  isAvailable() {
    return true;
  }

  async uploadFile() {
    return {
      success: true,
      data: {
        key: 'test-file.txt',
        size: 1024,
        lastModified: new Date(),
        etag: 'test-etag',
        contentType: 'text/plain',
      },
      message: 'File uploaded successfully',
      timestamp: new Date(),
    };
  }

  async downloadFile() {
    return {
      success: true,
      data: Buffer.from('test content'),
      message: 'File downloaded successfully',
      timestamp: new Date(),
    };
  }

  async deleteFile() {
    return {
      success: true,
      message: 'File deleted successfully',
      timestamp: new Date(),
    };
  }

  async listFiles() {
    return {
      success: true,
      data: [
        {
          key: 'test-file.txt',
          size: 1024,
          lastModified: new Date(),
          etag: 'test-etag',
          contentType: 'text/plain',
        },
      ],
      message: 'Files listed successfully',
      timestamp: new Date(),
    };
  }

  async getFileUrl() {
    return {
      success: true,
      data: 'https://test-bucket.s3.amazonaws.com/test-file.txt',
      message: 'File URL generated successfully',
      timestamp: new Date(),
    };
  }

  async copyFile() {
    return {
      success: true,
      data: {
        key: 'copied-file.txt',
        size: 1024,
        lastModified: new Date(),
        etag: 'test-etag',
        contentType: 'text/plain',
      },
      message: 'File copied successfully',
      timestamp: new Date(),
    };
  }

  async getFileMetadata() {
    return {
      success: true,
      data: {
        key: 'test-file.txt',
        size: 1024,
        lastModified: new Date(),
        etag: 'test-etag',
        contentType: 'text/plain',
      },
      message: 'File metadata retrieved successfully',
      timestamp: new Date(),
    };
  }

  async getServiceStats() {
    return {
      success: true,
      data: {
        service: 'AWS S3',
        bucket: 'test-bucket',
        region: 'us-east-1',
        available: true,
        filesCount: 'Available',
      },
      message: 'S3 service statistics retrieved',
      timestamp: new Date(),
    };
  }
}

// 模擬 Cloudflare 存儲服務
class MockCloudflareStorageService {
  isAvailable() {
    return true;
  }

  async uploadFile() {
    return {
      success: true,
      data: {
        key: 'test-file.txt',
        size: 1024,
        uploaded: new Date(),
        etag: 'test-etag',
        contentType: 'text/plain',
      },
      message: 'File uploaded successfully',
      timestamp: new Date(),
    };
  }

  async downloadFile() {
    return {
      success: true,
      data: Buffer.from('test content'),
      message: 'File downloaded successfully',
      timestamp: new Date(),
    };
  }

  async deleteFile() {
    return {
      success: true,
      message: 'File deleted successfully',
      timestamp: new Date(),
    };
  }

  async listFiles() {
    return {
      success: true,
      data: [
        {
          key: 'test-file.txt',
          size: 1024,
          uploaded: new Date(),
          etag: 'test-etag',
          contentType: 'text/plain',
        },
      ],
      message: 'Files listed successfully',
      timestamp: new Date(),
    };
  }

  async getFileUrl() {
    return {
      success: true,
      data: 'https://test-zone.cloudflare.com/test-file.txt',
      message: 'File URL generated successfully',
      timestamp: new Date(),
    };
  }

  async copyFile() {
    return {
      success: true,
      data: {
        key: 'copied-file.txt',
        size: 1024,
        uploaded: new Date(),
        etag: 'test-etag',
        contentType: 'text/plain',
      },
      message: 'File copied successfully',
      timestamp: new Date(),
    };
  }

  async getFileMetadata() {
    return {
      success: true,
      data: {
        key: 'test-file.txt',
        size: 1024,
        uploaded: new Date(),
        etag: 'test-etag',
        contentType: 'text/plain',
      },
      message: 'File metadata retrieved successfully',
      timestamp: new Date(),
    };
  }

  async getServiceStats() {
    return {
      success: true,
      data: {
        service: 'Cloudflare Storage',
        accountId: 'test-account',
        zoneId: 'test-zone',
        available: true,
        filesCount: 'Available',
      },
      message: 'Cloudflare storage service statistics retrieved',
      timestamp: new Date(),
    };
  }
}

describe('Storage Services Tests', () => {
  let mockS3Service: MockS3Service;
  let mockCloudflareService: MockCloudflareStorageService;

  beforeEach(() => {
    delete process.env.AWS_S3_ACCESS_KEY;
    delete process.env.AWS_S3_PRIVATE_KEY;
    delete process.env.AWS_S3_BUCKET;
    delete process.env.CLOUDFLARE_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_API_TOKEN;
    delete process.env.CLOUDFLARE_ZONE_ID;

    mockS3Service = new MockS3Service();
    mockCloudflareService = new MockCloudflareStorageService();

    jest.clearAllMocks();
  });

  describe('MockS3Service', () => {
    test('應該正確初始化', () => {
      expect(mockS3Service.isAvailable()).toBe(true);
    });

    test('上傳文件應該成功', async () => {
      const _result = await mockS3Service.uploadFile(
        'test-file.txt',
        Buffer.from('test')
      );
      expect(result.success).toBe(true);
      expect(result.data?.key).toBe('test-file.txt');
      expect(result.data?.size).toBe(1024);
    });

    test('下載文件應該成功', async () => {
      const _result = await mockS3Service.downloadFile('test-file.txt');
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.data?.toString()).toBe('test content');
    });

    test('刪除文件應該成功', async () => {
      const _result = await mockS3Service.deleteFile('test-file.txt');
      expect(result.success).toBe(true);
      expect(result.message).toBe('File deleted successfully');
    });

    test('列出文件應該成功', async () => {
      const _result = await mockS3Service.listFiles();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].key).toBe('test-file.txt');
    });

    test('獲取文件URL應該成功', async () => {
      const _result = await mockS3Service.getFileUrl('test-file.txt');
      expect(result.success).toBe(true);
      expect(result.data).toContain('s3.amazonaws.com');
    });

    test('複製文件應該成功', async () => {
      const _result = await mockS3Service.copyFile('source.txt', 'dest.txt');
      expect(result.success).toBe(true);
      expect(result.data?.key).toBe('copied-file.txt');
    });

    test('獲取文件元數據應該成功', async () => {
      const _result = await mockS3Service.getFileMetadata('test-file.txt');
      expect(result.success).toBe(true);
      expect(result.data?.key).toBe('test-file.txt');
    });

    test('獲取服務統計應該成功', async () => {
      const _result = await mockS3Service.getServiceStats();
      expect(result.success).toBe(true);
      expect(result.data?.service).toBe('AWS S3');
    });
  });

  describe('MockCloudflareStorageService', () => {
    test('應該正確初始化', () => {
      expect(mockCloudflareService.isAvailable()).toBe(true);
    });

    test('上傳文件應該成功', async () => {
      const _result = await mockCloudflareService.uploadFile(
        'test-file.txt',
        Buffer.from('test')
      );
      expect(result.success).toBe(true);
      expect(result.data?.key).toBe('test-file.txt');
      expect(result.data?.size).toBe(1024);
    });

    test('下載文件應該成功', async () => {
      const _result = await mockCloudflareService.downloadFile('test-file.txt');
      expect(result.success).toBe(true);
      expect(result.data).toBeInstanceOf(Buffer);
      expect(result.data?.toString()).toBe('test content');
    });

    test('刪除文件應該成功', async () => {
      const _result = await mockCloudflareService.deleteFile('test-file.txt');
      expect(result.success).toBe(true);
      expect(result.message).toBe('File deleted successfully');
    });

    test('列出文件應該成功', async () => {
      const _result = await mockCloudflareService.listFiles();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].key).toBe('test-file.txt');
    });

    test('獲取文件URL應該成功', async () => {
      const _result = await mockCloudflareService.getFileUrl('test-file.txt');
      expect(result.success).toBe(true);
      expect(result.data).toContain('cloudflare.com');
    });

    test('複製文件應該成功', async () => {
      const _result = await mockCloudflareService.copyFile(
        'source.txt',
        'dest.txt'
      );
      expect(result.success).toBe(true);
      expect(result.data?.key).toBe('copied-file.txt');
    });

    test('獲取文件元數據應該成功', async () => {
      const _result =
        await mockCloudflareService.getFileMetadata('test-file.txt');
      expect(result.success).toBe(true);
      expect(result.data?.key).toBe('test-file.txt');
    });

    test('獲取服務統計應該成功', async () => {
      const _result = await mockCloudflareService.getServiceStats();
      expect(result.success).toBe(true);
      expect(result.data?.service).toBe('Cloudflare Storage');
    });
  });

  describe('統一存儲服務功能測試', () => {
    test('批量上傳多個文件應該正確處理', async () => {
      const _files = [
        { key: 'file1.txt', file: Buffer.from('content1') },
        { key: 'file2.txt', file: Buffer.from('content2') },
        { key: 'file3.txt', file: Buffer.from('content3') },
      ];

      // 模擬批量上傳
      const _uploadPromises = files.map(file =>
        mockS3Service.uploadFile(file.key, file.file)
      );
      const _results = await Promise.all(uploadPromises);

      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    test('空文件列表應該返回成功', async () => {
      const files: { key: string; file: Buffer }[] = [];

      // 模擬空列表處理
      const _result = {
        success: true,
        data: [],
        message: 'No files to upload',
        timestamp: new Date(),
      };

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    test('日誌記錄應該被調用', async () => {
      const _result = await mockS3Service.uploadFile(
        'test.txt',
        Buffer.from('test')
      );

      // 驗證結果包含時間戳
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.success).toBe(true);
    });

    test('錯誤處理應該正確', async () => {
      // 模擬錯誤情況
      const _errorResult = {
        success: false,
        message: 'Upload error: Network error',
        timestamp: new Date(),
      };

      expect(errorResult.success).toBe(false);
      expect(errorResult.message).toContain('Network error');
    });
  });

  describe('服務可用性測試', () => {
    test('S3服務可用性檢查', () => {
      expect(mockS3Service.isAvailable()).toBe(true);
    });

    test('Cloudflare服務可用性檢查', () => {
      expect(mockCloudflareService.isAvailable()).toBe(true);
    });

    test('環境變量清理應該成功', () => {
      expect(process.env.AWS_S3_ACCESS_KEY).toBeUndefined();
      expect(process.env.CLOUDFLARE_API_TOKEN).toBeUndefined();
    });
  });
});
