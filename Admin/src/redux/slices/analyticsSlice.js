import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchOverview = createAsyncThunk('analytics/fetchOverview', async ({ preset = '30days', startDate, endDate } = {}, { rejectWithValue }) => {
  try {
    let url = `/admin/analytics/overview?preset=${preset}`;
    if (preset === 'custom' && startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const { data } = await api.get(url);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch overview');
  }
});

export const fetchRealtime = createAsyncThunk('analytics/fetchRealtime', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/admin/analytics/realtime');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch realtime');
  }
});

export const fetchTraffic = createAsyncThunk('analytics/fetchTraffic', async ({ preset = '30days', startDate, endDate } = {}, { rejectWithValue }) => {
  try {
    let url = `/admin/analytics/traffic?preset=${preset}`;
    if (preset === 'custom' && startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const { data } = await api.get(url);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch traffic');
  }
});

export const fetchPages = createAsyncThunk('analytics/fetchPages', async ({ preset = '30days', startDate, endDate } = {}, { rejectWithValue }) => {
  try {
    let url = `/admin/analytics/pages?preset=${preset}`;
    if (preset === 'custom' && startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const { data } = await api.get(url);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch pages');
  }
});

export const fetchDevices = createAsyncThunk('analytics/fetchDevices', async ({ preset = '30days', startDate, endDate } = {}, { rejectWithValue }) => {
  try {
    let url = `/admin/analytics/devices?preset=${preset}`;
    if (preset === 'custom' && startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const { data } = await api.get(url);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch devices');
  }
});

export const fetchCountries = createAsyncThunk('analytics/fetchCountries', async ({ preset = '30days', startDate, endDate } = {}, { rejectWithValue }) => {
  try {
    let url = `/admin/analytics/countries?preset=${preset}`;
    if (preset === 'custom' && startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const { data } = await api.get(url);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch countries');
  }
});

export const fetchEvents = createAsyncThunk('analytics/fetchEvents', async ({ preset = '30days', startDate, endDate } = {}, { rejectWithValue }) => {
  try {
    let url = `/admin/analytics/events?preset=${preset}`;
    if (preset === 'custom' && startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const { data } = await api.get(url);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch events');
  }
});

export const fetchTrend = createAsyncThunk('analytics/fetchTrend', async ({ preset = '30days', startDate, endDate, metric = 'activeUsers' } = {}, { rejectWithValue }) => {
  try {
    let url = `/admin/analytics/trend?preset=${preset}&metric=${metric}`;
    if (preset === 'custom' && startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;
    const { data } = await api.get(url);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch trend');
  }
});

const initialState = {
  overview: null,
  realtime: null,
  traffic: null,
  pages: null,
  devices: null,
  countries: null,
  events: null,
  trend: null,
  liveStats: null,
  datePreset: '30days',
  customStartDate: '',
  customEndDate: '',
  loading: false,
  realtimeLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setDatePreset(state, action) {
      state.datePreset = action.payload;
    },
    setCustomDateRange(state, action) {
      state.customStartDate = action.payload.startDate;
      state.customEndDate = action.payload.endDate;
    },
    clearAnalytics(state) {
      state.overview = null;
      state.realtime = null;
      state.traffic = null;
      state.pages = null;
      state.devices = null;
      state.countries = null;
      state.events = null;
      state.trend = null;
      state.liveStats = null;
    },
    realtimeStatsReceived(state, action) {
      state.liveStats = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchOverview.fulfilled, (s, a) => { s.loading = false; s.overview = a.payload; })
      .addCase(fetchOverview.rejected, (s, a) => { s.loading = false; s.error = a.payload; })

      .addCase(fetchRealtime.pending, (s) => { s.realtimeLoading = true; })
      .addCase(fetchRealtime.fulfilled, (s, a) => { s.realtimeLoading = false; s.realtime = a.payload; })
      .addCase(fetchRealtime.rejected, (s) => { s.realtimeLoading = false; })

      .addCase(fetchTraffic.fulfilled, (s, a) => { s.traffic = a.payload; })
      .addCase(fetchPages.fulfilled, (s, a) => { s.pages = a.payload; })
      .addCase(fetchDevices.fulfilled, (s, a) => { s.devices = a.payload; })
      .addCase(fetchCountries.fulfilled, (s, a) => { s.countries = a.payload; })
      .addCase(fetchEvents.fulfilled, (s, a) => { s.events = a.payload; })
      .addCase(fetchTrend.fulfilled, (s, a) => { s.trend = a.payload; });
  },
});

export const { setDatePreset, setCustomDateRange, clearAnalytics, realtimeStatsReceived } = analyticsSlice.actions;
export default analyticsSlice.reducer;
