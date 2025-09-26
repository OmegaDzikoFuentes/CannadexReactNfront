// src/store/slices/battlesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../services/api';
import { Battle } from '../../types';

interface BattlesState {
  battles: Battle[];
  pendingBattles: Battle[];
  activeBattles: Battle[];
  completedBattles: Battle[];
  currentBattle: Battle | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BattlesState = {
  battles: [],
  pendingBattles: [],
  activeBattles: [],
  completedBattles: [],
  currentBattle: null,
  isLoading: false,
  error: null,
};

export const fetchBattles = createAsyncThunk(
  'battles/fetchBattles',
  async () => {
    return await ApiService.getBattles();
  }
);

export const fetchPendingBattles = createAsyncThunk(
  'battles/fetchPendingBattles',
  async () => {
    return await ApiService.getPendingBattles();
  }
);

export const fetchActiveBattles = createAsyncThunk(
  'battles/fetchActiveBattles',
  async () => {
    return await ApiService.getActiveBattles();
  }
);

export const fetchCompletedBattles = createAsyncThunk(
  'battles/fetchCompletedBattles',
  async () => {
    return await ApiService.getCompletedBattles();
  }
);

export const fetchBattle = createAsyncThunk(
  'battles/fetchBattle',
  async (id: number) => {
    return await ApiService.getBattle(id);
  }
);

export const createBattle = createAsyncThunk(
  'battles/createBattle',
  async (data: { opponent_id: number; strains: number[] }) => {
    return await ApiService.createBattle(data);
  }
);

export const acceptBattle = createAsyncThunk(
  'battles/acceptBattle',
  async (id: number) => {
    return await ApiService.acceptBattle(id);
  }
);

export const declineBattle = createAsyncThunk(
  'battles/declineBattle',
  async (id: number) => {
    return await ApiService.declineBattle(id);
  }
);

export const cancelBattle = createAsyncThunk(
  'battles/cancelBattle',
  async (id: number) => {
    await ApiService.cancelBattle(id);
    return id;
  }
);

const battlesSlice = createSlice({
  name: 'battles',
  initialState,
  reducers: {
    clearCurrentBattle: (state) => {
      state.currentBattle = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBattles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBattles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.battles = action.payload;
        state.error = null;
      })
      .addCase(fetchBattles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch battles';
      })
      
      .addCase(fetchPendingBattles.fulfilled, (state, action) => {
        state.pendingBattles = action.payload;
      })
      
      .addCase(fetchActiveBattles.fulfilled, (state, action) => {
        state.activeBattles = action.payload;
      })
      
      .addCase(fetchCompletedBattles.fulfilled, (state, action) => {
        state.completedBattles = action.payload;
      })
      
      .addCase(fetchBattle.fulfilled, (state, action) => {
        state.currentBattle = action.payload;
      })
      
      .addCase(createBattle.fulfilled, (state, action) => {
        state.battles.push(action.payload);
      })
      
      .addCase(acceptBattle.fulfilled, (state, action) => {
        const index = state.pendingBattles.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.pendingBattles.splice(index, 1);
          state.activeBattles.push(action.payload);
        }
        if (state.currentBattle?.id === action.payload.id) {
          state.currentBattle = action.payload;
        }
      })
      
      .addCase(declineBattle.fulfilled, (state, action) => {
        const index = state.pendingBattles.findIndex(b => b.id === action.payload.id);
        if (index !== -1) {
          state.pendingBattles.splice(index, 1);
        }
        if (state.currentBattle?.id === action.payload.id) {
          state.currentBattle = action.payload;
        }
      })
      
      .addCase(cancelBattle.fulfilled, (state, action) => {
        state.battles = state.battles.filter(b => b.id !== action.payload);
        state.pendingBattles = state.pendingBattles.filter(b => b.id !== action.payload);
        state.activeBattles = state.activeBattles.filter(b => b.id !== action.payload);
        if (state.currentBattle?.id === action.payload) {
          state.currentBattle = null;
        }
      });
  },
});

export const { clearCurrentBattle, clearError } = battlesSlice.actions;
export default battlesSlice.reducer;