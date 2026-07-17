const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const DEBUG = import.meta.env.MODE === 'development';

function gtag() {
  if (typeof window.gtag === 'function') {
    window.gtag(...arguments);
  } else if (DEBUG) {
    console.warn('[GA4] gtag not loaded yet');
  }
}

const log = (msg, data) => {
  if (DEBUG) console.log(`[GA4] ${msg}`, data || '');
};

export function initGA() {
  if (!GA_MEASUREMENT_ID) {
    if (DEBUG) console.warn('[GA4] VITE_GA_MEASUREMENT_ID not set');
    return;
  }
  log('GA4 initialized with ID', GA_MEASUREMENT_ID);
}

export function trackPageView(page) {
  const path = page || window.location.pathname;
  gtag('event', 'page_view', {
    page_path: path,
    page_title: document.title,
  });
  log('page_view', { page_path: path });
}

export function trackHeroCtaClick(label = 'hero_cta') {
  gtag('event', 'hero_cta_click', {
    event_category: 'engagement',
    event_label: label,
  });
  log('hero_cta_click', { label });
}

export function trackProjectClick(projectTitle) {
  gtag('event', 'project_click', {
    event_category: 'projects',
    event_label: projectTitle,
  });
  log('project_click', { projectTitle });
}

export function trackProjectDemoClick(projectTitle) {
  gtag('event', 'project_demo_click', {
    event_category: 'projects',
    event_label: projectTitle,
  });
  log('project_demo_click', { projectTitle });
}

export function trackGithubLinkClick(projectTitle) {
  gtag('event', 'github_link_click', {
    event_category: 'projects',
    event_label: projectTitle,
  });
  log('github_link_click', { projectTitle });
}

export function trackContactFormSubmit() {
  gtag('event', 'contact_form_submit', {
    event_category: 'contact',
    event_label: 'contact_form',
  });
  log('contact_form_submit');
}

export const trackContactSubmission = trackContactFormSubmit;

export function trackResumeDownload() {
  gtag('event', 'resume_download', {
    event_category: 'engagement',
    event_label: 'resume',
  });
  log('resume_download');
}

export function trackSocialClick(platform) {
  const eventName = `${platform}_click`;
  gtag('event', eventName, {
    event_category: 'social',
    event_label: platform,
  });
  log('social_click', { platform });
}

export function trackThemeToggle(theme) {
  gtag('event', 'theme_toggle', {
    event_category: 'ui',
    event_label: theme,
  });
  log('theme_toggle', { theme });
}

export function trackScrollDepth(depth) {
  gtag('event', `scroll_depth_${depth}`, {
    event_category: 'engagement',
    event_label: `${depth}%`,
    value: depth,
  });
  log('scroll_depth', { depth });
}

export function trackSectionView(section) {
  gtag('event', `section_view_${section}`, {
    event_category: 'navigation',
    event_label: section,
  });
  log('section_view', { section });
}

export function trackInteraction(type, metadata = {}) {
  gtag('event', type, {
    event_category: 'interaction',
    ...metadata,
  });
  log('interaction', { type, metadata });
}
