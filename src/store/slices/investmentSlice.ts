import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { InvestmentState, Investment } from '@/types';
import { investmentService } from '@/services/investmentService';

// 異步 thunk
export const fetchInvestments = createAsyncThunk(
  'investment/fetchInvestments',
  async () => {
    const response = await investmentService.getInvestments();
    return response;
  }
);

export const addInvestment = createAsyncThunk(
  'investment/addInvestment',
  async (investmentData: {
    cardId: string;
    type: 'buy' | 'sell' | 'hold';
    amount: number;
    quantity: number;
    entryPrice: number;
    notes?: string;
  }) => {
    const response = await investmentService.addInvestment(investmentData);
    return response;
  }
);

export const updateInvestment = createAsyncThunk(
  'investment/updateInvestment',
  async ({
    investmentId,
    data,
  }: {
    investmentId: string;
    data: Partial<Investment>;
  }) => {
    const response = await investmentService.updateInvestment(
      investmentId,
      data
    );
    return response;
  }
);

export const removeInvestment = createAsyncThunk(
  'investment/removeInvestment',
  async (investmentId: string) => {
    await investmentService.removeInvestment(investmentId);
    return investmentId;
  }
);

export const getPortfolio = createAsyncThunk(
  'investment/getPortfolio',
  async () => {
    const response = await investmentService.getPortfolio();
    return response;
  }
);

export const getInvestmentAdvice = createAsyncThunk(
  'investment/getInvestmentAdvice',
  async (cardId: string) => {
    const response = await investmentService.getInvestmentAdvice(cardId);
    return response;
  }
);

export const getInvestmentStatistics = createAsyncThunk(
  'investment/getInvestmentStatistics',
  async () => {
    const response = await investmentService.getInvestmentStatistics();
    return response;
  }
);

// 初始狀態
const initialState: InvestmentState = {
  investments: [],
  portfolio: {
    totalValue: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
    recentTransactions: [],
    performanceHistory: [],
  },
  isLoading: false,
  error: null,
  selectedInvestment: null,
  investmentAdvice: null,
  statistics: {
    totalInvestments: 0,
    activeInvestments: 0,
    completedInvestments: 0,
    averageReturn: 0,
    bestReturn: 0,
    worstReturn: 0,
  },
  isAdding: false,
  isUpdating: false,
  isRemoving: false,
  portfolioValue: 0,
  totalProfitLoss: 0,
  profitLossPercentage: 0,
};

