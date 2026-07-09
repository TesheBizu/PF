import { useState, useEffect } from 'react';
import { Cpu, Server, Database, KeyRound, Mail, Download } from 'lucide-react';
import api from '../../services/api';

import './About.css';


const quickFacts = [
  { label: 'Name',     value: 'Teshome Bizuayehu' },
  { label: 'Role',     value: 'Full Stack Developer' },
  { label: 'Email',    value: 'teshelin7@gmail.com', link: 'mailto:teshelin7@gmail.com' },
  { label: 'GitHub',   value: 'TesheBizu', link: 'https://github.com/TesheBizu' },
  { label: 'LinkedIn', value: 'teshome-bizuayehu', link: 'https://linkedin.com/in/teshome-bizuayehu' },
  { label: 'Status',   value: '🟢 Open to opportunities' },
];

function setFavicon(src) {
  const link = document.querySelector("link[rel~='icon']");
  if (link) link.href = src;
}

function About() {
  const [profileUrl, setProfileUrl] = useState('/profile.png');

  const updateFromApi = () => {
    api.get('/settings/profile-image').then(({ data }) => {
      const url = data?.url || '/profile.png';
      setProfileUrl(url);
      setFavicon(url);
    }).catch(() => {});
  };

  useEffect(() => {
    setFavicon('/profile.png');
    updateFromApi();
    const handler = (e) => {
      const url = e.detail.url || '/profile.png';
      setProfileUrl(url);
      setFavicon(url);
    };
    window.addEventListener('profileImageChanged', handler);
    return () => window.removeEventListener('profileImageChanged', handler);
  }, []);

  return (
    <section className="about section" id="about">
      <div className="container">
        {/* Header */}
        <div className="section-header animate-fadeInUp">
          <span className="section-tag">// about me</span>
          <h2 className="section-title">
            Who <span>I Am</span>
          </h2>
          <p className="section-desc">
            A brief introduction about me.
          </p>
        </div>

        <div className="about__grid">
          {/* Avatar / Profile Image */}
          <div className="about__avatar-col animate-fadeInUp">
            <div className="about__img-wrapper">
              <img
                src={profileUrl}
                alt="Teshome Bizuayehu — Full Stack Developer"
                className="about__profile-img"
              />
            </div>
          </div>


          {/* Content */}
          <div className="about__content animate-fadeInUp delay-200">
            <h3 className="about__subtitle">
              Full Stack Developer &amp; Problem Solver
            </h3>

            <p className="about__text">
              I'm <strong>Teshome Bizuayehu</strong> — an Information Systems Student at Bahir Dar University and passionate Full Stack Developer focused on
              building modern, responsive, and scalable web applications. I love turning complex problems
              into elegant, user-friendly digital experiences.
            </p>
            <p className="about__text">
              When I'm not coding, I'm exploring new technologies, contributing to open-source projects,
              and building tools that make a real difference.
              In my free time i enjoy reading books, playing chess, and playing football.
            </p>

            <div className="about__cta">
              <a href="mailto:teshelin7@gmail.com" className="btn btn-primary animate-hover">
                <Mail size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Contact Me
              </a>
              <a
                href="/cv.pdf"
                download="Teshome_Bizuayehu_CV.pdf"
                className="btn btn-secondary animate-hover"
              >
                <Download size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
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
