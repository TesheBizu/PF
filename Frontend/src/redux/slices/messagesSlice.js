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

const messagesSlice = createSlice({
  name: 'messages',
  initialState: { items: [], loading: false, error: null, sent: false },
  reducers: {
    resetSent(state) { state.sent = false; },
    clearMessageError(state) { state.error = null; },
    messageReceived(state, action) { state.items.push(action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => { state.loading = true; state.error = null; state.sent = false; })
      .addCase(sendMessage.fulfilled, (state) => { state.loading = false; state.sent = true; })
      .addCase(sendMessage.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { resetSent, clearMessageError, messageReceived } = messagesSlice.actions;
export default messagesSlice.reducer;
