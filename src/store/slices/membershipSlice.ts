import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MembershipState } from '@/types';
import { membershipService } from '@/services/membershipService';

// 異步 thunk
export const fetchMembershipStatus = createAsyncThunk(
  'membership/fetchStatus',
  async () => {
    const response = await membershipService.getStatus();
    return response;
  }
);

export const upgradeMembership = createAsyncThunk(
  'membership/upgrade',
  async (tier: string) => {
    const response = await membershipService.upgrade(tier);
    return response;
  }
);

export const startTrial = createAsyncThunk(
  'membership/startTrial',
  async () => {
    const response = await membershipService.startTrial();
    return response;
  }
);

export const cancelMembership = createAsyncThunk(
  'membership/cancel',
  async () => {
    const response = await membershipService.cancel();
    return response;
  }
);

export const checkFeatureUsage = createAsyncThunk(
  'membership/checkFeatureUsage',
  async (feature: string, { rejectWithValue }) => {
    try {
      const response = await membershipService.checkFeatureUsage(feature);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '檢查功能使用失敗');
    }
  }
);

export const useFeature = createAsyncThunk(
  'membership/useFeature',
  async (feature: string, { rejectWithValue }) => {
    try {
      const response = await membershipService.useFeature(feature);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || '使用功能失敗');
    }
  }
);

// Initial state
const initialState: MembershipState = {
  currentTier: 'free',
  trialStatus: {
    isActive: false,
    startDate: '',
    endDate: '',
    daysRemaining: 0
  },
  membershipEndDate: null,
  usage: {
    cardRecognition: { used: 0, limit: 10 },
    conditionAnalysis: { used: 0, limit: 5 },
    authenticityCheck: { used: 0, limit: 5 },
    pricePrediction: { used: 0, limit: 10 },
    aiChat: { used: 0, limit: 20 }
  },
  limits: {
    cardRecognition: 10,
    conditionAnalysis: 5,
    authenticityCheck: 5,
    pricePrediction: 10,
    aiChat: 20
  },
  features: {
    cardRecognition: true,
    conditionAnalysis: false,
    authenticityCheck: false,
    pricePrediction: false,
    aiChat: true,
    advancedAnalytics: false,
    prioritySupport: false,
    exclusiveContent: false
  },
  isLoading: false,
  error: null,
  isTrialActive: false,
  trialEndDate: null,
  isUpgrading: false
};

// Membership slice
const membershipSlice = createSlice({
  name: 'membership',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUsage: (state, action: PayloadAction<{ feature: string; used: number }>) => {
      const { feature, used } = action.payload;
      if (state.usage[feature as keyof typeof state.usage]) {
        state.usage[feature as keyof typeof state.usage].used = used;
      }
    },
    resetDailyUsage: (state) => {
      Object.keys(state.usage).forEach(feature => {
        state.usage[feature as keyof typeof state.usage].used = 0;
      });
    },
    setFeatureAccess: (state, action: PayloadAction<{ feature: string; enabled: boolean }>) => {
      const { feature, enabled } = action.payload;
      if (state.features[feature as keyof typeof state.features] !== undefined) {
        state.features[feature as keyof typeof state.features] = enabled;
      }
    },
    updateLimits: (state, action: PayloadAction<Partial<typeof state.limits>>) => {
      state.limits = { ...state.limits, ...action.payload };
      // Update usage limits accordingly
      Object.keys(action.payload).forEach(feature => {
        if (state.usage[feature as keyof typeof state.usage]) {
          state.usage[feature as keyof typeof state.usage].limit =
            action.payload[feature as keyof typeof state.limits] || 0;
        }
      });
    }
  },
  extraReducers: (builder) => {
    // Fetch Membership Status
    builder
      .addCase(fetchMembershipStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMembershipStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTier = action.payload.tier;
        state.isTrialActive = action.payload.isTrialActive;
        state.trialEndDate = action.payload.trialEndDate;
        state.membershipEndDate = action.payload.membershipEndDate;
        state.usage = action.payload.usage;
        state.features = action.payload.features;
        state.limits = action.payload.limits;
        state.error = null;
      })
      .addCase(fetchMembershipStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upgrade To VIP
    builder
      .addCase(upgradeMembership.pending, (state) => {
        state.isUpgrading = true;
        state.error = null;
      })
      .addCase(upgradeMembership.fulfilled, (state, action) => {
        state.isUpgrading = false;
        state.currentTier = 'vip';
        state.isTrialActive = false;
        state.membershipEndDate = action.payload.membershipEndDate;
        state.features = action.payload.features;
        state.limits = action.payload.limits;
        state.error = null;
      })
      .addCase(upgradeMembership.rejected, (state, action) => {
        state.isUpgrading = false;
        state.error = action.payload as string;
      });

    // Start Trial
    builder
      .addCase(startTrial.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTrial.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTier = 'trial';
        state.isTrialActive = true;
        state.trialEndDate = action.payload.trialEndDate;
        state.features = action.payload.features;
        state.limits = action.payload.limits;
        state.error = null;
      })
      .addCase(startTrial.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancel Membership
    builder
      .addCase(cancelMembership.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelMembership.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTier = 'free';
        state.isTrialActive = false;
        state.membershipEndDate = action.payload.membershipEndDate;
        state.features = action.payload.features;
        state.limits = action.payload.limits;
        state.error = null;
      })
      .addCase(cancelMembership.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check Feature Usage
    builder
      .addCase(checkFeatureUsage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkFeatureUsage.fulfilled, (state, action) => {
        state.isLoading = false;
        // 將 FeatureUsage 轉換為 MembershipUsage 格式
        state.usage = {
          cardRecognition: { used: action.payload.usage.cardRecognition, limit: 0 },
          conditionAnalysis: { used: action.payload.usage.conditionAnalysis, limit: 0 },
          authenticityCheck: { used: action.payload.usage.authenticityCheck, limit: 0 },
          pricePrediction: { used: action.payload.usage.pricePrediction, limit: 0 },
          aiChat: { used: action.payload.usage.aiChat, limit: 0 }
        };
        state.error = null;
      })
      .addCase(checkFeatureUsage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Use Feature
    builder
      .addCase(useFeature.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(useFeature.fulfilled, (state, action) => {
        state.isLoading = false;
        // 將 FeatureUsage 轉換為 MembershipUsage 格式
        state.usage = {
          cardRecognition: { used: action.payload.usage.cardRecognition, limit: 0 },
          conditionAnalysis: { used: action.payload.usage.conditionAnalysis, limit: 0 },
          authenticityCheck: { used: action.payload.usage.authenticityCheck, limit: 0 },
          pricePrediction: { used: action.payload.usage.pricePrediction, limit: 0 },
          aiChat: { used: action.payload.usage.aiChat, limit: 0 }
        };
        state.error = null;
      })
      .addCase(useFeature.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const {
  clearError,
  updateUsage,
  resetDailyUsage,
  setFeatureAccess,
  updateLimits
} = membershipSlice.actions;

export default membershipSlice.reducer;
