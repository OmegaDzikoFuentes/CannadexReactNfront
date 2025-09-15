// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import strainsSlice from './slices/strainsSlice';
import encountersSlice from './slices/encountersSlice';
import battlesSlice from './slices/battlesSlice';
import friendsSlice from './slices/friendsSlice';
import achievementsSlice from './slices/achievementsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    strains: strainsSlice,
    encounters: encountersSlice,
    battles: battlesSlice,
    friends: friendsSlice,
    achievements: achievementsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;