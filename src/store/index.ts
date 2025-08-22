import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authReducer from './slices/authSlice';
import cardReducer from './slices/cardSlice';
import collectionReducer from './slices/collectionSlice';
import investmentReducer from './slices/investmentSlice';
import marketReducer from './slices/marketSlice';
import aiReducer from './slices/aiSlice';
import membershipReducer from './slices/membershipSlice';
import settingsReducer from './slices/settingsSlice';
import scanHistoryReducer from './slices/scanHistorySlice';
import priceDataReducer from './slices/priceDataSlice';

// 持久化配置
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings'], // 只持久化認證和設置狀態
};

// 根 reducer
const rootReducer = {
  auth: authReducer,
  card: cardReducer,
  collection: collectionReducer,
  investment: investmentReducer,
  market: marketReducer,
  ai: aiReducer,
  membership: membershipReducer,
  settings: settingsReducer,
  scanHistory: scanHistoryReducer,
  priceData: priceDataReducer,
};

// 創建 store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// 創建持久化 store
export const persistor = persistStore(store);

// 導出類型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
