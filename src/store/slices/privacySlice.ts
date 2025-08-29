import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { PrivacyService } from '../../shared/services/privacyService';
import type {
  PrivacyPreferences,
  ConsentRecord,
  DataRightsRequest,
  PrivacyLawRequirement,
  RegionCode,
  DataProcessingPurpose,
  ConsentType,
  LegalBasis,
  PrivacySettingsConfig,
} from '../../types/privacy';

// 創建服務實例
const _privacyService = new PrivacyService();

interface PrivacyState {
  // 用戶隱私偏好
  preferences: PrivacyPreferences | null;
  preferencesLoading: boolean;
  preferencesError: string | null;

  // 同意記錄
  consentHistory: ConsentRecord[];
  consentHistoryLoading: boolean;
  consentHistoryError: string | null;

  // 數據權利請求
  dataRightsRequests: DataRightsRequest[];
  dataRightsRequestsLoading: boolean;
  dataRightsRequestsError: string | null;

  // 隱私法律要求
  privacyLaws: PrivacyLawRequirement[];
  privacyLawsLoading: boolean;
  privacyLawsError: string | null;

  // 隱私設置配置
  privacyConfig: PrivacySettingsConfig | null;
  privacyConfigLoading: boolean;
  privacyConfigError: string | null;

  // 隱私儀表板
  dashboard: {
    consentSummary: {
      total: number;
      active: number;
      expired: number;
      withdrawn: number;
    };
    dataRightsSummary: {
      pending: number;
      completed: number;
      rejected: number;
    };
    complianceScore: number;
    lastUpdated: Date | null;
  } | null;
  dashboardLoading: boolean;
  dashboardError: string | null;

  // 合規性檢查
  complianceCheck: {
    compliant: boolean;
    issues: string[];
    recommendations: string[];
    score: number;
  } | null;
  complianceCheckLoading: boolean;
  complianceCheckError: string | null;

  // 第三方數據處理者
  thirdPartyProcessors: unknown[];
  thirdPartyProcessorsLoading: boolean;
  thirdPartyProcessorsError: string | null;

  // 數據處理記錄
  processingRecords: unknown[];
  processingRecordsLoading: boolean;
  processingRecordsError: string | null;

  // 當前用戶地區
  currentRegion: RegionCode;

  // 年齡驗證
  ageVerification: {
    isMinor: boolean;
    age: number;
    requiresParentalConsent: boolean;
  } | null;
  ageVerificationLoading: boolean;
  ageVerificationError: string | null;

  // 父母同意請求
  parentalConsentRequest: {
    requestId: string;
    status: 'pending' | 'sent' | 'verified' | 'rejected';
  } | null;
  parentalConsentLoading: boolean;
  parentalConsentError: string | null;

  // 數據導出
  dataExport: {
    downloadUrl: string;
    expiresAt: Date;
    format: 'json' | 'csv' | 'xml';
  } | null;
  dataExportLoading: boolean;
  dataExportError: string | null;

  // 數據刪除
  dataDeletion: {
    status: 'pending' | 'processing' | 'completed';
    estimatedCompletion: Date;
  } | null;
  dataDeletionLoading: boolean;
  dataDeletionError: string | null;

  // 同意更新檢查
  consentRenewal: {
    needsRenewal: boolean;
    reasons: string[];
    purposes: DataProcessingPurpose[];
  } | null;
  consentRenewalLoading: boolean;
  consentRenewalError: string | null;
}

const initialState: PrivacyState = {
  preferences: null,
  preferencesLoading: false,
  preferencesError: null,

  consentHistory: [],
  consentHistoryLoading: false,
  consentHistoryError: null,

  dataRightsRequests: [],
  dataRightsRequestsLoading: false,
  dataRightsRequestsError: null,

  privacyLaws: [],
  privacyLawsLoading: false,
  privacyLawsError: null,

  privacyConfig: null,
  privacyConfigLoading: false,
  privacyConfigError: null,

  dashboard: null,
  dashboardLoading: false,
  dashboardError: null,

  complianceCheck: null,
  complianceCheckLoading: false,
  complianceCheckError: null,

  thirdPartyProcessors: [],
  thirdPartyProcessorsLoading: false,
  thirdPartyProcessorsError: null,

  processingRecords: [],
  processingRecordsLoading: false,
  processingRecordsError: null,

  currentRegion: 'EU',

  ageVerification: null,
  ageVerificationLoading: false,
  ageVerificationError: null,

  parentalConsentRequest: null,
  parentalConsentLoading: false,
  parentalConsentError: null,

  dataExport: null,
  dataExportLoading: false,
  dataExportError: null,

  dataDeletion: null,
  dataDeletionLoading: false,
  dataDeletionError: null,

  consentRenewal: null,
  consentRenewalLoading: false,
  consentRenewalError: null,
};