// Investment slice
const investmentSlice = createSlice({
  name: 'investments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedInvestment: (
      state,
      action: PayloadAction<Investment | null>
    ) => {
      state.selectedInvestment = action.payload;
    },
    clearInvestmentAdvice: (state) => {
      state.investmentAdvice = null;
    },
    updateInvestmentValue: (
      state,
      action: PayloadAction<{ id: string; currentPrice: number }>
    ) => {
      const { id, currentPrice } = action.payload;
      const investment = state.investments.find((inv) => inv.id === id);
      if (investment) {
        // 更新投資的當前價值
        const currentValue = currentPrice * investment.quantity;
        investment.currentPrice = currentPrice;
        investment.profitLoss = currentValue - investment.entryValue;
        investment.profitLossPercentage =
          ((currentValue - investment.entryValue) / investment.entryValue) *
          100;

        // 重新計算投資組合總價值
        const totalValue = state.investments.reduce(
          (sum, inv) => sum + inv.currentPrice * inv.quantity,
          0
        );
        state.portfolioValue = totalValue;
        state.totalProfitLoss = state.investments.reduce(
          (sum, inv) => sum + inv.profitLoss,
          0
        );
        state.profitLossPercentage =
          state.totalProfitLoss > 0
            ? (state.totalProfitLoss / totalValue) * 100
            : 0;

        // 更新 portfolio 對象
        state.portfolio.totalValue = totalValue;
        state.portfolio.totalProfitLoss = state.totalProfitLoss;
        state.portfolio.totalProfitLossPercentage = state.profitLossPercentage;
      }
    },
    calculateStatistics: (state) => {
      const totalInvestments = state.investments.length;
      const totalProfitLoss = state.investments.reduce(
        (sum, inv) => sum + inv.profitLoss,
        0
      );
      const averageReturn =
        totalInvestments > 0 ? totalProfitLoss / totalInvestments : 0;

      const bestPerformer =
        state.investments.length > 0
          ? state.investments.reduce((best, inv) =>
              inv.profitLossPercentage > best.profitLossPercentage ? inv : best
            )
          : null;

      const worstPerformer =
        state.investments.length > 0
          ? state.investments.reduce((worst, inv) =>
              inv.profitLossPercentage < worst.profitLossPercentage
                ? inv
                : worst
            )
          : null;

      state.statistics = {
        totalInvestments,
        activeInvestments: state.investments.filter(
          (inv) => inv.status === 'active'
        ).length,
        completedInvestments: state.investments.filter(
          (inv) => inv.status === 'completed'
        ).length,
        averageReturn,
        bestReturn: bestPerformer?.profitLossPercentage || 0,
        worstReturn: worstPerformer?.profitLossPercentage || 0,
      };
    },
  },
  extraReducers: (builder) => {
    // Fetch User Investments
    builder
      .addCase(fetchInvestments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvestments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.investments = action.payload;
        state.error = null;
      })
      .addCase(fetchInvestments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add Investment
    builder
      .addCase(addInvestment.pending, (state) => {
        state.isAdding = true;
        state.error = null;
      })
      .addCase(addInvestment.fulfilled, (state, action) => {
        state.isAdding = false;
        state.investments.unshift(action.payload);
        state.error = null;
      })
      .addCase(addInvestment.rejected, (state, action) => {
        state.isAdding = false;
        state.error = action.payload as string;
      });

    // Update Investment
    builder
      .addCase(updateInvestment.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateInvestment.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.investments.findIndex(
          (inv) => inv.id === action.payload.id
        );
        if (index !== -1) {
          state.investments[index] = action.payload;
        }
        if (state.selectedInvestment?.id === action.payload.id) {
          state.selectedInvestment = action.payload;
        }
        state.error = null;
      })
      .addCase(updateInvestment.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Remove Investment
    builder
      .addCase(removeInvestment.pending, (state) => {
        state.isRemoving = true;
        state.error = null;
      })
      .addCase(removeInvestment.fulfilled, (state, action) => {
        state.isRemoving = false;
        state.investments = state.investments.filter(
          (inv) => inv.id !== action.payload
        );
        if (state.selectedInvestment?.id === action.payload) {
          state.selectedInvestment = null;
        }
        state.error = null;
      })
      .addCase(removeInvestment.rejected, (state, action) => {
        state.isRemoving = false;
        state.error = action.payload as string;
      });

    // Get Investment Advice
    builder
      .addCase(getInvestmentAdvice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInvestmentAdvice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.investmentAdvice = action.payload;
        state.error = null;
      })
      .addCase(getInvestmentAdvice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Calculate Portfolio Value
    builder
      .addCase(getPortfolio.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPortfolio.fulfilled, (state, action) => {
        state.isLoading = false;
        state.portfolio = action.payload;
        state.portfolioValue = action.payload.totalValue;
        state.totalProfitLoss = action.payload.totalProfitLoss;
        state.profitLossPercentage = action.payload.totalProfitLossPercentage;
        state.error = null;
      })
      .addCase(getPortfolio.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Investment Statistics
    builder
      .addCase(getInvestmentStatistics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getInvestmentStatistics.fulfilled, (state, action) => {
        state.isLoading = false;
        // 假設 action.payload 是 PortfolioStatistics 類型
        state.statistics = {
          totalInvestments: (action.payload as any).totalInvestments || 0,
          activeInvestments: (action.payload as any).activeInvestments || 0,
          completedInvestments:
            (action.payload as any).completedInvestments || 0,
          averageReturn: (action.payload as any).averageReturn || 0,
          bestReturn: (action.payload as any).bestReturn || 0,
          worstReturn: (action.payload as any).worstReturn || 0,
        };
        state.error = null;
      })
      .addCase(getInvestmentStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setSelectedInvestment,
  clearInvestmentAdvice,
  updateInvestmentValue,
  calculateStatistics,
} = investmentSlice.actions;

export default investmentSlice.reducer;
