import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchProfileImage = createAsyncThunk('siteSettings/fetchProfileImage', async () => {
  const { data } = await api.get('/settings/profile-image');
  return data.url;
});

export const updateProfileImage = createAsyncThunk('siteSettings/updateProfileImage', async (url) => {
  const { data } = await api.put('/settings/profile-image', { url });
  return data.url;
});

export const deleteProfileImage = createAsyncThunk('siteSettings/deleteProfileImage', async () => {
  await api.delete('/settings/profile-image');
  return null;
});

const siteSettingsSlice = createSlice({
  name: 'siteSettings',
  initialState: { profileImageUrl: null, loading: false, error: null },
  reducers: {
    profileImageUpdated(state, action) { state.profileImageUrl = action.payload; },
    profileImageDeleted(state) { state.profileImageUrl = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileImage.fulfilled, (state, action) => { state.profileImageUrl = action.payload; })
      .addCase(updateProfileImage.fulfilled, (state, action) => { state.profileImageUrl = action.payload; })
      .addCase(deleteProfileImage.fulfilled, (state) => { state.profileImageUrl = null; });
  },
});

export const { profileImageUpdated, profileImageDeleted } = siteSettingsSlice.actions;
export default siteSettingsSlice.reducer;
