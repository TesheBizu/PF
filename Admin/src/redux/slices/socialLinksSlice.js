import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSocialLinks = createAsyncThunk('socialLinks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/social-links');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const createSocialLink = createAsyncThunk('socialLinks/create', async (linkData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/social-links', linkData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const updateSocialLink = createAsyncThunk('socialLinks/update', async ({ id, linkData }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/social-links/${id}`, linkData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const reorderSocialLinks = createAsyncThunk('socialLinks/reorder', async (links, { rejectWithValue }) => {
  try {
    const { data } = await api.put('/social-links/reorder', { links });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

export const deleteSocialLink = createAsyncThunk('socialLinks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/social-links/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed');
  }
});

const socialLinksSlice = createSlice({
  name: 'socialLinks',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    socialLinkRealtimeAdded(state, action) {
      if (!state.items.some((l) => l._id === action.payload._id)) state.items.push(action.payload);
    },
    socialLinkRealtimeUpdated(state, action) {
      const idx = state.items.findIndex((l) => l._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    socialLinkRealtimeRemoved(state, action) {
      state.items = state.items.filter((l) => l._id !== action.payload);
    },
    socialLinksRealtimeReordered(state, action) {
      state.items = action.payload;
    },
    setItems(state, action) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocialLinks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSocialLinks.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchSocialLinks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createSocialLink.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateSocialLink.fulfilled, (state, action) => {
        const idx = state.items.findIndex((l) => l._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(reorderSocialLinks.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(deleteSocialLink.fulfilled, (state, action) => {
        state.items = state.items.filter((l) => l._id !== action.payload);
      });
  },
});

export const {
  socialLinkRealtimeAdded,
  socialLinkRealtimeUpdated,
  socialLinkRealtimeRemoved,
  socialLinksRealtimeReordered,
  setItems,
} = socialLinksSlice.actions;
export default socialLinksSlice.reducer;
