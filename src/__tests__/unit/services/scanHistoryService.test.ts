/* global jest, describe, it, expect, beforeEach, afterEach */
import { scanHistoryService } from '../../../services/scanHistoryService';
import { apiService } from '../../../services/apiService';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/logger');

const mockApiService = apiService as jest.Mocked<typeof apiService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('ScanHistoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getScanHistory', () => {
    const mockFilters = {
      scanType: 'recognition' as const,
      successOnly: true,
      page: 1,
      limit: 10,
    };

    const mockScanHistory = {
      history: [
        {
          id: 'scan-1',
          userId: 'user-123',
          cardId: 'card-123',
          cardName: '火球術',
          cardImage: 'https://example.com/card.jpg',
          scanType: 'recognition' as const,
          scanResult: {
            success: true,
            confidence: 0.95,
            recognizedCard: { id: 'card-123', name: '火球術' },
          },
          imageUri: 'file://scan.jpg',
          scanDate: new Date('2024-01-01T00:00:00Z'),
          processingTime: 1500,
          metadata: {
            deviceInfo: 'iPhone 15',
            appVersion: '1.0.0',
            scanMethod: 'camera',
            imageQuality: 'high',
          },
          tags: ['spell', 'fire'],
          notes: '清晰的掃描',
          isFavorite: false,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('應該成功獲取掃描歷史記錄', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockScanHistory,
        message: '掃描歷史獲取成功',
      });

      const result = await scanHistoryService.getScanHistory(mockFilters);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockScanHistory);
      expect(mockApiService.get).toHaveBeenCalledWith(
        expect.any(String),
        mockFilters
      );
    });

    it('應該處理無過濾器的情況', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockScanHistory,
        message: '掃描歷史獲取成功',
      });

      const result = await scanHistoryService.getScanHistory();

      expect(result.success).toBe(true);
      expect(mockApiService.get).toHaveBeenCalledWith(expect.any(String), {});
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('API 錯誤'));

      await expect(
        scanHistoryService.getScanHistory(mockFilters)
      ).rejects.toThrow('API 錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getScanRecord', () => {
    const mockRecordId = '123e4567-e89b-12d3-a456-426614174000';
    const mockScanRecord = {
      id: mockRecordId,
      userId: 'user-123',
      cardId: 'card-123',
      cardName: '火球術',
      scanType: 'recognition' as const,
      scanResult: {
        success: true,
        confidence: 0.95,
      },
      imageUri: 'file://scan.jpg',
      scanDate: new Date('2024-01-01T00:00:00Z'),
      processingTime: 1500,
      metadata: {
        deviceInfo: 'iPhone 15',
        appVersion: '1.0.0',
        scanMethod: 'camera',
        imageQuality: 'high',
      },
      tags: ['spell'],
      isFavorite: false,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    };

    it('應該成功獲取單個掃描記錄', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockScanRecord,
        message: '掃描記錄獲取成功',
      });

      const result = await scanHistoryService.getScanRecord(mockRecordId);

      expect(result).toEqual(mockScanRecord);
      expect(mockApiService.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('應該處理空記錄 ID', async () => {
      await expect(scanHistoryService.getScanRecord('')).rejects.toThrow(
        '無效的記錄 ID'
      );
    });

    it('應該處理非字符串記錄 ID', async () => {
      await expect(
        scanHistoryService.getScanRecord(123 as any)
      ).rejects.toThrow('無效的記錄 ID');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('記錄不存在'));

      await expect(
        scanHistoryService.getScanRecord(mockRecordId)
      ).rejects.toThrow('記錄不存在');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('createScanRecord', () => {
    const mockScanData = {
      cardId: 'card-123',
      cardName: '火球術',
      scanType: 'recognition' as const,
      scanResult: {
        success: true,
        confidence: 0.95,
      },
      imageUri: 'file://scan.jpg',
      scanDate: new Date('2024-01-01T00:00:00Z'),
      processingTime: 1500,
      metadata: {
        deviceInfo: 'iPhone 15',
        appVersion: '1.0.0',
        scanMethod: 'camera',
        imageQuality: 'high',
      },
      tags: ['spell'],
      isFavorite: false,
    };

    const mockCreatedRecord = {
      id: 'scan-2',
      userId: 'user-123',
      ...mockScanData,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-01T00:00:00Z'),
    };

    it('應該成功創建掃描記錄', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockCreatedRecord,
        message: '掃描記錄創建成功',
      });

      const result = await scanHistoryService.createScanRecord(mockScanData);

      expect(result).toEqual(mockCreatedRecord);
      expect(mockApiService.post).toHaveBeenCalledWith(
        expect.any(String),
        mockScanData
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('創建失敗'));

      await expect(
        scanHistoryService.createScanRecord(mockScanData)
      ).rejects.toThrow('創建失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('updateScanRecord', () => {
    const mockRecordId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUpdates = {
      notes: '更新後的筆記',
      tags: ['spell', 'fire', 'updated'],
    };

    const mockUpdatedRecord = {
      id: mockRecordId,
      userId: 'user-123',
      cardId: 'card-123',
      scanType: 'recognition' as const,
      scanResult: { success: true },
      imageUri: 'file://scan.jpg',
      scanDate: new Date('2024-01-01T00:00:00Z'),
      processingTime: 1500,
      metadata: {
        deviceInfo: 'iPhone 15',
        appVersion: '1.0.0',
        scanMethod: 'camera',
        imageQuality: 'high',
      },
      tags: ['spell', 'fire', 'updated'],
      notes: '更新後的筆記',
      isFavorite: false,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    };

    it('應該成功更新掃描記錄', async () => {
      mockApiService.put.mockResolvedValue({
        success: true,
        data: mockUpdatedRecord,
        message: '掃描記錄更新成功',
      });

      const result = await scanHistoryService.updateScanRecord(
        mockRecordId,
        mockUpdates
      );

      expect(result).toEqual(mockUpdatedRecord);
      expect(mockApiService.put).toHaveBeenCalledWith(
        expect.any(String),
        mockUpdates
      );
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('應該處理空記錄 ID', async () => {
      await expect(
        scanHistoryService.updateScanRecord('', mockUpdates)
      ).rejects.toThrow('無效的記錄 ID');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.put.mockRejectedValue(new Error('更新失敗'));

      await expect(
        scanHistoryService.updateScanRecord(mockRecordId, mockUpdates)
      ).rejects.toThrow('更新失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('deleteScanRecord', () => {
    const mockRecordId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該成功刪除掃描記錄', async () => {
      mockApiService.delete.mockResolvedValue({
        success: true,
        message: '掃描記錄刪除成功',
      });

      await scanHistoryService.deleteScanRecord(mockRecordId);

      expect(mockApiService.delete).toHaveBeenCalledWith(expect.any(String));
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('應該處理空記錄 ID', async () => {
      await expect(scanHistoryService.deleteScanRecord('')).rejects.toThrow(
        '無效的記錄 ID'
      );
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.delete.mockRejectedValue(new Error('刪除失敗'));

      await expect(
        scanHistoryService.deleteScanRecord(mockRecordId)
      ).rejects.toThrow('刪除失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('deleteMultipleRecords', () => {
    const mockRecordIds = ['scan-1', 'scan-2', 'scan-3'];

    it('應該成功批量刪除掃描記錄', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        message: '批量刪除成功',
      });

      await scanHistoryService.deleteMultipleRecords(mockRecordIds);

      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        recordIds: mockRecordIds,
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('應該處理空記錄 ID 列表', async () => {
      await expect(
        scanHistoryService.deleteMultipleRecords([])
      ).rejects.toThrow('無效的記錄 ID 列表');
    });

    it('應該處理非數組記錄 ID', async () => {
      await expect(
        scanHistoryService.deleteMultipleRecords('invalid' as any)
      ).rejects.toThrow('無效的記錄 ID 列表');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('批量刪除失敗'));

      await expect(
        scanHistoryService.deleteMultipleRecords(mockRecordIds)
      ).rejects.toThrow('批量刪除失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('toggleFavorite', () => {
    const mockRecordId = '123e4567-e89b-12d3-a456-426614174000';
    const mockToggledRecord = {
      id: mockRecordId,
      userId: 'user-123',
      cardId: 'card-123',
      scanType: 'recognition' as const,
      scanResult: { success: true },
      imageUri: 'file://scan.jpg',
      scanDate: new Date('2024-01-01T00:00:00Z'),
      processingTime: 1500,
      metadata: {
        deviceInfo: 'iPhone 15',
        appVersion: '1.0.0',
        scanMethod: 'camera',
        imageQuality: 'high',
      },
      tags: ['spell'],
      isFavorite: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    };

    it('應該成功切換收藏狀態', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockToggledRecord,
        message: '收藏狀態切換成功',
      });

      const result = await scanHistoryService.toggleFavorite(mockRecordId);

      expect(result).toEqual(mockToggledRecord);
      expect(mockApiService.patch).toHaveBeenCalledWith(expect.any(String));
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('應該處理空記錄 ID', async () => {
      await expect(scanHistoryService.toggleFavorite('')).rejects.toThrow(
        '無效的記錄 ID'
      );
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.patch.mockRejectedValue(new Error('切換失敗'));

      await expect(
        scanHistoryService.toggleFavorite(mockRecordId)
      ).rejects.toThrow('切換失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('addNote', () => {
    const mockRecordId = '123e4567-e89b-12d3-a456-426614174000';
    const mockNote = '這是一張很好的卡片';
    const mockUpdatedRecord = {
      id: mockRecordId,
      userId: 'user-123',
      cardId: 'card-123',
      scanType: 'recognition' as const,
      scanResult: { success: true },
      imageUri: 'file://scan.jpg',
      scanDate: new Date('2024-01-01T00:00:00Z'),
      processingTime: 1500,
      metadata: {
        deviceInfo: 'iPhone 15',
        appVersion: '1.0.0',
        scanMethod: 'camera',
        imageQuality: 'high',
      },
      tags: ['spell'],
      notes: mockNote,
      isFavorite: false,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    };

    it('應該成功添加筆記', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedRecord,
        message: '筆記添加成功',
      });

      const result = await scanHistoryService.addNote(mockRecordId, mockNote);

      expect(result).toEqual(mockUpdatedRecord);
      expect(mockApiService.patch).toHaveBeenCalledWith(expect.any(String), {
        note: mockNote,
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('應該處理空記錄 ID', async () => {
      await expect(scanHistoryService.addNote('', mockNote)).rejects.toThrow(
        '無效的記錄 ID'
      );
    });

    it('應該處理空筆記內容', async () => {
      await expect(
        scanHistoryService.addNote(mockRecordId, '')
      ).rejects.toThrow('無效的筆記內容');
    });

    it('應該處理非字符串筆記', async () => {
      await expect(
        scanHistoryService.addNote(mockRecordId, 123 as any)
      ).rejects.toThrow('無效的筆記內容');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.patch.mockRejectedValue(new Error('添加筆記失敗'));

      await expect(
        scanHistoryService.addNote(mockRecordId, mockNote)
      ).rejects.toThrow('添加筆記失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('addTags', () => {
    const mockRecordId = '123e4567-e89b-12d3-a456-426614174000';
    const mockTags = ['rare', 'foil', 'graded'];
    const mockUpdatedRecord = {
      id: mockRecordId,
      userId: 'user-123',
      cardId: 'card-123',
      scanType: 'recognition' as const,
      scanResult: { success: true },
      imageUri: 'file://scan.jpg',
      scanDate: new Date('2024-01-01T00:00:00Z'),
      processingTime: 1500,
      metadata: {
        deviceInfo: 'iPhone 15',
        appVersion: '1.0.0',
        scanMethod: 'camera',
        imageQuality: 'high',
      },
      tags: ['spell', 'rare', 'foil', 'graded'],
      isFavorite: false,
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    };

    it('應該成功添加標籤', async () => {
      mockApiService.patch.mockResolvedValue({
        success: true,
        data: mockUpdatedRecord,
        message: '標籤添加成功',
      });

      const result = await scanHistoryService.addTags(mockRecordId, mockTags);

      expect(result).toEqual(mockUpdatedRecord);
      expect(mockApiService.patch).toHaveBeenCalledWith(expect.any(String), {
        tags: mockTags,
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('應該處理空記錄 ID', async () => {
      await expect(scanHistoryService.addTags('', mockTags)).rejects.toThrow(
        '無效的記錄 ID'
      );
    });

    it('應該處理空標籤列表', async () => {
      await expect(
        scanHistoryService.addTags(mockRecordId, [])
      ).rejects.toThrow('無效的標籤列表');
    });

    it('應該處理非數組標籤', async () => {
      await expect(
        scanHistoryService.addTags(mockRecordId, 'invalid' as any)
      ).rejects.toThrow('無效的標籤列表');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.patch.mockRejectedValue(new Error('添加標籤失敗'));

      await expect(
        scanHistoryService.addTags(mockRecordId, mockTags)
      ).rejects.toThrow('添加標籤失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getScanStatistics', () => {
    const mockStatistics = {
      totalScans: 100,
      successfulScans: 85,
      failedScans: 15,
      successRate: 0.85,
      averageProcessingTime: 1200,
      scansByType: {
        recognition: 60,
        condition: 20,
        authenticity: 15,
        batch: 5,
      },
      scansByDate: {
        today: 10,
        thisWeek: 50,
        thisMonth: 100,
      },
      mostScannedCards: [
        {
          cardId: 'card-123',
          cardName: '火球術',
          scanCount: 15,
        },
      ],
    };

    it('應該成功獲取掃描統計', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockStatistics,
        message: '統計獲取成功',
      });

      const result = await scanHistoryService.getScanStatistics();

      expect(result).toEqual(mockStatistics);
      expect(mockApiService.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('統計獲取失敗'));

      await expect(scanHistoryService.getScanStatistics()).rejects.toThrow(
        '統計獲取失敗'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('exportScanHistory', () => {
    const mockFilters = {
      scanType: 'recognition' as const,
      successOnly: true,
    };

    it('應該成功導出 CSV 格式', async () => {
      const mockDownloadUrl = 'https://example.com/export.csv';
      mockApiService.post.mockResolvedValue({
        success: true,
        data: { downloadUrl: mockDownloadUrl },
        message: '導出成功',
      });

      const result = await scanHistoryService.exportScanHistory(
        'csv',
        mockFilters
      );

      expect(result).toBe(mockDownloadUrl);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        format: 'csv',
        filters: mockFilters,
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('應該成功導出 JSON 格式', async () => {
      const mockDownloadUrl = 'https://example.com/export.json';
      mockApiService.post.mockResolvedValue({
        success: true,
        data: { downloadUrl: mockDownloadUrl },
        message: '導出成功',
      });

      const result = await scanHistoryService.exportScanHistory('json');

      expect(result).toBe(mockDownloadUrl);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        format: 'json',
        filters: undefined,
      });
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('導出失敗'));

      await expect(
        scanHistoryService.exportScanHistory('csv', mockFilters)
      ).rejects.toThrow('導出失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('searchScanHistory', () => {
    const mockQuery = '火球術';
    const mockFilters = {
      scanType: 'recognition' as const,
      successOnly: true,
    };

    const mockSearchResult = {
      history: [
        {
          id: 'scan-1',
          userId: 'user-123',
          cardId: 'card-123',
          cardName: '火球術',
          scanType: 'recognition' as const,
          scanResult: { success: true },
          imageUri: 'file://scan.jpg',
          scanDate: new Date('2024-01-01T00:00:00Z'),
          processingTime: 1500,
          metadata: {
            deviceInfo: 'iPhone 15',
            appVersion: '1.0.0',
            scanMethod: 'camera',
            imageQuality: 'high',
          },
          tags: ['spell'],
          isFavorite: false,
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-01T00:00:00Z'),
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('應該成功搜索掃描歷史', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockSearchResult,
        message: '搜索成功',
      });

      const result = await scanHistoryService.searchScanHistory(
        mockQuery,
        mockFilters
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSearchResult);
      expect(mockApiService.get).toHaveBeenCalledWith(expect.any(String), {
        query: mockQuery,
        ...mockFilters,
      });
    });

    it('應該處理空查詢', async () => {
      await expect(
        scanHistoryService.searchScanHistory('', mockFilters)
      ).rejects.toThrow('無效的搜索查詢');
    });

    it('應該處理非字符串查詢', async () => {
      await expect(
        scanHistoryService.searchScanHistory(123 as any, mockFilters)
      ).rejects.toThrow('無效的搜索查詢');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('搜索失敗'));

      await expect(
        scanHistoryService.searchScanHistory(mockQuery, mockFilters)
      ).rejects.toThrow('搜索失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getRecommendedTags', () => {
    const mockRecommendedTags = ['rare', 'foil', 'graded', 'mint', 'near-mint'];

    it('應該成功獲取推薦標籤', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockRecommendedTags,
        message: '推薦標籤獲取成功',
      });

      const result = await scanHistoryService.getRecommendedTags();

      expect(result).toEqual(mockRecommendedTags);
      expect(mockApiService.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('推薦標籤獲取失敗'));

      await expect(scanHistoryService.getRecommendedTags()).rejects.toThrow(
        '推薦標籤獲取失敗'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredRecords', () => {
    it('應該成功清理過期記錄', async () => {
      const mockCleanupResult = { deletedCount: 25 };
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockCleanupResult,
        message: '清理成功',
      });

      const result = await scanHistoryService.cleanupExpiredRecords(30);

      expect(result).toEqual(mockCleanupResult);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        daysToKeep: 30,
      });
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it('應該使用默認天數', async () => {
      const mockCleanupResult = { deletedCount: 10 };
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockCleanupResult,
        message: '清理成功',
      });

      const result = await scanHistoryService.cleanupExpiredRecords();

      expect(result).toEqual(mockCleanupResult);
      expect(mockApiService.post).toHaveBeenCalledWith(expect.any(String), {
        daysToKeep: 30,
      });
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('清理失敗'));

      await expect(
        scanHistoryService.cleanupExpiredRecords(30)
      ).rejects.toThrow('清理失敗');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
