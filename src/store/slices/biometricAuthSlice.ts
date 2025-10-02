import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import type {
  BiometricAuthRequest,
  BiometricSettings,
  BiometricAuthState,
} from '../../core/types';
import {
  BiometricCapability,
  BiometricAuthResult,
  BiometricEnrollmentStatus,
  BiometricSecurityInfo,
} from '../../core/types';
import { biometricAuthService } from '../../features/auth/services/biometricAuthService';

// 初始Status
const initialState: BiometricAuthState = {
  // 能力檢測
  capabilities: [],
  isCapabilityLoading: false,
  capabilityError: null,

  // AuthenticateStatus
  isAuthenticating: false,
  authResult: null,
  authError: null,

  // Settings
  settings: {
    isEnabled: false,
    enabledTypes: [],
    fallbackToDeviceCredential: true,
    requireConfirmation: true,
    invalidateOnEnrollment: false,
    maxRetryAttempts: 3,
    lockoutDuration: 30,
  },
  isSettingsLoading: false,
  settingsError: null,

  // RegisterStatus
  enrollmentStatus: null,
  isEnrollmentLoading: false,
  enrollmentError: null,

  // 安全Information
  securityInfo: null,
  isSecurityLoading: false,
  securityError: null,
};

// Async Thunk Actions

/**
 * 檢測生物識別能力
 */
export const _detectBiometricCapabilities = createAsyncThunk(
  'biometricAuth/detectCapabilities',
  async (_, { rejectWithValue }) => {
    try {
      const _capabilities =
        await biometricAuthService.detectBiometricCapabilities();
      return capabilities;
    } catch (error: unknown) {
      return rejectWithValue(error.message || '檢測生物識別能力Failed');
    }
  }
);

/**
 * 執Row生物識別Authenticate
 */
export const _authenticateWithBiometric = createAsyncThunk(
  'biometricAuth/authenticate',
  async (request: BiometricAuthRequest = {}, { rejectWithValue }) => {
    try {
      const _result = await biometricAuthService.authenticate(request);
      return result;
    } catch (error: unknown) {
      return rejectWithValue(error.message || '生物識別認證Failed');
    }
  }
);

/**
 * Create生物識別密鑰
 */
export const _createBiometricKeys = createAsyncThunk(
  'biometricAuth/createKeys',
  async (_, { rejectWithValue }) => {
    try {
      const _result = await biometricAuthService.createBiometricKeys();
      return result;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Create生物識別密鑰Failed');
    }
  }
);

/**
 * Check生物識別密鑰YesNo存在
 */
export const _checkBiometricKeys = createAsyncThunk(
  'biometricAuth/checkKeys',
  async (_, { rejectWithValue }) => {
    try {
      const _exists = await biometricAuthService.biometricKeysExist();
      return exists;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Check生物識別密鑰Failed');
    }
  }
);

/**
 * Delete生物識別密鑰
 */
export const _deleteBiometricKeys = createAsyncThunk(
  'biometricAuth/deleteKeys',
  async (_, { rejectWithValue }) => {
    try {
      const _result = await biometricAuthService.deleteBiometricKeys();
      return result;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Delete生物識別密鑰Failed');
    }
  }
);

/**
 * Create生物識別Sign
 */
export const _createBiometricSignature = createAsyncThunk(
  'biometricAuth/createSignature',
  async (
    { payload, promptMessage }: { payload: string; promptMessage?: string },
    { rejectWithValue }
  ) => {
    try {
      const _signature = await biometricAuthService.createBiometricSignature(
        payload,
        promptMessage
      );
      return signature;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Create生物識別簽名Failed');
    }
  }
);

/**
 * Get生物識別Settings
 */
export const _getBiometricSettings = createAsyncThunk(
  'biometricAuth/getSettings',
  async (_, { rejectWithValue }) => {
    try {
      const _settings = await biometricAuthService.getBiometricSettings();
      return settings;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Get生物識別SettingsFailed');
    }
  }
);

/**
 * Update生物識別Settings
 */
export const _updateBiometricSettings = createAsyncThunk(
  'biometricAuth/updateSettings',
  async (settings: Partial<BiometricSettings>, { rejectWithValue }) => {
    try {
      const _updatedSettings =
        await biometricAuthService.updateBiometricSettings(settings);
      return updatedSettings;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Update生物識別SettingsFailed');
    }
  }
);

