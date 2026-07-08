import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Home, User, Code, Folder, Briefcase, Mail } from 'lucide-react';
import './Navbar.css';

const NAV_LINKS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/#about', label: 'About', icon: User },
  { path: '/#skills', label: 'Skills', icon: Code },
  { path: '/#projects', label: 'Projects', icon: Folder },
  { path: '/#experience', label: 'Experience', icon: Briefcase },
  { path: '/#contact', label: 'Contact', icon: Mail },
];

function Navbar({ theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const handleHashLink = (e, path) => {
    e.preventDefault();
    setMobileOpen(false);
    const id = path.replace('/#', '');
    if (location.pathname !== '/') {
      window.location.href = path;
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar${scrolled ? ' navbar--scrolled' : ''}${mobileOpen ? ' navbar--open' : ''}`} role="navigation" aria-label="Main navigation">
      {mobileOpen && (
        <button
          type="button"
          className="navbar__backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      {/* Logo — 3D T badge */}
      <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
        <div className="navbar__logo-badge">T</div>
        <span className="navbar__logo-name">eshome</span>
      </Link>

      {/* Top Navigation Links — 3D Icon Buttons */}
      <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
        {NAV_LINKS.map((link) => {
          const IconComponent = link.icon;
          const content = (
            <>
              <span className="navbar__link-icon-3d">
                <IconComponent size={20} />
              </span>
              <span className="navbar__link-label">{link.label}</span>
            </>
          );
          return link.path.startsWith('/#') ? (
            <a
              key={link.path}
              href={link.path}
              className="navbar__link navbar__link--3d"
              onClick={(e) => handleHashLink(e, link.path)}
            >
              {content}
            </a>
          ) : (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `navbar__link navbar__link--3d${isActive ? ' navbar__link--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {content}
            </NavLink>
          );
        })}
      </div>

      {/* Right controls — Theme Toggle + Mobile Menu Trigger */}
      <div className="navbar__controls">
        <button
          id="theme-toggle"
          className="navbar__theme-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          type="button"
          className="navbar__mobile-btn"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

