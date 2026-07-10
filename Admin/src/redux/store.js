import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import skillsReducer from './slices/skillsSlice';
import messagesReducer from './slices/messagesSlice';
import experiencesReducer from './slices/experiencesSlice';
import siteSettingsReducer from './slices/siteSettingsSlice';
import testimonialsReducer from './slices/testimonialsSlice';
import sectionsReducer from './slices/sectionsSlice';
import notificationsReducer from './slices/notificationsSlice';
import analyticsReducer from './slices/analyticsSlice';
import socialLinksReducer from './slices/socialLinksSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    skills: skillsReducer,
    messages: messagesReducer,
    experiences: experiencesReducer,
    siteSettings: siteSettingsReducer,
    testimonials: testimonialsReducer,
    sections: sectionsReducer,
    notifications: notificationsReducer,
    analytics: analyticsReducer,
    socialLinks: socialLinksReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});

export default store;
