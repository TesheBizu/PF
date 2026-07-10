import { useState, useEffect, useCallback } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { SocialIcon } from '../Icons';
import './Navbar.css';

const DEFAULT_NAV_LINKS = [
  { id: 'home', label: 'Home', path: '/', visible: true },
  { id: 'about', label: 'About', path: '/#about', visible: true },
  { id: 'skills', label: 'Skills', path: '/#skills', visible: true },
  { id: 'projects', label: 'Projects', path: '/#projects', visible: true },
  { id: 'experience', label: 'Experience', path: '/#experience', visible: true },
  { id: 'testimonials', label: 'Testimonials', path: '/#testimonials', visible: true },
  { id: 'contact', label: 'Contact', path: '/#contact', visible: true },
];

function Navbar({ theme, onToggleTheme }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navbar = useSelector((s) => s.sections.items.navbar);
  const navLinks = navbar?.links?.filter((l) => l.visible !== false) || DEFAULT_NAV_LINKS;
  const logoText = navbar?.logoText || 'Teshome';
  const socialLinks = useSelector((s) => s.socialLinks?.items) || [];
  const activeSocialLinks = socialLinks.filter((l) => l.active);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

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

      <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
        <div className="navbar__logo-badge">T</div>
        <span className="navbar__logo-name">{logoText}</span>
      </Link>

      <div className={`navbar__links ${mobileOpen ? 'navbar__links--open' : ''}`}>
        {navLinks.map((link) =>
          link.path.startsWith('/#') ? (
            <a
              key={link.id || link.path}
              href={link.path}
              className="navbar__link"
              onClick={(e) => handleHashLink(e, link.path)}
            >
              {link.label}
            </a>
          ) : (
            <NavLink
              key={link.id || link.path}
              to={link.path}
              end={link.path === '/'}
              className={({ isActive }) =>
                `navbar__link${isActive ? ' navbar__link--active' : ''}`
              }
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </NavLink>
          )
        )}
      </div>

      <div className="navbar__controls">
        {activeSocialLinks.length > 0 && (
          <div className="navbar__socials">
            {activeSocialLinks.map((s) => (
              <a
                key={s._id}
                href={s.url}
                className="navbar__social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.platform}
                title={s.platform}
              >
                <SocialIcon platform={s.platform} icon={s.icon} size={15} />
              </a>
            ))}
          </div>
        )}

        <button
          id="theme-toggle"
          className="navbar__theme-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          className="navbar__mobile-btn"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
