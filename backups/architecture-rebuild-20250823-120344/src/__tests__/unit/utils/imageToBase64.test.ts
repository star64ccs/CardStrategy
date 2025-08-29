/* global jest, describe, it, expect, beforeEach, afterEach */
import {
  convertImageToBase64,
  convertImagesToBase64,
  convertImageUrlToBase64,
  base64ToBlob,
  isValidImageBase64,
  getBase64ImageDimensions,
  compressBase64Image,
  dataQualityService,
} from '../../services/dataQualityService';

// Mock Canvas API for testing
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
    toDataURL: jest.fn(() => 'data:image/jpeg;base64,mock-base64-data'),
  })),
};

const mockImage = {
  width: 100,
  height: 100,
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
  src: '',
  crossOrigin: '',
};

// Mock DOM APIs
global.document = {
  createElement: jest.fn((tagName: string) => {
    if (tagName === 'canvas') {
      return mockCanvas;
    }
    if (tagName === 'img') {
      return mockImage;
    }
    return {};
  }),
} as any;

global.Image = jest.fn(() => mockImage) as any;
global.HTMLCanvasElement = jest.fn(() => mockCanvas) as any;
global.HTMLImageElement = jest.fn(() => mockImage) as any;

// Mock FileReader
const mockFileReader = {
  onload: null as ((event: any) => void) | null,
  onerror: null as (() => void) | null,
  readAsDataURL: jest.fn(function (this: any) {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: 'data:image/jpeg;base64,mock-data' } });
      }
    }, 0);
  }),
};

global.FileReader = jest.fn(() => mockFileReader) as any;

// Mock performance API
global.performance = {
  now: jest.fn(() => 1000),
} as any;

// Mock atob and btoa
global.atob = jest.fn((str: string) => str);
global.btoa = jest.fn((str: string) => str);

