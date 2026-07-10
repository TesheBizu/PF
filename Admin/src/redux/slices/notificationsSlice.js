import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.patch('/notifications/read-all');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/notifications/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], totalUnread: 0, loading: false, error: null },
  reducers: {
    notificationRealtimeNew(state, action) {
      state.items.unshift(action.payload);
      state.totalUnread += 1;
    },
    notificationRealtimeRead(state, action) {
      const idx = state.items.findIndex((n) => n._id === action.payload._id);
      if (idx !== -1) state.items[idx].isRead = true;
      state.totalUnread = Math.max(0, state.totalUnread - 1);
    },
    notificationRealtimeAllRead(state) {
      state.items.forEach((n) => { n.isRead = true; });
      state.totalUnread = 0;
    },
    notificationRealtimeDeleted(state, action) {
      state.items = state.items.filter((n) => n._id !== action.payload);
    },
    notificationUnreadCountChanged(state, action) {
      state.totalUnread = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.totalUnread = action.payload.totalUnread;
      })
      .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const idx = state.items.findIndex((n) => n._id === action.payload._id);
        if (idx !== -1) state.items[idx].isRead = true;
        state.totalUnread = Math.max(0, state.totalUnread - 1);
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
        state.totalUnread = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.items = state.items.filter((n) => n._id !== action.payload);
      });
  },
});

export const {
  notificationRealtimeNew,
  notificationRealtimeRead,
  notificationRealtimeAllRead,
  notificationRealtimeDeleted,
  notificationUnreadCountChanged,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
