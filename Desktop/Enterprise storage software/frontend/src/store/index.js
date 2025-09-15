import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import inventoryReducer from './slices/inventorySlice';
import warehouseReducer from './slices/warehouseSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer,
    warehouse: warehouseReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
