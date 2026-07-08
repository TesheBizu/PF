import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const sendMessage = createAsyncThunk(
  'messages/send',
  async (messageData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/messages', messageData);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to send message');
    }
  }
);

export const fetchMessages = createAsyncThunk(
  'messages/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/messages');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

export const markMessageRead = createAsyncThunk(
  'messages/markRead',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/messages/${id}/read`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update message');
    }
  }
);

export const deleteMessage = createAsyncThunk(
  'messages/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/messages/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete message');
    }
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: { items: [], loading: false, error: null, sent: false },
  reducers: {
    resetSent(state) { state.sent = false; },
    clearMessageError(state) { state.error = null; },
    messageRealtimeReceived(state, action) {
      if (!state.items.some((m) => m._id === action.payload._id)) {
        state.items.unshift(action.payload);
      }
    },
    messageRealtimeRead(state, action) {
      const idx = state.items.findIndex((m) => m._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    messageRealtimeDeleted(state, action) {
      state.items = state.items.filter((m) => m._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => { state.loading = true; state.error = null; state.sent = false; })
      .addCase(sendMessage.fulfilled, (state) => { state.loading = false; state.sent = true; })
      .addCase(sendMessage.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMessages.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMessages.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchMessages.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(markMessageRead.fulfilled, (state, action) => {
        const idx = state.items.findIndex((m) => m._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteMessage.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m._id !== action.payload);
      });
  },
});

export const { resetSent, clearMessageError, messageRealtimeReceived, messageRealtimeRead, messageRealtimeDeleted } = messagesSlice.actions;
export default messagesSlice.reducer;
