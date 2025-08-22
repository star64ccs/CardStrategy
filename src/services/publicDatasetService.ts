import { apiService, ApiResponse } from './apiService';
import { API_ENDPOINTS } from '../config/api';
import { logger } from '../utils/logger';

// 公開數據集類型
export interface PublicDataset {
  id: string;
  name: string;
  source: string;
  description: string;
  cardCount: number;
  lastUpdated: string;
  license: string;
  downloadUrl?: string;
  apiEndpoint?: string;
  isActive: boolean;
}

// 數據集整合結果
export interface DatasetIntegrationResult {
  success: boolean;
  integratedCards: number;
  skippedCards: number;
  errors: string[];
  processingTime: number;
}

// 公開數據集服務類
class PublicDatasetService {
  private datasets: PublicDataset[] = [
    {
      id: 'pokemon-tcg-api',
      name: 'Pokémon TCG API',
      source: 'Pokémon Company',
      description: '官方Pokémon卡牌數據庫',
      cardCount: 15000,
      lastUpdated: '2024-01-01',
      license: 'CC BY-NC-SA 4.0',
      apiEndpoint: 'https://api.pokemontcg.io/v2',
      isActive: true,
    },
    {
      id: 'yugioh-wikia',
      name: 'Yu-Gi-Oh! Wikia',
      source: 'Fandom',
      description: 'Yu-Gi-Oh!卡牌百科數據',
      cardCount: 12000,
      lastUpdated: '2024-01-01',
      license: 'CC BY-SA 3.0',
      downloadUrl: 'https://yugioh.fandom.com/api.php',
      isActive: true,
    },
    {
      id: 'magic-gatherer',
      name: 'Magic: The Gathering Gatherer',
      source: 'Wizards of the Coast',
      description: 'MTG官方卡牌數據庫',
      cardCount: 25000,
      lastUpdated: '2024-01-01',
      license: 'Proprietary',
      apiEndpoint: 'https://api.magicthegathering.io/v1',
      isActive: true,
    },
    {
      id: 'academic-card-dataset',
      name: 'Academic Card Recognition Dataset',
      source: 'University Research',
      description: '學術研究用卡牌識別數據集',
      cardCount: 5000,
      lastUpdated: '2024-01-01',
      license: 'MIT',
      downloadUrl: 'https://github.com/academic/card-dataset',
      isActive: true,
    },
  ];

  // 獲取所有可用數據集
  async getAvailableDatasets(): Promise<ApiResponse<PublicDataset[]>> {
    try {
      const response = await apiService.get<PublicDataset[]>(
        API_ENDPOINTS.DATASET.LIST || '/dataset/list'
      );

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取數據集列表失敗:', { error: error.message });
      throw error;
    }
  }

  // 整合數據集到本地數據庫
  async integrateDataset(datasetId: string): Promise<ApiResponse<DatasetIntegrationResult>> {
    try {
      const response = await apiService.post<DatasetIntegrationResult>(
        `${API_ENDPOINTS.DATASET.INTEGRATE}/${datasetId}` || `/dataset/integrate/${datasetId}`
      );

      logger.info('✅ 數據集整合成功', {
        datasetId,
        integratedCards: response.data?.integratedCards,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 數據集整合失敗:', { error: error.message, datasetId });
      throw error;
    }
  }

  // 同步數據集更新
  async syncDataset(datasetId: string): Promise<ApiResponse<DatasetIntegrationResult>> {
    try {
      const response = await apiService.post<DatasetIntegrationResult>(
        `${API_ENDPOINTS.DATASET.SYNC}/${datasetId}` || `/dataset/sync/${datasetId}`
      );

      logger.info('✅ 數據集同步成功', {
        datasetId,
        integratedCards: response.data?.integratedCards,
      });

      return response;
    } catch (error: any) {
      logger.error('❌ 數據集同步失敗:', { error: error.message, datasetId });
      throw error;
    }
  }

  // 獲取數據集統計信息
  async getDatasetStats(): Promise<ApiResponse<{
    totalDatasets: number;
    activeDatasets: number;
    totalCards: number;
    lastSync: string;
  }>> {
    try {
      const response = await apiService.get<{
        totalDatasets: number;
        activeDatasets: number;
        totalCards: number;
        lastSync: string;
      }>(API_ENDPOINTS.DATASET.STATS || '/dataset/stats');

      return response;
    } catch (error: any) {
      logger.error('❌ 獲取數據集統計失敗:', { error: error.message });
      throw error;
    }
  }

  // 驗證數據集完整性
  async validateDataset(datasetId: string): Promise<ApiResponse<{
    isValid: boolean;
    issues: string[];
    cardCount: number;
  }>> {
    try {
      const response = await apiService.get<{
        isValid: boolean;
        issues: string[];
        cardCount: number;
      }>(`${API_ENDPOINTS.DATASET.VALIDATE}/${datasetId}` || `/dataset/validate/${datasetId}`);

      return response;
    } catch (error: any) {
      logger.error('❌ 數據集驗證失敗:', { error: error.message, datasetId });
      throw error;
    }
  }
}

export const publicDatasetService = new PublicDatasetService();
export default publicDatasetService;
