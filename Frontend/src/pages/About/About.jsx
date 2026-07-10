import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Mail, Download } from 'lucide-react';
import { setCircularFavicon } from '../../utils/circularFavicon';
import './About.css';

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

function About() {
  const items = useSelector((s) => s.projects.items);
  const skills = useSelector((s) => s.skills.items);
  const experiences = useSelector((s) => s.experiences.items);

  useEffect(() => {
    setCircularFavicon('/profile.png');
    const handler = (e) => setCircularFavicon(e.detail.url || '/profile.png');
    window.addEventListener('profileImageChanged', handler);
    return () => window.removeEventListener('profileImageChanged', handler);
  }, []);

  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="section-header animate-fadeInUp">
          <h2 className="section-title">
            Who <span>I Am</span>
          </h2>
          <p className="section-desc">
            A brief introduction about me.
          </p>
        </div>

        <div className="about__grid animate-fadeInUp">
          <div className="about__stats-col">
            <div className="about__stats-label">By the numbers</div>
            <div className="about__stats">
              <div className="about__stat-card">
                <div className="about__stat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div className="about__stat-num"><Counter target={Math.min(experiences.length, 5) || 1} /></div>
                <div className="about__stat-label">Years Experience</div>
              </div>
              <div className="about__stat-card">
                <div className="about__stat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <div className="about__stat-num"><Counter target={items.length || 0} /></div>
                <div className="about__stat-label">Projects Done</div>
              </div>
              <div className="about__stat-card">
                <div className="about__stat-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div className="about__stat-num"><Counter target={skills.length || 0} /></div>
                <div className="about__stat-label">Tech Skills</div>
              </div>
            </div>
          </div>

          <div className="about__bio-col">
            <h3 className="about__subtitle">
              Full Stack Developer &amp; Problem Solver
            </h3>
            <p className="about__text">
              I'm <strong>Teshome Bizuayehu</strong> — an Information Systems Student at Bahir Dar University and passionate Full Stack Developer focused on building modern, responsive, and scalable web applications. I love turning complex problems into elegant, user-friendly digital experiences.
            </p>
            <p className="about__text">
              When I'm not coding, I'm exploring new technologies, contributing to open-source projects, and building tools that make a real difference.
            </p>
            <div className="about__cta">
              <a href="mailto:teshelin7@gmail.com" className="btn btn-primary">
                <Mail size={15} />
                Contact Me
              </a>
              <a href="/cv.pdf" download="Teshome_Bizuayehu_CV.pdf" className="btn btn-ghost">
                <Download size={15} />
                Download CV
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