// Async Thunks

// 獲取隱私偏好
export const _fetchPrivacyPreferences = createAsyncThunk(
  'privacy/fetchPreferences',
  async (userId: string) => {
    const _response = await privacyService.getPrivacyPreferences(userId);
    return response;
  }
);

// 更新隱私偏好
export const _updatePrivacyPreferences = createAsyncThunk(
  'privacy/updatePreferences',
  async ({
    userId,
    preferences,
  }: {
    userId: string;
    preferences: Partial<PrivacyPreferences>;
  }) => {
    const _response = await privacyService.updatePrivacyPreferences(
      userId,
      preferences
    );
    return response;
  }
);

// 記錄同意
export const _recordConsent = createAsyncThunk(
  'privacy/recordConsent',
  async ({
    userId,
    consentData,
  }: {
    userId: string;
    consentData: {
      consentType: ConsentType;
      purpose: DataProcessingPurpose;
      legalBasis: LegalBasis;
      region: RegionCode;
      language: string;
      consentMethod: 'web' | 'mobile' | 'email' | 'phone' | 'in_person';
      consentVersion: string;
    };
  }) => {
    const _response = await privacyService.recordConsent(userId, consentData);
    return response;
  }
);

// 撤回同意
export const _withdrawConsent = createAsyncThunk(
  'privacy/withdrawConsent',
  async ({
    userId,
    purpose,
  }: {
    userId: string;
    purpose: DataProcessingPurpose;
  }) => {
    const _response = await privacyService.withdrawConsent(userId, purpose);
    return response;
  }
);

// 獲取同意歷史
export const _fetchConsentHistory = createAsyncThunk(
  'privacy/fetchConsentHistory',
  async (userId: string) => {
    const _response = await privacyService.getConsentHistory(userId);
    return response;
  }
);

// 提交數據權利請求
export const _submitDataRightsRequest = createAsyncThunk(
  'privacy/submitDataRightsRequest',
  async ({
    userId,
    requestData,
  }: {
    userId: string;
    requestData: {
      requestType:
        | 'access'
        | 'rectification'
        | 'erasure'
        | 'portability'
        | 'restriction'
        | 'objection';
      description: string;
      priority: 'low' | 'medium' | 'high' | 'urgent';
    };
  }) => {
    const _response = await privacyService.submitDataRightsRequest(
      userId,
      requestData
    );
    return response;
  }
);

// 獲取數據權利請求歷史
export const _fetchDataRightsRequestHistory = createAsyncThunk(
  'privacy/fetchDataRightsRequestHistory',
  async (userId: string) => {
    const _response = await privacyService.getDataRightsRequestHistory(userId);
    return response;
  }
);

// 獲取隱私法律要求
export const _fetchPrivacyLawRequirements = createAsyncThunk(
  'privacy/fetchPrivacyLawRequirements',
  async (region: RegionCode) => {
    const _response = await privacyService.getPrivacyLawRequirements(region);
    return response;
  }
);

// 獲取隱私設置配置
export const _fetchPrivacySettingsConfig = createAsyncThunk(
  'privacy/fetchPrivacySettingsConfig',
  async (region: RegionCode) => {
    const _response = await privacyService.getPrivacySettingsConfig(region);
    return response;
  }
);

// 驗證年齡
export const _verifyAge = createAsyncThunk(
  'privacy/verifyAge',
  async ({ userId, birthDate }: { userId: string; birthDate: Date }) => {
    const _response = await privacyService.verifyAge(
      userId,
      birthDate.toISOString()
    );
    return response;
  }
);

