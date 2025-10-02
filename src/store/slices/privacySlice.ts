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

// CreateServiceInstance
const _privacyService = new PrivacyService();

interface PrivacyState {
  // User隱私Preferences
  preferences: PrivacyPreferences | null;
  preferencesLoading: boolean;
  preferencesError: string | null;

  // AgreeRecord
  consentHistory: ConsentRecord[];
  consentHistoryLoading: boolean;
  consentHistoryError: string | null;

  // Data權利Request
  dataRightsRequests: DataRightsRequest[];
  dataRightsRequestsLoading: boolean;
  dataRightsRequestsError: string | null;

  // 隱私法律要求
  privacyLaws: PrivacyLawRequirement[];
  privacyLawsLoading: boolean;
  privacyLawsError: string | null;

  // 隱私SettingsConfigure
  privacyConfig: PrivacySettingsConfig | null;
  privacyConfigLoading: boolean;
  privacyConfigError: string | null;

  // 隱私儀Table板
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

  // 合規性Check
  complianceCheck: {
    compliant: boolean;
    issues: string[];
    recommendations: string[];
    score: number;
  } | null;
  complianceCheckLoading: boolean;
  complianceCheckError: string | null;

  // 第三方DataHandle者
  thirdPartyProcessors: unknown[];
  thirdPartyProcessorsLoading: boolean;
  thirdPartyProcessorsError: string | null;

  // DataHandleRecord
  processingRecords: unknown[];
  processingRecordsLoading: boolean;
  processingRecordsError: string | null;

  // 當前UserLocale
  currentRegion: RegionCode;

  // AgeVerify
  ageVerification: {
    isMinor: boolean;
    age: number;
    requiresParentalConsent: boolean;
  } | null;
  ageVerificationLoading: boolean;
  ageVerificationError: string | null;

  // 父母AgreeRequest
  parentalConsentRequest: {
    requestId: string;
    status: 'pending' | 'sent' | 'verified' | 'rejected';
  } | null;
  parentalConsentLoading: boolean;
  parentalConsentError: string | null;

  // DataExport
  dataExport: {
    downloadUrl: string;
    expiresAt: Date;
    format: 'json' | 'csv' | 'xml';
  } | null;
  dataExportLoading: boolean;
  dataExportError: string | null;

  // DataDelete
  dataDeletion: {
    status: 'pending' | 'processing' | 'completed';
    estimatedCompletion: Date;
  } | null;
  dataDeletionLoading: boolean;
  dataDeletionError: string | null;

  // AgreeUpdateCheck
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

// Get隱私Preferences
export const _fetchPrivacyPreferences = createAsyncThunk(
  'privacy/fetchPreferences',
  async (userId: string) => {
    const _response = await privacyService.getPrivacyPreferences(userId);
    return response;
  }
);

// Update隱私Preferences
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

// RecordAgree
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

// 撤回Agree
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

// GetAgree歷史
export const _fetchConsentHistory = createAsyncThunk(
  'privacy/fetchConsentHistory',
  async (userId: string) => {
    const _response = await privacyService.getConsentHistory(userId);
    return response;
  }
);

// SubmitData權利Request
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

// GetData權利Request歷史
export const _fetchDataRightsRequestHistory = createAsyncThunk(
  'privacy/fetchDataRightsRequestHistory',
  async (userId: string) => {
    const _response = await privacyService.getDataRightsRequestHistory(userId);
    return response;
  }
);

// Get隱私法律要求
export const _fetchPrivacyLawRequirements = createAsyncThunk(
  'privacy/fetchPrivacyLawRequirements',
  async (region: RegionCode) => {
    const _response = await privacyService.getPrivacyLawRequirements(region);
    return response;
  }
);

// Get隱私SettingsConfigure
export const _fetchPrivacySettingsConfig = createAsyncThunk(
  'privacy/fetchPrivacySettingsConfig',
  async (region: RegionCode) => {
    const _response = await privacyService.getPrivacySettingsConfig(region);
    return response;
  }
);

// VerifyAge
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

// Request父母Agree
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

// ExportUserData
export const _exportUserData = createAsyncThunk(
  'privacy/exportUserData',
  async (userId: string) => {
    const _response = await privacyService.exportUserData(userId);
    return response;
  }
);

// DeleteUserData
export const _deleteUserData = createAsyncThunk(
  'privacy/deleteUserData',
  async (userId: string) => {
    const _response = await privacyService.deleteUserData(userId);
    return response;
  }
);

// Check隱私合規性
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

// Get隱私儀Table板
export const _fetchPrivacyDashboard = createAsyncThunk(
  'privacy/fetchPrivacyDashboard',
  async (userId: string) => {
    const _response = await privacyService.getPrivacyDashboard(userId);
    return response;
  }
);

// CheckAgreeUpdate
export const _checkConsentRenewal = createAsyncThunk(
  'privacy/checkConsentRenewal',
  async (userId: string) => {
    const _response = await privacyService.checkConsentRenewal(userId);
    return response;
  }
);

// BatchUpdateAgree
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
    // ClearError
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

