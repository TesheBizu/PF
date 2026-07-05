import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import { useSelector } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import SpiderWeb from './components/SpiderWeb/SpiderWeb';

// Public Pages (lazy-loaded)
import { lazy, Suspense } from 'react';
const Home       = lazy(() => import('./pages/Home/Home'));
const About      = lazy(() => import('./pages/About/About'));
const Skills     = lazy(() => import('./pages/Skills/Skills'));
const Projects   = lazy(() => import('./pages/Projects/Projects'));
const Contact    = lazy(() => import('./pages/Contact/Contact'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin'));
const Dashboard  = lazy(() => import('./pages/Admin/Dashboard'));
const NotFound   = lazy(() => import('./pages/NotFound/NotFound'));

// Page loading fallback
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

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}

function AppContent({ theme, toggleTheme }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <main className={`page-wrapper${isAdminRoute ? ' page-wrapper--admin' : ''}`} role="main">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/"         element={<Home />} />
            <Route path="/about"    element={<About />} />
            <Route path="/skills"   element={<Skills />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact"  element={<Contact />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  // ── Theme ────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <BrowserRouter>
      {/* Global spider-web background */}
      <SpiderWeb />

      {/* Toast notifications */}
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

      <AppContent theme={theme} toggleTheme={toggleTheme} />
    </BrowserRouter>
  );
}

export default App;
