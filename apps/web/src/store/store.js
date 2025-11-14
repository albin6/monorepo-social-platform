// apps/web/src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import chatReducer from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';
import friendReducer from './slices/friendSlice';
import videoCallReducer from './slices/videoCallSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    chat: chatReducer,
    notifications: notificationReducer,
    friends: friendReducer,
    videoCall: videoCallReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;