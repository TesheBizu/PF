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

export const fetchAnalyticsDetail = createAsyncThunk('analytics/fetchDetail', async ({ days = 30, type } = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/analytics/detail?days=${days}${type ? `&type=${type}` : ''}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const initialState = {
  summary: null,
  entries: [],
  pageViewsByPage: {},
  trafficSources: {},
  devices: {},
  browsers: {},
  geo: {},
  totalDays: 0,
  trends: null,
  spikes: [],
  detailData: null,
  loading: false,
  detailLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearDetail(state) { state.detailData = null; },
    realtimeAnalyticsUpdate(state, action) {
      const payload = action.payload;
      const evtType = payload.type || payload?.data?.type;
      if (!state.summary) return;
      switch (evtType) {
        case 'visit':
          state.summary.visitors = (state.summary.visitors || 0) + 1;
          if (payload.isNewVisitor) state.summary.uniqueUsers = (state.summary.uniqueUsers || 0) + 1;
          break;
        case 'pageview':
          state.summary.pageViews = (state.summary.pageViews || 0) + 1;
          if (payload.page && state.pageViewsByPage) {
            state.pageViewsByPage[payload.page] = (state.pageViewsByPage[payload.page] || 0) + 1;
          }
          break;
        case 'interaction':
          state.summary.interactions = (state.summary.interactions || 0) + 1;
          break;
        case 'socialClick':
          state.summary.socialLinkClicks = (state.summary.socialLinkClicks || 0) + 1;
          break;
        case 'contactSubmission':
          state.summary.contactSubmissions = (state.summary.contactSubmissions || 0) + 1;
          break;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
        state.entries = action.payload.entries;
        state.pageViewsByPage = action.payload.pageViewsByPage || {};
        state.trafficSources = action.payload.trafficSources || {};
        state.devices = action.payload.devices || {};
        state.browsers = action.payload.browsers || {};
        state.geo = action.payload.geo || {};
        state.totalDays = action.payload.totalDays;
        state.trends = action.payload.trends;
        state.spikes = action.payload.spikes || [];
      })
      .addCase(fetchAnalytics.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAnalyticsDetail.pending, (state) => { state.detailLoading = true; })
      .addCase(fetchAnalyticsDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.detailData = action.payload.data;
      })
      .addCase(fetchAnalyticsDetail.rejected, (state) => { state.detailLoading = false; });
  },
});

export const { clearDetail, realtimeAnalyticsUpdate } = analyticsSlice.actions;
export default analyticsSlice.reducer;
