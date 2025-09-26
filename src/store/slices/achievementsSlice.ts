// src/store/slices/achievementsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../services/api';
import { Achievement } from '../../types';

interface AchievementsState {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  availableAchievements: Achievement[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AchievementsState = {
  achievements: [],
  unlockedAchievements: [],
  availableAchievements: [],
  isLoading: false,
  error: null,
};

export const fetchAchievements = createAsyncThunk(
  'achievements/fetchAchievements',
  async () => {
    return await ApiService.getAchievements();
  }
);

export const fetchUnlockedAchievements = createAsyncThunk(
  'achievements/fetchUnlockedAchievements',
  async () => {
    return await ApiService.getUnlockedAchievements();
  }
);

export const fetchAvailableAchievements = createAsyncThunk(
  'achievements/fetchAvailableAchievements',
  async () => {
    return await ApiService.getAvailableAchievements();
  }
);

export const fetchAchievement = createAsyncThunk(
  'achievements/fetchAchievement',
  async (id: number) => {
    return await ApiService.getAchievement(id);
  }
);

export const claimAchievement = createAsyncThunk(
  'achievements/claimAchievement',
  async (id: number) => {
    return await ApiService.claimAchievement(id);
  }
);

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAchievements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.achievements = action.payload;
        state.error = null;
      })
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch achievements';
      })
      
      .addCase(fetchUnlockedAchievements.fulfilled, (state, action) => {
        state.unlockedAchievements = action.payload;
      })
      
      .addCase(fetchAvailableAchievements.fulfilled, (state, action) => {
        state.availableAchievements = action.payload;
      })
      
      .addCase(claimAchievement.fulfilled, (state, action) => {
        const index = state.availableAchievements.findIndex(a => a.id === action.payload.id);
        if (index !== -1) {
          state.availableAchievements.splice(index, 1);
          state.unlockedAchievements.push(action.payload);
        }
        const allIndex = state.achievements.findIndex(a => a.id === action.payload.id);
        if (allIndex !== -1) {
          state.achievements[allIndex] = action.payload;
        }
      });
  },
});

export const { clearError } = achievementsSlice.actions;
export default achievementsSlice.reducer;