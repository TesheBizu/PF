import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchAllSections = createAsyncThunk('sections/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/sections');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch sections');
  }
});

export const updateSection = createAsyncThunk('sections/update', async ({ key, value }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/sections/${key}`, { value });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update section');
  }
});

const sectionsSlice = createSlice({
  name: 'sections',
  initialState: { items: {}, loading: false, error: null },
  reducers: {
    sectionRealtimeUpdated(state, action) {
      state.items[action.payload.key] = action.payload.value;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSections.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchAllSections.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllSections.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(updateSection.fulfilled, (state, action) => {
        state.items[action.payload.key] = action.payload.value;
      });
  },
});

export const { sectionRealtimeUpdated } = sectionsSlice.actions;
export default sectionsSlice.reducer;
