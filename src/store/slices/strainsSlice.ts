// src/store/slices/strainsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../services/api';
import { Strain, Category } from '../../types';

interface StrainsState {
  strains: Strain[];
  categories: Category[];
  currentStrain: Strain | null;
  popularStrains: Strain[];
  isLoading: boolean;
  error: string | null;
}

const initialState: StrainsState = {
  strains: [],
  categories: [],
  currentStrain: null,
  popularStrains: [],
  isLoading: false,
  error: null,
};

export const fetchStrains = createAsyncThunk(
  'strains/fetchStrains',
  async (params?: { category_id?: number; search?: string; page?: number }) => {
    return await ApiService.getStrains(params);
  }
);

export const fetchStrain = createAsyncThunk(
  'strains/fetchStrain',
  async (id: number) => {
    return await ApiService.getStrain(id);
  }
);

export const fetchCategories = createAsyncThunk(
  'strains/fetchCategories',
  async () => {
    return await ApiService.getCategories();
  }
);

export const fetchPopularStrains = createAsyncThunk(
  'strains/fetchPopularStrains',
  async () => {
    return await ApiService.getPopularStrains();
  }
);

export const searchStrains = createAsyncThunk(
  'strains/searchStrains',
  async (query: string) => {
    return await ApiService.searchStrains(query);
  }
);

const strainsSlice = createSlice({
  name: 'strains',
  initialState,
  reducers: {
    clearCurrentStrain: (state) => {
      state.currentStrain = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStrains.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStrains.fulfilled, (state, action) => {
        state.isLoading = false;
        state.strains = action.payload;
        state.error = null;
      })
      .addCase(fetchStrains.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch strains';
      })
      
      .addCase(fetchStrain.fulfilled, (state, action) => {
        state.currentStrain = action.payload;
      })
      
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      
      .addCase(fetchPopularStrains.fulfilled, (state, action) => {
        state.popularStrains = action.payload;
      })
      
      .addCase(searchStrains.fulfilled, (state, action) => {
        state.strains = action.payload;
      });
  },
});

export const { clearCurrentStrain, clearError } = strainsSlice.actions;
export default strainsSlice.reducer;
