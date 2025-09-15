// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../../services/api';
import NotificationService from '../../services/NotificationService';
import { User, AuthResponse } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await ApiService.login(email, password);
    
    // Initialize notifications after login
    await NotificationService.initialize();
    
    return response;
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: {
    first_name: string;
    last_name: string;
    username: string;
    email: string;
    password: string;
    date_of_birth: string;
    phone?: string;
  }) => {
    const response = await ApiService.register(userData);
    
    // Initialize notifications after registration
    await NotificationService.initialize();
    
    return response;
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await ApiService.logout();
    NotificationService.removeListeners();
  }
);

export const loadUserFromStorage = createAsyncThunk(
  'auth/loadFromStorage',
  async () => {
    const token = await AsyncStorage.getItem('auth_token');
    const userData = await AsyncStorage.getItem('user_data');
    
    if (token && userData) {
      const user = JSON.parse(userData);
      
      // Initialize notifications if user is loaded from storage
      await NotificationService.initialize();
      
      return { user, token };
    }
    
    throw new Error('No stored auth data');
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>) => {
    return await ApiService.updateUser(userData);
  }
);

export const verifyAge = createAsyncThunk(
  'auth/verifyAge',
  async (dateOfBirth: string) => {
    return await ApiService.verifyAge(dateOfBirth);
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Registration failed';
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    });

    // Load from storage
    builder
      .addCase(loadUserFromStorage.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(loadUserFromStorage.rejected, (state) => {
        state.isLoading = false;
      });

    // Update profile
    builder
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      });

    // Age verification
    builder
      .addCase(verifyAge.fulfilled, (state, action) => {
        if (state.user) {
          state.user.age_verified = action.payload;
        }
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;