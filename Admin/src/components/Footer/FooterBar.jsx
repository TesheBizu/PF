import { SocialIcon } from '../SocialIcons';
import './Footer.css';

function FooterBar({ variant = 'site' }) {
  const year = new Date().getFullYear();
  const isDashboard = variant === 'dashboard';

  return (
    <footer className={isDashboard ? 'footer footer--dash' : 'footer'}>
      <div className={isDashboard ? 'footer__shell footer__shell--dash' : 'container footer__shell'}>
        <div className="footer__inner">

          <div className="footer__connect">
            <span className="footer__nav-title">Connect</span>
            <div className="footer__socials">
              <a href="https://github.com/TesheBizu" className="footer__social-btn" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><SocialIcon platform="github" size={16} /></a>
              <a href="https://linkedin.com/in/teshome-bizuayehu" className="footer__social-btn" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><SocialIcon platform="linkedin" size={16} /></a>
              <a href="mailto:teshelin7@gmail.com" className="footer__social-btn" target="_blank" rel="noopener noreferrer" aria-label="Email" title="Email"><SocialIcon platform="mail" size={16} /></a>
            </div>
          </div> 
        </div>

        <div className="footer__divider" />
        <p className="footer__copy">
          <span className="footer__copy-name">Teshome Bizuayehu</span> &copy; {year}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default FooterBar;
