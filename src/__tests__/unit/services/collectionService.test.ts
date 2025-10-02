/* global jest, describe, it, expect, beforeEach, afterEach */
import { apiService } from '../../../services/apiService';
import { collectionService } from '../../../services/collectionService';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/validationService');
jest.mock('../../../utils/validationSchemas');

const _mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('CollectionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCollections', () => {
    const _mockCollections = [
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

    it('應該SuccessGet用戶收藏列表', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockCollections,
        message: '收藏列表GetSuccess',
      });

      const _result = await collectionService.getCollections();

      expect(result).toEqual(mockCollections);
      expect(mockApiService.get).toHaveBeenCalledWith('/collections');
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('API Error'));

      await expect(collectionService.getCollections()).rejects.toThrow(
        'API Error'
      );
    });
  });

  describe('getCollection', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const _mockCollection = {
      id: mockCollectionId,
      name: '我的收藏',
      description: '我的第一個收藏',
      isPublic: false,
      cardCount: 10,
      totalValue: 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('應該SuccessGet單個收藏', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockCollection,
        message: '收藏GetSuccess',
      });

      const _result = await collectionService.getCollection(mockCollectionId);

      expect(result).toEqual(mockCollection);
      expect(mockApiService.get).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}`
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const _invalidId = 'invalid-id';

      await expect(
        collectionService.getCollection(invalidId)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('收藏不存在'));

      await expect(
        collectionService.getCollection(mockCollectionId)
      ).rejects.toThrow('收藏不存在');
    });
  });

  describe('createCollection', () => {
    const _mockCollectionData = {
      name: '新收藏',
      description: '這是一個新收藏',
      isPublic: true,
    };

    const _mockCreatedCollection = {
      id: 'collection-2',
      ...mockCollectionData,
      cardCount: 0,
      totalValue: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('應該SuccessCreate收藏', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockCreatedCollection,
        message: '收藏CreateSuccess',
      });

      const _result =
        await collectionService.createCollection(mockCollectionData);

      expect(result).toEqual(mockCreatedCollection);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/collections',
        mockCollectionData
      );
    });

    it('應該處理空名稱', async () => {
      const _invalidData = { ...mockCollectionData, name: '' };

      await expect(
        collectionService.createCollection(invalidData)
      ).rejects.toThrow();
    });

    it('應該處理過長的名稱', async () => {
      const _invalidData = { ...mockCollectionData, name: 'a'.repeat(51) };

      await expect(
        collectionService.createCollection(invalidData)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.post.mockRejectedValue(new Error('CreateFailed'));

      await expect(
        collectionService.createCollection(mockCollectionData)
      ).rejects.toThrow('CreateFailed');
    });
  });

  describe('updateCollection', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const _mockUpdateData = {
      name: '更新後的收藏名稱',
      description: '更新後的描述',
    };

    const _mockUpdatedCollection = {
      id: mockCollectionId,
      ...mockUpdateData,
      isPublic: false,
      cardCount: 10,
      totalValue: 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    it('應該SuccessUpdate收藏', async () => {
      mockApiService.put.mockResolvedValue({
        success: true,
        data: mockUpdatedCollection,
        message: '收藏UpdateSuccess',
      });

      const _result = await collectionService.updateCollection(
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
      const _invalidId = 'invalid-id';

      await expect(
        collectionService.updateCollection(invalidId, mockUpdateData)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.put.mockRejectedValue(new Error('UpdateFailed'));

      await expect(
        collectionService.updateCollection(mockCollectionId, mockUpdateData)
      ).rejects.toThrow('UpdateFailed');
    });
  });

  describe('deleteCollection', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該SuccessDelete收藏', async () => {
      mockApiService.delete.mockResolvedValue({
        success: true,
        message: '收藏DeleteSuccess',
      });

      await collectionService.deleteCollection(mockCollectionId);

      expect(mockApiService.delete).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}`
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const _invalidId = 'invalid-id';

      await expect(
        collectionService.deleteCollection(invalidId)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.delete.mockRejectedValue(new Error('DeleteFailed'));

      await expect(
        collectionService.deleteCollection(mockCollectionId)
      ).rejects.toThrow('DeleteFailed');
    });
  });

  describe('addCardToCollection', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const _mockCardData = {
      cardId: 'card-123',
      quantity: 2,
      condition: 'mint',
      isFoil: false,
      purchasePrice: 100,
      notes: '這是一張好卡',
    };

    const _mockAddedCard = {
      id: 'collection-card-1',
      collectionId: mockCollectionId,
      ...mockCardData,
      addedAt: '2024-01-01T00:00:00Z',
    };

    it('應該Success添加卡牌到收藏', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockAddedCard,
        message: '卡牌添加Success',
      });

      const _result = await collectionService.addCardToCollection(
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
      const _invalidCollectionId = 'invalid-id';

      await expect(
        collectionService.addCardToCollection(invalidCollectionId, mockCardData)
      ).rejects.toThrow();
    });

    it('應該處理無效的卡牌 ID', async () => {
      const _invalidCardData = { ...mockCardData, cardId: 'invalid-id' };

      await expect(
        collectionService.addCardToCollection(mockCollectionId, invalidCardData)
      ).rejects.toThrow();
    });

    it('應該處理無效的數量', async () => {
      const _invalidCardData = { ...mockCardData, quantity: 0 };

      await expect(
        collectionService.addCardToCollection(mockCollectionId, invalidCardData)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.post.mockRejectedValue(new Error('添加Failed'));

      await expect(
        collectionService.addCardToCollection(mockCollectionId, mockCardData)
      ).rejects.toThrow('添加Failed');
    });
  });

  describe('removeCardFromCollection', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const _mockCardId = 'card-123';

    it('應該Success從收藏移除卡牌', async () => {
      mockApiService.delete.mockResolvedValue({
        success: true,
        message: '卡牌移除Success',
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
      const _invalidCollectionId = 'invalid-id';

      await expect(
        collectionService.removeCardFromCollection(
          invalidCollectionId,
          mockCardId
        )
      ).rejects.toThrow();
    });

    it('應該處理無效的卡牌 ID', async () => {
      const _invalidCardId = 'invalid-id';

      await expect(
        collectionService.removeCardFromCollection(
          mockCollectionId,
          invalidCardId
        )
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.delete.mockRejectedValue(new Error('移除Failed'));

      await expect(
        collectionService.removeCardFromCollection(mockCollectionId, mockCardId)
      ).rejects.toThrow('移除Failed');
    });
  });

  describe('updateCardInCollection', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const _mockCardId = 'card-123';
    const _mockUpdateData = {
      quantity: 3,
      condition: 'near-mint',
      notes: '更新後的備註',
    };

    const _mockUpdatedCard = {
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

    it('應該SuccessUpdate收藏中的卡牌', async () => {
      mockApiService.put.mockResolvedValue({
        success: true,
        data: mockUpdatedCard,
        message: '卡牌UpdateSuccess',
      });

      const _result = await collectionService.updateCardInCollection(
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
      const _invalidCollectionId = 'invalid-id';
      const _invalidCardId = 'invalid-id';

      await expect(
        collectionService.updateCardInCollection(
          invalidCollectionId,
          invalidCardId,
          mockUpdateData
        )
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.put.mockRejectedValue(new Error('UpdateFailed'));

      await expect(
        collectionService.updateCardInCollection(
          mockCollectionId,
          mockCardId,
          mockUpdateData
        )
      ).rejects.toThrow('UpdateFailed');
    });
  });

  describe('getCollectionStatistics', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const _mockStatistics = {
      totalCards: 50,
      totalValue: 5000,
      averageCondition: 4.2,
      mostValuableCard: 'card-123',
      recentAdditions: 5,
    };

    it('應該SuccessGet收藏統計', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockStatistics,
        message: '統計GetSuccess',
      });

      const _result =
        await collectionService.getCollectionStatistics(mockCollectionId);

      expect(result).toEqual(mockStatistics);
      expect(mockApiService.get).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/statistics`
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const _invalidId = 'invalid-id';

      await expect(
        collectionService.getCollectionStatistics(invalidId)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('統計GetFailed'));

      await expect(
        collectionService.getCollectionStatistics(mockCollectionId)
      ).rejects.toThrow('統計GetFailed');
    });
  });

  describe('searchCardsInCollection', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const _mockQuery = '火球術';
    const _mockFilters = {
      condition: 'mint',
      isFoil: true,
      minPrice: 100,
    };

    const _mockSearchResult = {
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

    it('應該Success搜索收藏中的卡牌', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockSearchResult,
        message: '搜索Success',
      });

      const _result = await collectionService.searchCardsInCollection(
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
      const _emptyQuery = '';

      await expect(
        collectionService.searchCardsInCollection(mockCollectionId, emptyQuery)
      ).rejects.toThrow();
    });

    it('應該處理無效的收藏 ID', async () => {
      const _invalidId = 'invalid-id';

      await expect(
        collectionService.searchCardsInCollection(invalidId, mockQuery)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('搜索Failed'));

      await expect(
        collectionService.searchCardsInCollection(mockCollectionId, mockQuery)
      ).rejects.toThrow('搜索Failed');
    });
  });

  describe('importCollection', () => {
    const _mockImportData = {
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

    const _mockImportedCollection = {
      id: 'collection-imported',
      ...mockImportData,
      isPublic: false,
      cardCount: 2,
      totalValue: 200,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('應該Success導入收藏', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockImportedCollection,
        message: '收藏導入Success',
      });

      const _result = await collectionService.importCollection(mockImportData);

      expect(result).toEqual(mockImportedCollection);
      expect(mockApiService.post).toHaveBeenCalledWith(
        '/collections/import',
        mockImportData
      );
    });

    it('應該處理空卡牌列表', async () => {
      const _invalidData = { ...mockImportData, cards: [] };

      await expect(
        collectionService.importCollection(invalidData)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.post.mockRejectedValue(new Error('導入Failed'));

      await expect(
        collectionService.importCollection(mockImportData)
      ).rejects.toThrow('導入Failed');
    });
  });

  describe('exportCollection', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const _mockExportData = '{"collection": "exported data"}';

    it('應該Success導出收藏為 JSON', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockExportData,
        message: '導出Success',
      });

      const _result = await collectionService.exportCollection(
        mockCollectionId,
        'json'
      );

      expect(result).toBe(mockExportData);
      expect(mockApiService.get).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/export?format=json`
      );
    });

    it('應該Success導出收藏為 CSV', async () => {
      const _csvData = 'card_id,name,quantity,condition\ncard-123,火球術,2,mint';
      mockApiService.get.mockResolvedValue({
        success: true,
        data: csvData,
        message: '導出Success',
      });

      const _result = await collectionService.exportCollection(
        mockCollectionId,
        'csv'
      );

      expect(result).toBe(csvData);
      expect(mockApiService.get).toHaveBeenCalledWith(
        `/collections/${mockCollectionId}/export?format=csv`
      );
    });

    it('應該處理無效的收藏 ID', async () => {
      const _invalidId = 'invalid-id';

      await expect(
        collectionService.exportCollection(invalidId)
      ).rejects.toThrow();
    });

    it('應該處理無效的格式', async () => {
      await expect(
        collectionService.exportCollection(mockCollectionId, 'xml' as any)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('導出Failed'));

      await expect(
        collectionService.exportCollection(mockCollectionId)
      ).rejects.toThrow('導出Failed');
    });
  });

  describe('shareCollection', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const _mockShareSettings = {
      isPublic: true,
      allowComments: true,
      allowRating: false,
    };

    const _mockShareResult = {
      shareUrl: 'https://example.com/collections/shared-123',
    };

    it('應該Success分享收藏', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockShareResult,
        message: '分享Success',
      });

      const _result = await collectionService.shareCollection(
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
      const _invalidId = 'invalid-id';

      await expect(
        collectionService.shareCollection(invalidId, mockShareSettings)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.post.mockRejectedValue(new Error('分享Failed'));

      await expect(
        collectionService.shareCollection(mockCollectionId, mockShareSettings)
      ).rejects.toThrow('分享Failed');
    });
  });

  describe('getPublicCollections', () => {
    const _mockFilters = {
      search: '火球術',
      category: 'spell',
      sortBy: 'name',
      sortOrder: 'asc',
      limit: 10,
      offset: 0,
    };

    const _mockPublicCollections = {
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

    it('應該SuccessGet公開收藏', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockPublicCollections,
        message: '公開收藏GetSuccess',
      });

      const _result = await collectionService.getPublicCollections(mockFilters);

      expect(result).toEqual(mockPublicCollections);
      expect(mockApiService.get).toHaveBeenCalledWith('/collections/public', {
        params: mockFilters,
      });
    });

    it('應該處理無過濾器的情況', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockPublicCollections,
        message: '公開收藏GetSuccess',
      });

      const _result = await collectionService.getPublicCollections();

      expect(result).toEqual(mockPublicCollections);
      expect(mockApiService.get).toHaveBeenCalledWith('/collections/public', {
        params: undefined,
      });
    });

    it('應該Handle API Error', async () => {
      mockApiService.get.mockRejectedValue(new Error('GetFailed'));

      await expect(
        collectionService.getPublicCollections(mockFilters)
      ).rejects.toThrow('GetFailed');
    });
  });

  describe('duplicateCollection', () => {
    const _mockCollectionId = '123e4567-e89b-12d3-a456-426614174000';
    const _mockNewName = '複製的收藏';

    const _mockDuplicatedCollection = {
      id: 'duplicated-collection',
      name: mockNewName,
      description: '原始收藏的描述',
      isPublic: false,
      cardCount: 10,
      totalValue: 1000,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('應該Success複製收藏', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockDuplicatedCollection,
        message: '收藏複製Success',
      });

      const _result = await collectionService.duplicateCollection(
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
      const _invalidId = 'invalid-id';

      await expect(
        collectionService.duplicateCollection(invalidId, mockNewName)
      ).rejects.toThrow();
    });

    it('應該處理空的新名稱', async () => {
      const _emptyName = '';

      await expect(
        collectionService.duplicateCollection(mockCollectionId, emptyName)
      ).rejects.toThrow();
    });

    it('應該處理過長的新名稱', async () => {
      const _longName = 'a'.repeat(51);

      await expect(
        collectionService.duplicateCollection(mockCollectionId, longName)
      ).rejects.toThrow();
    });

    it('應該Handle API Error', async () => {
      mockApiService.post.mockRejectedValue(new Error('複製Failed'));

      await expect(
        collectionService.duplicateCollection(mockCollectionId, mockNewName)
      ).rejects.toThrow('複製Failed');
    });
  });
});
