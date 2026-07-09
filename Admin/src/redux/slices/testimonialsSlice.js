import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTestimonials = createAsyncThunk(
  'testimonials/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/testimonials');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch testimonials');
    }
  }
);

export const createTestimonial = createAsyncThunk(
  'testimonials/create',
  async (testimonialData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/testimonials', testimonialData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create testimonial');
    }
  }
);

export const updateTestimonial = createAsyncThunk(
  'testimonials/update',
  async ({ id, testimonialData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/testimonials/${id}`, testimonialData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update testimonial');
    }
  }
);

export const deleteTestimonial = createAsyncThunk(
  'testimonials/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/testimonials/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete testimonial');
    }
  }
);

const testimonialsSlice = createSlice({
  name: 'testimonials',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearTestimonialError(state) { state.error = null; },
    testimonialRealtimeAdded(state, action) {
      if (!state.items.some((t) => t._id === action.payload._id)) {
        state.items.push(action.payload);
      }
    },
    testimonialRealtimeUpdated(state, action) {
      const idx = state.items.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    testimonialRealtimeRemoved(state, action) {
      state.items = state.items.filter((t) => t._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestimonials.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTestimonials.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchTestimonials.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createTestimonial.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateTestimonial.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTestimonial.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      });
  },
});

export const {
  clearTestimonialError,
  testimonialRealtimeAdded,
  testimonialRealtimeUpdated,
  testimonialRealtimeRemoved,
} = testimonialsSlice.actions;
export default testimonialsSlice.reducer;
