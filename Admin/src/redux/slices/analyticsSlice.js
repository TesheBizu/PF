import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAnalytics = createAsyncThunk('analytics/fetch', async (days = 30, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/analytics?days=${days}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: { summary: null, entries: [], pageViewsByPage: {}, totalDays: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.entries = action.payload.entries;
        state.pageViewsByPage = action.payload.pageViewsByPage;
        state.totalDays = action.payload.totalDays;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default analyticsSlice.reducer;
