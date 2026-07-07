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

const experiencesSlice = createSlice({
  name: 'experiences',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearExperienceError(state) { state.error = null; },
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
      });
  },
});

export const { clearExperienceError } = experiencesSlice.actions;
export default experiencesSlice.reducer;
