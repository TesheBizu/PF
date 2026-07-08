import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSkills = createAsyncThunk(
  'skills/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/skills');
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch skills');
    }
  }
);

const skillsSlice = createSlice({
  name: 'skills',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearSkillError(state) { state.error = null; },
    skillAdded(state, action) { state.items.push(action.payload); },
    skillUpdated(state, action) {
      const idx = state.items.findIndex((s) => s._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    skillRemoved(state, action) {
      state.items = state.items.filter((s) => s._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSkills.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchSkills.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearSkillError, skillAdded, skillUpdated, skillRemoved } = skillsSlice.actions;
export default skillsSlice.reducer;
