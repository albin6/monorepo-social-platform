// apps/web/src/store/slices/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { chatService } from '../../services/chatService';

// Async thunks
export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getConversations();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({ conversationId, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const response = await chatService.getMessages(conversationId, page, limit);
      return { conversationId, messages: response.data.messages, hasMore: response.data.hasMore };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ conversationId, content, type = 'text' }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(conversationId, { content, type });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async ({ participants, name = null }, { rejectWithValue }) => {
    try {
      const response = await chatService.createConversation({ participants, name });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    messages: {}, // { conversationId: [messages] }
    currentConversation: null,
    loading: {
      conversations: false,
      messages: {},
      sending: false,
    },
    error: null,
    hasMoreMessages: {},
  },
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(message);
    },
    updateMessageStatus: (state, action) => {
      const { conversationId, messageId, status } = action.payload;
      if (state.messages[conversationId]) {
        const messageIndex = state.messages[conversationId].findIndex(msg => msg.id === messageId);
        if (messageIndex !== -1) {
          state.messages[conversationId][messageIndex].status = status;
        }
      }
    },
    clearChat: (state) => {
      state.conversations = [];
      state.messages = {};
      state.currentConversation = null;
      state.hasMoreMessages = {};
    },
    setHasMoreMessages: (state, action) => {
      const { conversationId, hasMore } = action.payload;
      state.hasMoreMessages[conversationId] = hasMore;
    },
    loadMoreMessages: (state, action) => {
      const { conversationId, messages } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      // Add new messages to the beginning of the existing messages
      state.messages[conversationId] = [...messages, ...state.messages[conversationId]];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading.conversations = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading.conversations = false;
        state.conversations = action.payload.conversations || action.payload;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading.conversations = false;
        state.error = action.payload;
      })
      // Fetch messages
      .addCase(fetchMessages.pending, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        state.loading.messages[conversationId] = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages, hasMore } = action.payload;
        state.loading.messages[conversationId] = false;
        
        // Store messages, preserving existing ones if loading more
        state.messages[conversationId] = [...messages];
        state.hasMoreMessages[conversationId] = hasMore;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const conversationId = action.meta.arg.conversationId;
        state.loading.messages[conversationId] = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.loading.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading.sending = false;
        
        // Add the message to the appropriate conversation
        const { conversationId, message } = action.payload;
        if (!state.messages[conversationId]) {
          state.messages[conversationId] = [];
        }
        state.messages[conversationId].push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading.sending = false;
        state.error = action.payload;
      })
      // Create conversation
      .addCase(createConversation.fulfilled, (state, action) => {
        state.conversations.unshift(action.payload);
      });
  },
});

export const { 
  setCurrentConversation, 
  addMessage, 
  updateMessageStatus, 
  clearChat, 
  setHasMoreMessages,
  loadMoreMessages
} = chatSlice.actions;

export default chatSlice.reducer;