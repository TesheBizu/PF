import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSocialLinks = createAsyncThunk('socialLinks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/social-links/active');
    return data.data || data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch social links');
  }
});

const socialLinksSlice = createSlice({
  name: 'socialLinks',
  initialState: { items: [], loading: false },
  reducers: {
    socialLinkCreated(state, action) { state.items.push(action.payload); },
    socialLinkUpdated(state, action) {
      const idx = state.items.findIndex((l) => l._id === action.payload._id);
      if (idx >= 0) state.items[idx] = action.payload;
    },
    socialLinkDeleted(state, action) {
      state.items = state.items.filter((l) => l._id !== action.payload);
    },
    socialLinksReordered(state, action) { state.items = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSocialLinks.pending, (state) => { state.loading = true; })
      .addCase(fetchSocialLinks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchSocialLinks.rejected, (state) => { state.loading = false; });
  },
});

export const { socialLinkCreated, socialLinkUpdated, socialLinkDeleted, socialLinksReordered } = socialLinksSlice.actions;
export default socialLinksSlice.reducer;
