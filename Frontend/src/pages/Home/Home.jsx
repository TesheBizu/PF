import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllSections } from '../../redux/slices/sectionsSlice';
import { fetchProjects } from '../../redux/slices/projectsSlice';
import { fetchSkills } from '../../redux/slices/skillsSlice';
import { fetchExperiences } from '../../redux/slices/experiencesSlice';
import { fetchSocialLinks } from '../../redux/slices/socialLinksSlice';
import { SocialIcon } from '../../components/Icons';
import api from '../../services/api';
import About from '../About/About';
import Skills from '../Skills/Skills';
import Projects from '../Projects/Projects';
import Experience from '../Experience/Experience';
import Contact from '../Contact/Contact';
import Testimonials from '../Testimonials/Testimonials';
import './Home.css';

const HeroBackground = lazy(() => import('../../components/ThreeD/SceneBackground'));

const LINES = ['Web Developer', 'Team Player', 'React Specialist'];

function HeroSection({ settings }) {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileUrl, setProfileUrl] = useState('/profile.png');
  const tr = useRef(null);
  const links = useSelector((s) => s.socialLinks.items);

  const updateProfile = useCallback(() => {
    api.get('/settings/profile-image').then(({ data }) => {
      setProfileUrl(data?.url || '/profile.png');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    updateProfile();
    const handler = (e) => setProfileUrl(e.detail.url || '/profile.png');
    window.addEventListener('profileImageChanged', handler);
    return () => window.removeEventListener('profileImageChanged', handler);
  }, [updateProfile]);

  useEffect(() => {
    const current = LINES[roleIdx];
    if (!isDeleting && displayed === current) {
      tr.current = setTimeout(() => setIsDeleting(true), 2200);
      return () => clearTimeout(tr.current);
    }
    if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setRoleIdx((i) => (i + 1) % LINES.length);
      return;
    }
    const speed = isDeleting ? 55 : 90;
    tr.current = setTimeout(() => {
      setDisplayed(isDeleting ? current.slice(0, displayed.length - 1) : current.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(tr.current);
  }, [displayed, isDeleting, roleIdx]);

  return (
    <section className="home" id="home">
      <Suspense fallback={null}>
        <HeroBackground />
      </Suspense>

      <div className="home__gradient-blob home__gradient-blob--1" aria-hidden="true" />
      <div className="home__gradient-blob home__gradient-blob--2" aria-hidden="true" />

      <div className="container home__container">
        <div className="home__content">
          <div className="home__greeting">
            <span className="home__greeting-line" />
            <span className="home__greeting-text">{settings?.greeting || "Hello, I'm"}</span>
          </div>

          <div className="home__wordmark">
            <span className="home__wordmark-text">TESHOME</span>
          </div>

          <div className="home__role">
            <span className="home__role-prefix">&lt; </span>
            <span className="home__typewriter">{displayed}</span>
            <span className="home__cursor" aria-hidden="true">|</span>
            <span className="home__role-prefix"> /&gt;</span>
          </div>

          <p className="home__bio">{settings?.bio || 'Passionate about building modern, responsive, scalable web applications.'}</p>

          <div className="home__actions">
            <a href="#projects" className="btn btn-primary" onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              View Projects
            </a>
            <a href="#contact" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Get In Touch
            </a>
          </div>

          {links.length > 0 && (
            <div className="home__socials">
              {links.map((l) => (
                <a key={l._id} href={l.url} target="_blank" rel="noopener noreferrer" className="home__social-link" aria-label={l.platform}>
                  <SocialIcon platform={l.platform} icon={l.icon} size={16} />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="home__visual">
          <img src={profileUrl} alt="Teshome Bizuayehu" className="home__profile-img" />
        </div>
      </div>

      <div className="home__scroll-hint" aria-hidden="true">
        <div className="home__scroll-mouse"><div className="home__scroll-wheel" /></div>
        <span>Scroll</span>
      </div>
    </section>
  );
}

const SECTION_COMPONENTS = {
  about: About,
  skills: Skills,
  experience: Experience,
  projects: Projects,
  testimonials: Testimonials,
  contact: Contact,
};

const DEFAULT_NAV_LINKS = [
  { id: 'about', label: 'About', path: '/#about', visible: true },
  { id: 'skills', label: 'Skills', path: '/#skills', visible: true },
  { id: 'projects', label: 'Projects', path: '/#projects', visible: true },
  { id: 'experience', label: 'Experience', path: '/#experience', visible: true },
  { id: 'testimonials', label: 'Testimonials', path: '/#testimonials', visible: true },
  { id: 'contact', label: 'Contact', path: '/#contact', visible: true },
];

function Home() {
  const dispatch = useDispatch();
  const sections = useSelector((s) => s.sections.items);
  const loading = useSelector((s) => s.sections.loading);
  const navbarLinks = sections.navbar?.links;

  useEffect(() => {
    dispatch(fetchAllSections());
    dispatch(fetchProjects());
    dispatch(fetchSkills());
    dispatch(fetchExperiences());
    dispatch(fetchSocialLinks());
  }, [dispatch]);

  const navLinks = navbarLinks || DEFAULT_NAV_LINKS;
  const visibleSections = navLinks
    .filter((l) => l.visible !== false && l.id !== 'home' && SECTION_COMPONENTS[l.id])
    .map((l) => l.id);

  return (
    <>
      <HeroSection settings={sections.hero} />
      {loading && <div className="page-loader" style={{ padding: '30px', textAlign: 'center' }}><div className="page-loader__dot" /><div className="page-loader__dot" /><div className="page-loader__dot" /></div>}
      {visibleSections.map((secId, i) => {
        const Comp = SECTION_COMPONENTS[secId];
        if (!Comp) return null;
        return (
          <SectionWrapper key={secId} id={secId} delay={i * 60}>
            <Comp />
          </SectionWrapper>
        );
      })}
    </>
  );
}

function SectionWrapper({ id, delay, children }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div id={id} ref={ref} className={`reveal${visible ? ' reveal--visible' : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default Home;
