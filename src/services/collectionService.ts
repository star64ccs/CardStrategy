import { apiService } from './apiService';
import { Collection, CollectionCard, Pagination } from '@/types';
import { validateInput, validateApiResponse } from '../utils/validationService';
import {
  CollectionSchema,
  CollectionCardSchema,
  CollectionStatisticsSchema,
  PaginatedResponseSchema,
  CollectionItemSchema,
} from '../utils/validationSchemas';
import { z } from 'zod';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 創建收藏請求驗證模式
const CreateCollectionRequestSchema = z.object({
  name: z
    .string()
    .min(1, '收藏名稱不能為空')
    .max(50, '收藏名稱不能超過 50 個字元'),
  description: z.string().max(200, '描述不能超過 200 個字元').optional(),
  isPublic: z.boolean(),
});

// 添加卡牌到收藏請求驗證模式
const AddCardToCollectionRequestSchema = z.object({
  cardId: z.string().uuid('無效的卡牌 ID'),
  quantity: z.number().int().min(1, '數量至少為 1'),
  condition: z.enum([
    'mint',
    'near-mint',
    'excellent',
    'good',
    'light-played',
    'played',
    'poor',
  ]),
  isFoil: z.boolean(),
  purchasePrice: z.number().min(0, '購買價格不能為負數').optional(),
  notes: z.string().max(500, '備註不能超過 500 個字元').optional(),
});

// 搜索收藏卡牌請求驗證模式
const SearchCollectionCardsRequestSchema = z.object({
  query: z.string().min(1, '搜索查詢不能為空'),
  filters: z
    .object({
      condition: z
        .enum([
          'mint',
          'near-mint',
          'excellent',
          'good',
          'light-played',
          'played',
          'poor',
        ])
        .optional(),
      isFoil: z.boolean().optional(),
      minPrice: z.number().min(0).optional(),
      maxPrice: z.number().min(0).optional(),
      rarity: z.enum(['common', 'uncommon', 'rare', 'mythic']).optional(),
    })
    .optional(),
});

