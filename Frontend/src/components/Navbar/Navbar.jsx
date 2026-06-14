import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/#about', label: 'About' },
  { path: '/#skills', label: 'Skills' },
  { path: '/#projects', label: 'Projects' },
  { path: '/#contact', label: 'Contact' },
  { path: '/admin/dashboard', label: 'Dashboard', isDash: true },
];

function Navbar({ theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleHashLink = (e, path) => {
    e.preventDefault();
    setMenuOpen(false);
    const id = path.replace('/#', '');
    if (location.pathname !== '/') {
      window.location.href = path;
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}`} role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
        <span className="navbar__logo-bracket">&lt;</span>
        <span className="navbar__logo-name">Teshome</span>
        <span className="navbar__logo-bracket"> /&gt;</span>
      </Link>

      {/* Right controls — theme + hamburger ONLY */}
      <div className="navbar__controls">
        {/* Theme Toggle */}
        <button
          id="theme-toggle"
          className="navbar__theme-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>

        {/* Hamburger — ONLY navigation control */}
        <button
          id="mobile-menu-btn"
          className={`navbar__hamburger${menuOpen ? ' navbar__hamburger--open' : ''}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Fullscreen dropdown */}
      <div
        className={`navbar__dropdown${menuOpen ? ' navbar__dropdown--open' : ''}`}
        role="menu"
        onClick={() => setMenuOpen(false)}
      >
        <div className="navbar__dropdown-inner" onClick={(e) => e.stopPropagation()}>
          <p className="navbar__dropdown-label">Navigation</p>
          {NAV_LINKS.map((link) =>
            link.path.startsWith('/#') ? (
              <a
                key={link.path}
                href={link.path}
                className="navbar__dropdown-link"
                onClick={(e) => handleHashLink(e, link.path)}
                role="menuitem"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === '/'}
                className={({ isActive }) =>
                  `navbar__dropdown-link${link.isDash ? ' navbar__dropdown-link--dash' : ''}${isActive ? ' navbar__dropdown-link--active' : ''}`
                }
                onClick={() => setMenuOpen(false)}
                role="menuitem"
              >
                {link.isDash && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                )}
                {link.label}
              </NavLink>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
