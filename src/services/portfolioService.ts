import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from './cardService';
import { LoggingUtils } from '../utils/loggingUtils';
import { ValidationUtils } from '../utils/validationUtils';
import { errorHandler, withErrorHandling } from '@/utils/errorHandler';

// 投資組合項目
export interface PortfolioItem {
  id: string;
  card: Card;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  notes?: string;
}

// 投資組合統計
export interface PortfolioStats {
  totalItems: number;
  totalValue: number;
  totalCost: number;
  totalProfit: number;
  profitPercentage: number;
  averageReturn: number;
}

// 投資組合服務
class PortfolioService {
  private readonly PORTFOLIO_KEY = 'user_portfolio';

  // 獲取投資組合
  async getPortfolio(): Promise<PortfolioItem[]> {
    try {
      LoggingUtils.logApiCall('getPortfolio');
      const portfolioData = await AsyncStorage.getItem(this.PORTFOLIO_KEY);
      const portfolio = portfolioData ? JSON.parse(portfolioData) : [];
      LoggingUtils.logApiCall('getPortfolio', undefined, {
        count: portfolio.length,
      });
      return portfolio;
    } catch (error) {
      LoggingUtils.logApiError('getPortfolio', error);
      return [];
    }
  }

  // 添加到投資組合
  async addToPortfolio(
    card: Card,
    quantity: number,
    purchasePrice: number,
    notes?: string
  ): Promise<void> {
    try {
      ValidationUtils.validateRequired(card, '卡片');
      ValidationUtils.validateNumber(quantity, '數量', 1);
      ValidationUtils.validateNumber(purchasePrice, '購買價格', 0);

      LoggingUtils.logApiCall('addToPortfolio', {
        cardId: card.id,
        quantity,
        purchasePrice,
      });

      const portfolio = await this.getPortfolio();

      // 檢查是否已存在相同卡片
      const existingItem = portfolio.find((item) => item.card.id === card.id);

      if (existingItem) {
        // 更新現有項目
        existingItem.quantity += quantity;
        existingItem.purchasePrice =
          (existingItem.purchasePrice + purchasePrice) / 2; // 平均價格
        existingItem.notes = notes || existingItem.notes;
      } else {
        // 添加新項目
        const newItem: PortfolioItem = {
          id: `${card.id}_${Date.now()}`,
          card,
          quantity,
          purchasePrice,
          purchaseDate: new Date().toISOString(),
          notes,
        };
        portfolio.push(newItem);
      }

      await AsyncStorage.setItem(this.PORTFOLIO_KEY, JSON.stringify(portfolio));
      LoggingUtils.logApiCall(
        'addToPortfolio',
        { cardId: card.id, quantity, purchasePrice },
        { success: true }
      );
    } catch (error) {
      LoggingUtils.logApiError('addToPortfolio', error, {
        cardId: card.id,
        quantity,
        purchasePrice,
      });
      throw error;
    }
  }

  // 從投資組合移除
  async removeFromPortfolio(itemId: string): Promise<void> {
    try {
      const portfolio = await this.getPortfolio();
      const updatedPortfolio = portfolio.filter((item) => item.id !== itemId);
      await AsyncStorage.setItem(
        this.PORTFOLIO_KEY,
        JSON.stringify(updatedPortfolio)
      );
    } catch (error) {
      logger.error('❌ Remove from portfolio error:', { error });
      throw error;
    }
  }

  // 更新投資組合項目
  async updatePortfolioItem(
    itemId: string,
    updates: Partial<PortfolioItem>
  ): Promise<void> {
    try {
      const portfolio = await this.getPortfolio();
      const itemIndex = portfolio.findIndex((item) => item.id === itemId);

      if (itemIndex !== -1) {
        portfolio[itemIndex] = { ...portfolio[itemIndex], ...updates };
        await AsyncStorage.setItem(
          this.PORTFOLIO_KEY,
          JSON.stringify(portfolio)
        );
      }
    } catch (error) {
      logger.error('❌ Update portfolio item error:', { error });
      throw error;
    }
  }

