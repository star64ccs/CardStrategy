import { apiService } from './apiService';
import { Collection, CollectionCard, Pagination } from '@/types';

class CollectionService {
  // 獲取用戶收藏
  async getCollections(): Promise<Collection[]> {
    const response = await apiService.get<Collection[]>('/collections');
    return response.data!;
  }

  // 獲取單個收藏
  async getCollection(collectionId: string): Promise<Collection> {
    const response = await apiService.get<Collection>(`/collections/${collectionId}`);
    return response.data!;
  }

  // 創建收藏
  async createCollection(data: {
    name: string;
    description?: string;
    isPublic: boolean;
  }): Promise<Collection> {
    const response = await apiService.post<Collection>('/collections', data);
    return response.data!;
  }

  // 更新收藏
  async updateCollection(collectionId: string, data: Partial<Collection>): Promise<Collection> {
    const response = await apiService.put<Collection>(`/collections/${collectionId}`, data);
    return response.data!;
  }

  // 刪除收藏
  async deleteCollection(collectionId: string): Promise<void> {
    await apiService.delete(`/collections/${collectionId}`);
  }

  // 添加卡牌到收藏
  async addCardToCollection(collectionId: string, cardData: {
    cardId: string;
    quantity: number;
    condition: string;
    isFoil: boolean;
    purchasePrice?: number;
    notes?: string;
  }): Promise<CollectionCard> {
    const response = await apiService.post<CollectionCard>(`/collections/${collectionId}/cards`, cardData);
    return response.data!;
  }

  // 從收藏移除卡牌
  async removeCardFromCollection(collectionId: string, cardId: string): Promise<void> {
    await apiService.delete(`/collections/${collectionId}/cards/${cardId}`);
  }

  // 更新收藏中的卡牌
  async updateCardInCollection(
    collectionId: string,
    cardId: string,
    data: Partial<CollectionCard>
  ): Promise<CollectionCard> {
    const response = await apiService.put<CollectionCard>(`/collections/${collectionId}/cards/${cardId}`, data);
    return response.data!;
  }

  // 獲取收藏統計
  async getCollectionStatistics(collectionId: string): Promise<{
    totalCards: number;
    totalValue: number;
    averageCondition: number;
    mostValuableCard?: string;
    recentAdditions: number;
  }> {
    const response = await apiService.get(`/collections/${collectionId}/statistics`);
    return response.data!;
  }

  // 搜索收藏中的卡牌
  async searchCardsInCollection(collectionId: string, query: string, filters?: any): Promise<{
    cards: CollectionCard[];
    pagination: Pagination;
  }> {
    const response = await apiService.get(`/collections/${collectionId}/search`, {
      params: { query, ...filters }
    });
    return response.data!;
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
    const response = await apiService.post<Collection>('/collections/import', data);
    return response.data!;
  }

  // 導出收藏
  async exportCollection(collectionId: string, format: 'csv' | 'json' = 'json'): Promise<string> {
    const response = await apiService.get(`/collections/${collectionId}/export?format=${format}`);
    return response.data!;
  }

  // 分享收藏
  async shareCollection(collectionId: string, settings: {
    isPublic: boolean;
    allowComments: boolean;
    allowRating: boolean;
  }): Promise<{ shareUrl: string }> {
    const response = await apiService.post(`/collections/${collectionId}/share`, settings);
    return response.data!;
  }

  // 獲取公開收藏
  async getPublicCollections(filters?: any): Promise<{
    collections: Collection[];
    pagination: Pagination;
  }> {
    const response = await apiService.get('/collections/public', { params: filters });
    return response.data!;
  }

  // 複製收藏
  async duplicateCollection(collectionId: string, newName: string): Promise<Collection> {
    const response = await apiService.post<Collection>(`/collections/${collectionId}/duplicate`, {
      name: newName
    });
    return response.data!;
  }
}

export const collectionService = new CollectionService();
export default collectionService;
