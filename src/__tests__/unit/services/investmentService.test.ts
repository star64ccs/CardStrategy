import { investmentService } from '../../../services/investmentService';
import { apiService } from '../../../services/apiService';

// Mock 依賴
jest.mock('../../../services/apiService');
jest.mock('../../../utils/validationService');
jest.mock('../../../utils/validationSchemas');

const mockApiService = apiService as jest.Mocked<typeof apiService>;

describe('InvestmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInvestments', () => {
    const mockInvestments = [
      {
        id: 'investment-1',
        cardId: 'card-123',
        type: 'buy' as const,
        amount: 1000,
        quantity: 2,
        entryPrice: 500,
        currentPrice: 600,
        profitLoss: 200,
        profitLossPercentage: 20,
        notes: '看好這張卡的前景',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    it('應該成功獲取用戶投資列表', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockInvestments,
        message: '投資列表獲取成功'
      });

      const result = await investmentService.getInvestments();

      expect(result).toEqual(mockInvestments);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('API 錯誤'));

      await expect(investmentService.getInvestments()).rejects.toThrow('API 錯誤');
    });
  });

  describe('getInvestment', () => {
    const mockInvestmentId = '123e4567-e89b-12d3-a456-426614174000';
    const mockInvestment = {
      id: mockInvestmentId,
      cardId: 'card-123',
      type: 'buy' as const,
      amount: 1000,
      quantity: 2,
      entryPrice: 500,
      currentPrice: 600,
      profitLoss: 200,
      profitLossPercentage: 20,
      notes: '看好這張卡的前景',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    it('應該成功獲取單個投資', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockInvestment,
        message: '投資獲取成功'
      });

      const result = await investmentService.getInvestment(mockInvestmentId);

      expect(result).toEqual(mockInvestment);
      expect(mockApiService.get).toHaveBeenCalledWith(`/investments/${mockInvestmentId}`);
    });

    it('應該處理無效的投資 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(investmentService.getInvestment(invalidId)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('投資不存在'));

      await expect(investmentService.getInvestment(mockInvestmentId)).rejects.toThrow('投資不存在');
    });
  });

  describe('addInvestment', () => {
    const mockInvestmentData = {
      cardId: 'card-123',
      type: 'buy' as const,
      amount: 1000,
      quantity: 2,
      entryPrice: 500,
      notes: '看好這張卡的前景'
    };

    const mockAddedInvestment = {
      id: 'investment-2',
      ...mockInvestmentData,
      currentPrice: 500,
      profitLoss: 0,
      profitLossPercentage: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    it('應該成功添加投資', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockAddedInvestment,
        message: '投資添加成功'
      });

      const result = await investmentService.addInvestment(mockInvestmentData);

      expect(result).toEqual(mockAddedInvestment);
      expect(mockApiService.post).toHaveBeenCalledWith('/investments', mockInvestmentData);
    });

    it('應該處理無效的卡牌 ID', async () => {
      const invalidData = { ...mockInvestmentData, cardId: 'invalid-id' };

      await expect(investmentService.addInvestment(invalidData)).rejects.toThrow();
    });

    it('應該處理無效的投資類型', async () => {
      const invalidData = { ...mockInvestmentData, type: 'invalid' as any };

      await expect(investmentService.addInvestment(invalidData)).rejects.toThrow();
    });

    it('應該處理負數金額', async () => {
      const invalidData = { ...mockInvestmentData, amount: -100 };

      await expect(investmentService.addInvestment(invalidData)).rejects.toThrow();
    });

    it('應該處理零數量', async () => {
      const invalidData = { ...mockInvestmentData, quantity: 0 };

      await expect(investmentService.addInvestment(invalidData)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('添加失敗'));

      await expect(investmentService.addInvestment(mockInvestmentData)).rejects.toThrow('添加失敗');
    });
  });

  describe('updateInvestment', () => {
    const mockInvestmentId = '123e4567-e89b-12d3-a456-426614174000';
    const mockUpdateData = {
      notes: '更新後的備註',
      quantity: 3
    };

    const mockUpdatedInvestment = {
      id: mockInvestmentId,
      cardId: 'card-123',
      type: 'buy' as const,
      amount: 1000,
      quantity: 3,
      entryPrice: 500,
      currentPrice: 600,
      profitLoss: 300,
      profitLossPercentage: 20,
      notes: '更新後的備註',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    };

    it('應該成功更新投資', async () => {
      mockApiService.put.mockResolvedValue({
        success: true,
        data: mockUpdatedInvestment,
        message: '投資更新成功'
      });

      const result = await investmentService.updateInvestment(mockInvestmentId, mockUpdateData);

      expect(result).toEqual(mockUpdatedInvestment);
      expect(mockApiService.put).toHaveBeenCalledWith(`/investments/${mockInvestmentId}`, mockUpdateData);
    });

    it('應該處理無效的投資 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(investmentService.updateInvestment(invalidId, mockUpdateData)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.put.mockRejectedValue(new Error('更新失敗'));

      await expect(investmentService.updateInvestment(mockInvestmentId, mockUpdateData)).rejects.toThrow('更新失敗');
    });
  });

  describe('removeInvestment', () => {
    const mockInvestmentId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該成功移除投資', async () => {
      mockApiService.delete.mockResolvedValue({
        success: true,
        message: '投資移除成功'
      });

      await investmentService.removeInvestment(mockInvestmentId);

      expect(mockApiService.delete).toHaveBeenCalledWith(`/investments/${mockInvestmentId}`);
    });

    it('應該處理無效的投資 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(investmentService.removeInvestment(invalidId)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.delete.mockRejectedValue(new Error('移除失敗'));

      await expect(investmentService.removeInvestment(mockInvestmentId)).rejects.toThrow('移除失敗');
    });
  });

  describe('getPortfolio', () => {
    const mockPortfolio = {
      id: 'portfolio-1',
      totalValue: 5000,
      totalProfitLoss: 500,
      totalProfitLossPercentage: 11.11,
      investments: [
        {
          id: 'investment-1',
          cardId: 'card-123',
          type: 'buy' as const,
          amount: 1000,
          quantity: 2,
          entryPrice: 500,
          currentPrice: 600,
          profitLoss: 200,
          profitLossPercentage: 20
        }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };

    it('應該成功獲取投資組合', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockPortfolio,
        message: '投資組合獲取成功'
      });

      const result = await investmentService.getPortfolio();

      expect(result).toEqual(mockPortfolio);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments/portfolio');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('投資組合獲取失敗'));

      await expect(investmentService.getPortfolio()).rejects.toThrow('投資組合獲取失敗');
    });
  });

  describe('getInvestmentAdvice', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';
    const mockAdvice = {
      cardId: mockCardId,
      recommendation: 'buy' as const,
      confidence: 0.85,
      reasoning: ['價格處於低位', '基本面良好', '市場需求增加'],
      priceTarget: 800,
      riskLevel: 'medium' as const
    };

    it('應該成功獲取投資建議', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockAdvice,
        message: '投資建議獲取成功'
      });

      const result = await investmentService.getInvestmentAdvice(mockCardId);

      expect(result).toEqual(mockAdvice);
      expect(mockApiService.get).toHaveBeenCalledWith(`/investments/advice/${mockCardId}`);
    });

    it('應該處理無效的卡牌 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(investmentService.getInvestmentAdvice(invalidId)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('建議獲取失敗'));

      await expect(investmentService.getInvestmentAdvice(mockCardId)).rejects.toThrow('建議獲取失敗');
    });
  });

  describe('getInvestmentStatistics', () => {
    const mockStatistics = {
      totalValue: 5000,
      totalProfitLoss: 500,
      totalProfitLossPercentage: 11.11,
      bestPerformer: {
        id: 'investment-1',
        cardId: 'card-123',
        profitLoss: 200,
        profitLossPercentage: 20
      },
      worstPerformer: {
        id: 'investment-2',
        cardId: 'card-456',
        profitLoss: -50,
        profitLossPercentage: -5
      },
      recentTransactions: [
        {
          id: 'transaction-1',
          type: 'buy',
          amount: 1000,
          date: '2024-01-01T00:00:00Z'
        }
      ]
    };

    it('應該成功獲取投資統計', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockStatistics,
        message: '統計獲取成功'
      });

      const result = await investmentService.getInvestmentStatistics();

      expect(result).toEqual(mockStatistics);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments/statistics');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('統計獲取失敗'));

      await expect(investmentService.getInvestmentStatistics()).rejects.toThrow('統計獲取失敗');
    });
  });

  describe('setPriceAlert', () => {
    const mockCardId = '123e4567-e89b-12d3-a456-426614174000';
    const mockTargetPrice = 600;
    const mockType = 'above' as const;

    const mockPriceAlert = {
      id: 'alert-1',
      cardId: mockCardId,
      targetPrice: mockTargetPrice,
      type: mockType,
      isActive: true
    };

    it('應該成功設置價格警報', async () => {
      mockApiService.post.mockResolvedValue({
        success: true,
        data: mockPriceAlert,
        message: '價格警報設置成功'
      });

      const result = await investmentService.setPriceAlert(mockCardId, mockTargetPrice, mockType);

      expect(result).toEqual(mockPriceAlert);
      expect(mockApiService.post).toHaveBeenCalledWith('/investments/price-alerts', {
        cardId: mockCardId,
        targetPrice: mockTargetPrice,
        type: mockType
      });
    });

    it('應該處理無效的卡牌 ID', async () => {
      const invalidCardId = 'invalid-id';

      await expect(investmentService.setPriceAlert(invalidCardId, mockTargetPrice, mockType)).rejects.toThrow();
    });

    it('應該處理負數目標價格', async () => {
      const invalidPrice = -100;

      await expect(investmentService.setPriceAlert(mockCardId, invalidPrice, mockType)).rejects.toThrow();
    });

    it('應該處理無效的警報類型', async () => {
      const invalidType = 'invalid' as any;

      await expect(investmentService.setPriceAlert(mockCardId, mockTargetPrice, invalidType)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.post.mockRejectedValue(new Error('警報設置失敗'));

      await expect(investmentService.setPriceAlert(mockCardId, mockTargetPrice, mockType)).rejects.toThrow('警報設置失敗');
    });
  });

  describe('getPriceAlerts', () => {
    const mockPriceAlerts = [
      {
        id: 'alert-1',
        cardId: 'card-123',
        cardName: '火球術',
        targetPrice: 600,
        currentPrice: 550,
        triggered: false
      },
      {
        id: 'alert-2',
        cardId: 'card-456',
        cardName: '閃電箭',
        targetPrice: 400,
        currentPrice: 450,
        triggered: true
      }
    ];

    it('應該成功獲取價格警報', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockPriceAlerts,
        message: '價格警報獲取成功'
      });

      const result = await investmentService.getPriceAlerts();

      expect(result).toEqual(mockPriceAlerts);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments/price-alerts');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('警報獲取失敗'));

      await expect(investmentService.getPriceAlerts()).rejects.toThrow('警報獲取失敗');
    });
  });

  describe('deletePriceAlert', () => {
    const mockAlertId = '123e4567-e89b-12d3-a456-426614174000';

    it('應該成功刪除價格警報', async () => {
      mockApiService.delete.mockResolvedValue({
        success: true,
        message: '價格警報刪除成功'
      });

      await investmentService.deletePriceAlert(mockAlertId);

      expect(mockApiService.delete).toHaveBeenCalledWith(`/investments/price-alerts/${mockAlertId}`);
    });

    it('應該處理無效的警報 ID', async () => {
      const invalidId = 'invalid-id';

      await expect(investmentService.deletePriceAlert(invalidId)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.delete.mockRejectedValue(new Error('警報刪除失敗'));

      await expect(investmentService.deletePriceAlert(mockAlertId)).rejects.toThrow('警報刪除失敗');
    });
  });

  describe('getInvestmentHistory', () => {
    const mockFilters = {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      type: 'buy' as const,
      limit: 10,
      offset: 0
    };

    const mockHistory = {
      investments: [
        {
          id: 'investment-1',
          cardId: 'card-123',
          type: 'buy' as const,
          amount: 1000,
          quantity: 2,
          entryPrice: 500,
          currentPrice: 600,
          profitLoss: 200,
          profitLossPercentage: 20,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ],
      pagination: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    };

    it('應該成功獲取投資歷史', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockHistory,
        message: '投資歷史獲取成功'
      });

      const result = await investmentService.getInvestmentHistory(mockFilters);

      expect(result).toEqual(mockHistory);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments/history', { params: mockFilters });
    });

    it('應該處理無過濾器的情況', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockHistory,
        message: '投資歷史獲取成功'
      });

      const result = await investmentService.getInvestmentHistory();

      expect(result).toEqual(mockHistory);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments/history', { params: undefined });
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('歷史獲取失敗'));

      await expect(investmentService.getInvestmentHistory(mockFilters)).rejects.toThrow('歷史獲取失敗');
    });
  });

  describe('exportInvestmentReport', () => {
    it('應該成功導出 PDF 報告', async () => {
      const mockPdfData = 'base64-encoded-pdf-data';
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockPdfData,
        message: '報告導出成功'
      });

      const result = await investmentService.exportInvestmentReport('pdf');

      expect(result).toBe(mockPdfData);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments/export?format=pdf');
    });

    it('應該成功導出 CSV 報告', async () => {
      const mockCsvData = 'investment_id,card_id,type,amount\ninvestment-1,card-123,buy,1000';
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockCsvData,
        message: '報告導出成功'
      });

      const result = await investmentService.exportInvestmentReport('csv');

      expect(result).toBe(mockCsvData);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments/export?format=csv');
    });

    it('應該成功導出 JSON 報告', async () => {
      const mockJsonData = '{"investments": []}';
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockJsonData,
        message: '報告導出成功'
      });

      const result = await investmentService.exportInvestmentReport('json');

      expect(result).toBe(mockJsonData);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments/export?format=json');
    });

    it('應該處理無效的格式', async () => {
      await expect(investmentService.exportInvestmentReport('xml' as any)).rejects.toThrow();
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('導出失敗'));

      await expect(investmentService.exportInvestmentReport('pdf')).rejects.toThrow('導出失敗');
    });
  });

  describe('getMarketTrends', () => {
    const mockTrends = {
      trendingUp: ['card-123', 'card-456'],
      trendingDown: ['card-789'],
      stable: ['card-101', 'card-102']
    };

    it('應該成功獲取市場趨勢', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockTrends,
        message: '市場趨勢獲取成功'
      });

      const result = await investmentService.getMarketTrends();

      expect(result).toEqual(mockTrends);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments/market-trends');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('趨勢獲取失敗'));

      await expect(investmentService.getMarketTrends()).rejects.toThrow('趨勢獲取失敗');
    });
  });

  describe('getRiskAnalysis', () => {
    const mockRiskAnalysis = {
      riskLevel: 'medium' as const,
      factors: ['市場波動性高', '投資集中度過高'],
      recommendations: ['分散投資', '設置止損點']
    };

    it('應該成功獲取風險分析', async () => {
      mockApiService.get.mockResolvedValue({
        success: true,
        data: mockRiskAnalysis,
        message: '風險分析獲取成功'
      });

      const result = await investmentService.getRiskAnalysis();

      expect(result).toEqual(mockRiskAnalysis);
      expect(mockApiService.get).toHaveBeenCalledWith('/investments/risk-analysis');
    });

    it('應該處理 API 錯誤', async () => {
      mockApiService.get.mockRejectedValue(new Error('風險分析獲取失敗'));

      await expect(investmentService.getRiskAnalysis()).rejects.toThrow('風險分析獲取失敗');
    });
  });
});