// 請求父母同意
export const _requestParentalConsent = createAsyncThunk(
  'privacy/requestParentalConsent',
  async ({ userId, parentEmail }: { userId: string; parentEmail: string }) => {
    const _response = await privacyService.requestParentalConsent(
      userId,
      parentEmail
    );
    return response;
  }
);

// 導出用戶數據
export const _exportUserData = createAsyncThunk(
  'privacy/exportUserData',
  async (userId: string) => {
    const _response = await privacyService.exportUserData(userId);
    return response;
  }
);

// 刪除用戶數據
export const _deleteUserData = createAsyncThunk(
  'privacy/deleteUserData',
  async (userId: string) => {
    const _response = await privacyService.deleteUserData(userId);
    return response;
  }
);

// 檢查隱私合規性
export const _checkPrivacyCompliance = createAsyncThunk(
  'privacy/checkPrivacyCompliance',
  async ({ userId, region }: { userId: string; region: RegionCode }) => {
    const _response = await privacyService.checkPrivacyCompliance(
      userId,
      region
    );
    return response;
  }
);

// 獲取隱私儀表板
export const _fetchPrivacyDashboard = createAsyncThunk(
  'privacy/fetchPrivacyDashboard',
  async (userId: string) => {
    const _response = await privacyService.getPrivacyDashboard(userId);
    return response;
  }
);

// 檢查同意更新
export const _checkConsentRenewal = createAsyncThunk(
  'privacy/checkConsentRenewal',
  async (userId: string) => {
    const _response = await privacyService.checkConsentRenewal(userId);
    return response;
  }
);

// 批量更新同意
export const _batchUpdateConsent = createAsyncThunk(
  'privacy/batchUpdateConsent',
  async ({
    userId,
    consents,
  }: {
    userId: string;
    consents: {
      purpose: DataProcessingPurpose;
      consented: boolean;
      legalBasis: LegalBasis;
    }[];
  }) => {
    const _response = await privacyService.batchUpdateConsent(userId, consents);
    return response;
  }
);

