import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import SocketListener from './components/SocketListener/SocketListener';
import { trackPageView, trackThemeToggle, trackScrollDepth } from './services/analytics';

const Home       = lazy(() => import('./pages/Home/Home'));
const About      = lazy(() => import('./pages/About/About'));
const Skills     = lazy(() => import('./pages/Skills/Skills'));
const Projects   = lazy(() => import('./pages/Projects/Projects'));
const Contact    = lazy(() => import('./pages/Contact/Contact'));
const NotFound   = lazy(() => import('./pages/NotFound/NotFound'));

function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="page-loader">
        <span className="page-loader__dot" />
        <span className="page-loader__dot" />
        <span className="page-loader__dot" />
      </div>
    </div>
  );
}

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const depths = [25, 50, 75, 100];
    const tracked = new Set();
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const pct = Math.round((window.scrollY / scrollHeight) * 100);
      depths.forEach((d) => {
        if (pct >= d && !tracked.has(d)) {
          tracked.add(d);
          trackScrollDepth(d);
        }
      });
    };
    tracked.clear();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return null;
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      trackThemeToggle(next);
      return next;
    });
  };

  return (
    <BrowserRouter>
      <SocketListener />
      <AnalyticsTracker />

      <ToastContainer
        position="top-right"
        autoClose={1800}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={theme}
        transition={Slide}
        toastStyle={{
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
        }}
      />

      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <main className="page-wrapper" role="main">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"         element={<Home />} />
            <Route path="/about"    element={<About />} />
            <Route path="/skills"   element={<Skills />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact"  element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
