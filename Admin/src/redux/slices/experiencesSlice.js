import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchExperiences = createAsyncThunk(
  'experiences/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/experiences');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch experiences');
    }
  }
);

export const createExperience = createAsyncThunk(
  'experiences/create',
  async (expData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/experiences', expData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create experience');
    }
  }
);

export const updateExperience = createAsyncThunk(
  'experiences/update',
  async ({ id, expData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/experiences/${id}`, expData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update experience');
    }
  }
);

export const deleteExperience = createAsyncThunk(
  'experiences/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/experiences/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete experience');
    }
  }
);

const experiencesSlice = createSlice({
  name: 'experiences',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearExperienceError(state) { state.error = null; },
    experienceRealtimeAdded(state, action) {
      if (!state.items.some((e) => e._id === action.payload._id)) {
        state.items.push(action.payload);
      }
    },
    experienceRealtimeUpdated(state, action) {
      const idx = state.items.findIndex((e) => e._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    experienceRealtimeRemoved(state, action) {
      state.items = state.items.filter((e) => e._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExperiences.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExperiences.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchExperiences.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createExperience.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateExperience.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteExperience.fulfilled, (state, action) => {
        state.items = state.items.filter((e) => e._id !== action.payload);
      });
  },
});

export const { clearExperienceError, experienceRealtimeAdded, experienceRealtimeUpdated, experienceRealtimeRemoved } = experiencesSlice.actions;
export default experiencesSlice.reducer;
