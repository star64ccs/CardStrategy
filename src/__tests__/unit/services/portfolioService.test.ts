/* global jest, describe, it, expect, beforeEach, afterEach */
import { portfolioService } from '../../../services/portfolioService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../../utils/logger';

// Mock 依賴
jest.mock('@react-native-async-storage/async-storage');
jest.mock('../../../utils/logger');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('PortfolioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPortfolio', () => {
    const mockPortfolio = [
      {
        id: 'item-1',
        card: {
          id: 'card-1',
          name: '火球術',
          setName: '基礎系列',
          price: { current: 100, historical: [90, 95, 100] },
        },
        quantity: 2,
        purchasePrice: 80,
        purchaseDate: '2024-01-01T00:00:00Z',
        notes: '看好這張卡的前景',
      },
    ];

    it('應該成功獲取投資組合', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));

      const result = await portfolioService.getPortfolio();

      expect(result).toEqual(mockPortfolio);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('user_portfolio');
    });

    it('應該處理空投資組合', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await portfolioService.getPortfolio();

      expect(result).toEqual([]);
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('存儲錯誤'));

      const result = await portfolioService.getPortfolio();

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('addToPortfolio', () => {
    const mockCard = {
      id: 'card-1',
      name: '火球術',
      setName: '基礎系列',
      price: { current: 100, historical: [90, 95, 100] },
    };

    it('應該成功添加新卡片到投資組合', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');
      mockAsyncStorage.setItem.mockResolvedValue();

      await portfolioService.addToPortfolio(
        mockCard,
        2,
        80,
        '看好這張卡的前景'
      );

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_portfolio',
        expect.stringContaining('"card":{"id":"card-1"')
      );
    });

    it('應該更新現有卡片', async () => {
      const existingPortfolio = [
        {
          id: 'item-1',
          card: mockCard,
          quantity: 1,
          purchasePrice: 80,
          purchaseDate: '2024-01-01T00:00:00Z',
          notes: '原始筆記',
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(existingPortfolio)
      );
      mockAsyncStorage.setItem.mockResolvedValue();

      await portfolioService.addToPortfolio(mockCard, 1, 90, '更新筆記');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_portfolio',
        expect.stringContaining('"quantity":2')
      );
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('存儲錯誤'));

      await expect(
        portfolioService.addToPortfolio(mockCard, 1, 80)
      ).rejects.toThrow('存儲錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('removeFromPortfolio', () => {
    const mockPortfolio = [
      {
        id: 'item-1',
        card: {
          id: 'card-1',
          name: '火球術',
          setName: '基礎系列',
          price: { current: 100, historical: [] },
        },
        quantity: 2,
        purchasePrice: 80,
        purchaseDate: '2024-01-01T00:00:00Z',
      },
      {
        id: 'item-2',
        card: {
          id: 'card-2',
          name: '閃電箭',
          setName: '基礎系列',
          price: { current: 50, historical: [] },
        },
        quantity: 1,
        purchasePrice: 40,
        purchaseDate: '2024-01-02T00:00:00Z',
      },
    ];

    it('應該成功從投資組合移除項目', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));
      mockAsyncStorage.setItem.mockResolvedValue();

      await portfolioService.removeFromPortfolio('item-1');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_portfolio',
        JSON.stringify([mockPortfolio[1]])
      );
    });

    it('應該處理不存在的項目', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));
      mockAsyncStorage.setItem.mockResolvedValue();

      await portfolioService.removeFromPortfolio('non-existent');

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_portfolio',
        JSON.stringify(mockPortfolio)
      );
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('存儲錯誤'));

      await expect(
        portfolioService.removeFromPortfolio('item-1')
      ).rejects.toThrow('存儲錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('updatePortfolioItem', () => {
    const mockPortfolio = [
      {
        id: 'item-1',
        card: {
          id: 'card-1',
          name: '火球術',
          setName: '基礎系列',
          price: { current: 100, historical: [] },
        },
        quantity: 2,
        purchasePrice: 80,
        purchaseDate: '2024-01-01T00:00:00Z',
        notes: '原始筆記',
      },
    ];

    it('應該成功更新投資組合項目', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));
      mockAsyncStorage.setItem.mockResolvedValue();

      const updates = { quantity: 3, notes: '更新後的筆記' };

      await portfolioService.updatePortfolioItem('item-1', updates);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_portfolio',
        expect.stringContaining('"quantity":3')
      );
    });

    it('應該處理不存在的項目', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));
      mockAsyncStorage.setItem.mockResolvedValue();

      await portfolioService.updatePortfolioItem('non-existent', {
        quantity: 3,
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_portfolio',
        JSON.stringify(mockPortfolio)
      );
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('存儲錯誤'));

      await expect(
        portfolioService.updatePortfolioItem('item-1', { quantity: 3 })
      ).rejects.toThrow('存儲錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getPortfolioStats', () => {
    const mockPortfolio = [
      {
        id: 'item-1',
        card: {
          id: 'card-1',
          name: '火球術',
          setName: '基礎系列',
          price: { current: 100, historical: [] },
        },
        quantity: 2,
        purchasePrice: 80,
        purchaseDate: '2024-01-01T00:00:00Z',
      },
      {
        id: 'item-2',
        card: {
          id: 'card-2',
          name: '閃電箭',
          setName: '基礎系列',
          price: { current: 50, historical: [] },
        },
        quantity: 1,
        purchasePrice: 40,
        purchaseDate: '2024-01-02T00:00:00Z',
      },
    ];

    it('應該成功計算投資組合統計', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));

      const result = await portfolioService.getPortfolioStats();

      expect(result).toEqual({
        totalItems: 2,
        totalValue: 250, // 100*2 + 50*1
        totalCost: 200, // 80*2 + 40*1
        totalProfit: 50, // 250 - 200
        profitPercentage: 25, // (50/200) * 100
        averageReturn: 25, // 50/2
      });
    });

    it('應該處理空投資組合', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');

      const result = await portfolioService.getPortfolioStats();

      expect(result).toEqual({
        totalItems: 0,
        totalValue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitPercentage: 0,
        averageReturn: 0,
      });
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('存儲錯誤'));

      const result = await portfolioService.getPortfolioStats();

      expect(result).toEqual({
        totalItems: 0,
        totalValue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitPercentage: 0,
        averageReturn: 0,
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('clearPortfolio', () => {
    it('應該成功清空投資組合', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await portfolioService.clearPortfolio();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(
        'user_portfolio'
      );
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('存儲錯誤'));

      await expect(portfolioService.clearPortfolio()).rejects.toThrow(
        '存儲錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('exportPortfolio', () => {
    const mockPortfolio = [
      {
        id: 'item-1',
        card: {
          id: 'card-1',
          name: '火球術',
          setName: '基礎系列',
          price: { current: 100, historical: [] },
        },
        quantity: 2,
        purchasePrice: 80,
        purchaseDate: '2024-01-01T00:00:00Z',
      },
    ];

    it('應該成功導出投資組合數據', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));

      const result = await portfolioService.exportPortfolio();

      const exportData = JSON.parse(result);
      expect(exportData).toHaveProperty('portfolio');
      expect(exportData).toHaveProperty('stats');
      expect(exportData).toHaveProperty('exportDate');
      expect(exportData).toHaveProperty('version');
      expect(exportData.portfolio).toEqual(mockPortfolio);
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('存儲錯誤'));

      await expect(portfolioService.exportPortfolio()).rejects.toThrow(
        '存儲錯誤'
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('importPortfolio', () => {
    const mockImportData = {
      portfolio: [
        {
          id: 'item-1',
          card: {
            id: 'card-1',
            name: '火球術',
            setName: '基礎系列',
            price: { current: 100, historical: [] },
          },
          quantity: 2,
          purchasePrice: 80,
          purchaseDate: '2024-01-01T00:00:00Z',
        },
      ],
      stats: {
        totalItems: 1,
        totalValue: 200,
        totalCost: 160,
        totalProfit: 40,
        profitPercentage: 25,
        averageReturn: 40,
      },
      exportDate: '2024-01-31T00:00:00Z',
      version: '1.0.0',
    };

    it('應該成功導入投資組合數據', async () => {
      mockAsyncStorage.setItem.mockResolvedValue();

      await portfolioService.importPortfolio(JSON.stringify(mockImportData));

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_portfolio',
        JSON.stringify(mockImportData.portfolio)
      );
    });

    it('應該處理無效的數據格式', async () => {
      const invalidData = { invalid: 'data' };

      await expect(
        portfolioService.importPortfolio(JSON.stringify(invalidData))
      ).rejects.toThrow('無效的投資組合數據格式');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('應該處理 JSON 解析錯誤', async () => {
      await expect(
        portfolioService.importPortfolio('invalid json')
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('存儲錯誤'));

      await expect(
        portfolioService.importPortfolio(JSON.stringify(mockImportData))
      ).rejects.toThrow('存儲錯誤');
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('searchPortfolio', () => {
    const mockPortfolio = [
      {
        id: 'item-1',
        card: {
          id: 'card-1',
          name: '火球術',
          setName: '基礎系列',
          price: { current: 100, historical: [] },
        },
        quantity: 2,
        purchasePrice: 80,
        purchaseDate: '2024-01-01T00:00:00Z',
        notes: '看好這張卡的前景',
      },
      {
        id: 'item-2',
        card: {
          id: 'card-2',
          name: '閃電箭',
          setName: '基礎系列',
          price: { current: 50, historical: [] },
        },
        quantity: 1,
        purchasePrice: 40,
        purchaseDate: '2024-01-02T00:00:00Z',
        notes: '快速法術',
      },
    ];

    it('應該成功搜索卡片名稱', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));

      const result = await portfolioService.searchPortfolio('火球術');

      expect(result).toHaveLength(1);
      expect(result[0].card.name).toBe('火球術');
    });

    it('應該成功搜索系列名稱', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));

      const result = await portfolioService.searchPortfolio('基礎系列');

      expect(result).toHaveLength(2);
    });

    it('應該成功搜索筆記', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));

      const result = await portfolioService.searchPortfolio('看好');

      expect(result).toHaveLength(1);
      expect(result[0].notes).toBe('看好這張卡的前景');
    });

    it('應該處理不區分大小寫的搜索', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));

      const result = await portfolioService.searchPortfolio('HUOQIUSHU');

      expect(result).toHaveLength(1);
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('存儲錯誤'));

      const result = await portfolioService.searchPortfolio('test');

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getPortfolioBySeries', () => {
    const mockPortfolio = [
      {
        id: 'item-1',
        card: {
          id: 'card-1',
          name: '火球術',
          setName: '基礎系列',
          price: { current: 100, historical: [] },
        },
        quantity: 2,
        purchasePrice: 80,
        purchaseDate: '2024-01-01T00:00:00Z',
      },
      {
        id: 'item-2',
        card: {
          id: 'card-2',
          name: '閃電箭',
          setName: '基礎系列',
          price: { current: 50, historical: [] },
        },
        quantity: 1,
        purchasePrice: 40,
        purchaseDate: '2024-01-02T00:00:00Z',
      },
      {
        id: 'item-3',
        card: {
          id: 'card-3',
          name: '治療術',
          setName: '擴展系列',
          price: { current: 30, historical: [] },
        },
        quantity: 1,
        purchasePrice: 25,
        purchaseDate: '2024-01-03T00:00:00Z',
      },
    ];

    it('應該成功按系列分組投資組合', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));

      const result = await portfolioService.getPortfolioBySeries();

      expect(result).toEqual({
        基礎系列: [mockPortfolio[0], mockPortfolio[1]],
        擴展系列: [mockPortfolio[2]],
      });
    });

    it('應該處理空投資組合', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');

      const result = await portfolioService.getPortfolioBySeries();

      expect(result).toEqual({});
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('存儲錯誤'));

      const result = await portfolioService.getPortfolioBySeries();

      expect(result).toEqual({});
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getPortfolioHistory', () => {
    const mockPortfolio = [
      {
        id: 'item-1',
        card: {
          id: 'card-1',
          name: '火球術',
          setName: '基礎系列',
          price: { current: 100, historical: [] },
        },
        quantity: 2,
        purchasePrice: 80,
        purchaseDate: '2024-01-01T00:00:00Z',
      },
      {
        id: 'item-2',
        card: {
          id: 'card-2',
          name: '閃電箭',
          setName: '基礎系列',
          price: { current: 50, historical: [] },
        },
        quantity: 1,
        purchasePrice: 40,
        purchaseDate: '2024-01-02T00:00:00Z',
      },
    ];

    it('應該成功獲取按日期排序的投資組合歷史', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));

      const result = await portfolioService.getPortfolioHistory();

      expect(result).toHaveLength(2);
      expect(result[0].purchaseDate).toBe('2024-01-02T00:00:00Z'); // 最新的在前
      expect(result[1].purchaseDate).toBe('2024-01-01T00:00:00Z');
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('存儲錯誤'));

      const result = await portfolioService.getPortfolioHistory();

      expect(result).toEqual([]);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('getPortfolioAnalysis', () => {
    const mockPortfolio = [
      {
        id: 'item-1',
        card: {
          id: 'card-1',
          name: '火球術',
          setName: '基礎系列',
          price: { current: 100, historical: [] },
        },
        quantity: 2,
        purchasePrice: 80,
        purchaseDate: '2024-01-01T00:00:00Z',
      },
      {
        id: 'item-2',
        card: {
          id: 'card-2',
          name: '閃電箭',
          setName: '基礎系列',
          price: { current: 50, historical: [] },
        },
        quantity: 1,
        purchasePrice: 40,
        purchaseDate: '2024-01-02T00:00:00Z',
      },
      {
        id: 'item-3',
        card: {
          id: 'card-3',
          name: '治療術',
          setName: '擴展系列',
          price: { current: 30, historical: [] },
        },
        quantity: 1,
        purchasePrice: 25,
        purchaseDate: '2024-01-03T00:00:00Z',
      },
    ];

    it('應該成功獲取投資組合分析', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockPortfolio));

      const result = await portfolioService.getPortfolioAnalysis();

      expect(result).toHaveProperty('topPerformers');
      expect(result).toHaveProperty('worstPerformers');
      expect(result).toHaveProperty('recentAdditions');
      expect(result.topPerformers).toHaveLength(3);
      expect(result.worstPerformers).toHaveLength(3);
      expect(result.recentAdditions).toHaveLength(3);
    });

    it('應該處理空投資組合', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('[]');

      const result = await portfolioService.getPortfolioAnalysis();

      expect(result).toEqual({
        topPerformers: [],
        worstPerformers: [],
        recentAdditions: [],
      });
    });

    it('應該處理存儲錯誤', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('存儲錯誤'));

      const result = await portfolioService.getPortfolioAnalysis();

      expect(result).toEqual({
        topPerformers: [],
        worstPerformers: [],
        recentAdditions: [],
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