const _privacySlice = createSlice({
  name: 'privacy',
  initialState,
  reducers: {
    // 清除錯誤
    clearError: (state, action: PayloadAction<string>) => {
      switch (action.payload) {
        case 'preferences':
          state.preferencesError = null;
          break;
        case 'consentHistory':
          state.consentHistoryError = null;
          break;
        case 'dataRightsRequests':
          state.dataRightsRequestsError = null;
          break;
        case 'privacyLaws':
          state.privacyLawsError = null;
          break;
        case 'privacyConfig':
          state.privacyConfigError = null;
          break;
        case 'dashboard':
          state.dashboardError = null;
          break;
        case 'complianceCheck':
          state.complianceCheckError = null;
          break;
        case 'thirdPartyProcessors':
          state.thirdPartyProcessorsError = null;
          break;
        case 'processingRecords':
          state.processingRecordsError = null;
          break;
        case 'ageVerification':
          state.ageVerificationError = null;
          break;
        case 'parentalConsent':
          state.parentalConsentError = null;
          break;
        case 'dataExport':
          state.dataExportError = null;
          break;
        case 'dataDeletion':
          state.dataDeletionError = null;
          break;
        case 'consentRenewal':
          state.consentRenewalError = null;
          break;
      }
    },

    // 設置當前地區
    setCurrentRegion: (state, action: PayloadAction<RegionCode>) => {
      state.currentRegion = action.payload;
    },

    // 重置狀態
    resetPrivacyState: state => {
      return initialState;
    },

    // 更新部分偏好
    updatePartialPreferences: (
      state,
      action: PayloadAction<Partial<PrivacyPreferences>>
    ) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },

    // 添加新的同意記錄
    addConsentRecord: (state, action: PayloadAction<ConsentRecord>) => {
      state.consentHistory.unshift(action.payload);
    },

    // 更新同意記錄
    updateConsentRecord: (state, action: PayloadAction<ConsentRecord>) => {
      const _index = state.consentHistory.findIndex(
        record => record.id === action.payload.id
      );
      if (index !== -1) {
        state.consentHistory[index] = action.payload;
      }
    },

    // 添加數據權利請求
    addDataRightsRequest: (state, action: PayloadAction<DataRightsRequest>) => {
      state.dataRightsRequests.unshift(action.payload);
    },

    // 更新數據權利請求
    updateDataRightsRequest: (
      state,
      action: PayloadAction<DataRightsRequest>
    ) => {
      const _index = state.dataRightsRequests.findIndex(
        request => request.id === action.payload.id
      );
      if (index !== -1) {
        state.dataRightsRequests[index] = action.payload;
      }
    },
  },
  extraReducers: builder => {
    // 獲取隱私偏好
    builder
      .addCase(fetchPrivacyPreferences.pending, state => {
        state.preferencesLoading = true;
        state.preferencesError = null;
      })
      .addCase(fetchPrivacyPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchPrivacyPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.preferencesError = action.error.message || '獲取隱私偏好失敗';
      });

    // 更新隱私偏好
    builder
      .addCase(updatePrivacyPreferences.pending, state => {
        state.preferencesLoading = true;
        state.preferencesError = null;
      })
      .addCase(updatePrivacyPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
      })
      .addCase(updatePrivacyPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.preferencesError = action.error.message || '更新隱私偏好失敗';
      });

    // 記錄同意
    builder.addCase(recordConsent.fulfilled, (state, action) => {
      state.consentHistory.unshift(action.payload);
    });

    // 撤回同意
    builder.addCase(withdrawConsent.fulfilled, (state, action) => {
      const _index = state.consentHistory.findIndex(
        record => record.id === action.payload.id
      );
      if (index !== -1) {
        state.consentHistory[index] = action.payload;
      }
    });

    // 獲取同意歷史
    builder
      .addCase(fetchConsentHistory.pending, state => {
        state.consentHistoryLoading = true;
        state.consentHistoryError = null;
      })
      .addCase(fetchConsentHistory.fulfilled, (state, action) => {
        state.consentHistoryLoading = false;
        state.consentHistory = action.payload;
      })
      .addCase(fetchConsentHistory.rejected, (state, action) => {
        state.consentHistoryLoading = false;
        state.consentHistoryError = action.error.message || '獲取同意歷史失敗';
      });

    // 提交數據權利請求
    builder.addCase(submitDataRightsRequest.fulfilled, (state, action) => {
      state.dataRightsRequests.unshift(action.payload);
    });

    // 獲取數據權利請求歷史
    builder
      .addCase(fetchDataRightsRequestHistory.pending, state => {
        state.dataRightsRequestsLoading = true;
        state.dataRightsRequestsError = null;
      })
      .addCase(fetchDataRightsRequestHistory.fulfilled, (state, action) => {
        state.dataRightsRequestsLoading = false;
        state.dataRightsRequests = action.payload;
      })
      .addCase(fetchDataRightsRequestHistory.rejected, (state, action) => {
        state.dataRightsRequestsLoading = false;
        state.dataRightsRequestsError =
          action.error.message || '獲取數據權利請求歷史失敗';
      });

    // 獲取隱私法律要求
    builder
      .addCase(fetchPrivacyLawRequirements.pending, state => {
        state.privacyLawsLoading = true;
        state.privacyLawsError = null;
      })
      .addCase(fetchPrivacyLawRequirements.fulfilled, (state, action) => {
        state.privacyLawsLoading = false;
        state.privacyLaws = action.payload;
      })
      .addCase(fetchPrivacyLawRequirements.rejected, (state, action) => {
        state.privacyLawsLoading = false;
        state.privacyLawsError = action.error.message || '獲取隱私法律要求失敗';
      });

    // 獲取隱私設置配置
    builder
      .addCase(fetchPrivacySettingsConfig.pending, state => {
        state.privacyConfigLoading = true;
        state.privacyConfigError = null;
      })
      .addCase(fetchPrivacySettingsConfig.fulfilled, (state, action) => {
        state.privacyConfigLoading = false;
        state.privacyConfig = action.payload;
      })
      .addCase(fetchPrivacySettingsConfig.rejected, (state, action) => {
        state.privacyConfigLoading = false;
        state.privacyConfigError =
          action.error.message || '獲取隱私設置配置失敗';
      });

    // 驗證年齡
    builder
      .addCase(verifyAge.pending, state => {
        state.ageVerificationLoading = true;
        state.ageVerificationError = null;
      })
      .addCase(verifyAge.fulfilled, (state, action) => {
        state.ageVerificationLoading = false;
        state.ageVerification = action.payload;
      })
      .addCase(verifyAge.rejected, (state, action) => {
        state.ageVerificationLoading = false;
        state.ageVerificationError = action.error.message || '年齡驗證失敗';
      });

    // 請求父母同意
    builder
      .addCase(requestParentalConsent.pending, state => {
        state.parentalConsentLoading = true;
        state.parentalConsentError = null;
      })
      .addCase(requestParentalConsent.fulfilled, (state, action) => {
        state.parentalConsentLoading = false;
        state.parentalConsentRequest = action.payload;
      })
      .addCase(requestParentalConsent.rejected, (state, action) => {
        state.parentalConsentLoading = false;
        state.parentalConsentError = action.error.message || '請求父母同意失敗';
      });

    // 導出用戶數據
    builder
      .addCase(exportUserData.pending, state => {
        state.dataExportLoading = true;
        state.dataExportError = null;
      })
      .addCase(exportUserData.fulfilled, (state, action) => {
        state.dataExportLoading = false;
        state.dataExport = action.payload;
      })
      .addCase(exportUserData.rejected, (state, action) => {
        state.dataExportLoading = false;
        state.dataExportError = action.error.message || '導出用戶數據失敗';
      });

    // 刪除用戶數據
    builder
      .addCase(deleteUserData.pending, state => {
        state.dataDeletionLoading = true;
        state.dataDeletionError = null;
      })
      .addCase(deleteUserData.fulfilled, (state, action) => {
        state.dataDeletionLoading = false;
        state.dataDeletion = action.payload;
      })
      .addCase(deleteUserData.rejected, (state, action) => {
        state.dataDeletionLoading = false;
        state.dataDeletionError = action.error.message || '刪除用戶數據失敗';
      });

    // 檢查隱私合規性
    builder
      .addCase(checkPrivacyCompliance.pending, state => {
        state.complianceCheckLoading = true;
        state.complianceCheckError = null;
      })
      .addCase(checkPrivacyCompliance.fulfilled, (state, action) => {
        state.complianceCheckLoading = false;
        state.complianceCheck = action.payload;
      })
      .addCase(checkPrivacyCompliance.rejected, (state, action) => {
        state.complianceCheckLoading = false;
        state.complianceCheckError =
          action.error.message || '檢查隱私合規性失敗';
      });

    // 獲取隱私儀表板
    builder
      .addCase(fetchPrivacyDashboard.pending, state => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchPrivacyDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchPrivacyDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.error.message || '獲取隱私儀表板失敗';
      });

    // 檢查同意更新
    builder
      .addCase(checkConsentRenewal.pending, state => {
        state.consentRenewalLoading = true;
        state.consentRenewalError = null;
      })
      .addCase(checkConsentRenewal.fulfilled, (state, action) => {
        state.consentRenewalLoading = false;
        state.consentRenewal = action.payload;
      })
      .addCase(checkConsentRenewal.rejected, (state, action) => {
        state.consentRenewalLoading = false;
        state.consentRenewalError = action.error.message || '檢查同意更新失敗';
      });

    // 批量更新同意
    builder.addCase(batchUpdateConsent.fulfilled, (state, action) => {
      // 更新同意歷史記錄
      action.payload.forEach((newRecord: unknown) => {
        const _index = state.consentHistory.findIndex(
          record => record.id === newRecord.id
        );
        if (index !== -1) {
          state.consentHistory[index] = newRecord;
        } else {
          state.consentHistory.unshift(newRecord);
        }
      });
    });
  },
});

