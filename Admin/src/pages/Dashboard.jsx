import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '../redux/slices/authSlice';
import { fetchProjects, createProject, updateProject, deleteProject } from '../redux/slices/projectsSlice';
import { fetchSkills, createSkill, updateSkill, deleteSkill } from '../redux/slices/skillsSlice';
import { fetchMessages, deleteMessage, markMessageRead } from '../redux/slices/messagesSlice';
import { fetchExperiences, createExperience, updateExperience, deleteExperience } from '../redux/slices/experiencesSlice';
import { fetchProfileImage, updateProfileImage, deleteProfileImage } from '../redux/slices/siteSettingsSlice';
import { fetchTestimonials, createTestimonial, updateTestimonial, deleteTestimonial } from '../redux/slices/testimonialsSlice';
import { fetchAllSections, updateSection } from '../redux/slices/sectionsSlice';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../redux/slices/notificationsSlice';
import { fetchAnalytics } from '../redux/slices/analyticsSlice';
import { fetchSocialLinks, createSocialLink, updateSocialLink, reorderSocialLinks, deleteSocialLink, setItems } from '../redux/slices/socialLinksSlice';
import api from '../services/api';
import {
  LayoutDashboard, Briefcase, Zap, MessageSquare, User as UserIcon, LogOut, ChevronLeft, ChevronRight,
  Plus, X, Edit3, Trash2, MailOpen, Reply, Mail, Upload, Eye, EyeOff, History, Star, Check, XCircle,
  Monitor, Menu as MenuIcon, CreditCard, BarChart3, TrendingUp, Bell, Share2, UserCog, Settings,
  Activity, Users, Globe, Clock, ArrowUp, ArrowDown, GripVertical, Save, RefreshCw, CheckCheck,
  Search, Calendar,
} from 'lucide-react';
import './Admin.css';
import FooterBar from '../components/Footer/FooterBar';
import ConfirmDialog from '../components/ConfirmDialog/ConfirmDialog';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className="dash-stat card">
      <div className="dash-stat__icon" style={{ background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>{icon}</div>
      <div>
        <div className="dash-stat__value">{value}</div>
        <div className="dash-stat__label">{label}</div>
        {sub && <div className="dash-stat__sub">{sub}</div>}
      </div>
    </div>
  );
}

function MiniChart({ data, color = 'var(--color-primary)', height = 40 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height, flex: 1 }}>
      {data.slice(-14).map((v, i) => (
        <div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, background: color, borderRadius: '2px 2px 0 0', opacity: 0.4 + (i / data.slice(-14).length) * 0.6 }} />
      ))}
    </div>
  );
}

const initProject = { title: '', description: '', techStack: '', githubUrl: '', liveUrl: '', imageUrl: '', featured: false };
const initSkill   = { name: '', category: 'Programming', proficiency: 80 };
const initExperience = { role: '', company: '', period: '', location: '', description: '', iconUrl: '', type: 'work', order: 0 };
const initTestimonial = { name: '', role: '', photo: '', rating: 5, message: '', published: false, order: 0 };
const initSocialLink = { platform: '', url: '', icon: '', label: '', order: 0, active: true };

