import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import About from '../About/About';
import Skills from '../Skills/Skills';
import Projects from '../Projects/Projects';
import Experience from '../Experience/Experience';
import Contact from '../Contact/Contact';
import './Home.css';

function Counter({ target, duration = 1200, suffix = '+' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10);
    if (start === end) return;

    const totalMilliseconds = duration;
    const incrementTime = Math.max(Math.floor(totalMilliseconds / end), 25);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return <>{count}{suffix}</>;
}

const ROLES = ['Web Developer', 'Team Player', 'Frontend-Focused Developer'];

function HeroSection() {
  const [roleIndex, setRoleIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const currentRole = ROLES[roleIndex];
    if (!isDeleting && displayed === currentRole) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2200);
      return;
    }
    if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setRoleIndex((i) => (i + 1) % ROLES.length);
      return;
    }
    const speed = isDeleting ? 55 : 90;
    timeoutRef.current = setTimeout(() => {
      setDisplayed(
        isDeleting
          ? currentRole.slice(0, displayed.length - 1)
          : currentRole.slice(0, displayed.length + 1)
      );
    }, speed);
    return () => clearTimeout(timeoutRef.current);
  }, [displayed, isDeleting, roleIndex]);

  return (
    <section className="home section" id="home">
      <div className="container home__container">
        {/* Left — Text content */}
        <div className="home__content">
          <div className="home__greeting animate-fadeInUp">
            <span className="home__greeting-line" />
            <span className="home__greeting-text">Hello, I&apos;m</span>
          </div>

          <h1 className="home__name animate-fadeInUp delay-100">
            <span style={{color:'var(--color-heading)'}}>Teshome</span><br />
            <span style={{color:'var(--color-primary)'}}>Bizuayehu</span>
          </h1>

          <div className="home__role animate-fadeInUp delay-200">
            <span className="home__role-prefix">&lt; </span>
            <span className="home__typewriter">{displayed}</span>
            <span className="home__cursor" aria-hidden="true">|</span>
            <span className="home__role-prefix"> /&gt;</span>
          </div>

          <p className="home__bio animate-fadeInUp delay-300">
            Passionate about building <strong>modern, responsive, scalable</strong> web applications
            using React, Node.js, Express, and MongoDB. Focused on creating impactful digital experiences.
          </p>

          <div className="home__actions animate-fadeInUp delay-400">
            <a
               href="#projects"
               className="btn btn-primary"
               onClick={(e) => {
                 e.preventDefault();
                 document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
               }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              View Projects
            </a>
            <a
               href="#contact"
               className="btn btn-secondary"
               onClick={(e) => {
                 e.preventDefault();
                 document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
               }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Get In Touch
            </a>
          </div>

          {/* Social links */}
          <div className="home__socials animate-fadeInUp delay-500">
            <a href="https://github.com/TesheBizu" target="_blank" rel="noopener noreferrer" className="home__social-link" aria-label="GitHub">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
            </a>
            <a href="https://linkedin.com/in/teshome-bizuayehu" target="_blank" rel="noopener noreferrer" className="home__social-link" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="mailto:teshelin7@gmail.com" className="home__social-link" aria-label="Email">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          </div>
        </div>

        {/* Right — Dynamic Counter Dashboard */}
        <div className="home__visual animate-fadeInUp delay-300">
          <div className="home__stats-panel">
            <div className="home__stat-row">
              <div className="home__stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <div className="home__stat-num">
                <Counter target="1" />
              </div>
              <div className="home__stat-info">
                <h4>Year of Experience</h4>
                <p>Industry practice</p>
              </div>
            </div>
            
            <div className="home__stat-row">
              <div className="home__stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className="home__stat-num">
                <Counter target="5" />
              </div>
              <div className="home__stat-info">
                <h4>Projects Built</h4>
                <p>Completed works</p>
              </div>
            </div>

            <div className="home__stat-row">
              <div className="home__stat-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              </div>
              <div className="home__stat-num">
                <Counter target="10" />
              </div>
              <div className="home__stat-info">
                <h4>Core Tech Skills</h4>
                <p>Languages & frameworks</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="home__scroll-hint" aria-hidden="true">
        <div className="home__scroll-mouse">
          <div className="home__scroll-wheel" />
        </div>
        <span>Scroll</span>
      </div>
    </section>
  );
}

/* ── Single-page Home — all sections ─────────────── */
function Home() {
  return (
    <>
      <HeroSection />
      <div id="about" className="animate-fadeInUp">
        <About />
      </div>
      <div id="skills" className="animate-fadeInUp delay-100">
        <Skills />
      </div>
      <div id="projects" className="animate-fadeInUp delay-200">
        <Projects />
      </div>
      <div id="experience" className="animate-fadeInUp delay-300">
        <Experience />
      </div>
      <div id="contact" className="animate-fadeInUp delay-400">
        <Contact />
      </div>
    </>
  );
}

export default Home;
