import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPublishedTestimonials = createAsyncThunk('testimonials/fetchPublished', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/testimonials/published');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch testimonials');
  }
});

const testimonialsSlice = createSlice({
  name: 'testimonials',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    testimonialAdded(state, action) {
      if (action.payload.published && !state.items.find((t) => t._id === action.payload._id)) {
        state.items.push(action.payload);
      }
    },
    testimonialUpdated(state, action) {
      const idx = state.items.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) {
        if (action.payload.published) state.items[idx] = action.payload;
        else state.items.splice(idx, 1);
      } else if (action.payload.published) {
        state.items.push(action.payload);
      }
    },
    testimonialRemoved(state, action) {
      state.items = state.items.filter((t) => t._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublishedTestimonials.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPublishedTestimonials.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPublishedTestimonials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { testimonialAdded, testimonialUpdated, testimonialRemoved } = testimonialsSlice.actions;
export default testimonialsSlice.reducer;
