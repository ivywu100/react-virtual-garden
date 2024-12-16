import { configureStore } from '@reduxjs/toolkit';
import inventoryItemReducer from './slices/inventoryItemSlice';

export const store = configureStore({
    reducer: {
        inventoryItems: inventoryItemReducer,
    },
});

// Export types for the state and dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