export const {
  clearError,
  setCurrentRegion,
  resetPrivacyState,
  updatePartialPreferences,
  addConsentRecord,
  updateConsentRecord,
  addDataRightsRequest,
  updateDataRightsRequest,
} = privacySlice.actions;

export default privacySlice.reducer;

// Selectors
export const _selectPrivacyPreferences = (state: { privacy: PrivacyState }) =>
  state.privacy.preferences;
export const _selectPrivacyPreferencesLoading = (state: {
  privacy: PrivacyState;
}) => state.privacy.preferencesLoading;
export const _selectPrivacyPreferencesError = (state: {
  privacy: PrivacyState;
}) => state.privacy.preferencesError;

export const _selectConsentHistory = (state: { privacy: PrivacyState }) =>
  state.privacy.consentHistory;
export const _selectConsentHistoryLoading = (state: { privacy: PrivacyState }) =>
  state.privacy.consentHistoryLoading;
export const _selectConsentHistoryError = (state: { privacy: PrivacyState }) =>
  state.privacy.consentHistoryError;

export const _selectDataRightsRequests = (state: { privacy: PrivacyState }) =>
  state.privacy.dataRightsRequests;
export const _selectDataRightsRequestsLoading = (state: {
  privacy: PrivacyState;
}) => state.privacy.dataRightsRequestsLoading;
export const _selectDataRightsRequestsError = (state: {
  privacy: PrivacyState;
}) => state.privacy.dataRightsRequestsError;

