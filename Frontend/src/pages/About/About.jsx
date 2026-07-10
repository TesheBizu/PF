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
  const dynMap = { projects: items.length, skills: skills.length, experiences: Math.min(experiences.length, 5) || 1 };
  const stats = about.stats?.length ? about.stats : [
    { id: 'exp', label: 'Years Experience', value: dynMap.experiences, color: '#3B82F6', suffix: '+', dynamic: 'experiences' },
    { id: 'proj', label: 'Projects Done', value: dynMap.projects, color: '#60A5FA', suffix: '+', dynamic: 'projects' },
    { id: 'tech', label: 'Tech Skills', value: dynMap.skills, color: '#2563EB', suffix: '+', dynamic: 'skills' },
  ];

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

        </div>

        <div className="about__grid animate-fadeInUp">
          <div className="about__stats-col">
            <div className="about__stats-label">By the numbers</div>
            <div className="about__stats">
              {stats.map((st) => (
                <div key={st.id} className="about__stat-float" style={{ '--stat-color': st.color }}>
                  <div className="about__stat-num"><AnimatedNumber target={st.dynamic ? dynMap[st.dynamic] : (st.value || 0)} suffix={st.suffix || '+'} /></div>
                  <div className="about__stat-label">{st.label}</div>
                </div>
              ))}
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
              <a href={about.contactLink || 'mailto:teshelin7@gmail.com'} className="btn btn-primary">
                <Mail size={15} />
                Contact Me
              </a>
              <a href={about.cvUrl || '/cv.pdf'} download="Teshome_Bizuayehu_CV.pdf" className="btn btn-ghost">
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
