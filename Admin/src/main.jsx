import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import store from './redux/store';
import './styles/index.css';
import './styles/loader.css';
import App from './App.jsx';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id.apps.googleusercontent.com';

const theme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', theme);

(function() {
  const link = document.querySelector("link[rel~='icon']");
  if (link) link.href = '/profile.png';
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <App />
      </Provider>
    </GoogleOAuthProvider>
  </StrictMode>
);
