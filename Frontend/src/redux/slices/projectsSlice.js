import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/projects');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearProjectError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProjects.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearProjectError } = projectsSlice.actions;
export default projectsSlice.reducer;
