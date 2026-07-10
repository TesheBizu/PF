import { useEffect, useRef, useState, useCallback } from 'react';
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

function Counter({ target, duration = 1200, suffix = '+' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10);
    if (start === end) return;
    const total = duration;
    const incTime = Math.max(Math.floor(total / end), 25);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incTime);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{count}{suffix}</>;
}

const LINES = ['Web Developer', 'Team Player', 'React Specialist'];

function HeroSection({ settings }) {
  const [roleIdx, setRoleIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [profileUrl, setProfileUrl] = useState('/profile.png');
  const tr = useRef(null);
  const items = useSelector((s) => s.projects.items);
  const skills = useSelector((s) => s.skills.items);
  const experiences = useSelector((s) => s.experiences.items);
  const links = useSelector((s) => s.socialLinks.items);

  const updateProfile = useCallback(() => {
    api.get('/settings/profile-image').then(({ data }) => {
      const url = data?.url || '/profile.png';
      setProfileUrl(url);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    updateProfile();
    window.addEventListener('profileImageChanged', (e) => {
      setProfileUrl(e.detail.url || '/profile.png');
    });
    return () => window.removeEventListener('profileImageChanged', updateProfile);
  }, [updateProfile]);

  useEffect(() => {
    const current = LINES[roleIdx];
    if (!isDeleting && displayed === current) {
      tr.current = setTimeout(() => setIsDeleting(true), 2200);
      return;
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
      <div className="container home__container">
        <div className="home__content">
          <div className="home__greeting">
            <span className="home__greeting-line" />
            <span className="home__greeting-text">{settings?.greeting || 'Hello, I\'m'}</span>
          </div>
          <h1 className="home__name">
            <span style={{ color: 'var(--color-heading)' }}>{settings?.name?.split(' ')[0] || 'Teshome'}</span><br />
            <span style={{ color: 'var(--color-primary)' }}>{settings?.name?.split(' ').slice(1).join(' ') || 'Bizuayehu'}</span>
          </h1>
          <div className="home__role">
            <span className="home__role-prefix">&lt; </span>
            <span className="home__typewriter">{displayed}</span>
            <span className="home__cursor" aria-hidden="true">|</span>
            <span className="home__role-prefix"> /&gt;</span>
          </div>
          <p className="home__bio">{settings?.bio || 'Passionate about building modern, responsive, scalable web applications.'}</p>
          <div className="home__actions">
            <a href="#projects" className="btn btn-primary" onClick={(e) => { e.preventDefault(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              View Projects
            </a>
            <a href="#contact" className="btn btn-secondary" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Get In Touch
            </a>
          </div>
          {links.length > 0 && (
            <div className="home__socials">
              {links.map((l) => (
                <a key={l._id} href={l.url} target="_blank" rel="noopener noreferrer" className="home__social-link" aria-label={l.platform} onClick={() => { try { fetch('/api/analytics/record', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'socialClick', platform: l.platform }) }).catch(() => {}); } catch (e) {} }}>
                  <SocialIcon platform={l.platform} icon={l.icon} size={20} />
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="home__visual">
          <div className="home__profile-frame">
            <img src={profileUrl} alt="Teshome Bizuayehu" className="home__profile-img" />
          </div>
          <div className="home__stats-panel">
            <div className="home__stat-row">
              <div className="home__stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
              <div className="home__stat-num"><Counter target={Math.min(experiences.length, 5) || 1} /></div>
              <div className="home__stat-info"><h4>Years Active</h4><p>Professional exp.</p></div>
            </div>
            <div className="home__stat-row">
              <div className="home__stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
              <div className="home__stat-num"><Counter target={items.length || 0} /></div>
              <div className="home__stat-info"><h4>Projects</h4><p>Completed works</p></div>
            </div>
            <div className="home__stat-row">
              <div className="home__stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
              <div className="home__stat-num"><Counter target={skills.length || 0} /></div>
              <div className="home__stat-info"><h4>Tech Skills</h4><p>Frameworks & tools</p></div>
            </div>
          </div>
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
  const sectionOrder = useSelector((s) => s.sections.order);
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
      {loading && <div className="page-loader" style={{ padding: '40px', textAlign: 'center' }}><div className="page-loader__dot" /><div className="page-loader__dot" /><div className="page-loader__dot" /></div>}
      {visibleSections.map((secId, i) => {
        const Comp = SECTION_COMPONENTS[secId];
        if (!Comp) return null;
        return (
          <SectionWrapper key={secId} id={secId} delay={i * 80}>
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