describe('Image to Base64 Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockImage.onload = null;
    mockImage.onerror = null;
    mockFileReader.onload = null;
    mockFileReader.onerror = null;
  });

  describe('convertImageToBase64', () => {
    it('應該成功轉換圖片文件為base64', async () => {
      const mockFile = new File(['mock-image-data'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const result = await convertImageToBase64(mockFile, {
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 600,
        format: 'jpeg',
        compression: true,
      });

      expect(result).toEqual({
        base64: 'data:image/jpeg;base64,mock-base64-data',
        originalSize: mockFile.size,
        compressedSize: expect.any(Number),
        width: 100,
        height: 100,
        format: 'jpeg',
        mimeType: 'image/jpeg',
        compressionRatio: expect.any(Number),
        processingTime: expect.any(Number),
      });
    });

    it('應該拒絕非圖片文件', async () => {
      const mockFile = new File(['mock-data'], 'test.txt', {
        type: 'text/plain',
      });

      await expect(convertImageToBase64(mockFile)).rejects.toThrow(
        '文件不是有效的圖片格式'
      );
    });

    it('應該處理圖片加載錯誤', async () => {
      const mockFile = new File(['mock-image-data'], 'test.jpg', {
        type: 'image/jpeg',
      });

      // 模擬圖片加載失敗
      mockImage.onload = null;
      mockImage.onerror = () => {
        if (mockImage.onerror) mockImage.onerror();
      };

      await expect(convertImageToBase64(mockFile)).rejects.toThrow(
        '圖片加載失敗'
      );
    });
  });

  describe('convertImagesToBase64', () => {
    it('應該批量轉換多個圖片文件', async () => {
      const mockFiles = [
        new File(['mock-data-1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['mock-data-2'], 'test2.jpg', { type: 'image/jpeg' }),
      ];

      const result = await convertImagesToBase64(mockFiles, {
        quality: 0.8,
        format: 'jpeg',
      });

      expect(result.totalImages).toBe(2);
      expect(result.successfulConversions).toBe(2);
      expect(result.failedConversions).toBe(0);
      expect(result.results).toHaveLength(2);
      expect(result.averageProcessingTime).toBeGreaterThan(0);
    });

    it('應該處理部分轉換失敗的情況', async () => {
      const mockFiles = [
        new File(['mock-data-1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['mock-data-2'], 'test2.txt', { type: 'text/plain' }), // 無效文件
      ];

      const result = await convertImagesToBase64(mockFiles);

      expect(result.totalImages).toBe(2);
      expect(result.successfulConversions).toBe(1);
      expect(result.failedConversions).toBe(1);
    });
  });

  describe('convertImageUrlToBase64', () => {
    it('應該從URL轉換圖片', async () => {
      const imageUrl = 'https://example.com/image.jpg';

      // 模擬圖片加載成功
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);

      const result = await convertImageUrlToBase64(imageUrl, {
        quality: 0.9,
        format: 'png',
      });

      expect(result.base64).toBe('data:image/jpeg;base64,mock-base64-data');
      expect(result.format).toBe('png');
      expect(result.mimeType).toBe('image/png');
    });

    it('應該處理圖片加載失敗', async () => {
      const imageUrl = 'https://example.com/invalid-image.jpg';

      // 模擬圖片加載失敗
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror();
      }, 0);

      await expect(convertImageUrlToBase64(imageUrl)).rejects.toThrow(
        '圖片加載失敗'
      );
    });
  });

  describe('base64ToBlob', () => {
    it('應該將base64轉換為Blob', () => {
      const base64 = 'data:image/jpeg;base64,mock-data';
      const blob = base64ToBlob(base64, 'image/jpeg');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
    });

    it('應該處理無效的base64格式', () => {
      const invalidBase64 = 'invalid-base64-string';

      expect(() => base64ToBlob(invalidBase64)).toThrow('無效的base64格式');
    });
  });

  describe('isValidImageBase64', () => {
    it('應該驗證有效的base64格式', () => {
      const validBase64 = 'data:image/jpeg;base64,mock-data';
      expect(isValidImageBase64(validBase64)).toBe(true);
    });

    it('應該拒絕無效的base64格式', () => {
      const invalidBase64 = 'invalid-base64-string';
      expect(isValidImageBase64(invalidBase64)).toBe(false);
    });

    it('應該拒絕非圖片格式的base64', () => {
      const nonImageBase64 = 'data:text/plain;base64,mock-data';
      expect(isValidImageBase64(nonImageBase64)).toBe(false);
    });
  });

  describe('getBase64ImageDimensions', () => {
    it('應該獲取圖片尺寸', async () => {
      const base64 = 'data:image/jpeg;base64,mock-data';

      // 模擬圖片加載成功
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);

      const dimensions = await getBase64ImageDimensions(base64);

      expect(dimensions).toEqual({
        width: 100,
        height: 100,
      });
    });

    it('應該處理圖片加載失敗', async () => {
      const base64 = 'data:image/jpeg;base64,invalid-data';

      // 模擬圖片加載失敗
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror();
      }, 0);

      await expect(getBase64ImageDimensions(base64)).rejects.toThrow(
        '無法獲取圖片尺寸'
      );
    });
  });

  describe('compressBase64Image', () => {
    it('應該壓縮base64圖片', async () => {
      const originalBase64 = 'data:image/jpeg;base64,original-data';

      // 模擬圖片加載成功
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 0);

      const result = await compressBase64Image(originalBase64, {
        quality: 0.5,
        maxWidth: 800,
        maxHeight: 600,
        format: 'jpeg',
      });

      expect(result.base64).toBe('data:image/jpeg;base64,mock-base64-data');
      expect(result.compressionRatio).toBeGreaterThanOrEqual(0);
      expect(result.processingTime).toBeGreaterThan(0);
    });
  });

  describe('DataQualityService Methods', () => {
    it('應該通過服務類轉換圖片', async () => {
      const mockFile = new File(['mock-image-data'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const result = await dataQualityService.convertImageToBase64(mockFile, {
        quality: 0.8,
        format: 'jpeg',
      });

      expect(result.base64).toBe('data:image/jpeg;base64,mock-base64-data');
    });

    it('應該通過服務類驗證base64', () => {
      const validBase64 = 'data:image/jpeg;base64,mock-data';
      const isValid = dataQualityService.isValidImageBase64(validBase64);

      expect(isValid).toBe(true);
    });

    it('應該通過服務類轉換base64為Blob', () => {
      const base64 = 'data:image/jpeg;base64,mock-data';
      const blob = dataQualityService.base64ToBlob(base64, 'image/jpeg');

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/jpeg');
    });
  });

  describe('Error Handling', () => {
    it('應該處理Canvas上下文創建失敗', async () => {
      // 模擬Canvas上下文創建失敗
      (mockCanvas.getContext as jest.Mock).mockReturnValue(null);

      const mockFile = new File(['mock-image-data'], 'test.jpg', {
        type: 'image/jpeg',
      });

      await expect(convertImageToBase64(mockFile)).rejects.toThrow(
        '無法創建canvas上下文'
      );
    });

    it('應該處理文件讀取失敗', async () => {
      const mockFile = new File(['mock-image-data'], 'test.jpg', {
        type: 'image/jpeg',
      });

      // 模擬文件讀取失敗
      setTimeout(() => {
        if (mockFileReader.onerror) mockFileReader.onerror();
      }, 0);

      await expect(convertImageToBase64(mockFile)).rejects.toThrow(
        '文件讀取失敗'
      );
    });
  });

  describe('Performance', () => {
    it('應該記錄處理時間', async () => {
      const mockFile = new File(['mock-image-data'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const result = await convertImageToBase64(mockFile);

      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('應該計算壓縮比例', async () => {
      const mockFile = new File(['mock-image-data'], 'test.jpg', {
        type: 'image/jpeg',
      });

      const result = await convertImageToBase64(mockFile, {
        compression: true,
      });

      expect(result.compressionRatio).toBeGreaterThanOrEqual(0);
      expect(result.compressionRatio).toBeLessThanOrEqual(1);
    });
  });
});
