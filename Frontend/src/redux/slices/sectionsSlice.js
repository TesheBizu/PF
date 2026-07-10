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

export const SECTIONS_LIST = [
  { id: 'hero', label: 'Hero / Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'contact', label: 'Contact' },
  { id: 'footer', label: 'Footer' },
];

const sectionsSlice = createSlice({
  name: 'sections',
  initialState: { items: {}, loading: false, order: [] },
  reducers: {
    sectionRealtimeUpdated(state, action) {
      state.items[action.payload.key] = action.payload.value;
    },
    setSectionOrder(state, action) {
      state.order = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllSections.pending, (state) => { state.loading = true; })
      .addCase(fetchAllSections.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        if (action.payload.section_order) {
          state.order = action.payload.section_order;
        }
      })
      .addCase(fetchAllSections.rejected, (state) => { state.loading = false; });
  },
});

export const { sectionRealtimeUpdated, setSectionOrder } = sectionsSlice.actions;
export default sectionsSlice.reducer;
