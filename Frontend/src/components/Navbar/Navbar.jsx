import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, LayoutGrid } from 'lucide-react';
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
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleHashLink = (e, path) => {
    e.preventDefault();
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
      <Link to="/" className="navbar__logo">
        <span className="navbar__logo-bracket">&lt;</span>
        <span className="navbar__logo-name">Teshome</span>
        <span className="navbar__logo-bracket"> /&gt;</span>
      </Link>

      {/* Top Navigation Links */}
      <div className="navbar__links">
        {NAV_LINKS.map((link) =>
          link.path.startsWith('/#') ? (
            <a
              key={link.path}
              href={link.path}
              className="navbar__link"
              onClick={(e) => handleHashLink(e, link.path)}
            >
              {link.label}
            </a>
          ) : (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `navbar__link${link.isDash ? ' navbar__link--dash' : ''}${isActive ? ' navbar__link--active' : ''}`
              }
            >
              {link.isDash && <LayoutGrid size={14} className="navbar__link-icon" />}
              {link.label}
            </NavLink>
          )
        )}
      </div>

      {/* Right controls — Theme Toggle */}
      <div className="navbar__controls">
        <button
          id="theme-toggle"
          className="navbar__theme-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
