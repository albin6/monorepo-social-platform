// apps/web/src/store/slices/friendSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { friendService } from '../../services/friendService';

// Async thunks
export const fetchFriends = createAsyncThunk(
  'friends/fetchFriends',
  async (_, { rejectWithValue }) => {
    try {
      const response = await friendService.getFriends();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchFriendRequests = createAsyncThunk(
  'friends/fetchFriendRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await friendService.getFriendRequests();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendFriendRequest = createAsyncThunk(
  'friends/sendFriendRequest',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await friendService.sendFriendRequest(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const respondToFriendRequest = createAsyncThunk(
  'friends/respondToFriendRequest',
  async ({ requestId, action }, { rejectWithValue }) => {
    try {
      const response = await friendService.respondToRequest(requestId, action);
      return { requestId, action, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeFriend = createAsyncThunk(
  'friends/removeFriend',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await friendService.removeFriend(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const friendSlice = createSlice({
  name: 'friends',
  initialState: {
    friends: [],
    friendRequests: {
      sent: [],
      received: [],
    },
    loading: {
      friends: false,
      requests: false,
      sending: false,
      responding: false,
    },
    error: null,
  },
  reducers: {
    addFriend: (state, action) => {
      state.friends.push(action.payload);
    },
    removeFriendFromList: (state, action) => {
      state.friends = state.friends.filter(friend => friend.id !== action.payload);
    },
    addFriendRequest: (state, action) => {
      state.friendRequests.received.push(action.payload);
    },
    removeFriendRequest: (state, action) => {
      const { requestId, type } = action.payload; // 'sent' or 'received'
      if (type === 'sent') {
        state.friendRequests.sent = state.friendRequests.sent.filter(req => req.id !== requestId);
      } else {
        state.friendRequests.received = state.friendRequests.received.filter(req => req.id !== requestId);
      }
    },
    clearFriendRequests: (state) => {
      state.friendRequests = {
        sent: [],
        received: [],
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch friends
      .addCase(fetchFriends.pending, (state) => {
        state.loading.friends = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading.friends = false;
        state.friends = action.payload.friends || action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading.friends = false;
        state.error = action.payload;
      })
      // Fetch friend requests
      .addCase(fetchFriendRequests.pending, (state) => {
        state.loading.requests = true;
        state.error = null;
      })
      .addCase(fetchFriendRequests.fulfilled, (state, action) => {
        state.loading.requests = false;
        const { sent = [], received = [] } = action.payload.requests || action.payload || {};
        state.friendRequests = { sent, received };
      })
      .addCase(fetchFriendRequests.rejected, (state, action) => {
        state.loading.requests = false;
        state.error = action.payload;
      })
      // Send friend request
      .addCase(sendFriendRequest.pending, (state) => {
        state.loading.sending = true;
        state.error = null;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.loading.sending = false;
        state.friendRequests.sent.push(action.payload);
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.loading.sending = false;
        state.error = action.payload;
      })
      // Respond to friend request
      .addCase(respondToFriendRequest.pending, (state) => {
        state.loading.responding = true;
        state.error = null;
      })
      .addCase(respondToFriendRequest.fulfilled, (state, action) => {
        state.loading.responding = false;
        
        const { requestId, action: responseAction } = action.payload;
        
        // Remove from received requests
        state.friendRequests.received = state.friendRequests.received.filter(
          req => req.id !== requestId
        );
        
        // If accepted, add to friends list
        if (responseAction === 'accept') {
          state.friends.push(action.payload.data.friend);
        }
      })
      .addCase(respondToFriendRequest.rejected, (state, action) => {
        state.loading.responding = false;
        state.error = action.payload;
      })
      // Remove friend
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.friends = state.friends.filter(friend => friend.id !== action.meta.arg);
      })
      .addCase(removeFriend.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { 
  addFriend, 
  removeFriendFromList, 
  addFriendRequest, 
  removeFriendRequest,
  clearFriendRequests
} = friendSlice.actions;

export default friendSlice.reducer;