class CollectionService {
  // 獲取用戶收藏
  async getCollections(): Promise<Collection[]> {
    try {
      const response = await apiService.get<Collection[]>('/collections');
      const validationResult = validateApiResponse(
        z.array(CollectionSchema),
        response.data
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '收藏數據驗證失敗');
      }
      return validationResult.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取單個收藏
  async getCollection(collectionId: string): Promise<Collection> {
    try {
      const validationResult = validateInput(
        z.object({ collectionId: z.string().uuid('無效的收藏 ID') }),
        { collectionId }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '收藏 ID 驗證失敗');
      }
      const response = await apiService.get<Collection>(
        `/collections/${collectionId}`
      );
      const responseValidation = validateApiResponse(
        CollectionSchema,
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '收藏數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 創建收藏
  async createCollection(data: {
    name: string;
    description?: string;
    isPublic: boolean;
  }): Promise<Collection> {
    try {
      const validationResult = validateInput(
        CreateCollectionRequestSchema,
        data
      );
      if (!validationResult.isValid) {
        throw new Error(
          validationResult.errorMessage || '創建收藏數據驗證失敗'
        );
      }
      const response = await apiService.post<Collection>(
        '/collections',
        validationResult.data
      );
      const responseValidation = validateApiResponse(
        CollectionSchema,
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '收藏數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 更新收藏
  async updateCollection(
    collectionId: string,
    data: Partial<Collection>
  ): Promise<Collection> {
    try {
      const validationResult = validateInput(
        z.object({ collectionId: z.string().uuid('無效的收藏 ID') }),
        { collectionId }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '收藏 ID 驗證失敗');
      }
      const response = await apiService.put<Collection>(
        `/collections/${collectionId}`,
        data
      );
      const responseValidation = validateApiResponse(
        CollectionSchema,
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '收藏數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 刪除收藏
  async deleteCollection(collectionId: string): Promise<void> {
    try {
      const validationResult = validateInput(
        z.object({ collectionId: z.string().uuid('無效的收藏 ID') }),
        { collectionId }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '收藏 ID 驗證失敗');
      }
      await apiService.delete(`/collections/${collectionId}`);
    } catch (error) {
      throw error;
    }
  }

  // 添加卡牌到收藏
  async addCardToCollection(
    collectionId: string,
    cardData: {
      cardId: string;
      quantity: number;
      condition: string;
      isFoil: boolean;
      purchasePrice?: number;
      notes?: string;
    }
  ): Promise<CollectionCard> {
    try {
      const idValidation = validateInput(
        z.object({ collectionId: z.string().uuid('無效的收藏 ID') }),
        { collectionId }
      );
      if (!idValidation.isValid) {
        throw new Error(idValidation.errorMessage || '收藏 ID 驗證失敗');
      }
      const cardValidation = validateInput(
        AddCardToCollectionRequestSchema,
        cardData
      );
      if (!cardValidation.isValid) {
        throw new Error(cardValidation.errorMessage || '卡牌數據驗證失敗');
      }
      const response = await apiService.post<CollectionCard>(
        `/collections/${collectionId}/cards`,
        cardValidation.data
      );
      const responseValidation = validateApiResponse(
        CollectionCardSchema,
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '卡牌數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 從收藏移除卡牌
  async removeCardFromCollection(
    collectionId: string,
    cardId: string
  ): Promise<void> {
    try {
      const validationResult = validateInput(
        z.object({
          collectionId: z.string().uuid('無效的收藏 ID'),
          cardId: z.string().uuid('無效的卡牌 ID'),
        }),
        { collectionId, cardId }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || 'ID 驗證失敗');
      }
      await apiService.delete(`/collections/${collectionId}/cards/${cardId}`);
    } catch (error) {
      throw error;
    }
  }

  // 更新收藏中的卡牌
  async updateCardInCollection(
    collectionId: string,
    cardId: string,
    data: Partial<CollectionCard>
  ): Promise<CollectionCard> {
    try {
      const validationResult = validateInput(
        z.object({
          collectionId: z.string().uuid('無效的收藏 ID'),
          cardId: z.string().uuid('無效的卡牌 ID'),
        }),
        { collectionId, cardId }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || 'ID 驗證失敗');
      }
      const response = await apiService.put<CollectionCard>(
        `/collections/${collectionId}/cards/${cardId}`,
        data
      );
      const responseValidation = validateApiResponse(
        CollectionCardSchema,
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '卡牌數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取收藏統計
  async getCollectionStatistics(collectionId: string): Promise<{
    totalCards: number;
    totalValue: number;
    averageCondition: number;
    mostValuableCard?: string;
    recentAdditions: number;
  }> {
    try {
      const validationResult = validateInput(
        z.object({ collectionId: z.string().uuid('無效的收藏 ID') }),
        { collectionId }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '收藏 ID 驗證失敗');
      }
      const response = await apiService.get(
        `/collections/${collectionId}/statistics`
      );
      const responseValidation = validateApiResponse(
        CollectionStatisticsSchema,
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '統計數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 搜索收藏中的卡牌
  async searchCardsInCollection(
    collectionId: string,
    query: string,
    filters?: any
  ): Promise<{
    cards: CollectionCard[];
    pagination: Pagination;
  }> {
    try {
      const validationResult = validateInput(
        z.object({
          collectionId: z.string().uuid('無效的收藏 ID'),
          query: z.string().min(1, '搜索查詢不能為空'),
        }),
        { collectionId, query }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '搜索參數驗證失敗');
      }

      if (filters) {
        const filterValidation = validateInput(
          z.object({
            filters: SearchCollectionCardsRequestSchema.shape.filters,
          }),
          { filters }
        );
        if (!filterValidation.isValid) {
          throw new Error(filterValidation.errorMessage || '過濾器驗證失敗');
        }
      }

      const response = await apiService.get(
        `/collections/${collectionId}/search`,
        {
          params: { query, ...filters },
        }
      );
      const responseValidation = validateApiResponse(
        PaginatedResponseSchema(CollectionCardSchema),
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '搜索結果驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 導入收藏
  async importCollection(data: {
    name: string;
    description?: string;
    cards: {
      cardId: string;
      quantity: number;
      condition: string;
      isFoil: boolean;
      purchasePrice?: number;
    }[];
  }): Promise<Collection> {
    try {
      const ImportCollectionRequestSchema = z.object({
        name: z
          .string()
          .min(1, '收藏名稱不能為空')
          .max(50, '收藏名稱不能超過 50 個字元'),
        description: z.string().max(200, '描述不能超過 200 個字元').optional(),
        cards: z
          .array(
            z.object({
              cardId: z.string().uuid('無效的卡牌 ID'),
              quantity: z.number().int().min(1, '數量至少為 1'),
              condition: z.enum([
                'mint',
                'near-mint',
                'excellent',
                'good',
                'light-played',
                'played',
                'poor',
              ]),
              isFoil: z.boolean(),
              purchasePrice: z.number().min(0, '購買價格不能為負數').optional(),
            })
          )
          .min(1, '至少需要一張卡牌'),
      });

      const validatedData = validateInput(ImportCollectionRequestSchema, data);
      const response = await apiService.post<Collection>(
        '/collections/import',
        validatedData.data
      );
      const responseValidation = validateApiResponse(
        CollectionSchema,
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '收藏數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 導出收藏
  async exportCollection(
    collectionId: string,
    format: 'csv' | 'json' = 'json'
  ): Promise<string> {
    try {
      const validationResult = validateInput(
        z.object({
          collectionId: z.string().uuid('無效的收藏 ID'),
          format: z.enum(['csv', 'json']),
        }),
        { collectionId, format }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '導出參數驗證失敗');
      }
      const response = await apiService.get(
        `/collections/${collectionId}/export?format=${format}`
      );
      const responseValidation = validateApiResponse(z.string(), response.data);
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '導出結果驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 分享收藏
  async shareCollection(
    collectionId: string,
    settings: {
      isPublic: boolean;
      allowComments: boolean;
      allowRating: boolean;
    }
  ): Promise<{ shareUrl: string }> {
    try {
      const validationResult = validateInput(
        z.object({ collectionId: z.string().uuid('無效的收藏 ID') }),
        { collectionId }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '收藏 ID 驗證失敗');
      }
      const ShareSettingsSchema = z.object({
        isPublic: z.boolean(),
        allowComments: z.boolean(),
        allowRating: z.boolean(),
      });
      const validatedSettings = validateInput(ShareSettingsSchema, settings);
      const response = await apiService.post(
        `/collections/${collectionId}/share`,
        validatedSettings.data
      );
      const responseValidation = validateApiResponse(
        z.object({ shareUrl: z.string().url() }),
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '分享設置驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 獲取公開收藏
  async getPublicCollections(filters?: any): Promise<{
    collections: Collection[];
    pagination: Pagination;
  }> {
    try {
      if (filters) {
        const PublicCollectionFiltersSchema = z.object({
          search: z.string().optional(),
          category: z.string().optional(),
          sortBy: z
            .enum(['name', 'createdAt', 'cardCount', 'popularity'])
            .optional(),
          sortOrder: z.enum(['asc', 'desc']).optional(),
          limit: z.number().int().min(1).max(100).optional(),
          offset: z.number().int().min(0).optional(),
        });
        const validationResult = validateInput(
          z.object({ filters: PublicCollectionFiltersSchema }),
          { filters }
        );
        if (!validationResult.isValid) {
          throw new Error(
            validationResult.errorMessage || '公開收藏過濾器驗證失敗'
          );
        }
      }

      const response = await apiService.get('/collections/public', {
        params: filters,
      });
      const responseValidation = validateApiResponse(
        PaginatedResponseSchema(CollectionSchema),
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(
          responseValidation.errorMessage || '公開收藏結果驗證失敗'
        );
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }

  // 複製收藏
  async duplicateCollection(
    collectionId: string,
    newName: string
  ): Promise<Collection> {
    try {
      const validationResult = validateInput(
        z.object({
          collectionId: z.string().uuid('無效的收藏 ID'),
          newName: z
            .string()
            .min(1, '新名稱不能為空')
            .max(50, '新名稱不能超過 50 個字元'),
        }),
        { collectionId, newName }
      );
      if (!validationResult.isValid) {
        throw new Error(validationResult.errorMessage || '複製參數驗證失敗');
      }
      const response = await apiService.post<Collection>(
        `/collections/${collectionId}/duplicate`,
        {
          name: newName,
        }
      );
      const responseValidation = validateApiResponse(
        CollectionSchema,
        response.data
      );
      if (!responseValidation.isValid) {
        throw new Error(responseValidation.errorMessage || '收藏數據驗證失敗');
      }
      return responseValidation.data!;
    } catch (error) {
      throw error;
    }
  }
}

export { CollectionService };
export const collectionService = new CollectionService();
export default collectionService;
