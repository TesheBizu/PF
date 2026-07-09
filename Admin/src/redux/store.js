import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import skillsReducer from './slices/skillsSlice';
import messagesReducer from './slices/messagesSlice';
import experiencesReducer from './slices/experiencesSlice';
import siteSettingsReducer from './slices/siteSettingsSlice';
import testimonialsReducer from './slices/testimonialsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    skills: skillsReducer,
    messages: messagesReducer,
    experiences: experiencesReducer,
    siteSettings: siteSettingsReducer,
    testimonials: testimonialsReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});

export default store;
