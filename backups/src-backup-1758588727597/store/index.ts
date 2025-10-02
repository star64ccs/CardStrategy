import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { persistStore } from 'redux-persist';

import aiReducer from './slices/aiSlice';
import appraisalReducer from './slices/appraisalSlice';
import authenticityCheckReducer from './slices/authenticityCheckSlice';
import authReducer from './slices/authSlice';
import biometricAuthReducer from './slices/biometricAuthSlice';
import cardRecognitionReducer from './slices/cardRecognitionSlice';
import cardReducer from './slices/cardSlice';
import centeringAssessmentReducer from './slices/centeringAssessmentSlice';
import chatReducer from './slices/chatSlice';
import collaborativeFilteringReducer from './slices/collaborativeFilteringSlice';
import collectionReducer from './slices/collectionSlice';
import contentRecommendationReducer from './slices/contentRecommendationSlice';
import fakeCardDetectionReducer from './slices/fakeCardDetectionSlice';
import fakeCardReportingReducer from './slices/fakeCardReportingSlice';
import hybridRecommendationReducer from './slices/hybridRecommendationSlice';
import intelligentSearchReducer from './slices/intelligentSearchSlice';
import investmentReducer from './slices/investmentSlice';
import marketReducer from './slices/marketSlice';
import membershipReducer from './slices/membershipSlice';
import predictionReducer from './slices/predictionSlice';
import priceDataReducer from './slices/priceDataSlice';
import pricingReducer from './slices/pricingSlice';
import privacyReducer from './slices/privacySlice';
import recommendationReducer from './slices/recommendationSlice';
import scanHistoryReducer from './slices/scanHistorySlice';
import sessionReducer from './slices/sessionSlice';
import settingsReducer from './slices/settingsSlice';
import socialAuthReducer from './slices/socialAuthSlice';
import storageReducer from './slices/storageSlice';
import themeReducer from './slices/themeSlice';
import websocketReducer from './slices/websocketSlice';

// 持久化配置
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'settings', 'theme', 'privacy'], // 只持久化認證、設置、主題和隱私狀態
};

// 根 reducer
const rootReducer = {
  auth: authReducer,
  socialAuth: socialAuthReducer,
  biometricAuth: biometricAuthReducer,
  session: sessionReducer,
  card: cardReducer,
  cardRecognition: cardRecognitionReducer,
  centeringAssessment: centeringAssessmentReducer,
  authenticityCheck: authenticityCheckReducer,
  appraisal: appraisalReducer,
  prediction: predictionReducer,
  recommendation: recommendationReducer,
  chat: chatReducer,
  pricing: pricingReducer,
  fakeCardDetection: fakeCardDetectionReducer,
  fakeCardReporting: fakeCardReportingReducer,
  storage: storageReducer,
  collection: collectionReducer,
  investment: investmentReducer,
  market: marketReducer,
  ai: aiReducer,
  membership: membershipReducer,
  settings: settingsReducer,
  scanHistory: scanHistoryReducer,
  priceData: priceDataReducer,
  websocket: websocketReducer,
  theme: themeReducer,
  privacy: privacyReducer,
  intelligentSearch: intelligentSearchReducer,
  collaborativeFiltering: collaborativeFilteringReducer,
  contentRecommendation: contentRecommendationReducer,
  hybridRecommendation: hybridRecommendationReducer,
};

// 創建 store
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
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
