// apps/web/src/store/slices/notificationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/notificationService';

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ page = 1, limit = 20, type = 'all' }, { rejectWithValue }) => {
    try {
      const response = await notificationService.getNotifications(page, limit, type);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationService.markAllAsRead();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    loading: {
      notifications: false,
      marking: false,
      deleting: false,
    },
    error: null,
    hasMore: true,
    page: 1,
    total: 0,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
      state.total += 1;
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      state.items = state.items.filter(notification => notification.id !== notificationId);
      state.total -= 1;
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.total = 0;
      state.page = 1;
      state.hasMore = true;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    resetUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    addMultipleNotifications: (state, action) => {
      const newNotifications = action.payload.filter(
        newNotif => !state.items.some(existingNotif => existingNotif.id === newNotif.id)
      );
      
      state.items = [...newNotifications, ...state.items];
      state.unreadCount += newNotifications.length;
      state.total += newNotifications.length;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading.notifications = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading.notifications = false;
        
        if (action.meta.arg.page === 1) {
          // First page: replace all notifications
          state.items = action.payload.notifications || action.payload;
        } else {
          // Additional page: append to existing notifications
          state.items = [...state.items, ...(action.payload.notifications || action.payload)];
        }
        
        state.page = action.meta.arg.page;
        state.total = action.payload.total || state.items.length;
        state.hasMore = action.payload.hasMore !== undefined 
          ? action.payload.hasMore 
          : state.items.length < state.total;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading.notifications = false;
        state.error = action.payload;
      })
      // Mark as read
      .addCase(markNotificationAsRead.pending, (state) => {
        state.loading.marking = true;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.loading.marking = false;
        
        const notificationIndex = state.items.findIndex(
          notification => notification.id === action.meta.arg
        );
        
        if (notificationIndex !== -1) {
          state.items[notificationIndex].isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.loading.marking = false;
        state.error = action.payload;
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.items = state.items.map(notification => ({ ...notification, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.loading.deleting = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.loading.deleting = false;
        
        state.items = state.items.filter(
          notification => notification.id !== action.meta.arg
        );
        
        state.total = Math.max(0, state.total - 1);
        
        if (action.payload.isRead === false) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(deleteNotification.rejected, (state, action) => {
        state.loading.deleting = false;
        state.error = action.payload;
      });
  },
});

export const { 
  addNotification, 
  removeNotification, 
  clearNotifications, 
  incrementUnreadCount, 
  resetUnreadCount,
  addMultipleNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;