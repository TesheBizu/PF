import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { logout } from '../../redux/slices/authSlice';
import { fetchProjects, createProject, updateProject, deleteProject } from '../../redux/slices/projectsSlice';
import { fetchSkills, createSkill, updateSkill, deleteSkill } from '../../redux/slices/skillsSlice';
import { fetchMessages, deleteMessage, markMessageRead, replyToMessage } from '../../redux/slices/messagesSlice';
import { fetchExperiences, createExperience, updateExperience, deleteExperience } from '../../redux/slices/experiencesSlice';
import api from '../../services/api';
import {
  LayoutDashboard,
  Briefcase,
  Zap,
  MessageSquare,
  User as UserIcon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Edit3,
  Trash2,
  MailOpen,
  Mail,
  Upload,
  Eye,
  EyeOff,
  Send,
  History,
} from 'lucide-react';
import './Admin.css';
import FooterBar from '../../components/Footer/FooterBar';

// ── Reusable modal ───────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Stat card ────────────────────────────────────────────────
function StatCard({ icon, label, value, color }) {
  return (
    <div className="dash-stat card">
      <div className="dash-stat__icon" style={{ background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
        {icon}
      </div>
      <div>
        <div className="dash-stat__value">{value}</div>
        <div className="dash-stat__label">{label}</div>
      </div>
    </div>
  );
}

// ── Initial form states ──────────────────────────────────────
const initProject = { title: '', description: '', techStack: '', githubUrl: '', liveUrl: '', imageUrl: '', featured: false };
const initSkill   = { name: '', category: 'Programming', proficiency: 80 };
const initExperience = { role: '', company: '', period: '', location: '', description: '', iconUrl: '', type: 'work', order: 0 };

function Dashboard() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector((s) => s.auth);
  const { items: projects, loading: pLoading } = useSelector((s) => s.projects);
  const { items: skills,   loading: sLoading } = useSelector((s) => s.skills);
  const { items: messages, loading: mLoading } = useSelector((s) => s.messages);
  const { items: experiences, loading: eLoading } = useSelector((s) => s.experiences);

  const [tab, setTab]           = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileNav, setIsMobileNav] = useState(false);
  const [modal, setModal]       = useState(null);
  const [selected, setSelected] = useState(null);
  const [pForm, setPForm]       = useState(initProject);
  const [sForm, setSForm]       = useState(initSkill);
  const [eForm, setEForm]       = useState(initExperience);
  const [uploading, setUploading] = useState(false);

  // Profile Form State
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying]   = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchSkills());
    dispatch(fetchMessages());
    dispatch(fetchExperiences());
  }, [dispatch]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 680px)');
    const update = () => setIsMobileNav(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const showSidebarLabels = sidebarOpen || isMobileNav;

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch (_) {}
    dispatch(logout());
    toast.info('Logged out successfully');
    navigate('/', { replace: true });
  };

  // ── Project handlers ────────────────────────────────────────
  const openAddProject = () => { setPForm(initProject); setModal('addProject'); };
  const openEditProject = (p) => {
    setPForm({ ...p, techStack: p.techStack.join(', ') });
    setSelected(p);
    setModal('editProject');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (data.success) {
        setPForm((f) => ({ ...f, imageUrl: data.url }));
        toast.success('Image uploaded to Cloudinary successfully!');
      } else {
        toast.error(data.message || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      const serverErr = err.response?.data?.error || err.response?.data?.message || 'Error uploading image';
      toast.error(typeof serverErr === 'object' ? JSON.stringify(serverErr) : String(serverErr));
    } finally {
      setUploading(false);
    }
  };
  const handleSaveProject = async () => {
    const payload = { ...pForm, techStack: pForm.techStack.split(',').map((t) => t.trim()).filter(Boolean) };
    if (modal === 'addProject') {
      await dispatch(createProject(payload));
      toast.success('Project created!');
    } else {
      await dispatch(updateProject({ id: selected._id, projectData: payload }));
      toast.success('Project updated!');
    }
    setModal(null);
  };
  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await dispatch(deleteProject(id));
    toast.success('Project deleted');
  };

  // ── Skill handlers ──────────────────────────────────────────
  const openAddSkill   = () => { setSForm(initSkill); setModal('addSkill'); };
  const openEditSkill  = (s) => { setSForm(s); setSelected(s); setModal('editSkill'); };
  const handleSaveSkill = async () => {
    if (modal === 'addSkill') {
      await dispatch(createSkill(sForm));
      toast.success('Skill added!');
    } else {
      await dispatch(updateSkill({ id: selected._id, skillData: sForm }));
      toast.success('Skill updated!');
    }
    setModal(null);
  };
  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Delete this skill?')) return;
    await dispatch(deleteSkill(id));
    toast.success('Skill deleted');
  };

  // ── Experience handlers ─────────────────────────────────────
  const openAddExperience = () => { setEForm(initExperience); setModal('addExperience'); };
  const openEditExperience = (exp) => { setEForm(exp); setSelected(exp); setModal('editExperience'); };
  
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setEForm((f) => ({ ...f, iconUrl: data.url }));
        toast.success('Logo uploaded to Cloudinary successfully!');
      } else {
        toast.error(data.message || 'Failed to upload logo');
      }
    } catch (err) {
      console.error(err);
      const serverErr = err.response?.data?.error || err.response?.data?.message || 'Error uploading logo';
      toast.error(typeof serverErr === 'object' ? JSON.stringify(serverErr) : String(serverErr));
    } finally {
      setUploading(false);
    }
  };

  const handleSaveExperience = async () => {
    if (modal === 'addExperience') {
      await dispatch(createExperience(eForm));
      toast.success('Experience added!');
    } else {
      await dispatch(updateExperience({ id: selected._id, expData: eForm }));
      toast.success('Experience updated!');
    }
    setModal(null);
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm('Delete this experience timeline entry?')) return;
    await dispatch(deleteExperience(id));
    toast.success('Experience entry deleted');
  };

  // ── Message handlers ────────────────────────────────────────
  const openMessage = (m) => {
    setSelected(m);
    setReplyText('');
    dispatch(markMessageRead(m._id));
    setModal('viewMessage');
  };
  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    await dispatch(deleteMessage(id));
    toast.success('Message deleted');
    setModal(null);
  };
  const handleReply = async () => {
    if (!replyText.trim()) { toast.error('Please write a reply first'); return; }
    setReplying(true);
    try {
      const result = await dispatch(replyToMessage({ id: selected._id, replyText })).unwrap();
      toast.success(`✅ Reply sent to ${result.email}`);
      setSelected(result);
      setReplyText('');
    } catch (err) {
      toast.error(`❌ ${err}`);
    } finally {
      setReplying(false);
    }
  };

  // ── Profile handler ─────────────────────────────────────────
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setPwdLoading(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword
      });
      toast.success(data.message || 'Password changed successfully!');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowCurrentPw(false);
      setShowNewPw(false);
      setShowConfirmPw(false);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to change password';
      toast.error(errMsg);
    } finally {
      setPwdLoading(false);
    }
  };

  const unread = messages.filter((m) => !m.isRead).length;

  // ── Tabs with Lucide Icons ───────────────────────────────────
  const TABS = [
    { id: 'overview',  label: 'Overview', icon: LayoutDashboard },
    { id: 'projects',  label: 'Projects', icon: Briefcase },
    { id: 'skills',    label: 'Skills', icon: Zap },
    { id: 'experiences', label: 'Experiences', icon: History },
    { id: 'messages',  label: 'Messages', icon: MessageSquare, badge: unread },
    { id: 'profile',   label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className={`dashboard${sidebarOpen ? '' : ' dashboard--collapsed'}`}>
      {/* Sidebar */}
      <aside className="dash-sidebar">
        {/* Collapse toggle */}
        <button
          className="dash-sidebar__toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        <div className="dash-sidebar__logo">
          <span className="navbar__logo-bracket">&lt;</span>
          {sidebarOpen && <span className="navbar__logo-name">Admin</span>}
          <span className="navbar__logo-bracket"> /&gt;</span>
        </div>

        <nav className="dash-sidebar__nav">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                className={`dash-sidebar__link${tab === t.id ? ' dash-sidebar__link--active' : ''}`}
                onClick={() => setTab(t.id)}
                title={!showSidebarLabels ? t.label : undefined}
              >
                <Icon className="dash-sidebar__link-icon" size={18} />
                {showSidebarLabels ? (
                  <span className="dash-sidebar__link-text">
                    {t.label}
                    {t.badge > 0 && <span className="dash-sidebar__badge">{t.badge}</span>}
                  </span>
                ) : (
                  t.badge > 0 && <span className="dash-sidebar__badge dash-sidebar__badge--icon">{t.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="dash-sidebar__bottom">
          <div className="dash-sidebar__user">
            <div className="dash-sidebar__avatar">{user?.name?.[0] ?? 'A'}</div>
            {showSidebarLabels && (
              <div>
                <div className="dash-sidebar__name">{user?.name}</div>
                <div className="dash-sidebar__role">Administrator</div>
              </div>
            )}
          </div>
          <button className="btn btn-ghost dash-sidebar__logout" onClick={handleLogout} id="admin-logout" title="Logout">
            <LogOut size={16} />
            {showSidebarLabels && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-topbar">
          <h2 className="dash-topbar__title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(() => {
              const currentTab = TABS.find((t) => t.id === tab);
              if (!currentTab) return null;
              const TabIcon = currentTab.icon;
              return (
                <>
                  <TabIcon size={20} style={{ color: 'var(--color-primary)' }} />
                  {currentTab.label}
                </>
              );
            })()}
          </h2>
        </div>

        <div className="dash-body">
        {/* ── OVERVIEW ── */}
        {tab === 'overview' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-stats">
              <StatCard icon={<Briefcase size={22} />} label="Total Projects"  value={projects.length}  color="rgba(99,120,255,0.15)" />
              <StatCard icon={<Zap size={22} />} label="Total Skills"    value={skills.length}    color="rgba(0,229,255,0.12)" />
              <StatCard icon={<History size={22} />} label="Timeline Items"  value={experiences.length} color="rgba(167,139,250,0.15)" />
              <StatCard icon={unread > 0 ? <Mail size={22} /> : <MailOpen size={22} />} label="Unread Messages" value={unread}           color="rgba(255,204,0,0.12)" />
            </div>
            <div className="dash-welcome card">
              <h3>Welcome back, {user?.name} </h3>
              <p>All changes are saved to MongoDB in real time.</p>
            </div>
          </div>
        )}

        {/* ── PROJECTS ── */}
        {tab === 'projects' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar">
              <h3>All Projects ({projects.length})</h3>
              <button id="add-project-btn" className="btn btn-primary" onClick={openAddProject} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Add Project
              </button>
            </div>
            {pLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>Title</th><th>Tech Stack</th><th>Featured</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p._id}>
                        <td><strong>{p.title}</strong></td>
                        <td>{p.techStack.slice(0, 3).join(', ')}{p.techStack.length > 3 && '…'}</td>
                        <td>{p.featured ? '⭐' : '—'}</td>
                        <td>
                          <div className="dash-actions">
                            <button className="btn btn-ghost dash-btn" onClick={() => openEditProject(p)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Edit3 size={13} /> Edit
                            </button>
                            <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteProject(p._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── SKILLS ── */}
        {tab === 'skills' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar">
              <h3>All Skills ({skills.length})</h3>
              <button id="add-skill-btn" className="btn btn-primary" onClick={openAddSkill} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Add Skill
              </button>
            </div>
            {sLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>Name</th><th>Category</th><th>Proficiency</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {skills.map((s) => (
                      <tr key={s._id}>
                        <td><strong>{s.name}</strong></td>
                        <td><span className="badge">{s.category}</span></td>
                        <td>
                          <div className="dash-skill-bar">
                            <div className="dash-skill-fill" style={{ width: `${s.proficiency}%` }} />
                          </div>
                          {s.proficiency}%
                        </td>
                        <td>
                          <div className="dash-actions">
                            <button className="btn btn-ghost dash-btn" onClick={() => openEditSkill(s)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Edit3 size={13} /> Edit
                            </button>
                            <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteSkill(s._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── EXPERIENCES ── */}
        {tab === 'experiences' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar">
              <h3>All Timeline Items ({experiences.length})</h3>
              <button id="add-experience-btn" className="btn btn-primary" onClick={openAddExperience} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} /> Add Experience
              </button>
            </div>
            {eLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>Role</th><th>Company / School</th><th>Period</th><th>Type</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {experiences.map((exp) => (
                      <tr key={exp._id}>
                        <td><strong>{exp.role}</strong><br/><small>{exp.location}</small></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {exp.iconUrl ? (
                              <img src={exp.iconUrl} alt={exp.company} style={{ width: '28px', height: '28px', objectFit: 'contain', background: '#fff', borderRadius: '4px', border: '1px solid var(--color-border)' }} />
                            ) : (
                              <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'var(--color-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>{exp.company.charAt(0).toUpperCase()}</div>
                            )}
                            {exp.company}
                          </div>
                        </td>
                        <td>{exp.period}</td>
                        <td><span className="badge">{exp.type}</span></td>
                        <td>
                          <div className="dash-actions">
                            <button className="btn btn-ghost dash-btn" onClick={() => openEditExperience(exp)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Edit3 size={13} /> Edit
                            </button>
                            <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteExperience(exp._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── MESSAGES ── */}
        {tab === 'messages' && (
          <div className="dash-content animate-fadeInUp">
            <div className="dash-toolbar">
              <h3>Inbox ({messages.length})</h3>
            </div>
            {mLoading ? <p>Loading…</p> : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr><th>From</th><th>Subject</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {messages.map((m) => (
                      <tr key={m._id} className={!m.isRead ? 'dash-row--unread' : ''}>
                        <td><strong>{m.name}</strong><br /><small>{m.email}</small></td>
                        <td>{m.subject}</td>
                        <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${m.isRead ? '' : 'dash-badge--new'}`}>
                            {m.isRead ? 'Read' : 'New'}
                          </span>
                        </td>
                        <td>
                          <div className="dash-actions">
                            <button className="btn btn-ghost dash-btn" onClick={() => openMessage(m)}>View</button>
                            <button className="btn dash-btn dash-btn--danger" onClick={() => handleDeleteMessage(m._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div className="dash-content animate-fadeInUp">
            <div className="profile-card card">
              <div className="profile-card__header">
                <div className="profile-card__avatar-large">
                  {user?.name?.[0] ?? 'A'}
                </div>
                <div>
                  <h3 className="profile-card__name">{user?.name}</h3>
                  <p className="profile-card__email">{user?.email}</p>
                  <span className="badge profile-card__role">Role: {user?.role || 'Admin'}</span>
                </div>
              </div>

              <div className="profile-card__body">
                <h4 className="profile-card__section-title">Change Password</h4>
                <form onSubmit={handlePasswordChange} className="profile-form" id="password-change-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-current-pwd">Current Password</label>
                    <div className="profile-form__pw-wrap">
                      <input
                        id="profile-current-pwd"
                        type={showCurrentPw ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        required
                        value={pwdForm.currentPassword}
                        onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        className="profile-form__pw-toggle"
                        onClick={() => setShowCurrentPw((v) => !v)}
                        aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-new-pwd">New Password (min 6 characters)</label>
                    <div className="profile-form__pw-wrap">
                      <input
                        id="profile-new-pwd"
                        type={showNewPw ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        required
                        value={pwdForm.newPassword}
                        onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        className="profile-form__pw-toggle"
                        onClick={() => setShowNewPw((v) => !v)}
                        aria-label={showNewPw ? 'Hide password' : 'Show password'}
                      >
                        {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="profile-confirm-pwd">Confirm New Password</label>
                    <div className="profile-form__pw-wrap">
                      <input
                        id="profile-confirm-pwd"
                        type={showConfirmPw ? 'text' : 'password'}
                        className="form-input"
                        placeholder="••••••••"
                        required
                        value={pwdForm.confirmPassword}
                        onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                      />
                      <button
                        type="button"
                        className="profile-form__pw-toggle"
                        onClick={() => setShowConfirmPw((v) => !v)}
                        aria-label={showConfirmPw ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary profile-form__submit" disabled={pwdLoading}>
                    {pwdLoading ? 'Saving...' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
        </div>

        <FooterBar variant="dashboard" />
      </main>

      {/* ── MODALS ── */}

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
                <input type={type} className="form-input" placeholder={placeholder}
                  value={pForm[key]} onChange={(e) => setPForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Project description…"
                value={pForm.description} onChange={(e) => setPForm((f) => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Image upload selector & URL input with live preview */}
            <div className="form-group">
              <label className="form-label">Project Image</label>
              <div className="upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="project-image-file"
                  disabled={uploading}
                />
                <label
                  htmlFor="project-image-file"
                  className={`upload-box${uploading ? ' upload-box--uploading' : ''}`}
                >
                  <Upload className="upload-box__icon" size={24} />
                  <span className="upload-box__text">
                    {uploading ? 'Uploading to Cloudinary...' : 'Select Image File'}
                  </span>
                  <span className="upload-box__hint">Max size 5MB (PNG, JPG, WEBP)</span>
                </label>
              </div>

              <label className="form-label" style={{ marginTop: '0.75rem' }}>Or paste image URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/screenshot.png"
                value={pForm.imageUrl}
                onChange={(e) => setPForm((f) => ({ ...f, imageUrl: e.target.value }))}
                disabled={uploading}
              />

              {pForm.imageUrl && (
                <div className="modal-img-preview">
                  <img src={pForm.imageUrl} alt="Preview" onError={(e) => { e.target.style.display = 'none'; }} />
                  <span className="modal-img-preview__label">Preview</span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="featured-check" checked={pForm.featured}
                onChange={(e) => setPForm((f) => ({ ...f, featured: e.target.checked }))} />
              <label htmlFor="featured-check" className="form-label" style={{ margin: 0 }}>Featured project</label>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveProject}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Skill */}
      {(modal === 'addSkill' || modal === 'editSkill') && (
        <Modal title={modal === 'addSkill' ? 'Add Skill' : 'Edit Skill'} onClose={() => setModal(null)}>
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">Skill Name</label>
              <input type="text" className="form-input" placeholder="React"
                value={sForm.name} onChange={(e) => setSForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-input" value={sForm.category}
                onChange={(e) => setSForm((f) => ({ ...f, category: e.target.value }))}>
                {['Programming', 'Frontend', 'Backend', 'Database', 'Tools', 'Other'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Proficiency: {sForm.proficiency}%</label>
              <input type="range" min="1" max="100" value={sForm.proficiency}
                onChange={(e) => setSForm((f) => ({ ...f, proficiency: Number(e.target.value) }))}
                style={{ width: '100%' }} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveSkill}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Message */}
      {modal === 'viewMessage' && selected && (
        <Modal title="Message" onClose={() => setModal(null)}>
          <div className="modal-message">
            {/* Message meta */}
            <div className="modal-message__meta">
              <p><strong>From:</strong> {selected.name} &lt;{selected.email}&gt;</p>
              <p><strong>Subject:</strong> {selected.subject}</p>
              <p><strong>Date:</strong> {new Date(selected.createdAt).toLocaleString()}</p>
              {selected.isReplied && (
                <span className="badge modal-message__replied-badge">✓ Replied</span>
              )}
            </div>

            {/* Original message body */}
            <div className="modal-message__body">{selected.message}</div>

            {/* Previous reply display */}
            {selected.isReplied && selected.replyText && (
              <div className="modal-message__prev-reply">
                <p className="modal-message__prev-reply-label">📨 Your previous reply</p>
                <div className="modal-message__prev-reply-body">{selected.replyText}</div>
                <p className="modal-message__prev-reply-date">
                  Sent on {new Date(selected.repliedAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* Reply compose box */}
            <div className="modal-message__reply-box">
              <label className="form-label">
                {selected.isReplied ? 'Send another reply' : 'Write a reply'}
              </label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder={`Hi ${selected.name},\n\nThank you for reaching out...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={replying}
              />
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
              <button
                className="btn btn-primary"
                onClick={handleReply}
                disabled={replying || !replyText.trim()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Send size={15} />
                {replying ? 'Sending...' : 'Send Reply'}
              </button>
              <button className="btn dash-btn--danger btn" onClick={() => handleDeleteMessage(selected._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Trash2 size={13} /> Delete
              </button>
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
                <input type={type} className="form-input" placeholder={placeholder}
                  value={eForm[key]} onChange={(e) => setEForm((f) => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={eForm.type}
                onChange={(e) => setEForm((f) => ({ ...f, type: e.target.value }))}>
                <option value="work">Work Experience</option>
                <option value="education">Education</option>
                <option value="learning">Self-Learning</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Display Order (lower = first)</label>
              <input type="number" className="form-input" placeholder="0"
                value={eForm.order} onChange={(e) => setEForm((f) => ({ ...f, order: Number(e.target.value) }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Description (use newlines or • for bullet points)</label>
              <textarea className="form-textarea" rows={5}
                placeholder={`• Relevant coursework: Web Dev, Mobile Dev...\n• Built team projects and prototypes`}
                value={eForm.description} onChange={(e) => setEForm((f) => ({ ...f, description: e.target.value }))} />
            </div>

            {/* Logo upload */}
            <div className="form-group">
              <label className="form-label">Logo / Icon</label>
              <div className="upload-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                  id="experience-logo-file"
                  disabled={uploading}
                />
                <label
                  htmlFor="experience-logo-file"
                  className={`upload-box${uploading ? ' upload-box--uploading' : ''}`}
                >
                  <Upload className="upload-box__icon" size={24} />
                  <span className="upload-box__text">
                    {uploading ? 'Uploading to Cloudinary...' : 'Select Logo File'}
                  </span>
                  <span className="upload-box__hint">PNG, JPG, WEBP — max 5 MB</span>
                </label>
              </div>
              <label className="form-label" style={{ marginTop: '0.75rem' }}>Or paste logo URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/logo.png"
                value={eForm.iconUrl}
                onChange={(e) => setEForm((f) => ({ ...f, iconUrl: e.target.value }))}
                disabled={uploading}
              />
              {eForm.iconUrl && (
                <div className="modal-img-preview" style={{ background: '#fff', padding: '8px' }}>
                  <img src={eForm.iconUrl} alt="Logo preview" style={{ objectFit: 'contain', maxHeight: '72px' }}
                    onError={(e) => { e.target.style.display = 'none'; }} />
                  <span className="modal-img-preview__label">Preview</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveExperience}>
                {modal === 'addExperience' ? 'Add Experience' : 'Save Changes'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>

  );
}
 
export default Dashboard;
