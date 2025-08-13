import { configureStore } from '@reduxjs/toolkit';
import { persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

// Import slices
import authReducer from './slices/authSlice';
import cardReducer from './slices/cardSlice';
import collectionReducer from './slices/collectionSlice';
import marketReducer from './slices/marketSlice';
import investmentReducer from './slices/investmentSlice';
import aiReducer from './slices/aiSlice';
import membershipReducer from './slices/membershipSlice';
import settingsReducer from './slices/settingsSlice';

// Custom hooks
import { useDispatch } from 'react-redux';

// Persist configuration (currently not used, but kept for future use)
// const persistConfig = {
//   key: 'root',
//   storage: AsyncStorage,
//   whitelist: ['auth', 'settings', 'membership'], // Only persist these slices
// };

// Root reducer
const rootReducer = {
  auth: authReducer,
  cards: cardReducer,
  collection: collectionReducer,
  market: marketReducer,
  investments: investmentReducer,
  ai: aiReducer,
  membership: membershipReducer,
  settings: settingsReducer
};

// Create store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }),
  devTools: __DEV__
});

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