    // Settings當前Locale
    setCurrentRegion: (state, action: PayloadAction<RegionCode>) => {
      state.currentRegion = action.payload;
    },

    // ResetStatus
    resetPrivacyState: state => {
      return initialState;
    },

    // UpdatePartialPreferences
    updatePartialPreferences: (
      state,
      action: PayloadAction<Partial<PrivacyPreferences>>
    ) => {
      if (state.preferences) {
        state.preferences = { ...state.preferences, ...action.payload };
      }
    },

    // Add新的AgreeRecord
    addConsentRecord: (state, action: PayloadAction<ConsentRecord>) => {
      state.consentHistory.unshift(action.payload);
    },

    // UpdateAgreeRecord
    updateConsentRecord: (state, action: PayloadAction<ConsentRecord>) => {
      const _index = state.consentHistory.findIndex(
        record => record.id === action.payload.id
      );
      if (index !== -1) {
        state.consentHistory[index] = action.payload;
      }
    },

    // AddData權利Request
    addDataRightsRequest: (state, action: PayloadAction<DataRightsRequest>) => {
      state.dataRightsRequests.unshift(action.payload);
    },

    // UpdateData權利Request
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
    // Get隱私Preferences
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
        state.preferencesError = action.error.message || 'Get隱私偏好Failed';
      });

    // Update隱私Preferences
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
        state.preferencesError = action.error.message || 'Update隱私偏好Failed';
      });

    // RecordAgree
    builder.addCase(recordConsent.fulfilled, (state, action) => {
      state.consentHistory.unshift(action.payload);
    });

    // 撤回Agree
    builder.addCase(withdrawConsent.fulfilled, (state, action) => {
      const _index = state.consentHistory.findIndex(
        record => record.id === action.payload.id
      );
      if (index !== -1) {
        state.consentHistory[index] = action.payload;
      }
    });

    // GetAgree歷史
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
        state.consentHistoryError = action.error.message || 'Get同意歷史Failed';
      });

    // SubmitData權利Request
    builder.addCase(submitDataRightsRequest.fulfilled, (state, action) => {
      state.dataRightsRequests.unshift(action.payload);
    });

    // GetData權利Request歷史
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
          action.error.message || 'Get數據權利請求歷史Failed';
      });

    // Get隱私法律要求
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
        state.privacyLawsError = action.error.message || 'Get隱私法律要求Failed';
      });

    // Get隱私SettingsConfigure
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
          action.error.message || 'Get隱私SettingsConfigureFailed';
      });

    // VerifyAge
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
        state.ageVerificationError = action.error.message || '年齡VerifyFailed';
      });

    // Request父母Agree
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
        state.parentalConsentError = action.error.message || '請求父母同意Failed';
      });

    // ExportUserData
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
        state.dataExportError = action.error.message || '導出用戶數據Failed';
      });

    // DeleteUserData
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
        state.dataDeletionError = action.error.message || 'Delete用戶數據Failed';
      });

    // Check隱私合規性
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
          action.error.message || 'Check隱私合規性Failed';
      });

    // Get隱私儀Table板
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
        state.dashboardError = action.error.message || 'Get隱私儀表板Failed';
      });

    // CheckAgreeUpdate
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
        state.consentRenewalError = action.error.message || 'Check同意UpdateFailed';
      });

    // BatchUpdateAgree
    builder.addCase(batchUpdateConsent.fulfilled, (state, action) => {
      // UpdateAgree歷史Record
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
export const _selectConsentHistoryLoading = (state: {
  privacy: PrivacyState;
}) => state.privacy.consentHistoryLoading;
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
export const _selectPrivacyDashboardError = (state: {
  privacy: PrivacyState;
}) => state.privacy.dashboardError;

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
export const _selectConsentRenewalLoading = (state: {
  privacy: PrivacyState;
}) => state.privacy.consentRenewalLoading;
export const _selectConsentRenewalError = (state: { privacy: PrivacyState }) =>
  state.privacy.consentRenewalError;
