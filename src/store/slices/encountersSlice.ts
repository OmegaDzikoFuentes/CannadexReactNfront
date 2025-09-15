// src/store/slices/encountersSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../services/api';
import { Encounter } from '../../types';

interface EncountersState {
  encounters: Encounter[];
  publicFeed: Encounter[];
  friendsFeed: Encounter[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EncountersState = {
  encounters: [],
  publicFeed: [],
  friendsFeed: [],
  isLoading: false,
  error: null,
};

export const createEncounter = createAsyncThunk(
  'encounters/create',
  async (encounterData: any) => {
    return await ApiService.createEncounter(encounterData);
  }
);

export const fetchEncounters = createAsyncThunk(
  'encounters/fetchEncounters',
  async (params?: { user_id?: number; strain_id?: number }) => {
    return await ApiService.getEncounters(params);
  }
);

export const fetchPublicFeed = createAsyncThunk(
  'encounters/fetchPublicFeed',
  async () => {
    return await ApiService.getPublicFeed();
  }
);

export const fetchFriendsFeed = createAsyncThunk(
  'encounters/fetchFriendsFeed',
  async () => {
    return await ApiService.getFriendsFeed();
  }
);

export const updateEncounter = createAsyncThunk(
  'encounters/update',
  async ({ id, data }: { id: number; data: Partial<Encounter> }) => {
    return await ApiService.updateEncounter(id, data);
  }
);

export const deleteEncounter = createAsyncThunk(
  'encounters/delete',
  async (id: number) => {
    await ApiService.deleteEncounter(id);
    return id;
  }
);

const encountersSlice = createSlice({
  name: 'encounters',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEncounter.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEncounter.fulfilled, (state, action) => {
        state.isLoading = false;
        state.encounters.unshift(action.payload);
        state.error = null;
      })
      .addCase(createEncounter.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create encounter';
      })
      
      .addCase(fetchEncounters.fulfilled, (state, action) => {
        state.encounters = action.payload;
      })
      
      .addCase(fetchPublicFeed.fulfilled, (state, action) => {
        state.publicFeed = action.payload;
      })
      
      .addCase(fetchFriendsFeed.fulfilled, (state, action) => {
        state.friendsFeed = action.payload;
      })
      
      .addCase(updateEncounter.fulfilled, (state, action) => {
        const index = state.encounters.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          state.encounters[index] = action.payload;
        }
      })
      
      .addCase(deleteEncounter.fulfilled, (state, action) => {
        state.encounters = state.encounters.filter(e => e.id !== action.payload);
      });
  },
});

export const { clearError } = encountersSlice.actions;
export default encountersSlice.reducer;