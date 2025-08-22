/* global jest, describe, it, expect, beforeEach, afterEach */
import { collectionService } from '../../../services/collectionService';
import { apiService } from '../../../services/apiService';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/validationService');
jest.mock('../../../utils/validationSchemas');

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('CollectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCollections', () => {
    const mockCollections = [
      {
        id: 'collection-1',
        name: '我的收藏',
        description: '我的第一個收藏',
        isPublic: false,
        cardCount: 10,
        totalValue: 1000,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    it('應該成功獲取用戶收藏列表', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockCollections,
        message: '收藏列表獲取成功',
      });

      const result = await collectionService.getCollections();

      expect(result).toEqual(mockCollections);
      expect(mockApiService.get).toHaveBeenCalledWith('/collections');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('API 錯誤'));

      await expect(collectionService.getCollections()).rejects.toThrow(
        'API 錯誤'
      );
    });
  });

  describe('getCollection', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockCollection = {
      id: mockCollectionId,
      name: '我的收藏',
      description: '我的第一個收藏',
      isPublic: false,
      cardCount: 10,
      totalValue: 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('應該成功獲取單個收藏', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockCollection,
        message: '收藏獲取成功',
      });

      const result = await collectionService.getCollection(mockCollectionId);

      expect(result).toEqual(mockCollection);
      expect(mockApiService.get).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}`
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(
        collectionService.getCollection(invalidId)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('收藏不存在'));

      await expect(
        collectionService.getCollection(mockCollectionId)
      ).rejects.toThrow('收藏不存在');
    });
  });

  describe('createCollection', () => {
    const mockCollectionData = {
      name: '新收藏',
      description: '這是一個新收藏',
      isPublic: true,
    };

    const mockCreatedCollection = {
      id: 'collection-2',
      ...mockCollectionData,
      cardCount: 0,
      totalValue: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('應該成功創建收藏', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockCreatedCollection,
        message: '收藏創建成功',
      });

      const result =
        await collectionService.createCollection(mockCollectionData);

      expect(result).toEqual(mockCreatedCollection);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/collections',
        mockCollectionData
      );
    });

    it('應該處理空名稱', async () => {
      const invalidData = { ...mockCollectionData, name: '' };

      await expect(
        collectionService.createCollection(invalidData)
      ).rejects.toThrow();
    });

    it('應該處理過長的名稱', async () => {
      const invalidData = { ...mockCollectionData, name: 'a'.repeat(51) };

      await expect(
        collectionService.createCollection(invalidData)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('創建失敗'));

      await expect(
        collectionService.createCollection(mockCollectionData)
      ).rejects.toThrow('創建失敗');
    });
  });

  describe('updateCollection', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUpdateData = {
      name: '更新後的收藏名稱',
      description: '更新後的描述',
    };

    const mockUpdatedCollection = {
      id: mockCollectionId,
      ...mockUpdateData,
      isPublic: false,
      cardCount: 10,
      totalValue: 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    it('應該成功更新收藏', async () => {
      mockApiService.put.mockResolvedValue({
        success: true,
        data: mockUpdatedCollection,
        message: '收藏更新成功',
      });

      const result = await collectionService.updateCollection(
        mockCollectionId,
        mockUpdateData
      );

      expect(result).toEqual(mockUpdatedCollection);
      expect(mockApiService.put).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}`,
        mockUpdateData
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(
        collectionService.updateCollection(invalidId, mockUpdateData)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.put.mockRejectedValue(new Error('更新失敗'));

      await expect(
        collectionService.updateCollection(mockCollectionId, mockUpdateData)
      ).rejects.toThrow('更新失敗');
    });
  });

  describe('deleteCollection', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該成功刪除收藏', async () => {
      mockApiService.delete.mockResolvedValue({
        success: true,
        message: '收藏刪除成功',
      });

      await collectionService.deleteCollection(mockCollectionId);

      expect(mockApiService.delete).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}`
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(
        collectionService.deleteCollection(invalidId)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.delete.mockRejectedValue(new Error('刪除失敗'));

      await expect(
        collectionService.deleteCollection(mockCollectionId)
      ).rejects.toThrow('刪除失敗');
    });
  });

  describe('addCardToCollection', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockCardData = {
      cardId: 'card-123',
      quantity: 2,
      condition: 'mint',
      isFoil: false,
      purchasePrice: 100,
      notes: '這是一張好卡',
    };

    const mockAddedCard = {
      id: 'collection-card-1',
      collectionId: mockCollectionId,
      ...mockCardData,
      addedAt: '2024-01-01T00:00:00Z',
    };

    it('應該成功添加卡牌到收藏', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockAddedCard,
        message: '卡牌添加成功',
      });

      const result = await collectionService.addCardToCollection(
        mockCollectionId,
        mockCardData
      );

      expect(result).toEqual(mockAddedCard);
      expect(mockApiService.post).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/cards`,
        mockCardData
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const invalidCollectionId = 'invalid-id';

      await expect(
        collectionService.addCardToCollection(invalidCollectionId, mockCardData)
      ).rejects.toThrow();
    });

    it('應該處理無效的卡牌 ID', async () => {
      const invalidCardData = { ...mockCardData, cardId: 'invalid-id' };

      await expect(
        collectionService.addCardToCollection(mockCollectionId, invalidCardData)
      ).rejects.toThrow();
    });

    it('應該處理無效的數量', async () => {
      const invalidCardData = { ...mockCardData, quantity: 0 };

      await expect(
        collectionService.addCardToCollection(mockCollectionId, invalidCardData)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('添加失敗'));

      await expect(
        collectionService.addCardToCollection(mockCollectionId, mockCardData)
      ).rejects.toThrow('添加失敗');
    });
  });

  describe('removeCardFromCollection', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockCardId = 'card-123';

    it('應該成功從收藏移除卡牌', async () => {
      mockApiService.delete.mockResolvedValue({
        success: true,
        message: '卡牌移除成功',
      });

      await collectionService.removeCardFromCollection(
        mockCollectionId,
        mockCardId
      );

      expect(mockApiService.delete).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/cards/${mockCardId}`
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const invalidCollectionId = 'invalid-id';

      await expect(
        collectionService.removeCardFromCollection(
          invalidCollectionId,
          mockCardId
        )
      ).rejects.toThrow();
    });

    it('應該處理無效的卡牌 ID', async () => {
      const invalidCardId = 'invalid-id';

      await expect(
        collectionService.removeCardFromCollection(
          mockCollectionId,
          invalidCardId
        )
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.delete.mockRejectedValue(new Error('移除失敗'));

      await expect(
        collectionService.removeCardFromCollection(mockCollectionId, mockCardId)
      ).rejects.toThrow('移除失敗');
    });
  });

  describe('updateCardInCollection', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockCardId = 'card-123';
    const mockUpdateData = {
      quantity: 3,
      condition: 'near-mint',
      notes: '更新後的備註',
    };

    const mockUpdatedCard = {
      id: 'collection-card-1',
      collectionId: mockCollectionId,
      cardId: mockCardId,
      quantity: 3,
      condition: 'near-mint',
      isFoil: false,
      purchasePrice: 100,
      notes: '更新後的備註',
      addedAt: '2024-01-01T00:00:00Z',
    };

    it('應該成功更新收藏中的卡牌', async () => {
      mockApiService.put.mockResolvedValue({
        success: true,
        data: mockUpdatedCard,
        message: '卡牌更新成功',
      });

      const result = await collectionService.updateCardInCollection(
        mockCollectionId,
        mockCardId,
        mockUpdateData
      );

      expect(result).toEqual(mockUpdatedCard);
      expect(mockApiService.put).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/cards/${mockCardId}`,
        mockUpdateData
      );
    });

    it('應該處理無效的 ID', async () => {
      const invalidCollectionId = 'invalid-id';
      const invalidCardId = 'invalid-id';

      await expect(
        collectionService.updateCardInCollection(
          invalidCollectionId,
          invalidCardId,
          mockUpdateData
        )
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.put.mockRejectedValue(new Error('更新失敗'));

      await expect(
        collectionService.updateCardInCollection(
          mockCollectionId,
          mockCardId,
          mockUpdateData
        )
      ).rejects.toThrow('更新失敗');
    });
  });

  describe('getCollectionStatistics', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockStatistics = {
      totalCards: 50,
      totalValue: 5000,
      averageCondition: 4.2,
      mostValuableCard: 'card-123',
      recentAdditions: 5,
    };

    it('應該成功獲取收藏統計', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockStatistics,
        message: '統計獲取成功',
      });

      const result =
        await collectionService.getCollectionStatistics(mockCollectionId);

      expect(result).toEqual(mockStatistics);
      expect(mockApiService.get).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/statistics`
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(
        collectionService.getCollectionStatistics(invalidId)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('統計獲取失敗'));

      await expect(
        collectionService.getCollectionStatistics(mockCollectionId)
      ).rejects.toThrow('統計獲取失敗');
    });
  });

  describe('searchCardsInCollection', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockQuery = '火球術';
    const mockFilters = {
      condition: 'mint',
      isFoil: true,
      minPrice: 100,
    };

    const mockSearchResult = {
      cards: [
        {
          id: 'collection-card-1',
          collectionId: mockCollectionId,
          cardId: 'card-123',
          quantity: 1,
          condition: 'mint',
          isFoil: true,
          purchasePrice: 150,
          notes: '稀有卡',
          addedAt: '2024-01-01T00:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    it('應該成功搜索收藏中的卡牌', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockSearchResult,
        message: '搜索成功',
      });

      const result = await collectionService.searchCardsInCollection(
        mockCollectionId,
        mockQuery,
        mockFilters
      );

      expect(result).toEqual(mockSearchResult);
      expect(mockApiService.get).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/search`,
        {
          params: { query: mockQuery, ...mockFilters },
        }
      );
    });

    it('應該處理空查詢', async () => {
      const emptyQuery = '';

      await expect(
        collectionService.searchCardsInCollection(mockCollectionId, emptyQuery)
      ).rejects.toThrow();
    });

    it('應該處理無效的收藏 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(
        collectionService.searchCardsInCollection(invalidId, mockQuery)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('搜索失敗'));

      await expect(
        collectionService.searchCardsInCollection(mockCollectionId, mockQuery)
      ).rejects.toThrow('搜索失敗');
    });
  });

  describe('importCollection', () => {
    const mockImportData = {
      name: '導入的收藏',
      description: '從外部導入的收藏',
      cards: [
        {
          cardId: 'card-123',
          quantity: 2,
          condition: 'mint',
          isFoil: false,
          purchasePrice: 100,
        },
      ],
    };

    const mockImportedCollection = {
      id: 'collection-imported',
      ...mockImportData,
      isPublic: false,
      cardCount: 2,
      totalValue: 200,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('應該成功導入收藏', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockImportedCollection,
        message: '收藏導入成功',
      });

      const result = await collectionService.importCollection(mockImportData);

      expect(result).toEqual(mockImportedCollection);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/collections/import',
        mockImportData
      );
    });

    it('應該處理空卡牌列表', async () => {
      const invalidData = { ...mockImportData, cards: [] };

      await expect(
        collectionService.importCollection(invalidData)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('導入失敗'));

      await expect(
        collectionService.importCollection(mockImportData)
      ).rejects.toThrow('導入失敗');
    });
  });

  describe('exportCollection', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockExportData = '{"collection": "exported data"}';

    it('應該成功導出收藏為 JSON', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockExportData,
        message: '導出成功',
      });

      const result = await collectionService.exportCollection(
        mockCollectionId,
        'json'
      );

      expect(result).toBe(mockExportData);
      expect(mockApiService.get).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/export?format=json`
      );
    });

    it('應該成功導出收藏為 CSV', async () => {
      const csvData = 'card_id,name,quantity,condition\ncard-123,火球術,2,mint';
      mockApiService.get.mockResolvedValue({
        success: true,
        data: csvData,
        message: '導出成功',
      });

      const result = await collectionService.exportCollection(
        mockCollectionId,
        'csv'
      );

      expect(result).toBe(csvData);
      expect(mockApiService.get).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/export?format=csv`
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(
        collectionService.exportCollection(invalidId)
      ).rejects.toThrow();
    });

    it('應該處理無效的格式', async () => {
      await expect(
        collectionService.exportCollection(mockCollectionId, 'xml' as any)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('導出失敗'));

      await expect(
        collectionService.exportCollection(mockCollectionId)
      ).rejects.toThrow('導出失敗');
    });
  });

  describe('shareCollection', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockShareSettings = {
      isPublic: true,
      allowComments: true,
      allowRating: false,
    };

    const mockShareResult = {
      shareUrl: 'https://example.com/collections/shared-123',
    };

    it('應該成功分享收藏', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockShareResult,
        message: '分享成功',
      });

      const result = await collectionService.shareCollection(
        mockCollectionId,
        mockShareSettings
      );

      expect(result).toEqual(mockShareResult);
      expect(mockApiService.post).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/share`,
        mockShareSettings
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(
        collectionService.shareCollection(invalidId, mockShareSettings)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('分享失敗'));

      await expect(
        collectionService.shareCollection(mockCollectionId, mockShareSettings)
      ).rejects.toThrow('分享失敗');
    });
  });

  describe('getPublicCollections', () => {
    const mockFilters = {
      search: '火球術',
      category: 'spell',
      sortBy: 'name',
      sortOrder: 'asc',
      limit: 10,
      offset: 0,
    };

    const mockPublicCollections = {
      collections: [
        {
          id: 'public-collection-1',
          name: '公開收藏',
          description: '這是一個公開收藏',
          isPublic: true,
          cardCount: 20,
          totalValue: 2000,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    it('應該成功獲取公開收藏', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockPublicCollections,
        message: '公開收藏獲取成功',
      });

      const result = await collectionService.getPublicCollections(mockFilters);

      expect(result).toEqual(mockPublicCollections);
      expect(mockApiService.get).toHaveBeenCalledWith('/collections/public', {
        params: mockFilters,
      });
    });

    it('應該處理無過濾器的情況', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockPublicCollections,
        message: '公開收藏獲取成功',
      });

      const result = await collectionService.getPublicCollections();

      expect(result).toEqual(mockPublicCollections);
      expect(mockApiService.get).toHaveBeenCalledWith('/collections/public', {
        params: undefined,
      });
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('獲取失敗'));

      await expect(
        collectionService.getPublicCollections(mockFilters)
      ).rejects.toThrow('獲取失敗');
    });
  });

  describe('duplicateCollection', () => {
    const mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const mockNewName = '複製的收藏';

    const mockDuplicatedCollection = {
      id: 'duplicated-collection',
      name: mockNewName,
      description: '原始收藏的描述',
      isPublic: false,
      cardCount: 10,
      totalValue: 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('應該成功複製收藏', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockDuplicatedCollection,
        message: '收藏複製成功',
      });

      const result = await collectionService.duplicateCollection(
        mockCollectionId,
        mockNewName
      );

      expect(result).toEqual(mockDuplicatedCollection);
      expect(mockApiService.post).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/duplicate`,
        {
          name: mockNewName,
        }
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(
        collectionService.duplicateCollection(invalidId, mockNewName)
      ).rejects.toThrow();
    });

    it('應該處理空的新名稱', async () => {
      const emptyName = '';

      await expect(
        collectionService.duplicateCollection(mockCollectionId, emptyName)
      ).rejects.toThrow();
    });

    it('應該處理過長的新名稱', async () => {
      const longName = 'a'.repeat(51);

      await expect(
        collectionService.duplicateCollection(mockCollectionId, longName)
      ).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('複製失敗'));

      await expect(
        collectionService.duplicateCollection(mockCollectionId, mockNewName)
      ).rejects.toThrow('複製失敗');
    });
  });
});
