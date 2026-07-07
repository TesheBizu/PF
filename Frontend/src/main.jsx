import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import './styles/index.css';
import './styles/loader.css';
import App from './App.jsx';

/* ── Splash / Intro Screen ─────────────────────────── */
function SplashScreen() {
  return (
    <div className="splash-screen" aria-hidden="true">
      <span className="splash-text">TESHOME</span>
      <div className="splash-bar" />
      <p className="splash-sub">Portfolio</p>
    </div>
  );
}

/* ── Root — controls splash visibility ─────────────── */
function Root() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // CSS animation: 2.2s play + 0.55s fade = 2.75s total
    const t = setTimeout(() => setShowSplash(false), 2750);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen />}
      <Provider store={store}>
        <App />
      </Provider>
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
