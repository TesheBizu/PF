import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectsReducer from './slices/projectsSlice';
import skillsReducer from './slices/skillsSlice';
import messagesReducer from './slices/messagesSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    skills: skillsReducer,
    messages: messagesReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});

export default store;
