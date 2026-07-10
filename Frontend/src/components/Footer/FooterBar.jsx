import { useSelector } from 'react-redux';
import { SocialIcon } from '../Icons';
import { trackSocialClick } from '../../services/analytics';
import './Footer.css';

function FooterBar({ variant = 'site' }) {
  const year = new Date().getFullYear();
  const isDashboard = variant === 'dashboard';
  const socialLinks = useSelector((s) => s.socialLinks?.items) || [];
  const activeLinks = socialLinks.filter((l) => l.active);

  return (
    <footer className={isDashboard ? 'footer footer--dash' : 'footer'}>
      <div className={isDashboard ? 'footer__shell footer__shell--dash' : 'container footer__shell'}>
        <div className="footer__inner">
          {activeLinks.length > 0 && (
            <div className="footer__connect">
              <span className="footer__nav-title">Connect</span>
              <div className="footer__socials">
                {activeLinks.map((s) => (
                  <a
                    key={s._id}
                    href={s.url}
                    className="footer__social-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                    title={s.platform}
                    onClick={() => trackSocialClick(s.platform)}
                  >
                    <SocialIcon platform={s.platform} icon={s.icon} size={16} />
                  </a>
                ))}
              </div>
            </div>
          )}
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
