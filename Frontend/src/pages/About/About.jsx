import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Mail, Download } from 'lucide-react';
import { setCircularFavicon } from '../../utils/circularFavicon';
import './About.css';

function AnimatedNumber({ target, duration = 1500, suffix = '+' }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.unobserve(el); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const end = parseInt(target, 10);
    if (start === end) { setCount(end); return; }
    const total = duration;
    const incTime = Math.max(Math.floor(total / end), 20);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incTime);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function About() {
  const items = useSelector((s) => s.projects.items);
  const skills = useSelector((s) => s.skills.items);
  const experiences = useSelector((s) => s.experiences.items);
  const sections = useSelector((s) => s.sections?.items || {});
  const about = sections.about || {};

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
          <h2 className="section-title"
            dangerouslySetInnerHTML={{ __html: about.title || 'Who <span>I Am</span>' }}
          />
          {about.description && <p className="section-desc">{about.description}</p>}
        </div>

        <div className="about__grid animate-fadeInUp">
          <div className="about__stats-col">
            <div className="about__stats-label">By the numbers</div>
            <div className="about__stats">
              <div className="about__stat-float" style={{ '--stat-color': '#3B82F6' }}>
                <div className="about__stat-num"><AnimatedNumber target={1} /></div>
                <div className="about__stat-label">Years Experience</div>
              </div>
              <div className="about__stat-float" style={{ '--stat-color': '#60A5FA' }}>
                <div className="about__stat-num"><AnimatedNumber target={items.length || 0} /></div>
                <div className="about__stat-label">Projects Done</div>
              </div>
              <div className="about__stat-float" style={{ '--stat-color': '#2563EB' }}>
                <div className="about__stat-num"><AnimatedNumber target={skills.length || 0} /></div>
                <div className="about__stat-label">Tech Skills</div>
              </div>
            </div>
          </div>

          <div className="about__bio-col">
            {about.subtitle && <h3 className="about__subtitle">{about.subtitle}</h3>}
            {about.bio && <p className="about__text">{about.bio}</p>}
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
