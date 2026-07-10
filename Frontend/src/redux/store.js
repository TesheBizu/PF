import { configureStore } from '@reduxjs/toolkit';
import projectsReducer from './slices/projectsSlice';
import skillsReducer from './slices/skillsSlice';
import messagesReducer from './slices/messagesSlice';
import experiencesReducer from './slices/experiencesSlice';
import sectionsReducer from './slices/sectionsSlice';
import socialLinksReducer from './slices/socialLinksSlice';

const store = configureStore({
  reducer: {
    projects: projectsReducer,
    skills: skillsReducer,
    messages: messagesReducer,
    experiences: experiencesReducer,
    sections: sectionsReducer,
    socialLinks: socialLinksReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});

export default store;
