import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAllSections, SECTIONS_LIST } from '../../redux/slices/sectionsSlice';
import { fetchProjects } from '../../redux/slices/projectsSlice';
import { fetchSkills } from '../../redux/slices/skillsSlice';
import { fetchExperiences } from '../../redux/slices/experiencesSlice';
import { fetchSocialLinks } from '../../redux/slices/socialLinksSlice';
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
  const tr = useRef(null);
  const items = useSelector((s) => s.projects.items);
  const skills = useSelector((s) => s.skills.items);
  const experiences = useSelector((s) => s.experiences.items);
  const links = useSelector((s) => s.socialLinks.items);

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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </a>
              ))}
            </div>
          )}
        </div>
        <div className="home__visual">
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

function Home() {
  const dispatch = useDispatch();
  const sections = useSelector((s) => s.sections.items);
  const sectionOrder = useSelector((s) => s.sections.order);
  const loading = useSelector((s) => s.sections.loading);

  useEffect(() => {
    dispatch(fetchAllSections());
    dispatch(fetchProjects());
    dispatch(fetchSkills());
    dispatch(fetchExperiences());
    dispatch(fetchSocialLinks());
  }, [dispatch]);

  const visibleSections = sectionOrder.length > 0
    ? sectionOrder.filter((id) => sections[`section_${id}_visible`] !== false)
    : SECTIONS_LIST.filter((s) => s.id !== 'hero' && s.id !== 'footer' && sections[`section_${s.id}_visible`] !== false).map((s) => s.id);

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
