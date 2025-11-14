// apps/web/src/store/slices/videoCallSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { videoCallService } from '../../services/videoCallService';

// Async thunks
export const createVideoCall = createAsyncThunk(
  'videoCall/create',
  async ({ calleeId, callType = 'video' }, { rejectWithValue }) => {
    try {
      const response = await videoCallService.createCall({ calleeId, callType });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const joinVideoCall = createAsyncThunk(
  'videoCall/join',
  async (callId, { rejectWithValue }) => {
    try {
      const response = await videoCallService.joinCall(callId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const endVideoCall = createAsyncThunk(
  'videoCall/end',
  async (callId, { rejectWithValue }) => {
    try {
      const response = await videoCallService.endCall(callId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchVideoCallHistory = createAsyncThunk(
  'videoCall/fetchHistory',
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await videoCallService.getCallHistory(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const videoCallSlice = createSlice({
  name: 'videoCall',
  initialState: {
    currentCall: null,
    callHistory: [],
    activeCall: null,
    incomingCall: null,
    callStatus: 'idle', // idle, connecting, in-call, ended
    callError: null,
    loading: {
      creating: false,
      joining: false,
      ending: false,
      history: false,
    },
    hasMoreHistory: true,
    historyPage: 1,
    localStream: null,
    remoteStream: null,
    isAudioMuted: false,
    isVideoMuted: false,
    isScreenSharing: false,
  },
  reducers: {
    setCurrentCall: (state, action) => {
      state.currentCall = action.payload;
    },
    setActiveCall: (state, action) => {
      state.activeCall = action.payload;
      if (action.payload) {
        state.callStatus = 'in-call';
      }
    },
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
      if (action.payload) {
        state.callStatus = 'incoming';
      }
    },
    startCall: (state) => {
      state.callStatus = 'connecting';
      state.callError = null;
    },
    endCall: (state) => {
      state.callStatus = 'ended';
      state.activeCall = null;
      state.incomingCall = null;
      state.currentCall = null;
      state.localStream = null;
      state.remoteStream = null;
    },
    setLocalStream: (state, action) => {
      state.localStream = action.payload;
    },
    setRemoteStream: (state, action) => {
      state.remoteStream = action.payload;
    },
    toggleAudio: (state) => {
      state.isAudioMuted = !state.isAudioMuted;
    },
    toggleVideo: (state) => {
      state.isVideoMuted = !state.isVideoMuted;
    },
    setIsScreenSharing: (state, action) => {
      state.isScreenSharing = action.payload;
    },
    clearCallError: (state) => {
      state.callError = null;
    },
    clearVideoCallState: (state) => {
      state.currentCall = null;
      state.activeCall = null;
      state.incomingCall = null;
      state.callStatus = 'idle';
      state.callError = null;
      state.localStream = null;
      state.remoteStream = null;
      state.isAudioMuted = false;
      state.isVideoMuted = false;
      state.isScreenSharing = false;
    },
    addToCallHistory: (state, action) => {
      state.callHistory.unshift(action.payload);
    },
    clearIncomingCall: (state) => {
      state.incomingCall = null;
      state.callStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // Create video call
      .addCase(createVideoCall.pending, (state) => {
        state.loading.creating = true;
        state.callError = null;
      })
      .addCase(createVideoCall.fulfilled, (state, action) => {
        state.loading.creating = false;
        state.currentCall = action.payload.call;
        state.callStatus = 'connecting';
      })
      .addCase(createVideoCall.rejected, (state, action) => {
        state.loading.creating = false;
        state.callError = action.payload;
        state.callStatus = 'idle';
      })
      // Join video call
      .addCase(joinVideoCall.pending, (state) => {
        state.loading.joining = true;
        state.callError = null;
      })
      .addCase(joinVideoCall.fulfilled, (state, action) => {
        state.loading.joining = false;
        state.activeCall = action.payload.call;
        state.callStatus = 'in-call';
      })
      .addCase(joinVideoCall.rejected, (state, action) => {
        state.loading.joining = false;
        state.callError = action.payload;
        state.callStatus = 'idle';
      })
      // End video call
      .addCase(endVideoCall.pending, (state) => {
        state.loading.ending = true;
      })
      .addCase(endVideoCall.fulfilled, (state, action) => {
        state.loading.ending = false;
        state.callStatus = 'ended';
        state.activeCall = null;
        state.currentCall = null;
        state.localStream = null;
        state.remoteStream = null;
      })
      .addCase(endVideoCall.rejected, (state, action) => {
        state.loading.ending = false;
        state.callError = action.payload;
      })
      // Fetch video call history
      .addCase(fetchVideoCallHistory.pending, (state) => {
        state.loading.history = true;
      })
      .addCase(fetchVideoCallHistory.fulfilled, (state, action) => {
        state.loading.history = false;
        
        if (action.meta.arg.page === 1) {
          state.callHistory = action.payload.calls || action.payload;
        } else {
          state.callHistory = [...state.callHistory, ...(action.payload.calls || action.payload)];
        }
        
        state.historyPage = action.meta.arg.page;
        state.hasMoreHistory = action.payload.hasMore !== undefined 
          ? action.payload.hasMore 
          : false;
      })
      .addCase(fetchVideoCallHistory.rejected, (state, action) => {
        state.loading.history = false;
        state.callError = action.payload;
      });
  },
});

export const { 
  setCurrentCall,
  setActiveCall,
  setIncomingCall,
  startCall,
  endCall,
  setLocalStream,
  setRemoteStream,
  toggleAudio,
  toggleVideo,
  setIsScreenSharing,
  clearCallError,
  clearVideoCallState,
  addToCallHistory,
  clearIncomingCall
} = videoCallSlice.actions;

export default videoCallSlice.reducer;