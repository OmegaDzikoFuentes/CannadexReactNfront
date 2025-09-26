// src/store/slices/friendsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../services/api';
import { User, Friendship } from '../../types';

interface FriendsState {
  friends: User[];
  pendingRequests: Friendship[];
  sentRequests: Friendship[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FriendsState = {
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  isLoading: false,
  error: null,
};

export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async () => {
    return await ApiService.getFriends();
  }
);

export const fetchPendingRequests = createAsyncThunk(
  'friends/fetchPendingRequests',
  async () => {
    return await ApiService.getPendingRequests();
  }
);

export const fetchSentRequests = createAsyncThunk(
  'friends/fetchSentRequests',
  async () => {
    return await ApiService.getSentRequests();
  }
);

export const sendFriendRequest = createAsyncThunk(
  'friends/sendFriendRequest',
  async (userId: number) => {
    return await ApiService.sendFriendRequest(userId);
  }
);

export const acceptFriendRequest = createAsyncThunk(
  'friends/acceptFriendRequest',
  async (id: number) => {
    return await ApiService.acceptFriendRequest(id);
  }
);

export const declineFriendRequest = createAsyncThunk(
  'friends/declineFriendRequest',
  async (id: number) => {
    return await ApiService.declineFriendRequest(id);
  }
);

export const removeFriend = createAsyncThunk(
  'friends/removeFriend',
  async (id: number) => {
    await ApiService.removeFriend(id);
    return id;
  }
);

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFriends.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.isLoading = false;
        state.friends = action.payload;
        state.error = null;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch friends';
      })
      
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.pendingRequests = action.payload;
      })
      
      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.sentRequests = action.payload;
      })
      
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.sentRequests.push(action.payload);
      })
      
      .addCase(acceptFriendRequest.fulfilled, (state, action) => {
        const index = state.pendingRequests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.pendingRequests.splice(index, 1);
        }
        state.friends.push(action.payload.friend);
      })
      
      .addCase(declineFriendRequest.fulfilled, (state, action) => {
        const index = state.pendingRequests.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.pendingRequests.splice(index, 1);
        }
      })
      
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(f => f.id !== action.payload);
      });
  },
});

export const { clearError } = friendsSlice.actions;
export default friendsSlice.reducer;