export const _selectPrivacyLaws = (state: { privacy: PrivacyState }) =>
  state.privacy.privacyLaws;
export const _selectPrivacyLawsLoading = (state: { privacy: PrivacyState }) =>
  state.privacy.privacyLawsLoading;
export const _selectPrivacyLawsError = (state: { privacy: PrivacyState }) =>
  state.privacy.privacyLawsError;

export const _selectPrivacyConfig = (state: { privacy: PrivacyState }) =>
  state.privacy.privacyConfig;
export const _selectPrivacyConfigLoading = (state: { privacy: PrivacyState }) =>
  state.privacy.privacyConfigLoading;
export const _selectPrivacyConfigError = (state: { privacy: PrivacyState }) =>
  state.privacy.privacyConfigError;

export const _selectPrivacyDashboard = (state: { privacy: PrivacyState }) =>
  state.privacy.dashboard;
export const _selectPrivacyDashboardLoading = (state: {
  privacy: PrivacyState;
}) => state.privacy.dashboardLoading;
export const _selectPrivacyDashboardError = (state: { privacy: PrivacyState }) =>
  state.privacy.dashboardError;

export const _selectComplianceCheck = (state: { privacy: PrivacyState }) =>
  state.privacy.complianceCheck;
export const _selectComplianceCheckLoading = (state: {
  privacy: PrivacyState;
}) => state.privacy.complianceCheckLoading;
export const _selectComplianceCheckError = (state: { privacy: PrivacyState }) =>
  state.privacy.complianceCheckError;

export const _selectCurrentRegion = (state: { privacy: PrivacyState }) =>
  state.privacy.currentRegion;

export const _selectAgeVerification = (state: { privacy: PrivacyState }) =>
  state.privacy.ageVerification;
export const _selectAgeVerificationLoading = (state: {
  privacy: PrivacyState;
}) => state.privacy.ageVerificationLoading;
export const _selectAgeVerificationError = (state: { privacy: PrivacyState }) =>
  state.privacy.ageVerificationError;

export const _selectParentalConsentRequest = (state: {
  privacy: PrivacyState;
}) => state.privacy.parentalConsentRequest;
export const _selectParentalConsentLoading = (state: {
  privacy: PrivacyState;
}) => state.privacy.parentalConsentLoading;
export const _selectParentalConsentError = (state: { privacy: PrivacyState }) =>
  state.privacy.parentalConsentError;

export const _selectDataExport = (state: { privacy: PrivacyState }) =>
  state.privacy.dataExport;
export const _selectDataExportLoading = (state: { privacy: PrivacyState }) =>
  state.privacy.dataExportLoading;
export const _selectDataExportError = (state: { privacy: PrivacyState }) =>
  state.privacy.dataExportError;

export const _selectDataDeletion = (state: { privacy: PrivacyState }) =>
  state.privacy.dataDeletion;
export const _selectDataDeletionLoading = (state: { privacy: PrivacyState }) =>
  state.privacy.dataDeletionLoading;
export const _selectDataDeletionError = (state: { privacy: PrivacyState }) =>
  state.privacy.dataDeletionError;

export const _selectConsentRenewal = (state: { privacy: PrivacyState }) =>
  state.privacy.consentRenewal;
export const _selectConsentRenewalLoading = (state: { privacy: PrivacyState }) =>
  state.privacy.consentRenewalLoading;
export const _selectConsentRenewalError = (state: { privacy: PrivacyState }) =>
  state.privacy.consentRenewalError;
