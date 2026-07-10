import { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Sun, Moon, Menu, X } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navbar = useSelector((s) => s.sections.items.navbar);
  const navLinks = navbar?.links?.filter((l) => l.visible !== false) || DEFAULT_NAV_LINKS;
  const logoText = navbar?.logoText || 'Teshome';
  const linkRefs = useRef({});

  /* ── scroll-based scrolled state ── */
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 30);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* ── IntersectionObserver for active nav section ── */
  useEffect(() => {
    const ids = navLinks.map((l) => l.id || l.path.replace('/#', '')).filter(Boolean);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        /* find the section with the largest intersection ratio */
        let best = null;
        let bestRatio = 0;
        entries.forEach((entry) => {
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            best = entry.target.id;
          }
        });
        if (best) setActiveSection(best);
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1], rootMargin: '-10% 0px -15% 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [navLinks]);

  /* ── mobile menu lock ── */
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleHashLink = (e, path) => {
    e.preventDefault();
    setMobileOpen(false);
    const id = path.replace('/#', '');
    setActiveSection(id);
    if (location.pathname !== '/') {
      window.location.href = path;
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMagneticMove = (e, id) => {
    const el = linkRefs.current[id];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const dist = Math.sqrt(x * x + y * y);
    const maxDist = 100;
    const strength = Math.min(dist / maxDist, 1);
    el.style.transform = `translate(${x * 0.2 * strength}px, ${y * 0.2 * strength}px)`;
  };

  const handleMagneticLeave = (id) => {
    const el = linkRefs.current[id];
    if (!el) return;
    el.style.transform = 'translate(0, 0)';
  };

  const isActive = (link) => {
    if (link.path === '/') return activeSection === 'home';
    const id = link.path.replace('/#', '');
    return activeSection === id;
  };

  return (
    <nav
      className={`navbar${scrolled ? ' navbar--scrolled' : ''}${mobileOpen ? ' navbar--open' : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {mobileOpen && (
        <button
          type="button"
          className="navbar__backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        />
      )}

      <div className="container navbar__container">
        <Link to="/" className="navbar__logo" onClick={() => setMobileOpen(false)}>
          <div className="navbar__logo-icon">
            <span className="navbar__logo-mono">T</span>
          </div>
          <span className="navbar__logo-name">{logoText}</span>
        </Link>

        <div className={`navbar__links${mobileOpen ? ' navbar__links--open' : ''}`}>
          <div className="navbar__links-inner">
            {navLinks.map((link) =>
              link.path.startsWith('/#') ? (
                <a
                  key={link.id || link.path}
                  href={link.path}
                  className={`navbar__link${isActive(link) ? ' navbar__link--active' : ''}`}
                  ref={(el) => { linkRefs.current[link.id || link.path] = el; }}
                  onClick={(e) => handleHashLink(e, link.path)}
                  onMouseMove={(e) => handleMagneticMove(e, link.id || link.path)}
                  onMouseLeave={() => handleMagneticLeave(link.id || link.path)}
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
                  ref={(el) => { linkRefs.current[link.id || link.path] = el; }}
                  onClick={() => setMobileOpen(false)}
                  onMouseMove={(e) => handleMagneticMove(e, link.id || link.path)}
                  onMouseLeave={() => handleMagneticLeave(link.id || link.path)}
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>
        </div>

        <div className="navbar__controls">
          <button
            id="theme-toggle"
            className="navbar__theme-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            type="button"
            className="navbar__mobile-btn"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
