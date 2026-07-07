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

export const createSkill = createAsyncThunk(
  'skills/create',
  async (skillData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/skills', skillData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create skill');
    }
  }
);

export const updateSkill = createAsyncThunk(
  'skills/update',
  async ({ id, skillData }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/skills/${id}`, skillData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update skill');
    }
  }
);

export const deleteSkill = createAsyncThunk(
  'skills/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/skills/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete skill');
    }
  }
);

const skillsSlice = createSlice({
  name: 'skills',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearSkillError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSkills.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchSkills.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createSkill.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateSkill.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.items = state.items.filter((s) => s._id !== action.payload);
      });
  },
});

export const { clearSkillError } = skillsSlice.actions;
export default skillsSlice.reducer;