/**
 * GetRegisterStatus
 */
export const _getEnrollmentStatus = createAsyncThunk(
  'biometricAuth/getEnrollmentStatus',
  async (_, { rejectWithValue }) => {
    try {
      const _status = await biometricAuthService.getEnrollmentStatus();
      return status;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Get註冊狀態Failed');
    }
  }
);

/**
 * Get安全Information
 */
export const _getSecurityInfo = createAsyncThunk(
  'biometricAuth/getSecurityInfo',
  async (_, { rejectWithValue }) => {
    try {
      const _info = await biometricAuthService.getSecurityInfo();
      return info;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Get安全信息Failed');
    }
  }
);

/**
 * Check生物識別YesNo可用
 */
export const _checkBiometricAvailability = createAsyncThunk(
  'biometricAuth/checkAvailability',
  async (_, { rejectWithValue }) => {
    try {
      const _available = await biometricAuthService.isBiometricAvailable();
      return available;
    } catch (error: unknown) {
      return rejectWithValue(error.message || 'Check生物識別可用性Failed');
    }
  }
);

// Slice
const _biometricAuthSlice = createSlice({
  name: 'biometricAuth',
  initialState,
  reducers: {
    // ClearAuthenticate結果
    clearAuthResult: state => {
      state.authResult = null;
      state.authError = null;
    },

    // ClearAuthenticateError
    clearAuthError: state => {
      state.authError = null;
    },

    // Clear能力檢測Error
    clearCapabilityError: state => {
      state.capabilityError = null;
    },

    // ClearSettingsError
    clearSettingsError: state => {
      state.settingsError = null;
    },

    // ClearRegisterError
    clearEnrollmentError: state => {
      state.enrollmentError = null;
    },

    // Clear安全InformationError
    clearSecurityError: state => {
      state.securityError = null;
    },

    // Reset生物識別Status
    resetBiometricAuth: state => {
      return { ...initialState };
    },

    // SettingsAuthenticateStatus
    setAuthenticating: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticating = action.payload;
    },

    // UpdateLocalSettings
    updateLocalSettings: (
      state,
      action: PayloadAction<Partial<BiometricSettings>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  extraReducers: builder => {
    // detectBiometricCapabilities
    builder
      .addCase(detectBiometricCapabilities.pending, state => {
        state.isCapabilityLoading = true;
        state.capabilityError = null;
      })
      .addCase(detectBiometricCapabilities.fulfilled, (state, action) => {
        state.isCapabilityLoading = false;
        state.capabilities = action.payload;
        state.capabilityError = null;
      })
      .addCase(detectBiometricCapabilities.rejected, (state, action) => {
        state.isCapabilityLoading = false;
        state.capabilityError = action.payload as string;
      });

    // authenticateWithBiometric
    builder
      .addCase(authenticateWithBiometric.pending, state => {
        state.isAuthenticating = true;
        state.authError = null;
        state.authResult = null;
      })
      .addCase(authenticateWithBiometric.fulfilled, (state, action) => {
        state.isAuthenticating = false;
        state.authResult = action.payload;
        state.authError = null;
      })
      .addCase(authenticateWithBiometric.rejected, (state, action) => {
        state.isAuthenticating = false;
        state.authError = action.payload as string;
      });

    // createBiometricKeys
    builder
      .addCase(createBiometricKeys.pending, state => {
        state.isSecurityLoading = true;
        state.securityError = null;
      })
      .addCase(createBiometricKeys.fulfilled, (state, action) => {
        state.isSecurityLoading = false;
        // Update安全Information中的密鑰Status
        if (state.securityInfo) {
          state.securityInfo.keyGenerated = action.payload;
        }
      })
      .addCase(createBiometricKeys.rejected, (state, action) => {
        state.isSecurityLoading = false;
        state.securityError = action.payload as string;
      });

    // checkBiometricKeys
    builder.addCase(checkBiometricKeys.fulfilled, (state, action) => {
      // Update安全Information中的密鑰Status
      if (state.securityInfo) {
        state.securityInfo.keyGenerated = action.payload;
      }
    });

    // deleteBiometricKeys
    builder
      .addCase(deleteBiometricKeys.pending, state => {
        state.isSecurityLoading = true;
        state.securityError = null;
      })
      .addCase(deleteBiometricKeys.fulfilled, state => {
        state.isSecurityLoading = false;
        // Update安全Information中的密鑰Status
        if (state.securityInfo) {
          state.securityInfo.keyGenerated = false;
        }
      })
      .addCase(deleteBiometricKeys.rejected, (state, action) => {
        state.isSecurityLoading = false;
        state.securityError = action.payload as string;
      });

    // getBiometricSettings
    builder
      .addCase(getBiometricSettings.pending, state => {
        state.isSettingsLoading = true;
        state.settingsError = null;
      })
      .addCase(getBiometricSettings.fulfilled, (state, action) => {
        state.isSettingsLoading = false;
        state.settings = action.payload;
        state.settingsError = null;
      })
      .addCase(getBiometricSettings.rejected, (state, action) => {
        state.isSettingsLoading = false;
        state.settingsError = action.payload as string;
      });

    // updateBiometricSettings
    builder
      .addCase(updateBiometricSettings.pending, state => {
        state.isSettingsLoading = true;
        state.settingsError = null;
      })
      .addCase(updateBiometricSettings.fulfilled, (state, action) => {
        state.isSettingsLoading = false;
        state.settings = action.payload;
        state.settingsError = null;
      })
      .addCase(updateBiometricSettings.rejected, (state, action) => {
        state.isSettingsLoading = false;
        state.settingsError = action.payload as string;
      });

    // getEnrollmentStatus
    builder
      .addCase(getEnrollmentStatus.pending, state => {
        state.isEnrollmentLoading = true;
        state.enrollmentError = null;
      })
      .addCase(getEnrollmentStatus.fulfilled, (state, action) => {
        state.isEnrollmentLoading = false;
        state.enrollmentStatus = action.payload;
        state.enrollmentError = null;
      })
      .addCase(getEnrollmentStatus.rejected, (state, action) => {
        state.isEnrollmentLoading = false;
        state.enrollmentError = action.payload as string;
      });

    // getSecurityInfo
    builder
      .addCase(getSecurityInfo.pending, state => {
        state.isSecurityLoading = true;
        state.securityError = null;
      })
      .addCase(getSecurityInfo.fulfilled, (state, action) => {
        state.isSecurityLoading = false;
        state.securityInfo = action.payload;
        state.securityError = null;
      })
      .addCase(getSecurityInfo.rejected, (state, action) => {
        state.isSecurityLoading = false;
        state.securityError = action.payload as string;
      });

    // checkBiometricAvailability
    builder.addCase(checkBiometricAvailability.fulfilled, (state, action) => {
      // Update能力Information
      state.capabilities = state.capabilities.map(cap => ({
        ...cap,
        isAvailable: action.payload && cap.isEnrolled,
      }));
    });
  },
});

// Export actions
export const {
  clearAuthResult,
  clearAuthError,
  clearCapabilityError,
  clearSettingsError,
  clearEnrollmentError,
  clearSecurityError,
  resetBiometricAuth,
  setAuthenticating,
  updateLocalSettings,
} = biometricAuthSlice.actions;

// Export reducer
export default biometricAuthSlice.reducer;

// ExportSelect器
export const _selectBiometricAuth = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth;
export const _selectCapabilities = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.capabilities;
export const _selectIsCapabilityLoading = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.isCapabilityLoading;
export const _selectCapabilityError = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.capabilityError;
export const _selectIsAuthenticating = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.isAuthenticating;
export const _selectAuthResult = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.authResult;
export const _selectAuthError = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.authError;
export const _selectBiometricSettings = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.settings;
export const _selectIsSettingsLoading = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.isSettingsLoading;
export const _selectSettingsError = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.settingsError;
export const _selectEnrollmentStatus = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.enrollmentStatus;
export const _selectIsEnrollmentLoading = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.isEnrollmentLoading;
export const _selectEnrollmentError = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.enrollmentError;
export const _selectSecurityInfo = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.securityInfo;
export const _selectIsSecurityLoading = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.isSecurityLoading;
export const _selectSecurityError = (state: {
  biometricAuth: BiometricAuthState;
}) => state.biometricAuth.securityError;