function Dashboard({ theme, onToggleTheme }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { items: projects, loading: pLoading } = useSelector((s) => s.projects);
  const { items: skills, loading: sLoading } = useSelector((s) => s.skills);
  const { items: messages, loading: mLoading } = useSelector((s) => s.messages);
  const { items: experiences, loading: eLoading } = useSelector((s) => s.experiences);
  const { items: testimonials, loading: tLoading } = useSelector((s) => s.testimonials);
  const { items: sections, loading: secLoading } = useSelector((s) => s.sections);
  const { items: notifications, totalUnread: notifUnread, loading: nLoading } = useSelector((s) => s.notifications);
  const { summary: analytics, loading: aLoading } = useSelector((s) => s.analytics);
  const { items: socialLinks, loading: slLoading } = useSelector((s) => s.socialLinks);
  const { profileImageUrl } = useSelector((s) => s.siteSettings);

  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileNav, setIsMobileNav] = useState(false);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [pForm, setPForm] = useState(initProject);
  const [sForm, setSForm] = useState(initSkill);
  const [eForm, setEForm] = useState(initExperience);
  const [tForm, setTForm] = useState(initTestimonial);
  const [slForm, setSlForm] = useState(initSocialLink);
  const [uploading, setUploading] = useState(false);
  const [profileUploading, setProfileUploading] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [totpQrCode, setTotpQrCode] = useState('');
  const [totpManualKey, setTotpManualKey] = useState('');
  const [totpSetupCode, setTotpSetupCode] = useState('');
  const [is2faEnabled, setIs2faEnabled] = useState(user?.totpEnabled || false);
  const [totpLoading, setTotpLoading] = useState(false);
  const [showDisable2fa, setShowDisable2fa] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [sectionForms, setSectionForms] = useState({});
  const [sectionSaving, setSectionSaving] = useState(null);
  const [draggedIdx, setDraggedIdx] = useState(null);

  // Section form state
  useEffect(() => {
    if (Object.keys(sections).length > 0) {
      setSectionForms((prev) => {
        const next = { ...prev };
        ['hero', 'about', 'navbar', 'footer'].forEach((k) => {
          if (sections[k] && !next[k]) next[k] = JSON.parse(JSON.stringify(sections[k]));
        });
        return next;
      });
    }
  }, [sections]);

  useEffect(() => {
    if (user) setIs2faEnabled(user.totpEnabled);
  }, [user]);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchSkills());
    dispatch(fetchMessages());
    dispatch(fetchExperiences());
    dispatch(fetchProfileImage());
    dispatch(fetchTestimonials());
    dispatch(fetchAllSections());
    dispatch(fetchNotifications());
    dispatch(fetchAnalytics());
    dispatch(fetchSocialLinks());
  }, [dispatch]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 680px)');
    const update = () => setIsMobileNav(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const showSidebarLabels = sidebarOpen || isMobileNav;
  const closeConfirm = () => setConfirm(null);
  const runConfirm = async () => {
    if (confirm?.onConfirm) await confirm.onConfirm();
    setConfirm(null);
  };
  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    dispatch(logout());
    toast.info('Logged out successfully');
    navigate('/login', { replace: true });
  };
  const requestLogout = () => setConfirm({ title: 'Log out?', message: 'You will need to sign in again.', confirmLabel: 'Log out', danger: true, onConfirm: handleLogout });
  const unread = messages.filter((m) => !m.isRead).length;

  const SIDEBAR_GROUPS = [
    { label: 'Dashboard', items: [{ id: 'overview', label: 'Overview', icon: LayoutDashboard }] },
    { label: 'Content', items: [
      { id: 'projects', label: 'Projects', icon: Briefcase },
      { id: 'skills', label: 'Skills', icon: Zap },
      { id: 'experiences', label: 'Timeline', icon: History },
      { id: 'testimonials', label: 'Testimonials', icon: Star },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unread },
    ]},
    { label: 'Sections', items: [
      { id: 'hero-editor', label: 'Hero', icon: Monitor },
      { id: 'about-editor', label: 'About', icon: UserIcon },
      { id: 'navbar-editor', label: 'Navbar', icon: MenuIcon },
      { id: 'footer-editor', label: 'Footer', icon: CreditCard },
    ]},
    { label: 'Engagement', items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'metrics', label: 'Metrics', icon: TrendingUp },
      { id: 'notifications-center', label: 'Notifications', icon: Bell, badge: notifUnread },
      { id: 'social-links', label: 'Social Links', icon: Share2 },
    ]},
    { label: 'System', items: [
      { id: 'profile', label: 'Profile', icon: UserCog },
      { id: 'settings', label: 'Settings', icon: Settings },
    ]},
  ];

  // Profile image handlers
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setProfileUploading(true);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) { await dispatch(updateProfileImage(data.url)); toast.success('Profile image updated!'); }
      else toast.error(data.message || 'Failed');
    } catch (err) { toast.error('Error uploading'); }
    finally { setProfileUploading(false); }
  };
  const handleRemoveProfileImage = () => setConfirm({ title: 'Remove profile image?', message: 'This will remove your profile photo.', confirmLabel: 'Remove', danger: true, onConfirm: async () => { await dispatch(deleteProfileImage()); toast.success('Removed'); } });

  // Project handlers
  const openAddProject = () => { setPForm(initProject); setModal('addProject'); };
  const openEditProject = (p) => { setPForm({ ...p, techStack: p.techStack.join(', ') }); setSelected(p); setModal('editProject'); };
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) { setPForm((f) => ({ ...f, imageUrl: data.url })); toast.success('Image uploaded!'); }
      else toast.error(data.message || 'Failed');
    } catch (err) { toast.error('Error uploading'); }
    finally { setUploading(false); }
  };
  const handleSaveProject = async () => {
    const payload = { ...pForm, techStack: pForm.techStack.split(',').map((t) => t.trim()).filter(Boolean) };
    if (modal === 'addProject') await dispatch(createProject(payload));
    else await dispatch(updateProject({ id: selected._id, projectData: payload }));
    setModal(null);
  };
  const handleDeleteProject = (id, title) => setConfirm({ title: 'Delete project?', message: `Delete "${title}"?`, confirmLabel: 'Delete', danger: true, onConfirm: async () => { await dispatch(deleteProject(id)); toast.success('Deleted'); } });

  // Skill handlers
  const openAddSkill = () => { setSForm(initSkill); setModal('addSkill'); };
  const openEditSkill = (s) => { setSForm(s); setSelected(s); setModal('editSkill'); };
  const handleSaveSkill = async () => {
    if (modal === 'addSkill') await dispatch(createSkill(sForm));
    else await dispatch(updateSkill({ id: selected._id, skillData: sForm }));
    setModal(null);
  };
  const handleDeleteSkill = (id, name) => setConfirm({ title: 'Delete skill?', message: `Delete "${name}"?`, confirmLabel: 'Delete', danger: true, onConfirm: async () => { await dispatch(deleteSkill(id)); toast.success('Deleted'); } });

  // Experience handlers
  const openAddExperience = () => { setEForm(initExperience); setModal('addExperience'); };
  const openEditExperience = (exp) => { setEForm(exp); setSelected(exp); setModal('editExperience'); };
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) { setEForm((f) => ({ ...f, iconUrl: data.url })); toast.success('Logo uploaded!'); }
      else toast.error(data.message || 'Failed');
    } catch (err) { toast.error('Error uploading'); }
    finally { setUploading(false); }
  };
  const handleSaveExperience = async () => {
    if (modal === 'addExperience') await dispatch(createExperience(eForm));
    else await dispatch(updateExperience({ id: selected._id, expData: eForm }));
    setModal(null);
  };
  const handleDeleteExperience = (id, role) => setConfirm({ title: 'Delete experience?', message: `Delete "${role}"?`, confirmLabel: 'Delete', danger: true, onConfirm: async () => { await dispatch(deleteExperience(id)); toast.success('Deleted'); } });

  // Testimonial handlers
  const openAddTestimonial = () => { setTForm(initTestimonial); setModal('addTestimonial'); };
  const openEditTestimonial = (t) => { setTForm(t); setSelected(t); setModal('editTestimonial'); };
  const handleTestimonialPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data.success) { setTForm((f) => ({ ...f, photo: data.url })); toast.success('Photo uploaded!'); }
      else toast.error(data.message || 'Failed');
    } catch (err) { toast.error('Error uploading'); }
    finally { setUploading(false); }
  };
  const handleSaveTestimonial = async () => {
    if (modal === 'addTestimonial') await dispatch(createTestimonial(tForm));
    else await dispatch(updateTestimonial({ id: selected._id, testimonialData: tForm }));
    setModal(null);
  };
  const handleDeleteTestimonial = (id, name) => setConfirm({ title: 'Delete testimonial?', message: `Delete "${name}"?`, confirmLabel: 'Delete', danger: true, onConfirm: async () => { await dispatch(deleteTestimonial(id)); toast.success('Deleted'); } });
  const handleTogglePublish = async (t) => { await dispatch(updateTestimonial({ id: t._id, testimonialData: { published: !t.published } })); toast.success(t.published ? 'Unpublished' : 'Published'); };

  // Message handlers
  const openMessage = (m) => { setSelected(m); dispatch(markMessageRead(m._id)); setModal('viewMessage'); };
  const handleReplyMessage = (m) => { const to = encodeURIComponent(m.email); const subject = encodeURIComponent(`Re: ${m.subject}`); const body = encodeURIComponent(`\n\n---\nOn ${new Date(m.createdAt).toLocaleString()}, ${m.name} <${m.email}> wrote:\n${m.message}`); window.open(`https://mail.google.com/mail/?view=cm&to=${to}&su=${subject}&body=${body}`, '_blank'); };
  const requestDeleteMessage = (id, subject) => setConfirm({ title: 'Delete message?', message: `Delete "${subject}"?`, confirmLabel: 'Delete', danger: true, onConfirm: async () => { await dispatch(deleteMessage(id)); toast.success('Deleted'); setModal(null); } });

  // Password handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwdForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setPwdLoading(true);
    try { const { data } = await api.put('/auth/change-password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword }); toast.success(data.message || 'Password changed!'); setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPwdLoading(false); }
  };

  // 2FA handlers
  const handleStart2faSetup = async () => { setTotpLoading(true); try { const { data } = await api.post('/auth/totp/setup'); setTotpQrCode(data.qrCodeUrl); setTotpManualKey(data.manualKey); setTotpSetupCode(''); setModal('setup2fa'); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setTotpLoading(false); } };
  const handleVerify2faSetup = async (e) => { e.preventDefault(); if (!totpSetupCode || totpSetupCode.length !== 6) { toast.error('Enter 6-digit code'); return; } setTotpLoading(true); try { await api.post('/auth/totp/verify-setup', { totpCode: totpSetupCode }); toast.success('2FA enabled!'); setIs2faEnabled(true); setModal(null); } catch (err) { toast.error(err.response?.data?.message || 'Verification failed'); } finally { setTotpLoading(false); } };
  const handleDisable2fa = async (e) => { e.preventDefault(); if (!disablePassword) { toast.error('Enter your password'); return; } setTotpLoading(true); try { await api.delete('/auth/totp/disable', { data: { password: disablePassword } }); toast.success('2FA disabled'); setIs2faEnabled(false); setShowDisable2fa(false); setDisablePassword(''); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); } finally { setTotpLoading(false); } };

  // Section editor handlers
  const handleSectionChange = (key, field, value) => {
    setSectionForms((prev) => ({
      ...prev,
      [key]: { ...(prev[key] || {}), [field]: value },
    }));
  };
  const handleSectionSave = async (key) => {
    setSectionSaving(key);
    try {
      await dispatch(updateSection({ key, value: sectionForms[key] }));
      toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} section updated!`);
    } catch (err) { toast.error('Failed to save'); }
    finally { setSectionSaving(null); }
  };

  // Social link handlers
  const openAddSocialLink = () => { setSlForm(initSocialLink); setModal('addSocialLink'); };
  const openEditSocialLink = (l) => { setSlForm(l); setSelected(l); setModal('editSocialLink'); };
  const handleSaveSocialLink = async () => {
    if (modal === 'addSocialLink') { await dispatch(createSocialLink(slForm)); toast.success('Link added!'); }
    else { await dispatch(updateSocialLink({ id: selected._id, linkData: slForm })); toast.success('Link updated!'); }
    setModal(null);
  };
  const handleDeleteSocialLink = (id, platform) => setConfirm({ title: 'Delete link?', message: `Delete "${platform}"?`, confirmLabel: 'Delete', danger: true, onConfirm: async () => { await dispatch(deleteSocialLink(id)); toast.success('Deleted'); } });
  const handleReorderSocialLinks = async (links) => {
    const reordered = links.map((l, i) => ({ id: l._id, order: i }));
    await dispatch(reorderSocialLinks(reordered));
    toast.success('Order updated!');
  };
  const handleDragStart = (idx) => setDraggedIdx(idx);
  const handleDragOver = (e, idx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const items = [...socialLinks];
    const [moved] = items.splice(draggedIdx, 1);
    items.splice(idx, 0, moved);
    setDraggedIdx(idx);
    dispatch(setItems(items));
  };
  const handleDragEnd = () => {
    if (draggedIdx !== null) handleReorderSocialLinks(socialLinks);
    setDraggedIdx(null);
  };

  // Notification handlers
  const handleMarkAllRead = async () => { await dispatch(markAllNotificationsRead()); toast.success('All marked as read'); };
  const handleMarkRead = async (id) => { await dispatch(markNotificationRead(id)); };
  const handleDeleteNotif = async (id) => { await dispatch(deleteNotification(id)); };

  const currentTabObj = SIDEBAR_GROUPS.flatMap((g) => g.items).find((t) => t.id === tab);
  const TabIcon = currentTabObj?.icon || LayoutDashboard;

  return (
    <div className={`dashboard${sidebarOpen ? '' : ' dashboard--collapsed'}`}>
      <aside className="dash-sidebar">
        <button className="dash-sidebar__toggle" onClick={() => setSidebarOpen((v) => !v)} aria-label={sidebarOpen ? 'Collapse' : 'Expand'} title={sidebarOpen ? 'Collapse' : 'Expand'}>
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
        <div className="dash-sidebar__logo">
          <div className="logo-badge-3d">T</div>
          {showSidebarLabels && <span className="dash-sidebar__logo-text">Admin</span>}
        </div>
        <nav className="dash-sidebar__nav">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.label} className="dash-sidebar__group">
              {showSidebarLabels && <div className="dash-sidebar__group-label">{group.label}</div>}
              {group.items.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.id} className={`dash-sidebar__link${tab === t.id ? ' dash-sidebar__link--active' : ''}`} onClick={() => setTab(t.id)} title={!showSidebarLabels ? t.label : undefined}>
                    <Icon className="dash-sidebar__link-icon" size={18} />
                    {showSidebarLabels ? (
                      <span className="dash-sidebar__link-text">
                        {t.label}
                        {t.badge > 0 && <span className="dash-sidebar__badge">{t.badge}</span>}
                      </span>
                    ) : (t.badge > 0 && <span className="dash-sidebar__badge dash-sidebar__badge--icon">{t.badge}</span>)}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="dash-sidebar__bottom">
          <div className="dash-sidebar__user">
            <div className="dash-sidebar__avatar">{user?.name?.[0] ?? 'A'}</div>
            {showSidebarLabels && (<div><div className="dash-sidebar__name">{user?.name}</div><div className="dash-sidebar__role">Administrator</div></div>)}
          </div>
          <button className="btn btn-ghost dash-sidebar__logout" onClick={requestLogout} id="admin-logout" title="Logout"><LogOut size={16} />{showSidebarLabels && 'Logout'}</button>
        </div>
      </aside>

      <main className="dash-main-area">
        <div className="dash-topbar">
          <div className="dash-topbar__search">
            <Search size={15} style={{ color: 'var(--color-text-dim)', flexShrink: 0 }} />
            <input type="text" placeholder="Search across dashboard..." />
          </div>
          <div className="dash-topbar__actions">
            <button className="dash-topbar__action-btn" title="Notifications" onClick={() => setTab('notifications-center')}>
              <Bell size={16} />
              {notifUnread > 0 && <span className="dash-topbar__notif-dot" />}
            </button>
            <div className="dash-topbar__date-selector" title="Date range">
              <Calendar size={14} />
              <span>Last 30 days</span>
            </div>
            <div className="dash-topbar__user" title="Profile" onClick={() => setTab('profile')}>
              <div className="dash-topbar__user-avatar">{user?.name?.[0] ?? 'A'}</div>
              <span className="dash-topbar__user-name">{user?.name}</span>
            </div>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>

        <div className="dash-body">

        {/* ═══ OVERVIEW ═══ */}
        {tab === 'overview' && (
          <div className="dash-overview animate-fadeInUp">
            <div className="dash-stats-row">
              <div className="dash-stat"><div className="dash-stat__icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}><Briefcase size={18} /></div><div><div className="dash-stat__value">{projects.length}</div><div className="dash-stat__label">Projects</div><div className="dash-stat__trend dash-stat__trend--up"><ArrowUp size={10} /> 12%</div></div></div>
              <div className="dash-stat"><div className="dash-stat__icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Zap size={18} /></div><div><div className="dash-stat__value">{skills.length}</div><div className="dash-stat__label">Skills</div></div></div>
              <div className="dash-stat"><div className="dash-stat__icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><History size={18} /></div><div><div className="dash-stat__value">{experiences.length}</div><div className="dash-stat__label">Timeline</div></div></div>
              <div className="dash-stat"><div className="dash-stat__icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}><Star size={18} /></div><div><div className="dash-stat__value">{testimonials.filter(t => t.published).length}</div><div className="dash-stat__label">Testimonials</div><div className="dash-stat__sub">{testimonials.length} total</div></div></div>
              <div className="dash-stat"><div className="dash-stat__icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}><MessageSquare size={18} /></div><div><div className="dash-stat__value">{unread}</div><div className="dash-stat__label">Unread</div><div className="dash-stat__sub">{messages.length} messages</div></div></div>
            </div>

            <div className="dash-panels-row">
              {/* Analytics Panel */}
              <div className="dash-panel">
                <div className="dash-panel__header">
                  <span className="dash-panel__title"><BarChart3 size={14} style={{ marginRight: 6 }} />Analytics</span>
                  <button className="dash-panel__action" onClick={() => dispatch(fetchAnalytics())}>Refresh</button>
                </div>
                {analytics ? (
                  <>
                    <div className="analytics-kpis">
                      <div className="analytics-kpi"><div className="analytics-kpi__label">Visitors</div><div className="analytics-kpi__value">{analytics.visitors || 0}</div><div className="analytics-kpi__change analytics-kpi__change--up"><ArrowUp size={10} /> 8.2%</div></div>
                      <div className="analytics-kpi"><div className="analytics-kpi__label">Page Views</div><div className="analytics-kpi__value">{analytics.pageViews || 0}</div><div className="analytics-kpi__change analytics-kpi__change--up"><ArrowUp size={10} /> 12.5%</div></div>
                      <div className="analytics-kpi"><div className="analytics-kpi__label">Avg / Day</div><div className="analytics-kpi__value">{analytics.avgVisitorsPerDay || 0}</div></div>
                      <div className="analytics-kpi"><div className="analytics-kpi__label">Pages / Visit</div><div className="analytics-kpi__value">{analytics.avgPageViewsPerVisitor || '0.0'}</div></div>
                    </div>
                    <svg className="mini-chart" viewBox="0 0 200 60" preserveAspectRatio="none">
                      <path d={(() => {
                        const entries = analytics.entries || [];
                        const vals = entries.map(e => e.visitors || 0);
                        const max = Math.max(...vals, 1);
                        const pts = vals.map((v, i) => `${(i / Math.max(vals.length - 1, 1)) * 200},${60 - (v / max) * 50}`).join(' ');
                        return `M${pts}`;
                      })()} fill="none" stroke="#6366f1" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                      <path d={(() => {
                        const entries = analytics.entries || [];
                        const vals = entries.map(e => e.visitors || 0);
                        const max = Math.max(...vals, 1);
                        const pts = vals.map((v, i) => `${(i / Math.max(vals.length - 1, 1)) * 200},${60 - (v / max) * 50}`).join(' ');
                        return `M${pts} L${((vals.length - 1) / Math.max(vals.length - 1, 1)) * 200},60 L0,60 Z`;
                      })()} fill="url(#chartGrad)" opacity="0.15" />
                      <defs><linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#6366f1" stopOpacity="0" /></linearGradient></defs>
                    </svg>
                    {analytics.entries?.[0]?.date && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--color-text-dim)', marginTop: 4 }}>
                        <span>{analytics.entries[0].date}</span>
                        <span>{analytics.entries[analytics.entries.length - 1]?.date}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '16px 0', textAlign: 'center' }}>No analytics data yet. Visit the public site to generate data.</p>
                )}
              </div>

              {/* Recent Activity Panel */}
              <div className="dash-panel">
                <div className="dash-panel__header">
                  <span className="dash-panel__title"><Activity size={14} style={{ marginRight: 6 }} />Recent Activity</span>
                  <button className="dash-panel__action" onClick={() => setTab('notifications-center')}>View All</button>
                </div>
                <div className="activity-feed">
                  {(notifications.length > 0 ? notifications.slice(0, 5) : messages.slice(0, 5).map(m => ({ title: m.subject || 'New Message', body: `From ${m.name}`, createdAt: m.createdAt, type: 'message' }))).map((item, i) => (
                    <div key={item._id || i} className="activity-item">
                      <div className="activity-item__icon">{item.type === 'message' ? <Mail size={12} /> : <Bell size={12} />}</div>
                      <div className="activity-item__content">
                        <div className="activity-item__title">{item.title}</div>
                        {item.body && <div className="activity-item__desc">{item.body}</div>}
                      </div>
                      <div className="activity-item__time">{new Date(item.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                  {notifications.length === 0 && messages.length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', padding: '16px 0', textAlign: 'center' }}>No recent activity.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="dash-lower-panels">
              {/* Quick Actions */}
              <div className="dash-panel">
                <div className="dash-panel__header">
                  <span className="dash-panel__title"><Zap size={14} style={{ marginRight: 6 }} />Quick Actions</span>
                </div>
                <div className="dash-quick-actions">
                  <button className="quick-action-btn" onClick={() => { setTab('projects'); openAddProject(); }}><Plus size={14} /> New Project</button>
                  <button className="quick-action-btn" onClick={() => { setTab('skills'); openAddSkill(); }}><Plus size={14} /> New Skill</button>
                  <button className="quick-action-btn" onClick={() => { setTab('experiences'); openAddExperience(); }}><Plus size={14} /> New Experience</button>
                  <button className="quick-action-btn" onClick={() => { setTab('testimonials'); openAddTestimonial(); }}><Plus size={14} /> New Testimonial</button>
                  <button className="quick-action-btn" onClick={() => setTab('messages')}><MessageSquare size={14} /> View Inbox</button>
                  <button className="quick-action-btn" onClick={() => setTab('analytics')}><BarChart3 size={14} /> Full Analytics</button>
                </div>
              </div>

              {/* Content Overview */}
              <div className="dash-panel">
                <div className="dash-panel__header">
                  <span className="dash-panel__title"><LayoutDashboard size={14} style={{ marginRight: 6 }} />Content Overview</span>
                  <button className="dash-panel__action" onClick={() => setTab('projects')}>Manage</button>
                </div>
                <div className="content-overview-grid">
                  <div className="content-overview-item">
                    <div className="content-overview-item__icon" style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}><Briefcase size={14} /></div>
                    <div className="content-overview-item__info"><div className="content-overview-item__count">{projects.length}</div><div className="content-overview-item__label">Projects</div></div>
                  </div>
                  <div className="content-overview-item">
                    <div className="content-overview-item__icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}><Zap size={14} /></div>
                    <div className="content-overview-item__info"><div className="content-overview-item__count">{skills.length}</div><div className="content-overview-item__label">Skills</div></div>
                  </div>
                  <div className="content-overview-item">
                    <div className="content-overview-item__icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}><History size={14} /></div>
                    <div className="content-overview-item__info"><div className="content-overview-item__count">{experiences.length}</div><div className="content-overview-item__label">Timeline</div></div>
                  </div>
                  <div className="content-overview-item">
                    <div className="content-overview-item__icon" style={{ background: 'rgba(236,72,153,0.1)', color: '#ec4899' }}><Star size={14} /></div>
                    <div className="content-overview-item__info"><div className="content-overview-item__count">{testimonials.length}</div><div className="content-overview-item__label">Testimonials</div></div>
                  </div>
                  <div className="content-overview-item">
                    <div className="content-overview-item__icon" style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7' }}><MessageSquare size={14} /></div>
                    <div className="content-overview-item__info"><div className="content-overview-item__count">{messages.length}</div><div className="content-overview-item__label">Messages</div></div>
                  </div>
                  <div className="content-overview-item">
                    <div className="content-overview-item__icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}><Bell size={14} /></div>
                    <div className="content-overview-item__info"><div className="content-overview-item__count">{notifUnread}</div><div className="content-overview-item__label">Unread Notifications</div></div>
                  </div>
                </div>
              </div>

              {/* Section Status */}
              <div className="dash-panel">
                <div className="dash-panel__header">
                  <span className="dash-panel__title"><Monitor size={14} style={{ marginRight: 6 }} />Section Status</span>
                  <button className="dash-panel__action" onClick={() => setTab('hero-editor')}>Edit</button>
                </div>
                <div className="section-status-list">
                  {['hero', 'about', 'navbar', 'footer'].map((key) => {
                    const sec = sectionForms[key];
                    const hasContent = sec && Object.values(sec).some(v => v && (typeof v === 'string' ? v.trim() : Array.isArray(v) ? v.length : true));
                    return (
                      <div key={key} className="section-status-item">
                        <span className="section-status-item__name" style={{ textTransform: 'capitalize' }}>{key}</span>
                        <span className={`section-status-item__badge section-status-item__badge--${hasContent ? 'published' : 'empty'}`}>
                          {hasContent ? 'Published' : 'Empty'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* System Info */}
              <div className="dash-panel">
                <div className="dash-panel__header">
                  <span className="dash-panel__title"><Settings size={14} style={{ marginRight: 6 }} />System Info</span>
                </div>
                <div className="system-info-list">
                  <div className="system-info-item"><span className="system-info-item__label">Environment</span><span className="system-info-item__value">{import.meta.env.MODE || 'production'}</span></div>
                  <div className="system-info-item"><span className="system-info-item__label">Last Sync</span><span className="system-info-item__value">{new Date().toLocaleString()}</span></div>
                  <div className="system-info-item"><span className="system-info-item__label">Admin</span><span className="system-info-item__value">{user?.name || '—'}</span></div>
                  <div className="system-info-item"><span className="system-info-item__label">Role</span><span className="system-info-item__value">{user?.role || 'Admin'}</span></div>
                  <div className="system-info-item"><span className="system-info-item__label">Auth</span><span className="system-info-item__value">{user?.totpEnabled ? '2FA + JWT' : 'JWT'}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ CONTENT TABS ═══ */}

        {/* ── PROJECTS ── */}
        {tab === 'projects' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>All Projects ({projects.length})</h3>
              <button id="add-project-btn" className="btn btn-primary" onClick={openAddProject} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Add Project</button>
            </div>
            {pLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table dash-table--projects">
                  <thead><tr><th>Title</th><th>Tech Stack</th><th>Featured</th><th>Actions</th></tr></thead>
                  <tbody>{projects.map((p) => (
                    <tr key={p._id}>
                      <td><strong>{p.title}</strong></td>
                      <td>{p.techStack.slice(0, 3).join(', ')}{p.techStack.length > 3 && '…'}</td>
                      <td>{p.featured ? '⭐' : '—'}</td>
                      <td><div className="dash-actions">
                        <button className="btn btn-ghost dash-btn" onClick={() => openEditProject(p)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Edit3 size={13} /> Edit</button>
                        <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteProject(p._id, p.title)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={13} /> Delete</button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SKILLS ── */}
        {tab === 'skills' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>All Skills ({skills.length})</h3>
              <button id="add-skill-btn" className="btn btn-primary" onClick={openAddSkill} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Add Skill</button>
            </div>
            {sLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table dash-table--skills">
                  <thead><tr><th>Name</th><th>Category</th><th>Proficiency</th><th>Actions</th></tr></thead>
                  <tbody>{skills.map((s) => (
                    <tr key={s._id}>
                      <td><strong>{s.name}</strong></td>
                      <td><span className="badge">{s.category}</span></td>
                      <td><div className="dash-skill-bar"><div className="dash-skill-fill" style={{ width: `${s.proficiency}%` }} /></div>{s.proficiency}%</td>
                      <td><div className="dash-actions">
                        <button className="btn btn-ghost dash-btn" onClick={() => openEditSkill(s)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Edit3 size={13} /> Edit</button>
                        <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteSkill(s._id, s.name)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={13} /> Delete</button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── EXPERIENCES ── */}
        {tab === 'experiences' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>All Timeline Items ({experiences.length})</h3>
              <button id="add-experience-btn" className="btn btn-primary" onClick={openAddExperience} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Add Experience</button>
            </div>
            {eLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table dash-table--experiences">
                  <thead><tr><th>Role</th><th>Company</th><th>Period</th><th>Type</th><th>Actions</th></tr></thead>
                  <tbody>{experiences.map((exp) => (
                    <tr key={exp._id}>
                      <td><strong>{exp.role}</strong><br /><small>{exp.location}</small></td>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {exp.iconUrl ? <img src={exp.iconUrl} alt="" style={{ width: '28px', height: '28px', objectFit: 'contain', background: '#fff', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
                          : <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{exp.company.charAt(0)}</div>}
                        {exp.company}
                      </div></td>
                      <td>{exp.period}</td>
                      <td><span className="badge">{exp.type}</span></td>
                      <td><div className="dash-actions">
                        <button className="btn btn-ghost dash-btn" onClick={() => openEditExperience(exp)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Edit3 size={13} /> Edit</button>
                        <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteExperience(exp._id, exp.role)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={13} /> Delete</button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── TESTIMONIALS ── */}
        {tab === 'testimonials' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>All Testimonials ({testimonials.length})</h3>
              <button id="add-testimonial-btn" className="btn btn-primary" onClick={openAddTestimonial} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Add Testimonial</button>
            </div>
            {tLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table dash-table--testimonials">
                  <thead><tr><th>Name</th><th>Role</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{testimonials.map((t) => (
                    <tr key={t._id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {t.photo ? <img src={t.photo} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-border)' }} />
                          : <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{t.name.charAt(0)}</div>}
                        <strong>{t.name}</strong>
                      </div></td>
                      <td>{t.role}</td>
                      <td><div style={{ display: 'flex', gap: '2px', color: 'var(--color-primary)' }}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={i < t.rating ? 'var(--color-primary)' : 'none'} />)}</div></td>
                      <td><span className={`badge ${t.published ? '' : 'dash-badge--new'}`}>{t.published ? 'Published' : 'Draft'}</span></td>
                      <td><div className="dash-actions">
                        <button className="btn btn-ghost dash-btn" onClick={() => openEditTestimonial(t)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Edit3 size={13} /> Edit</button>
                        <button className="btn btn-ghost dash-btn" onClick={() => handleTogglePublish(t)} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: t.published ? '#ef4444' : '#22c55e' }}>{t.published ? <XCircle size={13} /> : <Check size={13} />}{t.published ? 'Unpublish' : 'Publish'}</button>
                        <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteTestimonial(t._id, t.name)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={13} /> Delete</button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>Inbox ({messages.length})</h3></div>
            {mLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table dash-table--messages">
                  <thead><tr><th>From</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{messages.map((m) => (
                    <tr key={m._id} className={!m.isRead ? 'dash-row--unread' : ''}>
                      <td><strong>{m.name}</strong><br /><small>{m.email}</small></td>
                      <td>{m.subject}</td>
                      <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${m.isRead ? '' : 'dash-badge--new'}`}>{m.isRead ? 'Read' : 'New'}</span></td>
                      <td><div className="dash-actions">
                        <button className="btn btn-ghost dash-btn" onClick={() => openMessage(m)}>View</button>
                        <button className="btn btn-ghost dash-btn" onClick={() => handleReplyMessage(m)} style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}><Reply size={13} /> Reply</button>
                        <button className="btn dash-btn dash-btn--danger" onClick={() => requestDeleteMessage(m._id, m.subject)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={13} /> Delete</button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══ SECTION EDITORS ═══ */}

        {/* ── HERO EDITOR ── */}
        {tab === 'hero-editor' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>Hero Section</h3>
              <button className="btn btn-primary" onClick={() => handleSectionSave('hero')} disabled={sectionSaving === 'hero'} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> {sectionSaving === 'hero' ? 'Saving...' : 'Save Hero'}
              </button>
            </div>
            <div className="card" style={{ maxWidth: '640px', padding: 'var(--space-xl)' }}>
              {['greeting', 'name', 'role', 'bio'].map((field) => (
                <div className="form-group" key={field}>
                  <label className="form-label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  {field === 'bio' ? (
                    <textarea className="form-textarea" rows={3} value={sectionForms.hero?.[field] || ''} onChange={(e) => handleSectionChange('hero', field, e.target.value)} />
                  ) : (
                    <input type="text" className="form-input" value={sectionForms.hero?.[field] || ''} onChange={(e) => handleSectionChange('hero', field, e.target.value)} />
                  )}
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Roles (comma-separated)</label>
                <input type="text" className="form-input" placeholder="Web Developer, Designer, ..." value={Array.isArray(sectionForms.hero?.roles) ? sectionForms.hero.roles.join(', ') : sectionForms.hero?.roles || ''} onChange={(e) => handleSectionChange('hero', 'roles', e.target.value.split(',').map((r) => r.trim()))} />
              </div>
            </div>
          </div>
        )}

        {/* ── ABOUT EDITOR ── */}
        {tab === 'about-editor' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>About Section</h3>
              <button className="btn btn-primary" onClick={() => handleSectionSave('about')} disabled={sectionSaving === 'about'} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> {sectionSaving === 'about' ? 'Saving...' : 'Save About'}
              </button>
            </div>
            <div className="card" style={{ maxWidth: '640px', padding: 'var(--space-xl)' }}>
              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input type="text" className="form-input" value={sectionForms.about?.tagline || ''} onChange={(e) => handleSectionChange('about', 'tagline', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows={5} value={sectionForms.about?.description || ''} onChange={(e) => handleSectionChange('about', 'description', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ── NAVBAR EDITOR ── */}
        {tab === 'navbar-editor' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>Navbar Editor</h3>
              <button className="btn btn-primary" onClick={() => handleSectionSave('navbar')} disabled={sectionSaving === 'navbar'} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> {sectionSaving === 'navbar' ? 'Saving...' : 'Save Navbar'}
              </button>
            </div>
            <div className="card" style={{ maxWidth: '640px', padding: 'var(--space-xl)' }}>
              <div className="form-group">
                <label className="form-label">Logo Text</label>
                <input type="text" className="form-input" value={sectionForms.navbar?.logoText || ''} onChange={(e) => handleSectionChange('navbar', 'logoText', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Nav Links (JSON array of &#123;label, path&#125;)</label>
                <textarea className="form-textarea" rows={6} value={typeof sectionForms.navbar?.links === 'string' ? sectionForms.navbar.links : JSON.stringify(sectionForms.navbar?.links || [], null, 2)} onChange={(e) => handleSectionChange('navbar', 'links', e.target.value)} />
                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Edit as JSON or leave empty for defaults</small>
              </div>
            </div>
          </div>
        )}

        {/* ── FOOTER EDITOR ── */}
        {tab === 'footer-editor' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>Footer Editor</h3>
              <button className="btn btn-primary" onClick={() => handleSectionSave('footer')} disabled={sectionSaving === 'footer'} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> {sectionSaving === 'footer' ? 'Saving...' : 'Save Footer'}
              </button>
            </div>
            <div className="card" style={{ maxWidth: '640px', padding: 'var(--space-xl)' }}>
              <div className="form-group">
                <label className="form-label">Footer Text</label>
                <input type="text" className="form-input" value={sectionForms.footer?.text || ''} onChange={(e) => handleSectionChange('footer', 'text', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Copyright</label>
                <input type="text" className="form-input" value={sectionForms.footer?.copyright || ''} onChange={(e) => handleSectionChange('footer', 'copyright', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* ═══ ENGAGEMENT TABS ═══ */}

        {/* ── ANALYTICS ── */}
        {tab === 'analytics' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>Analytics</h3>
              <button className="btn btn-ghost dash-btn" onClick={() => dispatch(fetchAnalytics())} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><RefreshCw size={14} /> Refresh</button>
            </div>
            {aLoading ? <p>Loading…</p> : analytics ? (
              <>
                <div className="dash-stats">
                  <StatCard icon={<Users size={22} />} label="Visitors (30d)" value={analytics.visitors} color="rgba(99,120,255,0.15)" />
                  <StatCard icon={<Globe size={22} />} label="Page Views (30d)" value={analytics.pageViews} color="rgba(0,229,255,0.12)" />
                  <StatCard icon={<Activity size={22} />} label="Avg Visitors/Day" value={analytics.avgVisitorsPerDay} color="rgba(167,139,250,0.15)" />
                  <StatCard icon={<BarChart3 size={22} />} label="Pages/Visit" value={analytics.avgPageViewsPerVisitor} color="rgba(255,204,0,0.12)" />
                </div>
                <div className="card" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-lg)' }}>
                  <h4 style={{ marginBottom: 'var(--space-md)', fontWeight: 600 }}>Daily Visitors (14 days)</h4>
                  <MiniChart data={analytics.entries?.map((e) => e.visitors)} color="var(--color-primary)" height={80} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    <span>{analytics.entries?.[0]?.date}</span>
                    <span>{analytics.entries?.[analytics.entries.length - 1]?.date}</span>
                  </div>
                </div>
                {analytics.entries?.length > 0 && (
                  <div className="dash-table-wrap" style={{ marginTop: 'var(--space-lg)' }}>
                    <table className="dash-table">
                      <thead><tr><th>Date</th><th>Visitors</th><th>Page Views</th><th>Interactions</th></tr></thead>
                      <tbody>{analytics.entries.slice(-14).map((e) => (
                        <tr key={e.date}>
                          <td>{e.date}</td>
                          <td>{e.visitors}</td>
                          <td>{e.pageViews}</td>
                          <td>{e.interactions}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </>
            ) : (
              <p>No analytics data yet. Visit the public site to generate data.</p>
            )}
          </div>
        )}

        {/* ── METRICS ── */}
        {tab === 'metrics' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>Key Performance Indicators</h3></div>
            <div className="dash-stats">
              <StatCard icon={<Briefcase size={22} />} label="Published Projects" value={projects.filter((p) => p.featured).length} sub={`${projects.length} total`} color="rgba(99,120,255,0.15)" />
              <StatCard icon={<Star size={22} />} label="Published Testimonials" value={testimonials.filter((t) => t.published).length} sub={`${testimonials.length} total`} color="rgba(0,229,255,0.12)" />
              <StatCard icon={<Activity size={22} />} label="Engagement Rate" value={analytics?.visitors ? ((analytics.interactions / analytics.visitors) * 100).toFixed(1) + '%' : '0%'} sub={`${analytics?.interactions || 0} interactions`} color="rgba(167,139,250,0.15)" />
              <StatCard icon={<Clock size={22} />} label="Avg Daily Visitors" value={analytics?.avgVisitorsPerDay || 0} sub={`${analytics?.totalDays || 0} days tracked`} color="rgba(255,204,0,0.12)" />
            </div>
            {analytics?.pageViewsByPage && Object.keys(analytics.pageViewsByPage).length > 0 && (
              <div className="card" style={{ padding: 'var(--space-xl)', marginTop: 'var(--space-lg)' }}>
                <h4 style={{ marginBottom: 'var(--space-md)', fontWeight: 600 }}>Page Popularity</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(analytics.pageViewsByPage).sort((a, b) => b[1] - a[1]).map(([page, count]) => {
                    const maxCount = Math.max(...Object.values(analytics.pageViewsByPage));
                    return (
                      <div key={page} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--color-text)' }}>{page}</div>
                        <div style={{ flex: 2, height: '20px', background: 'var(--color-surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(count / maxCount) * 100}%`, background: 'var(--color-primary)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '40px', textAlign: 'right' }}>{count}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── NOTIFICATIONS CENTER ── */}
        {tab === 'notifications-center' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>Notifications ({notifUnread} unread)</h3>
              {notifUnread > 0 && <button className="btn btn-ghost dash-btn" onClick={handleMarkAllRead} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCheck size={14} /> Mark All Read</button>}
            </div>
            {nLoading ? <p>Loading…</p> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.length === 0 && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>No notifications yet.</p>}
                {notifications.map((n) => (
                  <div key={n._id} className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: 'var(--space-md)', opacity: n.isRead ? 0.6 : 1 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>{n.title}</div>
                      {n.body && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{n.body}</div>}
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: '4px' }}>{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {!n.isRead && <button className="btn btn-ghost dash-btn" onClick={() => handleMarkRead(n._id)} style={{ fontSize: '0.75rem' }}>Read</button>}
                      <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteNotif(n._id)} style={{ fontSize: '0.75rem' }}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SOCIAL LINKS ── */}
        {tab === 'social-links' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>Social Links</h3>
              <button id="add-social-link-btn" className="btn btn-primary" onClick={openAddSocialLink} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={16} /> Add Link</button>
            </div>
            {slLoading ? <p>Loading…</p> : (
              <div className="card" style={{ padding: 'var(--space-md)' }}>
                {socialLinks.length === 0 && <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '2rem' }}>No social links yet.</p>}
                {socialLinks.map((link, idx) => (
                  <div key={link._id} draggable onDragStart={() => handleDragStart(idx)} onDragOver={(e) => handleDragOver(e, idx)} onDragEnd={handleDragEnd}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--color-border)', cursor: 'grab', background: draggedIdx === idx ? 'var(--color-primary-glow)' : 'transparent', borderRadius: 'var(--radius-sm)', marginBottom: '4px' }}>
                    <GripVertical size={16} style={{ color: 'var(--color-text-muted)', cursor: 'grab', flexShrink: 0 }} />
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', flexShrink: 0 }}>{link.platform.charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{link.platform}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.url}</div>
                    </div>
                    <span className="badge" style={{ backgroundColor: link.active ? '#22c55e' : '#64748b', color: '#fff', fontSize: '0.7rem' }}>{link.active ? 'Active' : 'Inactive'}</span>
                    <div className="dash-actions">
                      <button className="btn btn-ghost dash-btn" onClick={() => openEditSocialLink(link)}><Edit3 size={13} /></button>
                      <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteSocialLink(link._id, link.platform)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ SYSTEM TABS ═══ */}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div className="dash-content animate-fadeInUp">
            <div className="profile-card card">
              <div className="profile-card__header">
                <div className="profile-card__avatar-large">{user?.name?.[0] ?? 'A'}</div>
                <div>
                  <h3 className="profile-card__name">{user?.name}</h3>
                  <p className="profile-card__email">{user?.email}</p>
                  <span className="badge profile-card__role">Role: {user?.role || 'Admin'}</span>
                </div>
              </div>
              <div className="profile-card__body">
                <h4 className="profile-card__section-title">Profile Image</h4>
                <div className="profile-image-section">
                  <div className="profile-image-preview">
                    {profileImageUrl ? <img src={profileImageUrl} alt="Profile" /> : <div className="profile-image-placeholder"><UserIcon size={32} /></div>}
                  </div>
                  <div className="profile-image-actions">
                    <input type="file" accept="image/*" onChange={handleProfileImageUpload} style={{ display: 'none' }} id="profile-image-file" disabled={profileUploading} />
                    <label htmlFor="profile-image-file" className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Upload size={14} />{profileUploading ? 'Uploading...' : profileImageUrl ? 'Change Photo' : 'Upload Photo'}</label>
                    {profileImageUrl && <button className="btn btn-ghost dash-btn--danger" onClick={handleRemoveProfileImage} style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Trash2 size={14} /> Remove</button>}
                  </div>
                </div>
                <h4 className="profile-card__section-title">Change Password</h4>
                <form onSubmit={handlePasswordChange} className="profile-form" id="password-change-form">
                  {[
                    { id: 'profile-current-pwd', label: 'Current Password', key: 'currentPassword', show: showCurrentPw, toggle: () => setShowCurrentPw((v) => !v) },
                    { id: 'profile-new-pwd', label: 'New Password', key: 'newPassword', show: showNewPw, toggle: () => setShowNewPw((v) => !v) },
                    { id: 'profile-confirm-pwd', label: 'Confirm New Password', key: 'confirmPassword', show: showConfirmPw, toggle: () => setShowConfirmPw((v) => !v) },
                  ].map(({ id, label, key, show, toggle }) => (
                    <div className="form-group" key={key}>
                      <label className="form-label" htmlFor={id}>{label}</label>
                      <div className="profile-form__pw-wrap">
                        <input id={id} type={show ? 'text' : 'password'} className="form-input" placeholder="••••••••" required value={pwdForm[key]} onChange={(e) => setPwdForm({ ...pwdForm, [key]: e.target.value })} />
                        <button type="button" className="profile-form__pw-toggle" onClick={toggle} aria-label={show ? 'Hide' : 'Show'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary profile-form__submit" disabled={pwdLoading}>{pwdLoading ? 'Saving...' : 'Update Password'}</button>
                </form>
                <h4 className="profile-card__section-title" style={{ marginTop: '2.5rem' }}>Two-Factor Authentication (2FA)</h4>
                <div className="profile-card__2fa" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem', background: 'var(--color-surface-2)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: '600' }}>Google Authenticator (TOTP)</span>
                        <span className="badge" style={{ backgroundColor: is2faEnabled ? '#22c55e' : '#64748b', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>{is2faEnabled ? 'Enabled' : 'Disabled'}</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Add an extra layer of security using any standard TOTP authenticator app.</p>
                    </div>
                    {is2faEnabled ? <button className="btn btn-ghost dash-btn--danger" style={{ color: '#ef4444' }} onClick={() => setShowDisable2fa(true)}>Disable 2FA</button>
                      : <button className="btn btn-primary" onClick={handleStart2faSetup} disabled={totpLoading}>{totpLoading ? 'Loading...' : 'Enable 2FA'}</button>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab === 'settings' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar"><h3>System Settings</h3></div>
            <div className="card" style={{ maxWidth: '640px', padding: 'var(--space-xl)' }}>
              <h4 className="profile-card__section-title">Site Information</h4>
              <div className="form-group">
                <label className="form-label">Site Title</label>
                <input type="text" className="form-input" placeholder="Teshome Bizuayehu Portfolio" value={sectionForms.settings?.siteTitle || ''} onChange={(e) => handleSectionChange('settings', 'siteTitle', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Site Description</label>
                <textarea className="form-textarea" rows={2} placeholder="Full Stack Developer Portfolio" value={sectionForms.settings?.siteDescription || ''} onChange={(e) => handleSectionChange('settings', 'siteDescription', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <input type="text" className="form-input" placeholder="UTC" value={sectionForms.settings?.timezone || ''} onChange={(e) => handleSectionChange('settings', 'timezone', e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={() => handleSectionSave('settings')} disabled={sectionSaving === 'settings'} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={16} /> {sectionSaving === 'settings' ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        </div>
        <FooterBar variant="dashboard" />
      </main>

      {/* ═══ MODALS ═══ */}

      {/* Add / Edit Project */}
      {(modal === 'addProject' || modal === 'editProject') && (
        <Modal title={modal === 'addProject' ? 'Add Project' : 'Edit Project'} onClose={() => setModal(null)}>
          <div className="modal-form">
            {[
              { label: 'Title', key: 'title', type: 'text', placeholder: 'My Awesome Project' },
              { label: 'Tech Stack (comma-separated)', key: 'techStack', type: 'text', placeholder: 'React, Node.js, MongoDB' },
              { label: 'GitHub URL', key: 'githubUrl', type: 'url', placeholder: 'https://github.com/...' },
              { label: 'Live URL', key: 'liveUrl', type: 'url', placeholder: 'https://...' },
            ].map(({ label, key, type, placeholder }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" placeholder={placeholder} value={pForm[key]} onChange={(e) => setPForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Project description…" value={pForm.description} onChange={(e) => setPForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Project Image</label>
              <div className="upload-container">
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="project-image-file" disabled={uploading} />
                <label htmlFor="project-image-file" className={`upload-box${uploading ? ' upload-box--uploading' : ''}`}>
                  <Upload className="upload-box__icon" size={24} />
                  <span className="upload-box__text">{uploading ? 'Uploading...' : 'Select Image File'}</span>
                  <span className="upload-box__hint">Max size 5MB (PNG, JPG, WEBP)</span>
                </label>
              </div>
              <label className="form-label" style={{ marginTop: '0.75rem' }}>Or paste image URL</label>
              <input type="url" className="form-input" placeholder="https://example.com/screenshot.png" value={pForm.imageUrl} onChange={(e) => setPForm((f) => ({ ...f, imageUrl: e.target.value }))} disabled={uploading} />
              {pForm.imageUrl && (<div className="modal-img-preview"><img src={pForm.imageUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} /><span className="modal-img-preview__label">Preview</span></div>)}
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="featured-check" checked={pForm.featured} onChange={(e) => setPForm((f) => ({ ...f, featured: e.target.checked }))} />
              <label htmlFor="featured-check" className="form-label" style={{ margin: 0 }}>Featured project</label>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveProject}>Save</button></div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Skill */}
      {(modal === 'addSkill' || modal === 'editSkill') && (
        <Modal title={modal === 'addSkill' ? 'Add Skill' : 'Edit Skill'} onClose={() => setModal(null)}>
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">Skill Name</label>
              <input type="text" className="form-input" placeholder="React" value={sForm.name} onChange={(e) => setSForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={sForm.category} onChange={(e) => setSForm((f) => ({ ...f, category: e.target.value }))}>
                {['Programming', 'Frontend', 'Backend', 'Database', 'Tools', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Proficiency: {sForm.proficiency}%</label>
              <input type="range" min="1" max="100" value={sForm.proficiency} onChange={(e) => setSForm((f) => ({ ...f, proficiency: Number(e.target.value) }))} style={{ width: '100%' }} />
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveSkill}>Save</button></div>
          </div>
        </Modal>
      )}

      {/* View Message */}
      {modal === 'viewMessage' && selected && (
        <Modal title="Message" onClose={() => setModal(null)}>
          <div className="modal-message">
            <div className="modal-message__meta">
              <p><strong>From:</strong> {selected.name} &lt;{selected.email}&gt;</p>
              <p><strong>Subject:</strong> {selected.subject}</p>
              <p><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
            </div>
            <div className="modal-message__body">{selected.message}</div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => handleReplyMessage(selected)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Reply size={14} /> Reply via Gmail</button>
              <button className="btn dash-btn--danger btn" onClick={() => requestDeleteMessage(selected._id, selected.subject)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={13} /> Delete</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Experience */}
      {(modal === 'addExperience' || modal === 'editExperience') && (
        <Modal title={modal === 'addExperience' ? 'Add Experience' : 'Edit Experience'} onClose={() => setModal(null)}>
          <div className="modal-form">
            {[
              { label: 'Role / Title', key: 'role', type: 'text', placeholder: 'Computer Science Student' },
              { label: 'Company / School', key: 'company', type: 'text', placeholder: 'Bahir Dar University' },
              { label: 'Period', key: 'period', type: 'text', placeholder: '2024 - Present' },
              { label: 'Location', key: 'location', type: 'text', placeholder: 'Bahir Dar, Ethiopia' },
            ].map(({ label, key, type, placeholder }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" placeholder={placeholder} value={eForm[key]} onChange={(e) => setEForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={eForm.type} onChange={(e) => setEForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="work">Work Experience</option>
                <option value="education">Education</option>
                <option value="learning">Self-Learning</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input type="number" className="form-input" placeholder="0" value={eForm.order} onChange={(e) => setEForm((f) => ({ ...f, order: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={5} placeholder="• Description..." value={eForm.description} onChange={(e) => setEForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Logo / Icon</label>
              <div className="upload-container">
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} id="experience-logo-file" disabled={uploading} />
                <label htmlFor="experience-logo-file" className={`upload-box${uploading ? ' upload-box--uploading' : ''}`}>
                  <Upload className="upload-box__icon" size={24} />
                  <span className="upload-box__text">{uploading ? 'Uploading...' : 'Select Logo File'}</span>
                  <span className="upload-box__hint">PNG, JPG, WEBP — max 5 MB</span>
                </label>
              </div>
              <input type="url" className="form-input" placeholder="https://example.com/logo.png" value={eForm.iconUrl} onChange={(e) => setEForm((f) => ({ ...f, iconUrl: e.target.value }))} disabled={uploading} style={{ marginTop: '0.75rem' }} />
              {eForm.iconUrl && (<div className="modal-img-preview" style={{ background: '#fff', padding: '8px' }}><img src={eForm.iconUrl} alt="Preview" style={{ objectFit: 'contain', maxHeight: '72px' }} onError={(e) => { e.target.style.display = 'none'; }} /><span className="modal-img-preview__label">Preview</span></div>)}
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveExperience}>{modal === 'addExperience' ? 'Add Experience' : 'Save Changes'}</button></div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Testimonial */}
      {(modal === 'addTestimonial' || modal === 'editTestimonial') && (
        <Modal title={modal === 'addTestimonial' ? 'Add Testimonial' : 'Edit Testimonial'} onClose={() => setModal(null)}>
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">Reviewer Name</label>
              <input type="text" className="form-input" placeholder="Jane Doe" value={tForm.name} onChange={(e) => setTForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Role / Title</label>
              <input type="text" className="form-input" placeholder="CEO at Example Corp" value={tForm.role} onChange={(e) => setTForm((f) => ({ ...f, role: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setTForm((f) => ({ ...f, rating: star }))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', color: star <= tForm.rating ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}>
                    <Star size={28} fill={star <= tForm.rating ? 'var(--color-primary)' : 'transparent'} />
                  </button>
                ))}
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginLeft: '8px' }}>{tForm.rating}/5</span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-textarea" rows={4} placeholder="Their testimonial message…" value={tForm.message} onChange={(e) => setTForm((f) => ({ ...f, message: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Photo</label>
              <div className="upload-container">
                <input type="file" accept="image/*" onChange={handleTestimonialPhotoUpload} style={{ display: 'none' }} id="testimonial-photo-file" disabled={uploading} />
                <label htmlFor="testimonial-photo-file" className={`upload-box${uploading ? ' upload-box--uploading' : ''}`}>
                  <Upload className="upload-box__icon" size={24} />
                  <span className="upload-box__text">{uploading ? 'Uploading...' : 'Select Photo File'}</span>
                  <span className="upload-box__hint">PNG, JPG, WEBP — max 5 MB</span>
                </label>
              </div>
              <input type="url" className="form-input" placeholder="https://example.com/photo.jpg" value={tForm.photo} onChange={(e) => setTForm((f) => ({ ...f, photo: e.target.value }))} disabled={uploading} style={{ marginTop: '0.75rem' }} />
              {tForm.photo && (<div className="modal-img-preview" style={{ borderRadius: '50%', width: '80px', height: '80px', overflow: 'hidden' }}><img src={tForm.photo} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} /><span className="modal-img-preview__label">Preview</span></div>)}
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="testimonial-published" checked={tForm.published} onChange={(e) => setTForm((f) => ({ ...f, published: e.target.checked }))} />
              <label htmlFor="testimonial-published" className="form-label" style={{ margin: 0 }}>Published</label>
            </div>
            <div className="form-group">
              <label className="form-label">Display Order</label>
              <input type="number" className="form-input" placeholder="0" value={tForm.order} onChange={(e) => setTForm((f) => ({ ...f, order: Number(e.target.value) }))} />
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveTestimonial}>{modal === 'addTestimonial' ? 'Add Testimonial' : 'Save Changes'}</button></div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Social Link */}
      {(modal === 'addSocialLink' || modal === 'editSocialLink') && (
        <Modal title={modal === 'addSocialLink' ? 'Add Social Link' : 'Edit Social Link'} onClose={() => setModal(null)}>
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">Platform</label>
              <input type="text" className="form-input" placeholder="GitHub, LinkedIn, Twitter..." value={slForm.platform} onChange={(e) => setSlForm((f) => ({ ...f, platform: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">URL</label>
              <input type="url" className="form-input" placeholder="https://github.com/username" value={slForm.url} onChange={(e) => setSlForm((f) => ({ ...f, url: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Label (optional)</label>
              <input type="text" className="form-input" placeholder="Follow me on GitHub" value={slForm.label} onChange={(e) => setSlForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="social-link-active" checked={slForm.active} onChange={(e) => setSlForm((f) => ({ ...f, active: e.target.checked }))} />
              <label htmlFor="social-link-active" className="form-label" style={{ margin: 0 }}>Active</label>
            </div>
            <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button className="btn btn-primary" onClick={handleSaveSocialLink}>{modal === 'addSocialLink' ? 'Add Link' : 'Save Changes'}</button></div>
          </div>
        </Modal>
      )}

      {/* Setup 2FA Modal */}
      {modal === 'setup2fa' && (
        <Modal title="Setup Two-Factor Authentication" onClose={() => setModal(null)}>
          <form onSubmit={handleVerify2faSetup} className="modal-form">
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Scan this QR code with Google Authenticator, Authy, or any compatible TOTP app.</p>
            {totpQrCode && <div style={{ display: 'flex', justifyContent: 'center', background: '#fff', padding: '1rem', borderRadius: '8px', margin: '0 auto 1.5rem', width: 'fit-content' }}><img src={totpQrCode} alt="TOTP QR Code" style={{ width: '180px', height: '180px' }} /></div>}
            {totpManualKey && (<div className="form-group" style={{ marginBottom: '1.5rem' }}><label className="form-label">Manual Setup Key</label><input type="text" readOnly className="form-input" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} value={totpManualKey} onClick={(e) => e.target.select()} /></div>)}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Enter 6-Digit Code</label>
              <input type="text" maxLength={6} placeholder="000000" className="form-input" style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4rem', fontWeight: 'bold' }} value={totpSetupCode} onChange={(e) => setTotpSetupCode(e.target.value.replace(/\D/g, ''))} required />
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={totpLoading}>{totpLoading ? 'Verifying...' : 'Verify & Enable'}</button></div>
          </form>
        </Modal>
      )}

      {/* Disable 2FA Modal */}
      {showDisable2fa && (
        <Modal title="Disable Two-Factor Authentication" onClose={() => { setShowDisable2fa(false); setDisablePassword(''); }}>
          <form onSubmit={handleDisable2fa} className="modal-form">
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>Are you sure? Enter your account password to confirm.</p>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Confirm Password</label>
              <input type="password" placeholder="••••••••" className="form-input" value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} required />
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-ghost" onClick={() => { setShowDisable2fa(false); setDisablePassword(''); }}>Cancel</button><button type="submit" className="btn btn-primary dash-btn--danger" style={{ backgroundColor: '#ef4444', color: '#fff' }} disabled={totpLoading}>{totpLoading ? 'Disabling...' : 'Confirm & Disable'}</button></div>
          </form>
        </Modal>
      )}

      <ConfirmDialog open={!!confirm} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} danger={confirm?.danger} onConfirm={runConfirm} onCancel={closeConfirm} />
    </div>
  );
}

export default Dashboard;