  // 獲取投資組合統計
  async getPortfolioStats(): Promise<PortfolioStats> {
    try {
      const portfolio = await this.getPortfolio();

      const totalItems = portfolio.length;
      const totalCost = portfolio.reduce(
        (sum, item) => sum + item.purchasePrice * item.quantity,
        0
      );
      const totalValue = portfolio.reduce(
        (sum, item) => sum + item.card.price.current * item.quantity,
        0
      );
      const totalProfit = totalValue - totalCost;
      const profitPercentage =
        totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
      const averageReturn = totalItems > 0 ? totalProfit / totalItems : 0;

      return {
        totalItems,
        totalValue,
        totalCost,
        totalProfit,
        profitPercentage,
        averageReturn,
      };
    } catch (error) {
      logger.error('❌ Get portfolio stats error:', { error });
      return {
        totalItems: 0,
        totalValue: 0,
        totalCost: 0,
        totalProfit: 0,
        profitPercentage: 0,
        averageReturn: 0,
      };
    }
  }

  // 清空投資組合
  async clearPortfolio(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.PORTFOLIO_KEY);
    } catch (error) {
      logger.error('❌ Clear portfolio error:', { error });
      throw error;
    }
  }

  // 導出投資組合數據
  async exportPortfolio(): Promise<string> {
    try {
      const portfolio = await this.getPortfolio();
      const stats = await this.getPortfolioStats();

      const exportData = {
        portfolio,
        stats,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      logger.error('❌ Export portfolio error:', { error });
      throw error;
    }
  }

  // 導入投資組合數據
  async importPortfolio(importData: string): Promise<void> {
    try {
      const data = JSON.parse(importData);

      if (data.portfolio && Array.isArray(data.portfolio)) {
        await AsyncStorage.setItem(
          this.PORTFOLIO_KEY,
          JSON.stringify(data.portfolio)
        );
      } else {
        throw new Error('無效的投資組合數據格式');
      }
    } catch (error) {
      logger.error('❌ Import portfolio error:', { error });
      throw error;
    }
  }

  // 搜索投資組合
  async searchPortfolio(query: string): Promise<PortfolioItem[]> {
    try {
      const portfolio = await this.getPortfolio();
      const lowerQuery = query.toLowerCase();

      return portfolio.filter(
        (item) =>
          item.card.name.toLowerCase().includes(lowerQuery) ||
          item.card.setName.toLowerCase().includes(lowerQuery) ||
          item.notes?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      logger.error('❌ Search portfolio error:', { error });
      return [];
    }
  }

  // 按系列分組投資組合
  async getPortfolioBySeries(): Promise<Record<string, PortfolioItem[]>> {
    try {
      const portfolio = await this.getPortfolio();
      const grouped: Record<string, PortfolioItem[]> = {};

      portfolio.forEach((item) => {
        const { setName } = item.card;
        if (!grouped[setName]) {
          grouped[setName] = [];
        }
        grouped[setName].push(item);
      });

      return grouped;
    } catch (error) {
      logger.error('❌ Get portfolio by series error:', { error });
      return {};
    }
  }

  // 獲取投資組合歷史記錄
  async getPortfolioHistory(): Promise<PortfolioItem[]> {
    try {
      const portfolio = await this.getPortfolio();
      return portfolio.sort(
        (a, b) =>
          new Date(b.purchaseDate).getTime() -
          new Date(a.purchaseDate).getTime()
      );
    } catch (error) {
      logger.error('❌ Get portfolio history error:', { error });
      return [];
    }
  }

  // 獲取投資組合分析
  async getPortfolioAnalysis(): Promise<{
    topPerformers: PortfolioItem[];
    worstPerformers: PortfolioItem[];
    recentAdditions: PortfolioItem[];
  }> {
    try {
      const portfolio = await this.getPortfolio();

      // 計算每個項目的收益率
      const itemsWithReturn = portfolio.map((item) => ({
        ...item,
        returnRate:
          ((item.card.price.current - item.purchasePrice) /
            item.purchasePrice) *
          100,
      }));

      // 按收益率排序
      const sortedByReturn = itemsWithReturn.sort(
        (a, b) => b.returnRate - a.returnRate
      );

      // 按購買日期排序
      const sortedByDate = portfolio.sort(
        (a, b) =>
          new Date(b.purchaseDate).getTime() -
          new Date(a.purchaseDate).getTime()
      );

      return {
        topPerformers: sortedByReturn.slice(0, 5),
        worstPerformers: sortedByReturn.slice(-5).reverse(),
        recentAdditions: sortedByDate.slice(0, 5),
      };
    } catch (error) {
      logger.error('❌ Get portfolio analysis error:', { error });
      return {
        topPerformers: [],
        worstPerformers: [],
        recentAdditions: [],
      };
    }
  }
}

// 導出投資組合服務實例
export { PortfolioService };
export const portfolioService = new PortfolioService();
